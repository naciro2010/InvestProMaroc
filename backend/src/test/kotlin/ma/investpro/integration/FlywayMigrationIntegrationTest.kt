package ma.investpro.integration

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import ma.investpro.config.TestSecurityConfig
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.ApplicationContext
import org.springframework.context.annotation.Import
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName
import javax.sql.DataSource

/**
 * Simple integration test with real PostgreSQL + Flyway migrations
 * Tests the 3-file migration strategy (V1: DROP, V2: CREATE, V3: SEED)
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestSecurityConfig::class)
class FlywayMigrationIntegrationTest {

    @Autowired
    private lateinit var dataSource: DataSource

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var applicationContext: ApplicationContext

    companion object {
        private val postgres = PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine")).apply {
            withDatabaseName("investpro_test")
            withUsername("test")
            withPassword("test")
        }

        @BeforeAll
        @JvmStatic
        fun setup() {
            postgres.start()
        }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { postgres.jdbcUrl }
            registry.add("spring.datasource.username") { postgres.username }
            registry.add("spring.datasource.password") { postgres.password }
            registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }

            // Enable Flyway for migrations
            registry.add("spring.flyway.enabled") { "true" }
            registry.add("spring.flyway.baseline-on-migrate") { "true" }
            registry.add("spring.flyway.clean-disabled") { "false" }

            // Validate schema matches JPA entities
            registry.add("spring.jpa.hibernate.ddl-auto") { "validate" }
            registry.add("spring.jpa.database-platform") { "org.hibernate.dialect.PostgreSQLDialect" }
        }
    }

    @Test
    fun `should execute all Flyway migrations successfully`() {
        // Given: Flyway is configured
        val flyway = Flyway.configure()
            .dataSource(dataSource)
            .load()

        // When: Check migration status
        val info = flyway.info()
        val appliedMigrations = info.applied()

        // Then: All 3 migrations should be applied
        appliedMigrations shouldNotBe null
        val versionedMigrations = appliedMigrations.filter { it.version != null }

        versionedMigrations.size shouldBe 3

        // Verify each migration
        versionedMigrations[0].version.version shouldBe "1"
        versionedMigrations[0].description shouldBe "drop all tables"

        versionedMigrations[1].version.version shouldBe "2"
        versionedMigrations[1].description shouldBe "create schema"

        versionedMigrations[2].version.version shouldBe "3"
        versionedMigrations[2].description shouldBe "seed data"
    }

    @Test
    fun `should create all required tables`() {
        // Verify key tables exist
        val tables = listOf(
            "users",
            "conventions",
            "avenant_conventions",
            "projets",
            "marches",
            "fournisseurs",
            "decomptes",
            "paiements"
        )

        tables.forEach { tableName ->
            val count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
                Long::class.java,
                tableName
            )
            count shouldBe 1
        }
    }

    @Test
    fun `should have avenant_conventions table with all columns`() {
        // Query table structure
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'avenant_conventions'
            ORDER BY ordinal_position
            """.trimIndent()
        )

        val columnNames = columns.map { it["column_name"] as String }

        // BaseEntity fields
        columnNames shouldContain "id"
        columnNames shouldContain "created_at"
        columnNames shouldContain "updated_at"
        columnNames shouldContain "actif"

        // AvenantConvention specific fields
        columnNames shouldContain "convention_id"
        columnNames shouldContain "numero_avenant"
        columnNames shouldContain "statut"
        columnNames shouldContain "donnees_avant"
        columnNames shouldContain "modifications"
    }

    @Test
    fun `should have JSONB columns in avenant_conventions`() {
        // Query JSONB columns
        val jsonbColumns = jdbcTemplate.queryForList(
            """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'avenant_conventions'
            AND data_type = 'jsonb'
            """.trimIndent()
        )

        jsonbColumns.size shouldBe 2
        val columnNames = jsonbColumns.map { it["column_name"] as String }
        columnNames shouldContain "donnees_avant"
        columnNames shouldContain "modifications"
    }

    @Test
    fun `should seed test data correctly`() {
        // Verify users were created
        val userCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users",
            Long::class.java
        )
        userCount shouldBe 3

        // Verify conventions were created
        val conventionCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions",
            Long::class.java
        )
        conventionCount shouldBe 1

        // Verify admin user exists
        val adminExists = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE username = 'admin'",
            Long::class.java
        )
        adminExists shouldBe 1
    }

    @Test
    fun `should start Spring Boot application successfully`() {
        // If the context loads successfully, this test passes
        // This verifies that all beans are created and wired correctly
        applicationContext shouldNotBe null
        dataSource shouldNotBe null
        jdbcTemplate shouldNotBe null
    }

    @Test
    fun `should validate Hibernate schema matches Flyway migrations`() {
        // This test passes if Spring Boot context loads successfully
        // with spring.jpa.hibernate.ddl-auto=validate
        // If there's a mismatch, the context would fail to load

        // Verify a few critical columns match
        val avenantConventionColumns = jdbcTemplate.queryForList(
            "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'avenant_conventions'"
        )

        avenantConventionColumns.isNotEmpty() shouldBe true
    }

    // Helper extension
    private infix fun <T> List<T>.shouldContain(element: T) {
        this.contains(element) shouldBe true
    }
}
