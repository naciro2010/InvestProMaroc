package ma.investpro.mapper

import ma.investpro.dto.CreatePartenaireDTO
import ma.investpro.dto.PartenaireDTO
import ma.investpro.dto.PartenaireSimpleDTO
import ma.investpro.dto.UpdatePartenaireDTO
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

    /**
     * Convert CreatePartenaireDTO to Partenaire entity
     */
    fun toEntity(dto: CreatePartenaireDTO): Partenaire {
        return Partenaire(
            code = dto.code,
            raisonSociale = dto.raisonSociale,
            sigle = dto.sigle,
            typePartenaire = dto.typePartenaire,
            email = dto.email,
            telephone = dto.telephone,
            adresse = dto.adresse,
            description = dto.description
        ).apply {
            actif = true
        }
    }

    /**
     * Update existing Partenaire entity from UpdatePartenaireDTO
     */
    fun updateEntityFromDTO(dto: UpdatePartenaireDTO, entity: Partenaire) {
        dto.code?.let { entity.code = it }
        dto.raisonSociale?.let { entity.raisonSociale = it }
        dto.sigle?.let { entity.sigle = it }
        dto.typePartenaire?.let { entity.typePartenaire = it }
        dto.email?.let { entity.email = it }
        dto.telephone?.let { entity.telephone = it }
        dto.adresse?.let { entity.adresse = it }
        dto.description?.let { entity.description = it }
        dto.actif?.let { entity.actif = it }
    }
}
