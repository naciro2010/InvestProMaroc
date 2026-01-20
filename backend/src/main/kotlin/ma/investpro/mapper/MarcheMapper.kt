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
            statut = entity.statut.name,
            dateDebut = entity.dateDebut,
            dateFinPrevue = entity.dateFinPrevue,
            delaiExecutionMois = entity.delaiExecutionMois,
            retenueGarantie = entity.retenueGarantie,
            remarques = entity.remarques,
            lignes = entity.lignes.map { ligne: MarcheLigne -> toLigneDTO(ligne) },
            avenants = entity.avenants.map { avenant: AvenantMarche -> toAvenantDTO(avenant) },
            decomptes = entity.decomptes.map { decompte: Decompte -> toDecompteSimpleDTO(decompte) },
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
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
            statut = entity.statut.name,
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
            statut = entity.statut.name,
            netAPayer = entity.netAPayer,
            montantPaye = entity.montantPaye,
            estSolde = entity.estSolde,
            actif = entity.actif
        )
    }

    fun toDTOList(entities: List<Marche>): List<MarcheDTO> {
        return entities.map { marche: Marche -> toDTO(marche) }
    }

    fun toSimpleDTOList(entities: List<Marche>): List<MarcheSimpleDTO> {
        return entities.map { marche: Marche -> toSimpleDTO(marche) }
    }

    fun toLigneDTOList(entities: List<MarcheLigne>): List<MarcheLigneDTO> {
        return entities.map { ligne: MarcheLigne -> toLigneDTO(ligne) }
    }

    fun toAvenantDTOList(entities: List<AvenantMarche>): List<AvenantMarcheDTO> {
        return entities.map { avenant: AvenantMarche -> toAvenantDTO(avenant) }
    }

    fun toDecompteSimpleDTOList(entities: List<Decompte>): List<DecompteSimpleDTO> {
        return entities.map { decompte: Decompte -> toDecompteSimpleDTO(decompte) }
    }
}
