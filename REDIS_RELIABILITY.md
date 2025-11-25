# Système Redis Fiable - Guide de Production

## Architecture

### Source de Vérité Unique : Redis
- **Redis est la source de vérité unique** en production (Vercel)
- La mémoire est uniquement un **cache temporaire**
- Toutes les lectures passent **toujours par Redis d'abord**
- Les écritures sont **toujours synchronisées avec Redis**

### Gestionnaire Redis Robuste (`lib/redis-manager.ts`)

Le gestionnaire Redis inclut :
- ✅ **Retry automatique** (3 tentatives avec délai progressif)
- ✅ **Gestion d'erreurs** avec logs détaillés
- ✅ **Reconnexion automatique** en cas de perte de connexion
- ✅ **Support de deux formats** : `REDIS_URL` (ioredis) ou `KV_REST_API_URL`/`KV_REST_API_TOKEN` (Vercel KV REST API)

## Routes de Diagnostic

### 1. Route de Santé (`/api/health`)

Vérifie l'état complet du système :
- Disponibilité Redis/KV
- Santé de la connexion Redis
- Variables d'environnement
- Présence des données dans Redis

**Utilisation :**
```bash
GET /api/health
```

**Réponse :**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "checks": {
    "redis_available": { "status": "passed", ... },
    "redis_health": { "status": "passed", ... },
    "data_in_redis": { "status": "passed", ... }
  },
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0,
    "warnings": 0
  }
}
```

### 2. Vérification Redis (`/api/database/verify-redis`)

Vérifie que toutes les données proviennent de Redis :
- Liste toutes les clés de données
- Vérifie leur présence dans Redis
- Affiche le nombre d'éléments par type

**Utilisation :**
```bash
GET /api/database/verify-redis
```

### 3. Diagnostic Sessions (`/api/database/check-sessions`)

Compare les sessions dans Redis vs mémoire :
- Nombre de sessions dans Redis
- Nombre de sessions en mémoire
- Affiche les sessions pour comparaison

**Utilisation :**
```bash
GET /api/database/check-sessions
```

## Stratégie de Fiabilité

### 1. Lectures
- **Toujours recharger depuis Redis** avant chaque lecture
- Les fonctions `reload*IfNeeded()` sont appelées automatiquement
- En cas d'erreur, log détaillé mais fallback sur mémoire (pour éviter panne totale)

### 2. Écritures
- **Toujours sauvegarder dans Redis** immédiatement
- Retry automatique en cas d'échec
- Rollback en mémoire si la sauvegarde échoue
- Logs détaillés pour chaque opération

### 3. Gestion d'Erreurs
- **En production (Vercel)** : Logs d'erreur critiques mais fallback pour éviter panne totale
- **En local** : Fallback sur fichiers JSON si Redis non disponible
- **Retry automatique** : 3 tentatives avec délai progressif

## Logs de Diagnostic

Tous les logs incluent des emojis pour faciliter le diagnostic :
- ✅ Succès
- ❌ Erreur
- ⚠️ Avertissement
- 🔄 Retry

**Exemples de logs :**
```
✅ Sessions rechargées depuis Redis: 5 session(s)
✅ Client créé et sauvegardé dans Redis: client_xxx - Nom du client
❌ Erreur lors de la lecture de clients depuis Redis: ECONNREFUSED
⚠️ CRITIQUE: Impossible de charger les sessions depuis Redis en production
```

## Vérification en Production

### Étape 1 : Vérifier la santé du système
```bash
curl https://votre-domaine.vercel.app/api/health
```

### Étape 2 : Vérifier que les données sont dans Redis
```bash
curl https://votre-domaine.vercel.app/api/database/verify-redis
```

### Étape 3 : Vérifier les sessions spécifiquement
```bash
curl https://votre-domaine.vercel.app/api/database/check-sessions
```

## Problèmes Courants et Solutions

### Problème : "Aucune session trouvée"
**Diagnostic :**
1. Vérifier `/api/health` - Redis est-il disponible ?
2. Vérifier `/api/database/check-sessions` - Les sessions sont-elles dans Redis ?
3. Vérifier les logs Vercel pour les erreurs de connexion Redis

**Solution :**
- Vérifier que `REDIS_URL` est configuré dans Vercel Dashboard
- Vérifier que la connexion Redis fonctionne (test avec `/api/health`)
- Recréer les sessions si nécessaire

### Problème : "Données non persistées"
**Diagnostic :**
1. Vérifier `/api/database/verify-redis` - Les données sont-elles dans Redis ?
2. Vérifier les logs lors de la création - Y a-t-il des erreurs de sauvegarde ?

**Solution :**
- Vérifier que les fonctions de création utilisent bien `await` avec les fonctions async
- Vérifier les logs pour les erreurs de sauvegarde Redis
- S'assurer que Redis est accessible (pas de timeout)

### Problème : "Données incohérentes"
**Diagnostic :**
1. Vérifier `/api/database/check-sessions` - Y a-t-il une différence entre Redis et mémoire ?
2. Vérifier les logs - Les fonctions `reload*IfNeeded()` sont-elles appelées ?

**Solution :**
- Les fonctions de rechargement sont appelées automatiquement
- Si problème persiste, forcer un rechargement en appelant directement depuis Redis

## Bonnes Pratiques

1. **Toujours vérifier `/api/health`** après un déploiement
2. **Surveiller les logs Vercel** pour les erreurs Redis
3. **Utiliser les routes de diagnostic** en cas de problème
4. **Ne jamais modifier directement les données en mémoire** sans sauvegarder dans Redis
5. **Tester la création de données** après chaque déploiement

## Configuration Requise

### Variables d'Environnement

**Option 1 : REDIS_URL (Recommandé pour Redis Labs)**
```
REDIS_URL=redis://default:password@host:port
```

**Option 2 : Vercel KV REST API**
```
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### Vérification de la Configuration

```bash
# Vérifier que Redis est configuré
curl https://votre-domaine.vercel.app/api/health

# Vérifier que les données sont accessibles
curl https://votre-domaine.vercel.app/api/database/verify-redis
```

## Support

En cas de problème :
1. Consulter `/api/health` pour l'état général
2. Consulter `/api/database/verify-redis` pour l'état des données
3. Consulter les logs Vercel pour les erreurs détaillées
4. Utiliser `/api/database/check-sessions` pour diagnostiquer les sessions


