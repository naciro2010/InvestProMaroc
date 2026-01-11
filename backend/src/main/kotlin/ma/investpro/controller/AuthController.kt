package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
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
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        return try {
            val response = authService.register(request)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Inscription réussie",
                    data = response
                )
            )
        } catch (e: IllegalArgumentException) {
            logger.warn { "Échec d'inscription: ${e.message}" }
            ResponseEntity.badRequest().body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Erreur lors de l'inscription",
                    data = null
                )
            )
        }
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        return try {
            val response = authService.login(request)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Connexion réussie",
                    data = response
                )
            )
        } catch (e: Exception) {
            logger.warn { "Échec de connexion: ${e.message}" }
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse(
                    success = false,
                    message = "Identifiants invalides",
                    data = null
                )
            )
        }
    }

    @PostMapping("/refresh")
    fun refreshToken(@RequestParam refreshToken: String): ResponseEntity<ApiResponse<AuthResponse>> {
        return try {
            val response = authService.refreshToken(refreshToken)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Token rafraîchi avec succès",
                    data = response
                )
            )
        } catch (e: Exception) {
            logger.warn { "Échec du rafraîchissement: ${e.message}" }
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse(
                    success = false,
                    message = "Token de rafraîchissement invalide",
                    data = null
                )
            )
        }
    }
}
