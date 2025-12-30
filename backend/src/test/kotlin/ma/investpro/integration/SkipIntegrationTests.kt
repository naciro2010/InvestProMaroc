package ma.investpro.integration

/**
 * Configuration pour désactiver les tests d'intégration
 * Les tests d'intégraation Testcontainers ne sont pas disponibles sur tous les systèmes
 * Utilisez: ./gradlew test -x ma.investpro.integration.*
 * Ou: ./gradlew build -x test
 */

import org.junit.jupiter.api.Disabled

// These tests require Testcontainers and Docker to be running
// They are disabled by default for CI/CD environments

@Disabled("Testcontainers configuration not available in this environment")
class DisabledIntegrationTests
