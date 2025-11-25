import { NextResponse } from 'next/server';
import { getSettings, setSetting } from '@/lib/json-database';

// Route publique - pas d'authentification requise pour la lecture
export async function GET() {
  try {
    const settings = getSettings();
    
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObj, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { key, value } = await request.json();
    
    await setSetting(key, value);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}
