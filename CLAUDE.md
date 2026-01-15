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
│   │   ├── security/     # JWT authentication
│   │   ├── config/       # Spring configuration
│   │   └── mapper/       # Entity ↔ DTO mappers
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/ # Flyway migrations
├── frontend/             # React TypeScript SPA
│   └── src/
│       ├── pages/        # Route-level components (Dashboard, Conventions, Marchés, etc.)
│       ├── components/   # Reusable UI components (layout, ui)
│       ├── lib/          # API client (axios), utilities
│       ├── contexts/     # React contexts (AuthContext, ToastContext)
│       └── types/        # TypeScript type definitions
└── legacy/              # Old codebase (ignore)
```

### Backend Architecture (Layered)

```
HTTP Request → JwtAuthenticationFilter (validates JWT)
              ↓
           SecurityFilterChain (checks @PreAuthorize roles)
              ↓
           Controller (validates input, delegates to service)
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
       AuthProvider (JWT token management, refresh logic)
          ↓
       AppLayout (sidebar, navbar, responsive)
          ↓
       Pages (conventions, marchés, projets, décomptes)
          ↓
       API Client (axios with interceptors)
          ↓
       Backend REST API (http://localhost:8080/api)
```

### Key Architectural Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| **GenericCrudService** | `backend/service/GenericCrudService.kt` | Base class for all entity services - reduces boilerplate |
| **BaseEntity** | `backend/entity/BaseEntity.kt` | Shared audit fields (id, createdAt, updatedAt) |
| **JWT Stateless Auth** | `backend/security/` | Access + refresh tokens, no server-side sessions |
| **DTO Pattern** | `backend/dto/` | Decouples API from JPA entities |
| **Axios Interceptors** | `frontend/src/lib/api.ts` | Auto-inject JWT, handle 401 refresh, logout on expiry |
| **AuthContext** | `frontend/src/contexts/AuthContext.tsx` | Global auth state (React Context API) |
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

## Authentication & Security

### JWT Authentication Flow

1. User logs in via `POST /api/auth/login` with username/password
2. Backend validates credentials, returns `{accessToken, refreshToken, user}`
3. Frontend stores tokens in `localStorage` and sets user in `AuthContext`
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. On 401 response, interceptor tries to refresh token via `/api/auth/refresh`
6. If refresh fails or token expired, user is logged out and redirected to `/login`

### Roles & Permissions

| Role | Permissions | Notes |
|------|-------------|-------|
| **ADMIN** | Full system access | User management, configuration |
| **MANAGER** | CRUD conventions, marchés, décomptes, paiements | Business operations |
| **USER** | Read-only access | Reporting, exports |

**Test Accounts** (seeded in `V3__seed_data.sql`):
| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | ADMIN | admin@investpro.ma |
| manager | manager123 | MANAGER | manager@investpro.ma |
| user | user123 | USER | user@investpro.ma |

**⚠️ IMPORTANT:** Passwords are BCrypt hashed in database with cost 10. The hash `$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2L1MJLTzCIBkjy1kzp1HaT6` is used for all test users - **ensure this hash matches your test password before changing it**.

### Security Configuration

- **Backend:** Spring Security 6.x with `@PreAuthorize` annotations
- **Frontend:** `PrivateRoute` wrapper checks `isAuthenticated` from `AuthContext`
- **CORS:** Configured in `SecurityConfig.kt` (dev: localhost, prod: GitHub Pages)
- **Tokens:** Access token (24h), refresh token (7d)

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

- **Tool:** Flyway (automatic on startup, enabled in production)
- **Location:** `backend/src/main/resources/db/migration/`
- **Naming:** `V{n}__description.sql` (e.g., `V1__clean_schema.sql`)
- **Configuration:**
  - Development: `spring.jpa.hibernate.ddl-auto=none` + `spring.flyway.enabled=true`
  - Production: `spring.jpa.hibernate.ddl-auto=validate` + `spring.flyway.enabled=true`

- **Current Migrations (V1-V3):**
  - **V1:** Drop all existing tables (clean slate)
  - **V2:** Complete schema creation with all tables, constraints, and indexes
    - Includes geolocation fields for `marches` table (adresse, latitude, longitude, zone_geographique)
    - All entities with proper relationships and indexes
  - **V3:** Seed test data (users, dimensions, fournisseurs, conventions, marchés, décomptes)

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
| `src/lib/api.ts` | Axios client with JWT interceptors and all API endpoints |
| `src/contexts/AuthContext.tsx` | Global auth state (user, login, logout, register) |
| `src/App.tsx` | Main routing with React Router |
| `src/components/layout/AppLayout.tsx` | Responsive sidebar layout |
| `src/components/ui/` | Reusable UI components (Button, Card, Badge, Modal, etc.) |
| `vite.config.ts` | Vite configuration with proxy to backend |

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

// All APIs follow same pattern: {method}API.{operation}()
```

### Authentication in Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div>
      {isAuthenticated && <p>Welcome {user?.fullName}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  )
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

4. **JWT Refresh Logic:** Frontend automatically refreshes expired tokens via interceptor in `api.ts`. Users are logged out only if refresh fails.

5. **API Proxy:** Frontend Vite dev server proxies `/api` requests to `http://localhost:8080` (see `vite.config.ts`).

6. **Generic CRUD Service:** All backend services extend `GenericCrudService.kt` which provides standard CRUD operations. Override only when custom logic needed.

7. **Material-UI + Tailwind:** Frontend uses both MUI components and Tailwind utility classes. Prefer Tailwind for layout/spacing, MUI for complex components.

8. **Test Credentials:** Use test accounts `admin/admin123`, `manager/manager123`, `user/user123` (seeded in V3__seed_data.sql). Passwords are BCrypt hashed. **CRITICAL:** Only change passwords after verifying new BCrypt hashes in database - do not change in seed data without updating hash.

9. **Reporting:** The `ReportingAnalytiquePage` demonstrates dynamic JSONB queries with filters. Use this pattern for new analytical features.

10. **Error Handling:** Backend uses `@ControllerAdvice` for global exception handling. Frontend shows toast notifications via `ToastContext`.

11. **Convention Workflow:** Improved workflow with rejection handling:
    - BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE
    - SOUMIS → REJETE (with motif) → BROUILLON (correction)
    - Status EN_COURS renamed to EN_EXECUTION for clarity
    - CreatedBy field tracks convention creator automatically
    - Rejection motif stored and displayed in UI

12. **Number Formatting:** Frontend forms use French number formatting (1 000 000,00) with automatic parsing for clean UX.

## CI/CD Pipeline

InvestPro Maroc uses GitHub Actions for Continuous Integration and Continuous Deployment:

### Workflows Overview

| Workflow | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| **Backend CI** (ci-backend.yml) | Push to main/claude/*, PR | Build & test backend with Gradle, run integration tests with Testcontainers | ✅ Active |
| **Frontend CI** (ci-frontend.yml) | Push to main/claude/*, PR | Build & test frontend with Vite, TypeScript check, linting | ✅ Active |
| **Railway Deploy** (deploy-railway.yml) | Push to main | Automatic deployment to Railway after successful CI | ✅ Active |
| **Demo Deploy** (deploy-demo.yml) | Manual trigger | Deploy to demo environment | ✅ Active |

### Backend CI Pipeline

**Location:** `.github/workflows/ci-backend.yml`

```yaml
Triggers on:
- Push to main, claude/* branches
- Pull requests
- Changes to backend/** or workflow file

Steps:
1. Checkout code
2. Setup Java 21 with Gradle caching
3. Make gradlew executable
4. Run ./gradlew clean build --info
5. Upload test reports on failure
6. Check for build artifacts
```

**Environment:**
- Java 21 (Temurin)
- PostgreSQL 16-alpine (Testcontainers)
- Gradle caching enabled

**Key Tests:**
- FlywayMigrationIntegrationTest (schema validation)
- AvenantConventionIntegrationTest (workflow)
- All other integration tests with real database

### Frontend CI Pipeline

**Location:** `.github/workflows/ci-frontend.yml`

```yaml
Triggers on:
- Push to main, claude/* branches
- Pull requests
- Changes to frontend/** or workflow file

Steps:
1. Checkout code
2. Setup Node.js 18 with npm caching
3. Clear npm cache to prevent EBUSY errors
4. npm ci --omit=dev (install dependencies)
5. npm run lint (optional, continue on error)
6. npm run build (TypeScript + Vite build)
7. Check build size and verify dist/assets output
```

**Environment:**
- Node.js 18 (compatible with package.json >=18.0.0)
- npm 9+ (from Node 18)
- Vite 5.4.11 (pinned for compatibility)

**Build Artifacts:**
- dist/ folder with optimized bundle
- Includes vendor.js and main.js
- Source maps excluded from production build

### Railway Deployment

**Location:** `.github/workflows/deploy-railway.yml`

```yaml
Triggers on:
- Push to main with frontend/** changes
- Manual workflow_dispatch

Environment Variables:
- NODE_ENV: production
- VITE_API_URL: https://investpromaroc-production.up.railway.app/api
- VITE_BASE_PATH: /
- RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
- RAILWAY_PROJECT_ID: ${{ secrets.RAILWAY_PROJECT_ID }}

Steps:
1. Checkout code
2. Setup Node.js 18
3. Clear npm cache
4. Install Railway CLI globally
5. npm ci --omit=dev
6. npm run build (TypeScript + Vite)
7. railway up (deploy to Railway)
```

**Configuration:**
- Uses Railway CLI for deployment
- Requires RAILWAY_TOKEN and RAILWAY_PROJECT_ID secrets
- Automatic build happens on Railway (see railway.json)

### Troubleshooting CI/CD

**Frontend Build Fails with "npm error EBUSY"**
- Solution: Pipeline includes `npm cache clean --force` before install
- Cause: Concurrent file access during npm package installation
- Prevention: Always clear cache in CI environments

**Vite Version Compatibility Issues**
- Vite 5.4.11 is pinned for Node.js 18+ compatibility
- Do NOT upgrade Vite without verifying Node version support
- Error: "Unsupported engine" means Vite version too new for current Node

**Backend CI Timeout**
- Integration tests with Testcontainers can take 2-5 minutes
- PostgreSQL container startup adds 30-60 seconds
- Docker must be available in CI runner

**Railway Deployment Fails**
- Verify RAILWAY_TOKEN is valid and not expired
- Check RAILWAY_PROJECT_ID matches actual project ID
- Review Railway logs: `railway logs --service frontend`
- Common issue: Frontend build succeeds locally but fails on Railway (check Node version)

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

- **CI/CD Pipeline Enhancements:** Complete GitHub Actions pipeline with frontend build checks (January 2026)
  - Backend CI: Gradle build + integration tests with Testcontainers
  - Frontend CI: Vite build + TypeScript checking + linting
  - Railway Deployment: Automatic frontend deployment on push to main
  - npm cache cleanup to fix EBUSY errors on Railway
  - Node.js 18 compatibility across all workflows

- **Frontend Dependencies Pinned:** Vite locked to 5.4.11 for Node.js 18 compatibility (January 2026)
  - Changed from `^5.4.11` to `5.4.11` (exact version)
  - Prevents automatic upgrades to Vite 7.x which requires Node 20.19+
  - Ensures Railway deployment stability with Node v22.11.0

- **Test Credentials Fixed:** BCrypt password hashes corrected for admin/manager/user accounts (January 2026)
  - All test accounts use hash: `$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2L1MJLTzCIBkjy1kzp1HaT6`
  - Fixes "Bad credentials" authentication errors

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

## Current Implementation Status

### Fully Implemented (90%+)
- Backend: Conventions, Projets, Marchés, Fournisseurs, Analytical Dimensions
- Frontend: Dashboards, Conventions, Marchés, Projets, Analytical Reporting, User Profile

### Partial Implementation (60-75%)
- Décomptes: Backend ready, frontend basic list page only
- Ordres de Paiement: Backend ready, frontend incomplete
- Paiements: Backend ready, frontend incomplete
- Budgets: Backend exists, frontend minimal

### Missing Features
- Sub-conventions (sous-conventions)
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
