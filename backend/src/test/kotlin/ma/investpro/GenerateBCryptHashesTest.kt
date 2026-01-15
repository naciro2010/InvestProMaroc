package ma.investpro

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.junit.jupiter.api.Test

/**
 * Test utility to generate BCrypt password hashes for test users.
 *
 * Use this test to generate correct BCrypt hashes when:
 * 1. Changing test user passwords in V3__seed_data.sql
 * 2. Adding new test users to the system
 * 3. Need to verify hash generation with Spring Security BCryptPasswordEncoder
 *
 * How to use:
 *   cd backend
 *   ./gradlew test --tests "ma.investpro.GenerateBCryptHashesTest" -i
 *
 * Output will show:
 *   - Username and password for each test user
 *   - Generated BCrypt hash (cost 10)
 *   - SQL INSERT statement ready to copy into V3__seed_data.sql
 *
 * Important:
 *   - Each password must have its own unique hash
 *   - Do NOT reuse same hash for different passwords
 *   - BCrypt includes random salt, so same password gives different hash each time
 *   - Only the final hash is needed in the database (copy from test output)
 */
class GenerateBCryptHashesTest {
    @Test
    fun generateHashesForTestUsers() {
        val passwordEncoder = BCryptPasswordEncoder()

        val testUsers = mapOf(
            "admin" to "admin123",
            "manager" to "manager123",
            "user" to "user123"
        )

        println("\n" + "=".repeat(80))
        println("BCrypt Hashes for InvestPro Test Users (Cost 10)")
        println("=".repeat(80))

        testUsers.forEach { (username, password) ->
            val hash = passwordEncoder.encode(password)
            println("\nUsername: $username")
            println("Password: $password")
            println("BCrypt Hash: $hash")
            println("-".repeat(80))
        }

        println("\nSQL INSERT Statement for V3__seed_data.sql:")
        println("-".repeat(80))
        println("INSERT INTO users (username, password, email, full_name) VALUES")
        testUsers.entries.forEachIndexed { index, (username, password) ->
            val hash = passwordEncoder.encode(password)
            val comma = if (index < testUsers.size - 1) "," else ";"
            val email = when (username) {
                "admin" -> "admin@investpro.ma"
                "manager" -> "manager@investpro.ma"
                else -> "user@investpro.ma"
            }
            val fullName = when (username) {
                "admin" -> "Administrateur Système"
                "manager" -> "Manager Principal"
                else -> "Utilisateur Standard"
            }
            println("('$username', '$hash', '$email', '$fullName')$comma")
        }
        println("-".repeat(80))
    }
}
