# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## ⚠️ CRITICAL: STRONG TYPING IS MANDATORY

**❌ NEVER use `any` type (TypeScript) or `Any` type (Kotlin) in this project.**

Every value must have an explicit, strong type:
- Function parameters and return types
- Variable declarations
- API response data structures
- Component props
- Error handling (use `error: unknown` then `instanceof Error` guard)

**All code without proper types will be rejected.**

## Project Overview

**InvestPro Maroc** is a financial management platform for investment expenses and commission calculations in Morocco.

**Tech Stack:**
- **Backend:** Kotlin 2.0.21, Spring Boot 3.4.1, PostgreSQL 16/17, JWT Auth
- **Frontend:** React 18, TypeScript 5.x, Vite, TailwindCSS, Material-UI, Recharts
- **Database:** PostgreSQL 16/17 with JSONB for analytical data

## Common Commands

### Backend
```bash
cd backend
./gradlew bootRun                      # Dev server (requires PostgreSQL)
./gradlew clean build                  # Full build with tests
./gradlew build -x test                # Build without tests
./gradlew test                         # Run tests
./gradlew clean bootJar                # Production JAR
```

### Frontend
```bash
cd frontend
npm install                            # Install dependencies
npm run dev                            # Dev server (http://localhost:5173)
npm run build                          # Production build
npm start                              # Serve production build
npm run lint                           # ESLint check
```

### Database
```bash
docker-compose up -d postgres          # Start PostgreSQL

# Or manual
docker run --name investpro-postgres \
  -e POSTGRES_DB=investpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine
```

## Architecture

### Monorepo Structure
```
InvestProMaroc/
├── backend/              # Spring Boot Kotlin API
│   ├── src/main/kotlin/ma/investpro/
│   │   ├── controller/   # REST endpoints
│   │   ├── service/      # Business logic (extends GenericCrudService)
│   │   ├── repository/   # Spring Data JPA
│   │   ├── entity/       # JPA entities
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── security/     # JWT authentication
│   │   └── config/       # Spring configuration
│   └── src/main/resources/db/migration/  # Flyway migrations
├── frontend/             # React TypeScript SPA
│   └── src/
│       ├── pages/        # Route components
│       ├── components/   # Reusable UI components
│       ├── lib/          # API client, utilities
│       ├── contexts/     # React contexts (Auth, Toast)
│       └── types/        # TypeScript types
└── legacy/              # Old codebase (ignore)
```

### Backend Layered Architecture
```
HTTP Request → JwtAuthenticationFilter
              ↓
           SecurityFilterChain (@PreAuthorize)
              ↓
           Controller
              ↓
           Service (extends GenericCrudService<Entity, Long>)
              ↓
           Repository (Spring Data JPA)
              ↓
           PostgreSQL + ApiResponse<T>
```

### Frontend Architecture
```
App.tsx → React Router → AuthProvider → AppLayout
         → Pages → API Client (axios) → Backend API
```

### Key Patterns
| Pattern | Purpose |
|---------|---------|
| **GenericCrudService** | Base CRUD service for all entities |
| **BaseEntity** | Audit fields (id, createdAt, updatedAt) |
| **JWT Auth** | Stateless access + refresh tokens |
| **DTO Pattern** | Decouples API from JPA entities |
| **Axios Interceptors** | JWT injection, auto-refresh, logout on expiry |
| **AuthContext** | Global auth state (React Context) |
| **ApiResponse<T>** | Wrapper: `{success, message, data}` |

## Core Business Entities

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **Convention** | Commission calculation rules | code, objet, tauxCommission, montant, status |
| **Projet** | Investment program | code, designation, budgetTotal, status |
| **Marché** | Procurement contract (with geolocation) | code, montantHT, montantTTC, adresse, latitude, longitude |
| **MarcheLigne** | Contract line items | designation, quantite, montantUnitaire, dimensionsValeurs (JSONB) |
| **Decompte** | Billing statements | montant, netAPayer, retenues |
| **Fournisseur** | Supplier with tax IDs | code, ice, if, rib |
| **DimensionAnalytique** | Cost center dimensions | code, libelle, ordre |

**Financial Workflow:**
```
CONVENTION → PROJET → MARCHÉ → MARCHE_LIGNE + DECOMPTE → ORDRE_PAIEMENT → PAIEMENT
```

**Sous-Conventions:** CADRE conventions can have SPECIFIQUE sub-conventions with parameter inheritance.

**Analytical Dimensions:** PostgreSQL JSONB allows unlimited configurable cost allocation dimensions.

**Convention Amendments (Avenants):** JSONB-based history with states: BROUILLON → SOUMIS → VALIDE

## Authentication & Security

### JWT Flow
1. Login via `POST /api/auth/login` with username/password
2. Backend returns `{accessToken, refreshToken, user}`
3. Frontend stores tokens in localStorage, sets AuthContext
4. Axios interceptor adds `Authorization: Bearer <token>` to requests
5. On 401, interceptor refreshes via `/api/auth/refresh`
6. If refresh fails, user is logged out

### Roles
| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access |
| **MANAGER** | CRUD conventions, marchés, décomptes, paiements |
| **USER** | Read-only access |

### Test Accounts (V3__seed_data.sql)
```
admin / admin123      (ADMIN)
manager / manager123  (MANAGER)
user / user123        (USER)
```

### Security Checklist
- ✅ JWT + Spring Security 6.x
- ✅ BCrypt password hashing (cost 10)
- ✅ HMAC SHA-256 signing (256+ bit secret)
- ✅ No sensitive data in localStorage (only tokens)
- ✅ XSS protection (React default)
- ✅ CSRF protection (JWT header, not cookies)
- ✅ SQL injection prevention (parameterized JPA queries)
- ✅ Audit trail (createdBy, createdAt, updatedAt)
- ✅ Soft deletes (`actif` flag)
- ✅ Service worker (HTTPS only, auto-update)

## API Structure

All endpoints follow REST conventions with French naming:

```
/api/conventions          - Convention management
/api/avenants-conventions - Convention amendments
/api/projets              - Projects
/api/marches              - Contracts
/api/decomptes            - Billing
/api/paiements            - Payments
/api/fournisseurs         - Suppliers
/api/dimensions           - Analytical dimensions
/api/users                - User management
```

**Response Format:**
```json
{ "success": true, "message": "...", "data": {...} }
```

## Frontend Routing

```
/                    - Landing (public)
/login               - Login (public)
/dashboard           - Dashboard (protected)
/conventions         - Convention management
/projets             - Project management
/marches             - Procurement contracts
/marches/:id         - Market detail
/decomptes           - Billing statements
/paiements           - Payments
/reporting           - Analytical reporting
/parametrage/plan-analytique - Dimension config
/profile             - User profile
```

## Working with Backend

### Adding New Entity
1. **Entity** in `entity/` extending `BaseEntity`
2. **Repository** in `repository/` extending Spring Data JPA interface
3. **DTO** in `dto/` for request/response
4. **Mapper** in `mapper/` for entity ↔ DTO conversion
5. **Service** in `service/` extending `GenericCrudService<Entity, Long>`
6. **Controller** in `controller/` with REST endpoints
7. **Migration** in `db/migration/` (V{n}__description.sql)
8. **Tests** in `src/test/kotlin/ma/investpro/integration/`

See `CRUD_TEMPLATE.md` for detailed template.

### Database Migrations

⚠️ **CRITICAL RULE: ALWAYS 3 FILES ONLY**

- **Tool:** Flyway (auto-runs on startup)
- **Location:** `backend/src/main/resources/db/migration/`
- **Current Migrations (MUST stay at 3 files only):**
  - **V1:** Drop all tables (clean slate)
  - **V2:** Create complete schema with ALL tables in one file
    - Sections 1-13: All entities (users, conventions, projets, marchés, décomptes, pieces_jointes, etc.)
  - **V3:** Seed test data

**❌ FORBIDDEN:**
- Create V4, V5, V6, etc.
- Create new migration files

**✅ MANDATORY:**
- Add ALL new tables to V2__create_schema.sql
- Add ALL test data to V3__seed_data.sql
- Keep ONLY these 3 files

**Rules:**
- ✅ Use `CREATE TABLE IF NOT EXISTS`
- ✅ Add indexes on foreign keys and frequently queried columns
- ✅ Add CHECK constraints for validation
- ✅ Inherit `created_at`, `updated_at`, `actif` from BaseEntity (include in schema)
- ❌ Never modify existing migrations after deployment
- ❌ Never use inline COMMENT in CREATE TABLE (use separate COMMENT ON statements)

### Testing
- **Framework:** Kotest + JUnit5
- **Mocking:** MockK (Kotlin-idiomatic)
- **Integration Tests:** Testcontainers with real PostgreSQL (requires Docker)
- **Base Class:** `BaseIntegrationTest.kt` sets up test database

## Working with Frontend

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Axios client with JWT interceptors + all endpoints |
| `src/contexts/AuthContext.tsx` | Global auth state |
| `src/App.tsx` | React Router main routing |
| `src/components/layout/AppLayout.tsx` | Sidebar layout |
| `src/components/ui/` | Reusable UI components |
| `vite.config.ts` | Vite config with /api proxy |

### API Client Usage
```typescript
import { conventionsAPI } from '@/lib/api'

// GET
const { data } = await conventionsAPI.getAll()
const items = data.data  // Extract payload

// POST
const newItem = await conventionsAPI.create({ /* ... */ })
```

### Authentication in Components
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  // ...
}
```

### Protected Routes
```typescript
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

## Important Development Notes

1. **French Naming:** All business entities use French names (Convention, Marché, Décompte, etc.)
2. **JSONB Storage:** Use PostgreSQL JSONB for flexible data structures (analytical dimensions, amendments)
3. **Null Safety:** Kotlin: `Type?` = nullable, `Type` = non-null. TypeScript strict mode enabled
4. **JWT Refresh:** Auto-refreshed via Axios interceptor. Logout only on refresh failure
5. **API Proxy:** Dev server proxies `/api` → `http://localhost:8080`
6. **Generic CRUD:** All backend services extend `GenericCrudService` for boilerplate reduction
7. **UI Framework:** MUI for complex components, Tailwind for layout/spacing
8. **Number Formatting:** French format (1 000 000,00) with automatic parsing
9. **Error Handling:** Backend uses `@ControllerAdvice`. Frontend shows toast via `ToastContext`
10. **Reporting:** `ReportingAnalytiquePage` demonstrates dynamic JSONB filters

## Deployment

### Railway (Production)
```bash
cd frontend
npm run build           # Production build
npm start             # Serve -s dist (SPA routing fix)
git push origin main  # Auto-deploys from GitHub
```

**Configuration:**
- Uses `serve -s` flag for SPA routing (fallback to /index.html)
- `railway.json` configures build/deploy commands
- `.env.production` contains production API URL
- Backend: https://investpromaroc-production.up.railway.app
- Frontend: Deployed via Railway

## Environment Variables

### Backend (application-prod.properties)
```
DATABASE_URL                # PostgreSQL connection string
PGDATABASE, PGHOST, PGPORT, PGUSER, PGPASSWORD  # Railway db vars
JWT_SECRET                  # Base64-encoded 256+ bit secret
JWT_EXPIRATION_MS           # Default: 86400000 (24h)
JWT_REFRESH_EXPIRATION_MS   # Default: 604800000 (7d)
CORS_ALLOWED_ORIGINS        # Comma-separated allowed origins
PORT                        # Server port (default: 8080)
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api      # Dev
VITE_API_URL=https://.../api                # Production
```

## CI/CD Pipeline

**GitHub Actions workflows:**
- `ci-backend.yml` - Gradle build + integration tests (on PR)
- `ci-frontend.yml` - Vite build + TypeScript check + linting (on PR)
- `deploy-railway.yml` - Auto-deploy frontend to Railway (on push to main)

**Backend CI:**
- Java 21, Gradle caching, Testcontainers (PostgreSQL 16-alpine)
- Runs `./gradlew clean build --info`

**Frontend CI:**
- Node.js 18, Vite 5.4.21 (pinned for Node 18 compatibility)
- Runs: `npm ci` → `npm run lint` → `npm run build`
- ⚠️ Uses `npm ci` WITHOUT `--omit=dev` (build needs devDependencies)

## Code Quality Standards

### 1. Strong Typing (MANDATORY)
- ❌ **FORBIDDEN:** `Map<String, Any>`, `List<Any>`, `any`, `object`
- ✅ **REQUIRED:** Strongly typed DTOs, specific types for all data
- ✅ Use `ApiResponse<T>` generic wrapper for API responses

### 2. Use Production-Ready Technologies
- Only from official registries (npm, Maven Central)
- Active maintenance, good documentation, reasonable adoption
- NO workarounds, experimental packages, or quick fixes

### 3. Follow Existing Patterns
- Backend: `GenericCrudService`, `BaseEntity`, DTO pattern, `ApiResponse<T>`
- Frontend: Context API, Axios interceptors, React Router
- Always create DTOs for API responses

### 4. Before Committing
```bash
# Backend
./gradlew test

# Frontend
npm run lint && npm run build && npm install
```

See **DEVELOPMENT_GUIDELINES.md** for complete standards.

## Key Documentation Files
- **README.md** - Project overview, setup, features
- **CLAUDE.md** - This file
- **DEVELOPMENT_GUIDELINES.md** - **Mandatory code quality standards**
- **CRUD_TEMPLATE.md** - New entity template
- **backend/CLAUDE.md** - Backend-specific guidance
- **frontend/RAILWAY_DEPLOYMENT.md** - Railway deployment guide

## Troubleshooting

### Flyway Issues
```bash
./gradlew flywayInfo      # Check Flyway state
./gradlew flywayValidate  # Validate migrations
./gradlew flywayBaseline  # For existing databases
```

### Railway Deployment
- **Backend not connecting:** Check PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD environment variables
- **CORS errors:** Update `CORS_ALLOWED_ORIGINS` and redeploy backend
- **Frontend 404:** Verify `serve -s` is used in start script and `railway.json`

### Authentication
- **"Bad credentials" error:** Each test password needs unique BCrypt hash
  ```bash
  cd backend && ./gradlew test --tests "ma.investpro.GenerateBCryptHashesTest" -i | grep "INSERT INTO"
  ```
  Update V3__seed_data.sql with generated hashes

### npm/Package Issues
- **TypeScript type errors:** Regenerate `package-lock.json` after package.json changes
  ```bash
  cd frontend && npm install && git add package-lock.json package.json
  ```
- **EBUSY errors:** Clear npm cache: `npm cache clean --force`
- **Vite version mismatch:** Keep package.json and package-lock.json synchronized
