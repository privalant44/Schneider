import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

/**
 * Routes publiques qui ne nécessitent pas d'authentification
 */
const PUBLIC_ROUTES = ['/questionnaire', '/resultats'];

/**
 * Routes d'authentification (login, forgot password, etc.)
 */
const AUTH_ROUTES = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Vérifie si une route est une route d'authentification
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Vérifie si une route nécessite une authentification
 */
function isProtectedRoute(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/admin');
}

/**
 * Redirige vers la page de login avec un paramètre de redirection
 */
function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Middleware principal pour gérer l'authentification
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les routes API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Autoriser l'accès aux routes publiques
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Routes protégées nécessitant une authentification
  if (isProtectedRoute(pathname) && !isAuthRoute(pathname)) {
    const token = request.cookies.get('auth-token')?.value;

    // Pas de token : rediriger vers login
    if (!token) {
      return redirectToLogin(request, pathname);
    }

    // Vérifier la validité du token
    try {
      const session = await verifyToken(token);
      if (!session) {
        // Token invalide : supprimer le cookie et rediriger
        const response = redirectToLogin(request, pathname);
        response.cookies.delete('auth-token');
        return response;
      }
      // Token valide : autoriser l'accès
      return NextResponse.next();
    } catch (error) {
      // Erreur lors de la vérification : supprimer le cookie et rediriger
      const response = redirectToLogin(request, pathname);
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // Si l'utilisateur est déjà connecté et accède aux pages d'authentification,
  // le rediriger vers la page d'accueil
  if (isAuthRoute(pathname)) {
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const session = await verifyToken(token);
        if (session) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        // Ignorer l'erreur et laisser l'utilisateur sur la page d'authentification
      }
    }
  }

  // Par défaut, autoriser l'accès
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/questionnaire/:path*',
    '/resultats/:path*',
  ],
};
