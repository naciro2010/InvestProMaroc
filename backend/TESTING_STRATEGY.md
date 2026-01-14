# Testing Strategy

## FlywayMigrationIntegrationTest

### Approach: Pure Integration Test (No Spring Boot Context)

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

## Other Integration Tests

For tests that need full Spring Boot context (e.g., REST API endpoints, security):
- Use `@SpringBootTest` with `@AutoConfigureMockMvc`
- Use `@WithMockUser` for authenticated endpoints
- Keep those tests separate from migration tests

This ensures:
- Fast migration testing (no Spring Boot)
- Comprehensive API testing (with Spring Boot)
- Clear separation of concerns
