package ma.investpro.mapper

import ma.investpro.dto.ConventionPartenaireDTO
import ma.investpro.entity.ConventionPartenaire
import org.springframework.stereotype.Component

/**
 * Mapper pour ConventionPartenaire
 * Convertit entre Entity et DTO
 */
@Component
class ConventionPartenaireMapper {

    /**
     * Convertit une entité en DTO
     */
    fun toDTO(entity: ConventionPartenaire): ConventionPartenaireDTO {
        val convention = entity.convention
        val partenaire = entity.partenaire

        return ConventionPartenaireDTO(
            id = entity.id,
            conventionId = convention?.id ?: 0L,
            partenaireId = partenaire?.id ?: 0L,
            partenaireCode = partenaire?.code ?: "",
            partenaireNom = partenaire?.raisonSociale ?: "",
            partenaireSigle = partenaire?.sigle,
            budgetAlloue = entity.budgetAlloue,
            pourcentage = entity.pourcentage,
            commissionIntervention = entity.commissionIntervention,
            estMaitreOeuvre = entity.estMaitreOeuvre,
            estMaitreOeuvreDelegue = entity.estMaitreOeuvreDelegue,
            remarques = entity.remarques,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    fun toDTOList(entities: List<ConventionPartenaire>): List<ConventionPartenaireDTO> {
        return entities.map { entity: ConventionPartenaire -> toDTO(entity) }
    }
}
