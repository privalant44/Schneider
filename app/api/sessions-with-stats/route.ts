import { NextResponse } from 'next/server';
import { getQuestionnaireSessions, getClients, getSessionResults } from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Récupérer toutes les sessions
    let sessions = getQuestionnaireSessions();
    
    // Filtrer par client si spécifié
    if (clientId) {
      sessions = sessions.filter(s => s.client_id === clientId);
    }
    
    // Filtrer par dates si spécifiées
    if (startDate) {
      sessions = sessions.filter(s => new Date(s.start_date) >= new Date(startDate));
    }
    
    if (endDate) {
      sessions = sessions.filter(s => new Date(s.start_date) <= new Date(endDate));
    }
    
    // Récupérer les clients pour avoir les noms
    const clients = getClients();
    const clientMap = clients.reduce((acc, client) => {
      acc[client.id] = client.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Enrichir les sessions avec les statistiques
    const sessionsWithStats = sessions.map(session => {
      const results = getSessionResults(session.id);
      const responseCount = results ? results.total_responses : 0;
      
      return {
        ...session,
        client_name: clientMap[session.client_id] || 'Client inconnu',
        response_count: responseCount,
        status: session.is_active ? 'Actif' : 'Inactif',
        start_date_formatted: new Date(session.start_date).toLocaleDateString('fr-FR'),
        end_date_formatted: session.end_date ? new Date(session.end_date).toLocaleDateString('fr-FR') : 'Non définie'
      };
    });
    
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
