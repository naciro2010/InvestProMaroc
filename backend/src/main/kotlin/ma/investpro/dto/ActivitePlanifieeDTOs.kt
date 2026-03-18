package ma.investpro.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.time.LocalDateTime

data class ActivitePlanifieeResponse(
    val id: Long,
    val conventionId: Long,
    val typeActivite: String,
    val titre: String,
    val datePrevue: LocalDate,
    val note: String?,
    val fait: Boolean,
    val createdByName: String?,
    val createdAt: LocalDateTime?,
)

data class CreateActivitePlanifieeRequest(
    @field:NotBlank(message = "Le type d'activité est requis")
    @field:Size(max = 20, message = "Le type ne peut pas dépasser 20 caractères")
    val typeActivite: String,

    @field:NotBlank(message = "Le titre est requis")
    @field:Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    val titre: String,

    @field:NotNull(message = "La date prévue est requise")
    val datePrevue: LocalDate,

    @field:Size(max = 500, message = "La note ne peut pas dépasser 500 caractères")
    val note: String? = null,
)

data class UpdateActivitePlanifieeRequest(
    @field:Size(max = 20, message = "Le type ne peut pas dépasser 20 caractères")
    val typeActivite: String? = null,

    @field:Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    val titre: String? = null,

    val datePrevue: LocalDate? = null,

    @field:Size(max = 500, message = "La note ne peut pas dépasser 500 caractères")
    val note: String? = null,

    val fait: Boolean? = null,
)
