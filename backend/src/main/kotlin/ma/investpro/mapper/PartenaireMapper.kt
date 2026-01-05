package ma.investpro.mapper

import ma.investpro.dto.PartenaireDTO
import ma.investpro.dto.PartenaireSimpleDTO
import ma.investpro.entity.Partenaire
import org.springframework.stereotype.Component

@Component
class PartenaireMapper {

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
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    fun toSimpleDTO(entity: Partenaire): PartenaireSimpleDTO {
        return PartenaireSimpleDTO(
            id = entity.id,
            code = entity.code,
            raisonSociale = entity.raisonSociale,
            sigle = entity.sigle,
            actif = entity.actif
        )
    }

    fun toDTOList(entities: List<Partenaire>): List<PartenaireDTO> {
        return entities.map { toDTO(it) }
    }

    fun toSimpleDTOList(entities: List<Partenaire>): List<PartenaireSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}
