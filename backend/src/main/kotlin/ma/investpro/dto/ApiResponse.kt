package ma.investpro.dto

/**
 * Réponse API standardisée
 */
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)
