package ma.investpro.dto.convention

import java.math.BigDecimal

/**
 * Micro-DTO: Convention Statistics and Metrics
 *
 * Contains aggregated statistics about the convention including
 * commission breakdown (HT/TVA/TTC) and budget tracking.
 * Loaded lazily for dashboard/analytics display (~5 KB payload).
 *
 * Follows micro-services architecture from CLAUDE.md:
 * - Focused on calculated metrics
 * - Aggregated data from related entities
 * - Optimized for analytics/reporting
 */
data class ConventionStatsDTO(
    val id: Long,
    val nombreProjets: Long = 0,
    val nombreMarches: Long = 0,
    val nombreSousConventions: Long = 0,
    val montantTotalProjets: BigDecimal = BigDecimal.ZERO,
    val montantTotalMarches: BigDecimal = BigDecimal.ZERO,     // Total marches TTC
    val montantTotalMarchesHt: BigDecimal = BigDecimal.ZERO,   // Total marches HT
    val tauxRealisation: BigDecimal = BigDecimal.ZERO,         // % du budget consomme (TTC / budget)

    // Commission breakdown on actual engagements
    val commissionTotale: BigDecimal = BigDecimal.ZERO,        // = commissionTTC (backward compat)
    val commissionHT: BigDecimal = BigDecimal.ZERO,            // Commission HT sur engagements
    val commissionTVA: BigDecimal = BigDecimal.ZERO,           // TVA sur commission
    val commissionTTC: BigDecimal = BigDecimal.ZERO,           // Commission TTC (HT + TVA)

    // Budget tracking
    val commissionEstimeeBudget: BigDecimal = BigDecimal.ZERO, // Commission estimee sur budget total
    val resteAEngager: BigDecimal = BigDecimal.ZERO,           // Budget restant a engager

    // Effective rates (after sous-convention inheritance)
    val tauxCommissionEffectif: BigDecimal = BigDecimal.ZERO,
    val baseCalculEffective: String = "DECAISSEMENTS_TTC"
)
