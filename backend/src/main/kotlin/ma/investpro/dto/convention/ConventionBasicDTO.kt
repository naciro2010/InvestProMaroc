package ma.investpro.dto.convention

import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention

/**
 * Micro-DTO: Convention Basic Information
 *
 * Contains only essential identification data.
 * Used for fast initial page load (~5-10 KB payload).
 *
 * Follows micro-services architecture from CLAUDE.md:
 * - Small, focused DTO
 * - Single responsibility
 * - Lazy loading friendly
 */
data class ConventionBasicDTO(
    val id: Long,
    val code: String,
    val numero: String,
    val libelle: String,
    val objet: String?,
    val typeConvention: TypeConvention,
    val statut: StatutConvention,
    val createdBy: String?
)
