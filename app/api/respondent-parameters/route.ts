import { NextResponse } from 'next/server';
import { 
  getRespondentParameters, 
  createRespondentParameter, 
  updateRespondentParameter, 
  deleteRespondentParameter 
} from '@/lib/json-database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    const parameters = getRespondentParameters(clientId || undefined);
    return NextResponse.json(parameters);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { client_id, name, type, options, required, order } = await request.json();
    
    if (!client_id || !name || !type || order === undefined) {
      return NextResponse.json(
        { error: 'client_id, name, type et order sont requis' },
        { status: 400 }
      );
    }
    
    const newParameter = createRespondentParameter({
      client_id,
      name,
      type,
      options,
      required: required !== undefined ? required : false,
      order
    });

    return NextResponse.json(newParameter);
  } catch (error) {
    console.error('Erreur lors de la création du paramètre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paramètre' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type, options, required, order } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID du paramètre est requis' },
        { status: 400 }
      );
    }
    
    const updatedParameter = updateRespondentParameter(id, {
      name,
      type,
      options,
      required,
      order
    });

    if (updatedParameter) {
      return NextResponse.json(updatedParameter);
    } else {
      return NextResponse.json(
        { error: 'Paramètre non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du paramètre' },
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
        { error: 'ID du paramètre requis' },
        { status: 400 }
      );
    }

    const success = deleteRespondentParameter(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Paramètre non trouvé' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du paramètre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du paramètre' },
      { status: 500 }
    );
  }
}
