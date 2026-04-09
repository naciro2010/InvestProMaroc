# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InvestPro Maroc** - Financial management platform for investment expenses and commission calculations in Morocco. Full-stack monorepo with Kotlin/Spring Boot API and React/TypeScript SPA.

- **Backend:** Kotlin 2.0.21, Spring Boot 3.4.1, PostgreSQL 16/17, JWT Auth, Java 21
- **Frontend:** React 18, TypeScript 5.x (strict), Vite, Material-UI v7, Tailwind CSS
- **Database:** PostgreSQL with JSONB for analytical dimensions

## Commands

### Backend
```bash
cd backend
./gradlew bootRun                    # Dev server (requires PostgreSQL on 5432)
./gradlew compileKotlin              # Quick compile check
./gradlew build -x test              # Build without tests
./gradlew clean build                # Full build with tests
./gradlew test                       # All tests
./gradlew test --tests "ma.investpro.integration.AuthIntegrationTest"  # Single test class
./gradlew test --tests "ma.investpro.integration.AuthIntegrationTest.testLogin"  # Single test method
./gradlew test jacocoTestReport      # Coverage report -> build/reports/jacoco/test/html/
./gradlew clean bootJar              # Production JAR -> build/libs/investpro-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm install                          # Install dependencies
npm run dev                          # Dev server (http://localhost:5173)
npm run build                        # TypeScript check + Vite production build
npm run lint                         # ESLint
npm test                             # Vitest
npm run test:coverage                # Vitest with coverage
npm start                            # Production server (serve -s dist -p 3000)
```

### Database
```bash
docker-compose up -d postgres        # Start PostgreSQL + PgAdmin (localhost:5050)
# Or standalone:
docker run --name investpro-postgres \
  -e POSTGRES_DB=investpro -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:16-alpine
```

### Flyway
```bash
cd backend
./gradlew flywayInfo                 # Check migration state
./gradlew flywayValidate             # Validate migrations
./gradlew flywayBaseline             # Baseline existing database
```

## Architecture

### Monorepo Layout
```
InvestProMaroc/
├── backend/src/main/kotlin/ma/investpro/
│   ├── controller/           # REST endpoints (@RestController)
│   ├── service/              # Business logic (extends GenericCrudService)
│   ├── entity/               # JPA entities (extends BaseEntity)
│   ├── repository/           # Spring Data JPA interfaces
│   ├── dto/                  # Data Transfer Objects
│   ├── mapper/               # Entity <-> DTO mappers
│   ├── security/             # JwtService, JwtAuthenticationFilter
│   ├── security/annotations/ # @ReadAccess, @WriteAccess, @AdminOnly
│   └── config/               # SecurityConfig, OpenAPI, CORS
├── frontend/src/
│   ├── pages/                # Route-level components (lazy-loaded)
│   ├── components/
│   │   ├── core/             # PageHeader, StickyActionBar, FormLayout, StatusBadge, SortableTable
│   │   ├── form/             # FormTextField, FormNumberField, etc.
│   │   ├── layout/           # AppLayout, Sidebar
│   │   └── ui/               # Modals, RichTextEditor
│   ├── lib/
│   │   ├── api.ts            # Axios instance + JWT interceptors + all API endpoint functions
│   │   ├── authService.ts    # Token storage/expiry/refresh in localStorage
│   │   └── designSystem.ts   # Color palette, typography, spacing, componentStyles
│   ├── contexts/             # AuthContext, ToastContext, ThemeContext, LayoutContext
│   ├── types/                # TypeScript interfaces
│   ├── hooks/                # Custom React hooks
│   └── schemas/              # Zod validation schemas
└── legacy/                   # Old codebase (ignore)
```

### Backend Request Flow
```
HTTP -> JwtAuthenticationFilter -> SecurityFilterChain (ADMIN > MANAGER > USER hierarchy)
     -> Controller (@ReadAccess/@WriteAccess/@AdminOnly)
     -> Service (extends GenericCrudService<Entity, Long>)
     -> Repository (Spring Data JPA) -> PostgreSQL
     -> ApiResponse<T> { success, message, data }
```

### Frontend Data Flow
```
App.tsx -> React Router (lazy-loaded pages) -> AuthProvider (JWT + 30s polling)
        -> AppLayout -> Pages -> API Client (axios + interceptors) -> Backend
```

Path alias: `@/` maps to `src/` (configured in vite.config.ts and tsconfig.json).

## Mandatory Rules

### Strong Typing
- **No `any` (TypeScript) or `Any` (Kotlin)** - Always use explicit types, DTOs, interfaces
- Use `ApiResponse<T>` wrapper for all API responses
- Use `error: unknown` with `instanceof Error` guards

### Micro-Frontend
- **Max 300 lines per component** (500+ = immediate refactor)
- Extract into `components/[feature]/` with barrel exports
- Each micro-component loads its own data from its own micro-endpoint

### Micro-Backend
- **No god endpoints** returning entire object graphs
- Split into focused endpoints: `/{id}/basic`, `/{id}/stats`, `/{id}/lignes`
- Each endpoint has its own focused DTO

### Design System
- **No hardcoded colors** - Use tokens from `designSystem.ts`
- **No gradients** in content areas (flat Confluence/Jira/Odoo style)
- Use `componentStyles.*` for cards, buttons, tables, list pages
- Use `StatusBadge` component for all status displays
- Use `SortableTable` + localStorage for drag & drop on all lists

## Database Migrations

**CRITICAL: Always exactly 3 files** in `backend/src/main/resources/db/migration/`:

| File | Purpose |
|------|---------|
| V1__drop_all_tables.sql | Drop all tables (clean slate) |
| V2__create_schema.sql | Complete schema - ALL tables go here |
| V3__seed_data.sql | ALL test/seed data |

Never create V4, V5, etc. Use `CREATE TABLE IF NOT EXISTS`, add indexes on FKs, add CHECK constraints. No inline COMMENT in CREATE TABLE (use separate `COMMENT ON` statements).

## Authentication & Security

- **Role hierarchy:** ADMIN > MANAGER > USER (SecurityConfig.kt)
- **Annotations:** `@ReadAccess` (USER), `@WriteAccess` (MANAGER), `@AdminOnly` (ADMIN)
- **All routes protected by default** via `anyRequest().authenticated()`
- **Frontend 3-layer protection:** authService.ts polling (30s), request interceptor, response interceptor with refresh token queuing
- **Test accounts:** admin/admin123, manager/manager123, user/user123
- **Testing:** Kotest + JUnit5, MockK for mocking, Testcontainers with real PostgreSQL (requires Docker)

## Business Domain

All entity and field names use French. Financial workflow:
```
CONVENTION -> PROJET -> MARCHE -> MARCHE_LIGNE + DECOMPTE -> ORDRE_PAIEMENT -> PAIEMENT
```

Key entities: Convention (commission rules, CADRE/SPECIFIQUE hierarchy), Projet (investment programs), Marche (procurement contracts with geolocation), MarcheLigne (line items with JSONB dimensions), Decompte (billing), Fournisseur (suppliers with ICE/IF/RIB tax IDs), DimensionAnalytique (configurable cost centers via JSONB).

Convention amendments (avenants): JSONB snapshots with workflow BROUILLON -> SOUMIS -> VALIDE.

## API Conventions

REST endpoints with French naming. All return `ApiResponse<T>`:
```json
{ "success": true, "message": "...", "data": { } }
```

Endpoints: `/api/conventions`, `/api/projets`, `/api/marches`, `/api/decomptes`, `/api/paiements`, `/api/ordres-paiement`, `/api/fournisseurs`, `/api/dimensions`, `/api/users`, `/api/avenants-conventions`

Frontend API client pattern in `api.ts`:
```typescript
export const conventionsAPI = {
  getAll: () => api.get('/conventions'),
  getById: (id) => api.get(`/conventions/${id}`),
  create: (data) => api.post('/conventions', data),
  soumettre: (id) => api.post(`/conventions/${id}/soumettre`),
}
```

## Adding a New Entity

1. Entity in `entity/` extending `BaseEntity`
2. Repository in `repository/`
3. DTO in `dto/`
4. Mapper in `mapper/`
5. Service in `service/` extending `GenericCrudService<Entity, Long>`
6. Controller in `controller/` with security annotations
7. Table in V2__create_schema.sql + seed data in V3__seed_data.sql
8. Integration tests in `src/test/kotlin/ma/investpro/integration/`

See `CRUD_TEMPLATE.md` for detailed template.

## Deployment

**Railway:** Backend with PostgreSQL plugin, frontend with `serve -s` for SPA routing.

Backend env vars: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`
Frontend env var: `VITE_API_URL`

**CI/CD (GitHub Actions):**
- `ci-backend.yml` - Java 21, Gradle, Testcontainers (on PR to backend/)
- `ci-frontend.yml` - Node 20, `npm ci` -> lint -> build (on PR to frontend/)
- `deploy-railway.yml` - Auto-deploy on push to main

## Pre-Commit Checklist

```bash
# Backend
cd backend && ./gradlew compileKotlin && ./gradlew test

# Frontend
cd frontend && npm run lint && npm run build
```
