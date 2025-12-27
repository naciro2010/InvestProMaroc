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

        // Request info
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        val remoteAddr = getClientIpAddress(request)

        // Auth info
        val authentication = SecurityContextHolder.getContext().authentication
        val username = authentication?.name ?: "anonymous"
        val roles = authentication?.authorities?.joinToString(", ") { it.authority } ?: "NONE"

        // Log request
        logger.info { "REQUEST: $method $fullUrl | User: $username | Roles: $roles | IP: $remoteAddr" }

        try {
            // Execute request
            filterChain.doFilter(request, response)

            val duration = System.currentTimeMillis() - startTime
            val status = response.status

            // Log response
            val level = when {
                status < 300 -> "SUCCESS"
                status < 400 -> "REDIRECT"
                status < 500 -> "CLIENT_ERROR"
                else -> "SERVER_ERROR"
            }

            logger.info { "RESPONSE: $status $level | $method $fullUrl | User: $username | Duration: ${duration}ms" }

            // Log errors
            if (status == 403) {
                logger.warn { "ACCESS_DENIED: User $username ($roles) tried to access $method $fullUrl" }
            }

            if (status == 401) {
                logger.warn { "UNAUTHORIZED: Missing or invalid token for $method $fullUrl | IP: $remoteAddr" }
            }

        } catch (ex: Exception) {
            val duration = System.currentTimeMillis() - startTime
            logger.error(ex) { "EXCEPTION: $method $fullUrl | User: $username | Roles: $roles | Duration: ${duration}ms | Error: ${ex.message}" }
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
