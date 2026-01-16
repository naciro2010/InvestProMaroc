package ma.investpro.dto

import ma.investpro.entity.TypeMaitreOeuvre
import java.time.LocalDateTime

/**
 * DTO pour la création/mise à jour d'un Maître d'Œuvre
 */
data class MaitreOeuvreRequest(
    val conventionId: Long,
    val code: String,
    val designation: String,
    val typeMo: TypeMaitreOeuvre,
    val email: String? = null,
    val telephone: String? = null,
    val adresse: String? = null,
    val organisme: String? = null,
    val missions: String? = null
)

/**
 * DTO pour la réponse d'un Maître d'Œuvre
 */
data class MaitreOeuvreResponse(
    val id: Long,
    val conventionId: Long,
    val conventionCode: String,
    val code: String,
    val designation: String,
    val typeMo: TypeMaitreOeuvre,
    val email: String?,
    val telephone: String?,
    val adresse: String?,
    val organisme: String?,
    val missions: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val actif: Boolean
)

/**
 * DTO simple pour listes
 */
data class MaitreOeuvreSummary(
    val id: Long,
    val code: String,
    val designation: String,
    val typeMo: TypeMaitreOeuvre,
    val email: String?,
    val telephone: String?
)
