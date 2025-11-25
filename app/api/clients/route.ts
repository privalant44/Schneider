import { NextResponse } from 'next/server';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/json-database';

export async function GET() {
  try {
    const clients = getClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, logo } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du client est requis' },
        { status: 400 }
      );
    }
    
    const newClient = await createClient({
      name,
      description,
      logo
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du client' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, logo } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID du client est requis' },
        { status: 400 }
      );
    }
    
    const updatedClient = await updateClient(id, {
      name,
      description,
      logo
    });

    if (updatedClient) {
      return NextResponse.json(updatedClient);
    } else {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du client' },
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
        { error: 'ID du client requis' },
        { status: 400 }
      );
    }

    const success = await deleteClient(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    );
  }
}
