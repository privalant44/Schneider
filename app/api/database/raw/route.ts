import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    
    if (!table) {
      return NextResponse.json(
        { error: 'Paramètre table requis' },
        { status: 400 }
      );
    }

    // Import dynamique des fonctions de base de données
    const db = await import('@/lib/json-database');
    
    let data: any[] = [];
    
    switch (table) {
      case 'clients':
        data = db.getClients();
        break;
      case 'sessions':
        data = db.getQuestionnaireSessions();
        break;
      case 'questions':
        data = db.getQuestions();
        break;
      case 'respondent-profiles':
        data = db.getRespondentProfiles();
        break;
      case 'session-responses':
        data = db.getSessionResponses();
        break;
      case 'session-results':
        data = db.getAllSessionResults();
        break;
      case 'analysis-axes':
        data = db.getAnalysisAxes();
        break;
      case 'client-specific-axes':
        data = db.getClientSpecificAxes();
        break;
      case 'settings':
        data = db.getSettings();
        break;
      default:
        return NextResponse.json(
          { error: 'Table non reconnue' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      table,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données brutes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
