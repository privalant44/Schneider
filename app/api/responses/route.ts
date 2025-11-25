import { NextResponse } from 'next/server';
import { 
  createSession, 
  createSessionWithId, 
  addResponse, 
  getResponses, 
  completeSession, 
  getSession,
  createRespondentProfile,
  addSessionResponse,
  calculateSessionResults
} from '@/lib/json-database';

export async function POST(request: Request) {
  try {
    const { sessionId, answers, respondentData } = await request.json();
    
    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'SessionId et réponses requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si la session existe déjà (ancien système)
    let session: { id: string; completed: boolean; created_at: string } | null = getSession(sessionId);
    if (!session) {
      // Créer la session avec l'ID fourni (ancien système)
      session = createSessionWithId(sessionId);
    }
    
    // Si c'est une session de questionnaire (nouveau système), utiliser le nouveau flux
    // Les sessions de questionnaire commencent par 'session_' et ont un format comme 'session_1234567890_abc123'
    if (sessionId.startsWith('session_')) {
      // Nouveau système - créer un profil de répondant
      const profile = await createRespondentProfile({
        session_id: sessionId,
        ...respondentData
      });
      
      // Ajouter les réponses avec le nouveau système
      for (const answer of answers) {
        if (answer.questionId && answer.answer) {
          await addSessionResponse({
            session_id: sessionId,
            respondent_profile_id: profile.id,
            question_id: answer.questionId,
            answer: answer.answer
          });
        }
      }
      
      // Calculer les résultats de la session
      await calculateSessionResults(sessionId);
      
      return NextResponse.json({ success: true, sessionId: sessionId, profileId: profile.id });
    } else {
      // Ancien système - utiliser l'ancien flux
      for (const answer of answers) {
        if (answer.questionId && answer.answer) {
          addResponse(sessionId, answer.questionId, answer.answer);
        }
      }
      
      // Marquer la session comme terminée
      completeSession(sessionId);
      
      return NextResponse.json({ success: true, sessionId: sessionId });
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des réponses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des réponses' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      // Récupérer les réponses d'une session spécifique
      const responses = getResponses(sessionId);
      return NextResponse.json(responses);
    } else {
      // Retourner un tableau vide par défaut
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réponses' },
      { status: 500 }
    );
  }
}
