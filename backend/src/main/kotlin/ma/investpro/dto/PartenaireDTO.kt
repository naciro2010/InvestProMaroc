package ma.investpro.dto

import java.time.LocalDateTime

/**
 * DTO pour Partenaire - Entité simple sans relations circulaires
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

    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Partenaire - Utilisé dans les listes
 */
data class PartenaireSimpleDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val actif: Boolean
)
