package ma.investpro.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

/**
 * DTO for Partenaire entity
 * Used for API responses
 */
data class PartenaireDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val typePartenaire: String?,
    val email: String?,
    val telephone: String?,
    val adresse: String?,
    val description: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

/**
 * Simplified DTO for dropdown/select components
 */
data class PartenaireSimpleDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val actif: Boolean
)

/**
 * DTO for creating a new Partenaire
 */
data class CreatePartenaireDTO(
    @field:NotBlank(message = "Le code est requis")
    @field:Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    @field:Pattern(regexp = "^[A-Z0-9-]+$", message = "Le code doit contenir uniquement des majuscules, chiffres et tirets")
    val code: String,

    @field:NotBlank(message = "La raison sociale est requise")
    @field:Size(max = 200, message = "La raison sociale ne peut pas dépasser 200 caractères")
    val raisonSociale: String,

    @field:Size(max = 50, message = "Le sigle ne peut pas dépasser 50 caractères")
    val sigle: String? = null,

    @field:Size(max = 100, message = "Le type de partenaire ne peut pas dépasser 100 caractères")
    val typePartenaire: String? = null,

    @field:Email(message = "Email invalide")
    @field:Size(max = 100, message = "L'email ne peut pas dépasser 100 caractères")
    val email: String? = null,

    @field:Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    val telephone: String? = null,

    @field:Size(max = 500, message = "L'adresse ne peut pas dépasser 500 caractères")
    val adresse: String? = null,

    val description: String? = null
)

/**
 * DTO for updating an existing Partenaire
 */
data class UpdatePartenaireDTO(
    @field:Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    @field:Pattern(regexp = "^[A-Z0-9-]+$", message = "Le code doit contenir uniquement des majuscules, chiffres et tirets")
    val code: String? = null,

    @field:Size(max = 200, message = "La raison sociale ne peut pas dépasser 200 caractères")
    val raisonSociale: String? = null,

    @field:Size(max = 50, message = "Le sigle ne peut pas dépasser 50 caractères")
    val sigle: String? = null,

    @field:Size(max = 100, message = "Le type de partenaire ne peut pas dépasser 100 caractères")
    val typePartenaire: String? = null,

    @field:Email(message = "Email invalide")
    @field:Size(max = 100, message = "L'email ne peut pas dépasser 100 caractères")
    val email: String? = null,

    @field:Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    val telephone: String? = null,

    @field:Size(max = 500, message = "L'adresse ne peut pas dépasser 500 caractères")
    val adresse: String? = null,

    val description: String? = null,

    val actif: Boolean? = null
)
