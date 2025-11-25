import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getUserByEmail, readUsers } from '@/lib/users';

export const dynamic = 'force-dynamic';

/**
 * Route de diagnostic pour identifier les problèmes de connexion
 * 
 * Usage :
 * - Appelez GET /api/auth/diagnostic depuis votre navigateur
 * - Affiche l'état de KV, les utilisateurs présents, et les erreurs potentielles
 */
export async function GET() {
  const diagnostics: Array<{ category: string; status: 'ok' | 'warning' | 'error'; message: string; details?: any }> = [];
  
  try {
    // 1. Vérifier l'environnement
    const isVercel = !!process.env.VERCEL;
    const hasRedisUrl = !!process.env.REDIS_URL;
    const hasKvUrl = !!process.env.KV_REST_API_URL;
    const hasKvToken = !!process.env.KV_REST_API_TOKEN;
    const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown';
    const isConfigured = hasRedisUrl || (hasKvUrl && hasKvToken);
    
    diagnostics.push({
      category: 'Environnement',
      status: 'ok',
      message: `Environnement: ${env}${isVercel ? ' (Vercel)' : ' (Local)'}`,
      details: {
        isVercel,
        env,
        hasRedisUrl,
        hasKvUrl,
        hasKvToken
      }
    });

    // 2. Vérifier la configuration KV
    if (isVercel && !isConfigured) {
      diagnostics.push({
        category: 'Configuration KV',
        status: 'error',
        message: 'Vercel KV non configuré. Variables d\'environnement manquantes.',
        details: {
          REDIS_URL: hasRedisUrl ? '✅ Présent' : '❌ Manquant',
          KV_REST_API_URL: hasKvUrl ? '✅ Présent' : '❌ Manquant',
          KV_REST_API_TOKEN: hasKvToken ? '✅ Présent' : '❌ Manquant',
          note: 'Au moins REDIS_URL ou (KV_REST_API_URL + KV_REST_API_TOKEN) doit être configuré'
        }
      });
    } else if (isConfigured) {
      diagnostics.push({
        category: 'Configuration KV',
        status: 'ok',
        message: hasRedisUrl 
          ? 'REDIS_URL est configuré (format standard)'
          : 'Variables d\'environnement KV présentes (format REST API)',
        details: {
          REDIS_URL: hasRedisUrl ? '✅ Présent' : '❌ Manquant',
          KV_REST_API_URL: hasKvUrl ? '✅ Présent' : '❌ Manquant',
          KV_REST_API_TOKEN: hasKvToken ? '✅ Présent' : '❌ Manquant'
        }
      });
    }

    // 3. Tester la connexion KV (si configuré)
    if (isConfigured) {
      try {
        // Test de connexion simple
        const testKey = 'diagnostic_test';
        const testValue = { test: true, timestamp: Date.now() };
        
        await kv.set(testKey, testValue);
        const readValue = await kv.get(testKey);
        await kv.del(testKey);
        
        if (readValue && typeof readValue === 'object' && 'test' in readValue) {
          diagnostics.push({
            category: 'Connexion KV',
            status: 'ok',
            message: 'Connexion à Vercel KV fonctionnelle'
          });
        } else {
          diagnostics.push({
            category: 'Connexion KV',
            status: 'error',
            message: 'Connexion KV fonctionne mais les données ne sont pas correctement lues'
          });
        }
      } catch (error) {
        diagnostics.push({
          category: 'Connexion KV',
          status: 'error',
          message: 'Erreur lors de la connexion à Vercel KV',
          details: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          }
        });
      }
    }

    // 4. Vérifier les utilisateurs dans KV
    if (isConfigured) {
      try {
        const users = await readUsers();
        diagnostics.push({
          category: 'Utilisateurs',
          status: users.length > 0 ? 'ok' : 'warning',
          message: `${users.length} utilisateur(s) trouvé(s)`,
          details: {
            count: users.length,
            users: users.map(u => ({
              id: u.id,
              email: u.email,
              role: u.role,
              created_at: u.created_at
            }))
          }
        });

        // Vérifier spécifiquement le super-admin
        const superAdminEmail = 'philippe.rivalant@animaneo.fr';
        const superAdmin = await getUserByEmail(superAdminEmail);
        
        if (superAdmin) {
          diagnostics.push({
            category: 'Super-admin',
            status: 'ok',
            message: `Super-admin trouvé: ${superAdminEmail}`,
            details: {
              id: superAdmin.id,
              email: superAdmin.email,
              role: superAdmin.role,
              created_at: superAdmin.created_at
            }
          });
        } else {
          diagnostics.push({
            category: 'Super-admin',
            status: 'error',
            message: `Super-admin NON trouvé: ${superAdminEmail}`,
            details: {
              suggestion: 'Utilisez /api/admin/init pour initialiser le super-admin'
            }
          });
        }
      } catch (error) {
        diagnostics.push({
          category: 'Utilisateurs',
          status: 'error',
          message: 'Erreur lors de la lecture des utilisateurs',
          details: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          }
        });
      }
    } else if (isVercel) {
      diagnostics.push({
        category: 'Utilisateurs',
        status: 'error',
        message: 'Impossible de lire les utilisateurs: Vercel KV non configuré'
      });
    }

    // Résumé
    const errors = diagnostics.filter(d => d.status === 'error');
    const warnings = diagnostics.filter(d => d.status === 'warning');
    const allOk = errors.length === 0;

    return NextResponse.json({
      success: allOk,
      timestamp: new Date().toISOString(),
      summary: {
        total: diagnostics.length,
        ok: diagnostics.filter(d => d.status === 'ok').length,
        warnings: warnings.length,
        errors: errors.length
      },
      diagnostics,
      recommendations: errors.length > 0 ? [
        ...(errors.some(e => e.category === 'Configuration KV') 
          ? ['Créez une base de données Redis dans Vercel Dashboard → Storage']
          : []),
        ...(errors.some(e => e.category === 'Super-admin')
          ? ['Initialisez le super-admin en appelant GET /api/admin/init']
          : []),
        ...(errors.some(e => e.category === 'Connexion KV')
          ? ['Vérifiez les logs Vercel pour plus de détails sur l\'erreur de connexion KV']
          : [])
      ] : ['✅ Tout semble correct !']
    }, {
      status: allOk ? 200 : 500
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du diagnostic',
      message: error instanceof Error ? error.message : String(error),
      diagnostics
    }, { status: 500 });
  }
}


