# DEVIS DE PRESTATION DE SERVICES

**À l'attention de**
Monsieur le Directeur Général de la
société Rabat Région Aménagement
Rabat, le 23 décembre 2025

---

## Objet

**Développement d'une application web moderne de gestion des dépenses d'investissement et de calcul automatique des commissions d'intervention**

Nous tenons à vous remercier pour l'intérêt que vous avez bien voulu porter à notre cabinet pour la réalisation de la mission citée en objet.

---

## 1. OBJET DU PROJET

Le présent devis a pour objet de définir le périmètre fonctionnel et technique d'une **application web complète** basée sur des technologies modernes et scalables.

### 1.1 Finalités de l'application

L'outil développé permettra :

- ✅ La **gestion et le suivi structuré** des dépenses d'investissement
- ✅ Le **calcul automatique** des commissions d'intervention selon les conventions paramétrées
- ✅ La **centralisation des référentiels** nécessaires (projets, fournisseurs, conventions, axes analytiques, comptes bancaires)
- ✅ La **génération de reportings** fiables et personnalisés
- ✅ L'**export Excel** pour analyse externe
- ✅ La **recherche avancée** et le filtrage multi-critères
- ✅ Le **dashboard en temps réel** avec KPIs et statistiques
- ✅ La **traçabilité complète** de toutes les opérations

### 1.2 Avantages de l'approche Web vs Access

| Critère | Application Web | Microsoft Access |
|---------|----------------|------------------|
| **Accessibilité** | Depuis n'importe quel navigateur, 24/7 | Limité à un poste Windows |
| **Multi-utilisateurs** | Concurrence illimitée avec transactions | Limité (20-30 utilisateurs max) |
| **Performance** | PostgreSQL enterprise-grade | Fichier .accdb, risque corruption |
| **Sécurité** | JWT, chiffrement, rôles granulaires | Basique, facile à contourner |
| **Mobilité** | Accessible mobile/tablette | Desktop uniquement |
| **Maintenance** | Déploiement cloud automatique | Installation manuelle requise |
| **Scalabilité** | Évolution illimitée | Limitations techniques |
| **Coût licence** | Aucune licence Microsoft requise | Licence Office/Access par poste |

---

## 2. GESTION DES RÉFÉRENTIELS

L'application intègre l'ensemble des référentiels nécessaires au bon fonctionnement du système et au calcul automatique des commissions.

### 2.1 Référentiel des conventions de commissions d'intervention

**Fonctionnalités :**
- ✅ Code convention (unique)
- ✅ Libellé descriptif
- ✅ Taux de commission (%)
- ✅ Base de calcul (HT, TTC ou autre)
- ✅ Taux de TVA applicable (20% par défaut)
- ✅ Dates de validité (début / fin)
- ✅ Statut actif / inactif
- ✅ Historisation : désactivation sans perte de données
- ✅ Validation métier : empêche doublons et incohérences

**Endpoints API :**
- `GET /api/conventions` - Liste complète
- `GET /api/conventions/active` - Conventions actives uniquement
- `POST /api/conventions` - Création (ADMIN)
- `PUT /api/conventions/{id}` - Modification (ADMIN)
- `DELETE /api/conventions/{id}` - Désactivation (ADMIN)

### 2.2 Référentiel des projets

**Fonctionnalités :**
- ✅ Code projet (unique)
- ✅ Nom du projet
- ✅ Description détaillée (optionnelle)
- ✅ Responsable de projet
- ✅ Statut (actif / inactif / en cours / terminé)
- ✅ Gestion multi-projets simultanés
- ✅ Historique des modifications

**Endpoints API :**
- `GET /api/projets` - Liste tous les projets
- `GET /api/projets/active` - Projets actifs
- `POST /api/projets` - Création (ADMIN/MANAGER)
- `PUT /api/projets/{id}` - Modification (ADMIN/MANAGER)

### 2.3 Référentiel des fournisseurs

**Fonctionnalités :**
- ✅ Code fournisseur (unique)
- ✅ Raison sociale
- ✅ **ICE - 15 chiffres** (validation automatique)
- ✅ **IF - Identifiant Fiscal** (validation)
- ✅ Adresse complète
- ✅ Contact (téléphone, email)
- ✅ **Indicateur non-résident** (pour retenues spécifiques)
- ✅ Statut actif / inactif
- ✅ Validation unicité ICE

**Conformité Maroc :**
- Format ICE : exactement 15 chiffres numériques
- Détection automatique des fournisseurs non-résidents
- Application automatique des retenues fiscales appropriées

**Endpoints API :**
- `GET /api/fournisseurs` - Liste tous
- `GET /api/fournisseurs/non-residents` - Non-résidents uniquement
- `POST /api/fournisseurs` - Création (ADMIN/MANAGER)

### 2.4 Référentiel des axes analytiques

**Fonctionnalités :**
- ✅ Code axe (unique)
- ✅ Libellé axe
- ✅ Type d'axe (centre de coût, département, etc.)
- ✅ Statut actif / inactif
- ✅ Reporting multidimensionnel

**Endpoints API :**
- `GET /api/axes-analytiques` - Liste tous
- `GET /api/axes-analytiques/active` - Actifs uniquement
- `POST /api/axes-analytiques` - Création (ADMIN/MANAGER)

### 2.5 Référentiel des comptes bancaires

**Fonctionnalités :**
- ✅ Code du compte (unique)
- ✅ Libellé descriptif
- ✅ **RIB complet - 24 chiffres** (validation automatique)
- ✅ Nom de la banque
- ✅ Agence bancaire
- ✅ Type de compte (général, projet, régie, autre)
- ✅ Statut actif / inactif
- ✅ Validation unicité RIB

**Conformité Maroc :**
- Format RIB : exactement 24 chiffres numériques
- Validation au moment de la saisie

**Endpoints API :**
- `GET /api/comptes-bancaires` - Liste tous
- `GET /api/comptes-bancaires/active` - Actifs uniquement
- `POST /api/comptes-bancaires` - Création (ADMIN/MANAGER)

---

## 3. SAISIE ET SUIVI DES DÉPENSES D'INVESTISSEMENT

L'application permet la saisie structurée, la mise à jour et la consultation complète des dépenses d'investissement avec validation automatique.

### 3.1 Informations liées à la dépense

**Champs disponibles :**
- ✅ Numéro de facture (unique)
- ✅ Date de facture
- ✅ Fournisseur (sélection référentiel)
- ✅ Projet (sélection référentiel)
- ✅ Axe analytique (sélection référentiel)
- ✅ Convention (sélection référentiel)
- ✅ **Montant HT**
- ✅ **Taux de TVA** (20% par défaut)
- ✅ **Montant TVA** (calcul automatique)
- ✅ **Montant TTC** (calcul automatique)
- ✅ Référence marché (si applicable)
- ✅ Numéro décompte (si applicable)

**Retenues fiscales automatiques :**
- ✅ **Retenue TVA** (paramétrable)
- ✅ **Retenue IS tiers** (10% pour non-résidents)
- ✅ **Retenue non-résident** (spécifique)
- ✅ **Retenue garantie** (10% paramétrable)

**Validation métier :**
- Vérification unicité numéro facture
- Calculs automatiques HT/TVA/TTC
- Application automatique des retenues selon le type de fournisseur
- Contrôle cohérence des montants

### 3.2 Informations de paiement

**Champs disponibles :**
- ✅ Date de paiement
- ✅ Référence de paiement (n° virement, chèque, etc.)
- ✅ **Compte bancaire utilisé** (sélection référentiel)
- ✅ **Statut payé/non payé** (indicateur booléen)
- ✅ Remarques (champ texte libre)

**Traçabilité :**
- Date de création automatique
- Date de dernière modification
- Historique complet des changements

### 3.3 Consultation et filtrage avancé des dépenses

**Endpoint de recherche avancée :**
- `POST /api/reporting/depenses/search`

**Critères de filtrage disponibles :**
- ✅ **Période** (date début - date fin)
- ✅ **Année** (2024, 2025, etc.)
- ✅ **Mois** (Janvier à Décembre)
- ✅ **Fournisseur** (sélection unique ou multiple)
- ✅ **Projet** (sélection unique ou multiple)
- ✅ **Convention** (filtrage par convention)
- ✅ **Axe analytique** (filtrage par axe)
- ✅ **Compte bancaire** (paiements via un compte spécifique)
- ✅ **Statut de paiement** (payé / non payé / tous)

**Résultats :**
- Affichage paginé
- Tri multi-colonnes
- Export Excel direct
- Calcul automatique des totaux

**Endpoints API :**
- `GET /api/depenses` - Liste toutes
- `GET /api/depenses/unpaid` - Non payées
- `GET /api/depenses/year/{year}` - Par année
- `POST /api/depenses` - Création (USER/MANAGER/ADMIN)
- `PUT /api/depenses/{id}` - Modification

---

## 4. GESTION ET CALCUL DES COMMISSIONS D'INTERVENTION

L'application automatise entièrement le calcul des commissions d'intervention à partir des conventions paramétrées.

### 4.1 Sélection et application de la convention

**Fonctionnement :**
- ✅ Sélection de la convention via liste déroulante
- ✅ Vérification de la validité (dates début/fin)
- ✅ Application automatique des taux au moment de la saisie
- ✅ **Historisation des taux** : les taux sont figés au moment du calcul

### 4.2 Calcul automatique des commissions

**Algorithme de calcul :**

```
1. Sélection de la base de calcul selon convention :
   - Base HT → Montant HT de la dépense
   - Base TTC → Montant TTC de la dépense
   - Base Autre → Montant paramétrable

2. Calcul commission HT :
   Commission HT = Base × (Taux Commission ÷ 100)

3. Calcul TVA commission :
   TVA Commission = Commission HT × (Taux TVA ÷ 100)

4. Calcul commission TTC :
   Commission TTC = Commission HT + TVA Commission
```

**Caractéristiques :**
- ✅ Calcul instantané lors de la création de la dépense
- ✅ Pas de modification manuelle possible (intégrité des données)
- ✅ Historisation complète : date de calcul, taux appliqués
- ✅ Traçabilité : lien vers la dépense et la convention
- ✅ Recalcul automatique si modification de la dépense (optionnel)

**Endpoints API :**
- `GET /api/commissions` - Liste toutes
- `GET /api/commissions/year/{year}` - Par année
- `GET /api/commissions/depense/{id}` - D'une dépense spécifique
- `POST /api/commissions` - Recalcul manuel (ADMIN)

### 4.3 Suivi des commissions

**Statistiques disponibles :**

#### Par période
- `GET /api/reporting/commissions/stats/periode?annee=2025&mois=12`
- Total commissions HT/TVA/TTC par mois/année

#### Par projet
- `GET /api/reporting/commissions/stats/projet?projetId=1`
- Répartition des commissions par projet
- Identification des projets les plus coûteux en commissions

#### Par fournisseur
- `GET /api/reporting/commissions/stats/fournisseur?fournisseurId=5`
- Commissions générées par fournisseur
- Analyse de la répartition

#### Par convention
- `GET /api/reporting/commissions/stats/convention?conventionId=2`
- Montants générés par convention
- Vérification de l'impact des taux

#### Par axe analytique
- Ventilation des commissions selon les axes
- Reporting multidimensionnel

**Exports Excel :**
- ✅ Export de toutes les commissions : `GET /api/export/excel/commissions/all`
- ✅ Export avec critères : `POST /api/export/excel/commissions`
- ✅ Export des statistiques : `GET /api/export/excel/stats/commissions/{critère}`

---

## 5. REPORTING ET ÉTATS

L'application offre un système complet de reporting avec dashboard en temps réel et exports Excel personnalisés.

### 5.1 Dashboard Global

**Endpoint :** `GET /api/reporting/dashboard`

**Indicateurs affichés :**
- 📊 **Statistiques dépenses**
  - Nombre total de dépenses
  - Total HT, TVA, TTC
  - Dépenses année en cours
  - Dépenses mois en cours

- 💰 **Statistiques commissions**
  - Nombre total de commissions
  - Total commissions HT, TTC
  - Commissions année en cours
  - Commissions mois en cours

- 💳 **Statistiques paiements**
  - Nombre de paiements effectués
  - Nombre de dépenses en attente
  - Montant total payé
  - Montant total en attente
  - **Taux de paiement (%)** en temps réel

- 🏆 **Top 5 Projets**
  - Classement par montant total
  - Nombre de dépenses par projet

- 🏢 **Top 5 Fournisseurs**
  - Classement par montant total
  - Nombre de dépenses par fournisseur

### 5.2 États des commissions

**Ventilations disponibles :**
- ✅ Par période (mois, année)
- ✅ Par projet
- ✅ Par fournisseur
- ✅ Par convention
- ✅ Par axe analytique

**Détails affichés :**
- Nombre de commissions
- Total commission HT
- Total TVA commission
- Total commission TTC
- Taux moyen appliqué

### 5.3 États des dépenses

**Regroupements disponibles :**
- ✅ Dépenses par période
- ✅ Dépenses par projet
- ✅ Dépenses par fournisseur
- ✅ Dépenses par axe analytique
- ✅ Dépenses par compte bancaire

**Détails affichés :**
- Nombre de dépenses
- Total HT, TVA, TTC
- Total des retenues (TVA, IS, garantie, non-résident)
- Statut paiements

**Suivi des paiements :**
- Date de paiement
- Référence de paiement
- Compte bancaire utilisé
- Statut global (payé/en attente)

### 5.4 Export des données Excel

**Fonctionnalités Excel :**
- ✅ Format .xlsx (Excel moderne)
- ✅ En-têtes formatés (couleur, police)
- ✅ Colonnes auto-ajustées
- ✅ **Format monétaire MAD** automatique
- ✅ Format date JJ/MM/AAAA
- ✅ Nom de fichier horodaté
- ✅ Téléchargement direct depuis l'interface

**Types d'exports disponibles :**

1. **Export dépenses détaillées**
   - Toutes les colonnes (22 champs)
   - Filtrage par critères avant export
   - Endpoint : `POST /api/export/excel/depenses`

2. **Export commissions détaillées**
   - 12 colonnes incluant calculs
   - Lien vers dépense d'origine
   - Endpoint : `POST /api/export/excel/commissions`

3. **Export statistiques dépenses**
   - Par période/projet/fournisseur/axe
   - Totaux et agrégations
   - Endpoint : `GET /api/export/excel/stats/depenses/{type}`

4. **Export statistiques commissions**
   - Par période/projet/fournisseur/convention
   - Totaux HT/TVA/TTC
   - Endpoint : `GET /api/export/excel/stats/commissions/{type}`

---

## 6. ARCHITECTURE TECHNIQUE

### 6.1 Stack Technique Retenu

#### Backend - Kotlin + Spring Boot
```
🎨 Kotlin 1.9.23          → Langage moderne JVM, null-safe
🚀 Spring Boot 3.2.5      → Framework enterprise Java
🐘 Gradle 8.7             → Build automation
🐘 PostgreSQL 16          → SGBD relationnel enterprise
🔄 Flyway                 → Gestion migrations schéma
🔐 Spring Security + JWT  → Authentification robuste
📚 Swagger/OpenAPI        → Documentation API automatique
📊 Apache POI 5.2         → Génération Excel
🧪 Testcontainers         → Tests d'intégration
☕ Java 21 LTS            → Runtime JVM long-term support
```

#### Frontend - React 18
```
⚛️  React 18              → Library UI moderne
⚡ Vite                   → Build ultra-rapide
🎨 TailwindCSS 3          → Design system utility-first
🔄 React Query            → State server caching
📋 React Hook Form + Zod  → Validation formulaires
📊 Recharts               → Graphiques interactifs
🎭 Framer Motion          → Animations fluides
```

#### Déploiement
```
☁️  Railway.app            → Hosting backend + PostgreSQL
🌐 GitHub Pages           → Hosting frontend statique
🐳 Docker                 → Containerisation
🔄 GitHub Actions         → CI/CD automatique
```

### 6.2 Architecture Applicative

```
┌─────────────────────────────────────────┐
│         FRONTEND (React 18)             │
│  • Dashboard interactif                 │
│  • Formulaires validation Zod           │
│  • Recherche avancée                    │
│  • Exports Excel                        │
│  • Charts temps réel                    │
└──────────────┬──────────────────────────┘
               │ HTTPS/REST
               │ JSON
               ▼
┌─────────────────────────────────────────┐
│      BACKEND (Kotlin + Spring Boot)     │
│  ┌───────────────────────────────────┐  │
│  │  Controllers (REST API)           │  │
│  │  • Auth, CRUD, Reporting, Export  │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  Services (Business Logic)        │  │
│  │  • Validation métier              │  │
│  │  • Calculs commissions            │  │
│  │  • Génération Excel               │  │
│  │  • Statistiques                   │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  Repositories (Data Access)       │  │
│  │  • Spring Data JPA                │  │
│  │  • Queries custom                 │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  Entities (Domain Model)          │  │
│  │  • 7 entités métier               │  │
│  │  • Relations JPA                  │  │
│  │  • Validation constraints         │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │ JDBC
                   ▼
┌─────────────────────────────────────────┐
│       DATABASE (PostgreSQL 16)          │
│  • 10+ tables relationnelles            │
│  • Indexes optimisés                    │
│  • Contraintes intégrité                │
│  • Migrations Flyway                    │
│  • Backups automatiques                 │
└─────────────────────────────────────────┘
```

### 6.3 Sécurité

**Authentification JWT :**
- ✅ Token access (24h)
- ✅ Token refresh (7 jours)
- ✅ Chiffrement AES-256
- ✅ Protection CSRF

**Autorisation basée sur les rôles :**
- **ADMIN** : Accès total, gestion référentiels
- **MANAGER** : Création projets, validation dépenses
- **USER** : Consultation, saisie dépenses

**Sécurité réseau :**
- ✅ HTTPS obligatoire (TLS 1.3)
- ✅ CORS configuré (origines autorisées)
- ✅ Rate limiting (protection DDoS)
- ✅ Headers sécurité (CSP, X-Frame-Options)

**Protection données :**
- ✅ Validation entrées (SQL injection)
- ✅ Échappement XSS
- ✅ Chiffrement passwords (BCrypt)
- ✅ Logs d'audit complets

### 6.4 Performance et Scalabilité

**Optimisations backend :**
- Connection pooling (HikariCP)
- Lazy loading JPA
- Indexes base de données
- Pagination résultats
- Cache requêtes fréquentes

**Optimisations frontend :**
- Code splitting
- Lazy loading composants
- Debouncing recherches
- Virtualisation listes longues
- Compression assets (gzip/brotli)

**Capacité :**
- 1000+ utilisateurs simultanés
- 100 000+ dépenses
- Export Excel < 3 secondes (1000 lignes)
- Temps de réponse API < 100ms

---

## 7. CONFORMITÉ RÉGLEMENTAIRE MAROC

### 7.1 Conformité Fiscale

L'application intègre les spécificités fiscales marocaines :

**TVA (Taxe sur la Valeur Ajoutée) :**
- ✅ Taux standard 20% (paramétrable)
- ✅ Calcul automatique : TVA = HT × 20%
- ✅ Gestion retenue TVA
- ✅ Édition états TVA conformes

**Identifiants Fiscaux :**
- ✅ **ICE (Identifiant Commun de l'Entreprise)** : 15 chiffres
  - Validation format au moment de la saisie
  - Vérification unicité
  - Obligatoire pour tous les fournisseurs

- ✅ **IF (Identifiant Fiscal)** : validation format
  - Contrôle cohérence
  - Traçabilité complète

- ✅ **RIB (Relevé d'Identité Bancaire)** : 24 chiffres
  - Format standard marocain
  - Validation automatique
  - Gestion multi-comptes

**Retenues Fiscales :**
- ✅ **IS Tiers (Impôt sur les Sociétés)** : 10% pour non-résidents
  - Application automatique selon statut fournisseur
  - Calcul : Retenue IS = Montant × 10%

- ✅ **Retenue Garantie** : 10% paramétrable
  - Applicable selon nature du marché
  - Restitution traçable

- ✅ **Retenue Non-Résident** : spécifique
  - Détection automatique fournisseur non-résident
  - Taux selon convention fiscale

### 7.2 Conformité Comptable

**Principes comptables respectés :**
- ✅ Plan comptable marocain
- ✅ Exercice fiscal (année civile)
- ✅ Pièces justificatives (références factures)
- ✅ Traçabilité complète (audit trail)
- ✅ Immutabilité des écritures (soft delete)

**États comptables :**
- Livre des achats
- État des fournisseurs
- État des paiements
- Rapports TVA
- Détail des retenues

### 7.3 Protection des Données (RGPD & Loi 09-08)

**Conformité Loi 09-08 (Protection des données personnelles au Maroc) :**
- ✅ Déclaration CNDP (si applicable)
- ✅ Consentement utilisateurs
- ✅ Droit d'accès aux données
- ✅ Droit de rectification
- ✅ Droit à l'effacement (soft delete)
- ✅ Chiffrement données sensibles
- ✅ Logs d'accès et modifications

**Sécurité données :**
- Hébergement sécurisé (Railway.app - ISO 27001)
- Backups quotidiens automatiques
- Rétention 30 jours minimum
- Chiffrement at-rest et in-transit

---

## 8. LIVRABLES

### 8.1 Livrables Applicatifs

**Code Source :**
- ✅ Repository GitHub complet
- ✅ Backend Kotlin (~4,500 lignes)
- ✅ Frontend React (~3,000 lignes)
- ✅ Scripts base de données (Flyway migrations)
- ✅ Configuration Docker
- ✅ Configuration CI/CD (GitHub Actions)

**Application déployée :**
- ✅ Backend production (Railway.app)
- ✅ Frontend production (GitHub Pages)
- ✅ Base de données PostgreSQL configurée
- ✅ SSL/TLS activé
- ✅ Monitoring actif

### 8.2 Livrables Documentation

**Documentation Technique :**
- ✅ **README.md** : Installation, configuration, architecture
- ✅ **API Documentation** : Swagger UI interactive (45+ endpoints)
- ✅ **KOTLIN_MIGRATION.md** : Guide migration Java→Kotlin
- ✅ **RAILWAY_DEPLOYMENT.md** : Guide déploiement production
- ✅ **Guide Base de Données** : Schéma, relations, indexes

**Documentation Utilisateur :**
- ✅ **Guide Administrateur** : Configuration référentiels, gestion utilisateurs
- ✅ **Manuel Utilisateur** : Saisie dépenses, consultation, exports
- ✅ **Guide Reporting** : Utilisation dashboard, statistiques, exports Excel
- ✅ **FAQ** : Questions fréquentes et résolutions

**Documentation Métier :**
- ✅ Règles de gestion commissions
- ✅ Calculs fiscaux (TVA, retenues)
- ✅ Workflow validation dépenses
- ✅ Procédures export Excel

### 8.3 Formation et Support

**Formation incluse :**
- ✅ 2 journées formation administrateurs (6h/jour)
  - Configuration référentiels
  - Gestion utilisateurs et rôles
  - Consultation logs et monitoring

- ✅ 2 journées formation utilisateurs (6h/jour)
  - Saisie dépenses et validation
  - Recherche et filtrage avancé
  - Génération rapports et exports Excel

**Support post-livraison :**
- ✅ 3 mois support inclus (email + visio)
- ✅ Hotline technique (jours ouvrables 9h-17h)
- ✅ Correctifs bugs critiques : < 24h
- ✅ Correctifs bugs mineurs : < 7 jours
- ✅ Assistance déploiement

### 8.4 Tests et Recette

**Tests réalisés :**
- ✅ Tests unitaires (couverture > 80%)
- ✅ Tests d'intégration (Testcontainers)
- ✅ Tests API (Postman collection)
- ✅ Tests frontend (React Testing Library)
- ✅ Tests de charge (1000+ utilisateurs)
- ✅ Tests de sécurité (OWASP Top 10)

**Procédure de recette :**
- ✅ Recette fonctionnelle (validation métier)
- ✅ Recette technique (performance, sécurité)
- ✅ Recette utilisateur (UAT)
- ✅ Document de recette signé

---

## 9. PLANNING DE RÉALISATION

### Phase 1 : Conception (2 semaines)
- Semaine 1 :
  - Réunion lancement projet
  - Spécifications fonctionnelles détaillées
  - Maquettes UI/UX (5-10 écrans principaux)
  - Validation architecture technique

- Semaine 2 :
  - Modèle de données détaillé
  - Définition API REST (endpoints)
  - Règles de gestion commissions
  - Validation client

### Phase 2 : Développement Backend (4 semaines)
- Semaine 3 :
  - Configuration projet Kotlin + Spring Boot
  - Entities et migrations Flyway
  - Authentification JWT
  - Repositories Spring Data JPA

- Semaine 4 :
  - Services métier (CRUD référentiels)
  - Validation business rules
  - Services dépenses et commissions
  - Calcul automatique commissions

- Semaine 5 :
  - Controllers REST (28+ endpoints)
  - ReportingService (statistiques)
  - Tests unitaires et intégration

- Semaine 6 :
  - ExcelExportService (Apache POI)
  - Controllers exports Excel
  - Optimisations performance
  - Documentation Swagger

### Phase 3 : Développement Frontend (3 semaines)
- Semaine 7 :
  - Configuration React + Vite + TailwindCSS
  - Authentification et routing
  - Layout et navigation
  - Formulaires référentiels

- Semaine 8 :
  - Pages CRUD (Conventions, Projets, Fournisseurs)
  - Formulaire dépenses avec validation
  - Intégration API backend
  - Gestion erreurs

- Semaine 9 :
  - Dashboard avec statistiques
  - Recherche avancée multi-critères
  - Exports Excel frontend
  - Charts et graphiques

### Phase 4 : Intégration et Tests (2 semaines)
- Semaine 10 :
  - Tests d'intégration end-to-end
  - Tests de charge et performance
  - Tests de sécurité (OWASP)
  - Corrections bugs

- Semaine 11 :
  - Déploiement environnement pré-production
  - Tests UAT avec utilisateurs
  - Corrections remontées utilisateurs
  - Optimisations finales

### Phase 5 : Déploiement et Formation (2 semaines)
- Semaine 12 :
  - Déploiement production (Railway + GitHub Pages)
  - Configuration monitoring
  - Backups automatiques
  - Formation administrateurs (2 jours)

- Semaine 13 :
  - Formation utilisateurs (2 jours)
  - Documentation finalisée
  - Procédure de recette
  - Recette client et signature PV

**DURÉE TOTALE : 13 semaines (3,25 mois)**

---

## 10. HONORAIRES DE RÉALISATION

### 10.1 Décomposition des Coûts

| Poste | Détail | Montant HT |
|-------|--------|------------|
| **Conception** | Architecture, maquettes, spécifications | X MAD |
| **Développement Backend** | Kotlin, Spring Boot, PostgreSQL, API REST | X MAD |
| **Développement Frontend** | React, UI/UX, intégration | X MAD |
| **Reporting & Exports** | Dashboard, statistiques, Excel | X MAD |
| **Tests & Qualité** | Tests unitaires, intégration, sécurité | X 0 MAD |
| **Déploiement & DevOps** | Railway, CI/CD, monitoring | X MAD |
| **Formation** | 4 journées (2 admins + 2 users) | X MAD |
| **Documentation** | Technique, utilisateur, API | X MAD |
| **Support 3 mois** | Hotline, correctifs, assistance | X MAD |
| **TOTAL HT** | | **X MAD** |
| **TVA 20%** | | **X MAD** |
| **TOTAL TTC** | | **X MAD** |

### 10.2 Modalités de Paiement

**Échéancier proposé :**
- 30% à la signature du contrat : 
- 40% à la fin du développement (:
- 30% après recette et mise en production :

**Conditions :**
- Paiement par virement bancaire
- Délai de paiement : 30 jours fin de mois
- Retard de paiement : pénalités 3× taux BCE
- TVA applicable selon législation en vigueur

### 10.3 Ce que Couvre l'Offre

**Inclus dans l'offre :**
- ✅ Conception complète (architecture, maquettes)
- ✅ Développement backend complet (Kotlin + PostgreSQL)
- ✅ Développement frontend complet (React)
- ✅ 45+ endpoints API REST documentés
- ✅ Dashboard avec statistiques temps réel
- ✅ Exports Excel illimités (11+ types d'exports)
- ✅ Recherche avancée multi-critères
- ✅ Calcul automatique commissions
- ✅ Gestion complète des retenues fiscales
- ✅ Validation conformité Maroc (ICE, IF, RIB, TVA)
- ✅ Authentification sécurisée (JWT + rôles)
- ✅ Déploiement cloud (Railway + GitHub Pages)
- ✅ SSL/TLS et sécurité enterprise
- ✅ Monitoring et backups automatiques
- ✅ 4 journées de formation (admins + users)
- ✅ Documentation complète (technique + utilisateur)
- ✅ 3 mois de support post-livraison
- ✅ Tests complets (unitaires, intégration, UAT)
- ✅ Code source complet (GitHub)

**Non inclus (prestations additionnelles sur devis) :**
- ❌ Développement fonctionnalités supplémentaires
- ❌ Support au-delà de 3 mois
- ❌ Formation supplémentaire (au-delà des 4 jours)
- ❌ Migration de données depuis système existant
- ❌ Intégration avec systèmes tiers (ERP, comptabilité)
- ❌ Développement applications mobiles natives (iOS/Android)
- ❌ Audit de sécurité externe certifié
- ❌ Hébergement sur infrastructure privée (on-premise)

### 10.4 Coûts d'Exploitation

**Coûts mensuels après livraison :**
- Backend + PostgreSQL (Railway.app) : ~$5/mois (≈ 50 MAD)
  - Plan gratuit couvre les besoins initiaux
  - Passage au plan payant si > 500 heures d'exécution/mois

- Frontend (GitHub Pages) : **Gratuit**

- Nom de domaine personnalisé (optionnel) : ~100 MAD/an

**Total exploitation : ~200 MAD/mois** (plan gratuit Railway)

---

## 11. GARANTIES ET MAINTENANCE

### 11.1 Garantie de Conformité

**Garantie 12 mois :**
- ✅ Correction de tout bug ou non-conformité aux spécifications
- ✅ Assistance technique par email et visio
- ✅ Correctifs de sécurité critiques
- ✅ Mises à jour mineures

**Délais d'intervention :**
- Bug critique (blocage total) : < 4 heures ouvrées
- Bug majeur (fonctionnalité impactée) : < 24 heures
- Bug mineur (gêne utilisateur) : < 7 jours

### 11.2 Contrat de Maintenance (Optionnel)

**Maintenance préventive et évolutive :**

| Formule | Contenu | Tarif HT/mois |
|---------|---------|---------------|
| **Basic** | • Support email 5j/7<br>• Correctifs bugs<br>• Mises à jour sécurité | 3 000 MAD |
| **Standard** | • Support email + tel 5j/7<br>• Correctifs bugs prioritaires<br>• Mises à jour fonctionnelles<br>• 1 journée évolution/mois | 6 000 MAD |
| **Premium** | • Support 7j/7 avec astreinte<br>• Correctifs en urgence<br>• 2 journées évolution/mois<br>• Optimisations performance<br>• Accompagnement stratégique | 12 000 MAD |

**Services additionnels sur demande :**
- Développement nouvelles fonctionnalités : 800 MAD HT/heure
- Formation supplémentaire : 5 000 MAD HT/jour
- Audit de sécurité : 15 000 MAD HT
- Migration de données : sur devis
- Intégration systèmes tiers : sur devis

### 11.3 SLA (Service Level Agreement)

**Disponibilité garantie :**
- Production : 99,5% de disponibilité mensuelle
- Maintenance programmée : annoncée 7 jours avant
- Fenêtre de maintenance : dimanche 00h-06h

**Performance garantie :**
- Temps de réponse API : < 200ms (95th percentile)
- Chargement page frontend : < 2 secondes
- Export Excel 1000 lignes : < 5 secondes

---

## 12. CONDITIONS GÉNÉRALES

### 12.1 Propriété Intellectuelle

**Code source :**
- Le client devient propriétaire du code source complet après paiement intégral
- Livraison via repository GitHub privé transféré au client
- Droit d'utilisation, modification, redistribution

**Licence logiciels tiers :**
- Utilisation de logiciels open-source (Apache 2.0, MIT)
- Aucune licence propriétaire requise
- Liste complète des dépendances fournie

### 12.2 Responsabilités

**Responsabilités du Prestataire :**
- Développement conforme aux spécifications
- Respect du planning convenu
- Livraison des livrables énoncés
- Support pendant la période de garantie

**Responsabilités du Client :**
- Fourniture des informations nécessaires (données, règles métier)
- Participation aux réunions de validation
- Disponibilité pour tests UAT
- Paiement selon échéancier convenu
- Hébergement et exploitation après livraison

### 12.3 Confidentialité

**Engagement de confidentialité :**
- Toutes les informations échangées restent confidentielles
- Signature d'un NDA (Non-Disclosure Agreement) si requis
- Protection des données selon Loi 09-08
- Suppression sécurisée des données après projet (si demandé)

### 12.4 Résiliation

**Conditions de résiliation :**
- Résiliation possible par écrit avec préavis 30 jours
- Facturation prorata temporis des travaux réalisés
- Livraison de l'état d'avancement à date
- Aucun remboursement des sommes déjà versées

### 12.5 Assurances

**Couverture assurance :**
- Responsabilité Civile Professionnelle : 2 000 000 MAD
- Couverture cyber-risques et protection données
- Attestation d'assurance fournie sur demande

---

## 13. AVANTAGES DE LA SOLUTION PROPOSÉE

### 13.1 Avantages Techniques

**Architecture moderne et pérenne :**
- ✅ Technologies de pointe (Kotlin, React, PostgreSQL)
- ✅ Évolutivité garantie (ajout fonctionnalités facile)
- ✅ Performance optimale (< 100ms API)
- ✅ Sécurité enterprise (JWT, chiffrement, OWASP)

**Accessibilité et mobilité :**
- ✅ Accès depuis n'importe quel navigateur
- ✅ Compatible desktop, tablette, mobile
- ✅ Pas d'installation logicielle requise
- ✅ Mises à jour transparentes pour utilisateurs

### 13.2 Avantages Fonctionnels

**Gain de temps considérable :**
- ✅ Calcul automatique commissions (0 erreur)
- ✅ Exports Excel en 1 clic
- ✅ Recherche avancée multi-critères
- ✅ Dashboard temps réel (pas de mise à jour manuelle)

**Fiabilité des données :**
- ✅ Validation automatique (ICE, RIB, cohérence montants)
- ✅ Historisation complète (traçabilité audit)
- ✅ Pas de saisie manuelle des calculs
- ✅ Intégrité référentielle garantie

**Reporting puissant :**
- ✅ 12+ vues statistiques différentes
- ✅ Ventilation multi-axes (projet, fournisseur, période)
- ✅ KPIs temps réel
- ✅ Top 5 projets/fournisseurs automatiques

### 13.3 Avantages Économiques

**ROI (Retour sur Investissement) rapide :**
- ✅ Réduction temps de saisie : -60%
- ✅ Élimination erreurs calcul : -100%
- ✅ Réduction temps reporting : -80%
- ✅ Pas de licences logicielles (économie ~2000 MAD/poste/an)

**Coûts d'exploitation minimaux :**
- ✅ Hébergement : ~50 MAD/mois
- ✅ Pas de serveur physique à maintenir
- ✅ Mises à jour automatiques sans coût
- ✅ Scalabilité sans investissement infrastructure

**Exemple de calcul ROI :**
```
Hypothèse : 2 personnes à temps partiel sur gestion commissions
Temps gagné : 10h/semaine × 2 personnes = 20h/semaine
Coût horaire moyen : 150 MAD/h
Économie mensuelle : 20h × 4 semaines × 150 MAD = 12 000 MAD/mois
Économie annuelle : 12 000 × 12 = 144 000 MAD/an

Investissement : 260 000 MAD HT
ROI : 260 000 ÷ 144 000 = 1,8 ans (21 mois)
```

### 13.4 Avantages Stratégiques

**Conformité réglementaire :**
- ✅ Conformité fiscale Maroc (ICE, IF, RIB, TVA)
- ✅ Conformité comptable (traçabilité, audit)
- ✅ Protection données (Loi 09-08)
- ✅ Prêt pour audit externe

**Évolutivité future :**
- ✅ Ajout de nouveaux types de commissions
- ✅ Intégration future avec ERP
- ✅ API REST ouverte pour extensions
- ✅ Export vers autres formats (PDF, CSV)

---

## 14. RÉFÉRENCES ET CONTACT

### 14.1 Technologies Utilisées

**Backend :**
- [Kotlin](https://kotlinlang.org/) - Langage JVM moderne
- [Spring Boot](https://spring.io/projects/spring-boot) - Framework Java enterprise
- [PostgreSQL](https://www.postgresql.org/) - SGBD relationnel
- [Apache POI](https://poi.apache.org/) - Génération Excel

**Frontend :**
- [React](https://react.dev/) - Library UI JavaScript
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS utility-first
- [Vite](https://vitejs.dev/) - Build tool ultra-rapide

**Déploiement :**
- [Railway.app](https://railway.app/) - Platform-as-a-Service
- [GitHub Pages](https://pages.github.com/) - Hosting statique
- [GitHub Actions](https://github.com/features/actions) - CI/CD

### 14.2 Normes et Standards

**Sécurité :**
- OWASP Top 10 (sécurité applications web)
- ISO 27001 (hébergement Railway)
- TLS 1.3 (chiffrement transport)
- BCrypt (chiffrement passwords)

**Développement :**
- REST API (architecture standard)
- OpenAPI 3.0 (documentation API)
- Semantic Versioning (gestion versions)
- Git Flow (gestion branches)

**Accessibilité :**
- WCAG 2.1 Level AA (accessibilité web)
- Responsive design (mobile-first)

---

## 15. ACCEPTATION DU DEVIS

Ce devis est valable **60 jours** à compter de sa date d'émission.

**Pour acceptation :**
- Date de début souhaitée : ________________
- Signature du client :
- Date :
- Cachet de l'entreprise :

**Coordonnées :**
- Résidence Granada, Imm. 57, Appt. 21, Hay Riad, Rabat
- CNSS : 5585367
- IF : 65956796
- TP : 25715460
- RC : 178731
- ICE : 003542302000040

---

*

### Annexe  : Captures d'Écran (Maquettes)

*[Maquettes UI/UX seront fournies pendant la phase de conception]*

### Annexe C : Diagramme Base de Données

```
┌─────────────┐      ┌──────────────┐      ┌───────────┐
│ Convention  │      │  Projet      │      │Fournisseur│
├─────────────┤      ├──────────────┤      ├───────────┤
│ id          │      │ id           │      │ id        │
│ code        │      │ code         │      │ code      │
│ libelle     │      │ nom          │      │ raison    │
│ taux_comm   │      │ responsable  │      │ ice       │
│ base_calcul │      │ statut       │      │ if        │
│ taux_tva    │      │ actif        │      │ nonResident
└─────┬───────┘      └──────┬───────┘      └─────┬─────┘
      │                     │                     │
      │    ┌────────────────┴────────────────┐    │
      │    │                                  │    │
      └────┼──────────┐                       ├────┘
           │          │                       │
      ┌────▼──────────▼────────────────────┐ │
      │  DepenseInvestissement             │ │
      ├────────────────────────────────────┤ │
      │ id                                 │ │
      │ numero_facture                     │ │
      │ date_facture                       │◄┘
      │ fournisseur_id (FK)                │
      │ projet_id (FK)                     │
      │ convention_id (FK)                 │
      │ axe_analytique_id (FK)             │
      │ compte_bancaire_id (FK)            │
      │ montant_ht, montant_tva, montant_ttc│
      │ retenue_tva, retenue_is, etc.      │
      │ date_paiement, reference_paiement  │
      │ paye (boolean)                     │
      └──────────────┬─────────────────────┘
                     │
                     │ 1:1
                     │
      ┌──────────────▼─────────────────────┐
      │  Commission                        │
      ├────────────────────────────────────┤
      │ id                                 │
      │ depense_id (FK)                    │
      │ convention_id (FK)                 │
      │ date_calcul                        │
      │ base_calcul                        │
      │ montant_base                       │
      │ taux_commission (historisé)        │
      │ montant_commission_ht              │
      │ montant_tva_commission             │
      │ montant_commission_ttc             │
      └────────────────────────────────────┘
```

---

**Avec nos remerciements, nous vous prions d'agréer, Monsieur le Directeur Général, l'expression de nos sentiments les meilleurs.**

---

**Document généré le 23 décembre 2025**
**Version 1.0 - InvestPro Maroc**
