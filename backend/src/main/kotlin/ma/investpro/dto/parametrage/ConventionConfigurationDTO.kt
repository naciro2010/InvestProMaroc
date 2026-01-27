package ma.investpro.dto.parametrage

import jakarta.validation.constraints.NotBlank


data class ConventionTypeConfigurationDTO(
    val typeCode: String,
    val libelle: String,
    val enabled: Boolean,
    val ordreAffichage: Int
)

data class ConventionConfigurationDTO(
    @field:NotBlank
    val codeMaskPattern: String,
    @field:NotBlank
    val codeMaskPlaceholder: String,
    @field:NotBlank
    val numeroMaskPattern: String,
    @field:NotBlank
    val numeroMaskPlaceholder: String,
    val typeConfigurations: List<ConventionTypeConfigurationDTO>
)
