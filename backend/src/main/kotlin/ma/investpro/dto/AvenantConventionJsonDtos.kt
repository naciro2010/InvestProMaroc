package ma.investpro.dto

import java.math.BigDecimal

/**
 * Convention snapshot stored in JSONB when creating an amendment.
 * Preserves the complete state of the convention before amendments are applied.
 */
data class ConventionSnapshot(
    val id: Long? = null,
    val code: String = "",
    val numero: String = "",
    val dateConvention: String = "",
    val typeConvention: String = "",
    val libelle: String = "",
    val objet: String = "",
    val budget: BigDecimal? = null,
    val tauxCommission: BigDecimal? = null,
    val dateDebut: String = "",
    val dateFin: String? = null,
    val statut: String = "",
    val createdAt: String? = null,
    val updatedAt: String? = null
)

/**
 * Modifications made by an amendment to the convention.
 * Only includes fields that were actually changed.
 */
data class ConventionModifications(
    val budget: BigDecimal? = null,
    val tauxCommission: BigDecimal? = null,
    val libelle: String? = null,
    val objet: String? = null,
    val dateDebut: String? = null,
    val dateFin: String? = null
)
