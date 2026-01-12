package ma.investpro.integration

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

/**
 * Base class for integration tests using real PostgreSQL
 *
 * **Environment Detection:**
 * - CI environment (SPRING_PROFILES_ACTIVE=ci): Uses GitHub Actions PostgreSQL service
 * - Local development: Uses Testcontainers with Docker
 *
 * This ensures:
 * - Real PostgreSQL database (not H2 in-memory)
 * - Flyway migrations are executed
 * - Schema validation matches entity definitions
 * - Full Spring Boot context starts successfully
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test", "ci")
@Testcontainers(disabledWithoutDocker = true)
abstract class PostgresIntegrationTest {

    companion object {
        private val isCI = System.getenv("CI") == "true" ||
                          System.getProperty("spring.profiles.active")?.contains("ci") == true

        @Container
        @JvmStatic
        val postgresContainer: PostgreSQLContainer<Nothing>? = if (!isCI) {
            PostgreSQLContainer<Nothing>("postgres:16-alpine").apply {
                withDatabaseName("investpro_test")
                withUsername("test")
                withPassword("test")
                withReuse(false)
            }
        } else {
            null // Use GitHub Actions service in CI
        }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            if (!isCI && postgresContainer != null) {
                // Local development with Testcontainers
                registry.add("spring.datasource.url", postgresContainer::getJdbcUrl)
                registry.add("spring.datasource.username", postgresContainer::getUsername)
                registry.add("spring.datasource.password", postgresContainer::getPassword)
            }
            // In CI, use environment variables from application-ci.properties

            // Common configuration
            registry.add("spring.flyway.enabled") { "true" }
            registry.add("spring.flyway.baseline-on-migrate") { "true" }
            registry.add("spring.flyway.clean-disabled") { "false" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.jpa.show-sql") { "false" }
        }
    }
}
