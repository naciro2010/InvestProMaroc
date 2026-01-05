package ma.investpro.dto

import ma.investpro.entity.StatutAvenant
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO pour Avenant - Sans référence circulaire à Convention
 */
data class AvenantDTO(
    val id: Long?,

    // Convention parent : ID seulement
    val conventionId: Long,
    val conventionNumero: String?,
    val conventionLibelle: String?,

    // Identification
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val dateSignature: LocalDate?,
    val statut: StatutAvenant,
    val versionResultante: String,
    val objet: String,

    // Valeurs AVANT
    val montantAvant: BigDecimal?,
    val tauxCommissionAvant: BigDecimal?,
    val dateFinAvant: LocalDate?,

    // Valeurs APRÈS
    val montantApres: BigDecimal?,
    val tauxCommissionApres: BigDecimal?,
    val dateFinApres: LocalDate?,

    // Impacts
    val impactMontant: BigDecimal?,
    val impactCommission: BigDecimal?,
    val impactDelaiJours: Int?,

    val justification: String?,
    val details: String?,

    // Workflow
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val isLocked: Boolean,

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Avenant
 */
data class AvenantSimpleDTO(
    val id: Long?,
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val statut: StatutAvenant,
    val versionResultante: String,
    val objet: String,
    val actif: Boolean
)
