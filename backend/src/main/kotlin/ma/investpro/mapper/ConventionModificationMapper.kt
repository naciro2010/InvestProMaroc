package ma.investpro.mapper

import ma.investpro.dto.ConventionModificationDTO
import ma.investpro.entity.ConventionModification
import org.springframework.stereotype.Component

/**
 * Mapper pour ConventionModification Entity ↔ DTO
 */
@Component
class ConventionModificationMapper {

    /**
     * Convertit une entité ConventionModification en DTO
     */
    fun toDTO(entity: ConventionModification): ConventionModificationDTO {
        return ConventionModificationDTO(
            id = entity.id,
            conventionId = entity.convention.id!!,
            modifieParId = entity.modifiePar.id!!,
            modifieParNom = entity.modifiePar.fullName ?: entity.modifiePar.username,
            dateModification = entity.dateModification,
            motifModification = entity.motifModification,
            donneesAvant = entity.donneesAvant,
            donneesApres = entity.donneesApres,
            champsModifies = entity.champsModifies,
            typeModification = entity.typeModification,
            createdAt = entity.createdAt
        )
    }

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    fun toDTOList(entities: List<ConventionModification>): List<ConventionModificationDTO> {
        return entities.map { modification: ConventionModification -> toDTO(modification) }
    }
}
