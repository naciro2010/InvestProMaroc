package ma.investpro.mapper

import ma.investpro.dto.DecompteDTO
import ma.investpro.dto.DecompteRetenueDTO
import ma.investpro.dto.DecompteImputationDTO
import ma.investpro.dto.DecompteListDTO
import ma.investpro.entity.Decompte
import ma.investpro.entity.DecompteRetenue
import ma.investpro.entity.DecompteImputation
import org.springframework.stereotype.Component

/**
 * Mapper pour convertir Decompte Entity ↔ DTO
 * Élimine les références circulaires et fournit des données aplaties
 */
@Component
class DecompteMapper {

    /**
     * Convertit une entité Decompte en DTO complet
     * Charge les relations enfants (retenues, imputations)
     */
    fun toDTO(entity: Decompte): DecompteDTO {
        return DecompteDTO(
            id = entity.id,
            marcheId = entity.marche.id!!,
            marcheNumero = entity.marche.numeroMarche,
            marcheFournisseur = entity.marche.fournisseur?.raisonSociale,
            numeroDecompte = entity.numeroDecompte,
            dateDecompte = entity.dateDecompte,
            periodeDebut = entity.periodeDebut,
            periodeFin = entity.periodeFin,
            statut = entity.statut.name,
            montantBrutHT = entity.montantBrutHT,
            montantTVA = entity.montantTVA,
            montantTTC = entity.montantTTC,
            totalRetenues = entity.totalRetenues,
            netAPayer = entity.netAPayer,
            cumulPrecedent = entity.cumulPrecedent,
            cumulActuel = entity.cumulActuel,
            observations = entity.observations,
            dateValidation = entity.dateValidation,
            valideParId = entity.valideParId,
            montantPaye = entity.montantPaye,
            estSolde = entity.estSolde,
            retenues = entity.retenues.filter { it.actif }.map { toRetenueDTO(it) },
            imputations = entity.imputations.filter { it.actif }.map { toImputationDTO(it) },
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une entité DecompteRetenue en DTO
     */
    fun toRetenueDTO(entity: DecompteRetenue): DecompteRetenueDTO {
        return DecompteRetenueDTO(
            id = entity.id,
            decompteId = entity.decompte.id!!,
            typeRetenue = entity.typeRetenue.name,
            montant = entity.montant,
            tauxPourcent = entity.tauxPourcent,
            libelle = entity.libelle,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une entité DecompteImputation en DTO
     */
    fun toImputationDTO(entity: DecompteImputation): DecompteImputationDTO {
        return DecompteImputationDTO(
            id = entity.id,
            decompteId = entity.decompte.id!!,
            montant = entity.montant,
            dimensionsValeurs = entity.dimensionsValeurs,
            remarques = entity.remarques,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une entité Decompte en DTO liste optimisé (micro-frontends pattern)
     * Ne charge pas les collections enfants, juste les compteurs
     */
    fun toListDTO(entity: Decompte): DecompteListDTO {
        return DecompteListDTO(
            id = entity.id,
            marcheId = entity.marche.id!!,
            marcheNumero = entity.marche.numeroMarche,
            marcheFournisseur = entity.marche.fournisseur?.raisonSociale,
            numeroDecompte = entity.numeroDecompte,
            dateDecompte = entity.dateDecompte,
            periodeDebut = entity.periodeDebut,
            periodeFin = entity.periodeFin,
            statut = entity.statut.name,
            montantBrutHT = entity.montantBrutHT,
            montantTVA = entity.montantTVA,
            montantTTC = entity.montantTTC,
            totalRetenues = entity.totalRetenues,
            netAPayer = entity.netAPayer,
            cumulPrecedent = entity.cumulPrecedent,
            cumulActuel = entity.cumulActuel,
            montantPaye = entity.montantPaye,
            estSolde = entity.estSolde,
            nbRetenues = entity.retenues.count { it.actif },
            nbImputations = entity.imputations.count { it.actif },
            actif = entity.actif,
            createdAt = entity.createdAt
        )
    }
}
