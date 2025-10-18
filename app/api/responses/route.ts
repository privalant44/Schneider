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
    let session = getSession(sessionId);
    if (!session) {
      // Créer la session avec l'ID fourni (ancien système)
      session = createSessionWithId(sessionId);
    }
    
    // Si c'est une session de questionnaire (nouveau système), utiliser le nouveau flux
    if (sessionId.startsWith('session_') && !sessionId.includes('_')) {
      // Nouveau système - créer un profil de répondant
      const profile = createRespondentProfile({
        session_id: sessionId,
        ...respondentData
      });
      
      // Ajouter les réponses avec le nouveau système
      for (const answer of answers) {
        if (answer.questionId && answer.answer) {
          addSessionResponse({
            session_id: sessionId,
            respondent_profile_id: profile.id,
            question_id: answer.questionId,
            answer: answer.answer
          });
        }
      }
      
      // Calculer les résultats de la session
      calculateSessionResults(sessionId);
      
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
      // Pour l'instant, retourner un tableau vide
      // En production, vous pourriez vouloir implémenter une fonction pour récupérer toutes les sessions
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
