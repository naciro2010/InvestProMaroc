package ma.investpro.integration

import com.fasterxml.jackson.databind.ObjectMapper
import ma.investpro.dto.LoginRequest
import ma.investpro.dto.RegisterRequest
import ma.investpro.repository.UserRepository
import org.junit.jupiter.api.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class AuthIntegrationTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()
    }

    @Test
    @Order(1)
    fun `should register new user successfully`() {
        val registerRequest = RegisterRequest(
            username = "testuser",
            email = "test@example.com",
            password = "password123",
            fullName = "Test User",
            roles = setOf("USER")
        )

        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(registerRequest)
        }.andExpect {
            status { isOk() }
            jsonPath("$.success") { value(true) }
            jsonPath("$.data.accessToken") { exists() }
            jsonPath("$.data.refreshToken") { exists() }
            jsonPath("$.data.user.username") { value("testuser") }
            jsonPath("$.data.user.email") { value("test@example.com") }
        }

        Assertions.assertTrue(userRepository.existsByUsername("testuser"))
    }

    @Test
    @Order(2)
    fun `should not register user with duplicate username`() {
        // First registration
        val registerRequest = RegisterRequest(
            username = "testuser",
            email = "test@example.com",
            password = "password123",
            fullName = "Test User"
        )

        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(registerRequest)
        }

        // Second registration with same username
        val duplicateRequest = registerRequest.copy(email = "different@example.com")

        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(duplicateRequest)
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.success") { value(false) }
        }
    }

    @Test
    @Order(3)
    fun `should login with valid credentials`() {
        // Register user first
        val registerRequest = RegisterRequest(
            username = "logintest",
            email = "login@example.com",
            password = "password123",
            fullName = "Login Test"
        )

        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(registerRequest)
        }

        // Login
        val loginRequest = LoginRequest(
            username = "logintest",
            password = "password123"
        )

        mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(loginRequest)
        }.andExpect {
            status { isOk() }
            jsonPath("$.success") { value(true) }
            jsonPath("$.data.accessToken") { exists() }
            jsonPath("$.data.user.username") { value("logintest") }
        }
    }

    @Test
    @Order(4)
    fun `should fail login with invalid credentials`() {
        val loginRequest = LoginRequest(
            username = "nonexistent",
            password = "wrongpassword"
        )

        mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(loginRequest)
        }.andExpect {
            status { isUnauthorized() }
            jsonPath("$.success") { value(false) }
        }
    }

    @Test
    @Order(5)
    fun `should validate required fields on registration`() {
        val invalidRequest = mapOf(
            "username" to "",
            "email" to "invalid-email",
            "password" to "123", // Too short
            "fullName" to ""
        )

        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(invalidRequest)
        }.andExpect {
            status { isBadRequest() }
        }
    }
}
