package ma.investpro.mapper

import ma.investpro.dto.*
import ma.investpro.entity.*
import org.springframework.stereotype.Component

/**
 * Mapper pour convertir Convention Entity ↔ DTO
 * Élimine les références circulaires en ne chargeant que les données nécessaires
 */
@Component
class ConventionMapper {

    /**
     * Convertit une entité Convention en DTO complet
     * Charge les relations enfants SANS référence back au parent
     */
    fun toDTO(entity: Convention): ConventionDTO {
        return ConventionDTO(
            id = entity.id,
            code = entity.code,
            numero = entity.numero,
            dateConvention = entity.dateConvention,
            typeConvention = entity.typeConvention,
            statut = entity.statut,
            libelle = entity.libelle,
            objet = entity.objet,

            tauxCommission = entity.tauxCommission,
            budget = entity.budget,
            baseCalcul = entity.baseCalcul,
            tauxTva = entity.tauxTva,

            dateDebut = entity.dateDebut,
            dateFin = entity.dateFin,
            description = entity.description,

            dateSoumission = entity.dateSoumission,
            dateValidation = entity.dateValidation,
            valideParId = entity.valideParId,
            version = entity.version,
            isLocked = entity.isLocked,
            motifVerrouillage = entity.motifVerrouillage,

            // Parent : ID seulement (pas d'objet complet pour éviter cycle)
            parentConventionId = entity.parentConvention?.id,
            parentConventionNumero = entity.parentConvention?.numero,
            heriteParametres = entity.heriteParametres,
            surchargeTauxCommission = entity.surchargeTauxCommission,
            surchargeBaseCalcul = entity.surchargeBaseCalcul,

            // Enfants : objets complets SANS référence back
            partenaires = entity.partenaires.map { toPartenaireDTO(it) },
            sousConventions = entity.sousConventions.map { toSimpleDTO(it) },
            imputationsPrevisionnelles = entity.imputationsPrevisionnelles.map { toImputationDTO(it) },
            versementsPrevisionnels = entity.versementsPrevisionnels.map { toVersementDTO(it) },

            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            createdBy = entity.createdBy,
            updatedBy = entity.updatedBy,
            actif = entity.actif
        )
    }

    /**
     * Convertit une entité Convention en DTO simplifié
     * Utilisé pour les listes et les sous-conventions
     */
    fun toSimpleDTO(entity: Convention): ConventionSimpleDTO {
        return ConventionSimpleDTO(
            id = entity.id,
            code = entity.code,
            numero = entity.numero,
            libelle = entity.libelle,
            statut = entity.statut,
            budget = entity.budget,
            dateDebut = entity.dateDebut,
            dateFin = entity.dateFin,
            actif = entity.actif
        )
    }

    /**
     * Convertit ConventionPartenaire en DTO
     */
    private fun toPartenaireDTO(entity: ConventionPartenaire): ConventionPartenaireDTO {
        return ConventionPartenaireDTO(
            id = entity.id,
            conventionId = entity.convention?.id ?: 0,
            partenaireId = entity.partenaire?.id ?: 0,
            partenaireCode = entity.partenaire?.code ?: "",
            partenaireNom = entity.partenaire?.raisonSociale ?: "",
            partenaireSigle = entity.partenaire?.sigle,
            budgetAlloue = entity.budgetAlloue,
            pourcentage = entity.pourcentage,
            commissionIntervention = entity.commissionIntervention,
            estMaitreOeuvre = entity.estMaitreOeuvre,
            estMaitreOeuvreDelegue = entity.estMaitreOeuvreDelegue,
            remarques = entity.remarques,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    /**
     * Convertit ImputationPrevisionnelle en DTO
     */
    private fun toImputationDTO(entity: ImputationPrevisionnelle): ImputationPrevisionnelleDTO {
        return ImputationPrevisionnelleDTO(
            id = entity.id,
            conventionId = entity.convention?.id ?: 0,
            volet = entity.volet,
            dateDemarrage = entity.dateDemarrage,
            delaiMois = entity.delaiMois,
            dateFinPrevue = entity.dateFinPrevue,
            remarques = entity.remarques,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    /**
     * Convertit VersementPrevisionnel en DTO
     */
    private fun toVersementDTO(entity: VersementPrevisionnel): VersementPrevisionnelDTO {
        return VersementPrevisionnelDTO(
            id = entity.id,
            conventionId = entity.convention?.id ?: 0,
            volet = entity.volet,
            dateVersement = entity.dateVersement,
            montant = entity.montant,
            partenaireId = entity.partenaire?.id ?: 0,
            partenaireNom = entity.partenaire?.raisonSociale,
            maitreOeuvreDelegueId = entity.maitreOeuvreDelegue?.id,
            maitreOeuvreDelegueNom = entity.maitreOeuvreDelegue?.raisonSociale,
            remarques = entity.remarques,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    fun toDTOList(entities: List<Convention>): List<ConventionDTO> {
        return entities.map { toDTO(it) }
    }

    /**
     * Convertit une liste d'entités en liste de DTOs simplifiés
     */
    fun toSimpleDTOList(entities: List<Convention>): List<ConventionSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}
