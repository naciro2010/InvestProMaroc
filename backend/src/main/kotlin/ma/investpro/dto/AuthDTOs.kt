package ma.investpro.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:NotBlank(message = "Le nom d'utilisateur est obligatoire")
    val username: String,

    @field:NotBlank(message = "Le mot de passe est obligatoire")
    val password: String
)

data class RegisterRequest(
    @field:NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @field:Size(min = 3, max = 50)
    val username: String,

    @field:NotBlank(message = "L'email est obligatoire")
    @field:Email(message = "L'email doit être valide")
    val email: String,

    @field:NotBlank(message = "Le mot de passe est obligatoire")
    @field:Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    val password: String,

    @field:NotBlank(message = "Le nom complet est obligatoire")
    val fullName: String,

    val roles: Set<String> = setOf("USER")
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val user: UserDTO
)

data class UserDTO(
    val id: Long?,
    val username: String,
    val email: String,
    val fullName: String,
    val roles: Set<String>,
    val actif: Boolean
)
