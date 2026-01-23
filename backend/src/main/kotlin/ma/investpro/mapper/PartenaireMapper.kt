package ma.investpro.mapper

import ma.investpro.dto.PartenaireDTO
import ma.investpro.dto.PartenaireSimpleDTO
import ma.investpro.entity.Partenaire
import org.springframework.stereotype.Component

@Component
class PartenaireMapper {

    /**
     * Convert Partenaire entity to PartenaireDTO
     */
    fun toDTO(entity: Partenaire): PartenaireDTO {
        return PartenaireDTO(
            id = entity.id,
            code = entity.code,
            raisonSociale = entity.raisonSociale,
            sigle = entity.sigle,
            typePartenaire = entity.typePartenaire,
            email = entity.email,
            telephone = entity.telephone,
            adresse = entity.adresse,
            description = entity.description,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convert list of Partenaire entities to list of PartenaireDTOs
     */
    fun toDTOList(entities: List<Partenaire>): List<PartenaireDTO> {
        return entities.map { entity: Partenaire -> toDTO(entity) }
    }

    /**
     * Convert Partenaire entity to PartenaireSimpleDTO (for dropdowns)
     */
    fun toSimpleDTO(entity: Partenaire): PartenaireSimpleDTO {
        return PartenaireSimpleDTO(
            id = entity.id,
            code = entity.code,
            raisonSociale = entity.raisonSociale,
            sigle = entity.sigle,
            actif = entity.actif
        )
    }

    /**
     * Convert list of Partenaire entities to list of PartenaireSimpleDTOs
     */
    fun toSimpleDTOList(entities: List<Partenaire>): List<PartenaireSimpleDTO> {
        return entities.map { entity: Partenaire -> toSimpleDTO(entity) }
    }
}
