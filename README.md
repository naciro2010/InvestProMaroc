# 🏦 InvestPro Maroc - Gestion Intelligente des Dépenses d'Investissement

> **Plateforme complète de gestion des dépenses d'investissement et calcul automatique des commissions d'intervention**

[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.23-purple?logo=kotlin)](https://kotlinlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green?logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)

---

## 📋 Description

Application web moderne de **gestion des dépenses d'investissement** et de **calcul automatique des commissions d'intervention**, conçue pour le secteur public et les grands projets au Maroc.

### ✨ Fonctionnalités Principales

#### 🎯 Gestion Complète des Référentiels
- ✅ **Conventions** - Configuration des taux de commission et périodes de validité
- ✅ **Projets** - Gestion des projets d'investissement avec responsables et statuts
- ✅ **Fournisseurs** - Base complète avec validation ICE (15 chiffres) et IF
- ✅ **Axes Analytiques** - Dimensions analytiques pour reporting multidimensionnel
- ✅ **Comptes Bancaires** - Gestion avec validation RIB marocain (24 chiffres)

#### 💸 Gestion des Dépenses d'Investissement
- ✅ **Saisie factures** - Enregistrement détaillé avec validation
- ✅ **Calculs automatiques** - TVA 20%, montants HT/TTC
- ✅ **Retenues fiscales** - TVA, IS tiers 10%, garantie 10%, non-résidents
- ✅ **Suivi paiements** - Statuts payé/non payé, références, dates
- ✅ **Filtres avancés** - Par année, projet, fournisseur, statut paiement

#### 📊 Calcul Automatique des Commissions
- ✅ **Calcul intelligent** - Commission = Base × Taux + TVA
- ✅ **Bases multiples** - HT, TTC ou autre base paramétrable
- ✅ **Historisation** - Conservation des taux au moment du calcul
- ✅ **Reporting** - États par convention, année, projet

#### 📈 Reporting et Exports
- ✅ **Tableaux de bord** - KPIs en temps réel
- ✅ **Export Excel** - Dépenses, commissions, états détaillés
- ✅ **Statistiques** - Répartition par projet, fournisseur, période

---

## 🛠️ Stack Technique

### Backend - Kotlin Spring Boot
```
🎨 Kotlin 1.9.23          → Langage moderne, concis, null-safe
🚀 Spring Boot 3.2.5      → Framework enterprise
🐘 Gradle 8.7             → Build tool avec Kotlin DSL
🐘 PostgreSQL 16          → Base de données
🔄 Flyway                 → Migrations automatiques
🔐 JWT + Spring Security  → Authentification sécurisée
📚 Swagger/OpenAPI        → Documentation API
🧪 Testcontainers         → Tests d'intégration
☕ Java 21 LTS            → Runtime JVM
```

### Frontend - React Modern
```
⚛️  React 18              → Library UI
⚡ Vite                   → Build ultra-rapide
🎨 TailwindCSS            → Design system
🔄 React Query            → State management
📋 React Hook Form + Zod  → Validation
📊 Recharts               → Graphiques
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Java 21+
- Node.js 20+
- PostgreSQL 16+ (ou Docker)

### 1️⃣ PostgreSQL avec Docker
```bash
docker run --name investpro-postgres \
  -e POSTGRES_DB=investpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2️⃣ Backend
```bash
cd backend
./gradlew bootRun
# API sur http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
# UI sur http://localhost:5173
```

---

## 📚 API Endpoints

### 🔐 Authentification
```
POST   /api/auth/register     → Inscription
POST   /api/auth/login        → Connexion (JWT)
POST   /api/auth/refresh      → Rafraîchir token
```

### 📜 Conventions
```
GET    /api/conventions        → Liste toutes
GET    /api/conventions/active → Actives uniquement
POST   /api/conventions        → Créer (ADMIN)
PUT    /api/conventions/{id}   → Modifier (ADMIN)
DELETE /api/conventions/{id}   → Supprimer (ADMIN)
```

### 🏗️ Projets
```
GET    /api/projets            → Liste tous
GET    /api/projets/active     → Actifs uniquement
POST   /api/projets            → Créer (ADMIN/MANAGER)
```

### 🏢 Fournisseurs
```
GET    /api/fournisseurs                → Liste tous
GET    /api/fournisseurs/non-residents  → Non-résidents
POST   /api/fournisseurs                → Créer (ADMIN/MANAGER)
```

### 💸 Dépenses
```
GET    /api/depenses              → Liste toutes
GET    /api/depenses/unpaid       → Non payées
GET    /api/depenses/year/{year}  → Par année
POST   /api/depenses              → Créer (USER/MANAGER/ADMIN)
```

### 📊 Commissions
```
GET    /api/commissions              → Liste toutes
GET    /api/commissions/year/{year}  → Par année
GET    /api/commissions/depense/{id} → D'une dépense
POST   /api/commissions              → Créer (ADMIN/MANAGER)
```

### 📈 Reporting & Statistiques
```
POST   /api/reporting/depenses/search         → Recherche avancée dépenses
POST   /api/reporting/commissions/search      → Recherche avancée commissions
GET    /api/reporting/dashboard               → Dashboard global (KPIs)
GET    /api/reporting/depenses/stats/periode  → Stats dépenses par période
GET    /api/reporting/depenses/stats/projet   → Stats dépenses par projet
GET    /api/reporting/depenses/stats/fournisseur → Stats dépenses par fournisseur
GET    /api/reporting/commissions/stats/periode  → Stats commissions par période
GET    /api/reporting/commissions/stats/projet   → Stats commissions par projet
GET    /api/reporting/commissions/stats/fournisseur → Stats commissions par fournisseur
GET    /api/reporting/commissions/stats/convention  → Stats commissions par convention
GET    /api/reporting/paiements/stats         → Stats paiements (taux, montants)
```

### 📥 Exports Excel
```
POST   /api/export/excel/depenses                  → Export dépenses (critères)
GET    /api/export/excel/depenses/all              → Export toutes dépenses
POST   /api/export/excel/commissions               → Export commissions (critères)
GET    /api/export/excel/commissions/all           → Export toutes commissions
GET    /api/export/excel/stats/depenses/periode    → Export stats dépenses/période
GET    /api/export/excel/stats/depenses/projet     → Export stats dépenses/projet
GET    /api/export/excel/stats/depenses/fournisseur → Export stats dépenses/fournisseur
GET    /api/export/excel/stats/commissions/periode  → Export stats commissions/période
GET    /api/export/excel/stats/commissions/projet   → Export stats commissions/projet
GET    /api/export/excel/stats/commissions/fournisseur → Export stats commissions/fournisseur
GET    /api/export/excel/stats/commissions/convention  → Export stats commissions/convention
```

**Total: 45+ endpoints** - Documentation complète sur Swagger UI

---

## 🎯 Spécificités Maroc

### Conformité Fiscale
- ✅ **TVA 20%** - Taux standard automatique
- ✅ **ICE** - Validation 15 chiffres
- ✅ **IF** - Identifiant Fiscal
- ✅ **RIB** - Format 24 chiffres validé
- ✅ **IS Tiers 10%** - Pour non-résidents
- ✅ **Retenue Garantie** - Paramétrable

### Devise
- 💵 **MAD** (Dirham) par défaut
- 🌍 Multi-devises supporté

---

## 🧪 Tests

```bash
cd backend

# Tests avec PostgreSQL réel (Testcontainers)
./gradlew test

# Rapport couverture
./gradlew jacocoTestReport
```

**Tests disponibles :**
- ✅ Authentification (register, login, refresh)
- ✅ Connexion PostgreSQL
- ✅ Validation business rules

---

## ☁️ Déploiement

### 🚂 Railway.app (Backend)
**Guide complet** : [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

1. Connecter GitHub à Railway
2. Ajouter PostgreSQL plugin
3. Variables d'environnement :
   ```
   SPRING_PROFILES_ACTIVE=prod
   JWT_SECRET=<générer avec openssl rand -base64 64>
   CORS_ALLOWED_ORIGINS=https://naciro2010.github.io
   ```
4. Déploiement automatique ! ✨

**Coût** : ~$5/mois (plan gratuit Railway)

### 🌐 GitHub Pages (Frontend)
Déjà configuré ! Push sur `main` déclenche le déploiement.

**URL Démo** : https://naciro2010.github.io/InvestProMaroc/

---

## 📖 Documentation

- **[KOTLIN_MIGRATION.md](KOTLIN_MIGRATION.md)** - Migration Java→Kotlin
- **[backend/README.md](backend/README.md)** - Doc backend détaillée
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** - Guide Railway
- **[DEMO_DEPLOYMENT.md](DEMO_DEPLOYMENT.md)** - Guide GitHub Pages

---

## 🏗️ Architecture

```
Backend (Kotlin)
├── Entities      → 7 entités métier
├── DTOs          → Data Transfer Objects
├── Repositories  → Spring Data JPA
├── Services      → Business logic + calculs
├── Controllers   → REST API (28+ endpoints)
└── Security      → JWT + Rôles (ADMIN/MANAGER/USER)

Frontend (React)
├── Pages         → Dashboard, CRUD, Auth
├── Components    → UI réutilisables
├── Services      → API calls
└── Stores        → State management
```

---

## 📊 Statistiques

```
📝 Lignes Kotlin:     ~4,500 lignes
🗑️  Code supprimé:    -3,500 lignes Java
📉 Réduction:         -40% de code

🎯 Entités:           7 entités métier
🔌 Endpoints:         45+ REST endpoints
📊 Reporting:         12+ endpoints statistiques
📥 Exports Excel:     11+ endpoints export
🧪 Tests:             Testcontainers intégration
📚 Documentation:     Swagger/OpenAPI complète
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir Pull Request

---

## 📜 Licence

**Propriétaire** - © 2024 InvestPro Maroc

---

## 📧 Support

- **GitHub Issues** : [Ouvrir une issue](https://github.com/naciro2010/InvestProMaroc/issues)
- **API Docs** : http://localhost:8080/swagger-ui.html
- **Email** : contact@investpro.ma

---

**Made with** 🎨 **Kotlin** • 🚀 **Spring Boot** • ⚛️ **React** • 🐘 **PostgreSQL**
