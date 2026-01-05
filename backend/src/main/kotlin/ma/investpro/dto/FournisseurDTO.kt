package ma.investpro.dto

import java.time.LocalDateTime

/**
 * DTO pour Fournisseur - Entité simple sans relations circulaires
 */
data class FournisseurDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val identifiantFiscal: String?,
    val ice: String?,
    val adresse: String?,
    val ville: String?,
    val telephone: String?,
    val fax: String?,
    val email: String?,
    val contact: String?,
    val nonResident: Boolean,
    val remarques: String?,

    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Fournisseur - Utilisé dans les listes
 */
data class FournisseurSimpleDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val ice: String?,
    val actif: Boolean
)
