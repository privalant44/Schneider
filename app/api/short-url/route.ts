import { NextResponse } from 'next/server';
import { getQuestionnaireSessions } from '@/lib/json-database';

export const dynamic = "force-dynamic"

// Route publique - pas d'authentification requise
export async function GET(request: Request) {
  try {
    console.log('GET /api/short-url (PUBLIC - pas d\'auth requise)');
    const { searchParams } = new URL(request.url);
    const shortUrl = searchParams.get('shortUrl');
    
    if (!shortUrl) {
      return NextResponse.json(
        { error: 'shortUrl est requis' },
        { status: 400 }
      );
    }
    
    // Trouver la session par son URL courte
    const sessions = await getQuestionnaireSessions();
    const session = sessions.find((s: any) => s.short_url === shortUrl);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier que la session est active
    if (!session.is_active) {
      return NextResponse.json(
        { error: 'Cette session de questionnaire n\'est plus active' },
        { status: 403 }
      );
    }
    
    // Vérifier les dates
    const now = new Date();
    const startDate = new Date(session.start_date);
    const endDate = session.end_date ? new Date(session.end_date) : null;
    
    if (now < startDate) {
      return NextResponse.json(
        { error: 'Cette session de questionnaire n\'a pas encore commencé' },
        { status: 403 }
      );
    }
    
    if (endDate && now > endDate) {
      return NextResponse.json(
        { error: 'Cette session de questionnaire est terminée' },
        { status: 403 }
      );
    }
    
    // Session valide - retourner les informations
    return NextResponse.json({
      id: session.id,
      sessionId: session.id, // Pour compatibilité
      clientId: session.client_id,
      name: session.name,
      isActive: session.is_active,
      startDate: session.start_date,
      endDate: session.end_date,
      short_url: session.short_url // Inclure l'URL courte pour confirmation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL courte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'URL courte' },
      { status: 500 }
    );
  }
}
