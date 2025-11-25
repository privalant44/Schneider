# 🚀 Guide de déploiement sur Vercel

## 📋 Prérequis

1. Un compte Vercel (gratuit) : [vercel.com](https://vercel.com)
2. Votre projet sur GitHub/GitLab/Bitbucket (recommandé) ou déploiement depuis votre machine

## 🚀 Méthode 1 : Déploiement depuis GitHub (Recommandé)

### Étape 1 : Pousser votre code sur GitHub

```bash
# Si ce n'est pas déjà fait
git add .
git commit -m "Préparation pour déploiement Vercel"
git push origin master
```

### Étape 2 : Importer le projet sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **Add New...** → **Project**
3. Importez votre repository GitHub
4. Vercel détectera automatiquement que c'est un projet Next.js

### Étape 3 : Configuration du projet

Vercel détectera automatiquement :
- **Framework Preset** : Next.js
- **Build Command** : `npm run build` (automatique)
- **Output Directory** : `.next` (automatique)
- **Install Command** : `npm install` (automatique)

Vous pouvez laisser les valeurs par défaut.

### Étape 4 : Variables d'environnement

Avant de déployer, ajoutez vos variables d'environnement :

1. Dans la section **Environment Variables**, ajoutez :
   - `NODE_ENV` = `production`
   - `OPENAI_API_KEY` = votre clé OpenAI (si vous utilisez ChatGPT)
   - `BLOB_READ_WRITE_TOKEN` = votre token Vercel Blob (voir VERCEL_SETUP.md)

2. Sélectionnez les environnements : **Production**, **Preview**, **Development**

### Étape 5 : Créer le Blob Store

**IMPORTANT** : Avant le premier déploiement, créez votre Blob Store :

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **Storage** → **Create Database**
3. Sélectionnez **Blob**
4. Donnez un nom (ex: `schneider-uploads`)
5. Copiez le **Read and Write Token**
6. Ajoutez-le comme variable d'environnement `BLOB_READ_WRITE_TOKEN`

### Étape 6 : Déployer

1. Cliquez sur **Deploy**
2. Vercel va :
   - Installer les dépendances
   - Builder votre application
   - Déployer sur leur infrastructure
3. Attendez la fin du déploiement (2-5 minutes)

### Étape 7 : Vérifier

Une fois déployé, vous obtiendrez une URL comme : `https://votre-projet.vercel.app`

Testez votre application et les uploads d'images !

## 🚀 Méthode 2 : Déploiement depuis la ligne de commande

### Installation de Vercel CLI

```bash
npm install -g vercel
```

### Connexion

```bash
vercel login
```

### Premier déploiement

```bash
# Dans le dossier de votre projet
vercel
```

Suivez les instructions :
- Link to existing project? → **No** (première fois)
- Project name? → Entrez un nom ou laissez le défaut
- Directory? → **./** (dossier actuel)
- Override settings? → **No**

### Ajouter les variables d'environnement

```bash
vercel env add NODE_ENV
# Entrez: production

vercel env add OPENAI_API_KEY
# Entrez votre clé OpenAI

vercel env add BLOB_READ_WRITE_TOKEN
# Entrez votre token Vercel Blob
```

### Déployer en production

```bash
vercel --prod
```

## 🔄 Mises à jour futures

### Avec GitHub (automatique)

À chaque `git push`, Vercel redéploiera automatiquement votre application !

### Avec CLI

```bash
vercel --prod
```

## 📝 Checklist avant déploiement

- [ ] Code commité et poussé sur GitHub
- [ ] Package `@vercel/blob` installé (`npm install`)
- [ ] Blob Store créé sur Vercel
- [ ] Variable `BLOB_READ_WRITE_TOKEN` configurée
- [ ] Variable `OPENAI_API_KEY` configurée (si nécessaire)
- [ ] Variable `NODE_ENV` = `production`
- [ ] Tests locaux réussis (`npm run build`)

## 🐛 Dépannage

### Erreur "BLOB_READ_WRITE_TOKEN manquant"

→ Vérifiez que vous avez créé le Blob Store et ajouté le token dans les variables d'environnement

### Les images ne s'affichent pas

→ Vérifiez que le Blob Store est bien configuré et que les URLs retournées sont accessibles

### Build échoue

→ Vérifiez les logs de build sur Vercel Dashboard pour voir l'erreur exacte

## 🔗 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js sur Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)






