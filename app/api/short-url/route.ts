import { NextResponse } from 'next/server';
import { getQuestionnaireSessions } from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shortUrl = searchParams.get('shortUrl');
    
    if (!shortUrl) {
      return NextResponse.json(
        { error: 'shortUrl est requis' },
        { status: 400 }
      );
    }
    
    // Trouver la session par son URL courte
    const sessions = getQuestionnaireSessions();
    const session = sessions.find((s: any) => s.short_url === shortUrl);
    
    if (session) {
      return NextResponse.json({
        id: session.id,
        sessionId: session.id, // Pour compatibilité
        clientId: session.client_id,
        name: session.name,
        isActive: session.is_active,
        startDate: session.start_date,
        endDate: session.end_date
      });
    } else {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL courte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'URL courte' },
      { status: 500 }
    );
  }
}
