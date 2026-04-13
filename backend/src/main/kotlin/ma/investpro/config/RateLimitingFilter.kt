package ma.investpro.config

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
class RateLimitingFilter : OncePerRequestFilter() {

    private val authBuckets = ConcurrentHashMap<String, Bucket>()
    private val apiBuckets = ConcurrentHashMap<String, Bucket>()

    private fun createAuthBucket(): Bucket {
        val bandwidth = Bandwidth.builder()
            .capacity(10)
            .refillGreedy(10, Duration.ofMinutes(1))
            .build()
        return Bucket.builder().addLimit(bandwidth).build()
    }

    private fun createApiBucket(): Bucket {
        val bandwidth = Bandwidth.builder()
            .capacity(100)
            .refillGreedy(100, Duration.ofMinutes(1))
            .build()
        return Bucket.builder().addLimit(bandwidth).build()
    }

    private fun getClientIp(request: HttpServletRequest): String {
        return request.getHeader("X-Forwarded-For")?.split(",")?.firstOrNull()?.trim()
            ?: request.remoteAddr
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val clientIp = getClientIp(request)
        val path = request.requestURI

        val bucket = if (path.startsWith("/api/auth/")) {
            authBuckets.computeIfAbsent(clientIp) { createAuthBucket() }
        } else if (path.startsWith("/api/")) {
            apiBuckets.computeIfAbsent(clientIp) { createApiBucket() }
        } else {
            filterChain.doFilter(request, response)
            return
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response)
        } else {
            response.status = 429
            response.contentType = "application/json"
            response.writer.write("""{"success":false,"message":"Trop de requêtes. Réessayez dans quelques instants.","data":null}""")
        }
    }
}
