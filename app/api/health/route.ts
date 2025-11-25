import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/redis-manager';
import { kvGet, isKvAvailable } from '@/lib/json-database';

export const dynamic = "force-dynamic";

const DATA_KEYS = [
  'clients',
  'questionnaire_sessions',
  'client_specific_axes',
  'questions',
  'session_responses',
  'respondent_profiles',
  'session_results',
  'settings'
];

export async function GET(request: Request) {
  const startTime = Date.now();
  const health: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'local',
    is_vercel: !!process.env.VERCEL,
    status: 'unknown',
    checks: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Check 1: Redis/KV disponibilité
  health.checks.redis_available = {
    name: 'Redis/KV disponible',
    status: isKvAvailable() ? 'passed' : 'failed',
    message: isKvAvailable() ? 'Redis/KV est configuré' : 'Redis/KV n\'est pas configuré'
  };
  health.summary.total++;
  if (isKvAvailable()) health.summary.passed++;
  else health.summary.failed++;

  // Check 2: Santé Redis
  if (isKvAvailable()) {
    const redisHealth = await checkRedisHealth();
    health.checks.redis_health = {
      name: 'Santé Redis',
      status: redisHealth.healthy ? 'passed' : 'failed',
      message: redisHealth.healthy ? 'Redis répond correctement' : `Redis en erreur: ${redisHealth.error}`,
      error: redisHealth.error
    };
    health.summary.total++;
    if (redisHealth.healthy) health.summary.passed++;
    else health.summary.failed++;
  }

  // Check 3: Variables d'environnement
  const hasRedisUrl = !!process.env.REDIS_URL;
  const hasKvUrl = !!process.env.KV_REST_API_URL;
  const hasKvToken = !!process.env.KV_REST_API_TOKEN;
  
  health.checks.env_vars = {
    name: 'Variables d\'environnement',
    status: (hasRedisUrl || (hasKvUrl && hasKvToken)) ? 'passed' : 'failed',
    message: hasRedisUrl 
      ? 'REDIS_URL configuré' 
      : (hasKvUrl && hasKvToken)
        ? 'KV_REST_API_URL et KV_REST_API_TOKEN configurés'
        : 'Aucune variable Redis trouvée',
    details: {
      REDIS_URL: hasRedisUrl ? '✅' : '❌',
      KV_REST_API_URL: hasKvUrl ? '✅' : '❌',
      KV_REST_API_TOKEN: hasKvToken ? '✅' : '❌'
    }
  };
  health.summary.total++;
  if (hasRedisUrl || (hasKvUrl && hasKvToken)) health.summary.passed++;
  else health.summary.failed++;

  // Check 4: Données dans Redis
  if (isKvAvailable()) {
    const dataChecks: any = {};
    let dataPassed = 0;
    let dataFailed = 0;
    
    for (const key of DATA_KEYS) {
      try {
        const data = await kvGet<any[]>(key);
        const exists = data !== null && data !== undefined;
        const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
        
        dataChecks[key] = {
          exists,
          count,
          status: exists ? 'ok' : 'empty'
        };
        
        if (exists) dataPassed++;
        else dataFailed++;
      } catch (error: any) {
        dataChecks[key] = {
          exists: false,
          error: error.message,
          status: 'error'
        };
        dataFailed++;
      }
    }
    
    health.checks.data_in_redis = {
      name: 'Données dans Redis',
      status: dataFailed === 0 ? 'passed' : (dataPassed > 0 ? 'warning' : 'failed'),
      message: `${dataPassed}/${DATA_KEYS.length} types de données trouvés dans Redis`,
      details: dataChecks
    };
    health.summary.total++;
    if (dataFailed === 0) health.summary.passed++;
    else if (dataPassed > 0) health.summary.warnings++;
    else health.summary.failed++;
  }

  // Déterminer le statut global
  const allPassed = health.summary.failed === 0;
  health.status = allPassed ? 'healthy' : (health.summary.failed > health.summary.passed ? 'unhealthy' : 'degraded');
  
  health.response_time_ms = Date.now() - startTime;

  const statusCode = health.status === 'healthy' ? 200 : (health.status === 'degraded' ? 200 : 503);

  return NextResponse.json(health, { status: statusCode });
}
