/**
 * Gestionnaire Redis robuste avec retry et gestion d'erreurs
 * Redis est la source de vérité unique en production
 */

import { kv } from '@vercel/kv';
import Redis from 'ioredis';

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // ms

// Client Redis pour REDIS_URL (format standard)
let redisClient: Redis | null = null;
let redisClientError: Error | null = null;
let lastErrorTime: number = 0;
const ERROR_COOLDOWN = 5000; // 5 secondes avant de réessayer après une erreur

/**
 * Obtient ou crée le client Redis
 */
function getRedisClient(): Redis | null {
  if (process.env.REDIS_URL) {
    if (redisClient) {
      return redisClient;
    }
    
    // Réessayer après un délai si on a eu une erreur récente
    if (redisClientError) {
      const timeSinceError = Date.now() - lastErrorTime;
      if (timeSinceError < ERROR_COOLDOWN) {
        // Ne pas réessayer si on a eu une erreur récente
        return null;
      }
      // Réinitialiser l'erreur pour permettre une nouvelle tentative
      console.log('🔄 Nouvelle tentative de connexion Redis après erreur');
      redisClientError = null;
    }
    
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: MAX_RETRIES,
        retryStrategy: (times) => {
          if (times > MAX_RETRIES) {
            redisClientError = new Error('Trop de tentatives de reconnexion Redis');
            return null; // Arrêter les tentatives
          }
          const delay = Math.min(times * RETRY_DELAY, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true; // Reconnecter en cas d'erreur READONLY
          }
          return false;
        },
        enableReadyCheck: true,
        enableOfflineQueue: false, // Ne pas mettre en queue si offline
      });
      
      redisClient.on('error', (err) => {
        console.error('❌ Erreur Redis:', err.message);
        redisClientError = err;
        lastErrorTime = Date.now();
      });
      
      redisClient.on('connect', () => {
        console.log('✅ Connexion Redis établie');
        redisClientError = null;
      });
      
      redisClient.on('ready', () => {
        console.log('✅ Redis prêt');
        redisClientError = null;
      });
      
      return redisClient;
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du client Redis:', error.message);
      redisClientError = error;
      lastErrorTime = Date.now();
      return null;
    }
  }
  return null;
}

/**
 * Vérifie si Redis/KV est disponible
 * IMPORTANT: Vérifie la configuration, pas l'état de connexion
 * (car en serverless, chaque invocation peut avoir un état différent)
 */
export function isKvAvailable(): boolean {
  // Si REDIS_URL est configuré, Redis est disponible (même si le client a eu une erreur temporaire)
  if (process.env.REDIS_URL) {
    return true;
  }
  // Si KV_REST_API_URL et KV_REST_API_TOKEN sont configurés, Vercel KV est disponible
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return true;
  }
  return false;
}

/**
 * Lit une valeur depuis Redis avec retry
 */
export async function kvGet<T>(key: string, retries = MAX_RETRIES): Promise<T | null> {
  // Format 1: REDIS_URL (format standard Redis avec ioredis)
  if (process.env.REDIS_URL) {
    const client = getRedisClient();
    if (!client) {
      console.error(`❌ Client Redis non disponible pour lire ${key}`);
      return null;
    }
    
    try {
      const value = await client.get(key);
      if (value === null) {
        return null;
      }
      const parsed = JSON.parse(value);
      return parsed as T;
    } catch (error: any) {
      if (retries > 0 && error.message.includes('ECONNREFUSED')) {
        console.warn(`⚠️ Tentative de reconnexion Redis pour ${key} (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return kvGet<T>(key, retries - 1);
      }
      console.error(`❌ Erreur lors de la lecture de ${key} depuis Redis:`, error.message);
      return null;
    }
  }
  
  // Format 2: KV_REST_API_URL + KV_REST_API_TOKEN (format REST API Vercel KV)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const value = await kv.get<T>(key);
      return value;
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`⚠️ Retry Vercel KV pour ${key} (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return kvGet<T>(key, retries - 1);
      }
      console.error(`❌ Erreur lors de la lecture de ${key} depuis Vercel KV:`, error.message);
      return null;
    }
  }
  
  console.error(`❌ Aucun client Redis configuré pour lire ${key}`);
  return null;
}

/**
 * Écrit une valeur dans Redis avec retry
 */
export async function kvSet(key: string, value: any, retries = MAX_RETRIES): Promise<void> {
  // Format 1: REDIS_URL (format standard Redis avec ioredis)
  if (process.env.REDIS_URL) {
    const client = getRedisClient();
    if (!client) {
      throw new Error(`Client Redis non disponible pour écrire ${key}`);
    }
    
    try {
      await client.set(key, JSON.stringify(value));
      return;
    } catch (error: any) {
      if (retries > 0 && error.message.includes('ECONNREFUSED')) {
        console.warn(`⚠️ Tentative de reconnexion Redis pour écrire ${key} (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return kvSet(key, value, retries - 1);
      }
      console.error(`❌ Erreur lors de l'écriture de ${key} dans Redis:`, error.message);
      throw error;
    }
  }
  
  // Format 2: KV_REST_API_URL + KV_REST_API_TOKEN (format REST API Vercel KV)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(key, value);
      return;
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`⚠️ Retry Vercel KV pour écrire ${key} (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return kvSet(key, value, retries - 1);
      }
      console.error(`❌ Erreur lors de l'écriture de ${key} dans Vercel KV:`, error.message);
      throw error;
    }
  }
  
  throw new Error(`Aucun client Redis configuré pour écrire ${key}`);
}

/**
 * Supprime une clé de Redis
 */
export async function kvDelete(key: string): Promise<void> {
  if (process.env.REDIS_URL) {
    const client = getRedisClient();
    if (client) {
      try {
        await client.del(key);
      } catch (error: any) {
        console.error(`❌ Erreur lors de la suppression de ${key} depuis Redis:`, error.message);
        throw error;
      }
    }
  } else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.del(key);
    } catch (error: any) {
      console.error(`❌ Erreur lors de la suppression de ${key} depuis Vercel KV:`, error.message);
      throw error;
    }
  }
}

/**
 * Vérifie la santé de Redis
 */
export async function checkRedisHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    if (!isKvAvailable()) {
      return { healthy: false, error: 'Redis non configuré' };
    }
    
    // Test de connexion avec une clé de test
    const testKey = `health_check_${Date.now()}`;
    await kvSet(testKey, { test: true });
    const value = await kvGet(testKey);
    await kvDelete(testKey);
    
    if (value && (value as any).test === true) {
      return { healthy: true };
    }
    
    return { healthy: false, error: 'Test de lecture/écriture échoué' };
  } catch (error: any) {
    return { healthy: false, error: error.message };
  }
}


