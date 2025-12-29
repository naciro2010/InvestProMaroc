# 📋 Cahier des Charges Technique - Hébergement InvestPro Maroc

## 📌 Informations Générales

**Nom du projet :** InvestPro Maroc
**Type d'application :** Plateforme web de gestion budgétaire et financière
**Secteur :** Gestion des dépenses d'investissement public
**Environnement :** Production

---

## 🎯 Vue d'Ensemble de l'Application

InvestPro Maroc est une plateforme complète de gestion des dépenses d'investissement et calcul automatique des commissions d'intervention pour les projets publics au Maroc.

L'application gère le cycle de vie complet :
- **Conventions d'intervention** (cadre juridique)
- **Budgets** avec gestion de versions (V0, V1, V2...)
- **Marchés publics** et engagements contractuels
- **Décomptes** (situations de travaux avec retenues)
- **Ordres de paiement** et paiements effectifs
- **Suivi RÉEL vs BUDGET** en temps réel
- **Calcul automatique des commissions**

---

## 🏗️ Architecture Technique

### Architecture Globale
L'application suit une architecture **3-tiers moderne** :

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (SPA)                     │
│        React 18 + TypeScript + Vite             │
│            (~1 MB bundle gzippé)                │
└────────────────┬────────────────────────────────┘
                 │ HTTPS / REST API
                 │ JSON
┌────────────────▼────────────────────────────────┐
│            BACKEND (API REST)                   │
│    Kotlin + Spring Boot 3.2.5 + Java 21        │
│          (~80 MB JAR exécutable)                │
└────────────────┬────────────────────────────────┘
                 │ JDBC / TCP
                 │
┌────────────────▼────────────────────────────────┐
│          BASE DE DONNÉES                        │
│           PostgreSQL 16                         │
│        (~500 MB-2 GB estimé)                    │
└─────────────────────────────────────────────────┘
```

---

## 💻 Backend (API REST)

### Technologies
- **Langage :** Kotlin 1.9.23
- **Framework :** Spring Boot 3.2.5
- **JVM :** Java 21 (LTS)
- **Build :** Gradle 8.7+
- **Packaging :** JAR exécutable standalone

### Composants Techniques
- **Spring Data JPA** - ORM pour accès base de données
- **Spring Security + JWT** - Authentification et autorisation
- **Flyway** - Gestion des migrations de schéma (20 migrations)
- **Spring Validation** - Validation des données
- **SpringDoc OpenAPI** - Documentation API Swagger
- **Jackson Kotlin** - Sérialisation JSON
- **Apache POI** - Export Excel
- **Actuator** - Monitoring et health checks

### Fichiers Source
- **49 fichiers Kotlin** (~5 000 lignes de code)
- **20 migrations SQL** (Flyway)
- **RESTful API** avec ~40 endpoints

### Configuration Runtime
- **Port HTTP :** 8080 (configurable via variable `PORT`)
- **JVM Options recommandées :**
  ```
  -Xms512m -Xmx2048m
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
  ```

### Variables d'Environnement Requises
```bash
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/investpro
SPRING_DATASOURCE_USERNAME=investpro_user
SPRING_DATASOURCE_PASSWORD=****
SPRING_FLYWAY_ENABLED=true

# JWT
JWT_SECRET=****  # 256-bit minimum
JWT_EXPIRATION=86400000  # 24h en ms

# Application
PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Optional - Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_MA_INVESTPRO=DEBUG
```

---

## 🎨 Frontend (SPA)

### Technologies
- **Framework :** React 18.2
- **Langage :** TypeScript 5.2
- **Build :** Vite 5.1 (bundler ultra-rapide)
- **Styling :** TailwindCSS 3.4 (utility-first CSS)
- **Animations :** Framer Motion 11
- **Charts :** Recharts 2.15
- **HTTP Client :** Axios 1.6
- **Routing :** React Router 6.22

### Composants
- **Landing page** GitLab-style avec 12 features
- **Dashboard** avec 4 KPIs et 4 graphiques temps réel
- **8 modules** opérationnels (Conventions, Budgets, Décomptes, Paiements...)
- **Design system** complet (Card, Button, Badge, StatusBadge)
- **Responsive** 100% mobile/tablet/desktop

### Build Production
- **Taille bundle :** 1 026 KB (~280 KB gzippé)
- **Temps de build :** ~15 secondes
- **Modules :** 3 048 modules transformés
- **Assets statiques :** HTML + CSS (44 KB) + JS (1 MB)

### Variables d'Environnement
```bash
VITE_API_URL=https://api.investpro.ma
```

### Serveur HTTP Requis
Le frontend est constitué de **fichiers statiques** (HTML/CSS/JS) à servir via :
- **Nginx** (recommandé)
- **Apache**
- **Caddy**
- **Serveur Node.js** (serve, express...)

Configuration Nginx recommandée :
```nginx
server {
    listen 80;
    server_name investpro.ma www.investpro.ma;
    root /var/www/investpro-frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

---

## 🗄️ Base de Données

### Système de Gestion
- **SGBD :** PostgreSQL 16.x
- **Type :** Base relationnelle SQL

### Caractéristiques
- **Extensions requises :**
  - `uuid-ossp` (génération UUID)
  - `pg_trgm` (recherche full-text - optionnel)

### Schéma de Données
- **20 tables principales** :
  - `users` (utilisateurs)
  - `conventions` (cadre juridique)
  - `sous_conventions` (conventions dérivées)
  - `avenants` (modifications conventions)
  - `projets` (opérations/programmes)
  - `axes` (dimensions analytiques)
  - `fournisseurs` (tiers)
  - `comptes_bancaires` (RIB)
  - `budgets` (enveloppes financières V0, V1, V2...)
  - `lignes_budget` (détail par postes)
  - `marches` (engagements contractuels)
  - `marche_lignes` (détail marchés)
  - `decomptes` (situations travaux)
  - `decompte_retenues` (garanties, RAS, pénalités)
  - `decompte_imputations` (ventilation analytique)
  - `ordres_paiement` (OP)
  - `op_imputations` (répartition OP)
  - `paiements` (paiements effectifs)
  - `paiement_imputations` (RÉEL vs BUDGET)
  - `subventions` (financements externes)
  - `echeances_subvention` (échéanciers)

### Taille Estimée
- **Phase initiale :** 100-500 MB
- **Croissance annuelle :** 200-500 MB/an
- **5 ans :** ~2-3 GB (données + index)

### Paramètres PostgreSQL Recommandés
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1  # pour SSD
max_connections = 100
```

### Sauvegardes
- **Fréquence recommandée :** Quotidienne (nuit)
- **Rétention :** 30 jours minimum
- **Type :** `pg_dump` complet + WAL archiving (optionnel)
- **Taille dump compressé :** ~50-500 MB (selon volume)

---

## 📊 Volumes et Performance

### Utilisateurs Attendus
- **Phase pilote :** 10-20 utilisateurs simultanés
- **Production :** 50-100 utilisateurs simultanés
- **Peak :** 150-200 utilisateurs simultanés

### Trafic Estimé
- **Requêtes/jour :** 10 000 - 50 000
- **Pics :** Fin de mois (clôtures budgétaires)
- **Bande passante :** 5-10 GB/mois

### Temps de Réponse Cibles
- **API Backend :** < 200ms (95th percentile)
- **Frontend (First Paint) :** < 2s
- **Dashboard (chargement) :** < 3s

---

## 🖥️ Ressources Serveur Recommandées

### Option 1 : Serveur Unique (Small/Medium Business)

**Serveur Backend + Database :**
- **CPU :** 4 vCPU minimum (8 vCPU recommandé)
- **RAM :** 8 GB minimum (16 GB recommandé)
- **Disque :** 50 GB SSD (100 GB pour confort)
- **OS :** Ubuntu 22.04 LTS / Debian 12
- **Services :**
  - Backend (JVM) : 2-4 GB RAM
  - PostgreSQL : 2-4 GB RAM
  - OS + services : 2 GB RAM

**Serveur Frontend :**
- **CPU :** 1-2 vCPU
- **RAM :** 1-2 GB
- **Disque :** 5 GB SSD
- **Nginx** pour servir les fichiers statiques

### Option 2 : Architecture Séparée (Production)

**Serveur Application (Backend) :**
- **CPU :** 4-8 vCPU
- **RAM :** 8-16 GB
- **Disque :** 30 GB SSD
- **JVM Heap :** 2-4 GB

**Serveur Base de Données :**
- **CPU :** 4-8 vCPU
- **RAM :** 8-16 GB (PostgreSQL gourmand en RAM)
- **Disque :** 100 GB SSD (avec croissance)
- **IOPS :** 3000+ (SSD performant)

**Serveur Web (Frontend + Reverse Proxy) :**
- **CPU :** 2 vCPU
- **RAM :** 2-4 GB
- **Disque :** 10 GB SSD
- **Nginx** + certbot SSL

---

## 🔒 Sécurité

### SSL/TLS
- **Certificat :** SSL obligatoire (Let's Encrypt gratuit ou commercial)
- **Protocole :** TLS 1.2+ uniquement
- **HSTS :** Recommandé

### Authentification
- **Méthode :** JWT (JSON Web Token)
- **Expiration :** 24h par défaut
- **Refresh token :** Non implémenté (v1)
- **Rôles :** ADMIN, MANAGER, USER

### Firewall
**Ports à ouvrir :**
- **80/TCP** - HTTP (redirect vers HTTPS)
- **443/TCP** - HTTPS
- **8080/TCP** - Backend API (si exposé directement, sinon via reverse proxy)
- **5432/TCP** - PostgreSQL (UNIQUEMENT depuis serveur backend)

**Ports à BLOQUER depuis Internet :**
- **5432/TCP** - PostgreSQL (accès interne uniquement)
- **22/TCP** - SSH (whitelister IPs admin uniquement)

### CORS
- **Origins autorisées :** https://investpro.ma, https://www.investpro.ma
- **Credentials :** true
- **Methods :** GET, POST, PUT, DELETE, PATCH

### Recommandations Additionnelles
- **Rate limiting** : 100 req/min par IP
- **DDoS protection** : Cloudflare ou équivalent
- **WAF** : Web Application Firewall (optionnel)
- **Fail2ban** : Protection brute-force SSH
- **Monitoring intrusions** : fail2ban + OSSEC

---

## 📦 Déploiement

### Méthode 1 : Déploiement Manuel

**Backend :**
```bash
# Build JAR
cd backend
./gradlew clean build -x test

# Deploy
scp backend/build/libs/investpro-backend-1.0.0.jar user@server:/opt/investpro/
ssh user@server
cd /opt/investpro
java -jar -Xms512m -Xmx2048m investpro-backend-1.0.0.jar
```

**Frontend :**
```bash
# Build
cd frontend
npm install
npm run build

# Deploy
scp -r dist/* user@server:/var/www/investpro-frontend/
```

### Méthode 2 : Conteneurs Docker

**Backend Dockerfile :**
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms512m -Xmx2048m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

**Frontend Dockerfile :**
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Docker Compose :**
```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: investpro
      POSTGRES_USER: investpro
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"

  backend:
    image: investpro-backend:latest
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://db:5432/investpro
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"

  frontend:
    image: investpro-frontend:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
```

### Méthode 3 : PaaS (Railway / Heroku / Render)

**Avantages :**
- Déploiement automatisé depuis Git
- Scaling automatique
- Certificats SSL inclus
- Monitoring intégré

**Configuration Railway :**
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "java -jar build/libs/*.jar"
healthcheckPath = "/actuator/health"
healthcheckTimeout = 100
```

---

## 📈 Monitoring & Logs

### Health Checks
- **Endpoint :** `GET /actuator/health`
- **Format :** JSON
- **Intervalle :** Toutes les 30s
- **Timeout :** 5s

**Exemple réponse :**
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### Métriques Applicatives
- **Endpoint :** `/actuator/metrics`
- **Prometheus :** Compatible (optionnel)
- **Métriques clés :**
  - JVM memory usage
  - HTTP requests (count, duration)
  - Database connections
  - Custom business metrics

### Logs
**Backend :**
- **Format :** JSON (production) ou texte (dev)
- **Niveaux :** ERROR, WARN, INFO, DEBUG
- **Rotation :** Daily, 30 jours rétention
- **Taille :** ~100-500 MB/jour

**Frontend :**
- **Access logs :** Nginx access.log
- **Error logs :** Nginx error.log
- **Taille :** ~50-100 MB/jour

### Outils de Monitoring Recommandés
- **Application Performance :**
  - New Relic
  - DataDog
  - Prometheus + Grafana (open-source)

- **Logs Centralisés :**
  - ELK Stack (Elasticsearch + Logstash + Kibana)
  - Graylog
  - Loki + Grafana

- **Uptime Monitoring :**
  - UptimeRobot
  - Pingdom
  - Freshping

---

## 🌐 Noms de Domaine et DNS

### Domaines Requis
- **Principal :** `investpro.ma` ou `app.investpro.ma`
- **API :** `api.investpro.ma` (optionnel, recommandé)
- **WWW :** `www.investpro.ma` (redirect vers principal)

### Configuration DNS Recommandée
```
; Frontend
investpro.ma.           A       1.2.3.4
www.investpro.ma.       CNAME   investpro.ma.

; Backend API
api.investpro.ma.       A       5.6.7.8

; Mail (optionnel)
@                       MX 10   mail.investpro.ma.
```

---

## 🔧 Maintenance

### Fenêtres de Maintenance
- **Fréquence :** Mensuelle
- **Durée :** 1-2 heures
- **Horaires :** Dimanche 2h-4h (trafic minimum)

### Tâches Récurrentes
- **Quotidien :** Backup base de données
- **Hebdomadaire :** Analyse logs, vérification disk space
- **Mensuel :** Mise à jour sécurité OS, nettoyage logs anciens
- **Trimestriel :** Optimisation base de données (VACUUM, REINDEX)
- **Annuel :** Audit sécurité, renouvellement certificats

---

## 💰 Estimation Coûts Hébergement

### Option 1 : VPS Classique

**Serveur Unique (4 vCPU, 8 GB RAM, 100 GB SSD) :**
- **OVH :** ~40-60 €/mois
- **Scaleway :** ~30-50 €/mois
- **DigitalOcean :** $48/mois (~45 €)
- **Hetzner :** ~25-40 €/mois

**+ Services additionnels :**
- Backup automatique : +10-20 €/mois
- Monitoring : +5-15 €/mois
- **Total :** ~60-100 €/mois

### Option 2 : Architecture Séparée

**3 serveurs (App + DB + Web) :**
- Application (4 vCPU, 8 GB) : ~40 €/mois
- Database (4 vCPU, 8 GB) : ~40 €/mois
- Web (2 vCPU, 2 GB) : ~15 €/mois
- Services (backup, monitoring) : +30 €/mois
- **Total :** ~125-150 €/mois

### Option 3 : PaaS (Railway / Heroku / Render)

**Railway :**
- Hobby plan : $5/mois
- Pro plan : $20/mois + usage
- **Estimation :** $50-150/mois (~45-140 €)

**Heroku :**
- Dyno Standard (Backend) : $25/mois
- PostgreSQL Standard : $50/mois
- **Total :** ~$75-100/mois (~70-95 €)

---

## 📞 Support et Contacts

### Informations Techniques
- **Responsable Technique :** À définir
- **Email Support :** support@investpro.ma
- **Téléphone :** À définir
- **Disponibilité :** Lundi-Vendredi 9h-18h (GMT+1)

### Documentation
- **Code Source :** GitHub - naciro2010/InvestProMaroc
- **API Documentation :** https://api.investpro.ma/swagger-ui.html
- **Guide Utilisateur :** À produire

---

## 📋 Checklist pour Hébergeur

### Prérequis Techniques
- [ ] Serveur(s) avec spécifications minimales respectées
- [ ] PostgreSQL 16 installé et configuré
- [ ] Java 21 JRE installé (pour backend)
- [ ] Nginx ou Apache installé (pour frontend)
- [ ] Certificat SSL configuré
- [ ] Firewall configuré selon spécifications
- [ ] Sauvegardes automatiques configurées (daily)
- [ ] Monitoring health checks configuré
- [ ] DNS configurés et propagés

### Variables d'Environnement
- [ ] DATABASE_URL configurée
- [ ] JWT_SECRET généré (256-bit secure)
- [ ] VITE_API_URL configurée (frontend)
- [ ] PORT configuré (8080 par défaut)
- [ ] SPRING_PROFILES_ACTIVE=prod

### Tests de Déploiement
- [ ] Backend démarre sans erreurs
- [ ] Frontend accessible via HTTPS
- [ ] Connexion DB fonctionnelle
- [ ] Migrations Flyway exécutées (20/20)
- [ ] Health check retourne 200 OK
- [ ] Login utilisateur fonctionnel
- [ ] API endpoints répondent correctement
- [ ] CORS configuré correctement

### Post-Déploiement
- [ ] Tests de charge (50+ utilisateurs simultanés)
- [ ] Temps de réponse < 200ms
- [ ] Logs collectés et accessibles
- [ ] Alertes configurées (disk space, CPU, RAM)
- [ ] Backup testé et restauration validée
- [ ] Plan de reprise d'activité (PRA) défini

---

## 🚀 Démarrage Initial

### Ordre des Opérations

1. **Installation infrastructure**
   - Provisionner serveurs
   - Installer OS + dépendances
   - Configurer firewall

2. **Base de données**
   - Installer PostgreSQL 16
   - Créer base `investpro`
   - Créer utilisateur avec privilèges

3. **Backend**
   - Déployer JAR ou image Docker
   - Configurer variables d'environnement
   - Démarrer service
   - Vérifier migrations Flyway (20 appliquées)

4. **Frontend**
   - Déployer fichiers statiques
   - Configurer Nginx avec SPA fallback
   - Configurer SSL (Let's Encrypt)

5. **Tests**
   - Health check backend
   - Accès frontend
   - Login test
   - Vérifier CORS

6. **Monitoring**
   - Configurer alertes
   - Tester notifications
   - Valider collecte logs

---

## 📄 Annexes

### A. Ports Réseau Complets
```
80/TCP    - HTTP (frontend)
443/TCP   - HTTPS (frontend)
8080/TCP  - Backend API
5432/TCP  - PostgreSQL (interne uniquement)
22/TCP    - SSH (admin uniquement, whitelisted)
```

### B. Commandes Utiles

**PostgreSQL :**
```bash
# Connexion
psql -U investpro -d investpro

# Backup
pg_dump -U investpro investpro > backup.sql

# Restore
psql -U investpro investpro < backup.sql

# Taille DB
SELECT pg_size_pretty(pg_database_size('investpro'));
```

**Backend :**
```bash
# Logs
journalctl -u investpro-backend -f

# Status
systemctl status investpro-backend

# Restart
systemctl restart investpro-backend
```

**Nginx :**
```bash
# Test config
nginx -t

# Reload
systemctl reload nginx

# Access logs
tail -f /var/log/nginx/access.log
```

### C. Tableau Récapitulatif

| Composant | Technologie | CPU | RAM | Disque | Port |
|-----------|-------------|-----|-----|--------|------|
| Frontend | React 18 + Nginx | 1-2 vCPU | 1-2 GB | 5 GB | 80/443 |
| Backend | Kotlin + Spring Boot | 4-8 vCPU | 8-16 GB | 30 GB | 8080 |
| Database | PostgreSQL 16 | 4-8 vCPU | 8-16 GB | 100 GB | 5432 |
| **Total** | **3 services** | **9-18 vCPU** | **17-34 GB** | **135 GB** | **-** |

---

## ✅ Validation Document

**Version :** 1.0
**Date :** 2024-12-29
**Auteur :** Équipe InvestPro Maroc
**Contact :** support@investpro.ma

---

**Ce document contient toutes les informations techniques nécessaires pour établir un devis d'hébergement précis. N'hésitez pas à demander des clarifications sur des points spécifiques.**
