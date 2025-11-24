# 🚀 Configuration Vercel KV pour l'authentification

## 📋 Vue d'ensemble

L'authentification utilise maintenant **Vercel KV** (via Upstash Redis) pour stocker les utilisateurs et les tokens de réinitialisation. Cela permet à l'authentification de fonctionner correctement sur Vercel où le système de fichiers est en lecture seule.

**Fonctionnalités** :
- ✅ Fonctionne sur Vercel (production)
- ✅ Fallback automatique vers fichiers JSON en développement local
- ✅ Aucune configuration nécessaire pour le développement local
- ✅ Migration transparente

## 🔧 Configuration sur Vercel

### 1. Créer une base de données Upstash Redis

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Storage**
4. Cliquez sur **Create Database**
5. Sélectionnez **Upstash Redis**
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

1. Créez la base de données Upstash Redis sur Vercel (voir ci-dessus)
2. Les données seront automatiquement migrées lors du premier accès
3. Ou créez un script de migration si nécessaire

## 💰 Pricing

**Upstash Redis (via Vercel)** :
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

Pour vérifier que tout fonctionne :

1. **En développement local** : Les utilisateurs sont stockés dans `data/users.json`
2. **Sur Vercel** : Les utilisateurs sont stockés dans Vercel KV (visible dans le dashboard Vercel → Storage)

## 🔗 Ressources

- [Vercel Storage Documentation](https://vercel.com/docs/storage)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [@vercel/kv Package](https://www.npmjs.com/package/@vercel/kv)
