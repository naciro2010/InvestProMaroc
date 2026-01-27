package ma.investpro.service

import ma.investpro.dto.parametrage.ConventionConfigurationDTO
import ma.investpro.entity.ConventionConfiguration
import ma.investpro.entity.ConventionTypeConfiguration
import ma.investpro.entity.TypeConvention
import ma.investpro.repository.ConventionConfigurationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ConventionConfigurationService(
    private val configurationRepository: ConventionConfigurationRepository
) {
    @Transactional(readOnly = true)
    fun getConfiguration(): ConventionConfiguration {
        return configurationRepository.findFirstByOrderByIdAsc()
            ?: configurationRepository.save(createDefaultConfiguration())
    }

    @Transactional
    fun updateConfiguration(request: ConventionConfigurationDTO): ConventionConfiguration {
        val configuration = getConfiguration()

        configuration.codeMaskPattern = request.codeMaskPattern
        configuration.codeMaskPlaceholder = request.codeMaskPlaceholder
        configuration.numeroMaskPattern = request.numeroMaskPattern
        configuration.numeroMaskPlaceholder = request.numeroMaskPlaceholder

        val existingByType = configuration.typeConfigurations
            .associateBy { it.typeCode }
            .toMutableMap()

        request.typeConfigurations.forEach { dto ->
            val existing = existingByType[dto.typeCode]
            if (existing != null) {
                existing.libelle = dto.libelle
                existing.enabled = dto.enabled
                existing.ordreAffichage = dto.ordreAffichage
            } else {
                configuration.typeConfigurations.add(
                    ConventionTypeConfiguration(
                        typeCode = dto.typeCode,
                        libelle = dto.libelle,
                        enabled = dto.enabled,
                        ordreAffichage = dto.ordreAffichage,
                        configuration = configuration
                    )
                )
            }
        }

        return configurationRepository.save(configuration)
    }

    private fun createDefaultConfiguration(): ConventionConfiguration {
        val configuration = ConventionConfiguration()
        val typeConfigurations = TypeConvention.values().mapIndexed { index, type ->
            ConventionTypeConfiguration(
                typeCode = type.name,
                libelle = defaultLabelFor(type),
                enabled = type == TypeConvention.CADRE || type == TypeConvention.NON_CADRE,
                ordreAffichage = index,
                configuration = configuration
            )
        }
        configuration.typeConfigurations = typeConfigurations.toMutableList()
        return configuration
    }

    private fun defaultLabelFor(type: TypeConvention): String {
        return when (type) {
            TypeConvention.CADRE -> "Convention cadre"
            TypeConvention.NON_CADRE -> "Convention non-cadre"
            TypeConvention.SPECIFIQUE -> "Convention spécifique"
            TypeConvention.AVENANT -> "Convention avenant"
        }
    }
}
