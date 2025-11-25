import { NextResponse } from 'next/server';
import { 
  createRespondentProfile, 
  getRespondentProfile,
  getRespondentProfilesBySession,
  addSessionResponse,
  getSessionResponses,
  calculateSessionResults
} from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const profileId = searchParams.get('profileId');
    
    if (profileId) {
      // Récupérer un profil spécifique
      const profile = getRespondentProfile(profileId);
      if (profile) {
        return NextResponse.json(profile);
      } else {
        return NextResponse.json(
          { error: 'Profil non trouvé' },
          { status: 404 }
        );
      }
    } else if (sessionId) {
      // Récupérer tous les profils d'une session
      const profiles = getRespondentProfilesBySession(sessionId);
      return NextResponse.json(profiles);
    } else {
      return NextResponse.json(
        { error: 'sessionId ou profileId requis' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des profils' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log('Données reçues pour respondent-profiles:', requestData);
    
    const { 
      session_id, 
      axis_responses,
      answers 
    } = requestData;
    
    if (!session_id) {
      console.error('session_id manquant:', { session_id, requestData });
      return NextResponse.json(
        { error: 'session_id est requis', received: requestData },
        { status: 400 }
      );
    }
    
    // Créer le profil de répondant
    const newProfile = await createRespondentProfile({
      session_id,
      axis_responses: axis_responses || {}
    });

    // Ajouter les réponses si fournies
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        if (answer.questionId && answer.answer) {
          await addSessionResponse({
            session_id,
            respondent_profile_id: newProfile.id,
            question_id: answer.questionId,
            answer: answer.answer
          });
        }
      }
      
      // Recalculer les résultats de la session
      await calculateSessionResults(session_id);
    }

    return NextResponse.json(newProfile);
  } catch (error) {
    console.error('Erreur lors de la création du profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500 }
    );
  }
}
