import { NextResponse } from 'next/server';
import { getDomainAnalysis, saveDomainAnalysis, getAllDomainAnalysis } from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const recalculate = searchParams.get('recalculate') === 'true';

    if (sessionId) {
      // Récupérer ou recalculer l'analyse pour une session spécifique
      let analysis = getDomainAnalysis(sessionId);
      
      if (recalculate || analysis.length === 0) {
        analysis = saveDomainAnalysis(sessionId);
      }
      
      return NextResponse.json(analysis);
    } else {
      // Récupérer toutes les analyses
      const allAnalysis = getAllDomainAnalysis();
      return NextResponse.json(allAnalysis);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'analyse par domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'analyse par domaine' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      );
    }

    // Recalculer et sauvegarder l'analyse pour la session
    const analysis = saveDomainAnalysis(sessionId);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erreur lors du calcul de l\'analyse par domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul de l\'analyse par domaine' },
      { status: 500 }
    );
  }
}
