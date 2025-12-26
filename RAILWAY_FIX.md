# 🔧 Fix Railway Database Connection

## Problème Identifié

Les variables d'environnement Railway utilisent des références `${{VARIABLE}}` qui ne sont pas résolues automatiquement pour votre service backend.

## ✅ Solution

### Étape 1: Vérifier la Structure du Projet

Dans votre dashboard Railway, vous devez avoir:
- **Service 1**: Votre backend (InvestPro Backend)
- **Service 2**: PostgreSQL Database

### Étape 2: Variables du Service Backend

Aller dans **votre service Backend** > **Variables** et ajouter:

#### Option A: Référence Automatique (Recommandé)

Si les deux services sont dans le même projet Railway:

```bash
# Spring Boot profile
SPRING_PROFILES_ACTIVE=prod

# JWT Secret
JWT_SECRET=SWqThmBOSm+F+pd+Iud+vFKBQsM7uwdl1LCV33RvIJUpuSMzqLWmK55wl8sDKWJ9olq8E0mQ50oeyUbrwDMu5w==

# CORS
CORS_ALLOWED_ORIGINS=https://naciro2010.github.io

# Database - Utiliser la référence au service PostgreSQL
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Note**: `Postgres` doit être le **nom exact** de votre service PostgreSQL dans Railway.

Pour le trouver:
1. Cliquer sur le service PostgreSQL
2. Regarder le nom en haut (par exemple: "Postgres", "PostgreSQL", "database", etc.)
3. Utiliser ce nom exact dans `${{NomDuService.DATABASE_URL}}`

#### Option B: Connection String Manuelle (Si Option A ne marche pas)

Si Railway ne résout toujours pas, utilisez les valeurs directes:

```bash
# Spring Boot profile
SPRING_PROFILES_ACTIVE=prod

# JWT Secret
JWT_SECRET=SWqThmBOSm+F+pd+Iud+vFKBQsM7uwdl1LCV33RvIJUpuSMzqLWmK55wl8sDKWJ9olq8E0mQ50oeyUbrwDMu5w==

# CORS
CORS_ALLOWED_ORIGINS=https://naciro2010.github.io

# Database - Copier depuis les variables du service PostgreSQL
DATABASE_URL=postgresql://postgres:pTabyqBUxxkKCtVNewgmuLCwxHthoDiP@containers-us-west-XXX.railway.app:5432/railway
```

**Pour obtenir la vraie URL:**
1. Aller dans le service **PostgreSQL**
2. Onglet **Variables**
3. Copier la valeur de `DATABASE_PUBLIC_URL` (celle qui commence par `postgresql://postgres:pTabyq...`)
4. La coller dans DATABASE_URL de votre service backend

### Étape 3: Vérification des Variables PostgreSQL

Dans le service **PostgreSQL**, vous devriez voir ces variables (déjà définies automatiquement):
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=pTabyqBUxxkKCtVNewgmuLCwxHthoDiP`
- `POSTGRES_DB=railway`
- `DATABASE_URL=postgresql://...` (URL complète)

### Étape 4: Redéployer

Après avoir ajouté les variables:
1. Railway va redémarrer automatiquement
2. OU cliquer sur **"Redeploy"** dans le service backend

### Étape 5: Vérifier les Logs

1. Aller dans l'onglet **"Deployments"** du service backend
2. Cliquer sur le déploiement en cours
3. Regarder les logs

**Logs attendus si ça fonctionne:**
```
✅ HikariPool-1 - Starting...
✅ HikariPool-1 - Start completed.
✅ Flyway migration starting...
✅ Successfully applied X migrations
✅ Started InvestProApplication in X.XXX seconds
```

**Logs d'erreur si ça ne fonctionne pas:**
```
❌ Connection refused
❌ Could not connect to database
❌ Unknown database 'railway'
```

## 🐛 Diagnostics Supplémentaires

### Si vous voyez "Connection refused"

La `DATABASE_URL` pointe vers `RAILWAY_PRIVATE_DOMAIN` qui n'est accessible que depuis le réseau interne Railway.

**Solution:** Utiliser `DATABASE_PUBLIC_URL` à la place:

```bash
# Dans le service Backend
DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}
```

### Si vous voyez "Unknown database"

Le nom de la base est incorrect.

**Solution:** Vérifier dans le service PostgreSQL:
```bash
# La variable POSTGRES_DB doit être 'railway'
POSTGRES_DB=railway
```

### Si Railway ne résout pas les références

Railway a parfois des bugs avec les références entre services.

**Solution de contournement:**
1. Aller dans le service PostgreSQL
2. Copier la valeur COMPLÈTE de `DATABASE_PUBLIC_URL`
3. La coller directement dans `DATABASE_URL` du service backend (sans utiliser `${{}}`)

Exemple:
```bash
DATABASE_URL=postgresql://postgres:pTabyqBUxxkKCtVNewgmuLCwxHthoDiP@containers-us-west-123.railway.app:7890/railway
```

## ✅ Checklist de Vérification

- [ ] 2 services dans le projet Railway (Backend + PostgreSQL)
- [ ] Service PostgreSQL démarré et actif (statut vert)
- [ ] Variables backend configurées:
  - [ ] `SPRING_PROFILES_ACTIVE=prod`
  - [ ] `JWT_SECRET=...`
  - [ ] `CORS_ALLOWED_ORIGINS=...`
  - [ ] `DATABASE_URL=...` (résolue correctement)
- [ ] Backend redéployé après ajout variables
- [ ] Logs backend montrent connexion réussie
- [ ] Healthcheck OK: `https://[URL].up.railway.app/actuator/health`

## 📸 Captures d'Écran Utiles

Si le problème persiste, vérifier:

1. **Dashboard Railway** - Les 2 services sont bien présents et actifs?
2. **Service PostgreSQL > Variables** - `DATABASE_PUBLIC_URL` a une vraie valeur?
3. **Service Backend > Variables** - `DATABASE_URL` est configuré?
4. **Service Backend > Deployments > Logs** - Quel est le message d'erreur exact?

## 🆘 Si Rien ne Marche

Essayer cette approche alternative:

### 1. Supprimer et Recréer la Base

1. Supprimer le service PostgreSQL
2. Dans le service Backend, cliquer **"New" > "Database" > "Add PostgreSQL"**
3. Railway va automatiquement connecter les deux

### 2. Vérifier que Flyway ne Bloque Pas

Si les migrations Flyway échouent au démarrage, ajouter temporairement:

```bash
# Désactiver Flyway temporairement pour tester la connexion
SPRING_FLYWAY_ENABLED=false
```

Une fois que la connexion fonctionne, remettre à `true`.

## 📞 Commandes de Debug

Pour tester la connexion depuis le terminal Railway:

```bash
# Se connecter au service backend
railway run bash

# Tester la connexion PostgreSQL
psql $DATABASE_URL -c "SELECT version();"
```

Si ça ne marche pas, c'est que `DATABASE_URL` n'est pas correctement configurée.
