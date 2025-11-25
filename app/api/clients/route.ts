import { NextResponse } from 'next/server';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/json-database';

// Route publique - pas d'authentification requise pour la lecture
export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      }
    });
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Détails de l\'erreur:', {
      message: errorMessage,
      stack: errorStack,
      isKvAvailable: process.env.REDIS_URL || (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ? 'oui' : 'non',
      isVercel: process.env.VERCEL ? 'oui' : 'non'
    });
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du client',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
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
