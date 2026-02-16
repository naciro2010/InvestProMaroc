package ma.investpro.mapper

import ma.investpro.dto.CreateFournisseurDTO
import ma.investpro.dto.FournisseurDTO
import ma.investpro.dto.FournisseurSimpleDTO
import ma.investpro.dto.UpdateFournisseurDTO
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

    fun toEntity(dto: CreateFournisseurDTO): Fournisseur {
        return Fournisseur(
            code = dto.code,
            raisonSociale = dto.raisonSociale,
            identifiantFiscal = dto.identifiantFiscal,
            ice = dto.ice,
            adresse = dto.adresse,
            ville = dto.ville,
            telephone = dto.telephone,
            fax = dto.fax,
            email = dto.email,
            contact = dto.contact,
            nonResident = dto.nonResident,
            remarques = dto.remarques
        )
    }

    fun updateEntityFromDTO(dto: UpdateFournisseurDTO, entity: Fournisseur) {
        dto.raisonSociale?.let { entity.raisonSociale = it }
        dto.identifiantFiscal?.let { entity.identifiantFiscal = it }
        dto.ice?.let { entity.ice = it }
        dto.adresse?.let { entity.adresse = it }
        dto.ville?.let { entity.ville = it }
        dto.telephone?.let { entity.telephone = it }
        dto.fax?.let { entity.fax = it }
        dto.email?.let { entity.email = it }
        dto.contact?.let { entity.contact = it }
        dto.nonResident?.let { entity.nonResident = it }
        dto.remarques?.let { entity.remarques = it }
    }

    fun toDTOList(entities: List<Fournisseur>): List<FournisseurDTO> {
        return entities.map { toDTO(it) }
    }

    fun toSimpleDTOList(entities: List<Fournisseur>): List<FournisseurSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}
