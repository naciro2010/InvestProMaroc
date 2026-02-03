# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## 🎯 SKILLS & CORE COMPETENCIES

**Architecture Patterns maîtrisés dans InvestPro:**

| Skill | Description | Implementation |
|-------|-------------|----------------|
| **🔷 Micro-Frontend** | Composants < 300 lignes, responsabilité unique | `components/[feature]/` avec barrel exports |
| **🔷 Micro-Backend** | Endpoints granulaires, pas de "god objects" | `GET /entity/{id}/basic`, `/stats`, `/lignes` |
| **🔷 Design System Centralisé** | Tous les styles dans un fichier unique | `designSystem.ts` - colors, typography, componentStyles |
| **🔷 List Page Pattern** | Structure uniforme pour tous les listings | `componentStyles.listPage` avec header/toolbar/table |
| **🔷 Status Badge Pattern** | Gestion centralisée des statuts | `getStatusConfig()` + StatusBadge component |
| **🔷 Drag & Drop** | Réorganisation utilisateur sur toutes les listes | `SortableTable` + localStorage persistence |
| **🔷 Strong Typing** | Aucun `any`/`Any`, DTOs typés partout | TypeScript strict + Kotlin non-null |
| **🔷 Lazy Loading** | Code splitting par route | `React.lazy()` + Vite manualChunks |

**Golden Rules:**
1. **Never load data you don't display** - Micro-endpoints uniquement
2. **Never hardcode colors** - `designSystem.ts` uniquement
3. **Never create monoliths** - Max 300 lignes par fichier
4. **Never use `any`** - Types explicites partout

---

## ⚠️ CRITICAL: STRONG TYPING IS MANDATORY

**❌ NEVER use `any` type (TypeScript) or `Any` type (Kotlin) in this project.**

Every value must have an explicit, strong type:
- Function parameters and return types
- Variable declarations
- API response data structures
- Component props
- Error handling (use `error: unknown` then `instanceof Error` guard)

**All code without proper types will be rejected.**

## ⚠️ CRITICAL: MICRO-FRONTEND & MODULARITY IS MANDATORY

**❌ NEVER create monolithic components exceeding 300 lines of code.**

Every component must follow micro-frontend principles:
- **Single Responsibility**: Each component handles ONE specific concern
- **Modularity**: Extract sections into separate, reusable components
- **Component Structure**:
  ```
  pages/                     # Page-level components (orchestrators)
  components/
    └── [feature]/           # Feature-specific components
        ├── [Feature]Card.tsx       # Individual cards/sections
        ├── [Feature]Tab.tsx        # Tab content components
        ├── [Feature]Modal.tsx      # Modal dialogs
        └── index.ts                # Barrel exports
  ```
- **File Size Limits**:
  - ❌ >500 lines: Immediate refactor required
  - ⚠️ 300-500 lines: Consider splitting
  - ✅ <300 lines: Ideal

**Example: Convention Detail Page Refactoring**
```typescript
// ❌ BAD - Monolithic (767 lines)
ConventionDetailPageModern.tsx (all-in-one)

// ✅ GOOD - Modular (300 lines main + 3 micro-components)
pages/conventions/ConventionDetailPageModern.tsx  // Orchestrator
components/conventions/detail/
  ├── ConventionInfoCard.tsx              // 130 lines
  ├── ConventionSousConventionsCard.tsx   // 110 lines
  ├── ConventionAvenantsTab.tsx           // 120 lines
  └── index.ts                             // Barrel exports
```

**Benefits:**
- ✅ Better testability (isolated components)
- ✅ Easier debugging (smaller surface area)
- ✅ Improved reusability (compose components)
- ✅ Faster development (parallel work on components)
- ✅ Better performance (lazy loading, code splitting)

**Enforcement:**
- All pull requests with files >500 lines will be rejected
- Consider using React.lazy() for code splitting large features

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
│   │   ├── security/     # JWT auth + custom annotations
│   │   │   └── annotations/  # @ReadAccess, @WriteAccess, @AdminOnly
│   │   └── config/       # Spring configuration (SecurityConfig)
│   └── src/main/resources/db/migration/  # Flyway migrations
├── frontend/             # React TypeScript SPA
│   └── src/
│       ├── pages/        # Route components
│       ├── components/
│       │   ├── core/     # Design system components (PageHeader, StickyActionBar, FormLayout, StatusBadge)
│       │   ├── form/     # Form field components (FormTextField, FormNumberField, etc.)
│       │   ├── layout/   # Layout components (AppLayout, Sidebar)
│       │   └── ui/       # UI widgets (RichTextEditor, modals, etc.)
│       ├── lib/
│       │   ├── api.ts          # Axios client + JWT interceptors
│       │   ├── authService.ts  # Centralized auth service (token parsing, expiry, logout)
│       │   └── designSystem.ts # Design tokens (colors, typography, spacing, shadows)
│       ├── contexts/     # React contexts (Auth, Toast)
│       └── types/        # TypeScript types
└── legacy/              # Old codebase (ignore)
```

### Backend Layered Architecture
```
HTTP Request → JwtAuthenticationFilter
              ↓
           SecurityFilterChain (Role Hierarchy: ADMIN > MANAGER > USER)
              ↓
           Controller (@ReadAccess / @WriteAccess / @AdminOnly)
              ↓
           Service (extends GenericCrudService<Entity, Long>)
              ↓
           Repository (Spring Data JPA)
              ↓
           PostgreSQL + ApiResponse<T>
```

### Frontend Architecture
```
App.tsx → AuthProvider (JWT + proactive token check)
          ↓
       AppLayout → PageHeader (breadcrumbs, title, actions)
          ↓
       Pages → Core Components (StickyActionBar, FormLayout, StatusBadge)
          ↓
       API Client (axios + authService interceptors)
          ↓
       Backend REST API
```

## ⚡ CRITICAL: Micro-Frontend + Micro-Backend Architecture

### ❌ PROBLEM: Monolithic Endpoints

**DO NOT** create endpoints that return everything at once:

```kotlin
// ❌ BAD - Returns massive "god object"
@GetMapping("/marches/{id}")
fun getMarche(id: Long): MarcheResponse {
    return MarcheResponse(
        marche = marche,
        lignes = lignes,           // 100+ lines
        avenants = avenants,       // 10+ avenants
        decomptes = decomptes,     // 50+ decomptes
        fournisseur = fournisseur, // Nested object
        convention = convention,   // Nested object
        paiements = paiements,     // More nested data
        // ... and more nested collections
    )
}
```

**Problems:**
- ⚠️ **Huge payload size** (100+ KB for single request)
- ⚠️ **Slow response time** (multiple JOINs, N+1 queries)
- ⚠️ **Unnecessary data transfer** (loading data not displayed)
- ⚠️ **Memory issues** on frontend (large objects in state)
- ⚠️ **Poor UX** (long loading times, blank screens)

### ✅ SOLUTION: Granular Resource Endpoints

**DO** create micro-endpoints that return only what's needed:

```kotlin
// ✅ GOOD - Micro-endpoints returning focused data

// 1. Basic info only (10 KB)
@GetMapping("/marches/{id}/basic")
fun getMarcheBasic(id: Long): MarcheBasicDTO

// 2. Stats/metrics (5 KB)
@GetMapping("/marches/{id}/stats")
fun getMarcheStats(id: Long): MarcheStatsDTO

// 3. Lignes sub-resource (lazy loaded)
@GetMapping("/marches/{id}/lignes")
fun getMarcheLignes(id: Long): List<LigneDTO>

// 4. Décomptes sub-resource (lazy loaded)
@GetMapping("/marches/{id}/decomptes")
fun getMarcheDecomptes(id: Long): List<DecompteDTO>

// 5. Avenants sub-resource (lazy loaded)
@GetMapping("/marches/{id}/avenants")
fun getMarcheAvenants(id: Long): List<AvenantDTO>

// 6. Count endpoints for quick metrics
@GetMapping("/marches/{id}/lignes/count")
fun countLignes(id: Long): CountDTO

@GetMapping("/marches/{id}/montant-paye")
fun getMontantPaye(id: Long): MontantDTO
```

**Benefits:**
- ✅ **Small payloads** (5-20 KB per request)
- ✅ **Fast responses** (no complex JOINs)
- ✅ **Lazy loading** (load only what's displayed)
- ✅ **Better caching** (granular cache invalidation)
- ✅ **Smooth UX** (progressive loading, no blank screens)

### 🎨 Frontend: Micro-Components Pattern

Each React component loads its own data independently:

```tsx
// ❌ BAD - Monolithic component loading everything
function MarcheDetailPage() {
  const [marcheData, setMarcheData] = useState(null) // Huge object

  useEffect(() => {
    // Single massive request
    const data = await api.get(`/marches/${id}`) // 100+ KB
    setMarcheData(data) // Loads everything at once
  }, [id])

  return (
    <>
      <MarcheHeader data={marcheData} />
      <MarcheStats data={marcheData} />
      <MarcheLignes data={marcheData.lignes} />
      <MarcheDecomptes data={marcheData.decomptes} />
    </>
  )
}

// ✅ GOOD - Micro-components with independent data loading
function MarcheDetailPageModern() {
  return (
    <>
      {/* Each component loads its own data */}
      <MarcheHeader marcheId={id} />      {/* GET /marches/{id}/basic */}
      <MarcheStats marcheId={id} />       {/* GET /marches/{id}/stats */}
      <MarcheLignes marcheId={id} />      {/* GET /marches/{id}/lignes */}
      <MarcheDecomptes marcheId={id} />   {/* GET /marches/{id}/decomptes */}
    </>
  )
}

// ✅ Each micro-component manages its own state
function MarcheLignesSection({ marcheId }: { marcheId: number }) {
  const [lignes, setLignes] = useState<Ligne[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Focused micro-endpoint
    marchesAPI.getLignes(marcheId).then(setLignes)
  }, [marcheId])

  return <LignesTable lignes={lignes} loading={loading} />
}
```

### 📐 Implementation Pattern

**Backend Controller:**

```kotlin
@RestController
@RequestMapping("/api/marches")
class MarcheController(
    private val marcheService: MarcheService,
    private val ligneService: MarcheLigneService,
    private val decompteService: DecompteService
) {
    // Basic info endpoint
    @GetMapping("/{id}/basic")
    fun getBasic(@PathVariable id: Long): ResponseEntity<ApiResponse<MarcheBasicDTO>> {
        val marche = marcheService.findById(id)
        return ok(ApiResponse.success(marche.toBasicDTO()))
    }

    // Stats endpoint (aggregated data)
    @GetMapping("/{id}/stats")
    fun getStats(@PathVariable id: Long): ResponseEntity<ApiResponse<MarcheStatsDTO>> {
        return ok(ApiResponse.success(
            MarcheStatsDTO(
                montantTotal = marcheService.getMontantTotal(id),
                montantPaye = decompteService.getTotalPaye(id),
                nombreLignes = ligneService.countByMarche(id),
                tauxAvancement = marcheService.getTauxAvancement(id)
            )
        ))
    }

    // Sub-resource endpoint
    @GetMapping("/{id}/lignes")
    fun getLignes(@PathVariable id: Long): ResponseEntity<ApiResponse<List<LigneDTO>>> {
        val lignes = ligneService.findByMarcheId(id)
        return ok(ApiResponse.success(lignes.map { it.toDTO() }))
    }

    // Count endpoint (very fast)
    @GetMapping("/{id}/lignes/count")
    fun countLignes(@PathVariable id: Long): ResponseEntity<ApiResponse<CountDTO>> {
        return ok(ApiResponse.success(CountDTO(ligneService.countByMarche(id))))
    }
}
```

**Frontend API Client:**

```typescript
export const marchesAPI = {
  // Micro-endpoints
  getBasic: (id: number) => api.get(`/marches/${id}/basic`),
  getStats: (id: number) => api.get(`/marches/${id}/stats`),
  getLignes: (id: number) => api.get(`/marches/${id}/lignes`),
  getDecomptes: (id: number) => api.get(`/marches/${id}/decomptes`),
  getAvenants: (id: number) => api.get(`/marches/${id}/avenants`),

  // Count endpoints
  countLignes: (id: number) => api.get(`/marches/${id}/lignes/count`),
  getMontantPaye: (id: number) => api.get(`/marches/${id}/montant-paye`),
}
```

### 🎯 Migration Strategy

1. **Identify heavy endpoints** (>50 KB response size)
2. **Split into micro-endpoints** following REST sub-resource pattern
3. **Create focused DTOs** for each endpoint
4. **Refactor frontend** to use micro-components
5. **Add caching** at micro-endpoint level (Redis, HTTP cache)
6. **Monitor performance** (response times, payload sizes)

### 📊 Performance Comparison

| Metric | Monolithic | Micro-Endpoints |
|--------|-----------|-----------------|
| Initial load | 150 KB, 2.5s | 15 KB, 300ms |
| Lignes section | Included | 25 KB, 400ms (lazy) |
| Décomptes section | Included | 30 KB, 500ms (lazy) |
| **Total transferred** | **150 KB** | **70 KB** (progressive) |
| **Time to interactive** | **2.5s** | **300ms** |
| Cache efficiency | Low (all or nothing) | High (granular) |

### 🔄 Apply to All Modules

**This pattern must be applied to:**
- ✅ Marchés (already migrated to MarcheDetailPageModern.tsx)
- ⚠️ Conventions (migrate ConventionDetailPage.tsx)
- ⚠️ Projets (migrate ProjetDetailPage.tsx)
- ⚠️ Décomptes (migrate DecompteDetailPage.tsx)
- ⚠️ All future detail pages

**Golden Rule:**
> **Never load data you don't immediately display. Every visible section should have its own micro-endpoint and micro-component.**

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

### Centralized Auth Architecture (January 2026)

**Backend - Role Hierarchy + Custom Annotations:**
```
SecurityConfig.kt:
  - Role Hierarchy: ADMIN > MANAGER > USER (automatic inheritance)
  - All routes protected by default (anyRequest().authenticated())
  - Public routes explicitly listed in PUBLIC_ROUTES companion object
  - Custom 401/403 JSON responses (no redirects)

SecurityAnnotations.kt:
  @ReadAccess   → hasRole('USER')    → All authenticated users
  @WriteAccess  → hasRole('MANAGER') → Managers and admins (via hierarchy)
  @AdminOnly    → hasRole('ADMIN')   → Admins only
```

**Frontend - 3-Layer Token Protection:**
```
1. authService.ts - Proactive check (polling every 30s)
2. api.ts request interceptor - Pre-check before every request
3. api.ts response interceptor - Handle 401 with token refresh
```

**Key Files:**
| File | Purpose |
|------|---------|
| `backend/.../config/SecurityConfig.kt` | Role hierarchy, route protection, exception handling |
| `backend/.../security/annotations/SecurityAnnotations.kt` | @ReadAccess, @WriteAccess, @AdminOnly |
| `frontend/src/lib/authService.ts` | JWT parsing, token expiry, proactive check, logout |
| `frontend/src/lib/api.ts` | Axios interceptors using authService |
| `frontend/src/contexts/AuthContext.tsx` | React auth state with hasRole/hasAnyRole/isAdmin/isManager |

### JWT Flow
1. Login via `POST /api/auth/login` with username/password
2. Backend returns `{accessToken, refreshToken, user}`
3. Frontend stores tokens via `authService.storeTokens()`, sets AuthContext
4. Axios interceptor adds `Authorization: Bearer <token>` to requests
5. Proactive token expiration check runs every 30 seconds
6. On 401, interceptor refreshes via `/api/auth/refresh` (queues concurrent requests)
7. If refresh fails or token expired, user is logged out and redirected to `/login`

### Roles (with Hierarchy)
| Role | Permissions | Annotation |
|------|-------------|------------|
| **ADMIN** | Full system access (inherits MANAGER + USER) | `@AdminOnly` |
| **MANAGER** | CRUD conventions, marchés, décomptes (inherits USER) | `@WriteAccess` |
| **USER** | Read-only access | `@ReadAccess` |

**New routes are automatically protected** - `anyRequest().authenticated()` ensures no route is accidentally public.

### Test Accounts (V3__seed_data.sql)
```
admin / admin123      (ADMIN)
manager / manager123  (MANAGER)
user / user123        (USER)
```

### Security Checklist
- ✅ JWT + Spring Security 6.x with role hierarchy
- ✅ Custom security annotations (@ReadAccess, @WriteAccess, @AdminOnly)
- ✅ All routes protected by default (anyRequest().authenticated())
- ✅ Proactive token expiration check (30s polling)
- ✅ Concurrent 401 request queuing during token refresh
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
| `src/lib/designSystem.ts` | Design tokens (colors, typography, spacing, shadows, componentStyles) |
| `src/lib/authService.ts` | Centralized auth (JWT parsing, expiry check, logout) |
| `src/lib/api.ts` | Axios client with JWT interceptors + all endpoints |
| `src/contexts/AuthContext.tsx` | Global auth state (hasRole, isAdmin, isManager) |
| `src/components/core/` | Core micro-components (PageHeader, StickyActionBar, FormLayout, StatusBadge) |
| `src/components/form/` | Form field components (FormTextField, FormNumberField, etc.) |
| `src/components/layout/AppLayout.tsx` | Sidebar layout |
| `src/App.tsx` | React Router main routing |
| `vite.config.ts` | Vite config with /api proxy |

### Design System Usage
```typescript
// Import design tokens
import { colors, typography, spacing, componentStyles } from '@/lib/designSystem'

// Use pre-built styles in sx props
<Box sx={componentStyles.card}>...</Box>
<Button sx={componentStyles.buttonPrimary}>Save</Button>

// Use tokens directly
<Typography sx={{ color: colors.gray[700], fontSize: typography.sizes.sm }}>
  Label
</Typography>
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
<StatusBadge status="BROUILLON" size="small" />
```

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
  const { user, isAuthenticated, logout, hasRole, isAdmin, isManager } = useAuth()
  // hasRole('ADMIN'), hasAnyRole(['ADMIN', 'MANAGER'])
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

## ⚠️ CRITICAL: Design System UX v2.0 (Confluence/Jira/Odoo)

### Principes de Design UX

**INSPIRATION:**
- **Confluence** - Interface épurée, professionnelle, beaucoup de blanc
- **Jira** - Dense mais organisé, badges de statut colorés, données structurées
- **Odoo** - Moderne, accent purple, cards plates, formulaires clairs

**PRINCIPES OBLIGATOIRES:**
1. **Pas de gradients** dans les zones de contenu (flat design)
2. **Couleurs du design system uniquement** (`designSystem.ts`)
3. **Ombres subtiles** (Atlassian-style, low opacity)
4. **Espacement cohérent** (base 8px)
5. **Typographie hiérarchisée** (xs → 4xl)
6. **Accessibilité WCAG AA** (contraste minimum)

### Palette de Couleurs (Design System v2.0)

```typescript
// ❌ INTERDIT - Couleurs en dur
<Box sx={{ backgroundColor: '#3b82f6' }}>  // NON!
<Card style={{ color: 'rgb(16, 185, 129)' }}>  // NON!

// ✅ OBLIGATOIRE - Utiliser designSystem.ts
import { colors, componentStyles } from '@/lib/designSystem'

<Box sx={{ backgroundColor: colors.primary[600] }}>
<Card sx={componentStyles.card}>
```

**Couleurs sémantiques:**
| Couleur | Usage | Token |
|---------|-------|-------|
| **Primary (Blue)** | Actions, liens, sélection | `colors.primary[600]` = `#0c66e4` |
| **Success (Green)** | Validation, statuts actifs | `colors.success[600]` = `#1f845a` |
| **Danger (Red)** | Erreurs, suppression | `colors.danger[600]` = `#c9372c` |
| **Warning (Yellow)** | Avertissements, en attente | `colors.warning[600]` = `#946f00` |
| **Info (Teal)** | Informations, en cours | `colors.info[600]` = `#227d9b` |
| **Purple** | Accent Odoo, badges spéciaux | `colors.purple[600]` = `#6e5dc6` |
| **Neutral** | Textes, bordures, fonds | `colors.neutral[50-900]` |

### Styles de Composants Pré-définis

```typescript
import { componentStyles } from '@/lib/designSystem'

// Cards
<Box sx={componentStyles.card}>           // Bordure, pas d'ombre
<Box sx={componentStyles.cardElevated}>   // Ombre subtile, hover effect
<Box sx={componentStyles.cardInteractive}> // Cliquable, lift on hover

// Boutons
<Button sx={componentStyles.buttonPrimary}>   // Bleu plein
<Button sx={componentStyles.buttonSecondary}> // Outline gris
<Button sx={componentStyles.buttonDanger}>    // Rouge plein
<Button sx={componentStyles.buttonGhost}>     // Sans bordure

// Tables
<TableContainer sx={componentStyles.table.container}>
<TableHead sx={componentStyles.table.header}>
<TableRow sx={componentStyles.table.row}>
<TableCell sx={componentStyles.table.cell}>

// Stat Cards (Dashboard KPIs)
<Card sx={componentStyles.statCard}>
```

### 📋 Pattern List Page - Pages de Listing Uniformes

**OBLIGATOIRE pour toutes les pages de listing** (Conventions, Marchés, Projets, Budgets, Décomptes, etc.)

```typescript
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'

// 1. Récupérer les styles centralisés
const styles = componentStyles.listPage

// 2. StatusBadge unifié via getStatusConfig()
const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status)
  return (
    <Box sx={{
      display: 'inline-flex',
      px: 1.5, py: 0.5,
      borderRadius: '4px',
      bgcolor: config.bgColor,
      color: config.textColor,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
    }}>
      {config.label}
    </Box>
  )
}

// 3. Structure de page
return (
  <AppLayout>
    <Box sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography sx={styles.title}>Conventions</Typography>
        <Typography sx={styles.subtitle}>Description</Typography>
        <Button>Nouveau</Button>
      </Box>

      {/* Toolbar avec filtres */}
      <Box sx={styles.toolbar}>
        <TextField sx={styles.searchField} />
        <Chip sx={isActive ? styles.filterPillActive : styles.filterPill}>
          <span>Statut</span>
          <Box sx={styles.countBadge}>{count}</Box>
        </Chip>
      </Box>

      {/* Table */}
      <Box sx={styles.tableContainer}>
        <TableHead><TableRow sx={styles.tableHeader}>...</TableRow></TableHead>
        <TableBody>
          <TableRow sx={styles.tableRowClickable}>...</TableRow>
          <TableRow sx={styles.tableRowChild}>...</TableRow>  {/* Sous-items */}
        </TableBody>
        <TablePagination />
      </Box>
    </Box>
  </AppLayout>
)
```

**Styles disponibles dans `componentStyles.listPage`:**
| Style | Usage |
|-------|-------|
| `container` | Container principal `minHeight: 100vh` |
| `header` | Header avec titre, actions |
| `title` | Titre principal (2xl, bold) |
| `subtitle` | Sous-titre (sm, gris) |
| `toolbar` | Barre recherche/filtres |
| `searchField` | Champ de recherche stylisé |
| `tableContainer` | Container table avec ombre |
| `tableHeader` | Header table (uppercase, gris) |
| `tableRowClickable` | Ligne cliquable avec hover |
| `tableRowChild` | Ligne enfant (sous-convention) |
| `filterPillActive` | Filtre actif (primary) |
| `filterPill` | Filtre inactif (outline) |
| `countBadge` | Badge compteur dans filtre |

**Pages utilisant ce pattern:**
- ✅ `ConventionsTableModern.tsx` - Avec groupement parent/enfants
- ✅ `MarchesPage.tsx` - Avec vue carte
- ✅ `ProjetsPage.tsx` - Avec cards grid
- ✅ `BudgetsPage.tsx` - Table simple
- ✅ `DecomptesPageComplete.tsx` - Table simple

### Pattern Micro-Component avec Data Loading

```typescript
// ✅ OBLIGATOIRE - Chaque micro-component charge ses propres données

// Parent (orchestrateur) - NE charge PAS tout
function MarcheDetailPage({ marcheId }: { marcheId: number }) {
  return (
    <>
      <MarcheHeader marcheId={marcheId} />      {/* GET /marches/{id}/basic */}
      <MarcheStatsCard marcheId={marcheId} />   {/* GET /marches/{id}/stats */}
      <MarcheLignesSection marcheId={marcheId} /> {/* GET /marches/{id}/lignes */}
      <MarcheDecomptesSection marcheId={marcheId} /> {/* GET /marches/{id}/decomptes */}
    </>
  )
}

// Micro-component - charge SES données uniquement
function MarcheStatsCard({ marcheId }: { marcheId: number }) {
  const [stats, setStats] = useState<MarcheStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    marchesAPI.getStats(marcheId).then(res => setStats(res.data.data))
  }, [marcheId])

  if (loading) return <CircularProgress />

  return (
    <Card sx={componentStyles.statCard}>
      {/* Affiche uniquement les stats */}
    </Card>
  )
}
```

### StatusBadge - Badges de Statut Atlassian-Style

```typescript
import StatusBadge from '@/components/core/StatusBadge'

// Statuts workflow
<StatusBadge status="BROUILLON" />  // Gris
<StatusBadge status="SOUMIS" />     // Jaune/Orange
<StatusBadge status="VALIDEE" />    // Vert
<StatusBadge status="EN_EXECUTION" /> // Bleu/Teal
<StatusBadge status="REJETE" />     // Rouge
<StatusBadge status="ACHEVE" />     // Vert foncé

// Types
<StatusBadge status="CADRE" />      // Bleu (primary)
<StatusBadge status="SPECIFIQUE" /> // Purple

// Options
<StatusBadge status="VALIDEE" size="small" />
<StatusBadge status="URGENT" dotOnly />  // Point seul sans label
```

### Sidebar/AppLayout - Design Confluence

Le sidebar utilise **uniquement** les tokens du design system:
- Fond: `colors.surface` (blanc)
- Bordure: `colors.border`
- Texte: `colors.textPrimary`, `colors.textSecondary`
- Active: `colors.primary[50]` bg + `colors.primary[700]` text
- Hover: `colors.neutral[100]`
- Badge "Bientôt": `colors.purple[50/700]`

### Règles Anti-Gradient

```typescript
// ❌ INTERDIT
background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
background: colors.gradients.primary  // N'EXISTE PLUS

// ✅ OBLIGATOIRE - Couleurs plates
backgroundColor: colors.primary[600]
// ou pour header spécial (exception acceptée):
background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`
```

### Checklist Design UX

- ✅ **Aucune couleur hardcodée** - Tout vient de `designSystem.ts`
- ✅ **Pas de gradient** dans le contenu
- ✅ **Micro-components** avec data loading indépendant
- ✅ **StatusBadge** pour tous les statuts (pas de Chip manuel)
- ✅ **componentStyles** pour cards, boutons, tables
- ✅ **Espacement** via `spacing.mui.*` (pas de valeurs en dur)
- ✅ **Typographie** via `typography.sizes.*`
- ✅ **Bordures** via `borders.radius.*`
- ✅ **Ombres** via `shadows.*`

## 🖱️ Drag & Drop - Signature UX InvestPro

**Le drag & drop est LA signature UX d'InvestPro.** Toutes les listes doivent permettre la réorganisation par l'utilisateur.

### Composants Disponibles

```typescript
// Import depuis le composant centralisé
import {
  SortableTableRow,      // Ligne de table draggable
  SortableListItem,      // Item de liste draggable
  DragHandle,            // Poignée de drag autonome
  useSortableTable,      // Hook de gestion du drag & drop
  DndContext,            // Contexte DnD
  SortableContext,       // Contexte de tri
  closestCenter,         // Détection de collision
  verticalListSortingStrategy,
  useSortable,           // Hook bas niveau
} from '@/components/core/SortableTable'
```

### Pattern Table (MUI Table)

```tsx
import { SortableTableRow, useSortableTable, DndContext, SortableContext, closestCenter, verticalListSortingStrategy } from '@/components/core/SortableTable'

function MyTable() {
  const [rawData, setRawData] = useState<Item[]>([])

  // Hook qui gère état + localStorage
  const { items, sensors, handleDragEnd } = useSortableTable({
    initialItems: rawData,
    idKey: 'id',
    storageKey: 'my-table-order',  // Persiste l'ordre dans localStorage
  })

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <TableContainer>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />  {/* Colonne pour le handle */}
                <TableCell>Nom</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <SortableTableRow key={item.id} id={item.id}>
                  <TableCell>{item.name}</TableCell>
                </SortableTableRow>
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </TableContainer>
    </DndContext>
  )
}
```

### Pattern Cartes/Grid

```tsx
import { useSortableTable, useSortable, DndContext, SortableContext, closestCenter } from '@/components/core/SortableTable'
import { CSS } from '@dnd-kit/utilities'

// Carte draggable personnalisée
const SortableCard = ({ item, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <Paper
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      onClick={onClick}
    >
      {/* Handle de drag */}
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
        <GripVertical />
      </Box>
      <Typography>{item.name}</Typography>
    </Paper>
  )
}

function MyGrid() {
  const [rawData, setRawData] = useState<Item[]>([])
  const { items, sensors, handleDragEnd } = useSortableTable({
    initialItems: rawData,
    idKey: 'id',
    storageKey: 'my-grid-order',
  })

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {items.map(item => (
            <SortableCard key={item.id} item={item} onClick={() => navigate(`/detail/${item.id}`)} />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  )
}
```

### Listes avec Drag & Drop Actif

- ✅ **Conventions** (`ConventionsTableModern.tsx`) - `storageKey: 'conventions-order'`
- ✅ **Marchés** (`MarchesPage.tsx`) - `storageKey: 'marches-order'`
- ✅ **Projets** (`ProjetsPage.tsx`) - `storageKey: 'projets-order'`
- ✅ **Menu Sidebar** (`Sidebar.tsx`) - `storageKey: 'menu-order'`

### Règles Obligatoires

1. **Toujours un drag handle visible** - Icône GripVertical de lucide-react
2. **Persistance localStorage** - L'ordre personnalisé survit au rechargement
3. **Feedback visuel** - Opacité réduite pendant le drag, couleur de fond primaire
4. **Non-blocant** - Le clic reste fonctionnel (navigation, actions)

## Important Development Notes

1. **French Naming:** All business entities use French names (Convention, Marché, Décompte, etc.)
2. **JSONB Storage:** Use PostgreSQL JSONB for flexible data structures (analytical dimensions, amendments)
3. **Null Safety:** Kotlin: `Type?` = nullable, `Type` = non-null. TypeScript strict mode enabled
4. **JWT Refresh:** Auto-refreshed via Axios interceptor + proactive 30s polling. Logout on refresh failure
5. **API Proxy:** Dev server proxies `/api` → `http://localhost:8080`
6. **Generic CRUD:** All backend services extend `GenericCrudService` for boilerplate reduction
7. **Design System:** All UI values (colors, typography, spacing, shadows) come from `designSystem.ts`. No hardcoded values
8. **Core Components:** Use `PageHeader`, `StickyActionBar`, `FormLayout`, `StatusBadge` from `@/components/core`
9. **No Gradients:** UI follows flat, professional design. No gradient backgrounds in content areas
10. **Security Annotations:** Use `@ReadAccess`, `@WriteAccess`, `@AdminOnly` instead of `@PreAuthorize`. Role hierarchy handles inheritance
11. **Number Formatting:** French format (1 000 000,00) with automatic parsing
12. **Error Handling:** Backend uses `@ControllerAdvice`. Frontend shows toast via `ToastContext`
13. **Reporting:** `ReportingAnalytiquePage` demonstrates dynamic JSONB filters

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
