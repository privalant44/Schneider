import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

/**
 * Route pour vérifier que Vercel KV est correctement configuré et fonctionnel
 * 
 * Usage :
 * - Appelez GET /api/kv/verify depuis votre navigateur ou via curl
 * - Vérifie les variables d'environnement, la connexion et les opérations de base
 * - Supporte REDIS_URL (format standard) et KV_REST_API_URL/KV_REST_API_TOKEN (format REST API)
 */
export async function GET() {
  const checks: Array<{ name: string; status: 'ok' | 'error'; message: string }> = [];
  
  try {
    // 1. Vérifier les variables d'environnement
    const hasRedisUrl = !!process.env.REDIS_URL;
    const hasKvUrl = !!process.env.KV_REST_API_URL;
    const hasKvToken = !!process.env.KV_REST_API_TOKEN;
    const isVercel = !!process.env.VERCEL;
    
    // Vérifier si au moins un format est configuré
    const isConfigured = hasRedisUrl || (hasKvUrl && hasKvToken);
    
    checks.push({
      name: 'Variables d\'environnement',
      status: isConfigured ? 'ok' : 'error',
      message: isConfigured 
        ? hasRedisUrl 
          ? 'REDIS_URL est configuré (format standard)'
          : 'KV_REST_API_URL et KV_REST_API_TOKEN sont configurés (format REST API)'
        : `Manquants: ${!hasRedisUrl && !hasKvUrl ? 'REDIS_URL ou KV_REST_API_URL' : ''} ${!hasKvToken && !hasRedisUrl ? 'KV_REST_API_TOKEN' : ''}`.trim()
    });

    // 2. Test de connexion (seulement si les variables sont présentes)
    if (isConfigured) {
      try {
        // Test simple : écrire une valeur de test
        const testKey = 'kv_verification_test';
        const testValue = { timestamp: Date.now(), test: true };
        
        await kv.set(testKey, testValue);
        checks.push({
          name: 'Écriture dans KV',
          status: 'ok',
          message: 'Écriture réussie'
        });

        // Test de lecture
        const readValue = await kv.get(testKey);
        if (readValue && typeof readValue === 'object' && 'test' in readValue) {
          checks.push({
            name: 'Lecture depuis KV',
            status: 'ok',
            message: 'Lecture réussie'
          });
        } else {
          checks.push({
            name: 'Lecture depuis KV',
            status: 'error',
            message: 'La valeur lue ne correspond pas à celle écrite'
          });
        }

        // Nettoyer la clé de test
        await kv.del(testKey);
        checks.push({
          name: 'Suppression dans KV',
          status: 'ok',
          message: 'Suppression réussie'
        });

      } catch (error) {
        checks.push({
          name: 'Connexion à KV',
          status: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // 3. Vérifier les clés utilisées par l'application
    if (isConfigured) {
      try {
        const users = await kv.get('admin_users');
        const resetTokens = await kv.get('password_reset_tokens');
        
        checks.push({
          name: 'Clé admin_users',
          status: 'ok',
          message: users ? `Présente (${Array.isArray(users) ? users.length : 'données'} utilisateurs)` : 'Vide (normal si aucun utilisateur créé)'
        });

        checks.push({
          name: 'Clé password_reset_tokens',
          status: 'ok',
          message: resetTokens ? `Présente (${Array.isArray(resetTokens) ? resetTokens.length : 'données'} tokens)` : 'Vide (normal)'
        });
      } catch (error) {
        checks.push({
          name: 'Lecture des clés applicatives',
          status: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Résumé
    const allOk = checks.every(check => check.status === 'ok');
    const environment = isVercel ? 'Vercel (production)' : 'Local (développement)';

    return NextResponse.json({
      success: allOk,
      environment,
      timestamp: new Date().toISOString(),
      checks,
      summary: {
        total: checks.length,
        ok: checks.filter(c => c.status === 'ok').length,
        errors: checks.filter(c => c.status === 'error').length
      },
      configuration: {
        REDIS_URL: hasRedisUrl ? '✅ Présent' : '❌ Manquant',
        KV_REST_API_URL: hasKvUrl ? '✅ Présent' : '❌ Manquant',
        KV_REST_API_TOKEN: hasKvToken ? '✅ Présent' : '❌ Manquant'
      },
      recommendations: !isConfigured 
        ? [
            'Créez une base de données Redis dans Vercel Dashboard → Storage',
            'Les variables d\'environnement (REDIS_URL ou KV_REST_API_URL/KV_REST_API_TOKEN) seront configurées automatiquement',
            'Consultez VERCEL_KV_SETUP.md pour les instructions détaillées'
          ]
        : allOk 
          ? ['✅ Vercel KV est correctement configuré et fonctionnel']
          : ['Vérifiez les erreurs ci-dessus et consultez les logs Vercel pour plus de détails']
    }, { 
      status: allOk ? 200 : 500 
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la vérification',
      message: error instanceof Error ? error.message : String(error),
      checks
    }, { status: 500 });
  }
}



