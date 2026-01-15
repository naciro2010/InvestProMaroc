# Testcontainers Integration Tests

Ce projet utilise **Testcontainers** pour exécuter les tests d'intégration avec une base de données PostgreSQL réelle.

## 🎯 Qu'est-ce que Testcontainers ?

Testcontainers est une librairie Java qui fournit des **instances Docker jetables** (ephemeral) pour les tests.

**Avantages:**
- ✅ Tests avec une vraie base de données (pas d'H2 ou de mocks)
- ✅ Fonctionne partout: local, CI/CD, Docker, Kubernetes
- ✅ Pas de configuration manuelle requise
- ✅ Containers réutilisés entre les tests (plus rapide)
- ✅ Auto-nettoyage après les tests

## 🚀 Running Tests Locally

### Option 1: Docker Desktop (Recommandé)

```bash
# 1. Make sure Docker Desktop is running
docker ps

# 2. Run tests from backend directory
cd backend
./gradlew clean build

# Tests will:
# - Automatically start a PostgreSQL 16 container
# - Run Flyway migrations
# - Execute all integration tests
# - Clean up the container after
```

### Option 2: Docker Daemon (Linux)

```bash
# Make sure Docker daemon is running
sudo systemctl start docker

# Then run tests normally
cd backend
./gradlew test
```

## ✅ Running Tests Without Docker

If Docker is not available, integration tests are simply skipped:

```bash
./gradlew test # Only unit tests run
./gradlew build -x test # Skip all tests
```

## 🔧 CI/CD Pipeline Setup

### GitHub Actions

Add this to `.github/workflows/test.yml`:

```yaml
name: Backend Tests
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'corretto'
      - name: Run tests
        working-directory: ./backend
        run: ./gradlew clean build
```

**Why it works:**
- GitHub Actions runners have Docker pre-installed ✅
- Testcontainers automatically uses Docker daemon ✅
- No additional configuration needed ✅

### GitLab CI

Add this to `.gitlab-ci.yml`:

```yaml
backend:test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  services:
    - docker:dind  # Docker-in-Docker service
  variables:
    DOCKER_HOST: tcp://docker:2375
    TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: /var/run/docker.sock
  script:
    - cd backend
    - ./gradlew clean build
```

**Key points:**
- `docker:dind` service provides Docker inside the container
- `DOCKER_HOST` environment variable points to the docker service
- `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` tells Testcontainers where Docker is

### Other CI Systems

For other CI systems (Jenkins, CircleCI, etc.), ensure:

1. **Docker is available**
   - Docker daemon must be running and accessible
   - Or use Docker-in-Docker pattern

2. **Set environment variable if needed**
   ```bash
   export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
   ```

3. **Run tests normally**
   ```bash
   ./gradlew test
   ```

## 📊 Test Structure

### Test Classes

- `PostgresIntegrationTest` - Base class for all integration tests
  - Automatically starts PostgreSQL container
  - Configures Spring Data and Flyway
  - Applies database migrations

- `AvenantConventionIntegrationTest` - Tests for convention amendments
  - Full workflow tests (BROUILLON → SOUMIS → VALIDE)
  - Statistical queries
  - Budget calculations

- Other integration tests extend `PostgresIntegrationTest`

### How Tests Work

```
Test execution flow:
1. PostgresIntegrationTest companion object initializes
2. @SpringBootTest starts Spring ApplicationContext
3. DynamicPropertySource injects Testcontainers connection info
4. Spring creates datasource pointing to container
5. Flyway runs migrations (V1-V12)
6. Test methods execute with real database
7. Container is stopped and removed after all tests
```

## 🐛 Troubleshooting

### "Cannot connect to Docker daemon"

**Problem:** Docker is not running or not accessible

**Solutions:**
```bash
# On macOS
open -a Docker  # Start Docker Desktop

# On Linux
sudo systemctl start docker

# Or check if Docker is accessible
docker ps

# If using remote Docker
export DOCKER_HOST=tcp://remote-host:2375
```

### "Testcontainers could not find a valid Docker installation"

**Problem:** Docker path is not found by Testcontainers

**Solution:** Set explicit Docker socket path
```bash
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
./gradlew test
```

### Tests are slow

**Optimization:** Testcontainers can reuse containers
```bash
# Enable container reuse (helpful for repeated test runs)
export TESTCONTAINERS_REUSE_CONTAINERS=true
./gradlew test
```

## 📝 Integration Test Example

```kotlin
class AvenantConventionIntegrationTest : PostgresIntegrationTest() {
    
    @Autowired
    private lateinit var conventionRepository: ConventionRepository
    
    @Test
    fun `should create avenant in BROUILLON status`() {
        // Arrange: Setup test data
        val convention = conventionRepository.save(...)
        
        // Act: Perform operation
        val avenant = restTemplate.postForEntity(
            "/api/avenants-conventions",
            request,
            String::class.java
        )
        
        // Assert: Verify result
        avenant.statusCode shouldBe HttpStatus.CREATED
        
        // All database queries hit real PostgreSQL via Testcontainers!
    }
}
```

## 🔗 Resources

- **Testcontainers Documentation:** https://testcontainers.com/
- **Testcontainers PostgreSQL Module:** https://testcontainers.com/modules/postgresql/
- **Spring Boot + Testcontainers:** https://spring.io/blog/2023/06/23/improved-testcontainers-support-in-spring-boot-3-1

## ✨ Best Practices

1. **Extend PostgresIntegrationTest** for all tests requiring a real database
2. **Use real database** for integration tests (not mocks)
3. **Test Flyway migrations** automatically via DynamicPropertySource
4. **Don't hardcode** database credentials - they're injected
5. **Keep tests isolated** - each test class gets its own container
6. **Use transactions** - `@Transactional` rolls back test data

## Summary

| Scenario | What Happens |
|----------|--------------|
| Local dev with Docker | ✅ Tests run with Testcontainers |
| Local dev without Docker | ⚠️ Integration tests skipped (unit tests only) |
| CI with Docker available | ✅ Tests run with Testcontainers |
| CI without Docker | ⚠️ Integration tests skipped |
| Production | ❌ Tests don't run (production builds skip tests) |

**Result:** Same test code works everywhere, but gracefully handles environments without Docker.
