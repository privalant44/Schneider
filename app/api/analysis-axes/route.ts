import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getAnalysisAxes } = await import('@/lib/json-database');
    const axes = getAnalysisAxes();
    return NextResponse.json(axes);
  } catch (error) {
    console.error('Erreur lors de la récupération des axes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des axes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      name, 
      type, 
      options, 
      required, 
      order, 
      category 
    } = await request.json();
    
    const newAxis = addAnalysisAxis({
      name,
      type,
      options,
      required,
      order,
      category
    });

    return NextResponse.json({ id: newAxis.id });
  } catch (error) {
    console.error('Erreur lors de la création de l\'axe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'axe' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { 
      id, 
      name, 
      type, 
      options, 
      required, 
      order, 
      category 
    } = await request.json();
    
    const updatedAxis = updateAnalysisAxis(id, {
      name,
      type,
      options,
      required,
      order,
      category
    });

    if (updatedAxis) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Axe non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'axe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'axe' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID d\'axe requis' },
        { status: 400 }
      );
    }

    const success = deleteAnalysisAxis(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Axe non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'axe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'axe' },
      { status: 500 }
    );
  }
}
