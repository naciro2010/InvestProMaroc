package ma.investpro.integration

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

/**
 * Base class for integration tests using real PostgreSQL
 *
 * **Environment Detection:**
 * - CI environment (CI=true): Uses GitHub Actions PostgreSQL service
 * - Local development with Docker: Uses Testcontainers
 * - Local development without Docker: Falls back to local PostgreSQL (requires manual setup)
 *
 * These integration tests require a real PostgreSQL database because they test:
 * - PostgreSQL-specific SQL (JSONB for amendments, analytical dimensions)
 * - Flyway migration execution
 * - Complex entity relationships and constraints
 *
 * **To run tests locally without Docker:**
 * ```bash
 * # Start PostgreSQL
 * docker-compose up -d postgres
 *
 * # Or manually:
 * docker run --name investpro-postgres \
 *   -e POSTGRES_DB=investpro_test \
 *   -e POSTGRES_USER=test \
 *   -e POSTGRES_PASSWORD=test \
 *   -p 5432:5432 \
 *   postgres:16-alpine
 * ```
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
abstract class PostgresIntegrationTest {

    companion object {
        private val isCI = System.getenv("CI") == "true"
        private var isDockerAvailable = checkDockerAvailability()

        private fun checkDockerAvailability(): Boolean {
            return try {
                val process = Runtime.getRuntime().exec("docker ps")
                process.waitFor() == 0
            } catch (e: Exception) {
                false
            }
        }

        private val postgresContainer: PostgreSQLContainer<*>? by lazy {
            if (!isCI && isDockerAvailable) {
                try {
                    PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine")).apply {
                        withDatabaseName("investpro_test")
                        withUsername("test")
                        withPassword("test")
                        withReuse(false)
                        start()
                    }
                } catch (e: Exception) {
                    println("Warning: Failed to start PostgreSQL container, falling back to H2")
                    isDockerAvailable = false
                    null
                }
            } else {
                null
            }
        }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            // Configure database based on environment
            when {
                !isCI && isDockerAvailable && postgresContainer != null -> {
                    // Local development with Testcontainers
                    postgresContainer?.let { container ->
                        registry.add("spring.datasource.url") { container.jdbcUrl }
                        registry.add("spring.datasource.username") { container.username }
                        registry.add("spring.datasource.password") { container.password }
                        registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
                    }
                }
                isCI -> {
                    // CI environment - use GitHub Actions PostgreSQL service
                    registry.add("spring.datasource.url") { System.getenv("SPRING_DATASOURCE_URL") ?: "jdbc:postgresql://localhost:5432/investpro_test" }
                    registry.add("spring.datasource.username") { System.getenv("SPRING_DATASOURCE_USERNAME") ?: "test" }
                    registry.add("spring.datasource.password") { System.getenv("SPRING_DATASOURCE_PASSWORD") ?: "test" }
                    registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
                }
                else -> {
                    // Local development without Docker - assume PostgreSQL is running locally
                    registry.add("spring.datasource.url") { "jdbc:postgresql://localhost:5432/investpro_test" }
                    registry.add("spring.datasource.username") { "test" }
                    registry.add("spring.datasource.password") { "test" }
                    registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
                }
            }

            // Common PostgreSQL configuration
            registry.add("spring.jpa.database-platform") { "org.hibernate.dialect.PostgreSQLDialect" }
            registry.add("spring.flyway.enabled") { "true" }
            registry.add("spring.flyway.baseline-on-migrate") { "true" }
            registry.add("spring.flyway.clean-disabled") { "true" }
            registry.add("spring.flyway.locations") { "classpath:db/migration" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.jpa.show-sql") { "false" }
        }
    }
}

