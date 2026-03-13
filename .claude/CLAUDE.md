# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InvestPro Maroc** is a comprehensive financial management platform for managing investment expenses and commission calculations in Morocco. It consists of a Kotlin/Spring Boot backend and a React/TypeScript frontend for tracking conventions, projects, markets (marchés), payments, and analytical cost allocations.

**Tech Stack:**
- **Backend:** Kotlin 2.0.21, Spring Boot 3.4.1, PostgreSQL 16/17, JWT Auth, Spring Security
- **Frontend:** React 18, TypeScript 5.x, Vite, TailwindCSS, Material-UI, Recharts
- **Database:** PostgreSQL 16/17 with JSONB for analytical dimensions

## Common Commands

### Backend (Kotlin/Spring Boot)

```bash
cd backend

# Build and run
./gradlew bootRun                    # Run development server (requires PostgreSQL)
./gradlew clean build                # Full build with tests
./gradlew build -x test              # Build without tests (faster)

# Testing
./gradlew test                       # Run all tests
./gradlew test --tests "ma.investpro.integration.AuthIntegrationTest"  # Single test class
./gradlew test jacocoTestReport      # Generate coverage report

# Production build
./gradlew clean bootJar              # Generates build/libs/investpro-backend-1.0.0.jar
java -jar build/libs/investpro-backend-1.0.0.jar  # Run JAR

# Backend runs on: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Frontend (React/TypeScript)

```bash
cd frontend

# Development
npm install                          # Install dependencies
npm run dev                          # Run Vite dev server (http://localhost:5173)

# Build and preview
npm run build                        # TypeScript compile + Vite production build
npm run preview                      # Preview production build
npm start                            # Production server with serve (for Railway deployment)

# Linting
npm run lint                         # ESLint check (TypeScript + React)
```

### Database Setup

```bash
# Start PostgreSQL in Docker
docker run --name investpro-postgres \
  -e POSTGRES_DB=investpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine

# Or use docker-compose (from root)
docker-compose up -d
```

### Running the Full Stack

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d postgres

# Terminal 2: Start backend
cd backend && ./gradlew bootRun

# Terminal 3: Start frontend
cd frontend && npm run dev

# Access: http://localhost:5173
# API: http://localhost:8080/api
```

## High-Level Architecture

### Monorepo Structure

```
InvestProMaroc/
├── backend/              # Spring Boot Kotlin API
│   ├── src/main/kotlin/ma/investpro/
│   │   ├── controller/   # REST endpoints
│   │   ├── service/      # Business logic (extends GenericCrudService)
│   │   ├── repository/   # Spring Data JPA
│   │   ├── entity/       # JPA entities with BaseEntity
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── security/     # JWT auth + custom annotations
│   │   │   └── annotations/  # @ReadAccess, @WriteAccess, @AdminOnly
│   │   ├── config/       # Spring configuration (SecurityConfig with role hierarchy)
│   │   └── mapper/       # Entity ↔ DTO mappers
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/ # Flyway migrations
├── frontend/             # React TypeScript SPA
│   └── src/
│       ├── pages/        # Route-level components (Dashboard, Conventions, Marchés, etc.)
│       ├── components/
│       │   ├── core/     # Design system components (PageHeader, StickyActionBar, FormLayout, StatusBadge)
│       │   ├── form/     # Form field components (FormTextField, FormNumberField, etc.)
│       │   ├── layout/   # Layout components (AppLayout, Sidebar)
│       │   └── ui/       # UI widgets (RichTextEditor, modals, etc.)
│       ├── lib/
│       │   ├── api.ts          # Axios client + JWT interceptors
│       │   ├── authService.ts  # Centralized auth (token parsing, expiry, logout)
│       │   └── designSystem.ts # Design tokens (colors, typography, spacing, shadows)
│       ├── contexts/     # React contexts (AuthContext, ToastContext)
│       └── types/        # TypeScript type definitions
└── legacy/              # Old codebase (ignore)
```

### Backend Architecture (Layered)

```
HTTP Request → JwtAuthenticationFilter (validates JWT)
              ↓
           SecurityFilterChain (Role Hierarchy: ADMIN > MANAGER > USER)
              ↓
           Controller (@ReadAccess / @WriteAccess / @AdminOnly)
              ↓
           Service (business logic, extends GenericCrudService<Entity, Long>)
              ↓
           Repository (Spring Data JPA interface)
              ↓
           PostgreSQL Database
              ↓
           ApiResponse<T> (standardized JSON response)
```

### Frontend Architecture (React/TypeScript)

```
App.tsx → React Router
          ↓
       AuthProvider (JWT + proactive token check every 30s)
          ↓
       AppLayout → PageHeader (breadcrumbs, title, actions)
          ↓
       Pages → Core Components (StickyActionBar, FormLayout, StatusBadge)
          ↓
       API Client (axios + authService interceptors)
          ↓
       Backend REST API (http://localhost:8080/api)
```

### Key Architectural Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| **GenericCrudService** | `backend/service/GenericCrudService.kt` | Base class for all entity services - reduces boilerplate |
| **BaseEntity** | `backend/entity/BaseEntity.kt` | Shared audit fields (id, createdAt, updatedAt) |
| **Security Annotations** | `backend/security/annotations/` | @ReadAccess, @WriteAccess, @AdminOnly with role hierarchy |
| **DTO Pattern** | `backend/dto/` | Decouples API from JPA entities |
| **Design System** | `frontend/src/lib/designSystem.ts` | Centralized design tokens (colors, typography, spacing) |
| **Core Components** | `frontend/src/components/core/` | PageHeader, StickyActionBar, FormLayout, StatusBadge |
| **Auth Service** | `frontend/src/lib/authService.ts` | JWT parsing, proactive expiry check, logout coordination |
| **Axios Interceptors** | `frontend/src/lib/api.ts` | Auto-inject JWT, handle 401 refresh, logout on expiry |
| **AuthContext** | `frontend/src/contexts/AuthContext.tsx` | Global auth state with role helpers (hasRole, isAdmin) |
| **API Response Wrapper** | Backend controllers | All responses: `{success, message, data}` |

## Business Domain Concepts

InvestPro Maroc manages the financial lifecycle of public investment projects in Morocco. The domain uses **French terminology** matching Moroccan administrative practices.

### Core Entities

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **Convention** | Legal framework defining commission calculation rules | code, objet, tauxCommission, montant, status |
| **AvenantConvention** | Convention amendment with full history and workflow | numeroAvenant, objet, dateAvenant, donneesAvant (JSONB), modifications (JSONB), statut |
| **Projet** | Investment program with budget and analytical axes | code, designation, budgetTotal, status |
| **Marché** | Procurement contract (travaux, fournitures, services) with geolocation | code, montantHT, montantTTC, fournisseur, convention, adresse, latitude, longitude, zoneGeographique |
| **MarcheLigne** | Contract line items with analytical imputation | designation, quantite, montantUnitaire, dimensionsValeurs (JSONB) |
| **AvenantMarche** | Contract amendment (price, scope, or delay changes) | code, motif, impactMontant, impactDelai |
| **Decompte** | Billing statement (situation de travaux) | montant, netAPayer, retenues, imputations |
| **OrdrePaiement** | Payment order | montant, dateEmission, dateExecution, status |
| **Paiement** | Payment record | montant, datePaiement, modeReglement |
| **Fournisseur** | Supplier with Moroccan tax IDs | code, ice (15-digit), if (tax ID), rib |
| **DimensionAnalytique** | Analytical dimension (Budget, Projet, Secteur, etc.) | code, libelle, ordre, obligatoire |
| **ValeurDimension** | Dimension value | code, libelle, dimensionId |

### Financial Workflow

```
CONVENTION (legal framework)
  └─ PROJET (investment program)
      └─ MARCHÉ (contract)
           ├─ MARCHE_LIGNE (line items with analytical imputation)
           ├─ AVENANT_MARCHE (amendments)
           └─ DECOMPTE (billing statement)
                ├─ DECOMPTE_RETENUE (retentions: guarantees, RAS, penalties)
                └─ DECOMPTE_IMPUTATION (analytical allocation)
                     └─ ORDRE_PAIEMENT (payment order)
                          └─ PAIEMENT (payment record)
```

### Analytical Dimensions (Plan Analytique Dynamique)

The system uses **PostgreSQL JSONB** for flexible multi-dimensional cost allocation:

- **DimensionAnalytique**: Configurable dimensions (Budget, Projet, Secteur, Département, Phase, etc.)
- **ValeurDimension**: Values per dimension (e.g., Budget → "B001", "B002")
- **MarcheLigne.dimensionsValeurs**: JSONB field storing `{dimensionCode: valeurCode}` per line
- **ImputationAnalytique**: Analytical allocations for décomptes/paiements

This replaces the old rigid Projet+Axe system with unlimited configurable dimensions.

### Convention Amendments (Avenants)

The system supports **full amendment tracking** for conventions with JSONB-based history:

**Workflow States:**
- **BROUILLON** (Draft): Amendment being prepared, can be edited
- **SOUMIS** (Submitted): Submitted for validation, locked for editing
- **VALIDE** (Validated): Approved, convention data updated automatically

**Key Features:**
- **Snapshot Before:** `donneesAvant` JSONB field stores complete convention state before amendment
- **Modifications:** `modifications` JSONB field stores all changes made by amendment
- **Full History:** All amendments preserved with dates, users, and workflow state
- **Automatic Update:** Only VALIDE amendments update the parent convention
- **Latest Effect:** Convention always reflects the last validated amendment

**State Machine:**
```kotlin
BROUILLON.soumettre() → SOUMIS
SOUMIS.valider(userId) → VALIDE (updates convention)
SOUMIS.rejeter(motif) → BROUILLON
```

**Database:**
- Table: `avenant_conventions` with JSONB columns and GIN indexes
- Migration: `V12__create_avenant_conventions.sql`
- Endpoint: `/api/avenants-conventions`

### Sous-Conventions (Sub-Conventions)

The system supports **hierarchical conventions** where CADRE (framework) conventions can have **sous-conventions** (sub-conventions or specific conventions):

**Key Features:**
- **Parent-Child Relationship:** Sous-conventions reference a parent convention (CADRE type only)
- **Parameter Inheritance:** Sous-conventions can inherit `tauxCommission`, `baseCalcul`, and `tauxTva` from parent
- **Selective Override:** `heriteParametres` flag enables inheritance; can override with `surchargeTauxCommission` and `surchargeBaseCalcul`
- **Same Workflow:** Sous-conventions follow the same workflow as regular conventions (BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE)
- **Independent Lifecycle:** Each sous-convention has its own status, budget, dates, and workflow state
- **Nested Display:** Sous-conventions appear in a dedicated tab within the parent convention's detail page

**Implementation:**
```kotlin
// Backend Entity (Convention.kt)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "parent_convention_id")
var parentConvention: Convention? = null

@Column(name = "herite_parametres", nullable = false)
var heriteParametres: Boolean = false

fun getTauxCommissionEffectif(): BigDecimal {
    val parent = parentConvention
    return if (heriteParametres && parent != null) {
        surchargeTauxCommission ?: parent.getTauxCommissionEffectif()
    } else {
        tauxCommission
    }
}
```

**API Endpoints:**
- `GET /api/conventions/{parentId}/sous-conventions` - List sous-conventions
- `POST /api/conventions/{parentId}/sous-conventions` - Create sous-convention
- `PUT /api/conventions/{sousConventionId}` - Update sous-convention (standard endpoint)
- `DELETE /api/conventions/{sousConventionId}` - Delete sous-convention (standard endpoint)
- Workflow endpoints: same as regular conventions (`/soumettre`, `/valider`, `/rejeter`, etc.)

**Frontend:**
- **Form:** `SousConventionForm.tsx` - Modal dialog with parent info display and inheritance toggle
- **Display:** Dedicated tab in `ConventionDetailPage.tsx` showing table of all sous-conventions
- **Navigation:** Clicking a sous-convention navigates to its detail page (same as regular convention)
- **Add Button:** Only visible when viewing a CADRE convention

**Database:**
- Same table: `conventions` (self-referencing with `parent_convention_id`)
- Migration: `V2__create_schema.sql` (already includes parent-child fields)
- Seed Data: `V3__seed_data.sql` contains 5 example sous-conventions (SC-001 to SC-005)

**Business Rules:**
- Only CADRE conventions can have sous-conventions
- Sous-conventions have type `SPECIFIQUE`
- Parent convention must be VALIDEE or EN_EXECUTION to create sous-conventions
- Full search and filtering capability within parent convention
- Complete audit trail (createdBy, createdAt, updatedAt)

**Example Hierarchy:**
```
CONV-001 (CADRE) "Convention Infrastructure"
  ├─ SC-001 (SPECIFIQUE) "Sous-Convention Voirie Urbaine" [inherits parameters]
  ├─ SC-002 (SPECIFIQUE) "Sous-Convention Routes Nationales" [inherits parameters]
  └─ SC-003 (SPECIFIQUE) "Sous-Convention Ponts" [custom rate: 3.0%]

CONV-002 (CADRE) "Convention Equipement Public"
  ├─ SC-004 (SPECIFIQUE) "Sous-Convention Equipement Scolaire"
  └─ SC-005 (SPECIFIQUE) "Sous-Convention Equipement Sanitaire"
```

## Authentication & Security

### Centralized Auth Architecture (January 2026)

**Backend - Role Hierarchy + Custom Annotations:**
- `SecurityConfig.kt`: Role Hierarchy (ADMIN > MANAGER > USER), all routes protected by default
- `SecurityAnnotations.kt`: `@ReadAccess` (USER), `@WriteAccess` (MANAGER), `@AdminOnly` (ADMIN)
- New routes are automatically protected via `anyRequest().authenticated()`
- Custom 401/403 JSON responses with `X-Token-Expired` header

**Frontend - 3-Layer Token Protection:**
- `authService.ts`: Proactive token expiration check (polling every 30s)
- `api.ts` request interceptor: Pre-check token before sending
- `api.ts` response interceptor: Handle 401 with token refresh (queues concurrent requests)

### JWT Authentication Flow

1. User logs in via `POST /api/auth/login` with username/password
2. Backend validates credentials, returns `{accessToken, refreshToken, user}`
3. Frontend stores tokens via `authService.storeTokens()` and sets user in `AuthContext`
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. Proactive token expiration check runs every 30 seconds
6. On 401 response, interceptor refreshes via `/api/auth/refresh` (queues concurrent requests)
7. If refresh fails or token expired, user is logged out and redirected to `/login`

### Roles & Permissions (with Hierarchy)

| Role | Permissions | Annotation | Notes |
|------|-------------|------------|-------|
| **ADMIN** | Full access (inherits MANAGER + USER) | `@AdminOnly` | User management, configuration |
| **MANAGER** | CRUD conventions, marchés, décomptes (inherits USER) | `@WriteAccess` | Business operations |
| **USER** | Read-only access | `@ReadAccess` | Reporting, exports |

Test accounts available in `README.md` (admin/admin123, manager/manager123, user/user123).

### Security Configuration

- **Backend:** Spring Security 6.x with role hierarchy + custom annotations (@ReadAccess, @WriteAccess, @AdminOnly)
- **Frontend:** `PrivateRoute` wrapper + `authService.ts` proactive token check
- **CORS:** Configured in `SecurityConfig.kt` (dev: localhost, prod: Railway)
- **Tokens:** Access token (24h), refresh token (7d)

### Security Best Practices (January 2026)

**Frontend Security:**
- ✅ **No sensitive data in localStorage** - Only JWT tokens (encrypted in transit via HTTPS)
- ✅ **XSS Protection** - React escapes all user input by default
- ✅ **CSRF Protection** - JWT in Authorization header (not cookies)
- ✅ **Content Security Policy** - Vite build includes secure headers
- ✅ **Dependencies** - Regular security audits via `npm audit`
- ✅ **Production builds** - Console.log removed, source maps disabled
- ✅ **HTTPS Only** - Enforced in production (Railway, GitHub Pages)

**Backend Security:**
- ✅ **Password Hashing** - BCrypt with salt rounds = 10
- ✅ **JWT Signing** - HMAC SHA-256 with strong secret (256+ bits)
- ✅ **SQL Injection** - Prevented via Spring Data JPA parameterized queries
- ✅ **Rate Limiting** - Should be implemented at reverse proxy level (TODO)
- ✅ **Input Validation** - `@Valid` annotations on all DTOs
- ✅ **CORS Whitelist** - Only allowed origins in production
- ✅ **Secure Headers** - Spring Security default headers (X-Frame-Options, X-Content-Type-Options, etc.)

**PWA Security:**
- ✅ **Service Worker** - Only registers on HTTPS (fails gracefully on HTTP)
- ✅ **Cache Strategy** - NetworkFirst for API (always fresh data when online)
- ✅ **No sensitive caching** - API responses cached max 5 minutes
- ✅ **Auto-update** - Service worker updates automatically on new deployments

**Data Security:**
- ✅ **Audit Trail** - All entities track createdBy, createdAt, updatedAt
- ✅ **Soft Deletes** - Entities have `actif` flag instead of hard deletes
- ✅ **Data Validation** - CHECK constraints in database (e.g., budget >= 0)
- ✅ **Transaction Isolation** - PostgreSQL READ COMMITTED by default

**Recommended for Production:**
- ⚠️ **Add Rate Limiting** - Use nginx rate limiting or Spring Rate Limiter
- ⚠️ **Enable 2FA** - For admin accounts
- ⚠️ **Database Encryption** - Enable PostgreSQL encryption at rest
- ⚠️ **Secrets Management** - Use env variables, never commit secrets
- ⚠️ **Regular Backups** - Automated daily backups with point-in-time recovery
- ⚠️ **Security Scanning** - GitHub Dependabot, Snyk, or OWASP Dependency-Check

## API Structure

### Endpoint Naming Convention

All endpoints follow REST conventions with French naming:

```
/api/conventions             - Convention management
/api/avenants-conventions    - Convention amendments (history, workflow)
/api/projets                 - Project management
/api/marches                 - Procurement contracts (note: endpoint is "marches")
/api/marches/:id/lignes      - Contract line items
/api/marches/:id/avenants    - Contract amendments
/api/decomptes               - Billing statements
/api/ordres-paiement         - Payment orders
/api/paiements               - Payments
/api/fournisseurs            - Suppliers
/api/dimensions              - Analytical dimensions
/api/imputations             - Analytical imputations
/api/users                   - User management
```

### Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Frontend Routing

```
/                    - Landing page (public)
/login               - Login page (public)
/register            - Registration (public)
/dashboard           - Main dashboard (protected)
/conventions         - Convention list & CRUD
/projets             - Project management
/marches             - Procurement contracts
/marches/:id         - Market detail view
/marches/new         - Create new market
/decomptes           - Billing statements
/paiements           - Payments
/reporting           - Analytical reporting with dynamic filters
/parametrage/plan-analytique - Dimension configuration
/profile             - User profile & password change
```

## Working with the Backend

### Adding a New Entity

When creating a new CRUD entity:

1. **Entity**: Create in `entity/` extending `BaseEntity`
2. **Repository**: Create in `repository/` extending Spring Data JPA
3. **DTO**: Create request/response DTOs in `dto/`
4. **Mapper**: Create entity ↔ DTO mapper in `mapper/`
5. **Service**: Create in `service/` extending `GenericCrudService<Entity, Long>`
6. **Controller**: Create in `controller/` with standard REST endpoints
7. **Migration**: Add Flyway migration in `db/migration/V{next_number}__description.sql`
   - Check existing migrations: V1-V3 already exist
   - Next migration should be V4
   - Use `CREATE TABLE IF NOT EXISTS` for safety
   - Add indexes for foreign keys and frequently queried columns
8. **Tests**: Add integration tests in `src/test/kotlin/ma/investpro/integration/`

See `CRUD_TEMPLATE.md` for detailed template.

### Database Migrations

⚠️ **RÈGLE CRITIQUE - TOUJOURS 3 FICHIERS UNIQUEMENT** ⚠️

**À chaque livraison, l'historique Flyway est vidé. Il ne doit JAMAIS y avoir plus de 3 fichiers de migration:**

1. **V1__drop_all_tables.sql** - Suppression de toutes les tables
2. **V2__create_schema.sql** - Création de TOUTES les tables (schéma complet)
3. **V3__seed_data.sql** - Données de test

**❌ INTERDIT:**
- Créer V4, V5, V6, V7, etc.
- Ajouter de nouvelles migrations numérotées

**✅ OBLIGATOIRE:**
- Toute nouvelle table doit être ajoutée dans `V2__create_schema.sql`
- Toute nouvelle donnée de test dans `V3__seed_data.sql`
- Garder uniquement ces 3 fichiers

---

- **Tool:** Flyway (automatic on startup, enabled in production)
- **Location:** `backend/src/main/resources/db/migration/`
- **Configuration:**
  - Development: `spring.jpa.hibernate.ddl-auto=none` + `spring.flyway.enabled=true`
  - Production: `spring.jpa.hibernate.ddl-auto=validate` + `spring.flyway.enabled=true`

- **Current Migrations (TOUJOURS 3 fichiers):**
  - **V1__drop_all_tables.sql** - Drop all existing tables (clean slate)
  - **V2__create_schema.sql** - Complete schema creation with ALL tables:
    - Section 1: Authentication & User Management (users, user_roles)
    - Section 2: Organizational Partners & Suppliers (partenaires, fournisseurs)
    - Section 3: Conventions & Sub-Conventions (conventions avec parent_convention_id)
    - Section 4: Projects (projets)
    - Section 5: Markets (marches avec geolocation: adresse, latitude, longitude, zone_geographique)
    - Section 6: Market Lines (marche_lignes)
    - Section 7: Amendments (avenant_marches, avenant_conventions avec JSONB)
    - Section 8: Payment Cycle (decomptes, ordres_paiement, paiements)
    - Section 9: Analytics (dimensions_analytiques, valeurs_dimension, imputations_analytiques)
    - Section 10: Additional Entities (commissions, subventions, budgets, etc.)
    - Section 11: GIN Indexes for JSONB
    - **Section 12: Document Management (pieces_jointes)** ← Ajouté janvier 2026
  - **V3__seed_data.sql** - Seed test data (users, dimensions, fournisseurs, conventions, marchés, sous-conventions)

- **Flyway Settings:**
  - `baseline-on-migrate=true` - Create baseline for existing databases
  - `validate-on-migrate=false` (dev) / `true` (prod) - Validation control
  - `out-of-order=true` - Allow out-of-order migrations (dev only)
  - `clean-disabled=true` - Prevent accidental data loss

- **Best Practices:**
  - ✅ Always use `CREATE TABLE IF NOT EXISTS` for safety
  - ✅ Add `CHECK` constraints for data validation (e.g., budget >= 0)
  - ✅ Add indexes for foreign keys and frequently queried columns
  - ✅ Add `COMMENT ON TABLE/COLUMN` for documentation
  - ✅ Use `ON DELETE SET NULL` or `ON DELETE CASCADE` appropriately
  - ✅ Test migrations on clean database before committing
  - ❌ Never modify existing migrations after they're deployed
  - ❌ Never use `spring.flyway.clean-on-validation-error=true` in production

### Testing

- **Framework:** Kotest with JUnit5 runner
- **Mocking:** MockK (Kotlin-friendly) + SpringMockK
- **Integration Tests:** Use Testcontainers with real PostgreSQL (requires Docker)
- **Base Class:** `BaseIntegrationTest.kt` sets up test database

## Working with the Frontend

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/designSystem.ts` | Design tokens (colors, typography, spacing, shadows, componentStyles) |
| `src/lib/authService.ts` | Centralized auth (JWT parsing, expiry check, logout) |
| `src/lib/api.ts` | Axios client with JWT interceptors and all API endpoints |
| `src/contexts/AuthContext.tsx` | Global auth state (hasRole, isAdmin, isManager) |
| `src/components/core/` | Core micro-components (PageHeader, StickyActionBar, FormLayout, StatusBadge) |
| `src/components/form/` | Form field components (FormTextField, FormNumberField, etc.) |
| `src/components/layout/AppLayout.tsx` | Responsive sidebar layout |
| `src/App.tsx` | Main routing with React Router |
| `vite.config.ts` | Vite configuration with proxy to backend |

### Design System Usage

```typescript
// Import design tokens
import { colors, typography, spacing, componentStyles } from '@/lib/designSystem'

// Use pre-built styles in sx props
<Box sx={componentStyles.card}>...</Box>
<Button sx={componentStyles.buttonPrimary}>Save</Button>

// Use tokens directly
<Typography sx={{ color: colors.gray[700], fontSize: typography.sizes.sm }}>Label</Typography>
```

### Core Components Usage

```typescript
import { PageHeader, StickyActionBar, FormLayout, FormPageSection, FormGroup, FormField, StatusBadge } from '@/components/core'

// Page with breadcrumbs
<PageHeader
  title="Conventions"
  breadcrumbs={[
    { label: 'Accueil', path: '/dashboard' },
    { label: 'Conventions' },
  ]}
  actions={<Button>Nouveau</Button>}
/>

// Form page pattern
<form onSubmit={handleSubmit}>
  <StickyActionBar title="Nouvelle Convention" showBack backUrl="/conventions" isSubmitting={loading} submitType="submit" />
  <FormLayout>
    <FormPageSection title="Informations" divider={false}>
      <FormGroup columns={2}>
        <FormField><TextField label="Code" /></FormField>
        <FormField><TextField label="Nom" /></FormField>
      </FormGroup>
    </FormPageSection>
  </FormLayout>
</form>

// Status badges
<StatusBadge status="VALIDEE" />
```

### API Client Usage

```typescript
import { conventionsAPI } from '@/lib/api'

// GET all conventions
const { data } = await conventionsAPI.getAll()
const conventions = data.data // Extract payload from ApiResponse

// POST create convention
const newConvention = await conventionsAPI.create({
  code: 'CONV-001',
  objet: 'Convention description',
  montant: 1000000
})
```

### Authentication in Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout, hasRole, isAdmin, isManager } = useAuth()
  // hasRole('ADMIN'), hasAnyRole(['ADMIN', 'MANAGER'])
}
```

### Protected Routes

Use `PrivateRoute` wrapper for authenticated pages:

```typescript
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

## Important Development Notes

1. **French Domain Language:** All business entities use French names (Convention, Marché, Décompte, etc.). Keep this consistency when adding new features.

2. **JSONB for Flexibility:** Analytical dimensions use PostgreSQL JSONB (`dimensionsValeurs` field). This allows unlimited configurable dimensions without schema changes.

3. **Null Safety:** Backend uses Kotlin's type system - `Type?` means nullable, `Type` means non-null. Frontend uses TypeScript strict mode.

4. **JWT Refresh Logic:** Frontend uses 3-layer token protection: proactive 30s polling via `authService.ts`, request interceptor pre-check, response interceptor 401 handling with concurrent request queuing.

5. **API Proxy:** Frontend Vite dev server proxies `/api` requests to `http://localhost:8080` (see `vite.config.ts`).

6. **Generic CRUD Service:** All backend services extend `GenericCrudService.kt` which provides standard CRUD operations. Override only when custom logic needed.

7. **Design System:** All UI values (colors, typography, spacing, shadows) come from `designSystem.ts`. No hardcoded color values.

8. **Core Components:** Use `PageHeader`, `StickyActionBar`, `FormLayout`, `StatusBadge` from `@/components/core`. See `SimpleConventionForm.tsx` as reference.

9. **No Gradients:** UI follows flat, professional design. No gradient backgrounds in content areas. Use design system tokens.

10. **Security Annotations:** Use `@ReadAccess`, `@WriteAccess`, `@AdminOnly` instead of `@PreAuthorize`. Role hierarchy handles inheritance (ADMIN > MANAGER > USER).

11. **Test Credentials:** Use `admin/admin123` for testing (see README.md for full list). Change passwords before production.

12. **Reporting:** The `ReportingAnalytiquePage` demonstrates dynamic JSONB queries with filters. Use this pattern for new analytical features.

13. **Error Handling:** Backend uses `@ControllerAdvice` for global exception handling. Frontend shows toast notifications via `ToastContext`.

14. **Convention Workflow:** Improved workflow with rejection handling:
    - BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE
    - SOUMIS → REJETE (with motif) → BROUILLON (correction)
    - Status EN_COURS renamed to EN_EXECUTION for clarity
    - CreatedBy field tracks convention creator automatically
    - Rejection motif stored and displayed in UI

15. **Number Formatting:** Frontend forms use French number formatting (1 000 000,00) with automatic parsing for clean UX.

## Deployment

### Railway Deployment (Production)

InvestPro Maroc is deployed on Railway:
- **Backend:** https://investpromaroc-production.up.railway.app
- **Frontend:** Deployed via Railway with static serving

#### Frontend Deployment to Railway

The frontend is configured for Railway deployment with proper SPA routing:

```bash
cd frontend

# Build for production
npm run build

# Test production build locally
npm start  # Runs serve -s dist -l 3000

# Deploy to Railway (automatic via Git push)
git push origin main  # Railway auto-deploys from GitHub
```

**Key Configuration:**
- Uses `serve` package with `-s` flag for SPA routing (fixes 404 on refresh)
- `railway.json` configures build and deploy commands
- `.env.production` contains production API URL
- `vite.config.ts` uses `base: '/'` for Railway (not `/InvestProMaroc/` like GitHub Pages)

**Why `serve -s` fixes the 404 problem:**
- Without `-s`: Server looks for `/dashboard/index.html` → 404 error
- With `-s` (single-page mode): All routes fallback to `/index.html` → React Router handles routing
- This is the standard, clean solution for deploying Vite/React SPAs

See `frontend/RAILWAY_DEPLOYMENT.md` for complete deployment guide.

## Environment Variables

### Backend (application.properties / application-prod.properties)

```bash
# Database
DATABASE_URL                # PostgreSQL connection string (Railway provides this)
PGDATABASE                  # Database name (Railway)
PGHOST                      # Database host (Railway)
PGPASSWORD                  # Database password (Railway)
PGPORT                      # Database port (Railway)
PGUSER                      # Database user (Railway)

# JWT Authentication
JWT_SECRET                  # Base64-encoded secret (256-bit minimum)
JWT_EXPIRATION_MS           # Access token TTL (default: 86400000 = 24h)
JWT_REFRESH_EXPIRATION_MS   # Refresh token TTL (default: 604800000 = 7d)

# CORS Configuration
CORS_ALLOWED_ORIGINS        # Comma-separated origins (e.g., https://your-frontend.railway.app)

# Server
PORT                        # Server port (default: 8080, Railway may override)
```

### Frontend (.env)

```bash
# Development
VITE_API_URL=http://localhost:8080/api

# Production (Railway)
VITE_API_URL=https://investpromaroc-production.up.railway.app/api
```

## Recent Architecture Changes

- **Progressive Web App (PWA):** Full PWA support with offline capabilities (January 2026)
  - `vite-plugin-pwa` for service worker generation
  - App installable on desktop and mobile
  - Offline caching with Workbox
  - NetworkFirst strategy for API calls
  - StaleWhileRevalidate for static resources
  - Auto-update on new versions
  - Manifest with icons and theme colors

- **Modern Landing Page:** Redesigned with framer-motion animations (January 2026)
  - Smooth fade-in and stagger animations
  - Scale-on-hover effects for cards
  - Clean, modern design with gradient backgrounds
  - Optimized performance with lazy loading
  - Responsive design for all screen sizes
  - Clear feature showcase with real app statistics

- **Code Simplification & Optimization:** Major refactor for better maintainability (January 2026)
  - Simplified `SousConventionForm` → `SousConventionFormSimple` (50% less code)
  - Removed complex formatting logic in favor of native HTML5 inputs
  - Better build optimization with code splitting (React, MUI, Charts separated)
  - Tree shaking enabled for smaller bundle sizes
  - Console.log removal in production builds
  - Optimized chunk sizes for better caching

- **Sous-Conventions System:** Full hierarchical convention support with parent-child relationships (January 2026)
  - CADRE conventions can have multiple sous-conventions (type SPECIFIQUE)
  - Parameter inheritance with selective override (tauxCommission, baseCalcul, tauxTva)
  - Same workflow as regular conventions (BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE)
  - Dedicated UI tab in convention detail page with simplified modal
  - 5 example sous-conventions in seed data (SC-001 to SC-005)

- **Marchés Geolocation:** Full geolocation support for marchés with interactive map view using Leaflet/OpenStreetMap (January 2026)
  - Address search with Nominatim geocoding API
  - Map-based location picker with click-to-place marker
  - Interactive map view for all geolocated marchés
  - Geographic zone filtering capability
- **Plan Analytique Dynamique:** Migrated from rigid Projet+Axe to flexible JSONB dimensions (December 2024)
- **Marchés System:** Complete implementation with line items, amendments, and analytical imputation per line
- **Flyway Migrations Simplified:** Using Flyway with simplified 3-migration structure (V1: drop, V2: create all, V3: seed) (January 2026)
- **ExcelJS Integration:** Frontend now uses ExcelJS instead of XLSX for better spreadsheet generation
- **Convention Workflow Amélioré:** New workflow with REJETE status, createdBy tracking, and improved rejection handling (January 2026)
- **Railway Deployment:** Frontend configured for Railway with SPA routing fix (`serve -s`) (January 2026)
- **Simple Convention Form:** Replaced complex wizard with clean, focused form for CADRE conventions
- **Convention Amendments System:** Full amendment (avenant) system with JSONB storage for flexible data snapshots and workflow (BROUILLON → SOUMIS → VALIDE) (January 2026)
- **Modern Under Construction Pages:** Professional "under construction" pages with roadmap for features in development (January 2026)
- **Backend CI/CD:** GitHub Actions workflow for automatic compilation verification on every push (January 2026)

- **Centralized Auth System:** Complete auth refactor with role hierarchy and custom annotations (January 2026)
  - Backend: Role hierarchy (ADMIN > MANAGER > USER) in SecurityConfig.kt
  - Custom annotations: @ReadAccess, @WriteAccess, @AdminOnly (replaces verbose @PreAuthorize)
  - All routes protected by default (anyRequest().authenticated())
  - Frontend: authService.ts centralizes JWT parsing, token expiry, logout
  - Proactive token expiration check (30s polling)
  - Concurrent 401 request queuing during token refresh
  - AuthContext extended with hasRole, hasAnyRole, isAdmin, isManager

- **Design System & Core Components:** Professional UI architecture (January 2026)
  - `designSystem.ts`: Centralized design tokens (colors, typography, spacing, shadows, componentStyles)
  - `components/core/PageHeader.tsx`: Breadcrumbs, title, status chip, actions
  - `components/core/StickyActionBar.tsx`: Sticky form/detail page action bar (form + custom modes)
  - `components/core/FormLayout.tsx`: FormLayout, FormPageSection, FormGroup, FormField, FormFieldLabel
  - `components/core/StatusBadge.tsx`: StatusBadge + StatusDot with semantic colors
  - `components/core/index.ts`: Barrel export for all core components
  - No gradients in content areas - flat, professional design
  - SimpleConventionForm refactored as reference example using all core components

- **Menu & Routes Cleanup:** Unified navigation and wired all pages (March 2026)
  - Wired Décomptes, Paiements, Ordres de Paiement, Commissions routes in App.tsx
  - Replaced Commissions UnderConstruction placeholder with real CommissionsPage
  - Fixed Commissions "Bientot" badge (page is fully implemented)
  - Refactored TeamMessagingPage from raw Tailwind to MUI + design system
  - Fixed UsersPage hardcoded borderRadius to use design system tokens
  - Removed legacy PaiementsPage.tsx (replaced by PaiementsPageComplete)
  - All pages now use ControlPanel, StatusBadge, and design system consistently

## Current Implementation Status

### Fully Implemented (90%+)
- Backend: Conventions, Sous-Conventions, Projets, Marchés, Fournisseurs, Analytical Dimensions
- Frontend: Dashboards, Conventions, Sous-Conventions, Marchés, Projets, Décomptes, Paiements, Ordres de Paiement, Commissions, Budgets, Fournisseurs, Users, Team Messaging, Analytical Reporting, User Profile

### Partial Implementation (60-75%)
- Comptes Bancaires: Under construction
- Dépenses: Under construction

### Missing Features
- Budget versions and revisions
- Document management (PDF uploads)
- Advanced commission calculation (tranches, exclusions)
- Rapprochement bancaire

See `README.md` for detailed feature matrix and roadmap.

## Development Best Practices & Code Quality Standards

⚠️ **IMPORTANT:** All developers must follow the standards in **[DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md)**

This file contains:
- ✅ Mandatory code quality standards
- ✅ Testing requirements (backend & frontend)
- ✅ Commit message conventions
- ✅ Security standards
- ✅ Deployment checklist
- ✅ Code review checklist
- ✅ Troubleshooting common issues

### Quick Reference:

**Before committing:**
```bash
# Backend
cd backend
./gradlew test              # Run all tests
./gradlew build -x test     # Quick build check

# Frontend
cd frontend
npm run lint                # Check linting
npm run build               # TypeScript check
npm install                 # Update lock file if package.json changed
```

**Key Principles:**

### 1. Strong Typing - MANDATORY

⚠️ **CRITICAL RULE:** **NEVER use `Any` type (Kotlin) or `any` type (TypeScript)** ⚠️

**Backend (Kotlin):**
- ❌ **FORBIDDEN:** `Map<String, Any>`, `List<Any>`, `ResponseEntity<Map<String, Any>>`
- ✅ **REQUIRED:** Always use strongly typed DTOs and data classes
- ✅ Use `ApiResponse<T>` generic wrapper for API responses
- ✅ Create specific DTOs for each use case (e.g., `AvenantStatistics`, `AvenantConventionResponse`)

**Frontend (TypeScript):**
- ❌ **FORBIDDEN:** `any`, `object`, `unknown` without proper type guards
- ✅ **REQUIRED:** Define interfaces/types for all data structures
- ✅ Use generic types `<T>` when appropriate
- ✅ Enable strict TypeScript mode

**Examples:**

❌ **BAD - Using Any:**
```kotlin
fun getData(): Map<String, Any> {
    return mapOf("data" to myData, "count" to 5)
}
```

✅ **GOOD - Strongly Typed:**
```kotlin
data class DataResponse(
    val data: MyData,
    val count: Int
)

fun getData(): DataResponse {
    return DataResponse(data = myData, count = 5)
}
```

**Why this matters:**
- Type safety catches errors at compile time, not runtime
- Better IDE autocomplete and refactoring support
- Self-documenting code
- Prevents runtime type errors in production

### 2. Use Validated, Production-Ready Technologies

- **NO workarounds or hacks** - Always use proper, documented solutions
- **NO experimental or unstable packages** - Stick to well-maintained, widely-adopted libraries
- **NO quick fixes that compromise quality** - Take time to implement clean, maintainable solutions

### 3. Dependency Management

- Only use dependencies from official package registries (npm, Maven Central)
- Verify package:
  - Has active maintenance (recent commits/releases)
  - Has good documentation
  - Has reasonable download stats / community adoption
  - No known security vulnerabilities
- Prefer official plugins and extensions over third-party alternatives

### 4. Architecture Patterns

- Follow existing architectural patterns in the codebase:
  - Backend: `GenericCrudService`, `BaseEntity`, DTO pattern, `ApiResponse<T>` wrapper
  - Frontend: Context API, Axios interceptors, React Router
- Don't introduce new patterns without strong justification
- Keep solutions simple and aligned with project architecture
- **Always create DTOs for API responses** - Never return raw entities or Maps

### 5. Problem-Solving Approach

**ALWAYS prefer:**
1. **Official documentation solutions** - Check framework/library docs first
2. **Established patterns in the codebase** - Follow what already exists
3. **Clean, standard approaches** - Use industry best practices
4. **Maintainable code** - Code that future developers can understand

**Summary of Critical Rules:**
- ✅ **ALWAYS use strong typing** - Never use `Any` or `any` types
- ✅ **Create specific DTOs** for all API responses and data structures
- ✅ Use ONLY validated, production-ready technologies
- ✅ Follow existing architecture patterns (`ApiResponse<T>`, DTOs, etc.)
- ✅ Test before committing (see DEVELOPMENT_GUIDELINES.md)
- ❌ **NEVER use `Any`/`any`** - Always create proper types
- ❌ No workarounds or hacks
- ❌ No experimental packages
- ❌ No quick fixes that compromise quality
- ❌ No `Map<String, Any>` or similar untyped structures

**After modifying package.json:**
```bash
npm install                 # Regenerate package-lock.json
git add package.json package-lock.json
git commit -m "fix: Update dependencies and lock file"
```

See **[DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md)** for complete documentation.

## Key Documentation Files

- **README.md** - Project overview, setup, architecture, feature matrix
- **CLAUDE.md** - AI assistant instructions and project overview (this file)
- **DEVELOPMENT_GUIDELINES.md** - **⭐ Mandatory standards, testing requirements, and quality checklist**
- **ANALYSE_CAHIER_DES_CHARGES.md** - Requirements analysis
- **BACKLOG.md** - Feature backlog and specifications
- **CRUD_TEMPLATE.md** - Template for adding new entities
- **backend/CLAUDE.md** - Backend-specific guidance (Kotlin/Spring Boot details)
- **frontend/RAILWAY_DEPLOYMENT.md** - Complete Railway deployment guide with SPA routing fix

## Troubleshooting

### Flyway Migration Issues

If you encounter Flyway migration errors:

```bash
# 1. Check current Flyway state
./gradlew flywayInfo

# 2. Validate migrations
./gradlew flywayValidate

# 3. If needed, repair Flyway schema history (use with caution)
./gradlew flywayRepair

# 4. For development: baseline existing database
./gradlew flywayBaseline
```

**Common Issues:**
- **"Found non-empty schema without metadata table"**: Run `flywayBaseline`
- **"Migration checksum mismatch"**: Never modify existing migrations; create new ones
- **"Out of order migration detected"**: Allowed in dev (`out-of-order=true`), fix order in prod

### Railway Deployment Issues

**Backend not connecting to database:**
- Verify Railway PostgreSQL plugin is added
- Check environment variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- Railway provides `DATABASE_URL` but Spring Boot needs individual variables

**CORS errors in production:**
- Update `CORS_ALLOWED_ORIGINS` in Railway dashboard
- Add your Railway frontend URL: `https://your-frontend.railway.app`
- Redeploy backend after updating CORS settings

**Frontend 404 on refresh:**
- Verify `serve -s` is being used (check `package.json` start script)
- Ensure `railway.json` has correct start command: `npm start`
- Check build output includes all routes
