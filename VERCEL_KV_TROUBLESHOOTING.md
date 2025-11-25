# 🔧 Dépannage : Base Redis créée mais variables manquantes

## Problème

Vous avez créé une base de données Redis (`schneider-auth`) mais l'application indique toujours :
> "Configuration manquante: Vercel KV non configuré"

## Solution : Vérifier et configurer les variables d'environnement

### Étape 1 : Vérifier si les variables existent

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Cherchez :
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Étape 2 : Si les variables n'existent PAS

**Option A : Lier la base de données à votre projet**

1. Allez dans l'onglet **Storage** de votre projet
2. Cliquez sur votre base de données `schneider-auth`
3. Vérifiez qu'elle est bien liée à votre projet
4. Si elle n'est pas liée, cliquez sur **Link Project** et sélectionnez votre projet

**Option B : Récupérer les variables depuis la base de données**

1. Allez dans l'onglet **Storage** de votre projet
2. Cliquez sur votre base de données `schneider-auth`
3. Dans les détails, vous devriez voir les variables d'environnement
4. Copiez les valeurs de :
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

5. Allez dans **Settings** → **Environment Variables**
6. Cliquez sur **Add New**
7. Ajoutez chaque variable :
   - **Name** : `KV_REST_API_URL`
   - **Value** : (collez la valeur copiée)
   - **Environments** : Cochez **Production**, **Preview**, et **Development**
   - Cliquez sur **Save**

8. Répétez pour `KV_REST_API_TOKEN`

### Étape 3 : Vérifier les environnements

⚠️ **IMPORTANT** : Assurez-vous que les variables sont disponibles dans **tous les environnements** :
- ✅ Production
- ✅ Preview
- ✅ Development

Si vous êtes en pré-production (preview), les variables doivent être disponibles pour l'environnement **Preview**.

### Étape 4 : Redéployer

Après avoir ajouté/configuré les variables :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Attendez la fin du déploiement

### Étape 5 : Vérifier

Une fois le déploiement terminé, testez :

```
https://votre-projet.vercel.app/api/kv/verify
```

Vous devriez voir `"success": true` si tout est correct.

## Si le problème persiste

1. **Vérifiez les logs Vercel** :
   - Allez dans **Deployments** → Cliquez sur le dernier déploiement → **Logs**
   - Cherchez les erreurs liées à KV

2. **Utilisez la route de diagnostic** :
   ```
   https://votre-projet.vercel.app/api/auth/diagnostic
   ```
   Cette route vous dira exactement quelles variables manquent.

3. **Vérifiez que la base est active** :
   - Allez dans **Storage** → Cliquez sur `schneider-auth`
   - Vérifiez que l'état est "Active" ou "Running"

## Note importante

Parfois, Vercel ne lie pas automatiquement la base de données au projet. Dans ce cas, vous devez :
1. Soit lier la base manuellement (Option A ci-dessus)
2. Soit ajouter les variables manuellement (Option B ci-dessus)

