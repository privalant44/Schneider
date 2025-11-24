import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Détecter si on est sur Vercel
const isVercel = process.env.VERCEL === '1';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type de fichier non autorisé. Formats acceptés: JPEG, PNG, GIF, WebP, SVG' 
      });
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'Fichier trop volumineux. Taille maximale: 5MB' 
      });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;

    let fileUrl: string;

    if (isVercel) {
      // Sur Vercel, utiliser Vercel Blob Storage si disponible
      // Sinon, retourner une erreur explicite
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ 
          success: false, 
          error: 'Configuration manquante pour Vercel. Veuillez configurer BLOB_READ_WRITE_TOKEN ou utiliser un service de stockage externe (Cloudinary, AWS S3, etc.)',
          hint: 'Vercel ne permet pas d\'écrire dans le système de fichiers. Utilisez Vercel Blob Storage ou un service externe.'
        }, { status: 500 });
      }

      // Utiliser Vercel Blob Storage
      try {
        // Import dynamique pour éviter les erreurs si le package n'est pas installé
        // @ts-ignore - Le package peut ne pas être installé en développement
        const blobModule = await import('@vercel/blob').catch(() => null);
        if (!blobModule) {
          return NextResponse.json({ 
            success: false, 
            error: 'Package @vercel/blob non installé. Exécutez: npm install @vercel/blob'
          }, { status: 500 });
        }
        
        const { put } = blobModule;
        // Vercel Blob accepte directement le File ou ArrayBuffer
        const blob = await put(fileName, file, {
          access: 'public',
          contentType: file.type,
        });
        fileUrl = blob.url;
      } catch (blobError) {
        console.error('Erreur Vercel Blob:', blobError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de l\'upload vers Vercel Blob Storage',
          details: process.env.NODE_ENV === 'development' ? String(blobError) : undefined
        }, { status: 500 });
      }
    } else {
      // En développement ou sur un serveur classique, utiliser le système de fichiers
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const path = join(uploadsDir, fileName);
      await writeFile(path, buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ 
      success: false, 
      error: `Erreur lors de l'upload du fichier: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}
