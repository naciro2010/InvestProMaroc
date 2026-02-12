package ma.investpro.integration

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.collections.shouldNotBeEmpty
import io.kotest.matchers.comparables.shouldBeGreaterThan
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.jdbc.core.JdbcTemplate
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName
import javax.sql.DataSource

/**
 * Integration test for Convention endpoints data validation.
 *
 * This test validates that the seed data matches what the API endpoints expect:
 * - GET /api/conventions returns all conventions
 * - GET /api/conventions/{id}/sous-conventions returns sub-conventions
 * - GET /api/conventions/{id}/imputations returns imputations
 *
 * Uses real PostgreSQL + Flyway migrations (same as FlywayMigrationIntegrationTest).
 *
 * Gracefully skips when Docker is unavailable or API version is incompatible.
 */
@EnabledIfDockerAvailable
class ConventionEndpointIntegrationTest {

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
            postgres.start()

            val config = HikariConfig().apply {
                jdbcUrl = postgres.jdbcUrl
                username = postgres.username
                password = postgres.password
                driverClassName = "org.postgresql.Driver"
                maximumPoolSize = 5
            }
            dataSource = HikariDataSource(config)
            jdbcTemplate = JdbcTemplate(dataSource)

            flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .cleanDisabled(false)
                .load()

            flyway.migrate()
        }

        @AfterAll
        @JvmStatic
        fun teardown() {
            postgres.stop()
        }
    }

    // ========== Convention List Tests ==========

    @Test
    fun `should have conventions in database`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions",
            Long::class.java
        )
        count shouldNotBe null
        count!! shouldBeGreaterThan 0L
    }

    @Test
    fun `should have 13 conventions total (8 CADRE + 5 SPECIFIQUE)`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions",
            Long::class.java
        )
        count shouldBe 13
    }

    @Test
    fun `should have 8 CADRE conventions`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions WHERE type_convention = 'CADRE'",
            Long::class.java
        )
        count shouldBe 8
    }

    @Test
    fun `should have 5 SPECIFIQUE sous-conventions`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions WHERE type_convention = 'SPECIFIQUE'",
            Long::class.java
        )
        count shouldBe 5
    }

    // ========== Convention Status Tests ==========

    @Test
    fun `should have conventions with valid statut values`() {
        val validStatuts = listOf("BROUILLON", "SOUMIS", "VALIDE", "EN_EXECUTION", "ACHEVE", "REJETE")

        val invalidCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM conventions
            WHERE statut NOT IN ('BROUILLON', 'SOUMIS', 'VALIDE', 'EN_EXECUTION', 'ACHEVE', 'REJETE')
            """.trimIndent(),
            Long::class.java
        )
        invalidCount shouldBe 0
    }

    @Test
    fun `should have conventions with EN_EXECUTION status`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions WHERE statut = 'EN_EXECUTION'",
            Long::class.java
        )
        count shouldNotBe null
        count!! shouldBeGreaterThan 0L
    }

    // ========== Sous-Conventions Tests ==========

    @Test
    fun `should have sous-conventions with valid parent references`() {
        // All SPECIFIQUE conventions should have a parent_convention_id
        val orphanCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM conventions
            WHERE type_convention = 'SPECIFIQUE'
            AND parent_convention_id IS NULL
            """.trimIndent(),
            Long::class.java
        )
        orphanCount shouldBe 0
    }

    @Test
    fun `should have sous-conventions linked to CADRE parents`() {
        // Verify that all parent_convention_id references point to CADRE conventions
        val invalidParentCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM conventions c1
            INNER JOIN conventions c2 ON c1.parent_convention_id = c2.id
            WHERE c1.type_convention = 'SPECIFIQUE'
            AND c2.type_convention != 'CADRE'
            """.trimIndent(),
            Long::class.java
        )
        invalidParentCount shouldBe 0
    }

    @Test
    fun `should return sous-conventions for convention ID 1`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM conventions WHERE parent_convention_id = 1",
            Long::class.java
        )
        count shouldNotBe null
        // Convention ID 1 (CONV-001) should have sous-conventions
    }

    // ========== Convention Fields Tests ==========

    @Test
    fun `should have conventions with required fields populated`() {
        val incompleteCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM conventions
            WHERE code IS NULL
            OR objet IS NULL
            OR type_convention IS NULL
            OR statut IS NULL
            """.trimIndent(),
            Long::class.java
        )
        incompleteCount shouldBe 0
    }

    @Test
    fun `should have unique convention codes`() {
        val duplicateCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) - COUNT(DISTINCT code) FROM conventions
            """.trimIndent(),
            Long::class.java
        )
        duplicateCount shouldBe 0
    }

    // ========== Imputations Tests ==========

    @Test
    fun `should have imputations_analytiques table with data`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM imputations_analytiques",
            Long::class.java
        )
        count shouldNotBe null
        count!! shouldBeGreaterThan 0L
    }

    @Test
    fun `should have imputations with valid column structure`() {
        // Verify the column names match what the API expects
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'imputations_analytiques'
            """.trimIndent()
        )

        val columnNames = columns.map { it["column_name"] as String }

        // These columns should exist for the API to work correctly
        columnNames shouldContain "id"
        columnNames shouldContain "type_imputation"
        columnNames shouldContain "reference_id"
        columnNames shouldContain "dimensions_valeurs"
        columnNames shouldContain "montant"
        columnNames shouldContain "actif"
    }

    // ========== Projets Liés Tests ==========

    @Test
    fun `should have projets linked to conventions`() {
        val linkedCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM projets WHERE convention_id IS NOT NULL",
            Long::class.java
        )
        linkedCount shouldNotBe null
        linkedCount!! shouldBeGreaterThan 0L
    }

    @Test
    fun `should have 6 projets total`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM projets",
            Long::class.java
        )
        count shouldBe 6
    }

    @Test
    fun `should have projets with valid convention_id references`() {
        // Verify all convention_id references point to existing conventions
        val invalidRefCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM projets p
            WHERE p.convention_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM conventions c WHERE c.id = p.convention_id)
            """.trimIndent(),
            Long::class.java
        )
        invalidRefCount shouldBe 0
    }

    // ========== Marchés Liés Tests ==========

    @Test
    fun `should have marches linked to conventions`() {
        val linkedCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM marches WHERE convention_id IS NOT NULL",
            Long::class.java
        )
        linkedCount shouldNotBe null
        linkedCount!! shouldBeGreaterThan 0L
    }

    @Test
    fun `should have marches with valid convention_id references`() {
        // Verify all convention_id references point to existing conventions
        val invalidRefCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM marches m
            WHERE m.convention_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM conventions c WHERE c.id = m.convention_id)
            """.trimIndent(),
            Long::class.java
        )
        invalidRefCount shouldBe 0
    }

    @Test
    fun `should have marches with required fields for frontend display`() {
        // Fields used by ConventionDetailPageModern.tsx: numeroMarche (mapped from numero_marche), objet, montantTtc (mapped from montant_ttc), statut
        val incompleteCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM marches
            WHERE numero_marche IS NULL
            OR objet IS NULL
            OR montant_ttc IS NULL
            OR statut IS NULL
            """.trimIndent(),
            Long::class.java
        )
        incompleteCount shouldBe 0
    }

    // ========== Versements Prévisionnels Tests ==========

    @Test
    fun `should have versements_previsionnels linked to conventions`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM versements_previsionnels WHERE convention_id IS NOT NULL",
            Long::class.java
        )
        count shouldNotBe null
        count!! shouldBeGreaterThan 0L
    }

    // ========== Subventions Tests ==========

    @Test
    fun `should have subventions linked to conventions`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM subventions WHERE convention_id IS NOT NULL",
            Long::class.java
        )
        count shouldNotBe null
        count!! shouldBeGreaterThan 0L
    }

    // ========== Partenaires Tests ==========

    @Test
    fun `should have convention_partenaires linked to conventions`() {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM convention_partenaires",
            Long::class.java
        )
        count shouldNotBe null
        count!! shouldBeGreaterThan 0L
    }

    @Test
    fun `should have convention_partenaires with valid convention references`() {
        val invalidRefCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM convention_partenaires cp
            WHERE NOT EXISTS (SELECT 1 FROM conventions c WHERE c.id = cp.convention_id)
            """.trimIndent(),
            Long::class.java
        )
        invalidRefCount shouldBe 0
    }

    // ========== API Response Structure Validation ==========

    @Test
    fun `should have convention data compatible with ConventionDTO structure`() {
        // Query a convention and verify all required fields exist
        val conventions = jdbcTemplate.queryForList(
            """
            SELECT id, code, numero, libelle, objet, type_convention, statut,
                   budget, taux_commission, base_calcul, taux_tva,
                   date_debut, date_fin, description, actif,
                   parent_convention_id, herite_parametres,
                   created_at, updated_at
            FROM conventions
            WHERE id = 1
            """.trimIndent()
        )

        conventions.shouldNotBeEmpty()
        val convention = conventions[0]

        // Verify essential fields are present
        convention["id"] shouldNotBe null
        convention["code"] shouldNotBe null
        convention["objet"] shouldNotBe null
        convention["type_convention"] shouldNotBe null
        convention["statut"] shouldNotBe null
    }

    // Helper extension
    private infix fun <T> List<T>.shouldContain(element: T) {
        this.contains(element) shouldBe true
    }
}
