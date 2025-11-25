import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { getQuestionnaireSession, getSessionResults } = await import('@/lib/json-database');
    
    const session = getQuestionnaireSession(params.sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    const results = await getSessionResults(params.sessionId);
    
    // Si les résultats existent, enrichir avec le nombre de participants (profils)
    let enrichedResults = results;
    if (results) {
      const { getRespondentProfilesBySession } = await import('@/lib/json-database');
      const profiles = await getRespondentProfilesBySession(params.sessionId);
      // Le nombre de participants est le nombre de profils
      enrichedResults = {
        ...results,
        total_responses: profiles.length // Nombre de participants (profils)
      };
    }
    
    return NextResponse.json({ session, results: enrichedResults });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { updateQuestionnaireSession } = await import('@/lib/json-database');
    const body = await request.json();
    
    const updatedSession = await updateQuestionnaireSession(params.sessionId, body);
    
    if (updatedSession) {
      return NextResponse.json(updatedSession);
    } else {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { 
      deleteQuestionnaireSession,
      deleteRespondentProfilesBySession,
      deleteSessionResults,
      deleteSessionResponses
    } = await import('@/lib/json-database');
    
    // Supprimer la session et toutes les données associées
    const sessionDeleted = await deleteQuestionnaireSession(params.sessionId);
    
    if (sessionDeleted) {
      // Supprimer les profils de répondants associés à cette session
      deleteRespondentProfilesBySession(params.sessionId);
      
      // Supprimer les réponses de session
      deleteSessionResponses(params.sessionId);
      
      // Supprimer les résultats de session
      deleteSessionResults(params.sessionId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Session et données associées supprimées avec succès' 
      });
    } else {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    );
  }
}