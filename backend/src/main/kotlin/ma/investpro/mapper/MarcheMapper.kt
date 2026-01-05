package ma.investpro.mapper

import ma.investpro.dto.*
import ma.investpro.entity.*
import org.springframework.stereotype.Component

@Component
class MarcheMapper {

    fun toDTO(entity: Marche): MarcheDTO {
        return MarcheDTO(
            id = entity.id,
            numeroMarche = entity.numeroMarche,
            numAo = entity.numAo,
            dateMarche = entity.dateMarche,
            fournisseurId = entity.fournisseur?.id ?: 0,
            fournisseurCode = entity.fournisseur?.code ?: "",
            fournisseurNom = entity.fournisseur?.raisonSociale ?: "",
            fournisseurIce = entity.fournisseur?.ice,
            conventionId = entity.convention?.id,
            conventionNumero = entity.convention?.numero,
            objet = entity.objet,
            montantHt = entity.montantHt,
            tauxTva = entity.tauxTva,
            montantTva = entity.montantTva,
            montantTtc = entity.montantTtc,
            statut = entity.statut,
            dateDebut = entity.dateDebut,
            dateFinPrevue = entity.dateFinPrevue,
            delaiExecutionMois = entity.delaiExecutionMois,
            retenueGarantie = entity.retenueGarantie,
            remarques = entity.remarques,
            lignes = entity.lignes.map { toLigneDTO(it) },
            avenants = entity.avenants.map { toAvenantDTO(it) },
            decomptes = entity.decomptes.map { toDecompteSimpleDTO(it) },
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            createdBy = entity.createdBy,
            updatedBy = entity.updatedBy,
            actif = entity.actif
        )
    }

    fun toSimpleDTO(entity: Marche): MarcheSimpleDTO {
        return MarcheSimpleDTO(
            id = entity.id,
            numeroMarche = entity.numeroMarche,
            dateMarche = entity.dateMarche,
            fournisseurNom = entity.fournisseur?.raisonSociale ?: "",
            montantTtc = entity.montantTtc,
            statut = entity.statut,
            actif = entity.actif
        )
    }

    private fun toLigneDTO(entity: MarcheLigne): MarcheLigneDTO {
        return MarcheLigneDTO(
            id = entity.id,
            marcheId = entity.marche.id ?: 0,
            numeroLigne = entity.numeroLigne,
            designation = entity.designation,
            unite = entity.unite,
            quantite = entity.quantite,
            prixUnitaireHT = entity.prixUnitaireHT,
            montantHT = entity.montantHT,
            tauxTVA = entity.tauxTVA,
            montantTVA = entity.montantTVA,
            montantTTC = entity.montantTTC,
            imputationAnalytique = entity.imputationAnalytique,
            remarques = entity.remarques,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    private fun toAvenantDTO(entity: AvenantMarche): AvenantMarcheDTO {
        return AvenantMarcheDTO(
            id = entity.id,
            marcheId = entity.marche.id ?: 0,
            numeroAvenant = entity.numeroAvenant,
            dateAvenant = entity.dateAvenant,
            objet = entity.objet,
            montantAvant = entity.montantInitialHT,
            montantApres = entity.montantApresHT,
            impact = entity.montantAvenantHT,
            statut = entity.statut.name,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    private fun toDecompteSimpleDTO(entity: Decompte): DecompteSimpleDTO {
        return DecompteSimpleDTO(
            id = entity.id,
            numeroDecompte = entity.numeroDecompte,
            dateDecompte = entity.dateDecompte,
            statut = entity.statut,
            netAPayer = entity.netAPayer,
            montantPaye = entity.montantPaye,
            estSolde = entity.estSolde,
            actif = entity.actif
        )
    }

    fun toDTOList(entities: List<Marche>): List<MarcheDTO> {
        return entities.map { toDTO(it) }
    }

    fun toSimpleDTOList(entities: List<Marche>): List<MarcheSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}
