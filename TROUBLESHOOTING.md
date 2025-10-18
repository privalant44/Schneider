# Guide de Dépannage - Questionnaire Schneider

## 🚨 Problème : "Erreur lors de la transmission du questionnaire"

### Symptômes
- L'utilisateur voit une erreur lors de la soumission du questionnaire
- Le questionnaire ne se soumet pas correctement
- Erreurs dans la console du navigateur

### Solutions

#### 1. Vérifier l'URL utilisée
**Problème** : Utilisation de l'ancienne URL `/questionnaire`
**Solution** : Utiliser l'URL courte fournie par l'organisation

```
❌ Ancienne URL (ne fonctionne plus) :
https://votre-site.com/questionnaire

✅ Nouvelle URL (fonctionne) :
https://votre-site.com/questionnaire/[code-court]
```

#### 2. Tester les APIs
1. Allez sur `https://votre-site.com/test-api`
2. Cliquez sur "Diagnostic DB" pour vérifier l'état de la base de données
3. Cliquez sur "Test API Questions" pour vérifier que les questions se chargent
4. Cliquez sur "Test API Responses" pour tester l'envoi de réponses

#### 3. Vérifier la console du navigateur
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Console"
3. Recherchez les erreurs en rouge
4. Copiez les messages d'erreur pour le diagnostic

#### 4. Redémarrer le serveur
Si le problème persiste :
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

## 🔧 Diagnostic Avancé

### Vérifier l'état de la base de données
1. Allez sur `https://votre-site.com/test-api`
2. Cliquez sur "Diagnostic DB"
3. Vérifiez que :
   - `questions` > 0 (au moins 1 question)
   - `nextId` est correct
   - Aucune erreur dans la réponse

### Tester les APIs individuellement
1. **Test API Questions** : Doit retourner un tableau de questions
2. **Test API Responses** : Doit créer une session et sauvegarder des réponses
3. **Test API Results** : Doit calculer et retourner les résultats

### Vérifier les logs du serveur
Dans le terminal où le serveur tourne, recherchez :
- Erreurs en rouge
- Messages d'erreur lors des requêtes API
- Problèmes de base de données

## 📋 Checklist de Dépannage

### Pour les Utilisateurs
- [ ] Utilisez l'URL courte fournie par votre organisation
- [ ] Vérifiez que la session est active (dates de début/fin)
- [ ] Remplissez tous les champs requis
- [ ] Vérifiez votre connexion internet

### Pour les Administrateurs
- [ ] Vérifiez que les questions sont configurées
- [ ] Vérifiez que la session est active
- [ ] Testez les APIs via `/test-api`
- [ ] Vérifiez les logs du serveur

## 🆘 Solutions Rapides

### Problème : "Session non trouvée"
**Cause** : URL courte incorrecte ou session expirée
**Solution** : Vérifier l'URL et les dates de la session

### Problème : "Aucune question disponible"
**Cause** : Questions non configurées
**Solution** : Aller dans `/admin` et configurer les questions

### Problème : "Erreur 500"
**Cause** : Problème serveur
**Solution** : Redémarrer le serveur et vérifier les logs

### Problème : "Erreur lors de la sauvegarde"
**Cause** : Problème de base de données
**Solution** : Vérifier le diagnostic DB et redémarrer

## 📞 Support

Si le problème persiste :
1. Copiez le message d'erreur exact
2. Notez les étapes pour reproduire le problème
3. Incluez les informations du diagnostic DB
4. Contactez l'équipe de support

## 🔄 Migration de l'Ancien Système

### Changements Majeurs
- **Ancien système** : `/questionnaire` (ne fonctionne plus)
- **Nouveau système** : `/questionnaire/[code-court]`
- **Nouvelle fonctionnalité** : Collecte d'informations sur les répondants
- **Nouvelle fonctionnalité** : Gestion multi-clients et sessions

### Pour les Administrateurs
1. Créez un client dans `/admin/clients`
2. Créez une session de questionnaire
3. Copiez l'URL courte générée
4. Partagez l'URL avec les participants

### Pour les Utilisateurs
1. Utilisez l'URL courte fournie
2. Remplissez vos informations personnelles
3. Répondez aux questions
4. Consultez vos résultats
