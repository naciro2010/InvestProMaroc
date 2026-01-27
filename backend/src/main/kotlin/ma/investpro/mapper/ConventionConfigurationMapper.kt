package ma.investpro.mapper

import ma.investpro.dto.parametrage.ConventionConfigurationDTO
import ma.investpro.dto.parametrage.ConventionTypeConfigurationDTO
import ma.investpro.entity.ConventionConfiguration
import ma.investpro.entity.ConventionTypeConfiguration
import org.springframework.stereotype.Component

@Component
class ConventionConfigurationMapper {
    fun toDTO(entity: ConventionConfiguration): ConventionConfigurationDTO {
        return ConventionConfigurationDTO(
            codeMaskPattern = entity.codeMaskPattern,
            codeMaskPlaceholder = entity.codeMaskPlaceholder,
            numeroMaskPattern = entity.numeroMaskPattern,
            numeroMaskPlaceholder = entity.numeroMaskPlaceholder,
            typeConfigurations = entity.typeConfigurations
                .sortedBy { it.ordreAffichage }
                .map { toTypeDTO(it) }
        )
    }

    private fun toTypeDTO(entity: ConventionTypeConfiguration): ConventionTypeConfigurationDTO {
        return ConventionTypeConfigurationDTO(
            typeCode = entity.typeCode,
            libelle = entity.libelle,
            enabled = entity.enabled,
            ordreAffichage = entity.ordreAffichage
        )
    }
}
