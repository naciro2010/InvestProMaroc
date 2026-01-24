package ma.investpro.dto.convention

import java.math.BigDecimal

/**
 * Micro-DTO: Convention Statistics and Metrics
 *
 * Contains aggregated statistics about the convention.
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
    val montantTotalMarches: BigDecimal = BigDecimal.ZERO,
    val tauxRealisation: BigDecimal = BigDecimal.ZERO, // % of budget consumed
    val commissionTotale: BigDecimal = BigDecimal.ZERO // Total commission earned
)
