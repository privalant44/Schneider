# 🚀 Configuration Vercel KV pour l'authentification

## 📋 Vue d'ensemble

L'authentification utilise maintenant **Vercel KV** (via Redis) pour stocker les utilisateurs et les tokens de réinitialisation. Cela permet à l'authentification de fonctionner correctement sur Vercel où le système de fichiers est en lecture seule.

**Fonctionnalités** :
- ✅ Fonctionne sur Vercel (production)
- ✅ Fallback automatique vers fichiers JSON en développement local
- ✅ Aucune configuration nécessaire pour le développement local
- ✅ Migration transparente

## 🔧 Configuration sur Vercel

### 1. Créer une base de données Redis

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Storage**
4. Cliquez sur **Create Database**
5. Sélectionnez **Redis**
6. Donnez un nom à votre base de données (ex: `schneider-auth`)
7. Sélectionnez la région la plus proche
8. Cliquez sur **Create**

### 2. Variables d'environnement automatiques

Après la création, Vercel configure **automatiquement** ces variables d'environnement :
- `KV_REST_API_URL` - URL de l'API REST
- `KV_REST_API_TOKEN` - Token d'authentification

Ces variables sont automatiquement disponibles dans votre application déployée.

### 3. Redéployer

Après avoir créé la base de données, Vercel redéploie automatiquement votre application avec les nouvelles variables d'environnement.

## 💻 Développement local

**Aucune configuration nécessaire !** 

En développement local (sans variables `KV_REST_API_URL` et `KV_REST_API_TOKEN`), l'application utilise automatiquement les fichiers JSON dans le dossier `data/` :
- `data/users.json` - Utilisateurs
- `data/password-reset-tokens.json` - Tokens de réinitialisation

## 🔄 Migration des données existantes

Si vous avez déjà des utilisateurs dans `data/users.json` et que vous voulez les migrer vers Vercel KV :

1. Créez la base de données Redis sur Vercel (voir ci-dessus)
2. Les données seront automatiquement migrées lors du premier accès
3. Ou créez un script de migration si nécessaire

## 💰 Pricing

**Redis (via Vercel)** :
- **Plan gratuit** : 10 000 commandes/jour, 256 Mo de stockage
- Parfait pour l'authentification avec quelques utilisateurs admin
- Les utilisateurs et tokens occupent très peu d'espace (quelques Ko)

## 🔍 Comment ça fonctionne

Le code dans `lib/users.ts` détecte automatiquement si Vercel KV est disponible :

```typescript
// Si KV_REST_API_URL et KV_REST_API_TOKEN sont définis → utilise Vercel KV
// Sinon → utilise les fichiers JSON (développement local)
```

## ✅ Vérification

### Méthode 1 : Route API de vérification (Recommandé)

Une route API dédiée permet de vérifier rapidement que Vercel KV est correctement configuré :

1. **Déployez votre application sur Vercel** (ou utilisez un environnement de preview)
2. **Appelez la route de vérification** :
   ```
   https://votre-projet.vercel.app/api/kv/verify
   ```
   Ou depuis votre navigateur, ouvrez simplement cette URL.

3. **Vérifiez la réponse JSON** :
   - `success: true` → Vercel KV est correctement configuré ✅
   - `success: false` → Il y a un problème (détails dans `checks`)
   - La réponse inclut des tests de connexion, lecture, écriture et suppression

**Exemple de réponse réussie** :
```json
{
  "success": true,
  "environment": "Vercel (production)",
  "checks": [
    { "name": "Variables d'environnement", "status": "ok", "message": "..." },
    { "name": "Écriture dans KV", "status": "ok", "message": "..." },
    { "name": "Lecture depuis KV", "status": "ok", "message": "..." },
    { "name": "Suppression dans KV", "status": "ok", "message": "..." }
  ],
  "summary": { "total": 4, "ok": 4, "errors": 0 }
}
```

### Méthode 2 : Vérification dans le Dashboard Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Storage**
4. Vérifiez que votre base de données Redis est listée et active
5. Cliquez sur la base de données pour voir les statistiques (commandes, stockage)

### Méthode 3 : Vérification des variables d'environnement

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que ces variables sont présentes :
   - `KV_REST_API_URL` (commence par `https://`)
   - `KV_REST_API_TOKEN` (longue chaîne aléatoire)

⚠️ **Note** : Ces variables sont configurées automatiquement lors de la création de la base de données Redis. Si elles ne sont pas présentes, recréez la base de données.

### Méthode 4 : Test fonctionnel

1. **Essayez de vous connecter** avec un compte administrateur
2. Si la connexion fonctionne → Vercel KV est opérationnel ✅
3. Si vous obtenez une erreur → Vérifiez les logs Vercel et utilisez la route `/api/kv/verify`

### Méthode 5 : Logs Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Deployments**
4. Cliquez sur le dernier déploiement
5. Consultez les **Logs** pour voir si des erreurs liées à KV apparaissent

### Résumé des vérifications

- ✅ **En développement local** : Les utilisateurs sont stockés dans `data/users.json` (pas besoin de KV)
- ✅ **Sur Vercel** : Les utilisateurs sont stockés dans Vercel KV (visible dans le dashboard Vercel → Storage)
- ✅ **Route de vérification** : `/api/kv/verify` pour un diagnostic complet

## 🔗 Ressources

- [Vercel Storage Documentation](https://vercel.com/docs/storage)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [@vercel/kv Package](https://www.npmjs.com/package/@vercel/kv)
