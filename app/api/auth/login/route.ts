import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateLastLogin } from '@/lib/users';
import { verifyPassword, createToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Tentative de connexion pour:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour:', email);
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    console.log('✅ Utilisateur trouvé:', user.email);

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, user.passwordHash);
    console.log('Vérification du mot de passe:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer le token
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Mettre à jour la dernière connexion
    await updateLastLogin(user.id);

    console.log('✅ Connexion réussie, création du token...');
    console.log('Token créé:', token.substring(0, 20) + '...');

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    // Définir le cookie avec les bonnes options
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
      domain: undefined, // Laisser Next.js gérer le domaine
    });

    console.log('✅ Cookie défini avec succès');
    console.log('Cookie options:', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la connexion',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

