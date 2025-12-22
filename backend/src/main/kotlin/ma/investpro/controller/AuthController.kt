package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.AuthResponse
import ma.investpro.dto.LoginRequest
import ma.investpro.dto.RegisterRequest
import ma.investpro.service.AuthService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<Map<String, Any>> {
        return try {
            val response = authService.register(request)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Inscription réussie",
                    "data" to response
                )
            )
        } catch (e: IllegalArgumentException) {
            logger.warn { "Échec d'inscription: ${e.message}" }
            ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to (e.message ?: "Erreur lors de l'inscription")
                )
            )
        }
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<Map<String, Any>> {
        return try {
            val response = authService.login(request)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Connexion réussie",
                    "data" to response
                )
            )
        } catch (e: Exception) {
            logger.warn { "Échec de connexion: ${e.message}" }
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                mapOf(
                    "success" to false,
                    "message" to "Identifiants invalides"
                )
            )
        }
    }

    @PostMapping("/refresh")
    fun refreshToken(@RequestParam refreshToken: String): ResponseEntity<Map<String, Any>> {
        return try {
            val response = authService.refreshToken(refreshToken)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Token rafraîchi avec succès",
                    "data" to response
                )
            )
        } catch (e: Exception) {
            logger.warn { "Échec du rafraîchissement: ${e.message}" }
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                mapOf(
                    "success" to false,
                    "message" to "Token de rafraîchissement invalide"
                )
            )
        }
    }
}
