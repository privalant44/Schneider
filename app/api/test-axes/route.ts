import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test simple pour vérifier si le module se charge
    const { getAnalysisAxes } = await import('@/lib/json-database');
    const axes = getAnalysisAxes();
    return NextResponse.json({ 
      success: true, 
      count: axes.length,
      axes: axes.slice(0, 2) // Juste les 2 premiers pour le test
    });
  } catch (error) {
    console.error('Erreur de test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
