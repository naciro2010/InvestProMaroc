package ma.investpro.dto.convention

import java.math.BigDecimal

/**
 * Micro-DTO: Convention Financial Information
 *
 * Contains all financial data for the convention.
 * Loaded lazily when user expands financial section (~3-5 KB payload).
 *
 * Follows micro-services architecture from CLAUDE.md:
 * - Focused on financial data only
 * - Can be cached independently
 * - Supports lazy loading pattern
 */
data class ConventionFinancesDTO(
    val id: Long,
    val tauxCommission: BigDecimal,
    val budget: BigDecimal,
    val baseCalcul: String,
    val tauxTva: BigDecimal,
    val tauxTvaLignes: BigDecimal,
    val montantCommissionEstime: BigDecimal? = null // Calculated field
)
