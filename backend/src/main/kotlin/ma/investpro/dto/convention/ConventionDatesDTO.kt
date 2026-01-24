package ma.investpro.dto.convention

import java.time.LocalDate

/**
 * Micro-DTO: Convention Dates Information
 *
 * Contains all date-related fields for the convention.
 * Loaded lazily when user expands dates section (~2-3 KB payload).
 *
 * Follows micro-services architecture from CLAUDE.md:
 * - Focused on dates only
 * - Small payload for fast loading
 * - Can be cached independently
 */
data class ConventionDatesDTO(
    val id: Long,
    val dateConvention: LocalDate, // Date de signature
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val dateSoumission: LocalDate?,
    val dateValidation: LocalDate?,
    val dureeJours: Long? = null, // Calculated: date fin - date début (en jours)
    val estActive: Boolean = false // Calculated: aujourd'hui entre dateDebut et dateFin
)
