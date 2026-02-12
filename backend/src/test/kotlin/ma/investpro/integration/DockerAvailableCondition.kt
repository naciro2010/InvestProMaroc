package ma.investpro.integration

import org.junit.jupiter.api.extension.ConditionEvaluationResult
import org.junit.jupiter.api.extension.ExecutionCondition
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.extension.ExtensionContext

/**
 * JUnit 5 ExecutionCondition that gracefully skips tests when Docker is not available
 * or when the Docker API version is incompatible with Testcontainers.
 *
 * This prevents CI failures when Docker is unavailable or has an incompatible API version
 * (e.g., "client version 1.32 is too old. Minimum supported API version is 1.44").
 *
 * Usage: Apply @EnabledIfDockerAvailable on test classes that use Testcontainers.
 */
class DockerAvailableCondition : ExecutionCondition {

    override fun evaluateExecutionCondition(context: ExtensionContext): ConditionEvaluationResult {
        return if (isDockerAvailable) {
            ConditionEvaluationResult.enabled("Docker is available and compatible")
        } else {
            ConditionEvaluationResult.disabled(
                "Docker is not available or API version is incompatible with Testcontainers. " +
                    "Skipping integration tests that require Docker."
            )
        }
    }

    companion object {
        /**
         * Lazily checks Docker availability. The result is cached after the first check
         * so that multiple test classes don't repeatedly probe Docker.
         */
        val isDockerAvailable: Boolean by lazy {
            try {
                org.testcontainers.DockerClientFactory.instance().isDockerAvailable
            } catch (ex: Exception) {
                System.err.println(
                    "Docker availability check failed: ${ex.message}. " +
                        "Testcontainers integration tests will be skipped."
                )
                false
            }
        }
    }
}

/**
 * Annotation to conditionally enable test classes only when Docker is available.
 *
 * Apply this to any test class that uses Testcontainers. When Docker is not available
 * or the Docker API version is incompatible, all tests in the annotated class will be
 * gracefully skipped instead of failing.
 *
 * Example:
 * ```kotlin
 * @EnabledIfDockerAvailable
 * class MyIntegrationTest : PostgresIntegrationTest() {
 *     @Test
 *     fun `my test`() { ... }
 * }
 * ```
 */
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@ExtendWith(DockerAvailableCondition::class)
annotation class EnabledIfDockerAvailable
