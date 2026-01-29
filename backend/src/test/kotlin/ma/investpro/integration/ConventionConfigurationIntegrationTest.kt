package ma.investpro.integration

import com.fasterxml.jackson.databind.ObjectMapper
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import ma.investpro.dto.LoginRequest
import ma.investpro.dto.parametrage.ConventionConfigurationDTO
import ma.investpro.dto.parametrage.ConventionTypeConfigurationDTO
import ma.investpro.repository.ConventionConfigurationRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Order
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

/**
 * Integration tests for ConventionConfiguration API with real PostgreSQL via Testcontainers.
 *
 * These tests verify:
 * - GET /api/parametrage/conventions returns configuration
 * - PUT /api/parametrage/conventions updates configuration
 * - Database persistence of convention type configurations
 * - Authentication requirements for protected endpoints
 *
 * Uses PostgresIntegrationTest base class which starts a real PostgreSQL container.
 */
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class ConventionConfigurationIntegrationTest : PostgresIntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var configurationRepository: ConventionConfigurationRepository

    private var accessToken: String? = null

    @BeforeEach
    fun setUp() {
        // Login as admin to get access token for protected endpoints
        if (accessToken == null) {
            val loginRequest = LoginRequest(
                username = "admin",
                password = "admin123"
            )

            val loginResult = mockMvc.post("/api/auth/login") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(loginRequest)
            }.andReturn()

            val responseBody = loginResult.response.contentAsString
            val jsonNode = objectMapper.readTree(responseBody)
            accessToken = jsonNode.path("data").path("accessToken").asText()
        }
    }

    @Test
    @Order(1)
    fun `should get convention configuration without authentication and receive 401`() {
        mockMvc.get("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isUnauthorized() }
        }
    }

    @Test
    @Order(2)
    fun `should get convention configuration with valid token`() {
        mockMvc.get("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $accessToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.success") { value(true) }
            jsonPath("$.data.codeMaskPattern") { exists() }
            jsonPath("$.data.codeMaskPlaceholder") { exists() }
            jsonPath("$.data.numeroMaskPattern") { exists() }
            jsonPath("$.data.numeroMaskPlaceholder") { exists() }
            jsonPath("$.data.typeConfigurations") { isArray() }
        }
    }

    @Test
    @Order(3)
    fun `should have seeded convention type configurations`() {
        val result = mockMvc.get("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $accessToken")
        }.andReturn()

        val responseBody = result.response.contentAsString
        val jsonNode = objectMapper.readTree(responseBody)
        val typeConfigurations = jsonNode.path("data").path("typeConfigurations")

        // V3 seed data creates 4 type configurations
        typeConfigurations.size() shouldBe 4

        // Verify CADRE and NON_CADRE are enabled
        val cadre = typeConfigurations.find { it.path("typeCode").asText() == "CADRE" }
        cadre shouldNotBe null
        cadre?.path("enabled")?.asBoolean() shouldBe true

        val nonCadre = typeConfigurations.find { it.path("typeCode").asText() == "NON_CADRE" }
        nonCadre shouldNotBe null
        nonCadre?.path("enabled")?.asBoolean() shouldBe true
    }

    @Test
    @Order(4)
    fun `should update convention configuration`() {
        val updateRequest = ConventionConfigurationDTO(
            codeMaskPattern = "^CONV-[0-9]{4}$",
            codeMaskPlaceholder = "CONV-0001",
            numeroMaskPattern = "^N[0-9]+/[0-9]{4}$",
            numeroMaskPlaceholder = "N001/2026",
            typeConfigurations = listOf(
                ConventionTypeConfigurationDTO(
                    typeCode = "CADRE",
                    libelle = "Convention Cadre Modifiée",
                    enabled = true,
                    ordreAffichage = 1
                ),
                ConventionTypeConfigurationDTO(
                    typeCode = "NON_CADRE",
                    libelle = "Convention Non-Cadre",
                    enabled = true,
                    ordreAffichage = 2
                ),
                ConventionTypeConfigurationDTO(
                    typeCode = "SPECIFIQUE",
                    libelle = "Convention Spécifique",
                    enabled = true, // Enable SPECIFIQUE
                    ordreAffichage = 3
                ),
                ConventionTypeConfigurationDTO(
                    typeCode = "AVENANT",
                    libelle = "Convention Avenant",
                    enabled = false,
                    ordreAffichage = 4
                )
            )
        )

        mockMvc.put("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $accessToken")
            content = objectMapper.writeValueAsString(updateRequest)
        }.andExpect {
            status { isOk() }
            jsonPath("$.success") { value(true) }
            jsonPath("$.data.codeMaskPattern") { value("^CONV-[0-9]{4}$") }
            jsonPath("$.data.codeMaskPlaceholder") { value("CONV-0001") }
        }
    }

    @Test
    @Order(5)
    fun `should persist configuration changes to database`() {
        // Fetch from database directly
        val config = configurationRepository.findFirstByOrderByIdAsc()
        config shouldNotBe null

        config?.codeMaskPattern shouldBe "^CONV-[0-9]{4}$"
        config?.codeMaskPlaceholder shouldBe "CONV-0001"

        // Verify type configurations
        val typeConfigs = config?.typeConfigurations?.toList()
        typeConfigs shouldNotBe null
        typeConfigs?.size shouldBe 4

        // Verify SPECIFIQUE is now enabled (from previous test update)
        val specifique = typeConfigs?.find { typeConfig -> typeConfig.typeCode == "SPECIFIQUE" }
        specifique?.enabled shouldBe true
    }

    @Test
    @Order(6)
    fun `should reject update with invalid data`() {
        val invalidRequest = mapOf(
            "codeMaskPattern" to "", // Empty - should fail @NotBlank
            "codeMaskPlaceholder" to "CONV-001",
            "numeroMaskPattern" to "^[A-Z]+$",
            "numeroMaskPlaceholder" to "N001",
            "typeConfigurations" to emptyList<Any>()
        )

        mockMvc.put("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $accessToken")
            content = objectMapper.writeValueAsString(invalidRequest)
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    @Order(7)
    fun `should require manager or admin role to update configuration`() {
        // Login as regular user
        val userLoginRequest = LoginRequest(
            username = "user",
            password = "user123"
        )

        val userLoginResult = mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(userLoginRequest)
        }.andReturn()

        val userResponseBody = userLoginResult.response.contentAsString
        val userJsonNode = objectMapper.readTree(userResponseBody)
        val userToken = userJsonNode.path("data").path("accessToken").asText()

        // Try to update with user token (should fail with 403)
        val updateRequest = ConventionConfigurationDTO(
            codeMaskPattern = "^TEST$",
            codeMaskPlaceholder = "TEST",
            numeroMaskPattern = "^TEST$",
            numeroMaskPlaceholder = "TEST",
            typeConfigurations = listOf(
                ConventionTypeConfigurationDTO(
                    typeCode = "CADRE",
                    libelle = "Test",
                    enabled = true,
                    ordreAffichage = 1
                )
            )
        )

        mockMvc.put("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $userToken")
            content = objectMapper.writeValueAsString(updateRequest)
        }.andExpect {
            status { isForbidden() }
        }
    }

    @Test
    @Order(8)
    fun `should allow manager to read configuration`() {
        // Login as manager
        val managerLoginRequest = LoginRequest(
            username = "manager",
            password = "manager123"
        )

        val managerLoginResult = mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(managerLoginRequest)
        }.andReturn()

        val managerResponseBody = managerLoginResult.response.contentAsString
        val managerJsonNode = objectMapper.readTree(managerResponseBody)
        val managerToken = managerJsonNode.path("data").path("accessToken").asText()

        mockMvc.get("/api/parametrage/conventions") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $managerToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.success") { value(true) }
        }
    }
}
