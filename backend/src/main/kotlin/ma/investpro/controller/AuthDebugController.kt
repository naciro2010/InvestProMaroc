package ma.investpro.controller

import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/auth/debug")
@CrossOrigin(origins = ["*"])
class AuthDebugController {

    /**
     * Diagnostic endpoint to check current user's authentication and authorities
     * ADMIN-only endpoint for debugging purposes
     */
    @GetMapping("/whoami")
    @PreAuthorize("hasRole('ADMIN')")
    fun getCurrentUserInfo(): ResponseEntity<Map<String, Any?>> {
        val authentication = SecurityContextHolder.getContext().authentication

        val result: MutableMap<String, Any?> = mutableMapOf()

        if (authentication != null && authentication.isAuthenticated) {
            val principal = authentication.principal
            val authorities = authentication.authorities.map { it.authority }
            val roles = authorities.map { it.removePrefix("ROLE_") }

            logger.info("✅ Current user authenticated: ${authentication.name}")
            logger.info("   Authorities: $authorities")
            logger.info("   Roles: $roles")

            result["authenticated"] = true
            result["username"] = authentication.name
            result["authorities"] = authorities
            result["roles"] = roles
            result["principalClass"] = principal?.javaClass?.simpleName
            result["message"] = "User is authenticated with the above roles"
        } else {
            logger.warn("⚠️ User is not authenticated")
            result["authenticated"] = false
            result["message"] = "No user is currently authenticated. Send Authorization: Bearer <token> header"
        }

        return ResponseEntity.ok(result)
    }

    /**
     * Check if current user has a specific role
     * Usage: GET /api/auth/debug/has-role/ADMIN
     * ADMIN-only endpoint for debugging purposes
     */
    @GetMapping("/has-role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    fun checkUserRole(@PathVariable role: String): ResponseEntity<Map<String, Any?>> {
        val authentication = SecurityContextHolder.getContext().authentication
        val result: MutableMap<String, Any?> = mutableMapOf()

        if (authentication != null && authentication.isAuthenticated) {
            val hasRole = authentication.authorities.any {
                it.authority == "ROLE_$role" || it.authority == role
            }

            logger.info("✅ Role check for $role: $hasRole")

            result["authenticated"] = true
            result["username"] = authentication.name
            result["role"] = role
            result["hasRole"] = hasRole
            result["userAuthorities"] = authentication.authorities.map { it.authority }
        } else {
            result["authenticated"] = false
            result["message"] = "No user is authenticated"
        }

        return ResponseEntity.ok(result)
    }

    /**
     * Health check - proves authentication filter is working
     */
    @GetMapping("/health")
    fun health(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf(
            "status" to "OK",
            "message" to "Auth debug endpoints are available"
        ))
    }
}
