import nodemailer from 'nodemailer';

// Configuration du transporteur email
function createTransporter() {
  // Si SMTP est configuré, l'utiliser
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true pour 465, false pour les autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // En développement, utiliser un transporteur de test (console)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test',
    },
    // En développement, on log juste dans la console
    logger: true,
    debug: true,
  });
}

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'Questionnaire Schneider';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const mailOptions = {
    from: process.env.SMTP_FROM || `"${appName}" <noreply@example.com>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
            </div>
            <div class="content">
              <h2>Réinitialisation de votre mot de passe</h2>
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte d'administration.</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ou copiez-collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
              <p class="warning">
                <strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>© ${new Date().getFullYear()} ${appName}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Réinitialisation de votre mot de passe

      Bonjour,

      Vous avez demandé à réinitialiser votre mot de passe pour votre compte d'administration.

      Cliquez sur le lien suivant pour créer un nouveau mot de passe :
      ${resetUrl}

      ⚠️ Important : Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    
    // En développement, afficher l'URL de prévisualisation si disponible
    if (process.env.NODE_ENV === 'development' && info.response?.includes('ethereal')) {
      console.log('Prévisualisation de l\'email:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}






