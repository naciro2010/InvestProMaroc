# Testing Strategy

## Overview

InvestPro Maroc uses two types of integration tests:

1. **Database Migration Tests** - Test Flyway migrations without Spring Boot context
2. **API Integration Tests** - Test REST endpoints with full Spring Boot context

## 1. Database Migration Tests

### FlywayMigrationIntegrationTest

#### Approach: Pure Integration Test (No Spring Boot Context)

This test uses a **clean, production-like approach** without Spring Boot context overhead:

```
Testcontainers PostgreSQL 16
        ↓
HikariCP DataSource (connection pool)
        ↓
Flyway.migrate() (V1 DROP, V2 CREATE, V3 SEED)
        ↓
JdbcTemplate (direct SQL queries)
        ↓
8 Tests verifying migrations
```

### Why This Approach?

**✅ Pros:**
- **No Spring Boot context** - Faster test startup (~5-10s vs 30-60s)
- **No security issues** - No need to disable/mock Spring Security
- **No bean conflicts** - No autowiring, no dependency injection issues
- **Pure migration testing** - Tests exactly what runs in production
- **Real PostgreSQL** - Not H2 in-memory database (different SQL dialect)
- **Production-like** - Uses same Flyway configuration as Railway deployment

**❌ What We Avoided:**
- Spring Boot context loading
- Spring Security configuration
- Autowired dependencies (@Autowired)
- TestRestTemplate / MockMvc
- H2 in-memory database workarounds
- @SpringBootTest overhead

### Test Structure

```kotlin
companion object {
    // Start Testcontainers PostgreSQL once for all tests
    @BeforeAll
    fun setup() {
        postgres.start()
        dataSource = HikariDataSource(config)
        jdbcTemplate = JdbcTemplate(dataSource)
        flyway.migrate()  // Execute V1, V2, V3
    }

    @AfterAll
    fun teardown() {
        postgres.stop()
    }
}

@Test
fun `should execute all Flyway migrations successfully`() {
    // Verify V1, V2, V3 migrations applied correctly
}

@Test
fun `should create all required tables`() {
    // Verify 8 key tables exist
}

@Test
fun `should have avenant_conventions table with all columns`() {
    // Verify all BaseEntity + AvenantConvention columns
}

@Test
fun `should have JSONB columns in avenant_conventions`() {
    // Verify donnees_avant and modifications are JSONB type
}

@Test
fun `should seed test data correctly`() {
    // Verify 3 users and 1 convention seeded
}

@Test
fun `should verify database connection`() {
    // Sanity check - connection works
}

@Test
fun `should have correct column types in avenant_conventions`() {
    // Deep verification of column types
}
```

### Dependencies Used

- **Testcontainers** (`org.testcontainers:postgresql:1.20.4`) - Real PostgreSQL 16 in Docker
- **HikariCP** (included with Spring Boot JDBC) - Connection pooling
- **Flyway Core** (`org.flywaydb:flyway-core`) - Database migrations
- **Spring JdbcTemplate** (`spring-jdbc`) - SQL query execution
- **Kotest** (`io.kotest:kotest-assertions-core:5.9.1`) - Assertions

### Running the Test

```bash
cd backend

# Run with Gradle
./gradlew test --tests "ma.investpro.integration.FlywayMigrationIntegrationTest"

# Or run all tests
./gradlew test
```

**Requirements:**
- Docker running (for Testcontainers PostgreSQL)
- Java 21+
- Gradle 8.7+

### CI/CD Integration

This test is designed to work in **GitHub Actions** and **Railway** CI/CD pipelines:

1. GitHub Actions installs Docker service automatically
2. Testcontainers pulls `postgres:16-alpine` image
3. Test runs migrations in isolated container
4. Container is destroyed after test completion

**No special configuration needed** - just standard `./gradlew test` command.

## 2. API Integration Tests

### PostgresIntegrationTest Base Class

#### Approach: Full Spring Boot Context with Real PostgreSQL

API integration tests (like `AvenantConventionIntegrationTest`) test REST endpoints with:
- Full Spring Boot application context
- Real PostgreSQL database (Testcontainers or CI service)
- JWT authentication
- Spring Security
- All application beans

```
@SpringBootTest(webEnvironment = RANDOM_PORT)
        ↓
Testcontainers PostgreSQL (local) or CI PostgreSQL service
        ↓
Flyway migrations executed
        ↓
Full application context loaded
        ↓
TestRestTemplate for HTTP requests
        ↓
JWT authentication + REST API tests
```

### Base Class Configuration

All API tests inherit from `PostgresIntegrationTest`:

```kotlin
@SpringBootTest(webEnvironment = RANDOM_PORT)
@ActiveProfiles("test")
abstract class PostgresIntegrationTest {

    companion object {
        private val isCI = System.getenv("CI") == "true"

        // Local: Testcontainers PostgreSQL
        // CI: GitHub Actions PostgreSQL service
        private val postgresContainer: PostgreSQLContainer<*>? by lazy {
            if (!isCI) {
                PostgreSQLContainer(...).apply { start() }
            } else null
        }

        @DynamicPropertySource
        fun configureProperties(registry: DynamicPropertyRegistry) {
            // Inject database URL, username, password
            // Enable Flyway, configure JPA
        }
    }
}
```

### Test Structure Example

```kotlin
class AvenantConventionIntegrationTest : PostgresIntegrationTest() {

    @Autowired
    private lateinit var restTemplate: TestRestTemplate

    @Autowired
    private lateinit var conventionRepository: ConventionRepository

    private lateinit var authToken: String

    @BeforeEach
    fun setup() {
        // 1. Create test user
        userRepository.save(User(...))

        // 2. Authenticate and get JWT token
        val loginResponse = restTemplate.postForEntity("/api/auth/login", ...)
        authToken = extractToken(loginResponse)

        // 3. Create test data
        testConvention = conventionRepository.save(Convention(...))
    }

    @Test
    fun `should create avenant via REST API`() {
        // Given: Request body
        val request = mapOf(
            "conventionId" to testConvention.id,
            "numeroAvenant" to "AVE-001"
        )

        // When: POST with JWT authentication
        val response = restTemplate.exchange(
            "/api/avenants-conventions",
            HttpMethod.POST,
            createHttpEntity(request),  // Adds Bearer token
            String::class.java
        )

        // Then: Verify response
        response.statusCode shouldBe HttpStatus.CREATED
    }

    private fun createHttpEntity(body: Any?): HttpEntity<Any> {
        val headers = HttpHeaders()
        headers.set("Authorization", "Bearer $authToken")
        return HttpEntity(body, headers)
    }
}
```

### Configuration Files

**application-test.properties:**
```properties
spring.application.name=InvestPro Backend Test

# JWT (required for authentication)
app.jwt.secret=test_secret_base64_encoded
app.jwt.expiration-ms=86400000

# Server (RANDOM_PORT set by @SpringBootTest)
server.port=0

# Logging
logging.level.root=WARN
logging.level.ma.investpro=INFO
```

**Database configuration is injected dynamically:**
- Local: Testcontainers PostgreSQL URL/credentials
- CI: GitHub Actions PostgreSQL service URL/credentials

### Environment Detection

```kotlin
private val isCI = System.getenv("CI") == "true"

if (!isCI) {
    // Local: Start Testcontainers
    postgresContainer?.start()
} else {
    // CI: Use environment variables
    System.getenv("SPRING_DATASOURCE_URL")
}
```

### Why This Approach is Clean

**✅ No Workarounds:**
- Uses real Spring Boot application context (production-like)
- Uses real PostgreSQL (not H2 mock)
- Uses real JWT authentication (not @WithMockUser)
- Uses real Flyway migrations (same as production)

**✅ Environment Flexibility:**
- Local: Testcontainers automatically managed
- CI: GitHub Actions PostgreSQL service
- No code changes needed between environments

**✅ Complete Coverage:**
- Tests REST endpoints
- Tests authentication/authorization
- Tests business logic
- Tests database interactions
- Tests Flyway migrations

### Running API Tests

```bash
cd backend

# Run single test class
./gradlew test --tests "ma.investpro.integration.AvenantConventionIntegrationTest"

# Run all integration tests
./gradlew test --tests "ma.investpro.integration.*"

# Local environment
# - Requires: Docker running (for Testcontainers)

# CI environment
# - Requires: PostgreSQL service configured in GitHub Actions
# - Set: CI=true environment variable
```

### CI/CD Configuration

**GitHub Actions workflow:**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: investpro_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

    steps:
      - name: Run tests
        env:
          CI: true
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/investpro_test
          SPRING_DATASOURCE_USERNAME: test
          SPRING_DATASOURCE_PASSWORD: test
        run: ./gradlew test
```

## Test Comparison

| Feature | FlywayMigrationIntegrationTest | AvenantConventionIntegrationTest |
|---------|-------------------------------|----------------------------------|
| Spring Boot | ❌ No | ✅ Yes (full context) |
| Database | ✅ Testcontainers PostgreSQL | ✅ Testcontainers or CI PostgreSQL |
| Speed | 🚀 5-10s | 🐢 30-60s (context load) |
| Tests | Flyway migrations | REST API endpoints |
| Authentication | ❌ No | ✅ JWT authentication |
| Purpose | Verify database schema | Verify API behavior |

## Summary

- **FlywayMigrationIntegrationTest**: Fast, focused tests for database migrations only
- **API Integration Tests**: Comprehensive tests for REST endpoints with full application context
- **Both approaches are clean** - No workarounds, no mocks, production-like testing
