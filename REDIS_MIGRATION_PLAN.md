# 📋 Plan de migration vers Redis/KV

## ✅ Données déjà migrées

Les données suivantes sont **déjà migrées** vers Redis/KV et fonctionnent sur Vercel :

1. ✅ **Utilisateurs admin** (`admin_users`) - Authentification
2. ✅ **Tokens de réinitialisation** (`password_reset_tokens`) - Authentification
3. ✅ **Questions** (`questions`) - Référentiel de questions
4. ✅ **Axes d'analyse par client** (`client_analysis_axes`) - Configuration clients
5. ✅ **Axes spécifiques par client** (`client_specific_axes`) - Axes personnalisés

## ⚠️ Données à migrer (critiques pour Vercel)

Sur Vercel, le système de fichiers est **en lecture seule**. Les données suivantes sont encore écrites dans des fichiers JSON et **ne seront pas sauvegardées** sur Vercel :

### 🔴 Priorité HAUTE (données créées/modifiées fréquemment)

1. **Réponses de session** (`session_responses`)
   - Créées à chaque soumission de questionnaire
   - **Impact** : Les réponses des utilisateurs ne seront pas sauvegardées
   - **Clé Redis** : `session_responses`

2. **Profils de répondants** (`respondent_profiles`)
   - Créés à chaque soumission de questionnaire
   - **Impact** : Les profils des répondants ne seront pas sauvegardés
   - **Clé Redis** : `respondent_profiles`

3. **Résultats de session** (`session_results`)
   - Calculés et mis à jour régulièrement
   - **Impact** : Les résultats ne seront pas sauvegardés
   - **Clé Redis** : `session_results`

### 🟡 Priorité MOYENNE (données créées/modifiées par les admins)

4. **Sessions de questionnaire** (`questionnaire_sessions`)
   - Créées/modifiées par les admins
   - **Impact** : Les sessions ne seront pas sauvegardées
   - **Clé Redis** : `questionnaire_sessions`

5. **Clients** (`clients`)
   - Créés/modifiés par les admins
   - **Impact** : Les clients ne seront pas sauvegardés
   - **Clé Redis** : `clients`

6. **Axes d'analyse** (`analysis_axes`)
   - Créés/modifiés par les admins
   - **Impact** : Les axes par défaut ne seront pas sauvegardés
   - **Clé Redis** : `analysis_axes`

7. **Paramètres** (`settings`)
   - Modifiés par les admins
   - **Impact** : Les paramètres ne seront pas sauvegardés
   - **Clé Redis** : `settings`

### 🟢 Priorité BASSE (données calculées)

8. **Analyses par domaine** (`domain_analysis`)
   - Calculées dynamiquement
   - **Impact** : Les analyses ne seront pas mises en cache
   - **Clé Redis** : `domain_analysis`

## 📊 Estimation de l'espace nécessaire

Avec le plan gratuit Vercel KV (256 Mo) :
- **Utilisateurs** : ~1-5 Ko (quelques admins)
- **Questions** : ~10-50 Ko (selon le nombre)
- **Réponses** : ~1-10 Ko par réponse
- **Sessions** : ~1-5 Ko par session
- **Clients** : ~1-2 Ko par client

**Total estimé** : 1-10 Mo pour une utilisation normale (largement dans les limites)

## 🚀 Plan de migration recommandé

### Phase 1 : Données critiques (À FAIRE EN PRIORITÉ)
1. Réponses de session (`session_responses`)
2. Profils de répondants (`respondent_profiles`)
3. Résultats de session (`session_results`)

### Phase 2 : Données administratives
4. Sessions de questionnaire (`questionnaire_sessions`)
5. Clients (`clients`)
6. Axes d'analyse (`analysis_axes`)
7. Paramètres (`settings`)

### Phase 3 : Cache et optimisations
8. Analyses par domaine (`domain_analysis`)

## 💡 Recommandation

**Pour l'instant**, les données critiques (réponses, profils, résultats) doivent être migrées en priorité car elles sont créées par les utilisateurs finaux et ne peuvent pas être perdues.

Les données administratives (clients, sessions, axes) peuvent attendre un peu car elles sont créées/modifiées moins fréquemment, mais elles doivent aussi être migrées pour que l'application fonctionne complètement sur Vercel.

## 🔧 Implémentation

Pour chaque type de données, il faut :
1. Créer des fonctions `readXxx()` et `writeXxx()` similaires à celles des questions
2. Utiliser les wrappers `kvGet()` et `kvSet()` existants
3. Mettre à jour `loadAllData()` pour charger depuis Redis
4. Mettre à jour `saveAllData()` pour sauvegarder dans Redis
5. Mettre à jour toutes les fonctions de modification pour être async et sauvegarder dans Redis


