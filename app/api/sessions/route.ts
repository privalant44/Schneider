import { NextResponse } from 'next/server';
import { 
  getQuestionnaireSessions, 
  getQuestionnaireSession,
  createQuestionnaireSession, 
  updateQuestionnaireSession, 
  deleteQuestionnaireSession,
  calculateSessionResults,
  getSessionResults
} from '@/lib/json-database';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      // Récupérer une session spécifique
      const session = getQuestionnaireSession(sessionId);
      if (session) {
        const results = getSessionResults(sessionId);
        return NextResponse.json({ session, results });
      } else {
        return NextResponse.json(
          { error: 'Session non trouvée' },
          { status: 404 }
        );
      }
    } else {
      // Récupérer toutes les sessions ou celles d'un client spécifique
      const sessions = getQuestionnaireSessions(clientId || undefined);
      return NextResponse.json(sessions, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { client_id, name, description, start_date, end_date, is_active, planned_participants } = await request.json();
    
    if (!client_id || !name || !start_date) {
      return NextResponse.json(
        { error: 'client_id, name et start_date sont requis' },
        { status: 400 }
      );
    }
    
    const newSession = await createQuestionnaireSession({
      client_id,
      name,
      description,
      start_date,
      end_date,
      is_active: is_active !== undefined ? is_active : true,
      planned_participants
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, start_date, end_date, is_active, planned_participants } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID de la session est requis' },
        { status: 400 }
      );
    }
    
    const updatedSession = await updateQuestionnaireSession(id, {
      name,
      description,
      start_date,
      end_date,
      is_active,
      planned_participants
    });

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de la session requis' },
        { status: 400 }
      );
    }

    const success = await deleteQuestionnaireSession(id);
    
    if (success) {
      return NextResponse.json({ success: true });
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
