import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '@/lib/users';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await getUserByEmail(email);
    
    // Pour des raisons de sécurité, on retourne toujours un succès
    // même si l'utilisateur n'existe pas (pour éviter l'énumération d'emails)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      });
    }

    // Créer le token de réinitialisation
    const resetToken = await createPasswordResetToken(user.id);

    // Envoyer l'email
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken.token}`;
    
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue quand même pour ne pas révéler que l'email existe
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}

