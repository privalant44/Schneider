import { NextRequest, NextResponse } from 'next/server';
import { initializeSuperAdmin } from '@/lib/users';

export const dynamic = 'force-dynamic';

/**
 * Route temporaire pour initialiser le super-administrateur sur Vercel KV
 * 
 * ⚠️ IMPORTANT : Supprimez cette route après avoir initialisé le super-admin !
 * 
 * Usage :
 * 1. Déployez cette route sur Vercel
 * 2. Appelez GET /api/admin/init depuis votre navigateur
 * 3. Vérifiez que le super-admin est créé
 * 4. Supprimez cette route pour des raisons de sécurité
 * 
 * URL: https://votre-projet.vercel.app/api/admin/init
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que nous sommes sur Vercel avec KV configuré
    // Supporte REDIS_URL (format standard) ou KV_REST_API_URL + KV_REST_API_TOKEN (format REST API)
    const hasRedisUrl = !!process.env.REDIS_URL;
    const hasKvConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    
    if (!hasRedisUrl && !hasKvConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vercel KV non configuré. Créez une base de données Redis dans Vercel Dashboard → Storage.',
        hint: 'Consultez VERCEL_KV_SETUP.md pour les instructions',
        details: {
          REDIS_URL: hasRedisUrl ? '✅ Présent' : '❌ Manquant',
          KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ Présent' : '❌ Manquant',
          KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ Présent' : '❌ Manquant'
        }
      }, { status: 500 });
    }

    // Initialiser le super-admin
    const result = await initializeSuperAdmin();
    
    return NextResponse.json({ 
      success: true, 
      message: result.created 
        ? 'Super-administrateur créé avec succès' 
        : 'Super-administrateur existe déjà',
      email: 'philippe.rivalant@animaneo.fr',
      password: 'AnimaNe@44',
      warning: '⚠️ Supprimez cette route après utilisation pour des raisons de sécurité !'
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du super-admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      details: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' 
        ? String(error) 
        : undefined
    }, { status: 500 });
  }
}

