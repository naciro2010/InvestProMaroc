package ma.investpro.integration

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles

/**
 * Simple integration test to verify Spring Boot starts successfully
 * Uses H2 in-memory database with Hibernate create-drop
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FlywayMigrationIntegrationTest {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var restTemplate: TestRestTemplate

    @Test
    fun `should start Spring Boot application successfully`() {
        // When: Application context is loaded (happens automatically in @SpringBootTest)
        // Then: Health endpoint should be accessible
        val response = restTemplate.getForEntity("/actuator/health", String::class.java)

        response.statusCode shouldBe HttpStatus.OK
    }

    @Test
    fun `should create all required tables`() {
        // When: Application starts, Hibernate creates schema
        // Then: Verify key tables exist
        val tables = listOf(
            "USERS",
            "CONVENTIONS",
            "PROJETS",
            "MARCHES",
            "FOURNISSEURS",
            "DECOMPTES"
        )

        tables.forEach { tableName ->
            val count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE UPPER(TABLE_NAME) = ?",
                Long::class.java,
                tableName
            )

            count shouldBe 1
        }
    }

    @Test
    fun `should have avenant_conventions table with required columns`() {
        // When: Query table structure
        val columns = jdbcTemplate.queryForList(
            """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE UPPER(TABLE_NAME) = 'AVENANT_CONVENTIONS'
            """.trimIndent()
        )

        // Then: Should have key columns
        val columnNames = columns.map { (it["COLUMN_NAME"] as String).lowercase() }

        columnNames shouldContain "id"
        columnNames shouldContain "convention_id"
        columnNames shouldContain "numero_avenant"
        columnNames shouldContain "statut"
        columnNames shouldContain "actif"
    }

    // Helper extension for better test readability
    private infix fun <T> List<T>.shouldContain(element: T) {
        this.contains(element) shouldBe true
    }
}
