import { NextResponse } from 'next/server';
import { calculateResults, getSessionResults, getSessionResponses, calculateIndividualResults, recalculateSessionResults } from '@/lib/json-database';

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const profileId = searchParams.get('profileId');
    const recalculate = searchParams.get('recalculate') === 'true';
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      );
    }
    
    // Si un profileId est fourni, calculer les résultats individuels
    if (profileId) {
      const individualResults = calculateIndividualResults(profileId);
      if (individualResults.length === 0) {
        return NextResponse.json(
          { error: 'Aucune réponse trouvée pour ce profil' },
          { status: 404 }
        );
      }
      return NextResponse.json(individualResults);
    }
    
    // Essayer d'abord le nouveau système (sessions de questionnaire)
    if (sessionId.startsWith('session_')) {
      let sessionResults;
      
      if (recalculate) {
        // Forcer le recalcul en temps réel
        sessionResults = await recalculateSessionResults(sessionId);
      } else {
        // Essayer d'abord les résultats stockés, sinon recalculer
        sessionResults = await getSessionResults(sessionId) || await recalculateSessionResults(sessionId);
      }
      
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
