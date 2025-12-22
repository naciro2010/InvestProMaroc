# 🚂 Guide de Déploiement Railway - InvestPro Maroc Backend

## ✅ Prérequis Vérifiés

- ✅ Backend Kotlin + Gradle configuré
- ✅ Dockerfile multi-stage optimisé
- ✅ application-prod.properties configuré
- ✅ Tests Testcontainers fonctionnels
- ✅ Code poussé sur GitHub

---

## 📝 Étape 1: Créer un Compte Railway

1. Aller sur [railway.app](https://railway.app)
2. Cliquer sur **"Start a New Project"**
3. Se connecter avec **GitHub** (recommandé)
4. Autoriser Railway à accéder à vos repositories

---

## 📦 Étape 2: Créer le Projet Backend

### Option A: Depuis le Dashboard Railway

1. Cliquer sur **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Chercher et sélectionner **`naciro2010/InvestProMaroc`**
4. Railway va détecter automatiquement le **Dockerfile**
5. Cliquer sur **"Deploy Now"**

### Option B: Avec le CLI Railway (optionnel)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialiser dans le projet
cd /path/to/InvestProMaroc
railway init

# Déployer
railway up
```

---

## 🐘 Étape 3: Ajouter PostgreSQL Database

1. Dans votre projet Railway, cliquer sur **"+ New"**
2. Sélectionner **"Database"**
3. Choisir **"Add PostgreSQL"**
4. Railway va créer automatiquement:
   - Une base de données PostgreSQL 16
   - Variable `DATABASE_URL` (déjà connectée automatiquement)
   - Credentials disponibles dans les variables

✅ **Aucune configuration manuelle nécessaire** - Railway injecte automatiquement `DATABASE_URL`

---

## 🔐 Étape 4: Configurer les Variables d'Environnement

1. Aller dans l'onglet **"Variables"** de votre service backend
2. Ajouter les variables suivantes:

### Variables Obligatoires

| Variable | Valeur | Description |
|----------|--------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Active le profil production |
| `JWT_SECRET` | Voir ci-dessous ⬇️ | Secret pour JWT (généré) |
| `CORS_ALLOWED_ORIGINS` | `https://naciro2010.github.io` | Origine autorisée pour CORS |

### 🔑 JWT Secret (IMPORTANT)

**Copier cette valeur générée de manière sécurisée:**

```
SWqThmBOSm+F+pd+Iud+vFKBQsM7uwdl1LCV33RvIJUpuSMzqLWmK55wl8sDKWJ9olq8E0mQ50oeyUbrwDMu5w==
```

### Variables Optionnelles

| Variable | Valeur par Défaut | Description |
|----------|-------------------|-------------|
| `JWT_EXPIRATION_MS` | `86400000` | Expiration token (24h) |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` | Expiration refresh (7 jours) |
| `JAVA_OPTS` | `-Xmx512m -Xms256m` | Options JVM (déjà dans Dockerfile) |

### 📋 Variables Automatiques de Railway

Ces variables sont **automatiquement injectées** par Railway:
- ✅ `DATABASE_URL` - URL PostgreSQL complète
- ✅ `PORT` - Port dynamique (défaut: 8080)

---

## 🚀 Étape 5: Déployer

1. **Railway redémarre automatiquement** après ajout des variables
2. Surveiller les logs dans l'onglet **"Deployments"**
3. Le build prend ~3-5 minutes (multi-stage Docker)

### Logs à Surveiller

```
✅ Building with Dockerfile...
✅ [build] Gradle dependencies downloaded
✅ [build] Building Spring Boot application
✅ [build] BUILD SUCCESSFUL
✅ [production] Starting application...
✅ Started InvestProApplication in X.XXX seconds
```

---

## 🌐 Étape 6: Générer un Domaine Public

1. Aller dans **"Settings"** du service backend
2. Section **"Networking"**
3. Cliquer sur **"Generate Domain"**
4. Railway génère une URL type: `investpro-backend-production.up.railway.app`

**Copier cette URL** - vous en aurez besoin pour le frontend!

---

## ✅ Étape 7: Vérifier le Déploiement

### 1. Health Check
```bash
curl https://[VOTRE-URL].up.railway.app/actuator/health
```

Réponse attendue:
```json
{"status":"UP"}
```

### 2. Swagger UI
Ouvrir dans le navigateur:
```
https://[VOTRE-URL].up.railway.app/swagger-ui.html
```

Vous devriez voir la documentation complète de l'API avec:
- 🔐 Authentication endpoints
- 📜 Conventions endpoints
- 🏗️ Projets endpoints
- 🏢 Fournisseurs endpoints
- 💸 Dépenses endpoints
- 📊 Commissions endpoints

### 3. Test Login API
```bash
# Créer un utilisateur
curl -X POST https://[VOTRE-URL].up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@investpro.ma",
    "password": "Admin123!",
    "roles": ["ADMIN"]
  }'

# Login
curl -X POST https://[VOTRE-URL].up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

---

## 🔗 Étape 8: Connecter le Frontend

### Mise à Jour GitHub Actions

1. Aller dans **Settings** du repo GitHub
2. **Secrets and variables** > **Actions** > **Variables**
3. Créer la variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://[VOTRE-URL].up.railway.app/api`

### Redéployer le Frontend

```bash
git commit --allow-empty -m "chore: trigger frontend redeploy"
git push origin main
```

Le frontend GitHub Pages va automatiquement se connecter au backend Railway!

---

## 💰 Coûts Railway

### Plan Gratuit (Trial)
- ✅ **$5 de crédits gratuits/mois**
- ✅ 500 heures d'exécution
- ✅ 1GB RAM
- ✅ 1GB stockage

### Estimation InvestPro
- Backend: ~0.5GB RAM = **~$3/mois**
- PostgreSQL: 1GB stockage = **~$2/mois**
- **Total: ~$5/mois** (couvert par le plan gratuit!)

---

## 🐛 Dépannage

### Build Failed

**Vérifier:**
1. Dockerfile est bien à la racine
2. Railway utilise le bon Dockerfile (pas de `nixpacks.toml`)
3. Logs de build pour erreurs Gradle

**Solution:**
```bash
# Forcer rebuild
railway up --detach
```

### Application Crashes au Démarrage

**Vérifier:**
1. Variables `JWT_SECRET` et `SPRING_PROFILES_ACTIVE` définies
2. PostgreSQL bien connecté (variable `DATABASE_URL`)
3. Logs dans Railway Dashboard

### CORS Errors depuis le Frontend

**Vérifier:**
1. `CORS_ALLOWED_ORIGINS` contient `https://naciro2010.github.io`
2. Le frontend utilise la bonne URL backend
3. Headers CORS dans les requêtes

---

## 📊 Monitoring Production

### Métriques Railway
- **CPU Usage**: Dashboard Railway
- **Memory**: Dashboard Railway
- **Request Count**: Logs Railway

### Health Checks
Railway vérifie automatiquement `/actuator/health` toutes les 30 secondes.

### Logs en Temps Réel
```bash
railway logs
```

Ou dans le Dashboard Railway > **Deployments** > **View Logs**

---

## 🎯 Checklist de Déploiement

- [ ] Compte Railway créé
- [ ] Projet déployé depuis GitHub
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées:
  - [ ] `SPRING_PROFILES_ACTIVE=prod`
  - [ ] `JWT_SECRET` (copié depuis ce guide)
  - [ ] `CORS_ALLOWED_ORIGINS=https://naciro2010.github.io`
- [ ] Domaine public généré
- [ ] Health check répond `{"status":"UP"}`
- [ ] Swagger UI accessible
- [ ] Test d'authentification réussi
- [ ] Variable `VITE_API_URL` ajoutée dans GitHub Actions
- [ ] Frontend redéployé et connecté

---

## 🔗 Liens Utiles

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app/
- **Swagger UI**: `https://[VOTRE-URL].up.railway.app/swagger-ui.html`
- **Health Check**: `https://[VOTRE-URL].up.railway.app/actuator/health`
- **Frontend Demo**: https://naciro2010.github.io/InvestProMaroc/

---

## 🎉 Félicitations !

Votre backend InvestPro Maroc est maintenant déployé en production sur Railway avec:
- ✅ Base de données PostgreSQL managed
- ✅ Migrations Flyway automatiques
- ✅ API REST complète (28+ endpoints)
- ✅ Authentication JWT sécurisée
- ✅ Documentation Swagger
- ✅ CORS configuré pour GitHub Pages
- ✅ Health checks actifs

**Prochaines étapes:**
1. Créer un utilisateur ADMIN via `/api/auth/register`
2. Tester toutes les fonctionnalités depuis le frontend
3. Inviter votre client à tester la démo! 🚀
