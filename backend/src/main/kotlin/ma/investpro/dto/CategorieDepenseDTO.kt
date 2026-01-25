package ma.investpro.dto

import java.time.LocalDateTime

/**
 * DTO for CategorieDepense entity
 */
data class CategorieDepenseDTO(
    val id: Long? = null,
    val code: String,
    val libelle: String,
    val description: String? = null,
    val categorie: String? = null,
    val ordreAffichage: Int? = null,
    val actif: Boolean = true,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

/**
 * DTO for creating a new CategorieDepense
 */
data class CreateCategorieDepenseDTO(
    val code: String,
    val libelle: String,
    val description: String? = null,
    val categorie: String? = null,
    val ordreAffichage: Int? = null
)

/**
 * DTO for updating an existing CategorieDepense
 */
data class UpdateCategorieDepenseDTO(
    val code: String? = null,
    val libelle: String? = null,
    val description: String? = null,
    val categorie: String? = null,
    val ordreAffichage: Int? = null,
    val actif: Boolean? = null
)

/**
 * Minimal DTO for dropdown lists (optimized payload)
 */
data class CategorieDepenseListDTO(
    val id: Long,
    val code: String,
    val libelle: String,
    val categorie: String? = null
)
