import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { AdminUser, PasswordResetToken } from './types';
import { hashPassword } from './auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESET_TOKENS_FILE = path.join(DATA_DIR, 'password-reset-tokens.json');

// Clés pour Vercel KV
const USERS_KEY = 'admin_users';
const RESET_TOKENS_KEY = 'password_reset_tokens';

// Vérifier si on est sur Vercel
function isVercel(): boolean {
  return !!process.env.VERCEL;
}

// Vérifier si Vercel KV est disponible
function isKvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// S'assurer que le dossier data existe (pour fallback local)
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ========== GESTION DES UTILISATEURS ==========

/**
 * Lit les utilisateurs depuis KV ou fichiers JSON (fallback)
 */
export async function readUsers(): Promise<AdminUser[]> {
  if (isKvAvailable()) {
    try {
      const users = await kv.get<AdminUser[]>(USERS_KEY);
      console.log(`[readUsers] Lecture depuis KV: ${users ? users.length : 0} utilisateur(s)`);
      return users || [];
    } catch (error) {
      console.error('❌ Erreur lors de la lecture des utilisateurs depuis KV:', error);
      // En pré-production, on veut voir l'erreur pour diagnostiquer
      if (process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development') {
        console.error('Détails de l\'erreur KV:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          KV_REST_API_URL: process.env.KV_REST_API_URL ? 'présent' : 'manquant',
          KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'présent' : 'manquant'
        });
      }
      // Retourner un tableau vide pour éviter de casser l'application
      // mais l'erreur sera visible dans les logs
      return [];
    }
  }

  // Fallback vers fichiers JSON pour développement local
  // Sur Vercel sans KV, on ne peut pas utiliser les fichiers
  if (isVercel() && !isKvAvailable()) {
    console.error('⚠️ ERREUR: Vercel KV non configuré sur Vercel. Veuillez créer une base de données Redis.');
    throw new Error('Vercel KV non configuré. Créez une base de données Redis dans Vercel Dashboard → Storage.');
  }

  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des utilisateurs:', error);
  }
  return [];
}

/**
 * Écrit les utilisateurs dans KV ou fichiers JSON (fallback)
 */
async function writeUsers(users: AdminUser[]): Promise<void> {
  if (isKvAvailable()) {
    try {
      await kv.set(USERS_KEY, users);
      return;
    } catch (error) {
      console.error('Erreur lors de l\'écriture des utilisateurs dans KV:', error);
      throw error;
    }
  }

  // Fallback vers fichiers JSON pour développement local
  // Sur Vercel sans KV, on ne peut pas utiliser les fichiers
  if (isVercel() && !isKvAvailable()) {
    console.error('⚠️ ERREUR: Vercel KV non configuré sur Vercel. Veuillez créer une base de données Redis.');
    throw new Error('Vercel KV non configuré. Créez une base de données Redis dans Vercel Dashboard → Storage.');
  }

  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture des utilisateurs:', error);
    throw error;
  }
}

// ========== GESTION DES TOKENS DE RÉINITIALISATION ==========

/**
 * Lit les tokens depuis KV ou fichiers JSON (fallback)
 */
async function readResetTokens(): Promise<PasswordResetToken[]> {
  if (isKvAvailable()) {
    try {
      const tokens = await kv.get<PasswordResetToken[]>(RESET_TOKENS_KEY);
      return tokens || [];
    } catch (error) {
      console.error('Erreur lors de la lecture des tokens depuis KV:', error);
      return [];
    }
  }

  // Fallback vers fichiers JSON pour développement local
  // Sur Vercel sans KV, on ne peut pas utiliser les fichiers
  if (isVercel() && !isKvAvailable()) {
    console.error('⚠️ ERREUR: Vercel KV non configuré sur Vercel. Veuillez créer une base de données Upstash Redis.');
    return [];
  }

  ensureDataDir();
  try {
    if (fs.existsSync(RESET_TOKENS_FILE)) {
      const data = fs.readFileSync(RESET_TOKENS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des tokens:', error);
  }
  return [];
}

/**
 * Écrit les tokens dans KV ou fichiers JSON (fallback)
 */
async function writeResetTokens(tokens: PasswordResetToken[]): Promise<void> {
  if (isKvAvailable()) {
    try {
      await kv.set(RESET_TOKENS_KEY, tokens);
      return;
    } catch (error) {
      console.error('Erreur lors de l\'écriture des tokens dans KV:', error);
      throw error;
    }
  }

  // Fallback vers fichiers JSON pour développement local
  // Sur Vercel sans KV, on ne peut pas utiliser les fichiers
  if (isVercel() && !isKvAvailable()) {
    console.error('⚠️ ERREUR: Vercel KV non configuré sur Vercel. Veuillez créer une base de données Redis.');
    throw new Error('Vercel KV non configuré. Créez une base de données Redis dans Vercel Dashboard → Storage.');
  }

  ensureDataDir();
  try {
    fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture des tokens:', error);
    throw error;
  }
}

// ========== FONCTIONS PUBLIQUES ==========

/**
 * Trouve un utilisateur par email
 */
export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const users = await readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Trouve un utilisateur par ID
 */
export async function getUserById(id: string): Promise<AdminUser | null> {
  const users = await readUsers();
  return users.find(u => u.id === id) || null;
}

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(email: string, password: string, role: 'super-admin' | 'admin' = 'admin'): Promise<AdminUser> {
  const users = await readUsers();
  
  // Vérifier si l'utilisateur existe déjà
  if (await getUserByEmail(email)) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }
  
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  
  const newUser: AdminUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    passwordHash,
    role,
    created_at: now,
    updated_at: now,
  };
  
  users.push(newUser);
  await writeUsers(users);
  
  return newUser;
}

/**
 * Met à jour le mot de passe d'un utilisateur
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const users = await readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }
  
  const passwordHash = await hashPassword(newPassword);
  users[userIndex].passwordHash = passwordHash;
  users[userIndex].updated_at = new Date().toISOString();
  
  await writeUsers(users);
}

/**
 * Met à jour la date de dernière connexion
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const users = await readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].last_login = new Date().toISOString();
    await writeUsers(users);
  }
}

/**
 * Crée un token de réinitialisation de mot de passe
 */
export async function createPasswordResetToken(userId: string): Promise<PasswordResetToken> {
  const tokens = await readResetTokens();
  
  // Supprimer les anciens tokens non utilisés pour cet utilisateur
  const validTokens = tokens.filter(
    t => t.user_id !== userId || t.used || new Date(t.expires_at) < new Date()
  );
  
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1 heure
  
  const resetToken: PasswordResetToken = {
    id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    used: false,
    created_at: new Date().toISOString(),
  };
  
  validTokens.push(resetToken);
  await writeResetTokens(validTokens);
  
  return resetToken;
}

/**
 * Trouve un token de réinitialisation valide
 */
export async function getValidResetToken(token: string): Promise<PasswordResetToken | null> {
  const tokens = await readResetTokens();
  const now = new Date();
  
  return tokens.find(
    t => t.token === token && !t.used && new Date(t.expires_at) > now
  ) || null;
}

/**
 * Marque un token comme utilisé
 */
export async function markTokenAsUsed(tokenId: string): Promise<void> {
  const tokens = await readResetTokens();
  const tokenIndex = tokens.findIndex(t => t.id === tokenId);
  
  if (tokenIndex !== -1) {
    tokens[tokenIndex].used = true;
    await writeResetTokens(tokens);
  }
}

/**
 * Initialise le super-admin si aucun utilisateur n'existe
 * @returns {Promise<{created: boolean}>} Indique si le super-admin a été créé
 */
export async function initializeSuperAdmin(): Promise<{created: boolean}> {
  const users = await readUsers();
  
  // Vérifier si le super-admin existe déjà
  const superAdminExists = users.some(u => u.email === 'philippe.rivalant@animaneo.fr');
  
  if (superAdminExists) {
    console.log('Super-admin existe déjà');
    return { created: false };
  }
  
  if (users.length === 0) {
    // Créer le super-admin initial
    await createUser(
      'philippe.rivalant@animaneo.fr',
      'AnimaNe@44',
      'super-admin'
    );
    console.log('Super-admin initial créé');
    return { created: true };
  }
  
  return { created: false };
}
