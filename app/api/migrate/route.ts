import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { migrateSessionsWithFrozenAxes } = await import('@/lib/json-database');
    
    // Exécuter la migration
    migrateSessionsWithFrozenAxes();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration des axes figés terminée' 
    });
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la migration' },
      { status: 500 }
    );
  }
}

