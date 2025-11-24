import { getUserByEmail } from '../lib/users';
import { verifyPassword, hashPassword } from '../lib/auth';

async function testLogin() {
  const email = 'philippe.rivalant@animaneo.fr';
  const password = 'AnimaNe@44';

  console.log('Test de connexion...');
  console.log('Email:', email);
  console.log('Password:', password);

  // Trouver l'utilisateur
  const user = await getUserByEmail(email);
  if (!user) {
    console.error('❌ Utilisateur non trouvé');
    return;
  }

  console.log('✅ Utilisateur trouvé:', user.email);
  console.log('Hash stocké:', user.passwordHash);

  // Vérifier le mot de passe
  const isValid = await verifyPassword(password, user.passwordHash);
  console.log('Vérification du mot de passe:', isValid ? '✅ VALIDE' : '❌ INVALIDE');

  if (!isValid) {
    console.log('\n⚠️ Le mot de passe ne correspond pas. Recréation du hash...');
    const newHash = await hashPassword(password);
    console.log('Nouveau hash:', newHash);
    console.log('Vérification avec le nouveau hash:', await verifyPassword(password, newHash));
  }
}

testLogin().catch(console.error);

