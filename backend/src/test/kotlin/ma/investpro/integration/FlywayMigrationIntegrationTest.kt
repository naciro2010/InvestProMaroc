package ma.investpro.integration

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.jdbc.core.JdbcTemplate
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName
import javax.sql.DataSource

/**
 * Clean integration test with real PostgreSQL + Flyway migrations
 * Tests the 3-file migration strategy (V1: DROP, V2: CREATE, V3: SEED)
 *
 * No Spring Boot context - just pure Flyway + PostgreSQL + JdbcTemplate
 */
class FlywayMigrationIntegrationTest {

    companion object {
        private val postgres = PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine")).apply {
            withDatabaseName("investpro_test")
            withUsername("test")
            withPassword("test")
        }

        private lateinit var dataSource: DataSource
        private lateinit var jdbcTemplate: JdbcTemplate
        private lateinit var flyway: Flyway

        @BeforeAll
        @JvmStatic
        fun setup() {
            // Start PostgreSQL container
            postgres.start()

            // Create DataSource
            val config = HikariConfig().apply {
                jdbcUrl = postgres.jdbcUrl
                username = postgres.username
                password = postgres.password
                driverClassName = "org.postgresql.Driver"
                maximumPoolSize = 5
            }
            dataSource = HikariDataSource(config)

            // Create JdbcTemplate
            jdbcTemplate = JdbcTemplate(dataSource)

            // Configure and run Flyway migrations
            flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .cleanDisabled(false)
                .load()

            // Execute migrations
            flyway.migrate()
        }

        @AfterAll
        @JvmStatic
        fun teardown() {
            postgres.stop()
        }
    }

    @Test
    fun `should execute all Flyway migrations successfully`() {
        // Check migration status
        val info = flyway.info()
        val appliedMigrations = info.applied()

        // All 3 migrations should be applied
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
            "paiements",
            "convention_configurations",
            "convention_type_configurations"
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

        // Verify conventions were created (2 CADRE + 5 SPECIFIQUE sous-conventions in V3 seed data)
        val conventionCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions",
            Long::class.java
        )
        conventionCount shouldBe 7

        // Verify admin user exists
        val adminExists = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE username = 'admin'",
            Long::class.java
        )
        adminExists shouldBe 1
    }

    @Test
    fun `should verify database connection`() {
        // Verify dataSource is working
        dataSource shouldNotBe null
        jdbcTemplate shouldNotBe null

        // Test database connection
        val result = jdbcTemplate.queryForObject("SELECT 1", Int::class.java)
        result shouldBe 1
    }

    @Test
    fun `should have correct column types in avenant_conventions`() {
        // Verify critical column types
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'avenant_conventions'
            ORDER BY ordinal_position
            """.trimIndent()
        )

        columns.isNotEmpty() shouldBe true

        // Verify JSONB columns
        val donneesAvantType = columns.find { it["column_name"] == "donnees_avant" }
        donneesAvantType shouldNotBe null
        donneesAvantType?.get("data_type") shouldBe "jsonb"

        val modificationsType = columns.find { it["column_name"] == "modifications" }
        modificationsType shouldNotBe null
        modificationsType?.get("data_type") shouldBe "jsonb"
    }

    @Test
    fun `should have convention_configurations table with all columns`() {
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'convention_configurations'
            ORDER BY ordinal_position
            """.trimIndent()
        )

        val columnNames = columns.map { it["column_name"] as String }

        // BaseEntity fields
        columnNames shouldContain "id"
        columnNames shouldContain "created_at"
        columnNames shouldContain "updated_at"
        columnNames shouldContain "actif"

        // ConventionConfiguration specific fields
        columnNames shouldContain "code_mask_pattern"
        columnNames shouldContain "code_mask_placeholder"
        columnNames shouldContain "numero_mask_pattern"
        columnNames shouldContain "numero_mask_placeholder"
    }

    @Test
    fun `should have convention_type_configurations table with all columns`() {
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'convention_type_configurations'
            ORDER BY ordinal_position
            """.trimIndent()
        )

        val columnNames = columns.map { it["column_name"] as String }

        // BaseEntity fields
        columnNames shouldContain "id"
        columnNames shouldContain "created_at"
        columnNames shouldContain "updated_at"
        columnNames shouldContain "actif"

        // ConventionTypeConfiguration specific fields
        columnNames shouldContain "configuration_id"
        columnNames shouldContain "type_code"
        columnNames shouldContain "libelle"
        columnNames shouldContain "enabled"
        columnNames shouldContain "ordre_affichage"
    }

    @Test
    fun `should seed convention configuration data correctly`() {
        // Verify convention_configurations was seeded
        val configCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM convention_configurations",
            Long::class.java
        )
        configCount shouldBe 1

        // Verify 4 type configurations were seeded
        val typeConfigCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM convention_type_configurations",
            Long::class.java
        )
        typeConfigCount shouldBe 4

        // Verify CADRE is enabled
        val cadreEnabled = jdbcTemplate.queryForObject(
            "SELECT enabled FROM convention_type_configurations WHERE type_code = 'CADRE'",
            Boolean::class.java
        )
        cadreEnabled shouldBe true

        // Verify SPECIFIQUE is disabled
        val specifiqueEnabled = jdbcTemplate.queryForObject(
            "SELECT enabled FROM convention_type_configurations WHERE type_code = 'SPECIFIQUE'",
            Boolean::class.java
        )
        specifiqueEnabled shouldBe false
    }

    @Test
    fun `should have foreign key from convention_type_configurations to convention_configurations`() {
        val fkExists = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
              ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'convention_type_configurations'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND ccu.table_name = 'convention_configurations'
            """.trimIndent(),
            Long::class.java
        )
        fkExists shouldBe 1
    }

    // Helper extension
    private infix fun <T> List<T>.shouldContain(element: T) {
        this.contains(element) shouldBe true
    }
}
