package ma.investpro.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

@Component
class RequestLoggingFilter : OncePerRequestFilter() {

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val startTime = System.currentTimeMillis()
        val timestamp = LocalDateTime.now().format(dateFormatter)

        // Informations de la requête
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        val remoteAddr = getClientIpAddress(request)

        // Informations d'authentification
        val authentication = SecurityContextHolder.getContext().authentication
        val username = authentication?.name ?: "anonymous"
        val roles = authentication?.authorities?.joinToString(", ") { it.authority } ?: "NONE"
        val isAuthenticated = authentication?.isAuthenticated ?: false

        // Log de la requête entrante
        logger.info {
            """
            ═══════════════════════════════════════════════════════════════════
            🔵 REQUÊTE ENTRANTE [$timestamp]
            ───────────────────────────────────────────────────────────────────
            📍 Endpoint      : $method $fullUrl
            👤 Utilisateur   : $username
            🔐 Authentifié   : $isAuthenticated
            🎭 Rôles         : $roles
            🌐 IP Address    : $remoteAddr
            🖥️  User-Agent    : ${request.getHeader("User-Agent") ?: "N/A"}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        try {
            // Exécuter la requête
            filterChain.doFilter(request, response)

            val duration = System.currentTimeMillis() - startTime
            val status = response.status

            // Log de la réponse
            val statusEmoji = when {
                status < 300 -> "✅"
                status < 400 -> "⚠️"
                status < 500 -> "❌"
                else -> "🔥"
            }

            logger.info {
                """
                ═══════════════════════════════════════════════════════════════════
                $statusEmoji RÉPONSE [$timestamp]
                ───────────────────────────────────────────────────────────────────
                📍 Endpoint      : $method $fullUrl
                👤 Utilisateur   : $username
                🎯 Status Code   : $status
                ⏱️  Durée         : ${duration}ms
                ═══════════════════════════════════════════════════════════════════
                """.trimIndent()
            }

            // Log spécial pour les erreurs d'autorisation
            if (status == 403) {
                logger.warn {
                    """
                    🚫 ACCÈS REFUSÉ (403 FORBIDDEN)
                    ───────────────────────────────────────────────────────────────────
                    👤 Utilisateur   : $username
                    🎭 Rôles         : $roles
                    📍 Tentative     : $method $fullUrl
                    💡 Raison        : L'utilisateur n'a pas les permissions nécessaires
                    ═══════════════════════════════════════════════════════════════════
                    """.trimIndent()
                }
            }

            // Log spécial pour les erreurs d'authentification
            if (status == 401) {
                logger.warn {
                    """
                    🔒 NON AUTHENTIFIÉ (401 UNAUTHORIZED)
                    ───────────────────────────────────────────────────────────────────
                    📍 Endpoint      : $method $fullUrl
                    🌐 IP Address    : $remoteAddr
                    💡 Raison        : Token JWT manquant, invalide ou expiré
                    ═══════════════════════════════════════════════════════════════════
                    """.trimIndent()
                }
            }

        } catch (ex: Exception) {
            val duration = System.currentTimeMillis() - startTime

            logger.error(ex) {
                """
                💥 ERREUR SERVEUR (EXCEPTION)
                ───────────────────────────────────────────────────────────────────
                📍 Endpoint      : $method $fullUrl
                👤 Utilisateur   : $username
                🎭 Rôles         : $roles
                🌐 IP Address    : $remoteAddr
                ⏱️  Durée         : ${duration}ms
                🔥 Exception     : ${ex.javaClass.simpleName}
                📝 Message       : ${ex.message}
                ═══════════════════════════════════════════════════════════════════
                """.trimIndent()
            }

            throw ex
        }
    }

    private fun getClientIpAddress(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        if (!xForwardedFor.isNullOrEmpty()) {
            return xForwardedFor.split(",")[0].trim()
        }

        val xRealIp = request.getHeader("X-Real-IP")
        if (!xRealIp.isNullOrEmpty()) {
            return xRealIp
        }

        return request.remoteAddr ?: "Unknown"
    }
}
