package ma.investpro.integration

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

/**
 * Base class for integration tests using real PostgreSQL via Testcontainers
 *
 * **Strategy:**
 * - Uses Testcontainers to spin up PostgreSQL container automatically
 * - Works in all environments: local development, CI (GitHub Actions, GitLab CI), etc.
 * - Docker must be available and running for tests to work
 * - No manual PostgreSQL setup required
 *
 * These integration tests require a real PostgreSQL database because they test:
 * - PostgreSQL-specific SQL (JSONB for amendments, analytical dimensions)
 * - Flyway migration execution
 * - Complex entity relationships and constraints
 *
 * **Running tests:**
 * ```bash
 * # Make sure Docker is running, then:
 * ./gradlew test
 * ```
 *
 * **CI/CD Pipeline Setup:**
 * GitHub Actions / GitLab CI automatically has Docker available.
 * Testcontainers will create and manage PostgreSQL containers automatically.
 * No additional service configuration needed.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
abstract class PostgresIntegrationTest {

    companion object {
        private val postgresContainer: PostgreSQLContainer<*> = PostgreSQLContainer(
            DockerImageName.parse("postgres:16-alpine")
        ).apply {
            withDatabaseName("investpro_test")
            withUsername("test")
            withPassword("test")
            withReuse(false)
        }

        init {
            postgresContainer.start()
        }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            // Configure Testcontainers PostgreSQL connection
            registry.add("spring.datasource.url") { postgresContainer.jdbcUrl }
            registry.add("spring.datasource.username") { postgresContainer.username }
            registry.add("spring.datasource.password") { postgresContainer.password }
            registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }

            // PostgreSQL configuration
            registry.add("spring.jpa.database-platform") { "org.hibernate.dialect.PostgreSQLDialect" }

            // Flyway configuration
            registry.add("spring.flyway.enabled") { "true" }
            registry.add("spring.flyway.baseline-on-migrate") { "true" }
            registry.add("spring.flyway.clean-disabled") { "true" }
            registry.add("spring.flyway.locations") { "classpath:db/migration" }

            // Hibernate configuration
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.jpa.show-sql") { "false" }
        }
    }
}

