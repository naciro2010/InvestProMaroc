# Development Guidelines & Quality Standards

This document outlines the mandatory development standards and testing procedures for the InvestPro Maroc project.

## 🎯 Core Principles

### 1. Use ONLY Validated, Production-Ready Technologies

**NEVER:**
- ❌ Use workarounds or hacks
- ❌ Use experimental or unstable packages
- ❌ Implement quick fixes that compromise quality
- ❌ Copy-paste code without understanding
- ❌ Use deprecated packages or methods

**ALWAYS:**
- ✅ Use proper, documented solutions from official sources
- ✅ Check package maintenance status (recent commits, active support)
- ✅ Verify good documentation exists
- ✅ Check download stats and community adoption
- ✅ Scan for known security vulnerabilities
- ✅ Prefer official plugins and extensions

### 2. Follow Existing Architecture Patterns

**Backend:**
- `GenericCrudService<Entity, Long>` for all services
- `BaseEntity` for all entities (id, createdAt, updatedAt, actif)
- DTO pattern for API responses
- `@PreAuthorize` for security
- Flyway migrations for database changes

**Frontend:**
- React Context API for global state
- Axios interceptors for API calls
- Material-UI + Tailwind CSS
- French number formatting (1 000 000,00)
- TypeScript strict mode

### 3. Code Quality Checklist

Before committing, verify:

- [ ] No TypeScript/Kotlin compiler errors
- [ ] No linting warnings (ESLint/Detekt)
- [ ] Proper error handling implemented
- [ ] No hardcoded values (use environment variables)
- [ ] No `console.log` / `println` left in production code
- [ ] Code follows existing naming conventions
- [ ] Changes are tested (see testing section below)
- [ ] No security vulnerabilities (OWASP Top 10)

## 🧪 Testing Requirements

### Backend Testing

**Before committing backend changes, run:**

```bash
cd backend

# 1. Compile check (fast)
./gradlew compileKotlin

# 2. Build without tests (faster, for quick validation)
./gradlew build -x test

# 3. Run tests (required before final commit)
./gradlew test

# 4. Check test coverage
./gradlew test jacocoTestReport
# Report: build/reports/jacoco/test/html/index.html
```

**When to run tests:**
- ✅ Always before committing entity/service/controller changes
- ✅ After database migrations (V{n})
- ✅ After modifying security configuration
- ✅ After workflow changes
- ⚠️  Can skip for documentation-only changes

**Test structure:**
```kotlin
// Use Kotest with JUnit5
class MyServiceTest : BaseIntegrationTest() {
    @Test
    fun `should create entity successfully`() {
        // Arrange
        val entity = MyEntity(...)

        // Act
        val result = service.create(entity)

        // Assert
        result shouldNotBe null
        result.id shouldNotBe null
    }
}
```

### Frontend Testing

**Before committing frontend changes, run:**

```bash
cd frontend

# 1. Type check
npm run build

# 2. Lint check
npm run lint

# 3. Install dependencies (if package.json changed)
npm install

# 4. Update lock file for CI/CD
# IMPORTANT: After adding/removing dependencies, run npm install
# This keeps package-lock.json in sync with package.json
# Otherwise, npm ci will fail in CI/CD pipelines
```

**Package management rules:**
- ✅ Run `npm install` after modifying `package.json` dependencies
- ✅ Commit `package-lock.json` with `package.json` changes
- ✅ Use `npm ci` in CI/CD (requires synced lock file)
- ❌ Never commit `node_modules/`
- ❌ Never manually edit `package-lock.json`

### Database Migration Testing

**After creating a Flyway migration (V{n}):**

```bash
cd backend

# 1. Test on clean database
./gradlew flywayClean flywayMigrate

# 2. Verify migration applied
./gradlew flywayInfo

# 3. Validate schema
./gradlew flywayValidate

# 4. Run application tests
./gradlew test

# 5. Check for migration errors
./gradlew bootRun
# Application should start without Flyway errors
```

**Migration best practices:**
- ✅ Use `CREATE TABLE IF NOT EXISTS`
- ✅ Add `CHECK` constraints for validation
- ✅ Add indexes for foreign keys
- ✅ Add `COMMENT ON TABLE/COLUMN` for documentation
- ✅ Test on clean database before committing
- ❌ Never modify existing migrations after deployment
- ❌ Never use `clean-on-validation-error=true` in production

## 📋 Commit Message Standards

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```
feat(backend): Add rejection workflow for conventions

- Add REJETE status to StatutConvention enum
- Add motifRejet field to Convention entity
- Create migration V11 for new fields
- Update service with remettreEnBrouillon() method

Resolves: #123
```

```
fix(frontend): Update package-lock.json with serve dependency

- Add serve@14.2.5 to lock file
- Fixes npm ci error in CI/CD

Resolves: Missing serve dependencies
```

## 🔐 Security Standards

### Authentication & Authorization

- ✅ Use JWT with refresh tokens
- ✅ Store tokens in `localStorage` (frontend)
- ✅ Capture `createdById` from `SecurityContext` (backend)
- ✅ Use `@PreAuthorize` for endpoint security
- ✅ Validate all user inputs
- ❌ Never store passwords in plain text
- ❌ Never commit JWT secrets to repository

### CORS Configuration

```kotlin
// backend: SecurityConfig.kt
cors {
    allowedOrigins = listOf(
        "http://localhost:5173",  // Development
        "https://your-app.railway.app"  // Production
    )
    allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
    allowCredentials = true
}
```

## 🚀 Deployment Checklist

### Before Deploying to Railway:

**Backend:**
- [ ] All tests pass: `./gradlew test`
- [ ] No compiler errors: `./gradlew build`
- [ ] Flyway migrations validated
- [ ] Environment variables configured in Railway dashboard
- [ ] CORS includes production frontend URL

**Frontend:**
- [ ] TypeScript compiles: `npm run build`
- [ ] No lint errors: `npm run lint`
- [ ] `package-lock.json` is up to date
- [ ] `VITE_API_URL` set to production backend
- [ ] Railway.json configured correctly

### Railway Configuration:

**Frontend:**
```json
{
  "build": {
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"  // serve -s dist -l 3000
  }
}
```

**Backend:**
- Add PostgreSQL plugin in Railway
- Set environment variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- Set `JWT_SECRET` (base64-encoded, 256-bit minimum)
- Set `CORS_ALLOWED_ORIGINS` with frontend URL

## 📊 Code Review Checklist

Before approving a PR, verify:

### Backend:
- [ ] Tests pass and coverage is adequate
- [ ] Entity has proper validation annotations
- [ ] Service extends `GenericCrudService` if applicable
- [ ] DTO matches entity fields
- [ ] Mapper handles all fields correctly
- [ ] Controller uses `@PreAuthorize` appropriately
- [ ] Migration follows naming convention V{n}__description.sql
- [ ] No hardcoded values or secrets

### Frontend:
- [ ] TypeScript strict mode enabled
- [ ] No `any` types without justification
- [ ] Components properly typed
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] French number formatting used for monetary values
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] No `console.log` statements

### General:
- [ ] Commit messages follow conventional commits
- [ ] Documentation updated (CLAUDE.md, README.md)
- [ ] No merge conflicts
- [ ] Branch is up to date with main/develop

## 🐛 Troubleshooting Common Issues

### npm ci fails with "packages out of sync"

**Problem:** `package.json` and `package-lock.json` are not synchronized

**Solution:**
```bash
cd frontend
npm install
git add package-lock.json
git commit -m "fix: Update package-lock.json"
```

### Flyway migration fails

**Problem:** Migration checksum mismatch or failed migration

**Solution:**
```bash
# Check Flyway status
./gradlew flywayInfo

# Repair Flyway metadata (use with caution)
./gradlew flywayRepair

# For development: baseline and retry
./gradlew flywayBaseline
./gradlew flywayMigrate
```

### Backend 403 Forbidden on POST

**Problem:** User authentication not captured properly

**Solution:**
```kotlin
// In Controller
val authentication = SecurityContextHolder.getContext().authentication
val userDetails = authentication.principal as? JwtUserDetails
entity.createdById = userDetails?.id
```

### Frontend 404 on page refresh

**Problem:** SPA routing not configured on server

**Solution:**
- Use `serve -s dist` (single-page mode)
- Ensure `railway.json` has: `"startCommand": "npm start"`
- Verify `package.json` has: `"start": "serve -s dist -l 3000"`

## 📚 Reference Documentation

- **Project Overview:** [README.md](README.md)
- **Claude AI Instructions:** [CLAUDE.md](CLAUDE.md)
- **Feature Backlog:** [BACKLOG.md](BACKLOG.md)
- **CRUD Template:** [CRUD_TEMPLATE.md](CRUD_TEMPLATE.md)
- **Railway Deployment:** [frontend/RAILWAY_DEPLOYMENT.md](frontend/RAILWAY_DEPLOYMENT.md)

## 🎓 Learning Resources

### Kotlin/Spring Boot
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Kotlin Docs](https://kotlinlang.org/docs/home.html)
- [Spring Security](https://spring.io/projects/spring-security)

### React/TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI](https://mui.com/)
- [Vite](https://vite.dev/)

### Database
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)

---

**Last Updated:** January 2026
**Maintained By:** Development Team
