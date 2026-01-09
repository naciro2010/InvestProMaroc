package ma.investpro.dto

import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * DTO pour la création/modification d'un avenant de convention
 */
data class AvenantConventionRequest(
    @field:NotNull(message = "L'ID de la convention est obligatoire")
    val conventionId: Long,

    @field:NotBlank(message = "Le numéro d'avenant est obligatoire")
    @field:Size(max = 50, message = "Le numéro d'avenant ne peut pas dépasser 50 caractères")
    val numeroAvenant: String,

    @field:NotNull(message = "La date de l'avenant est obligatoire")
    val dateAvenant: LocalDate,

    @field:NotBlank(message = "L'objet de l'avenant est obligatoire")
    val objet: String,

    val motif: String? = null,

    // Snapshot des données avant (sérialisé depuis frontend)
    val donneesAvant: Map<String, Any?>? = null,

    // Modifications proposées
    val modifications: Map<String, Any?>? = null,

    val detailsModifications: String? = null,

    // Impacts financiers
    val ancienBudget: BigDecimal? = null,
    val nouveauBudget: BigDecimal? = null,
    val deltaBudget: BigDecimal? = null,
    val ancienTauxCommission: BigDecimal? = null,
    val nouveauTauxCommission: BigDecimal? = null,

    // Dates
    val dateEffet: LocalDate? = null,

    // Notes
    val remarques: String? = null,
    val fichierAvenant: String? = null
)

/**
 * DTO pour la soumission d'un avenant
 */
data class SoumettreAvenantRequest(
    @field:NotNull(message = "L'ID de l'avenant est obligatoire")
    val avenantId: Long
)

/**
 * DTO pour la validation d'un avenant
 */
data class ValiderAvenantRequest(
    @field:NotNull(message = "L'ID de l'avenant est obligatoire")
    val avenantId: Long,

    val remarques: String? = null,
    val dateEffet: LocalDate? = null
)

/**
 * DTO pour le rejet d'un avenant
 */
data class RejeterAvenantRequest(
    @field:NotNull(message = "L'ID de l'avenant est obligatoire")
    val avenantId: Long,

    @field:NotBlank(message = "Le motif de rejet est obligatoire")
    val motifRejet: String
)
