import { NextResponse } from 'next/server';
import { getSessionResults, getQuestionnaireSession } from '@/lib/json-database';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId est requis' },
        { status: 400 }
      );
    }
    
    // Récupérer les résultats de la session
    const results = await getSessionResults(sessionId);
    
    if (!results) {
      return NextResponse.json(
        { error: 'Aucun résultat trouvé pour cette session' },
        { status: 404 }
      );
    }
    
    // Récupérer les informations de la session
    const session = await getQuestionnaireSession(sessionId);
    
    return NextResponse.json({
      session: session,
      results: results
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}
