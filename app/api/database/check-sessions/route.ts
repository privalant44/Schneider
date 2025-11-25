import { NextResponse } from 'next/server';
import { kvGet, isKvAvailable, getQuestionnaireSessions } from '@/lib/json-database';

export const dynamic = "force-dynamic";

const QUESTIONNAIRE_SESSIONS_KEY = 'questionnaire_sessions';

export async function GET(request: Request) {
  try {
    const kvAvailable = isKvAvailable();
    
    let redisSessions: any[] = [];
    let memorySessions: any[] = [];
    
    // Vérifier dans Redis
    if (kvAvailable) {
      try {
        redisSessions = await kvGet<any[]>(QUESTIONNAIRE_SESSIONS_KEY) || [];
      } catch (error) {
        console.error('Erreur lors de la lecture depuis Redis:', error);
      }
    }
    
    // Vérifier en mémoire
    memorySessions = getQuestionnaireSessions();
    
    return NextResponse.json({
      kv_available: kvAvailable,
      redis_sessions_count: redisSessions.length,
      memory_sessions_count: memorySessions.length,
      redis_sessions: redisSessions,
      memory_sessions: memorySessions,
      match: redisSessions.length === memorySessions.length
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des sessions' },
      { status: 500 }
    );
  }
}

