# 📊 Questionnaire Schneider - Application d'Analyse de Culture d'Entreprise

Une application Next.js moderne pour la gestion et l'analyse de questionnaires de culture d'entreprise avec visualisation radar interactive.

## 🚀 Fonctionnalités

- **Gestion des questionnaires** : Création et administration des questions par domaine
- **Sessions de collecte** : Gestion des sessions de questionnaire avec URLs courtes
- **Analyse radar** : Visualisation interactive des résultats avec points par domaine
- **Interface d'administration** : Panel complet pour la gestion des données
- **API REST** : Endpoints complets pour toutes les opérations
- **Sécurité** : Validation des données et gestion d'erreurs robuste

## 🛠️ Technologies

- **Frontend** : Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend** : API Routes Next.js, JSON Database
- **Visualisation** : SVG Radar Chart personnalisé
- **Outils** : ESLint, TypeScript, Lucide React

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn

## 🚀 Installation et Démarrage

### Développement Local

```bash
# Cloner le repository
git clone <repository-url>
cd questionnaire-schneider

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de l'application
npm run start            # Serveur de build local
npm run lint             # Vérification ESLint
npm run lint:fix         # Correction automatique ESLint
npm run type-check       # Vérification TypeScript
npm run health           # Vérification de santé de l'application

# Maintenance
npm run clean            # Nettoyage des caches
npm run clean:all        # Nettoyage complet et réinstallation
```

## 📁 Structure du Projet

```
├── app/                    # Pages et API Routes Next.js
│   ├── admin/             # Interface d'administration
│   ├── api/               # Endpoints API
│   ├── components/        # Composants React réutilisables
│   ├── questionnaire/     # Pages de questionnaire
│   └── resultats/         # Pages de résultats
├── lib/                   # Logique métier et utilitaires
│   ├── utils/             # Utilitaires (validation, logging, erreurs)
│   ├── database.ts        # Interface base de données
│   ├── json-database.ts   # Implémentation JSON
│   └── types.ts           # Types TypeScript
├── data/                  # Base de données JSON
├── public/                # Assets statiques
└── next.config.js         # Configuration Next.js
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` :

```env
NODE_ENV=development
PORT=3000
NEXT_TELEMETRY_DISABLED=1
```

## 📊 API Endpoints

### Sessions
- `GET /api/sessions` - Liste des sessions
- `POST /api/sessions` - Créer une session
- `GET /api/sessions/[id]` - Détails d'une session
- `PUT /api/sessions/[id]` - Modifier une session

### Questions
- `GET /api/questions` - Liste des questions
- `POST /api/questions` - Créer une question
- `PUT /api/questions/[id]` - Modifier une question

### Résultats
- `GET /api/results` - Résultats de session
- `GET /api/domain-analysis` - Analyse par domaine

### Santé
- `GET /api/health` - Statut de l'application

## 🔒 Sécurité

- Validation des données d'entrée
- Headers de sécurité HTTP
- Gestion d'erreurs centralisée
- Logging des actions utilisateur
- Protection contre les attaques courantes

## 📈 Monitoring

L'endpoint `/api/health` fournit :
- Statut de l'application
- Utilisation mémoire
- Santé de la base de données
- Santé du système de fichiers
- Temps de fonctionnement

### Sauvegarde des Données

Les données sont stockées dans le dossier `./data`. Pour sauvegarder :

```bash
# Sauvegarde
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restauration
tar -xzf backup-YYYYMMDD.tar.gz
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence propriétaire Schneider Electric.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024-01-20