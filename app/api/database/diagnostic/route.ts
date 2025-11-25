import { NextResponse } from 'next/server';
import { kvGet, isKvAvailable } from '@/lib/json-database';

export const dynamic = "force-dynamic";

const KEYS_TO_CHECK = [
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
    const kvAvailable = isKvAvailable();
    
    if (!kvAvailable) {
      return NextResponse.json({
        error: 'Redis/KV non disponible',
        kv_available: false,
        environment: process.env.VERCEL_ENV || 'local'
      });
    }

    const results: Record<string, any> = {
      kv_available: true,
      environment: process.env.VERCEL_ENV || 'local',
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Vérifier chaque clé
    for (const { key, name } of KEYS_TO_CHECK) {
      try {
        const data = await kvGet<any[]>(key);
        const exists = data !== null && data !== undefined;
        const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
        results.data[key] = {
          name,
          exists,
          count,
          sample: Array.isArray(data) && data.length > 0 ? data[0] : (data || null),
          full_data: Array.isArray(data) ? data : null
        };
      } catch (error: any) {
        results.data[key] = {
          name,
          exists: false,
          error: error.message,
          stack: error.stack
        };
      }
    }

    // Vérifier les variables d'environnement
    results.environment_variables = {
      REDIS_URL: process.env.REDIS_URL ? '✅ Présent' : '❌ Manquant',
      KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ Présent' : '❌ Manquant',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ Présent' : '❌ Manquant',
      VERCEL_ENV: process.env.VERCEL_ENV || 'non défini'
    };

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Erreur lors du diagnostic de la base de données:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du diagnostic',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

