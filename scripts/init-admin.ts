import { initializeSuperAdmin } from '../lib/users';

// Script d'initialisation du super-admin
async function main() {
  try {
    await initializeSuperAdmin();
    console.log('✅ Super-admin initialisé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

main();






