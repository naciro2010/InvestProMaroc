package ma.investpro.mapper

import ma.investpro.dto.AvenantDTO
import ma.investpro.entity.Avenant
import org.springframework.stereotype.Component

@Component
class AvenantMapper {

    fun toDTO(entity: Avenant): AvenantDTO {
        return AvenantDTO(
            id = entity.id,
            conventionId = entity.convention.id ?: 0,
            conventionNumero = entity.convention.numero,
            conventionLibelle = entity.convention.libelle,
            numeroAvenant = entity.numeroAvenant,
            dateAvenant = entity.dateAvenant,
            dateSignature = entity.dateSignature,
            statut = entity.statut.name,
            versionResultante = entity.versionResultante,
            objet = entity.objet,
            montantAvant = entity.montantAvant,
            tauxCommissionAvant = entity.tauxCommissionAvant,
            dateFinAvant = entity.dateFinAvant,
            montantApres = entity.montantApres,
            tauxCommissionApres = entity.tauxCommissionApres,
            dateFinApres = entity.dateFinApres,
            impactMontant = entity.impactMontant,
            impactCommission = entity.impactCommission,
            impactDelaiJours = entity.impactDelaiJours,
            justification = entity.justification,
            details = entity.details,
            dateValidation = entity.dateValidation,
            valideParId = entity.valideParId,
            isLocked = entity.isLocked,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    fun toDTOList(entities: List<Avenant>): List<AvenantDTO> {
        return entities.map { toDTO(it) }
    }
}
