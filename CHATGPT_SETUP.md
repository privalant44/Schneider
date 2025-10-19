# Configuration ChatGPT pour Analyses Comparatives

## 🚀 Configuration Requise

### 1. Clé API OpenAI

1. **Créez un compte** sur [OpenAI Platform](https://platform.openai.com/)
2. **Générez une clé API** dans la section "API Keys"
3. **Ajoutez la clé** dans votre fichier `.env.local` :

```bash
# .env.local
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4
```

### 2. Modèles Disponibles

- **gpt-4** : Plus précis, plus cher (recommandé)
- **gpt-3.5-turbo** : Plus rapide, moins cher
- **gpt-4-turbo** : Équilibre entre performance et coût

### 3. Coûts Estimés

- **GPT-4** : ~$0.03 par analyse (2000 tokens)
- **GPT-3.5-turbo** : ~$0.002 par analyse (2000 tokens)

## 🎯 Types d'Analyses Disponibles

### 1. Analyse Comparative
- Évolution générale de la culture
- Points forts et faiblesses
- Recommandations d'amélioration
- Actions prioritaires

### 2. Analyse des Tendances
- Changements majeurs observés
- Causes probables des évolutions
- Impact organisationnel
- Prédictions futures

### 3. Recommandations Stratégiques
- Diagnostic de l'état actuel
- Objectifs culturels
- Plan d'action concret
- Métriques de suivi

## 🔧 Utilisation

1. **Accédez** à `/admin/analytics/comparison`
2. **Sélectionnez** deux sessions à comparer
3. **Choisissez** le type d'analyse
4. **Lancez** l'analyse IA
5. **Exportez** les résultats en Markdown

## 🛡️ Sécurité

- La clé API est stockée côté serveur uniquement
- Aucune donnée n'est partagée avec des tiers
- Les analyses sont générées en temps réel
- Aucun stockage permanent des requêtes

## 🚨 Dépannage

### Erreur "Clé API manquante"
- Vérifiez que `.env.local` existe
- Vérifiez que `OPENAI_API_KEY` est défini
- Redémarrez le serveur de développement

### Erreur "Quota dépassé"
- Vérifiez votre crédit OpenAI
- Passez à un modèle moins cher (gpt-3.5-turbo)
- Attendez le renouvellement mensuel

### Erreur "Modèle non disponible"
- Vérifiez que votre compte a accès au modèle
- Utilisez `gpt-3.5-turbo` comme alternative
