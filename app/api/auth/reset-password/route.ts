import { NextRequest, NextResponse } from 'next/server';
import { getValidResetToken, markTokenAsUsed, updateUserPassword, getUserById } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Vérifier le token
    const resetToken = await getValidResetToken(token);
    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await getUserById(resetToken.user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le mot de passe
    await updateUserPassword(resetToken.user_id, newPassword);

    // Marquer le token comme utilisé
    await markTokenAsUsed(resetToken.id);

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}

