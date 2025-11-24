# 🚀 Configuration des uploads sur Vercel

Sur Vercel, le système de fichiers est en **lecture seule** après le déploiement. Les fichiers uploadés dans `public/uploads` ne persistent pas et sont perdus à chaque redéploiement.

## ✅ Solution : Vercel Blob Storage

L'application utilise maintenant **Vercel Blob Storage** pour stocker les images en production sur Vercel.

## 📋 Étapes de configuration

### 1. Installer le package (si pas déjà fait)

```bash
npm install @vercel/blob
```

### 2. Créer un Blob Store sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **Create Database** ou **Create Store**
4. Sélectionnez **Blob**
5. Donnez un nom à votre store (ex: `schneider-uploads`)
6. Sélectionnez la région la plus proche
7. Cliquez sur **Create**

### 3. Récupérer le token

1. Dans votre Blob Store, allez dans l'onglet **Settings**
2. Copiez le **Read and Write Token** (commence par `vercel_blob_rw_...`)

### 4. Configurer la variable d'environnement

1. Dans votre projet Vercel, allez dans **Settings** → **Environment Variables**
2. Ajoutez une nouvelle variable :
   - **Name** : `BLOB_READ_WRITE_TOKEN`
   - **Value** : Le token que vous avez copié
   - **Environments** : Sélectionnez **Production**, **Preview**, et **Development** si nécessaire
3. Cliquez sur **Save**

### 5. Redéployer

Après avoir ajouté la variable d'environnement, Vercel redéploiera automatiquement votre application.

## 🔍 Vérification

Une fois configuré, les uploads d'images fonctionneront automatiquement sur Vercel. Les images seront stockées dans Vercel Blob Storage et accessibles via des URLs publiques.

## 🛠️ Développement local

En développement local (non-Vercel), l'application utilise toujours le système de fichiers local (`public/uploads`). Vous n'avez pas besoin de configurer Vercel Blob Storage pour le développement.

## ⚠️ Notes importantes

- Les fichiers uploadés sur Vercel Blob Storage sont **persistants** et ne seront pas perdus lors des redéploiements
- Vercel Blob Storage offre un **plan gratuit** généreux pour commencer
- Les URLs générées sont **publiques** par défaut (configuré avec `access: 'public'`)

## 🔗 Ressources

- [Documentation Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Pricing Vercel Blob](https://vercel.com/pricing)



