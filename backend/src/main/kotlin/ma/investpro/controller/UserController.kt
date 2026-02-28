package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.ChangePasswordRequest
import ma.investpro.entity.User
import ma.investpro.repository.UserRepository
import ma.investpro.security.annotations.ReadAccess
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

/**
 * Contrôleur REST pour la gestion des utilisateurs.
 *
 * SÉCURITÉ:
 * - @ReadAccess: Accessible à tous les utilisateurs authentifiés (USER, MANAGER, ADMIN)
 */
@RestController
@RequestMapping("/api/users")
class UserController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {



    @GetMapping
    @ReadAccess
    fun getUsers(): ResponseEntity<ApiResponse<List<Map<String, Any?>>>> {
        val users = userRepository.findAll().map { user ->
            mapOf(
                "id" to user.id,
                "username" to user.getUsername(),
                "email" to user.email,
                "fullName" to user.fullName,
                "roles" to user.roles,
                "actif" to user.actif,
                "createdAt" to user.createdAt
            )
        }
        return ResponseEntity.ok(ApiResponse.success(users, "Utilisateurs récupérés"))
    }
    /**
     * Changer le mot de passe de l'utilisateur authentifié.
     *
     * - Valide que le mot de passe actuel est correct
     * - Encode le nouveau mot de passe avec BCrypt
     * - Tout utilisateur authentifié peut changer son propre mot de passe
     */
    @PutMapping("/change-password")
    @ReadAccess
    fun changePassword(
        @Valid @RequestBody request: ChangePasswordRequest,
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponse<String>> {
        logger.info { "Changement de mot de passe pour l'utilisateur: ${userDetails.username}" }

        val user: User = userRepository.findByUsername(userDetails.username)
            .orElseThrow { IllegalArgumentException("Utilisateur non trouvé: ${userDetails.username}") }

        // Vérifier que le mot de passe actuel est correct
        val currentEncodedPassword: String = user.getPassword()
        if (!passwordEncoder.matches(request.currentPassword, currentEncodedPassword)) {
            logger.warn { "Tentative de changement de mot de passe avec un mot de passe actuel incorrect pour: ${userDetails.username}" }
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Le mot de passe actuel est incorrect"))
        }

        // Vérifier que le nouveau mot de passe est différent de l'actuel
        if (passwordEncoder.matches(request.newPassword, currentEncodedPassword)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Le nouveau mot de passe doit être différent du mot de passe actuel"))
        }

        // Encoder et sauvegarder le nouveau mot de passe
        user.setPassword(passwordEncoder.encode(request.newPassword))
        userRepository.save(user)

        logger.info { "Mot de passe changé avec succès pour l'utilisateur: ${userDetails.username}" }

        return ResponseEntity.ok(
            ApiResponse.success("Mot de passe changé avec succès", "Mot de passe changé avec succès")
        )
    }
}
