package ma.investpro.integration

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import javax.sql.DataSource

/**
 * Integration test to verify Flyway migrations execute correctly
 * and the Spring Boot application starts successfully with real PostgreSQL
 *
 * This test ensures:
 * 1. All Flyway migrations (V1-V12) execute without errors
 * 2. Database schema matches JPA entity definitions
 * 3. Spring Boot context starts successfully
 * 4. Basic API endpoints are accessible
 */
class FlywayMigrationIntegrationTest : PostgresIntegrationTest() {

    @Autowired
    private lateinit var dataSource: DataSource

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var restTemplate: TestRestTemplate

    @Test
    fun `should execute all Flyway migrations successfully`() {
        // Given: Flyway is configured
        val flyway = Flyway.configure()
            .dataSource(dataSource)
            .load()

        // When: Check migration status
        val info = flyway.info()

        // Then: All migrations should be applied
        val appliedMigrations = info.applied()
        appliedMigrations shouldNotBe null

        // Filter out baseline migration (has null version)
        val versionedMigrations = appliedMigrations.filter { it.version != null }
        // Note: V5 is missing in the migration sequence (V1,V2,V3,V4,V6,V7,V8,V9,V10,V11,V12)
        versionedMigrations.size shouldBe 11

        // Verify latest migration is V12 (avenant_conventions)
        val latestMigration = versionedMigrations.last()
        latestMigration.version.version shouldBe "12"
        latestMigration.description shouldBe "create avenant conventions"
    }

    @Test
    fun `should create avenant_conventions table with all required columns`() {
        // When: Query table structure
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'avenant_conventions'
            ORDER BY ordinal_position
            """.trimIndent()
        )

        // Then: All required columns should exist
        val columnNames = columns.map { it["column_name"] as String }

        // BaseEntity fields
        columnNames shouldContain "id"
        columnNames shouldContain "created_at"
        columnNames shouldContain "updated_at"
        columnNames shouldContain "actif"

        // AvenantConvention specific fields
        columnNames shouldContain "convention_id"
        columnNames shouldContain "numero_avenant"
        columnNames shouldContain "date_avenant"
        columnNames shouldContain "objet"
        columnNames shouldContain "statut"
        columnNames shouldContain "donnees_avant"
        columnNames shouldContain "modifications"
        columnNames shouldContain "delta_budget"
        columnNames shouldContain "ordre_application"
    }

    @Test
    fun `should have JSONB columns with GIN indexes`() {
        // When: Query JSONB columns
        val jsonbColumns = jdbcTemplate.queryForList(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'avenant_conventions'
            AND data_type = 'jsonb'
            """.trimIndent()
        )

        // Then: Should have two JSONB columns
        jsonbColumns.size shouldBe 2
        val jsonbColumnNames = jsonbColumns.map { it["column_name"] as String }
        jsonbColumnNames shouldContain "donnees_avant"
        jsonbColumnNames shouldContain "modifications"

        // And: GIN indexes should exist
        val ginIndexes = jdbcTemplate.queryForList(
            """
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'avenant_conventions'
            AND indexdef LIKE '%USING gin%'
            """.trimIndent()
        )

        ginIndexes.size shouldBe 2
    }

    @Test
    fun `should have all foreign key constraints`() {
        // When: Query foreign keys
        val foreignKeys = jdbcTemplate.queryForList(
            """
            SELECT constraint_name, table_name
            FROM information_schema.table_constraints
            WHERE constraint_type = 'FOREIGN KEY'
            AND table_name = 'avenant_conventions'
            """.trimIndent()
        )

        // Then: Should have 4 foreign keys (convention, created_by, soumis_par, valide_par)
        foreignKeys.size shouldBe 4

        val constraintNames = foreignKeys.map { it["constraint_name"] as String }
        constraintNames shouldContain "fk_avenant_conventions_convention"
        constraintNames shouldContain "fk_avenant_conventions_created_by"
        constraintNames shouldContain "fk_avenant_conventions_soumis_par"
        constraintNames shouldContain "fk_avenant_conventions_valide_par"
    }

    @Test
    fun `should start Spring Boot application successfully`() {
        // When: Application context is loaded (happens automatically in @SpringBootTest)
        // Then: Health endpoint should be accessible
        val response = restTemplate.getForEntity("/actuator/health", String::class.java)

        response.statusCode shouldBe HttpStatus.OK
    }

    @Test
    fun `should validate schema matches JPA entities without errors`() {
        // Given: spring.jpa.hibernate.ddl-auto=validate in test config
        // When: Application starts (happens automatically)
        // Then: No schema validation errors should occur

        // Verify key tables exist and match entity definitions
        val tables = listOf(
            "users",
            "conventions",
            "avenant_conventions",
            "projets",
            "marches",
            "fournisseurs",
            "budgets",
            "decomptes",
            "paiements"
        )

        tables.forEach { tableName ->
            val count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_name = ?
                """.trimIndent(),
                Long::class.java,
                tableName
            )

            count shouldBe 1
        }
    }

    // Helper extension for better test readability
    private infix fun <T> List<T>.shouldContain(element: T) {
        this.contains(element) shouldBe true
    }
}
