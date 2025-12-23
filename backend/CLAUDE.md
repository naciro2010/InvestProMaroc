# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InvestPro Maroc** is a Spring Boot REST API backend for managing investment expenses and commission calculations. It's a modern Kotlin/Spring Boot 3.2.5 application with PostgreSQL, JWT authentication, and comprehensive REST endpoints.

**Tech Stack:** Kotlin 1.9.23, Spring Boot 3.2.5, PostgreSQL 16, Gradle 8.7, Java 21

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

# Generate code coverage report (Jacoco)
./gradlew test jacocoTestReport
# Report location: build/reports/jacoco/test/html/index.html
```

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

8 main entities with relationships:

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **User** | Authentication & authorization | email (unique), password (hashed), roles |
| **Convention** | Commission calculation rules | code, tauxCommission, montantMinimal |
| **Projet** | Investment projects | code, designation, montantInvesti |
| **Fournisseur** | Suppliers with Moroccan tax IDs | code, ice (15-digit), if (numeric) |
| **DepenseInvestissement** | Investment expenses | montant, dateDepense, projet_id, fournisseur_id |
| **Commission** | Calculated commissions | montant, dateCalcul, convention_id, depense_id |
| **CompteBancaire** | Bank accounts with RIB | rib (unique), designation, solde |
| **AxeAnalytique** | Cost center/analytical axes | code, designation, pourcentage |

All entities inherit from `BaseEntity` with `id`, `createdAt`, `updatedAt` audit fields.

Database constraints:
- Unique constraints on CODE fields (CONVENTION_CODE, PROJET_CODE, etc.)
- Check constraints on percentages (0-100) and dates (logical constraints)
- Foreign key relationships with appropriate cascading
- RIB format validation (Moroccan bank account standard)

## Code Organization

```
src/main/kotlin/ma/investpro/
├── InvestProApplication.kt          # Main entry point
├── config/                           # Spring configuration
│   ├── SecurityConfig.kt            # JWT, CORS, security rules
│   └── OpenApiConfig.kt             # Swagger/OpenAPI setup
├── controller/                       # REST endpoints
│   ├── AuthController.kt
│   ├── BusinessControllers.kt
│   ├── ExcelExportController.kt
│   └── ReportingController.kt
├── service/                          # Business logic
│   ├── GenericCrudService.kt        # Base CRUD operations
│   ├── AuthService.kt
│   ├── BusinessServices.kt
│   ├── ExcelExportService.kt        # Excel generation
│   └── ReportingService.kt
├── repository/                       # Data access
├── entity/                           # JPA entities
├── dto/                              # Data Transfer Objects
└── security/                         # JWT utilities
    ├── JwtService.kt
    └── JwtAuthenticationFilter.kt

src/main/resources/
├── application.properties            # Dev configuration
├── application-prod.properties       # Prod configuration
└── db/migration/                     # Flyway SQL migrations

src/test/kotlin/ma/investpro/
└── integration/
    ├── BaseIntegrationTest.kt       # Base for all integration tests
    ├── AuthIntegrationTest.kt
    └── DatabaseConnectionTest.kt
```

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

## Recent Changes & Migration Notes

- **Java → Kotlin Migration:** Project was recently migrated from Java/Maven to Kotlin/Gradle, reducing boilerplate by ~40%
- **Gradle Build:** Uses Kotlin DSL (`build.gradle.kts`) instead of Groovy
- **Docker:** Dockerfile uses multi-stage build (may need updating from Maven references)
- **Testing:** Integration tests use Testcontainers with real PostgreSQL instances

## Important Notes for Development

1. **Kotlin Null Safety:** All code uses Kotlin's type system - `Type?` means nullable, `Type` means non-null
2. **Data Validation:** Jakarta Validation (`@Valid`, `@NotBlank`, etc.) validates inputs automatically
3. **Transactions:** Business logic methods use `@Transactional` for consistency
4. **Logging:** Uses `kotlin-logging` with SLF4J backend - use `logger.info()`, `logger.error()`, etc.
5. **Testing:** Integration tests require Docker running (Testcontainers spins up PostgreSQL)
6. **French Naming:** Domain concepts use French names (Convention, Projet, Fournisseur, etc.) following business domain
7. **Security:** Never hardcode JWT_SECRET in production - use environment variables
