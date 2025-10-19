import { NextResponse } from 'next/server';
import { compareSessions, getAllSessionResults } from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session1Id = searchParams.get('session1Id');
    const session2Id = searchParams.get('session2Id');
    
    if (session1Id && session2Id) {
      // Comparer deux sessions spécifiques
      const comparison = compareSessions(session1Id, session2Id);
      if (comparison) {
        return NextResponse.json(comparison);
      } else {
        return NextResponse.json(
          { error: 'Une ou plusieurs sessions non trouvées' },
          { status: 404 }
        );
      }
    } else {
      // Récupérer tous les résultats de sessions
      const results = getAllSessionResults();
      return NextResponse.json(results, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des comparaisons:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des comparaisons' },
      { status: 500 }
    );
  }
}
