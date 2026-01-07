package ma.investpro.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

private val logger = KotlinLogging.logger {}

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService,
    private val userDetailsService: UserDetailsService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val method = request.method
        val path = request.requestURI
        val authHeader = request.getHeader("Authorization")

        logger.debug("🔍 Request: $method $path")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("⏭️ No valid Authorization header, skipping JWT filter")
            filterChain.doFilter(request, response)
            return
        }

        try {
            val jwt = authHeader.substring(7)
            logger.debug("🔑 JWT token extracted (first 20 chars: ${jwt.take(20)}...)")

            val username = jwtService.extractUsername(jwt)
            logger.debug("👤 JWT username extracted: $username")

            if (SecurityContextHolder.getContext().authentication == null) {
                val userDetails = userDetailsService.loadUserByUsername(username)
                logger.debug("✅ User details loaded: $username with roles: ${userDetails.authorities}")

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    val authToken = UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.authorities
                    ).apply {
                        details = WebAuthenticationDetailsSource().buildDetails(request)
                    }

                    SecurityContextHolder.getContext().authentication = authToken
                    logger.info("✅ Authentication successfully set for user: $username")
                } else {
                    logger.warn("❌ JWT token is not valid for user: $username")
                }
            } else {
                logger.debug("⏭️ Authentication already set, skipping")
            }
        } catch (e: Exception) {
            logger.error("❌ Error setting user authentication: ${e.message}", e)
        }

        filterChain.doFilter(request, response)
    }
}
