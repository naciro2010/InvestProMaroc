package ma.investpro.service

import ma.investpro.dto.*
import ma.investpro.entity.User
import ma.investpro.repository.UserRepository
import ma.investpro.security.JwtService
import mu.KotlinLogging
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val authenticationManager: AuthenticationManager
) {

    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        logger.info {
            """
            📝 INSCRIPTION - DÉBUT
            ───────────────────────────────────────────────────────────────────
            👤 Username      : ${request.username}
            📧 Email         : ${request.email}
            👨 Nom complet   : ${request.fullName}
            🎭 Rôles demand. : ${request.roles.joinToString(", ")}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        // Vérifications
        if (userRepository.existsByUsername(request.username)) {
            logger.warn { "❌ INSCRIPTION REFUSÉE - Username déjà utilisé: ${request.username}" }
            throw IllegalArgumentException("Le nom d'utilisateur '${request.username}' est déjà utilisé")
        }

        if (userRepository.existsByEmail(request.email)) {
            logger.warn { "❌ INSCRIPTION REFUSÉE - Email déjà utilisé: ${request.email}" }
            throw IllegalArgumentException("L'email '${request.email}' est déjà utilisé")
        }

        val user = User(
            username = request.username,
            email = request.email,
            password = passwordEncoder.encode(request.password),
            fullName = request.fullName,
            roles = request.roles.toMutableSet()
        )

        val savedUser = userRepository.save(user)

        logger.info {
            """
            ✅ INSCRIPTION RÉUSSIE
            ───────────────────────────────────────────────────────────────────
            👤 Username      : ${savedUser.username}
            📧 Email         : ${savedUser.email}
            👨 Nom complet   : ${savedUser.fullName}
            🎭 Rôles         : ${savedUser.roles.joinToString(", ")}
            🆔 User ID       : ${savedUser.id}
            🔐 Actif         : ${savedUser.actif}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        val accessToken = jwtService.generateToken(savedUser, savedUser.id)
        val refreshToken = jwtService.generateRefreshToken(savedUser, savedUser.id)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = savedUser.toDTO()
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        logger.info {
            """
            🔐 CONNEXION - DÉBUT
            ───────────────────────────────────────────────────────────────────
            👤 Username      : ${request.username}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        try {
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(request.username, request.password)
            )

            val user = userRepository.findByUsername(request.username)
                .orElseThrow {
                    logger.error { "❌ CONNEXION ÉCHOUÉE - Utilisateur non trouvé: ${request.username}" }
                    IllegalArgumentException("Utilisateur non trouvé")
                }

            val accessToken = jwtService.generateToken(user, user.id)
            val refreshToken = jwtService.generateRefreshToken(user, user.id)

            logger.info {
                """
                ✅ CONNEXION RÉUSSIE
                ───────────────────────────────────────────────────────────────────
                👤 Username      : ${user.username}
                📧 Email         : ${user.email}
                👨 Nom complet   : ${user.fullName}
                🎭 Rôles         : ${user.roles.joinToString(", ")}
                🆔 User ID       : ${user.id}
                🔐 Actif         : ${user.actif}
                🎫 Token généré  : ${accessToken.take(30)}...
                ═══════════════════════════════════════════════════════════════════
                """.trimIndent()
            }

            return AuthResponse(
                accessToken = accessToken,
                refreshToken = refreshToken,
                user = user.toDTO()
            )
        } catch (e: Exception) {
            logger.error {
                """
                ❌ CONNEXION ÉCHOUÉE
                ───────────────────────────────────────────────────────────────────
                👤 Username      : ${request.username}
                🚨 Erreur        : ${e.message}
                📍 Type          : ${e.javaClass.simpleName}
                ═══════════════════════════════════════════════════════════════════
                """.trimIndent()
            }
            throw e
        }
    }

    fun refreshToken(refreshToken: String): AuthResponse {
        logger.info {
            """
            🔄 REFRESH TOKEN - DÉBUT
            ───────────────────────────────────────────────────────────────────
            🎫 Token          : ${refreshToken.take(30)}...
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        try {
            val username = jwtService.extractUsername(refreshToken)
            logger.debug { "🔍 Username extrait du token: $username" }

            val user = userRepository.findByUsername(username)
                .orElseThrow {
                    logger.error { "❌ REFRESH TOKEN ÉCHOUÉ - Utilisateur non trouvé: $username" }
                    IllegalArgumentException("Utilisateur non trouvé")
                }

            require(jwtService.isTokenValid(refreshToken, user)) {
                logger.error {
                    """
                    ❌ REFRESH TOKEN ÉCHOUÉ - Token invalide
                    👤 Username      : $username
                    🆔 User ID       : ${user.id}
                    """.trimIndent()
                }
                "Token de rafraîchissement invalide"
            }

            val newAccessToken = jwtService.generateToken(user, user.id)
            val newRefreshToken = jwtService.generateRefreshToken(user, user.id)

            logger.info {
                """
                ✅ REFRESH TOKEN RÉUSSI
                ───────────────────────────────────────────────────────────────────
                👤 Username      : ${user.username}
                🎭 Rôles         : ${user.roles.joinToString(", ")}
                🆔 User ID       : ${user.id}
                🎫 Nouveau token : ${newAccessToken.take(30)}...
                ═══════════════════════════════════════════════════════════════════
                """.trimIndent()
            }

            return AuthResponse(
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
                user = user.toDTO()
            )
        } catch (e: Exception) {
            logger.error {
                """
                ❌ REFRESH TOKEN ÉCHOUÉ
                ───────────────────────────────────────────────────────────────────
                🚨 Erreur        : ${e.message}
                📍 Type          : ${e.javaClass.simpleName}
                ═══════════════════════════════════════════════════════════════════
                """.trimIndent()
            }
            throw e
        }
    }

    private fun User.toDTO() = UserDTO(
        id = this.id,
        username = this.username,
        email = this.email,
        fullName = this.fullName,
        roles = this.roles,
        actif = this.actif
    )
}
