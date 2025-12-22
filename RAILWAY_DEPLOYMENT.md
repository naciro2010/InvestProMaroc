# 🚂 Déploiement du Backend sur Railway.app

Guide complet pour déployer le backend InvestPro Maroc sur Railway avec PostgreSQL.

## 📋 Prérequis

- Compte GitHub (déjà fait ✓)
- Compte Railway.app (gratuit - $5 de crédit/mois)
- Le code doit être sur GitHub (déjà fait ✓)

## 🚀 Étape 1 : Créer un compte Railway

1. Allez sur : https://railway.app
2. Cliquez sur **"Start a New Project"** ou **"Login"**
3. Connectez-vous avec votre compte GitHub
4. Autorisez Railway à accéder à vos repositories

## 📦 Étape 2 : Créer un nouveau projet

### 2.1 Déployer depuis GitHub

1. Dans Railway, cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Cherchez et sélectionnez : `naciro2010/InvestProMaroc`
4. Railway détectera automatiquement le Dockerfile dans `/backend`

### 2.2 Configurer le chemin de build

Si Railway ne détecte pas automatiquement le backend :

1. Allez dans **Settings** de votre service
2. Dans **Build**, ajoutez :
   - **Root Directory** : `backend`
   - **Dockerfile Path** : `Dockerfile`

## 🗄️ Étape 3 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway créera automatiquement :
   - Une base de données PostgreSQL
   - La variable `DATABASE_URL` sera automatiquement ajoutée à votre service

3. **Lier la database au service backend** :
   - Cliquez sur votre service backend
   - Railway détectera automatiquement la connexion
   - La variable `DATABASE_URL` sera disponible

## 🔐 Étape 4 : Configurer les variables d'environnement

Dans votre service backend, allez dans **Variables** et ajoutez :

### Variables obligatoires :

```bash
# Profile Spring Boot
SPRING_PROFILES_ACTIVE=prod

# JWT Secret (générez-en un nouveau sécurisé)
JWT_SECRET=<voir-commande-ci-dessous>

# CORS (ajoutez votre URL GitHub Pages)
CORS_ALLOWED_ORIGINS=https://naciro2010.github.io,https://votre-backend.up.railway.app
```

### Générer un JWT_SECRET sécurisé :

Exécutez cette commande dans votre terminal local :

```bash
# Option 1 : avec OpenSSL
openssl rand -base64 64

# Option 2 : avec Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Copiez le résultat et collez-le comme valeur de `JWT_SECRET` dans Railway.

### Variables optionnelles :

```bash
# JWT Expiration (par défaut : 24h)
JWT_EXPIRATION_MS=86400000

# JWT Refresh Expiration (par défaut : 7 jours)
JWT_REFRESH_EXPIRATION_MS=604800000

# Port (Railway le définit automatiquement, mais vous pouvez forcer)
PORT=8080
```

## 🌐 Étape 5 : Déployer

1. Une fois toutes les variables configurées, Railway déploiera automatiquement
2. Le déploiement prend environ **3-5 minutes**
3. Suivez les logs en temps réel dans l'onglet **"Deployments"**

## ✅ Étape 6 : Vérifier le déploiement

### 6.1 Obtenir l'URL publique

1. Dans votre service backend, allez dans **Settings**
2. Section **Networking** → **Public Networking**
3. Cliquez sur **"Generate Domain"**
4. Railway vous donnera une URL comme : `https://investpro-backend-production.up.railway.app`

### 6.2 Tester l'API

Testez ces endpoints :

```bash
# Health check
curl https://votre-backend.up.railway.app/actuator/health

# API Docs (Swagger)
https://votre-backend.up.railway.app/swagger-ui.html

# API endpoint test
curl https://votre-backend.up.railway.app/api/conventions
```

## 🔗 Étape 7 : Connecter le frontend

### 7.1 Mettre à jour le frontend

Une fois votre backend déployé, vous devez mettre à jour le frontend pour pointer vers l'URL Railway.

Créez un fichier `frontend/.env.production` :

```bash
VITE_API_URL=https://votre-backend.up.railway.app/api
```

### 7.2 Redéployer le frontend sur GitHub Pages

Le workflow GitHub Actions utilisera automatiquement cette variable lors du build.

## 📊 Monitoring et Logs

### Voir les logs en temps réel :

1. Allez dans votre service backend
2. Cliquez sur l'onglet **"Deployments"**
3. Sélectionnez le déploiement actif
4. Les logs s'affichent en temps réel

### Métriques :

Railway vous montre automatiquement :
- CPU usage
- Memory usage
- Network traffic
- Coût estimé

## 💰 Gestion des coûts

### Plan gratuit Railway :

- **$5 de crédit gratuit/mois**
- Suffisant pour une démo légère
- Pas de carte bancaire requise initialement

### Estimation pour votre app :

- Backend Spring Boot : ~$3-4/mois
- PostgreSQL : ~$1-2/mois
- **Total : ~$5/mois (couvert par le plan gratuit !)**

### Optimisation des coûts :

1. **Réduire les ressources** :
   - Settings → Resources
   - Ajustez CPU et RAM si nécessaire

2. **Auto-sleep** (si disponible) :
   - Le backend peut s'endormir après inactivité
   - Réveil automatique sur requête

## 🔄 Mise à jour automatique

Railway redéploie automatiquement à chaque push sur votre branche principale :

```bash
# Faites vos modifications
git add .
git commit -m "Update backend"
git push origin main

# Railway détecte le push et redéploie automatiquement
```

## 🛠️ Commandes utiles Railway CLI

Installez le CLI Railway (optionnel) :

```bash
# Installation
npm install -g @railway/cli

# Login
railway login

# Lier le projet
railway link

# Voir les logs
railway logs

# Ouvrir le dashboard
railway open

# Voir les variables
railway variables

# Exécuter des commandes dans le container
railway run <command>
```

## ❗ Troubleshooting

### Le build échoue

**Problème** : Erreur Maven lors du build

**Solution** :
1. Vérifiez les logs de build
2. Assurez-vous que `pom.xml` est valide
3. Vérifiez que Java 21 est bien utilisé

### La database ne se connecte pas

**Problème** : Erreur de connexion PostgreSQL

**Solution** :
1. Vérifiez que le plugin PostgreSQL est bien ajouté
2. Vérifiez que `DATABASE_URL` est définie
3. Railway génère automatiquement cette variable

### CORS errors dans le frontend

**Problème** : Erreurs CORS lors des appels API

**Solution** :
1. Vérifiez `CORS_ALLOWED_ORIGINS` dans les variables Railway
2. Ajoutez l'URL de votre GitHub Pages
3. Format : `https://naciro2010.github.io`

### L'app redémarre constamment

**Problème** : Health check échoue

**Solution** :
1. Vérifiez les logs
2. Assurez-vous que Flyway migre correctement
3. Vérifiez que `/actuator/health` répond

## 📚 Ressources

- Railway Docs : https://docs.railway.app
- Railway Community : https://discord.gg/railway
- Railway Status : https://status.railway.app

## 🎯 Checklist finale

Avant de partager avec votre client :

- [ ] Backend déployé sur Railway
- [ ] PostgreSQL configuré et connecté
- [ ] Variables d'environnement définies
- [ ] URL publique générée
- [ ] Health check fonctionne (`/actuator/health`)
- [ ] Swagger accessible (`/swagger-ui.html`)
- [ ] Frontend mis à jour avec l'URL Railway
- [ ] CORS configuré correctement
- [ ] Tests de bout en bout réussis

## 🌐 URLs finales pour la démo

Une fois tout configuré, vous aurez :

- **Frontend** : https://naciro2010.github.io/InvestProMaroc/
- **Backend** : https://votre-backend.up.railway.app
- **API Docs** : https://votre-backend.up.railway.app/swagger-ui.html

Partagez l'URL du frontend avec votre client ! 🎉
