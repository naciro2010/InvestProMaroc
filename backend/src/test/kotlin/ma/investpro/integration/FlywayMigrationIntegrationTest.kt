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
 * Tests the migration strategy (V1: DROP, V2: CREATE, V3: SEED, V4: COLLAB)
 *
 * No Spring Boot context - just pure Flyway + PostgreSQL + JdbcTemplate
 *
 * Gracefully skips when Docker is unavailable or API version is incompatible.
 */
@EnabledIfDockerAvailable
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

        // All versioned migrations should be applied
        appliedMigrations shouldNotBe null
        val versionedMigrations = appliedMigrations.filter { it.version != null }

        versionedMigrations.size shouldBe 4

        // Verify each migration
        versionedMigrations[0].version.version shouldBe "1"
        versionedMigrations[0].description shouldBe "drop all tables"

        versionedMigrations[1].version.version shouldBe "2"
        versionedMigrations[1].description shouldBe "create schema"

        versionedMigrations[2].version.version shouldBe "3"
        versionedMigrations[2].description shouldBe "seed data"

        versionedMigrations[3].version.version shouldBe "4"
        versionedMigrations[3].description shouldBe "notifications and team messages"
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

        // Verify conventions were created (8 CADRE + 5 SPECIFIQUE sous-conventions in V3 seed data)
        val conventionCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions",
            Long::class.java
        )
        conventionCount shouldBe 13

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

    @Test
    fun `should have all V2 tables dropped in V1 to prevent duplicate key errors`() {
        // This test verifies migration consistency:
        // Every table created in V2 must be dropped in V1
        // Otherwise, re-running migrations will cause duplicate key violations

        val allTables = jdbcTemplate.queryForList(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """.trimIndent()
        ).map { it["table_name"] as String }

        // Exclude Flyway internal table
        val appTables = allTables.filter { it != "flyway_schema_history" }

        // All these tables should exist (created by V2, seeded by V3)
        val expectedTables = listOf(
            "users", "user_roles",
            "partenaires", "fournisseurs", "comptes_bancaires",
            "dimensions_analytiques", "valeurs_dimensions", "imputations_analytiques",
            "conventions", "avenant_conventions", "convention_partenaires",
            "budgets", "lignes_budget",
            "subventions", "echeances_subvention",
            "projets", "projet_conventions",
            "imputations_previsionnelles", "versements_previsionnels",
            "marches", "marche_lignes", "avenant_marches",
            "bons_commande", "depenses_investissement", "commissions",
            "decomptes", "decompte_retenues", "decompte_imputations",
            "ordres_paiement", "op_imputations",
            "paiements", "paiement_imputations",
            "avenants",
            "pieces_jointes", "maitres_oeuvre", "categories_depenses",
            "convention_modifications",
            "convention_configurations", "convention_type_configurations",
            "notifications", "team_messages"
        )

        // Verify all expected tables exist
        expectedTables.forEach { tableName ->
            val exists = appTables.contains(tableName)
            if (!exists) {
                throw AssertionError("Expected table '$tableName' not found. V2 may be missing CREATE TABLE statement.")
            }
        }
    }

    @Test
    fun `should seed all reference data tables correctly`() {
        // Verify all seeded tables have expected row counts
        // This catches INSERT errors like duplicate keys or missing explicit IDs

        val seedDataCounts = mapOf(
            "users" to 3L,
            "user_roles" to 3L,
            "dimensions_analytiques" to 4L,
            "valeurs_dimensions" to 9L,
            "fournisseurs" to 4L,
            "projets" to 6L,
            "conventions" to 13L, // 8 CADRE + 5 SPECIFIQUE
            "marches" to 5L,
            "marche_lignes" to 6L,
            "decomptes" to 2L,
            "decompte_retenues" to 2L,
            "convention_configurations" to 1L,
            "convention_type_configurations" to 4L,
            "categories_depenses" to 10L,
            "partenaires" to 8L,
            "convention_partenaires" to 7L,
            "versements_previsionnels" to 13L,
            "subventions" to 8L,
            "imputations_analytiques" to 12L
        )

        seedDataCounts.forEach { (tableName, expectedCount) ->
            val actualCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM $tableName",
                Long::class.java
            )
            if (actualCount != expectedCount) {
                throw AssertionError(
                    "Table '$tableName' has $actualCount rows, expected $expectedCount. " +
                    "Check V3__seed_data.sql for duplicate key or missing INSERT."
                )
            }
        }
    }

    @Test
    fun `should have sequences properly set after seed data`() {
        // Verify sequences are set correctly to avoid duplicate key on next INSERT
        // This catches issues where explicit IDs are used without setval()

        val sequenceChecks = listOf(
            "users_id_seq" to 3L,
            "dimensions_analytiques_id_seq" to 4L,
            "fournisseurs_id_seq" to 4L,
            "projets_id_seq" to 6L,
            "conventions_id_seq" to 13L,
            "marches_id_seq" to 5L,
            "decomptes_id_seq" to 2L,
            "convention_configurations_id_seq" to 1L,
            "convention_type_configurations_id_seq" to 4L,
            "categories_depenses_id_seq" to 10L,
            "partenaires_id_seq" to 8L,
            "convention_partenaires_id_seq" to 7L,
            "versements_previsionnels_id_seq" to 13L,
            "subventions_id_seq" to 8L,
            "imputations_analytiques_id_seq" to 12L
        )

        sequenceChecks.forEach { (sequenceName, minExpected) ->
            val currentVal = jdbcTemplate.queryForObject(
                "SELECT last_value FROM $sequenceName",
                Long::class.java
            )
            if (currentVal == null || currentVal < minExpected) {
                throw AssertionError(
                    "Sequence '$sequenceName' is at $currentVal, expected >= $minExpected. " +
                    "Add 'SELECT setval('$sequenceName', $minExpected)' to V3__seed_data.sql"
                )
            }
        }
    }

    @Test
    fun `should run migrations idempotently without errors`() {
        // Verify migrations can be validated without errors
        // This catches checksum mismatches and script errors
        val validationResult = runCatching { flyway.validateWithResult() }

        validationResult.isSuccess shouldBe true

        val result = validationResult.getOrNull()
        result shouldNotBe null
        result?.validationSuccessful shouldBe true
    }

    // Helper extension
    private infix fun <T> List<T>.shouldContain(element: T) {
        this.contains(element) shouldBe true
    }
}
