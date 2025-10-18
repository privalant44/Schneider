# Questionnaire Schneider - Système Multi-Clients

Application de questionnaire de cartographie de culture d'entreprise pour Schneider avec support multi-clients et analyses avancées.

## 🚀 Fonctionnalités

### Gestion Multi-Clients
- **Création de clients** avec logos et descriptions personnalisées
- **Sessions de questionnaire** identifiées par date et client
- **URLs courtes** pour faciliter la distribution aux collaborateurs
- **Paramètres de répondants** configurables (division, domaine, âge, sexe, ancienneté, etc.)

### Questionnaire Avancé
- **4 typologies de culture** : Contrôle, Expertise, Collaboration, Cultivation
- **Questions randomisées** pour éviter les biais
- **Collecte d'informations détaillées** sur les répondants
- **Interface responsive** et intuitive

### Analyses et Comparaisons
- **Radar charts** pour visualiser la distribution des cultures
- **Comparaisons entre sessions** pour mesurer l'évolution
- **Analyses par segments** (division, âge, etc.)
- **Statistiques détaillées** par session et client

### Administration Complète
- **Gestion des questions** avec images personnalisées
- **Configuration des paramètres** de répondants
- **Suivi des sessions** et des réponses
- **Interface d'administration** intuitive

## 🏗️ Architecture

### Base de Données
- **Clients** : Informations sur les entreprises clientes
- **Sessions** : Instances de questionnaire avec dates et paramètres
- **Paramètres de répondants** : Configuration des informations à collecter
- **Profils de répondants** : Données personnelles des participants
- **Réponses** : Réponses aux questions avec liens vers les profils
- **Résultats** : Calculs et analyses par session

### APIs
- `/api/clients` - Gestion des clients
- `/api/sessions` - Gestion des sessions de questionnaire
- `/api/respondent-parameters` - Configuration des paramètres
- `/api/respondent-profiles` - Profils et réponses des participants
- `/api/session-comparisons` - Comparaisons entre sessions
- `/api/short-url` - Résolution des URLs courtes

### Pages
- `/` - Page d'accueil publique
- `/admin` - Interface d'administration principale
- `/admin/clients` - Gestion des clients et sessions
- `/admin/respondent-parameters` - Configuration des paramètres
- `/admin/analytics` - Analyses et comparaisons
- `/questionnaire/[shortUrl]` - Questionnaire avec paramètres de session

## 🛠️ Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes
- **Base de données en mémoire** - Pour le développement (remplaçable par une vraie DB)

## 📦 Installation

```bash
# Cloner le projet
git clone [repository-url]
cd schneider-questionnaire

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## 🎯 Utilisation

### 1. Configuration Initiale
1. Accédez à `/admin` pour l'interface d'administration
2. Configurez les **paramètres de répondants** (division, âge, etc.)
3. Créez vos **questions** avec images personnalisées

### 2. Gestion des Clients
1. Allez dans **Gestion des Clients**
2. Créez un nouveau client avec logo et description
3. Créez une **session de questionnaire** avec dates de début/fin
4. Copiez l'**URL courte** générée automatiquement

### 3. Distribution du Questionnaire
1. Partagez l'URL courte avec les collaborateurs
2. Les participants remplissent leurs informations personnelles
3. Ils répondent aux questions du questionnaire
4. Les réponses sont automatiquement liées à la session

### 4. Analyses et Comparaisons
1. Consultez les **Analyses et Comparaisons**
2. Visualisez les résultats par session avec radar charts
3. Comparez l'évolution entre différentes sessions
4. Analysez les réponses par segments de population

## 🔧 Configuration Avancée

### Paramètres de Répondants
- **Texte libre** : Pour des réponses ouvertes
- **Sélection unique** : Liste déroulante avec options prédéfinies
- **Sélection multiple** : Cases à cocher pour plusieurs choix
- **Ordre personnalisable** : Réorganisez l'ordre d'affichage
- **Paramètres requis/optionnels** : Contrôlez la collecte d'informations

### Sessions de Questionnaire
- **Dates de début/fin** : Contrôlez la période d'ouverture
- **Statut actif/inactif** : Activez/désactivez les sessions
- **URLs courtes uniques** : Générées automatiquement
- **Liens avec clients** : Organisation par entreprise

## 📊 Exemples d'Utilisation

### Cartographie d'Entreprise
1. Créez un client "Entreprise ABC"
2. Configurez des paramètres : Division, Ancienneté, Poste
3. Créez une session "Cartographie Q1 2024"
4. Distribuez l'URL courte aux 500 collaborateurs
5. Analysez les résultats par division et ancienneté

### Comparaison Temporelle
1. Créez une première session en janvier
2. Créez une deuxième session en juin
3. Comparez l'évolution des cultures
4. Identifiez les changements par segment

## 🚀 Déploiement

### Variables d'Environnement
```env
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### Base de Données de Production
Remplacez la base de données en mémoire par :
- PostgreSQL
- MySQL
- MongoDB
- Ou toute autre base de données de votre choix

## 📝 Notes de Développement

- La base de données actuelle est en mémoire (redémarre à chaque relance)
- Pour la production, implémentez une vraie base de données
- Les images sont stockées dans `/public/uploads/`
- Le système supporte plusieurs centaines de répondants par session

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.