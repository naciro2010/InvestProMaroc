# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InvestPro Maroc** is a comprehensive financial management platform for managing investment expenses and commission calculations in Morocco. It consists of a Kotlin/Spring Boot backend and a React/TypeScript frontend for tracking conventions, projects, markets (marchés), payments, and analytical cost allocations.

**Tech Stack:**
- **Backend:** Kotlin 2.0.21, Spring Boot 3.3.5, PostgreSQL 16, JWT Auth, Spring Security
- **Frontend:** React 18, TypeScript 5.x, Vite, TailwindCSS, Material-UI, Recharts
- **Database:** PostgreSQL with JSONB for analytical dimensions

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
| **Projet** | Investment program with budget and analytical axes | code, designation, budgetTotal, status |
| **Marché** | Procurement contract (travaux, fournitures, services) | code, montantHT, montantTTC, fournisseur, convention |
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

Test accounts available in `README.md` (admin/admin123, manager/manager123, user/user123).

### Security Configuration

- **Backend:** Spring Security 6.x with `@PreAuthorize` annotations
- **Frontend:** `PrivateRoute` wrapper checks `isAuthenticated` from `AuthContext`
- **CORS:** Configured in `SecurityConfig.kt` (dev: localhost, prod: GitHub Pages)
- **Tokens:** Access token (24h), refresh token (7d)

## API Structure

### Endpoint Naming Convention

All endpoints follow REST conventions with French naming:

```
/api/conventions     - Convention management
/api/projets         - Project management
/api/marches         - Procurement contracts (note: endpoint is "marches")
/api/marches/:id/lignes  - Contract line items
/api/marches/:id/avenants - Contract amendments
/api/decomptes       - Billing statements
/api/ordres-paiement - Payment orders
/api/paiements       - Payments
/api/fournisseurs    - Suppliers
/api/dimensions      - Analytical dimensions
/api/imputations     - Analytical imputations
/api/users           - User management
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
   - Check existing migrations: V1-V11 already exist
   - Next migration should be V12
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

- **Current Migrations (V1-V11):**
  - **V1:** Clean schema with all tables and constraints (59KB comprehensive schema)
  - **V2:** Update user passwords (bcrypt hashing)
  - **V3-V4:** Seed test conventions data
  - **V6:** Seed dimensions analytiques (analytical dimensions)
  - **V7:** Rich test data (conventions, projets, fournisseurs)
  - **V8:** Seed budgets, marchés, décomptes, paiements (17KB test data)
  - **V9:** Fix enum types to VARCHAR
  - **V10:** Create projets table
  - **V11:** Add convention workflow fields (created_by_id, motif_rejet) and update status enum (Jan 2026)

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

8. **Test Credentials:** Use `admin/admin123` for testing (see README.md for full list). Change passwords before production.

9. **Reporting:** The `ReportingAnalytiquePage` demonstrates dynamic JSONB queries with filters. Use this pattern for new analytical features.

10. **Error Handling:** Backend uses `@ControllerAdvice` for global exception handling. Frontend shows toast notifications via `ToastContext`.

11. **Convention Workflow:** Improved workflow with rejection handling:
    - BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE
    - SOUMIS → REJETE (with motif) → BROUILLON (correction)
    - Status EN_COURS renamed to EN_EXECUTION for clarity
    - CreatedBy field tracks convention creator automatically
    - Rejection motif stored and displayed in UI

12. **Number Formatting:** Frontend forms use French number formatting (1 000 000,00) with automatic parsing for clean UX.

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

- **Plan Analytique Dynamique:** Migrated from rigid Projet+Axe to flexible JSONB dimensions (December 2024)
- **Marchés System:** Complete implementation with line items, amendments, and analytical imputation per line
- **Flyway Migrations Active:** Using Flyway for database versioning (11 migrations as of Jan 2026)
- **ExcelJS Integration:** Frontend now uses ExcelJS instead of XLSX for better spreadsheet generation
- **Convention Workflow Amélioré:** New workflow with REJETE status, createdBy tracking, and improved rejection handling (January 2026)
- **Railway Deployment:** Frontend configured for Railway with SPA routing fix (`serve -s`) (January 2026)
- **Simple Convention Form:** Replaced complex wizard with clean, focused form for CADRE conventions

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

### 1. Use Validated, Production-Ready Technologies

- **NO workarounds or hacks** - Always use proper, documented solutions
- **NO experimental or unstable packages** - Stick to well-maintained, widely-adopted libraries
- **NO quick fixes that compromise quality** - Take time to implement clean, maintainable solutions

### 2. Dependency Management

- Only use dependencies from official package registries (npm, Maven Central)
- Verify package:
  - Has active maintenance (recent commits/releases)
  - Has good documentation
  - Has reasonable download stats / community adoption
  - No known security vulnerabilities
- Prefer official plugins and extensions over third-party alternatives

### 3. Architecture Patterns

- Follow existing architectural patterns in the codebase:
  - Backend: `GenericCrudService`, `BaseEntity`, DTO pattern
  - Frontend: Context API, Axios interceptors, React Router
- Don't introduce new patterns without strong justification
- Keep solutions simple and aligned with project architecture

### 4. Problem-Solving Approach

**ALWAYS prefer:**
1. **Official documentation solutions** - Check framework/library docs first
2. **Established patterns in the codebase** - Follow what already exists
3. **Clean, standard approaches** - Use industry best practices
4. **Maintainable code** - Code that future developers can understand

- ✅ Use ONLY validated, production-ready technologies
- ✅ Follow existing architecture patterns
- ✅ Test before committing (see DEVELOPMENT_GUIDELINES.md)
- ❌ No workarounds or hacks
- ❌ No experimental packages
- ❌ No quick fixes that compromise quality

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
