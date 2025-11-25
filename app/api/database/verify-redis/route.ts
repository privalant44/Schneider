import { NextResponse } from 'next/server';
import { kvGet, isKvAvailable, isVercel } from '@/lib/json-database';

export const dynamic = "force-dynamic";

const DATA_KEYS = [
  { key: 'clients', name: 'Clients' },
  { key: 'questionnaire_sessions', name: 'Sessions de questionnaire' },
  { key: 'client_specific_axes', name: 'Axes spécifiques par client' },
  { key: 'client_analysis_axes', name: 'Axes d\'analyse par client' },
  { key: 'questions', name: 'Questions' },
  { key: 'analysis_axes', name: 'Axes d\'analyse' },
  { key: 'session_responses', name: 'Réponses de session' },
  { key: 'respondent_profiles', name: 'Profils de répondants' },
  { key: 'session_results', name: 'Résultats de session' },
  { key: 'settings', name: 'Paramètres' }
];

export async function GET(request: Request) {
  try {
    const environment = process.env.VERCEL_ENV || 'local';
    const isVercelEnv = isVercel();
    const kvAvailable = isKvAvailable();
    
    const results: any = {
      environment,
      is_vercel: isVercelEnv,
      kv_available: kvAvailable,
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Vérification 1: Redis/KV doit être disponible sur Vercel
    results.checks.push({
      name: 'Redis/KV disponible',
      status: kvAvailable ? 'passed' : 'failed',
      message: kvAvailable 
        ? 'Redis/KV est configuré et disponible' 
        : 'Redis/KV n\'est PAS configuré',
      required: isVercelEnv
    });
    results.summary.total++;
    if (kvAvailable) results.summary.passed++;
    else if (isVercelEnv) results.summary.failed++;
    else results.summary.warnings++;

    // Vérification 2: Variables d'environnement
    const hasRedisUrl = !!process.env.REDIS_URL;
    const hasKvUrl = !!process.env.KV_REST_API_URL;
    const hasKvToken = !!process.env.KV_REST_API_TOKEN;
    
    results.checks.push({
      name: 'Variables d\'environnement Redis',
      status: (hasRedisUrl || (hasKvUrl && hasKvToken)) ? 'passed' : 'failed',
      message: hasRedisUrl 
        ? 'REDIS_URL est configuré' 
        : (hasKvUrl && hasKvToken)
          ? 'KV_REST_API_URL et KV_REST_API_TOKEN sont configurés'
          : 'Aucune variable Redis/KV trouvée',
      details: {
        REDIS_URL: hasRedisUrl ? '✅ Présent' : '❌ Manquant',
        KV_REST_API_URL: hasKvUrl ? '✅ Présent' : '❌ Manquant',
        KV_REST_API_TOKEN: hasKvToken ? '✅ Présent' : '❌ Manquant'
      },
      required: isVercelEnv
    });
    results.summary.total++;
    if (hasRedisUrl || (hasKvUrl && hasKvToken)) results.summary.passed++;
    else if (isVercelEnv) results.summary.failed++;
    else results.summary.warnings++;

    // Vérification 3: Test de connexion Redis
    if (kvAvailable) {
      try {
        const testKey = 'test_connection_' + Date.now();
        await kvGet(testKey);
        results.checks.push({
          name: 'Test de connexion Redis',
          status: 'passed',
          message: 'Connexion Redis réussie'
        });
        results.summary.total++;
        results.summary.passed++;
      } catch (error: any) {
        results.checks.push({
          name: 'Test de connexion Redis',
          status: 'failed',
          message: 'Échec de la connexion Redis',
          error: error.message
        });
        results.summary.total++;
        results.summary.failed++;
      }
    }

    // Vérification 4: Vérifier que chaque type de données existe dans Redis
    const dataStatus: Record<string, any> = {};
    
    for (const { key, name } of DATA_KEYS) {
      if (kvAvailable) {
        try {
          const data = await kvGet<any[]>(key);
          const exists = data !== null && data !== undefined;
          const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
          
          dataStatus[key] = {
            name,
            exists_in_redis: exists,
            count,
            source: exists ? 'Redis' : 'Non trouvé dans Redis'
          };
          
          results.checks.push({
            name: `${name} dans Redis`,
            status: exists ? 'passed' : 'warning',
            message: exists 
              ? `${count} élément(s) trouvé(s) dans Redis` 
              : 'Aucune donnée trouvée dans Redis (peut être normal si aucune donnée n\'a été créée)',
            count
          });
          results.summary.total++;
          if (exists) results.summary.passed++;
          else results.summary.warnings++;
        } catch (error: any) {
          dataStatus[key] = {
            name,
            exists_in_redis: false,
            error: error.message,
            source: 'Erreur de lecture'
          };
          
          results.checks.push({
            name: `${name} dans Redis`,
            status: 'failed',
            message: `Erreur lors de la lecture: ${error.message}`,
            error: error.message
          });
          results.summary.total++;
          results.summary.failed++;
        }
      } else {
        dataStatus[key] = {
          name,
          exists_in_redis: false,
          source: 'Redis non disponible'
        };
        
        results.checks.push({
          name: `${name} dans Redis`,
          status: isVercelEnv ? 'failed' : 'warning',
          message: 'Redis non disponible - données lues depuis fichiers JSON',
          required: isVercelEnv
        });
        results.summary.total++;
        if (isVercelEnv) results.summary.failed++;
        else results.summary.warnings++;
      }
    }

    results.data_status = dataStatus;

    // Vérification 5: Sur Vercel, Redis DOIT être utilisé
    if (isVercelEnv && !kvAvailable) {
      results.checks.push({
        name: 'Utilisation Redis sur Vercel',
        status: 'failed',
        message: '⚠️ CRITIQUE: Sur Vercel, Redis/KV DOIT être configuré. Les données ne persisteront pas sans Redis.',
        required: true
      });
      results.summary.total++;
      results.summary.failed++;
    } else if (isVercelEnv && kvAvailable) {
      results.checks.push({
        name: 'Utilisation Redis sur Vercel',
        status: 'passed',
        message: '✅ Redis/KV est configuré sur Vercel. Les données seront persistées correctement.'
      });
      results.summary.total++;
      results.summary.passed++;
    }

    // Résumé final
    const allPassed = results.summary.failed === 0;
    const criticalIssues = isVercelEnv && !kvAvailable;
    
    results.final_status = criticalIssues 
      ? 'critical' 
      : allPassed 
        ? 'passed' 
        : 'warning';
    
    results.recommendations = [];
    
    if (criticalIssues) {
      results.recommendations.push(
        '⚠️ CRITIQUE: Configurez Redis/KV dans Vercel Dashboard → Storage',
        'Les données ne persisteront pas sans Redis sur Vercel'
      );
    }
    
    if (!kvAvailable && isVercelEnv) {
      results.recommendations.push(
        'Créez une base de données Redis dans Vercel Dashboard',
        'Les variables d\'environnement seront configurées automatiquement'
      );
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Erreur lors de la vérification Redis:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la vérification',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}


