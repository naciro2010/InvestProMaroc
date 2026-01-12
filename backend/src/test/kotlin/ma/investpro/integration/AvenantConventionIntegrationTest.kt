package ma.investpro.integration

import com.fasterxml.jackson.databind.ObjectMapper
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import ma.investpro.dto.*
import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention
import ma.investpro.entity.User
import ma.investpro.repository.AvenantConventionRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

/**
 * Integration test for AvenantConvention API
 *
 * Tests the complete workflow:
 * 1. Create avenant (BROUILLON)
 * 2. Submit avenant (SOUMIS)
 * 3. Validate avenant (VALIDE)
 * 4. Verify convention is updated
 */
class AvenantConventionIntegrationTest : PostgresIntegrationTest() {

    @Autowired
    private lateinit var restTemplate: TestRestTemplate

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var conventionRepository: ConventionRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var avenantRepository: AvenantConventionRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private lateinit var authToken: String
    private lateinit var testConvention: Convention
    private lateinit var testUser: User
    private val testUsername = "test_avenant_${UUID.randomUUID().toString().substring(0, 8)}"

    @BeforeEach
    fun setup() {
        // Create test user with unique username
        testUser = userRepository.save(
            User(
                username = testUsername,
                password = passwordEncoder.encode("test123"),
                email = "${testUsername}@investpro.ma",
                fullName = "Test Avenant User",
                roles = mutableSetOf("ADMIN")
            )
        )

        // Authenticate and get token
        val loginRequest = mapOf(
            "username" to testUsername,
            "password" to "test123"
        )

        val loginResponse = restTemplate.postForEntity(
            "/api/auth/login",
            loginRequest,
            String::class.java
        )

        val loginData = objectMapper.readTree(loginResponse.body)
        authToken = loginData.get("data").get("accessToken").asText()

        // Create test convention
        testConvention = conventionRepository.save(
            Convention(
                code = "CONV-TEST-AVE",
                numero = "CONV-2024-TEST-AVE",
                dateConvention = LocalDate.now().minusDays(30),
                typeConvention = TypeConvention.CADRE,
                libelle = "Convention de test pour avenants",
                objet = "Test des avenants avec workflow complet",
                budget = BigDecimal("1000000.00"),
                tauxCommission = BigDecimal("2.50"),
                dateDebut = LocalDate.now().minusDays(30),
                statut = StatutConvention.VALIDEE
            )
        )
    }

    @AfterEach
    fun cleanup() {
        // Clean up test data to avoid conflicts between tests
        try {
            if (::testConvention.isInitialized) {
                avenantRepository.deleteAll(avenantRepository.findByConventionIdOrderByOrdreApplicationAsc(testConvention.id!!))
                conventionRepository.delete(testConvention)
            }
            if (::testUser.isInitialized) {
                userRepository.delete(testUser)
            }
        } catch (e: Exception) {
            // Ignore cleanup errors
        }
    }

    @Test
    fun `should create avenant in BROUILLON status`() {
        // Given: Avenant request
        val request = mapOf(
            "conventionId" to testConvention.id,
            "numeroAvenant" to "AVE-001-TEST",
            "dateAvenant" to LocalDate.now().toString(),
            "objet" to "Augmentation du budget",
            "motif" to "Travaux supplémentaires nécessaires",
            "ancienBudget" to 1000000.00,
            "nouveauBudget" to 1200000.00
        )

        // When: POST create avenant
        val response = restTemplate.exchange(
            "/api/avenants-conventions",
            HttpMethod.POST,
            createHttpEntity(request),
            String::class.java
        )

        // Then: Should create successfully
        response.statusCode shouldBe HttpStatus.CREATED

        val body = objectMapper.readTree(response.body)
        body.get("success").asBoolean() shouldBe true

        val data = body.get("data")
        data.get("statut").asText() shouldBe "BROUILLON"
        data.get("numeroAvenant").asText() shouldBe "AVE-001-TEST"
        data.get("isEditable").asBoolean() shouldBe true
        data.get("canSoumettre").asBoolean() shouldBe true
    }

    @Test
    fun `should complete full workflow - BROUILLON to SOUMIS to VALIDE`() {
        // Step 1: Create avenant
        val createRequest = mapOf(
            "conventionId" to testConvention.id,
            "numeroAvenant" to "AVE-WORKFLOW-TEST",
            "dateAvenant" to LocalDate.now().toString(),
            "objet" to "Test workflow complet",
            "ancienBudget" to 1000000.00,
            "nouveauBudget" to 1500000.00
        )

        val createResponse = restTemplate.exchange(
            "/api/avenants-conventions",
            HttpMethod.POST,
            createHttpEntity(createRequest),
            String::class.java
        )

        createResponse.statusCode shouldBe HttpStatus.CREATED
        val createData = objectMapper.readTree(createResponse.body).get("data")
        val avenantId = createData.get("id").asLong()

        // Step 2: Submit avenant (BROUILLON → SOUMIS)
        val submitRequest = mapOf(
            "avenantId" to avenantId,
            "userId" to testUser.id
        )

        val submitResponse = restTemplate.exchange(
            "/api/avenants-conventions/soumettre",
            HttpMethod.POST,
            createHttpEntity(submitRequest),
            String::class.java
        )

        submitResponse.statusCode shouldBe HttpStatus.OK
        val submitData = objectMapper.readTree(submitResponse.body).get("data")
        submitData.get("statut").asText() shouldBe "SOUMIS"
        submitData.get("isEditable").asBoolean() shouldBe false
        submitData.get("canValider").asBoolean() shouldBe true

        // Step 3: Validate avenant (SOUMIS → VALIDE)
        val validateRequest = mapOf(
            "avenantId" to avenantId,
            "userId" to testUser.id,
            "remarques" to "Avenant validé après vérification"
        )

        val validateResponse = restTemplate.exchange(
            "/api/avenants-conventions/valider",
            HttpMethod.POST,
            createHttpEntity(validateRequest),
            String::class.java
        )

        validateResponse.statusCode shouldBe HttpStatus.OK
        val validateData = objectMapper.readTree(validateResponse.body).get("data")
        validateData.get("statut").asText() shouldBe "VALIDE"

        // Step 4: Verify convention was updated
        val updatedConvention = conventionRepository.findById(testConvention.id!!).get()
        updatedConvention.budget shouldBe BigDecimal("1500000.00")
    }

    @Test
    fun `should get avenants by convention`() {
        // Given: Create two avenants
        createAvenant("AVE-GET-001", "Premier avenant")
        createAvenant("AVE-GET-002", "Deuxième avenant")

        // When: GET avenants by convention
        val response = restTemplate.exchange(
            "/api/avenants-conventions/convention/${testConvention.id}",
            HttpMethod.GET,
            createHttpEntity(null),
            String::class.java
        )

        // Then: Should return both avenants
        response.statusCode shouldBe HttpStatus.OK

        val body = objectMapper.readTree(response.body)
        val data = body.get("data")
        data.isArray shouldBe true
        data.size() shouldBe 2
    }

    @Test
    fun `should get statistics for convention avenants`() {
        // Given: Create avenants with different statuses
        val avenantId1 = createAvenant("AVE-STAT-001", "Avenant brouillon")

        val avenantId2 = createAvenant("AVE-STAT-002", "Avenant soumis")
        soumettreAvenant(avenantId2)

        val avenantId3 = createAvenant("AVE-STAT-003", "Avenant validé")
        soumettreAvenant(avenantId3)
        validerAvenant(avenantId3)

        // When: GET statistics
        val response = restTemplate.exchange(
            "/api/avenants-conventions/convention/${testConvention.id}/statistics",
            HttpMethod.GET,
            createHttpEntity(null),
            String::class.java
        )

        // Then: Should return correct counts
        response.statusCode shouldBe HttpStatus.OK

        val body = objectMapper.readTree(response.body)
        val data = body.get("data")
        data.get("totalAvenants").asInt() shouldBe 3
        data.get("brouillons").asInt() shouldBe 1
        data.get("soumis").asInt() shouldBe 1
        data.get("valides").asInt() shouldBe 1
    }

    @Test
    fun `should reject avenant and return to BROUILLON`() {
        // Given: Create and submit avenant
        val avenantId = createAvenant("AVE-REJECT-001", "Avenant à rejeter")
        soumettreAvenant(avenantId)

        // When: Reject avenant
        val rejectRequest = mapOf(
            "avenantId" to avenantId,
            "motifRejet" to "Dossier incomplet, manque justificatifs"
        )

        val response = restTemplate.exchange(
            "/api/avenants-conventions/rejeter",
            HttpMethod.POST,
            createHttpEntity(rejectRequest),
            String::class.java
        )

        // Then: Should be back to BROUILLON
        response.statusCode shouldBe HttpStatus.OK

        val body = objectMapper.readTree(response.body)
        val data = body.get("data")
        data.get("statut").asText() shouldBe "BROUILLON"
        data.get("motifRejet").asText() shouldBe "Dossier incomplet, manque justificatifs"
        data.get("isEditable").asBoolean() shouldBe true
    }

    @Test
    fun `should calculate delta budget automatically`() {
        // Given: Avenant with budget change
        val request = mapOf(
            "conventionId" to testConvention.id,
            "numeroAvenant" to "AVE-DELTA-001",
            "dateAvenant" to LocalDate.now().toString(),
            "objet" to "Test calcul delta",
            "ancienBudget" to 1000000.00,
            "nouveauBudget" to 1350000.00
        )

        // When: Create avenant
        val response = restTemplate.exchange(
            "/api/avenants-conventions",
            HttpMethod.POST,
            createHttpEntity(request),
            String::class.java
        )

        // Then: Delta should be calculated
        val data = objectMapper.readTree(response.body).get("data")
        data.get("deltaBudget").asDouble() shouldBe 350000.00
    }

    // Helper methods
    private fun createHttpEntity(body: Any?): HttpEntity<Any> {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        headers.set("Authorization", "Bearer $authToken")
        return HttpEntity(body, headers)
    }

    private fun createAvenant(numero: String, objet: String): Long {
        val request = mapOf(
            "conventionId" to testConvention.id,
            "numeroAvenant" to numero,
            "dateAvenant" to LocalDate.now().toString(),
            "objet" to objet,
            "ancienBudget" to 1000000.00,
            "nouveauBudget" to 1200000.00
        )

        val response = restTemplate.exchange(
            "/api/avenants-conventions",
            HttpMethod.POST,
            createHttpEntity(request),
            String::class.java
        )

        val body = objectMapper.readTree(response.body)
        return body.get("data").get("id").asLong()
    }

    private fun soumettreAvenant(avenantId: Long) {
        val request = mapOf(
            "avenantId" to avenantId,
            "userId" to testUser.id
        )

        restTemplate.exchange(
            "/api/avenants-conventions/soumettre",
            HttpMethod.POST,
            createHttpEntity(request),
            String::class.java
        )
    }

    private fun validerAvenant(avenantId: Long) {
        val request = mapOf(
            "avenantId" to avenantId,
            "userId" to testUser.id
        )

        restTemplate.exchange(
            "/api/avenants-conventions/valider",
            HttpMethod.POST,
            createHttpEntity(request),
            String::class.java
        )
    }
}
