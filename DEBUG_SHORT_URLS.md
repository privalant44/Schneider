# Dépannage des URLs Courtes - "Session non trouvée ou expirée"

## 🚨 Problème : "Session non trouvée ou expirée"

### Symptômes
- L'utilisateur voit "Session non trouvée ou expirée" avec une URL courte valide
- L'URL courte semble correcte mais ne fonctionne pas
- La session est active dans l'administration

### 🔍 Diagnostic Étape par Étape

#### 1. Vérifier l'état du serveur
```bash
# Démarrer le serveur
npm run dev
```

#### 2. Tester les APIs de base
1. Allez sur `http://localhost:3000/test-api`
2. Cliquez sur "Diagnostic DB"
3. Vérifiez que :
   - `questionnaireSessions` > 0
   - `shortUrlDiagnostics` montre des sessions avec URLs courtes

#### 3. Tester spécifiquement les URLs courtes
1. Allez sur `http://localhost:3000/test-short-url`
2. Cliquez sur "Lister toutes les sessions"
3. Vérifiez que les sessions ont des `short_url` valides
4. Copiez une URL courte et testez-la

#### 4. Créer une session de test
1. Sur la page de test, cliquez sur "Créer session de test"
2. Copiez l'URL courte générée
3. Testez cette URL courte

### 🛠️ Solutions

#### Solution 1 : Vérifier la base de données
```javascript
// Dans la console du navigateur (F12)
fetch('/api/debug')
  .then(res => res.json())
  .then(data => console.log(data.shortUrlDiagnostics));
```

#### Solution 2 : Redémarrer le serveur
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

#### Solution 3 : Recréer la session
1. Allez dans `/admin/clients`
2. Supprimez l'ancienne session
3. Créez une nouvelle session
4. Copiez la nouvelle URL courte

#### Solution 4 : Vérifier l'URL complète
L'URL doit être au format :
```
http://localhost:3000/questionnaire/[code-court]
```

Exemple :
```
http://localhost:3000/questionnaire/abc12345
```

### 🔧 Diagnostic Avancé

#### Vérifier l'API short-url directement
```bash
# Dans le terminal ou via Postman
curl "http://localhost:3000/api/short-url?shortUrl=abc12345"
```

#### Vérifier les logs du serveur
Dans le terminal où le serveur tourne, recherchez :
- Erreurs lors de l'appel à `/api/short-url`
- Problèmes de base de données
- Erreurs de parsing JSON

#### Vérifier la console du navigateur
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Console"
3. Recherchez les erreurs en rouge
4. Allez dans l'onglet "Network" pour voir les requêtes API

### 📋 Checklist de Vérification

#### Pour l'Administrateur
- [ ] Le serveur est démarré (`npm run dev`)
- [ ] Les questions sont configurées
- [ ] Un client est créé
- [ ] Une session est créée et active
- [ ] L'URL courte est générée
- [ ] Les dates de début/fin sont correctes

#### Pour l'Utilisateur
- [ ] L'URL complète est correcte
- [ ] La session n'est pas expirée
- [ ] La connexion internet fonctionne
- [ ] Le navigateur n'a pas de cache problématique

### 🆘 Solutions Rapides

#### Problème : "Session non trouvée"
**Cause** : URL courte incorrecte ou session supprimée
**Solution** : Vérifier l'URL et recréer la session si nécessaire

#### Problème : "Session expirée"
**Cause** : Dates de début/fin incorrectes
**Solution** : Modifier les dates dans l'administration

#### Problème : "Erreur 500"
**Cause** : Problème serveur ou base de données
**Solution** : Redémarrer le serveur et vérifier les logs

#### Problème : "Erreur de réseau"
**Cause** : Serveur arrêté ou problème de connexion
**Solution** : Vérifier que le serveur tourne sur le bon port

### 📞 Support

Si le problème persiste :
1. Copiez le résultat du diagnostic DB
2. Copiez l'URL courte qui ne fonctionne pas
3. Incluez les messages d'erreur de la console
4. Notez les étapes pour reproduire le problème

### 🔄 Test de Validation

Pour valider que tout fonctionne :
1. Créez une session de test
2. Copiez l'URL courte
3. Ouvrez l'URL dans un navigateur privé
4. Vérifiez que le questionnaire se charge
5. Testez la soumission d'une réponse
