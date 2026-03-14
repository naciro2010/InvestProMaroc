package ma.investpro.dto.convention

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * Micro-DTO: Convention Detail Enriched
 *
 * Aggregated DTO combining audit, counts, financial summaries,
 * effective rates, duration, and workflow info for the Odoo-inspired
 * convention detail page.
 *
 * This endpoint exists so the detail page can fetch all the enriched
 * metadata in a single call instead of hitting 4 separate micro-endpoints.
 * Payload: ~10-15 KB.
 */
data class ConventionDetailEnrichedDTO(
    val id: Long,

    // --- Audit info ---
    val createdByNom: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val valideParNom: String?,
    val dateValidation: LocalDate?,
    val dateSoumission: LocalDate?,

    // --- Counts of related entities ---
    val nombreMarches: Long,
    val nombreProjets: Long,
    val nombreSousConventions: Long,
    val nombreAvenants: Long,
    val nombrePartenaires: Long,

    // --- Financial summaries ---
    val montantTotalMarches: BigDecimal,       // Total marches TTC
    val montantTotalMarchesHt: BigDecimal,     // Total marches HT
    val montantTotalProjets: BigDecimal,
    val tauxRealisation: BigDecimal,
    val commissionEstimee: BigDecimal,         // Commission HT sur engagements
    val commissionTVA: BigDecimal,             // TVA sur commission
    val commissionTTC: BigDecimal,             // Commission TTC (HT + TVA)
    val commissionEstimeeBudget: BigDecimal,   // Commission estimee sur budget total
    val resteAEngager: BigDecimal,             // Budget - total marches TTC

    // --- Effective rates (after inheritance) ---
    val tauxCommissionEffectif: BigDecimal,
    val baseCalculEffective: String,

    // --- Duration info ---
    val dureeJours: Long?,
    val estActive: Boolean,

    // --- Workflow info ---
    val motifRejet: String?,
    val isLocked: Boolean,
    val version: String?
)
