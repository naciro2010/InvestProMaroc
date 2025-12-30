package ma.investpro.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

private val logger = KotlinLogging.logger {}

@Component
class RequestLoggingFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val startTime = System.currentTimeMillis()
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        val remoteAddr = getClientIpAddress(request)

        val authentication = SecurityContextHolder.getContext().authentication
        val username = authentication?.name ?: "anonymous"
        val roles = authentication?.authorities?.joinToString(", ") { it.authority } ?: "NONE"

        logger.info { "REQUEST: $method $fullUrl | User: $username | Roles: $roles | IP: $remoteAddr" }

        filterChain.doFilter(request, response)

        val duration = System.currentTimeMillis() - startTime
        val status = response.status

        val level = when {
            status < 300 -> "SUCCESS"
            status < 400 -> "REDIRECT"
            status < 500 -> "CLIENT_ERROR"
            else -> "SERVER_ERROR"
        }

        logger.info { "RESPONSE: $status $level | $method $fullUrl | User: $username | Duration: ${duration}ms" }

        if (status == 403) {
            logger.warn { "ACCESS_DENIED: User $username ($roles) tried to access $method $fullUrl" }
        } else if (status == 401) {
            logger.warn { "UNAUTHORIZED: Missing or invalid token for $method $fullUrl | IP: $remoteAddr" }
        }
    }

    private fun getClientIpAddress(request: HttpServletRequest): String =
        request.getHeader("X-Forwarded-For")?.takeIf { it.isNotEmpty() }?.split(",")?.get(0)?.trim()
            ?: request.getHeader("X-Real-IP")?.takeIf { it.isNotEmpty() }
            ?: request.remoteAddr
            ?: "Unknown"
}
