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
        logger.info { "Tentative d'inscription pour: ${request.username}" }

        require(!userRepository.existsByUsername(request.username)) {
            "Le nom d'utilisateur '${request.username}' est déjà utilisé"
        }

        require(!userRepository.existsByEmail(request.email)) {
            "L'email '${request.email}' est déjà utilisé"
        }

        val user = User(
            username = request.username,
            email = request.email,
            password = passwordEncoder.encode(request.password),
            fullName = request.fullName,
            roles = request.roles.toMutableSet()
        )

        val savedUser = userRepository.save(user)
        logger.info { "Utilisateur créé avec succès: ${savedUser.username}" }

        val accessToken = jwtService.generateToken(savedUser)
        val refreshToken = jwtService.generateRefreshToken(savedUser)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = savedUser.toDTO()
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        logger.info { "Tentative de connexion pour: ${request.username}" }

        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.username, request.password)
        )

        val user = userRepository.findByUsername(request.username)
            .orElseThrow { IllegalArgumentException("Utilisateur non trouvé") }

        val accessToken = jwtService.generateToken(user)
        val refreshToken = jwtService.generateRefreshToken(user)

        logger.info { "Connexion réussie pour: ${user.username}" }

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = user.toDTO()
        )
    }

    fun refreshToken(refreshToken: String): AuthResponse {
        val username = jwtService.extractUsername(refreshToken)
        val user = userRepository.findByUsername(username)
            .orElseThrow { IllegalArgumentException("Utilisateur non trouvé") }

        require(jwtService.isTokenValid(refreshToken, user)) {
            "Token de rafraîchissement invalide"
        }

        val newAccessToken = jwtService.generateToken(user)
        val newRefreshToken = jwtService.generateRefreshToken(user)

        return AuthResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            user = user.toDTO()
        )
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
