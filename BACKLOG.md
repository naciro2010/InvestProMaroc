# 📋 BACKLOG - InvestPro Maroc

## 🎯 Vision du Projet

InvestPro est une plateforme complète de gestion de projets d'investissement pour le secteur public marocain, couvrant la planification budgétaire, le suivi des marchés, la gestion des décomptes et paiements avec un système d'analyse multidimensionnelle dynamique.

---

## ✅ Fonctionnalités Implémentées

### 🏗️ Infrastructure de Base
- [x] Backend Spring Boot 3.3.5 + Kotlin 2.0.21
- [x] Frontend React 18 + TypeScript + Vite
- [x] Authentification JWT avec refresh tokens
- [x] Architecture REST API avec OpenAPI/Swagger
- [x] Base de données PostgreSQL avec support JSONB
- [x] Gestion automatique du schéma via Hibernate DDL

### 📊 Plan Analytique Dynamique
- [x] Système de dimensions flexibles (JSONB)
- [x] Gestion des axes analytiques (Budget, Projet, Secteur, etc.)
- [x] Valeurs pour chaque dimension
- [x] Imputation analytique sur lignes de marché
- [x] Reporting avec filtres dynamiques
- [x] Graphiques interactifs (Recharts)
- [x] Export Excel des rapports
- [x] Vues favorites sauvegardables
- [x] Filtres par période

### 🏢 Gestion Financière
- [x] Entités Convention (cadre juridique)
- [x] Fournisseurs avec informations complètes
- [x] Projets avec budgets et suivis
- [x] Bons de commande liés aux marchés

### 📑 Système Marchés
- [x] CRUD complet des marchés
- [x] Liaison marché ↔ convention
- [x] Gestion des lignes de marché avec imputation analytique
- [x] Système d'avenants avec impact financier
- [x] Calcul automatique des montants (HT, TVA, TTC)
- [x] Statuts : EN_COURS, VALIDE, TERMINE, ANNULE
- [x] Retenue de garantie
- [x] Suivi délais et dates
- [x] Recherche et filtres avancés
- [x] Statistiques temps réel (dashboard)

### 📈 Rapports et Statistiques
- [x] Dashboard Massari (style classique)
- [x] Dashboard Modern (style épuré)
- [x] Graphiques de répartition budgétaire
- [x] Évolution temporelle des engagements
- [x] Top fournisseurs
- [x] Analyse par secteur/département

---

## 🚀 Fonctionnalités En Développement

### 📝 Décomptes (Priority: HIGH)
- [ ] **Modèle de données**
  - [x] Entité Decompte avec relations
  - [x] DecompteImputation avec JSONB
  - [ ] Validation règles métier
  - [ ] Calcul automatique cumuls

- [ ] **Interface Frontend**
  - [ ] Page liste avec filtres (partiellement faite)
  - [ ] Formulaire création/édition
  - [ ] Vue détaillée avec historique
  - [ ] Import lignes depuis marché
  - [ ] Validation multi-niveaux

- [ ] **Workflow**
  - [ ] Brouillon → Soumis → Validé → Rejeté
  - [ ] Notifications aux valideurs
  - [ ] Commentaires et pièces jointes
  - [ ] Traçabilité complète

- [ ] **Contrôles**
  - [ ] Vérification montants vs marché
  - [ ] Contrôle cumul décomptes ≤ marché
  - [ ] Alertes dépassements
  - [ ] Validation analytique

### 💰 Ordres de Paiement (Priority: HIGH)
- [ ] **Modèle de données**
  - [x] Entité OrdrePaiement avec relations
  - [x] OpImputation avec JSONB
  - [ ] États : PREPARE, TRANSMIS, VALIDE, EXECUTE
  - [ ] Retenue de garantie

- [ ] **Interface Frontend**
  - [ ] Page liste avec recherche
  - [ ] Création depuis décompte validé
  - [ ] Édition avec pièces justificatives
  - [ ] Suivi état avancement

- [ ] **Intégrations**
  - [ ] Génération numéro automatique
  - [ ] Calcul retenue de garantie
  - [ ] Export format comptabilité
  - [ ] Vérification disponibilité budgétaire

### 💳 Paiements (Priority: MEDIUM)
- [ ] **Modèle de données**
  - [x] Entité Paiement avec relations
  - [x] PaiementImputation avec JSONB
  - [ ] Types paiement (virement, chèque)
  - [ ] Références bancaires

- [ ] **Interface Frontend**
  - [ ] Enregistrement paiement effectué
  - [ ] Rapprochement bancaire
  - [ ] Historique paiements
  - [ ] États de trésorerie

- [ ] **Rapports**
  - [ ] Journal des paiements
  - [ ] Paiements en attente
  - [ ] Prévisions trésorerie
  - [ ] Analyse par fournisseur

---

## 📋 Backlog Fonctionnel

### 🔐 Gestion des Utilisateurs et Permissions (Priority: HIGH)
- [ ] Rôles : ADMIN, GESTIONNAIRE, COMPTABLE, VALIDEUR, CONSULTANT
- [ ] Permissions granulaires par module
- [ ] Profils personnalisables
- [ ] Journalisation actions utilisateurs
- [ ] Double validation pour montants élevés

### 📂 Gestion Documentaire (Priority: MEDIUM)
- [ ] Upload pièces jointes (marchés, décomptes, OP)
- [ ] Types documents : Cahier charges, Facture, PV, etc.
- [ ] Versioning documents
- [ ] Recherche full-text
- [ ] Stockage cloud (S3/MinIO)
- [ ] Signature électronique

### 🔔 Notifications et Alertes (Priority: MEDIUM)
- [ ] Notifications temps réel (WebSocket)
- [ ] Emails automatiques (validation, rejet, etc.)
- [ ] Alertes dépassement budget
- [ ] Rappels échéances
- [ ] Tableau de bord notifications

### 📊 Reporting Avancé (Priority: LOW)
- [ ] Générateur rapports personnalisés
- [ ] Templates prédéfinis
- [ ] Exports multiples (PDF, Excel, CSV)
- [ ] Rapports programmés (hebdo/mensuel)
- [ ] Tableaux de bord personnalisables
- [ ] KPIs configurables

### 🔍 Recherche et Filtres Avancés (Priority: MEDIUM)
- [ ] Recherche full-text Elasticsearch
- [ ] Filtres multicritères sauvegardables
- [ ] Recherche par montant/période
- [ ] Historique recherches
- [ ] Suggestions intelligentes

### 📈 Business Intelligence (Priority: LOW)
- [ ] Analyse prédictive budgets
- [ ] Détection anomalies
- [ ] Tendances et forecasting
- [ ] Benchmarking inter-projets
- [ ] Scoring fournisseurs

### 🔄 Workflows et Automatisation (Priority: MEDIUM)
- [ ] Workflow engine configurable
- [ ] Automatisation validation simple
- [ ] Règles métier configurables
- [ ] Délégations de signature
- [ ] Processus parallèles

### 🌐 Intégrations Externes (Priority: LOW)
- [ ] Import fichiers Excel (budget, marchés)
- [ ] Export comptabilité (SAGE, Ciel)
- [ ] API publique REST
- [ ] Webhooks événements
- [ ] Intégration e-mail

### 📱 Mobile et Accessibilité (Priority: LOW)
- [ ] Application mobile (React Native)
- [ ] Mode hors-ligne
- [ ] Responsive design amélioré
- [ ] PWA (Progressive Web App)
- [ ] Accessibilité WCAG 2.1 AA

### 🔒 Sécurité et Conformité (Priority: HIGH)
- [ ] Audit trail complet
- [ ] Encryption at rest
- [ ] Rate limiting API
- [ ] Tests sécurité (OWASP)
- [ ] Conformité RGPD
- [ ] Backup automatique
- [ ] Plan reprise activité

---

## 🛠️ Dette Technique

### Backend
- [ ] Tests unitaires (couverture < 20%)
- [ ] Tests d'intégration
- [ ] Monitoring APM (Prometheus/Grafana)
- [ ] Logs structurés (ELK)
- [ ] Cache Redis
- [ ] CI/CD pipeline
- [ ] Documentation API complète
- [ ] Performance tuning requêtes
- [ ] Indexes optimisés PostgreSQL

### Frontend
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Tests composants (Vitest)
- [ ] Storybook composants UI
- [ ] Optimisation bundle size
- [ ] Lazy loading routes
- [ ] Error boundaries
- [ ] Skeleton loaders
- [ ] Dark mode
- [ ] i18n (Français/Arabe)

### Infrastructure
- [ ] Containerization Docker
- [ ] Orchestration Kubernetes
- [ ] Reverse proxy (Nginx)
- [ ] SSL/TLS certificates
- [ ] Monitoring uptime
- [ ] Backup strategy
- [ ] Disaster recovery

---

## 📐 Architecture Technique

### Stack Actuel
**Backend:**
- Spring Boot 3.3.5 (Java 21)
- Kotlin 2.0.21
- Spring Data JPA + Hibernate
- PostgreSQL 14+ avec JSONB
- JWT Authentication
- OpenAPI 3.0 / Swagger

**Frontend:**
- React 18
- TypeScript 5.x
- Vite 5.x
- React Router v6
- Recharts (graphiques)
- Axios (HTTP)
- Tailwind CSS

### Architecture Proposée

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Marchés     │  │  Décomptes   │  │  Paiements   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Reporting   │  │  Analytics   │  │  Admin       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    REST API (HTTPS)
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Controllers (REST API)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Services (Business Logic + Transactions)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Repositories (Spring Data JPA)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Security (JWT + Spring Security)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                           │
│  - Entities (JPA/Hibernate)                                  │
│  - JSONB (Plan Analytique)                                   │
│  - Indexes & Constraints                                     │
│  - Schema auto-managed by Hibernate                          │
└─────────────────────────────────────────────────────────────┘
```

### Modèle de Données

#### Entités Principales

**Convention** (Cadre juridique)
- code, libelle, dateSignature, dateFinPrevue
- typeBudget, montantAutorise
→ OneToMany: Marchés

**Marche** (Marché public)
- numeroMarche, numAo, dateMarche
- objet, montantHt, montantTva, montantTtc
- statut, dateDebut, dateFinPrevue
- delaiExecutionMois, retenueGarantie
→ ManyToOne: Convention, Fournisseur
→ OneToMany: MarcheLignes, Avenants, BonsCommande, Decomptes

**MarcheLigne** (Ligne de marché avec analytique)
- numeroLigne, designation, unite
- quantite, prixUnitaireHT, montantHT
- **imputationAnalytique (JSONB)**: {"dimension_code": "valeur_code"}
→ ManyToOne: Marche

**AvenantMarche** (Modification de marché)
- numeroAvenant, dateAvenant, statut
- montantInitialHT, montantAvenantHT, montantApresHT
- pourcentageVariation
- delaiInitialMois, delaiSupplementaireMois, delaiApresMois
→ ManyToOne: Marche

**Decompte** (Demande de paiement)
- numeroDecompte, dateDecompte, typeDecompte
- periode, montantHt, montantTva, montantTtc
- statut, dateValidation, validePar
→ ManyToOne: Marche
→ OneToMany: DecompteImputations, OrdresPaiement

**DecompteImputation** (Imputation analytique décompte)
- montant
- **dimensionsValeurs (JSONB)**: {"dimension_code": "valeur_code"}
→ ManyToOne: Decompte

**OrdrePaiement** (OP)
- numeroOp, dateEmission, montantBrut
- retenueGarantie, montantNet
- statut, dateVisa, dateOrdonnancement
→ ManyToOne: Decompte
→ OneToMany: OpImputations, Paiements

**OpImputation** (Imputation analytique OP)
- montant
- **dimensionsValeurs (JSONB)**: {"dimension_code": "valeur_code"}
→ ManyToOne: OrdrePaiement

**Paiement** (Paiement effectif)
- numeroPaiement, datePaiement, montantPaye
- modePaiement, referenceBancaire
→ ManyToOne: OrdrePaiement
→ OneToMany: PaiementImputations

**PaiementImputation** (Imputation analytique paiement)
- montant
- **dimensionsValeurs (JSONB)**: {"dimension_code": "valeur_code"}
→ ManyToOne: Paiement

**PlanAnalytiqueDimension** (Dimensions configurables)
- code, libelle, ordre, actif
→ OneToMany: Valeurs

**PlanAnalytiqueValeur** (Valeurs par dimension)
- code, libelle, ordre, actif
→ ManyToOne: Dimension

---

## 🎯 Roadmap

### Phase 1 : MVP Décomptes (T1 2025)
- Compléter module Décomptes (CRUD complet)
- Workflow validation
- Contrôles métier
- Interface utilisateur complète

### Phase 2 : Ordres de Paiement (T2 2025)
- Module OP complet
- Intégration Décomptes → OP
- Export comptable
- Suivi trésorerie

### Phase 3 : Gestion Avancée (T3 2025)
- Paiements et rapprochement bancaire
- Gestion documentaire
- Notifications et alertes
- Permissions avancées

### Phase 4 : Optimisations (T4 2025)
- Performance et scalabilité
- Reporting avancé
- Mobile app
- Intégrations tierces

---

## 📊 Métriques de Succès

### Techniques
- ✅ Backend build < 60s
- ✅ Frontend build < 45s
- ⏳ Test coverage > 80%
- ⏳ API response time < 200ms (p95)
- ⏳ Zero downtime deployments

### Fonctionnelles
- ✅ Système Plan Analytique flexible
- ✅ Gestion complète marchés
- ⏳ Workflow décomptes end-to-end
- ⏳ Rapports en temps réel
- ⏳ Adoption utilisateurs > 90%

### Business
- ⏳ Réduction temps traitement décomptes (-50%)
- ⏳ Visibilité budgétaire temps réel
- ⏳ Conformité audit 100%
- ⏳ Satisfaction utilisateurs > 85%

---

## 🤝 Contribution

### Workflow Git
1. Créer une branche depuis `main`
2. Développer et committer
3. Push et créer une Pull Request
4. Review + tests automatiques
5. Merge après validation

### Standards Code
- **Backend**: Kotlin conventions, KotlinLogging
- **Frontend**: TypeScript strict, ESLint + Prettier
- **Commits**: Conventional Commits (feat, fix, docs, etc.)
- **Tests**: Tests unitaires requis pour business logic

### Documentation
- ✅ BACKLOG.md (ce fichier)
- ⏳ README.md avec setup
- ⏳ Architecture Decision Records (ADR)
- ⏳ API documentation (OpenAPI)
- ⏳ User guides

---

**Dernière mise à jour:** 2025-12-30
**Version:** 1.0.0
**Statut:** 🚀 En développement actif
