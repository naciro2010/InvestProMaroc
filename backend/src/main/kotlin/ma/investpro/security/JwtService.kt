package ma.investpro.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.util.*
import javax.crypto.SecretKey

@Service
class JwtService {

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    @Value("\${app.jwt.expiration-ms}")
    private var jwtExpirationMs: Long = 0

    @Value("\${app.jwt.refresh-expiration-ms}")
    private var refreshExpirationMs: Long = 0

    fun generateToken(userDetails: UserDetails, userId: Long? = null): String {
        val claims = mutableMapOf<String, Any>()
        if (userId != null) {
            claims["userId"] = userId
        }
        // Include user's authorities/roles in the JWT token
        claims["authorities"] = userDetails.authorities.map { it.authority }
        claims["roles"] = userDetails.authorities
            .map { it.authority }
            .map { it.removePrefix("ROLE_") }
        return buildToken(claims, userDetails, jwtExpirationMs)
    }

    fun generateRefreshToken(userDetails: UserDetails, userId: Long? = null): String {
        val claims = mutableMapOf<String, Any>()
        if (userId != null) {
            claims["userId"] = userId
        }
        // Include user's authorities/roles in the refresh token
        claims["authorities"] = userDetails.authorities.map { it.authority }
        claims["roles"] = userDetails.authorities
            .map { it.authority }
            .map { it.removePrefix("ROLE_") }
        return buildToken(claims, userDetails, refreshExpirationMs)
    }

    private fun buildToken(
        extraClaims: Map<String, Any>,
        userDetails: UserDetails,
        expiration: Long
    ): String {
        return Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.username)
            .issuedAt(Date(System.currentTimeMillis()))
            .expiration(Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey())
            .compact()
    }

    fun isTokenValid(token: String, userDetails: UserDetails): Boolean {
        val username = extractUsername(token)
        return (username == userDetails.username) && !isTokenExpired(token)
    }

    private fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }

    private fun extractExpiration(token: String): Date {
        return extractClaim(token) { it.expiration }
    }

    fun extractUsername(token: String): String {
        return extractClaim(token) { it.subject }
    }

    fun extractUserId(token: String): Long? {
        return try {
            val claim = extractClaim(token) { it.get("userId") }
            if (claim is Number) claim.toLong() else null
        } catch (e: Exception) {
            null
        }
    }

    fun extractRoles(token: String): List<String> {
        return try {
            val roles = extractClaim(token) { it.get("roles") }
            if (roles is List<*>) {
                @Suppress("UNCHECKED_CAST")
                roles as List<String>
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun extractAuthorities(token: String): List<String> {
        return try {
            val authorities = extractClaim(token) { it.get("authorities") }
            if (authorities is List<*>) {
                @Suppress("UNCHECKED_CAST")
                authorities as List<String>
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T {
        val claims = extractAllClaims(token)
        return claimsResolver(claims)
    }

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(getSignInKey())
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun getSignInKey(): SecretKey {
        val keyBytes = Decoders.BASE64.decode(jwtSecret)
        return Keys.hmacShaKeyFor(keyBytes)
    }
}
