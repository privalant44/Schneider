import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session requis' },
        { status: 400 }
      );
    }

    const { getSessionAnalysisAxes } = await import('@/lib/json-database');
    const axes = getSessionAnalysisAxes(sessionId);
    
    return NextResponse.json(axes);
  } catch (error) {
    console.error('Erreur lors de la récupération des axes de session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des axes de session' },
      { status: 500 }
    );
  }
}

