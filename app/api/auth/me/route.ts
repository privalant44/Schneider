import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getUserById } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth-token');
    
    if (!authCookie || !authCookie.value) {
      // Ne pas logger en production pour éviter le spam
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Pas de cookie auth-token trouvé');
      }
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Token invalide ou expiré');
      }
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Session valide pour:', session.email);
    }

    const user = await getUserById(session.userId);
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour ID:', session.userId);
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

