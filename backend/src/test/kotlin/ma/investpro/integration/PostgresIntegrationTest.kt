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
 * - CI environment (CI=true): Uses GitHub Actions PostgreSQL service with "ci" profile
 * - Local development: Uses Testcontainers with Docker with "test" profile
 *
 * This ensures:
 * - Real PostgreSQL database (not H2 in-memory)
 * - Flyway migrations are executed
 * - Schema validation matches entity definitions
 * - Full Spring Boot context starts successfully
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")  // Use only "test" profile - environment-specific config via DynamicPropertySource
abstract class PostgresIntegrationTest {

    companion object {
        private val isCI = System.getenv("CI") == "true"

        private val postgresContainer: PostgreSQLContainer<*>? by lazy {
            if (!isCI) {
                PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine")).apply {
                    withDatabaseName("investpro_test")
                    withUsername("test")
                    withPassword("test")
                    withReuse(false)
                    start()
                }
            } else {
                null
            }
        }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            if (!isCI) {
                // Local development with Testcontainers
                postgresContainer?.let { container ->
                    registry.add("spring.datasource.url") { container.jdbcUrl }
                    registry.add("spring.datasource.username") { container.username }
                    registry.add("spring.datasource.password") { container.password }
                    registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
                }
            } else {
                // CI environment - use GitHub Actions PostgreSQL service
                registry.add("spring.datasource.url") { System.getenv("SPRING_DATASOURCE_URL") ?: "jdbc:postgresql://localhost:5432/investpro_test" }
                registry.add("spring.datasource.username") { System.getenv("SPRING_DATASOURCE_USERNAME") ?: "test" }
                registry.add("spring.datasource.password") { System.getenv("SPRING_DATASOURCE_PASSWORD") ?: "test" }
                registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
            }

            // Common configuration for all environments
            registry.add("spring.flyway.enabled") { "true" }
            registry.add("spring.flyway.baseline-on-migrate") { "true" }
            registry.add("spring.flyway.clean-disabled") { "false" }
            registry.add("spring.flyway.locations") { "classpath:db/migration" }
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.jpa.database-platform") { "org.hibernate.dialect.PostgreSQLDialect" }
            registry.add("spring.jpa.show-sql") { "false" }
        }
    }
}

