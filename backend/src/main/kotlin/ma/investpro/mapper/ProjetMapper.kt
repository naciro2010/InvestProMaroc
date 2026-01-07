package ma.investpro.mapper

import ma.investpro.dto.ProjetDTO
import ma.investpro.dto.ProjetSimpleDTO
import ma.investpro.entity.Projet
import org.springframework.stereotype.Component

/**
 * Mapper pour convertir Projet Entity ↔ DTO
 */
@Component
class ProjetMapper {

    /**
     * Convertit une entité Projet en DTO complet
     */
    fun toDTO(entity: Projet): ProjetDTO {
        return ProjetDTO(
            id = entity.id,
            code = entity.code,
            nom = entity.nom,
            description = entity.description,
            conventionId = entity.convention?.id,
            conventionNumero = entity.convention?.numero,
            conventionLibelle = entity.convention?.libelle,
            budgetTotal = entity.budgetTotal,
            dateDebut = entity.dateDebut,
            dateFinPrevue = entity.dateFinPrevue,
            dateFinReelle = entity.dateFinReelle,
            dureeMois = entity.dureeMois,
            chefProjetId = entity.chefProjet?.id,
            chefProjetNom = entity.chefProjet?.raisonSociale,
            statut = entity.statut.name,
            pourcentageAvancement = entity.pourcentageAvancement,
            localisation = entity.localisation,
            objectifs = entity.objectifs,
            remarques = entity.remarques,
            estEnRetard = entity.estEnRetard(),
            estActif = entity.estActif(),
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une entité Projet en DTO simplifié
     */
    fun toSimpleDTO(entity: Projet): ProjetSimpleDTO {
        return ProjetSimpleDTO(
            id = entity.id,
            code = entity.code,
            nom = entity.nom,
            statut = entity.statut.name,
            budgetTotal = entity.budgetTotal,
            dateDebut = entity.dateDebut,
            dateFinPrevue = entity.dateFinPrevue,
            pourcentageAvancement = entity.pourcentageAvancement,
            actif = entity.actif
        )
    }

    /**
     * Convertit une liste d'entités en liste de DTOs complets
     */
    fun toDTOList(entities: List<Projet>): List<ProjetDTO> {
        return entities.map { toDTO(it) }
    }

    /**
     * Convertit une liste d'entités en liste de DTOs simplifiés
     */
    fun toSimpleDTOList(entities: List<Projet>): List<ProjetSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}
