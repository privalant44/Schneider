import { NextResponse } from 'next/server';
import { 
  getQuestionnaireSessions, 
  getClients,
  getSessionResponses,
  getRespondentProfilesBySession,
  kvGet,
  isKvAvailable
} from '@/lib/json-database';

export const dynamic = "force-dynamic";

// Clés Redis
const QUESTIONNAIRE_SESSIONS_KEY = 'questionnaire_sessions';
const SESSION_RESPONSES_KEY = 'session_responses';
const RESPONDENT_PROFILES_KEY = 'respondent_profiles';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Recharger les données directement depuis Redis pour avoir les données les plus récentes
    const kvAvailable = isKvAvailable();
    
    let allSessions: any[] = [];
    let allResponses: any[] = [];
    let allProfiles: any[] = [];
    
    if (kvAvailable) {
      // Charger depuis Redis pour avoir les données les plus récentes
      try {
        allSessions = await kvGet<any[]>(QUESTIONNAIRE_SESSIONS_KEY) || [];
        allResponses = await kvGet<any[]>(SESSION_RESPONSES_KEY) || [];
        allProfiles = await kvGet<any[]>(RESPONDENT_PROFILES_KEY) || [];
      } catch (error) {
        console.error('Erreur lors du chargement depuis Redis, utilisation des données en mémoire:', error);
        // Fallback sur les données en mémoire
        allSessions = await getQuestionnaireSessions();
      }
    } else {
      // Utiliser les données en mémoire
      allSessions = await getQuestionnaireSessions();
    }
    
    // Filtrer les sessions
    let sessions = allSessions;
    if (clientId) {
      sessions = sessions.filter(s => s.client_id === clientId);
    }
    if (startDate) {
      sessions = sessions.filter(s => new Date(s.start_date) >= new Date(startDate));
    }
    if (endDate) {
      sessions = sessions.filter(s => new Date(s.start_date) <= new Date(endDate));
    }
    
    // Récupérer les clients pour avoir les noms
    const clients = await getClients();
    const clientMap = clients.reduce((acc, client) => {
      acc[client.id] = client.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Enrichir les sessions avec les statistiques calculées en temps réel
    const sessionsWithStats = await Promise.all(sessions.map(async (session) => {
      // Calculer les statistiques en temps réel depuis les données chargées
      const responses = kvAvailable && allResponses.length > 0
        ? allResponses.filter((r: any) => r.session_id === session.id)
        : await getSessionResponses(session.id);
      
      const profiles = kvAvailable && allProfiles.length > 0
        ? allProfiles.filter((p: any) => p.session_id === session.id)
        : await getRespondentProfilesBySession(session.id);
      
      // Le nombre de répondants est le nombre de profils uniques
      const respondentCount = profiles.length;
      
      // Le nombre total de réponses est le nombre total de réponses
      const responseCount = responses.length;
      
      return {
        ...session,
        client_name: clientMap[session.client_id] || 'Client inconnu',
        response_count: respondentCount, // Nombre de répondants (profils)
        total_responses: responseCount, // Nombre total de réponses
        status: session.is_active ? 'Actif' : 'Inactif',
        start_date_formatted: new Date(session.start_date).toLocaleDateString('fr-FR'),
        end_date_formatted: session.end_date ? new Date(session.end_date).toLocaleDateString('fr-FR') : 'Non définie'
      };
    }));
    
    // Trier par date de création décroissante
    sessionsWithStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return NextResponse.json(sessionsWithStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions avec stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    );
  }
}
