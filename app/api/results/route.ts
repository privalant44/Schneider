import { NextResponse } from 'next/server';
import { calculateResults, getSessionResults, getSessionResponses } from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      );
    }
    
    // Essayer d'abord le nouveau système (sessions de questionnaire)
    if (sessionId.startsWith('session_') && sessionId.includes('_')) {
      const sessionResults = getSessionResults(sessionId);
      if (sessionResults) {
        return NextResponse.json(sessionResults.culture_distribution);
      }
    }
    
    // Sinon, utiliser l'ancien système
    const results = calculateResults(sessionId);
    
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Aucune réponse trouvée pour cette session' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Erreur lors du calcul des résultats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des résultats' },
      { status: 500 }
    );
  }
}
