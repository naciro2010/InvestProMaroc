package ma.investpro.dto

import java.time.LocalDateTime

/**
 * DTO for Partenaire entity
 * Used for API responses
 */
data class PartenaireDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val typePartenaire: String?,
    val email: String?,
    val telephone: String?,
    val adresse: String?,
    val description: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

/**
 * Simplified DTO for dropdown/select components
 */
data class PartenaireSimpleDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val actif: Boolean
)
