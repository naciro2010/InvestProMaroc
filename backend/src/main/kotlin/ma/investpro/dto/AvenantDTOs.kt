package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Avenant DTOs
data class ConsolidatedVersionResponse(
    val convention: ConventionDTO,
    val versionActuelle: String,
    val avenants: List<AvenantDTO>,
    val nombreAvenants: Int,
    val montantActuel: BigDecimal,
    val tauxCommissionActuel: BigDecimal,
    val dateFinActuelle: LocalDate?
)

data class AvenantDTO(
    val id: Long?,
    val conventionId: Long,
    val conventionNumero: String?,
    val conventionLibelle: String?,
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val dateSignature: LocalDate?,
    val statut: String,
    val versionResultante: String,
    val objet: String,
    val montantAvant: BigDecimal?,
    val tauxCommissionAvant: BigDecimal?,
    val dateFinAvant: LocalDate?,
    val montantApres: BigDecimal?,
    val tauxCommissionApres: BigDecimal?,
    val dateFinApres: LocalDate?,
    val impactMontant: BigDecimal?,
    val impactCommission: BigDecimal?,
    val impactDelaiJours: Int?,
    val justification: String?,
    val details: String?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val isLocked: Boolean,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class VersionHistoryEntry(
    val version: String,
    val date: LocalDate?,
    val type: String,
    val objet: String? = null,
    val montant: BigDecimal? = null,
    val tauxCommission: BigDecimal? = null,
    val dateFin: LocalDate? = null,
    val impactMontant: BigDecimal? = null,
    val impactDelai: Int? = null
)
