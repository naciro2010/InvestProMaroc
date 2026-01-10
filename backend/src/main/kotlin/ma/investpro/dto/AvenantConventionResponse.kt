package ma.investpro.dto

import ma.investpro.entity.StatutAvenantConvention
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO de réponse pour un avenant de convention
 */
data class AvenantConventionResponse(
    val id: Long,
    val conventionId: Long,
    val conventionNumero: String, // Numéro de la convention parente
    val conventionLibelle: String, // Libellé de la convention parente

    // Identification
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val objet: String,
    val motif: String?,

    // Workflow
    val statut: StatutAvenantConvention,

    // Données et modifications
    val donneesAvant: Map<String, Any?>?,
    val modifications: Map<String, Any?>?,
    val detailsModifications: String?,

    // Impacts financiers
    val ancienBudget: BigDecimal?,
    val nouveauBudget: BigDecimal?,
    val deltaBudget: BigDecimal?,
    val ancienTauxCommission: BigDecimal?,
    val nouveauTauxCommission: BigDecimal?,

    // Dates workflow
    val dateSoumission: LocalDate?,
    val dateValidation: LocalDate?,
    val dateEffet: LocalDate?,

    // Utilisateurs workflow
    val createdById: Long?,
    val createdByName: String?,
    val soumisParId: Long?,
    val soumisParName: String?,
    val valideParId: Long?,
    val valideParName: String?,

    // Notes
    val remarques: String?,
    val motifRejet: String?,

    // Pièce jointe
    val fichierAvenant: String?,

    // Ordre
    val ordreApplication: Int?,

    // Audit
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,

    // Flags calculés
    val isEditable: Boolean,
    val canSoumettre: Boolean,
    val canValider: Boolean,
    val isValide: Boolean
)

/**
 * DTO résumé pour liste d'avenants
 */
data class AvenantConventionSummary(
    val id: Long,
    val conventionId: Long,
    val conventionNumero: String,
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val objet: String,
    val statut: StatutAvenantConvention,
    val deltaBudget: BigDecimal?,
    val createdByName: String?,
    val ordreApplication: Int?,
    val createdAt: LocalDateTime
)

/**
 * DTO pour les statistiques des avenants
 */
data class AvenantStatistics(
    val totalAvenants: Int,
    val brouillons: Int,
    val soumis: Int,
    val valides: Int,
    val totalDeltaBudget: Double
)
