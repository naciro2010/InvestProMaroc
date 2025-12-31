# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InvestPro Maroc** is a Spring Boot REST API backend for managing investment expenses and commission calculations. It's a modern Kotlin/Spring Boot 3.3.5 application with PostgreSQL, JWT authentication, and comprehensive REST endpoints.

**Tech Stack:** Kotlin 2.0.21, Spring Boot 3.3.5, PostgreSQL 16, Gradle 8.7, Java 21

## Common Commands

### Build & Compile
```bash
# Clean build (compiles Kotlin to bytecode, runs tests)
./gradlew clean build

# Production-ready JAR (without tests)
./gradlew clean bootJar
# Output: build/libs/investpro-backend-1.0.0.jar
```

### Testing
```bash
# Run all tests (unit + integration with Testcontainers)
./gradlew test

# Run only integration tests (requires Docker for Testcontainers)
./gradlew test --tests "ma.investpro.integration.*"

# Run specific test class
./gradlew test --tests "ma.investpro.integration.AuthIntegrationTest"

# Run specific test method
./gradlew test --tests "ma.investpro.integration.AuthIntegrationTest.testLogin"

# Skip tests (faster builds)
./gradlew build -x test

# Generate code coverage report (Jacoco)
./gradlew test jacocoTestReport
# Report location: build/reports/jacoco/test/html/index.html
```

### Testing Notes
- Tests use **Kotest** framework with JUnit5
- Integration tests use **Testcontainers** with real PostgreSQL (requires Docker)
- Use `mockk` for mocking (MockK is more Kotlin-idiomatic than Mockito)
- `springmockk` integrates MockK with Spring Boot test context

### Run Application
```bash
# Development mode (requires PostgreSQL running)
./gradlew bootRun

# Run built JAR
java -jar build/libs/investpro-backend-1.0.0.jar

# With specific profile (prod uses environment variables)
java -jar build/libs/investpro-backend-1.0.0.jar --spring.profiles.active=prod
```

### Database Setup
```bash
# Start PostgreSQL 16 in Docker
docker run --name investpro-postgres \
  -e POSTGRES_DB=investpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine

# Stop PostgreSQL
docker stop investpro-postgres && docker rm investpro-postgres
```

Database migrations run automatically via Flyway on startup.

### Local Development
```bash
# Start both app and database
docker-compose up -d

# View logs
./gradlew bootRun

# API available at: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# Health check: http://localhost:8080/actuator/health
```

## High-Level Architecture

### Layered Architecture
```
REST Controllers (ma/investpro/controller/)
    ↓ (request/response)
Services (ma/investpro/service/)
    ↓ (business logic)
Repositories (ma/investpro/repository/)
    ↓ (data access)
JPA Entities (ma/investpro/entity/)
    ↓
PostgreSQL Database
```

### Request Flow
1. **JwtAuthenticationFilter** validates JWT token from request header
2. **SecurityFilterChain** checks authorization (roles/permissions)
3. **@PreAuthorize** annotations enforce method-level security
4. **Controller** validates input and delegates to **Service**
5. **Service** (extends GenericCrudService) handles business logic
6. **Repository** performs database operations via Spring Data JPA
7. **ApiResponse<T>** wrapper sends consistent responses to client

### Key Architectural Patterns

| Pattern | Purpose | Location |
|---------|---------|----------|
| **Generic CRUD Service** | Base service for all business entities - reduces boilerplate | `service/GenericCrudService.kt` |
| **DTO Pattern** | Decouples API responses from JPA entities | `dto/` folder |
| **Service Layer** | All business logic centralized here | `service/` folder |
| **Repository Pattern** | Data access abstraction via Spring Data JPA | `repository/` folder |
| **JWT Authentication** | Stateless token-based auth with refresh tokens | `security/JwtService.kt`, `JwtAuthenticationFilter.kt` |
| **Base Entity** | Shared audit fields (id, created_at, updated_at) | `entity/BaseEntity.kt` |

### Security Architecture
- **Stateless sessions** via JWT tokens (no server-side session storage)
- **Role-based access control** with ADMIN/MANAGER/USER roles
- **CORS** configured per environment (dev allows localhost, prod uses Railway/GitHub Pages)
- **Password hashing** with BCrypt
- **Method-level security** via `@PreAuthorize` annotations
- **Public endpoints**: `/auth/**`, `/swagger-ui/**`, `/api-docs`
- **Protected endpoints**: All business entity endpoints require authentication

## Database Schema

Core entities with relationships:

### Main Business Entities
| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **Convention** | Commission calculation & partnership rules | code, designation, tauxCommission, montantMinimal, status |
| **ConventionPartenaire** | Sub-conventions for partners | convention_id, partenaire_id, tauxCommission |
| **Partenaire** | Partner entities managing projects | code, designation, roles |
| **Marche** | Procurement/supply contracts | code, designation, montant, dateMarche, fournisseur_id |
| **MarcheLigne** | Contract line items | marche_id, designation, montant, quantite |
| **Avenant** | Contract amendments | code, marche_id, montant, dateAvenant |
| **AvenantMarche** | Avenant to market association | avenant_id, marche_id |
| **DepenseInvestissement** | Investment expenses | montant, dateDepense, projet_id, fournisseur_id |
| **Commission** | Calculated commissions | montant, dateCalcul, convention_id, depense_id |
| **Fournisseur** | Suppliers with Moroccan tax IDs | code, ice (15-digit), if (numeric) |

### Financial & Accounting
| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **Decompte** | Billing statements | code, montant, dateDecompte, marche_id |
| **OrdrePaiement** | Payment orders | code, montant, dateOrdre, decompte_id |
| **Paiement** | Payment records | montant, datePaiement, ordrepaiement_id |
| **Budget** | Budget allocations | code, designation, montant |
| **CompteBancaire** | Bank accounts with RIB | rib (unique), designation, solde |

### Analytical/Cost Center System
| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **DimensionAnalytique** | Cost center hierarchies | code, designation, type |
| **ValeurDimension** | Cost center values | dimensionanalytique_id, code, designation |
| **ImputationAnalytique** | Cost allocations | marche_id, dimensionanalytique_id, valeur, pourcentage |
| **Subvention** | Subsidies & grants | code, designation, montant, status |

All entities inherit from `BaseEntity` with `id`, `createdAt`, `updatedAt` audit fields.

Database constraints:
- Unique constraints on CODE fields
- Check constraints on percentages (0-100%) and numeric validation
- Foreign key relationships with appropriate cascading
- RIB format validation (Moroccan bank account standard)

## Code Organization

```
src/main/kotlin/ma/investpro/
├── InvestProApplication.kt          # Main entry point
├── config/                           # Spring configuration
│   ├── SecurityConfig.kt            # JWT, CORS, security rules
│   ├── OpenApiConfig.kt             # Swagger/OpenAPI setup
│   └── RequestLoggingFilter.kt      # HTTP request/response logging
├── controller/                       # REST endpoints
│   ├── AuthController.kt            # Authentication & JWT
│   ├── ConventionController.kt      # Convention management
│   ├── MarcheController.kt          # Procurement contracts
│   ├── AvenantController.kt         # Contract amendments
│   ├── DecompteController.kt        # Billing statements
│   ├── DimensionAnalytiqueController.kt  # Cost centers
│   ├── ImputationAnalytiqueController.kt # Cost allocations
│   ├── ExcelExportController.kt     # Excel export endpoints
│   └── ReportingController.kt       # Reporting & analytics
├── service/                          # Business logic
│   ├── GenericCrudService.kt        # Base CRUD operations (all services extend this)
│   ├── AuthService.kt               # Authentication logic
│   ├── ConventionService.kt         # Convention calculations
│   ├── MarcheService.kt             # Marche (market) operations
│   ├── AvenantService.kt            # Amendment operations
│   ├── DecompteService.kt           # Billing operations
│   ├── DimensionAnalytiqueService.kt # Cost center management
│   ├── ImputationAnalytiqueService.kt # Cost allocation logic
│   ├── ExcelExportService.kt        # Excel generation (Apache POI)
│   ├── ReportingService.kt          # Business reporting & stats
│   └── UserDetailsServiceImpl.kt     # Spring Security integration
├── repository/                       # Spring Data JPA interfaces
│   ├── UserRepository.kt
│   ├── ConventionRepository.kt
│   ├── MarcheRepository.kt
│   ├── DimensionAnalytiqueRepository.kt
│   └── [Other entity repositories...]
├── entity/                           # JPA entities
│   ├── BaseEntity.kt                # Abstract base with audit fields
│   ├── User.kt
│   ├── Convention.kt, ConventionPartenaire.kt
│   ├── Marche.kt, MarcheLigne.kt, Avenant.kt
│   ├── Decompte.kt, OrdrePaiement.kt, Paiement.kt
│   ├── DimensionAnalytique.kt, ValeurDimension.kt, ImputationAnalytique.kt
│   └── [Other business entities...]
├── dto/                              # Data Transfer Objects
│   ├── AuthDTOs.kt                  # Auth request/response DTOs
│   ├── BusinessDTOs.kt              # Business entity DTOs
│   └── ReportingDTOs.kt             # Report response DTOs
├── security/                         # JWT & authentication
│   ├── JwtService.kt                # Token generation & validation
│   └── JwtAuthenticationFilter.kt    # JWT extraction from requests
└── util/                             # Utilities (if present)
    └── ApiResponse.kt               # Consistent response wrapper

src/main/resources/
├── application.properties            # Dev configuration (PostgreSQL local)
├── application-prod.properties       # Prod configuration (env vars)
└── db/migration/                     # Flyway SQL migrations (V1-V23+)

src/test/kotlin/ma/investpro/
└── integration/                      # Integration tests (use Testcontainers)
    ├── BaseIntegrationTest.kt       # Base class with database setup
    ├── AuthIntegrationTest.kt
    └── [Other integration tests...]
```

Key architectural files:
- **GenericCrudService.kt** - Base class reducing boilerplate (all entity services extend this)
- **JwtService.kt** - Token generation, validation, claims extraction
- **ExcelExportService.kt** - Uses Apache POI for Excel generation
- **SecurityConfig.kt** - Defines security filter chain, CORS, and method-level security

## Working with Database Migrations

Migrations are managed by Flyway and located in `src/main/resources/db/migration/`:

- `V1__init_schema.sql` - Initial database schema
- `V2__seed_data.sql` - Sample/demo data

To add a new migration:
1. Create file: `V{n}__description.sql` in `db/migration/`
2. Follow naming: `V` + version number + `__` + underscore_description
3. Migrations run automatically on startup in order

## Adding New Business Entities

When adding a new CRUD entity:
1. Create **Entity** in `entity/` extending `BaseEntity`
2. Create **Repository** in `repository/` extending Spring Data JPA interface
3. Create **DTO** in `dto/` for API responses
4. Create **Service** in `service/` extending `GenericCrudService<Entity, Long>`
5. Create **Controller** in `controller/` using `@RestController` with standard endpoints
6. Add database migration in `db/migration/`
7. Add integration tests in `src/test/kotlin/ma/investpro/integration/`

See `CRUD_TEMPLATE.md` (in root) for detailed template.

## Key Files to Know

| File | Purpose |
|------|---------|
| `build.gradle.kts` | Gradle configuration - dependencies, plugins, Kotlin settings |
| `SecurityConfig.kt` | JWT token validation, CORS rules, security filter chain |
| `JwtService.kt` | Token generation, validation, expiration logic |
| `GenericCrudService.kt` | Base CRUD logic reused by all entity services |
| `BaseIntegrationTest.kt` | Base class for integration tests with database setup |
| `application.properties` | Dev database URL, JWT secret (dev-only), logging |
| `application-prod.properties` | Prod settings - uses environment variables for secrets |

## API Response Format

All endpoints return a consistent response structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}
```

Error responses follow the same structure with `success: false` and appropriate HTTP status codes.

## Environment Variables

For production/deployed instances, set these environment variables:

```bash
DATABASE_URL              # PostgreSQL connection string
JWT_SECRET                # Base64-encoded secret for JWT signing
JWT_EXPIRATION_MS         # Token expiration (default: 86400000 = 24h)
JWT_REFRESH_EXPIRATION_MS # Refresh token expiration (default: 604800000 = 7d)
CORS_ALLOWED_ORIGINS      # Comma-separated list of allowed origins
PORT                      # Server port (default: 8080)
SPRING_PROFILES_ACTIVE    # Set to 'prod' for production
```

See `.env.example` for template.

## Recent Updates & Architecture Notes

- **Spring Boot 3.3.5:** Latest stable version with native compilation support via GraalVM
- **Kotlin 2.0.21:** Latest Kotlin with improved performance and null safety
- **Java → Kotlin Migration:** Project completed migration from Java/Maven to Kotlin/Gradle, reducing boilerplate by ~40%
- **Gradle Build:** Uses Kotlin DSL (`build.gradle.kts`) instead of Groovy for type-safe configuration
- **Docker:** Multi-stage build for optimized image size (see Dockerfile)
- **Testing:** Integration tests use Testcontainers with real PostgreSQL instances and Kotest framework
- **Analytics System:** Integrated analytical/cost center system (Dimension, ValeurDimension, ImputationAnalytique) for financial tracking
- **Reporting:** Advanced reporting capabilities with Excel export via Apache POI

## Specialized Services & Features

### ExcelExportService
Generates Excel reports with formatting:
- Uses Apache POI (`poi-ooxml`) for .xlsx generation
- Used by `/api/v1/exports/*` endpoints
- Supports styled headers, merged cells, data formatting

### ReportingService
Provides business analytics:
- Convention statistics and KPIs
- Marche aggregations and summaries
- Commission tracking and reporting
- Cost allocation analysis via analytical dimensions

### DimensionAnalytiqueService
Manages cost center hierarchies:
- Create/update/delete analytical dimensions
- Link to procurement contracts via ImputationAnalytique
- Support percentage-based cost allocation
- Multi-level hierarchy support

### Authentication Flow
1. User logs in via `POST /api/auth/login` with email/password
2. AuthService validates credentials and returns JWT token
3. JwtService generates token with claims (userId, roles, email)
4. Token stored on client and sent in `Authorization: Bearer <token>` header
5. JwtAuthenticationFilter extracts and validates token on each request
6. SecurityFilterChain enforces role-based access control via `@PreAuthorize`

## Important Notes for Development

1. **Kotlin Null Safety:** All code uses Kotlin's type system - `Type?` means nullable, `Type` means non-null
2. **Data Validation:** Jakarta Validation (`@Valid`, `@NotBlank`, etc.) validates inputs automatically
3. **Transactions:** Business logic methods use `@Transactional` for consistency
4. **Logging:** Uses `kotlin-logging` with SLF4J backend - use `logger.info()`, `logger.error()`, etc.
5. **Testing:** Integration tests require Docker running (Testcontainers spins up PostgreSQL)
6. **French Naming:** Domain concepts use French names (Convention, Projet, Fournisseur, etc.) following business domain
7. **Security:** Never hardcode JWT_SECRET in production - use environment variables
