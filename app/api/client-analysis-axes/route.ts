import { NextResponse } from 'next/server';
import type { ClientSpecificAxis } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }

    const { getClientSpecificAxes } = await import('@/lib/json-database');
    const clientAxes = await getClientSpecificAxes(clientId);
    
    return NextResponse.json(clientAxes);
  } catch (error) {
    console.error('Erreur lors de la récupération des axes client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des axes client' },
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
      category,
      client_id
    } = await request.json();
    
    if (!client_id) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }
    
    const { addClientAnalysisAxis } = await import('@/lib/json-database');
    const newAxis: ClientSpecificAxis = await addClientAnalysisAxis({
      name,
      type,
      options,
      required,
      order,
      category,
      client_id
    });

    return NextResponse.json({ id: newAxis.id });
  } catch (error) {
    console.error('Erreur lors de la création de l\'axe client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'axe client' },
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
      category,
      client_id
    } = await request.json();
    
    if (!client_id) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }
    
    const { updateClientAnalysisAxis } = await import('@/lib/json-database');
    const updatedAxis = await updateClientAnalysisAxis(id, {
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
        { error: 'Axe client non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'axe client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'axe client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');
    
    if (!id || !clientId) {
      return NextResponse.json(
        { error: 'ID d\'axe et ID client requis' },
        { status: 400 }
      );
    }

    const { deleteClientAnalysisAxis } = await import('@/lib/json-database');
    const success = await deleteClientAnalysisAxis(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Axe client non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'axe client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'axe client' },
      { status: 500 }
    );
  }
}

