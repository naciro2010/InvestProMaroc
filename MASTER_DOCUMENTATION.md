# 📘 InvestPro Maroc - Documentation Maître

> **Document Unique et Consolidé** - Toutes les informations projet en un seul endroit
>
> Dernière mise à jour: 16 Janvier 2026

---

## 📋 Table des Matières

1. [Vue d'Ensemble du Projet](#vue-densemble-du-projet)
2. [Accès & Comptes de Test](#accès--comptes-de-test)
3. [Architecture Technique](#architecture-technique)
4. [Guide Backend](#guide-backend)
5. [Guide Frontend](#guide-frontend)
6. [Composants de Formulaire (react-hook-form + Zod)](#composants-de-formulaire-react-hook-form--zod)
7. [Modèle de Données - Conventions (extrait)](#modèle-de-données---conventions-extrait)
8. [État d'Implémentation Actuel](#état-dimplémentation-actuel)
9. [Backlog & Roadmap](#backlog--roadmap)
10. [Standards de Développement](#standards-de-développement)
11. [Guides de Déploiement](#guides-de-déploiement)
12. [Historique des Changements](#historique-des-changements)
13. [Prochaines Actions Immédiates](#prochaines-actions-immédiates)
14. [Références](#références)

---

## 🎯 Vue d'Ensemble du Projet

### Qu'est-ce qu'InvestPro Maroc?

**InvestPro Maroc** est une plateforme de gestion financière complète pour suivre les dépenses d'investissement et calculer les commissions d'intervention au Maroc.

### Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | Kotlin 2.0.21, Spring Boot 3.4.1, PostgreSQL 16/17, JWT Auth |
| **Frontend** | React 18, TypeScript 5.x, Vite, Material-UI, TailwindCSS, Recharts |
| **Base de Données** | PostgreSQL 16/17 avec JSONB pour dimensions analytiques |
| **Déploiement** | Railway (Backend + Frontend) |
| **CI/CD** | GitHub Actions (tests automatiques) |

### Commandes Essentielles

```bash
# Backend
cd backend
./gradlew bootRun                    # Serveur dev (port 8080)
./gradlew clean build                # Build complet avec tests
./gradlew test                       # Tests uniquement

# Frontend
cd frontend
npm install                          # Installer dépendances
npm run dev                          # Serveur dev (port 5173)
npm run build                        # Build production
npm run lint                         # Vérifier code

# Base de données
docker-compose up -d postgres        # Démarrer PostgreSQL
```

---

## 🔐 Accès & Comptes de Test

Lors du déploiement initial, des utilisateurs de test sont créés automatiquement. **Changez les mots de passe en production.**

| Utilisateur | Email | Mot de passe | Rôle |
|-------------|-------|--------------|------|
| admin | admin@investpro.ma | `admin123` | ADMIN |
| manager | manager@investpro.ma | `manager123` | MANAGER |
| analyst | analyst@investpro.ma | `analyst123` | MANAGER |
| controller | controller@investpro.ma | `controller123` | MANAGER |
| user | user@investpro.ma | `user123` | USER |
| supervisor | supervisor@investpro.ma | `supervisor123` | USER |

```bash
# Tester la connexion (JWT)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🏗️ Architecture Technique

### Structure Monorepo

```
InvestProMaroc/
├── backend/                         # Spring Boot Kotlin API
│   ├── src/main/kotlin/ma/investpro/
│   │   ├── controller/              # REST endpoints
│   │   ├── service/                 # Logique métier (extend GenericCrudService)
│   │   ├── repository/              # Spring Data JPA
│   │   ├── entity/                  # JPA entities (extend BaseEntity)
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── mapper/                  # Entity ↔ DTO
│   │   ├── security/                # JWT authentication
│   │   └── config/                  # Configuration Spring
│   └── src/main/resources/
│       └── db/migration/            # Flyway migrations (V1, V2, V3 ONLY)
│
├── frontend/                        # React TypeScript SPA
│   └── src/
│       ├── pages/                   # Route-level components
│       ├── components/              # Composants réutilisables
│       │   ├── layout/              # AppLayout, Sidebar
│       │   └── ui/                  # Button, Card, Modal, RichTextEditor
│       ├── lib/                     # API client (axios), utilities
│       ├── contexts/                # AuthContext, ToastContext
│       └── types/                   # TypeScript types
│
└── legacy/                          # Ancien codebase XCOMPTA (référence)
```

### Architecture Backend (Couches)

```
HTTP Request → JwtAuthenticationFilter (valide JWT)
              ↓
           SecurityFilterChain (@PreAuthorize roles)
              ↓
           Controller (valide input, délègue)
              ↓
           Service (logique métier, extend GenericCrudService<Entity, Long>)
              ↓
           Repository (Spring Data JPA)
              ↓
           PostgreSQL + ApiResponse<T>
```

### Architecture Frontend (React)

```
App.tsx → React Router → AuthProvider → AppLayout
         → Pages → API Client (axios) → Backend API
```

### Patterns Clés

| Pattern | Localisation | Usage |
|---------|--------------|-------|
| **GenericCrudService** | `backend/service/` | Base CRUD pour toutes entités |
| **BaseEntity** | `backend/entity/BaseEntity.kt` | Champs audit (id, createdAt, updatedAt, actif) |
| **JWT Auth** | `backend/security/` | Access + refresh tokens, stateless |
| **DTO Pattern** | `backend/dto/` | Découple API des entities JPA |
| **Axios Interceptors** | `frontend/lib/api.ts` | Injection JWT, auto-refresh, logout |
| **AuthContext** | `frontend/contexts/` | État global auth (React Context) |
| **ApiResponse<T>** | Backend controllers | Wrapper: `{success, message, data}` |

---

## 🧩 Guide Backend

### Démarrage rapide
```bash
cd backend
docker-compose up -d                 # PostgreSQL local
./gradlew clean build -x test         # Build sans tests
./gradlew bootRun                     # API: http://localhost:8080
```

### Build & Tests
```bash
./gradlew clean bootJar -x test       # Build rapide
./gradlew clean build                 # Build + tests (Testcontainers)
./gradlew test --tests "AuthIntegrationTest"
```

### Docker
```bash
docker build -t investpro-backend:1.0.0 .
docker run -d -p 8080:8080 \
  -e DATABASE_URL=postgresql://postgres:password@db:5432/investpro \
  -e JWT_SECRET=your_secret_key \
  investpro-backend:1.0.0
```

### Migrations & API
- Flyway exécute les migrations au démarrage (`src/main/resources/db/migration/`).
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health check: `http://localhost:8080/actuator/health`
- Base path API: `/api/v1/*`

### Variables d'Environnement (extraits)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/investpro
spring.datasource.username=postgres
spring.datasource.password=postgres
app.jwt.secret=dev_secret_key_change_in_production
```

---

## 🎨 Guide Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

---

## 🧾 Composants de Formulaire (react-hook-form + Zod)

Les formulaires sont standardisés via `react-hook-form` + `Zod`. Les composants sont dans `frontend/src/components/form/`.

**Composants principaux:**
- `FormTextField` (texte, email, tel, url, multiline)
- `FormNumberField` (min/max/step)
- `FormDateField` (date/datetime-local/month)
- `FormSelectField` (options, multi-sélection)
- `FormRadioGroup` (options en ligne ou colonne)
- `FormCheckbox` (booléen)
- `FormErrors` (liste des erreurs)
- `FormSection` (sections avec titre, icône, colonnes)

```tsx
<FormTextField
  name="code"
  control={control}
  label="Code"
  placeholder="CONV-2026-001"
  required
/>
```

---

## 📚 Modèle de Données - Conventions (extrait)

Fichiers de référence: `backend/src/main/kotlin/ma/investpro/entity/Convention.kt` et entités associées.

**Convention (champ clés):**
- Identité: `code`, `numero`, `libelle`, `objet`
- Dates: `dateConvention`, `dateDebut`, `dateFin`
- Financier: `budget`, `tauxCommission`, `baseCalcul`, `tauxTva`
- Workflow: `statut`, `dateSoumission`, `dateValidation`, `version`, `isLocked`
- Hiérarchie: `parentConvention`, `sousConventions`, `heriteParametres`

**Relations majeures:**
- `ConventionPartenaire` (budget alloué, %)
- `Subvention` (financements)
- `ImputationPrevisionnelle` (planification)
- `VersementPrevisionnel` (échéancier)

---

## 📊 État d'Implémentation Actuel

### ✅ Modules Complets (90%+)

#### 1. Authentification & Sécurité
- JWT avec access + refresh tokens
- Rôles: ADMIN, MANAGER, USER
- Spring Security 6.x avec @PreAuthorize
- Comptes test: admin/admin123, manager/manager123, user/user123

#### 2. Conventions
- Types: CADRE, NON_CADRE, SPECIFIQUE, AVENANT
- Workflow: BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE
- **Sous-Conventions** avec héritage paramètres
- **Avenants** avec JSONB (historique complet, workflow BROUILLON/SOUMIS/VALIDE)
- RichTextEditor pour objet détaillé
- ✅ **SimpleConventionForm.tsx** - LE BON formulaire (à garder!)
- ❌ **Problème identifié**: 2 autres wizards (ConventionWizard, ConventionWizardComplete) créent confusion

#### 3. Projets
- Codes, désignations, budgets
- Statuts
- Link vers conventions

#### 4. Marchés (Contrats)
- Types: TRAVAUX, FOURNITURES, SERVICES
- Géolocalisation (adresse, latitude, longitude, zoneGeographique)
- Carte interactive (Leaflet/OpenStreetMap)
- Lignes de marché (MarcheLigne) avec JSONB imputations
- Avenants marchés
- ⚠️ **Problème**: Pas de wizard 3 étapes comme legacy

#### 5. Fournisseurs
- ICE (15 chiffres), IF (tax ID), RIB
- CRUD complet

#### 6. Plan Analytique Dynamique
- Dimensions configurables (JSONB)
- Valeurs de dimension
- Imputations analytiques flexibles
- Page configuration `/parametrage/plan-analytique`

#### 7. Reporting Analytique
- Filtres dynamiques JSONB
- Visualisations Recharts
- Exports

### ⚠️ Modules Partiels (60-75%)

#### 1. Décomptes
- Backend: ✅ Entité complète (montant, netAPayer, retenues)
- Frontend: ❌ Page liste basique uniquement
- **Manque**: Formulaire création, workflow, calcul retenues

#### 2. Ordres de Paiement
- Backend: ✅ Entité existe
- Frontend: ❌ Page "Under Construction"
- **Manque**: UI complète

#### 3. Paiements
- Backend: ✅ Entité existe
- Frontend: ❌ Page "Under Construction"
- **Manque**: UI complète

#### 4. Budgets
- Backend: ✅ Entité existe (versions, révisions)
- Frontend: ❌ Minimal
- **Manque**: Versioning, révisions, workflow

### ❌ Fonctionnalités Manquantes (Critiques)

#### 1. Maîtres d'Œuvre (MO/MOD)
- **Legacy avait**: Entité dédiée, tables séparées, gestion complète
- **Actuel**: Seulement flags (estMaitreOeuvre, estMaitreOeuvreDelegue) dans ConventionPartenaire
- **Impact**: ❌ Impossible gérer MO/MOD avec attributs propres et lifecycle
- **PRIORITÉ 1** 🔴

#### 2. Gestion Documents/Pièces Jointes
- Backend: ✅ Entité PiecesJointes existe (V2 migration Section 12)
- Frontend: ❌ Pas d'upload/versioning visible
- **Legacy avait**: Dropzone dans chaque formulaire (Convention, Marché, Décompte, Avenant)
- **PRIORITÉ 1** 🔴

#### 3. Wizard Multi-Étapes pour Marchés
- **Legacy avait**: 3 étapes (Info → Lignes Prix → Imputations)
- **Actuel**: Formulaire long et plat
- **PRIORITÉ 2** 🟠

#### 4. Versements Prévisionnels UI
- Backend: ✅ Entité VersementPrevisionnel existe
- Frontend: ❌ Pas de CRUD visible
- **Legacy avait**: Table dynamique avec Date/Montant/Partenaire/MOD
- **PRIORITÉ 2** 🟠

#### 5. Calcul Auto Commission d'Intervention (CI)
- **Legacy avait**: CI = Budget × Taux (auto-calculé par partenaire)
- **Actuel**: Champ manuel dans ConventionPartenaire
- **PRIORITÉ 2** 🟠

#### 6. Exports Avancés
- **Legacy avait**: DataTables avec CSV, Excel, PDF, Print
- **Actuel**: Exports basiques uniquement
- **PRIORITÉ 3** 🟡

#### 7. Page Détail Convention Complète
- **Legacy avait**:
  - Section Partenaires (tableau avec Budget(M), %, CI(M))
  - Section MO/MOD (listes séparées)
  - Section Imputations Prévisionnelles (Axe, Projet, Volet, Dates, Délai)
  - Section Versements Prévisionnels (Axe, Projet, Volet, Date, Montant, Partenaire, MOD)
- **Actuel**:
  - Info basique convention
  - Tab "Sous-conventions"
  - ❌ Pas de section Partenaires CRUD
  - ❌ Pas de section MO/MOD
  - ❌ Pas de documents attachés
- **PRIORITÉ 1** 🔴

---

## 🎯 Backlog & Roadmap

### 🔴 PRIORITÉ 1 - Regressions Critiques vs Legacy

#### Task 1.1: Supprimer Wizards Redondants
- [ ] Supprimer `ConventionWizard.tsx`
- [ ] Supprimer `ConventionWizardComplete.tsx`
- [ ] Garder UNIQUEMENT `SimpleConventionForm.tsx` (a le RichTextEditor)
- [ ] Mettre à jour routes dans `App.tsx`

#### Task 1.2: Améliorer SimpleConventionForm
- [ ] Ajouter section "Partenaires" avec table dynamique (+/- lignes)
  - Champs: Partenaire, Budget(M), %, CI (auto-calculé)
- [ ] Ajouter section "Maîtres d'Œuvre" (MO)
- [ ] Ajouter section "Maîtres d'Œuvre Délégués" (MOD)
- [ ] Ajouter upload documents (Dropzone)
- [ ] Implémenter calcul auto CI = Budget × TauxCommission

#### Task 1.3: Créer Entité Backend MaitreOeuvre
```kotlin
@Entity
@Table(name = "maitres_oeuvre")
data class MaitreOeuvre(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(nullable = false)
    var code: String,

    @Column(nullable = false)
    var designation: String,

    @Column(name = "type_mo", nullable = false)
    @Enumerated(EnumType.STRING)
    var typeMo: TypeMaitreOeuvre, // MO ou MOD

    @Column
    var email: String? = null,

    @Column
    var telephone: String? = null,

    @Column
    var adresse: String? = null
) : BaseEntity()

enum class TypeMaitreOeuvre {
    MO,     // Maître d'Œuvre
    MOD     // Maître d'Œuvre Délégué
}
```
- [ ] Migration V2 (ajouter dans Section 12)
- [ ] CRUD complet (Repository, Service, Controller, DTO)
- [ ] Tests

#### Task 1.4: ConventionDetailPageV2 Complète
Refaire la page détail convention avec toutes sections:

**Sections à implémenter:**
1. **Info Convention** (lecture seule, card bleu)
   - Libellé, Objet, Code, Type
   - Dates (Convention, Début, Fin)
   - Budget, Taux Commission, Base Calcul, TVA
   - Statut (badge coloré)

2. **Onglet 1: Partenaires** (table CRUD inline)
   - Colonnes: Partenaire, Budget(M), %, CI(M), Actions
   - Bouton "+ Ajouter Partenaire"
   - Modal édition

3. **Onglet 2: Maîtres d'Œuvre (MO)**
   - Table: Code, Désignation, Email, Téléphone, Actions
   - Bouton "+ Ajouter MO"

4. **Onglet 3: Maîtres d'Œuvre Délégués (MOD)**
   - Table: Code, Désignation, Email, Téléphone, Actions
   - Bouton "+ Ajouter MOD"

5. **Onglet 4: Imputations Prévisionnelles**
   - Table: Axe, Projet, Volet, Date Démarrage, Délai, Date Fin Prévue
   - Import depuis Plan Analytique

6. **Onglet 5: Versements Prévisionnels**
   - Table: Axe, Projet, Volet, Date Versement, Montant(M), Partenaire, MOD
   - Cumul total affiché

7. **Onglet 6: Sous-Conventions** (déjà existant, à conserver)

8. **Onglet 7: Documents Attachés**
   - Liste documents avec nom, type, taille, date, actions
   - Dropzone upload
   - Téléchargement/suppression

9. **Actions Convention** (header)
   - Boutons workflow: Soumettre, Valider, Rejeter, Archiver
   - Export PDF
   - Créer Avenant
   - Créer Sous-Convention

#### Task 1.5: Gestion Documents (PiecesJointes)
Backend déjà prêt (V2 Section 12), ajouter frontend:
- [ ] Composant `DocumentUploader.tsx` (Dropzone)
- [ ] API endpoints upload/download/delete
- [ ] Stockage fichiers (filesystem ou S3)
- [ ] Versioning documents
- [ ] Intégrer dans Convention/Marché/Décompte detail pages

---

### 🟠 PRIORITÉ 2 - Améliorations UX Majeures

#### Task 2.1: Wizard Marchés 3 Étapes
Créer `MarcheWizard.tsx` avec:
- **Étape 1: Informations Marché**
  - N°, Consultation, Dates, Montants HT/TVA/TTC
  - Fournisseur (select avec recherche)
  - Type prestation, Taux RG, Taux Limite, Caution Bancaire
  - Adresse + géolocalisation (map)

- **Étape 2: Prix et Détails**
  - Table dynamique lignes prix
  - Colonnes: N°Prix, Désignation, Quantité, PU HT, Total
  - Auto-calcul totaux
  - Ajout/suppression lignes inline

- **Étape 3: Imputations Analytiques**
  - Table dynamique imputations
  - Colonnes: Convention, Axe, Projet, Volet, Montant
  - Sélection depuis Plan Analytique
  - Vérification: Total imputations = Total marché

#### Task 2.2: Ajouter Champs Manquants dans Marché
Backend (entity/migration):
```kotlin
@Column(name = "taux_rg")
var tauxRg: BigDecimal? = null  // % Retenue de Garantie

@Column(name = "taux_limite")
var tauxLimite: BigDecimal? = null

@Column(name = "caution_bancaire")
var cautionBancaire: BigDecimal? = null
```
- [ ] Migration V2 (Section 5: Markets)
- [ ] DTO update
- [ ] Form fields

#### Task 2.3: MarcheDetailPageV2
Refaire page détail marché:
- **Section 1: Info Marché** (card lecture seule)
- **Section 2: Prix et Détails** (table lignes + totaux calculés)
- **Section 3: Imputations** (table avec % allocation)
- **Section 4: Décomptes** (liste + cumul progression)
- **Section 5: Avenants** (liste + bouton créer)
- **Section 6: Documents**
- **Actions**: Créer Décompte, Créer Avenant, Export PDF

#### Task 2.4: Page Décomptes Complète
- [ ] `DecompteForm.tsx` (wizard 2 étapes)
  - Étape 1: Info (Marché, Période, Montant Brut, Date)
  - Étape 2: Retenues (RG, RAS, Pénalités) + Calcul Net à Payer
- [ ] `DecompteDetailPage.tsx`
- [ ] Workflow: BROUILLON → VALIDE → PAYE
- [ ] Calculs auto: Net à Payer = Montant Brut - Retenues

---

### 🟡 PRIORITÉ 3 - Fonctionnalités Avancées

#### Task 3.1: Commission Calculation Engine
- [ ] Scenarios: Simple, Tranches, Exclusions
- [ ] Backend service `CommissionCalculationService`
- [ ] UI preview calcul avant validation

#### Task 3.2: Exports Avancés
- [ ] ExcelJS pour exports personnalisés
- [ ] Templates Excel prédéfinis
- [ ] Export PDF avec mise en page professionnelle
- [ ] Exports batch (multi-conventions, multi-marchés)

#### Task 3.3: Rapprochement Bancaire
- [ ] Import fichiers bancaires (CSV, Excel)
- [ ] Matching auto paiements ↔ transactions
- [ ] Écarts et ajustements
- [ ] Export réconciliation

#### Task 3.4: Budget Versioning
- [ ] Versions budgétaires (V1, V2, V3...)
- [ ] Révisions avec motif
- [ ] Comparaison versions (diff view)
- [ ] Workflow validation budget

---

### 🔵 PRIORITÉ 4 - Polish & UX

#### Task 4.1: Unifier Design System
Problème: Mix Tailwind + MUI crée incohérence

**Décision**: Standardiser sur **Material-UI** (comme SimpleConventionForm)
- [ ] Refactorer tous les formulaires vers MUI
- [ ] Supprimer Tailwind des pages métier (garder seulement layout)
- [ ] Palette couleurs unifiée:
```typescript
const theme = {
  primary: '#3cb0e5',    // Bleu (comme legacy)
  success: '#80c342',    // Vert
  warning: '#f7931a',    // Orange
  error: '#ff3b3b',      // Rouge
  info: '#3cc8c8',       // Cyan
}
```
- [ ] Typography: Rubik font (comme legacy)

#### Task 4.2: Status Badges Consistency
Standardiser badges statuts avec couleurs legacy:
- VALIDEE / EN_EXECUTION → Vert
- SOUMIS / BROUILLON → Orange
- REJETE / EN_RETARD → Rouge
- ACHEVE / TERMINE → Cyan

#### Task 4.3: Responsive Design Audit
- [ ] Test mobile (320px, 375px, 414px)
- [ ] Test tablet (768px, 1024px)
- [ ] Test desktop (1280px, 1920px)
- [ ] Sidebar collapse sur mobile

---

## 📐 Standards de Développement

### ⚠️ RÈGLE CRITIQUE: Strong Typing OBLIGATOIRE

❌ **INTERDIT:**
- `Map<String, Any>` (Kotlin)
- `any` (TypeScript)
- `object`, `unknown` sans type guards

✅ **OBLIGATOIRE:**
- DTOs typés pour toutes réponses API
- `ApiResponse<T>` générique pour wrapper
- Interfaces/types TypeScript pour toutes structures

**Exemple Kotlin:**
```kotlin
// ❌ MAUVAIS
fun getData(): Map<String, Any> {
    return mapOf("data" to myData, "count" to 5)
}

// ✅ BON
data class DataResponse(
    val data: MyData,
    val count: Int
)
fun getData(): ApiResponse<DataResponse>
```

**Exemple TypeScript:**
```typescript
// ❌ MAUVAIS
const data: any = await api.get('/conventions')

// ✅ BON
interface Convention {
    id: number
    code: string
    libelle: string
    budget: number
}
const response: ApiResponse<Convention[]> = await api.get('/conventions')
```

### Checklist Avant Commit

**Backend:**
```bash
./gradlew test              # Tests passent
./gradlew build -x test     # Build OK
```

**Frontend:**
```bash
npm run lint                # Pas d'erreurs ESLint
npm run build               # TypeScript compile
npm install                 # Lock file à jour
```

### Flyway Migrations - RÈGLE 3 FICHIERS

⚠️ **TOUJOURS 3 FICHIERS UNIQUEMENT:**
- V1__drop_all_tables.sql
- V2__create_schema.sql (TOUT le schéma)
- V3__seed_data.sql

❌ **INTERDIT**: Créer V4, V5, V6...
✅ **OBLIGATOIRE**: Ajouter nouvelles tables dans V2

### Commit Messages

Format conventionnel:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

Exemple:
```
feat(conventions): Add MaitreOeuvre entity and CRUD

- Create MaitreOeuvre entity with MO/MOD type enum
- Add migration in V2 Section 12
- Implement full CRUD (Repository, Service, Controller, DTO)
- Add integration tests

Resolves: #42
```

---

## 🚀 Guides de Déploiement

### Railway Configuration

**Backend:**
1. Ajouter PostgreSQL plugin dans Railway
2. Variables d'environnement:
   - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` (auto Railway)
   - `JWT_SECRET` (base64, 256-bit min)
   - `CORS_ALLOWED_ORIGINS` (URL frontend)
3. Build: `./gradlew clean bootJar`
4. Start: `java -jar build/libs/investpro-backend-1.0.0.jar`

**Frontend:**
1. Build: `npm ci && npm run build`
2. Start: `npm start` (serve -s dist -l 3000)
3. Variables:
   - `VITE_API_URL=https://investpromaroc-production.up.railway.app/api`

**railway.json:**
```json
{
  "build": {
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### SPA Routing Fix
Utiliser `serve -s` pour fallback vers index.html:
```json
{
  "scripts": {
    "start": "serve -s dist -l 3000"
  }
}
```

---

## 📜 Historique des Changements

### Janvier 2026

#### 16/01/2026 - Analyse Legacy vs Current
- ✅ Identification regressions critiques vs XCOMPTA legacy
- ✅ Documentation consolidée créée (MASTER_DOCUMENTATION.md)
- 🔴 Détecté: 3 wizards convention créent confusion → Garder SimpleConventionForm uniquement
- 🔴 Détecté: MO/MOD manquants (seulement flags vs entité dédiée dans legacy)
- 🔴 Détecté: Gestion documents absente frontend (backend ready)
- 🟠 Détecté: Page détail Convention incomplète vs legacy
- 🟠 Détecté: Marchés manquent wizard 3 étapes

#### 15/01/2026 - Système Avenants Conventions
- ✅ Entité AvenantConvention avec JSONB (donneesAvant, modifications)
- ✅ Workflow BROUILLON → SOUMIS → VALIDE
- ✅ Migration V12
- ✅ Frontend complet (form, list, detail, workflow buttons)

#### 14/01/2026 - Sous-Conventions
- ✅ Relation parent-child dans Convention
- ✅ Héritage paramètres (tauxCommission, baseCalcul, tauxTva)
- ✅ Tab dédié dans ConventionDetailPage
- ✅ 5 exemples seed data (SC-001 à SC-005)

#### 13/01/2026 - Géolocalisation Marchés
- ✅ Champs adresse, latitude, longitude, zoneGeographique
- ✅ Carte interactive Leaflet/OpenStreetMap
- ✅ Geocoding Nominatim (recherche adresse)
- ✅ Filtrage par zone géographique

#### 12/01/2026 - PWA & Landing Page Moderne
- ✅ Service worker avec Workbox
- ✅ App installable (desktop + mobile)
- ✅ Offline caching (NetworkFirst API, StaleWhileRevalidate static)
- ✅ Landing page redesign avec framer-motion animations

#### 11/01/2026 - Railway Deployment & CI/CD
- ✅ Frontend configuré Railway (`serve -s` fix SPA routing)
- ✅ Backend CI GitHub Actions (Gradle build + tests)
- ✅ Frontend CI GitHub Actions (lint + build + TypeScript check)
- ✅ `railway.json` configuration

#### 10/01/2026 - Convention Workflow Amélioré
- ✅ Statut REJETE ajouté
- ✅ Champ motifRejet
- ✅ Méthode remettreEnBrouillon() après rejet
- ✅ Capture createdBy depuis SecurityContext

#### 08/01/2026 - SimpleConventionForm Créé
- ✅ **RichTextEditor** pour objet détaillé
- ✅ Formatage automatique nombres français
- ✅ Design gradient bleu élégant
- ✅ Clean et focalisé (type CADRE uniquement)

### Décembre 2024

#### Plan Analytique Dynamique
- ✅ Migration de Axe+Projet+Volet rigide → Dimensions JSONB flexibles
- ✅ DimensionAnalytique + ValeurDimension entities
- ✅ MarcheLigne.dimensionsValeurs (JSONB)
- ✅ Page configuration `/parametrage/plan-analytique`

#### Marchés System Complet
- ✅ MarcheLigne avec imputations JSONB
- ✅ AvenantMarche
- ✅ Types: TRAVAUX, FOURNITURES, SERVICES
- ✅ Workflow statuts

#### Flyway Migrations Simplifiées
- ✅ Structure 3 fichiers (V1: drop, V2: create all, V3: seed)
- ✅ Section 12: Pièces Jointes (document management backend ready)

---

## 🎯 Prochaines Actions Immédiates

### Cette Semaine (Priorité 1)

1. **Nettoyer Wizards Convention**
   - Supprimer ConventionWizard.tsx + ConventionWizardComplete.tsx
   - Mettre à jour routes

2. **Créer Entité MaitreOeuvre**
   - Backend: Entity, Migration V2, CRUD complet
   - Frontend: Composants MO/MOD CRUD

3. **Améliorer SimpleConventionForm**
   - Ajouter sections Partenaires, MO, MOD
   - Upload documents
   - Calcul auto CI

4. **ConventionDetailPageV2**
   - 7 onglets complets (Partenaires, MO, MOD, Imputations, Versements, Sous-Conv, Docs)
   - Actions workflow header

5. **Gestion Documents Frontend**
   - Composant DocumentUploader
   - Intégration Convention/Marché/Décompte

### Mois Prochain (Priorité 2)

- Wizard Marchés 3 étapes
- Page Décomptes complète
- MarcheDetailPageV2
- Versements Prévisionnels UI

---

## 📚 Références

- **Legacy XCOMPTA**: `legacy/XCOMPTA_DOCUMENTATION.md`
- **Template CRUD**: `CRUD_TEMPLATE.md`
- **Railway Deployment**: `frontend/RAILWAY_DEPLOYMENT.md`
- **Cahier des Charges**: `ANALYSE_CAHIER_DES_CHARGES.md`

---

**Document maintenu par**: Équipe Développement InvestPro Maroc
**Contact**: [GitHub Issues](https://github.com/naciro2010/InvestProMaroc/issues)
