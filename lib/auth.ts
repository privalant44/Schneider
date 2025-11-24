import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { AdminUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Convertir la clé secrète en format TextEncoder pour jose
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hash un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Crée un token JWT pour une session
 */
export async function createToken(user: { id: string; email: string; role: string }): Promise<string> {
  const secretKey = getSecretKey();
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
  
  return token;
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    
    const decoded: AuthSession = {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
    
    console.log('✅ Token vérifié avec succès pour:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du token:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Récupère la session actuelle depuis les cookies (pour API routes avec NextRequest)
 */
export async function getSessionFromRequest(request: { cookies: { get: (name: string) => { value: string } | undefined } }): Promise<AuthSession | null> {
  const authCookie = request.cookies.get('auth-token');
  if (!authCookie || !authCookie.value) {
    console.log('❌ Cookie auth-token non trouvé dans la requête');
    return null;
  }
  
  console.log('🔍 Cookie trouvé, vérification du token...');
  return await verifyToken(authCookie.value);
}

/**
 * Vérifie si l'utilisateur est authentifié (pour API routes avec NextRequest)
 */
export async function requireAuthFromRequest(request: { cookies: { get: (name: string) => { value: string } | undefined } }): Promise<AuthSession> {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    throw new Error('Non authentifié');
  }
  
  return session;
}

/**
 * Vérifie si l'utilisateur est super-admin (pour API routes avec NextRequest)
 */
export async function requireSuperAdminFromRequest(request: { cookies: { get: (name: string) => { value: string } | undefined } }): Promise<AuthSession> {
  const session = await requireAuthFromRequest(request);
  
  if (session.role !== 'super-admin') {
    throw new Error('Accès refusé : droits insuffisants');
  }
  
  return session;
}

