import { NextResponse } from 'next/server';
import { 
  kvSet, 
  isKvAvailable
} from '@/lib/json-database';

export const dynamic = "force-dynamic";

// Clés Redis
const QUESTIONNAIRE_SESSIONS_KEY = 'questionnaire_sessions';
const SESSION_RESPONSES_KEY = 'session_responses';
const RESPONDENT_PROFILES_KEY = 'respondent_profiles';
const SESSION_RESULTS_KEY = 'session_results';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    
    if (!table) {
      return NextResponse.json(
        { error: 'Paramètre "table" requis (sessions, responses, profiles, results, all)' },
        { status: 400 }
      );
    }
    
    const kvAvailable = isKvAvailable();
    
    if (!kvAvailable) {
      return NextResponse.json(
        { error: 'Redis/KV non disponible' },
        { status: 500 }
      );
    }
    
    let cleared = [];
    
    if (table === 'sessions' || table === 'all') {
      await kvSet(QUESTIONNAIRE_SESSIONS_KEY, []);
      cleared.push('sessions');
    }
    
    if (table === 'responses' || table === 'all') {
      await kvSet(SESSION_RESPONSES_KEY, []);
      cleared.push('responses');
    }
    
    if (table === 'profiles' || table === 'all') {
      await kvSet(RESPONDENT_PROFILES_KEY, []);
      cleared.push('profiles');
    }
    
    if (table === 'results' || table === 'all') {
      await kvSet(SESSION_RESULTS_KEY, []);
      cleared.push('results');
    }
    
    return NextResponse.json({
      success: true,
      message: `Tables vidées avec succès: ${cleared.join(', ')}`,
      cleared
    });
  } catch (error) {
    console.error('Erreur lors du vidage des tables:', error);
    return NextResponse.json(
      { error: 'Erreur lors du vidage des tables' },
      { status: 500 }
    );
  }
}

