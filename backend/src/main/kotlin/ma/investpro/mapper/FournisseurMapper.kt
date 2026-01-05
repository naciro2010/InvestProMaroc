package ma.investpro.mapper

import ma.investpro.dto.FournisseurDTO
import ma.investpro.dto.FournisseurSimpleDTO
import ma.investpro.entity.Fournisseur
import org.springframework.stereotype.Component

@Component
class FournisseurMapper {

    fun toDTO(entity: Fournisseur): FournisseurDTO {
        return FournisseurDTO(
            id = entity.id,
            code = entity.code,
            raisonSociale = entity.raisonSociale,
            identifiantFiscal = entity.identifiantFiscal,
            ice = entity.ice,
            adresse = entity.adresse,
            ville = entity.ville,
            telephone = entity.telephone,
            fax = entity.fax,
            email = entity.email,
            contact = entity.contact,
            nonResident = entity.nonResident,
            remarques = entity.remarques,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            createdBy = entity.createdBy,
            updatedBy = entity.updatedBy,
            actif = entity.actif
        )
    }

    fun toSimpleDTO(entity: Fournisseur): FournisseurSimpleDTO {
        return FournisseurSimpleDTO(
            id = entity.id,
            code = entity.code,
            raisonSociale = entity.raisonSociale,
            ice = entity.ice,
            actif = entity.actif
        )
    }

    fun toDTOList(entities: List<Fournisseur>): List<FournisseurDTO> {
        return entities.map { toDTO(it) }
    }

    fun toSimpleDTOList(entities: List<Fournisseur>): List<FournisseurSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}
