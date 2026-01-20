package ma.investpro.dto

/**
 * Réponse API standardisée avec factory methods
 */
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
) {
    companion object {
        /**
         * Créer une réponse de succès avec données
         */
        fun <T> success(data: T, message: String = "Opération réussie"): ApiResponse<T> {
            return ApiResponse(success = true, message = message, data = data)
        }

        /**
         * Créer une réponse d'erreur sans données
         */
        fun <T> error(message: String): ApiResponse<T> {
            return ApiResponse(success = false, message = message, data = null)
        }
    }
}
