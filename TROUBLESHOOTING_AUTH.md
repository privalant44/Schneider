# 🔧 Dépannage de l'authentification sur Vercel

## Erreur "erreur lors de la connexion" en pré-production

### 🔍 Diagnostic rapide

**Avant tout, utilisez la route de diagnostic pour identifier le problème :**

1. Ouvrez dans votre navigateur :
   ```
   https://votre-projet.vercel.app/api/auth/diagnostic
   ```
2. La réponse JSON vous indiquera :
   - ✅ Si Vercel KV est configuré
   - ✅ Si la connexion à KV fonctionne
   - ✅ Si des utilisateurs existent dans KV
   - ✅ Si le super-admin est initialisé
   - ❌ Les erreurs spécifiques et comment les résoudre

Cette route vous donnera des recommandations précises pour résoudre le problème.

### Cause probable

Cette erreur survient généralement lorsque :
1. **Vercel KV n'est pas configuré** sur votre projet Vercel
2. **Le super-admin n'a pas été initialisé** dans Vercel KV
3. **Une erreur de connexion** à Vercel KV se produit

Sur Vercel, le système de fichiers est en lecture seule, donc l'application ne peut pas utiliser les fichiers JSON pour stocker les utilisateurs.

### Solution : Configurer Vercel KV

#### Étape 1 : Créer une base de données Redis

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Storage**
4. Cliquez sur **Create Database**
5. Sélectionnez **Redis**
6. Donnez un nom à votre base de données (ex: `schneider-auth`)
7. Sélectionnez la région la plus proche
8. Cliquez sur **Create**

#### Étape 2 : Vérifier les variables d'environnement

Après la création, Vercel configure **automatiquement** ces variables :
- `KV_REST_API_URL` - URL de l'API REST
- `KV_REST_API_TOKEN` - Token d'authentification

Ces variables sont automatiquement disponibles dans votre application déployée.

#### Étape 3 : Initialiser le super-administrateur

Après avoir créé Vercel KV, vous devez initialiser le compte super-administrateur :

**Option A : Via un script d'initialisation (recommandé)**

1. Créez un fichier temporaire `scripts/init-kv-admin.ts` :

```typescript
import { initializeSuperAdmin } from '../lib/users';

async function main() {
  try {
    await initializeSuperAdmin();
    console.log('✅ Super-administrateur initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
```

2. Exécutez-le localement avec les variables d'environnement Vercel :

```bash
# Récupérez les variables depuis Vercel Dashboard → Settings → Environment Variables
export KV_REST_API_URL="votre_url"
export KV_REST_API_TOKEN="votre_token"

npm run ts-node scripts/init-kv-admin.ts
```

**Option B : Via une route API temporaire**

Créez une route API temporaire `app/api/admin/init/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { initializeSuperAdmin } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeSuperAdmin();
    return NextResponse.json({ success: true, message: 'Super-admin initialisé' });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
```

Appelez cette route une fois depuis votre navigateur, puis supprimez-la.

#### Étape 4 : Redéployer

Après avoir créé Vercel KV et initialisé le super-admin, Vercel redéploiera automatiquement votre application.

### Vérification

1. **Utilisez la route de diagnostic** : `/api/auth/diagnostic` pour un diagnostic complet
2. **Utilisez la route de vérification KV** : `/api/kv/verify` pour tester la connexion KV
3. Vérifiez les logs Vercel pour confirmer que les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN` sont présentes
4. Essayez de vous connecter avec :
   - Email : `philippe.rivalant@animaneo.fr`
   - Mot de passe : `AnimaNe@44`

### Routes de diagnostic disponibles

- **`/api/auth/diagnostic`** : Diagnostic complet de l'authentification (KV, utilisateurs, super-admin)
- **`/api/kv/verify`** : Vérification de la connexion Vercel KV
- **`/api/admin/init`** : Initialisation du super-admin (à supprimer après utilisation)

### Messages d'erreur améliorés

Le code a été amélioré pour afficher un message d'erreur clair si Vercel KV n'est pas configuré :

```
Configuration manquante: Vercel KV non configuré. Veuillez créer une base de données Redis dans Vercel Dashboard → Storage.
```

### Documentation complète

Consultez `VERCEL_KV_SETUP.md` pour plus de détails sur la configuration de Vercel KV.

