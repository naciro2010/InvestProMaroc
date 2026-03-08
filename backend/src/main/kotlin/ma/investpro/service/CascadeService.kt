package ma.investpro.service

import ma.investpro.dto.ConventionSummaryDTO
import ma.investpro.dto.FournisseurSummaryDTO
import ma.investpro.dto.MarcheSummaryDTO
import ma.investpro.entity.StatutDecompte
import ma.investpro.repository.*
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

private val logger = KotlinLogging.logger {}

/**
 * Service pour les résumés cascade (auto-fill Odoo-style).
 * Fournit des DTOs enrichis avec données calculées (Prévu vs Réalisé)
 * pour l'auto-remplissage des formulaires.
 */
@Service
@Transactional(readOnly = true)
class CascadeService(
    private val conventionRepository: ConventionRepository,
    private val marcheRepository: MarcheRepository,
    private val fournisseurRepository: FournisseurRepository,
    private val decompteRepository: DecompteRepository,
    private val ordrePaiementRepository: OrdrePaiementRepository,
    private val paiementRepository: PaiementRepository,
    private val projetRepository: ProjetRepository,
    private val conventionPartenaireRepository: ConventionPartenaireRepository
) {

    /**
     * Résumé d'une convention pour auto-fill dans le formulaire Marché.
     * Calcule: budget, engagé, décaissé, payé, taux engagement/décaissement.
     */
    fun getConventionSummary(conventionId: Long): ConventionSummaryDTO {
        logger.debug { "Building convention summary for ID: $conventionId" }

        val convention = conventionRepository.findById(conventionId)
            .orElseThrow { IllegalArgumentException("Convention $conventionId non trouvée") }

        // Marchés rattachés à cette convention
        val marches = marcheRepository.findByConventionId(conventionId)

        // Montants engagés (somme des marchés)
        val montantEngageHT = marches.sumOf { it.montantHt }
        val montantEngageTTC = marches.sumOf { it.montantTtc }

        // Décomptes validés de tous les marchés de cette convention
        val marcheIds = marches.map { it.id!! }
        var montantDecaisseHT = BigDecimal.ZERO
        var montantDecaisseTTC = BigDecimal.ZERO
        var montantPaye = BigDecimal.ZERO

        for (marcheId in marcheIds) {
            val decomptes = decompteRepository.findByMarcheId(marcheId)
            val decomptesValides = decomptes.filter { it.statut in listOf(
                StatutDecompte.VALIDE, StatutDecompte.PAYE_PARTIEL, StatutDecompte.PAYE_TOTAL
            ) }
            montantDecaisseHT += decomptesValides.sumOf { it.montantBrutHT }
            montantDecaisseTTC += decomptesValides.sumOf { it.montantTTC }
            montantPaye += decomptesValides.sumOf { it.montantPaye }
        }

        val budget = convention.budget
        val budgetRestant = budget - montantEngageHT

        val tauxEngagement = if (budget > BigDecimal.ZERO) {
            montantEngageHT.multiply(BigDecimal(100)).divide(budget, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO

        val tauxDecaissement = if (montantEngageHT > BigDecimal.ZERO) {
            montantDecaisseHT.multiply(BigDecimal(100)).divide(montantEngageHT, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO

        // Compteurs
        val nombreMarches = marches.size
        val nombreProjets = projetRepository.countByConventionId(conventionId).toInt()
        val nombrePartenaires = conventionPartenaireRepository.countByConventionId(conventionId).toInt()

        return ConventionSummaryDTO(
            id = convention.id!!,
            code = convention.code,
            numero = convention.numero,
            libelle = convention.libelle,
            typeConvention = convention.typeConvention.name,
            statut = convention.statut.name,
            budget = budget,
            tauxCommission = convention.tauxCommission,
            baseCalcul = convention.baseCalcul,
            tauxTva = convention.tauxTva,
            dateDebut = convention.dateDebut,
            dateFin = convention.dateFin,
            montantEngageHT = montantEngageHT,
            montantEngageTTC = montantEngageTTC,
            montantDecaisseHT = montantDecaisseHT,
            montantDecaisseTTC = montantDecaisseTTC,
            montantPaye = montantPaye,
            budgetRestant = budgetRestant,
            tauxEngagement = tauxEngagement,
            tauxDecaissement = tauxDecaissement,
            nombreMarches = nombreMarches,
            nombreProjets = nombreProjets,
            nombrePartenaires = nombrePartenaires
        )
    }

    /**
     * Résumé d'un marché pour auto-fill dans le formulaire Décompte.
     * Calcule: cumul décomptes, montant restant, taux avancement.
     */
    fun getMarcheSummary(marcheId: Long): MarcheSummaryDTO {
        logger.debug { "Building marche summary for ID: $marcheId" }

        val marche = marcheRepository.findById(marcheId)
            .orElseThrow { IllegalArgumentException("Marché $marcheId non trouvé") }

        val fournisseur = marche.fournisseur
            ?: throw IllegalStateException("Marché $marcheId n'a pas de fournisseur")

        // Décomptes validés du marché
        val decomptes = decompteRepository.findByMarcheId(marcheId)
        val decomptesValides = decomptes.filter { it.statut in listOf(
            StatutDecompte.VALIDE, StatutDecompte.PAYE_PARTIEL, StatutDecompte.PAYE_TOTAL
        ) }

        val cumulDecomptesHT = decomptesValides.sumOf { it.montantBrutHT }
        val cumulDecomptesTTC = decomptesValides.sumOf { it.montantTTC }
        val montantRestantHT = marche.montantHt - cumulDecomptesHT

        // Paiements: traverser Decompte → OrdrePaiement → Paiement
        val montantPayeTotal = decomptesValides.sumOf { it.montantPaye }

        val tauxAvancement = if (marche.montantHt > BigDecimal.ZERO) {
            cumulDecomptesHT.multiply(BigDecimal(100)).divide(marche.montantHt, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO

        // Convention rattachée
        val convention = marche.convention

        return MarcheSummaryDTO(
            id = marche.id!!,
            numeroMarche = marche.numeroMarche,
            objet = marche.objet,
            montantHT = marche.montantHt,
            montantTTC = marche.montantTtc,
            tauxTva = marche.tauxTva,
            statut = marche.statut.name,
            typeMarche = marche.typeMarche.name,
            naturePrestation = marche.naturePrestation.name,
            dateDebut = marche.dateDebut,
            dateFinPrevue = marche.dateFinPrevue,
            delaiExecutionMois = marche.delaiExecutionMois,
            fournisseurCode = fournisseur.code,
            fournisseurNom = fournisseur.raisonSociale,
            fournisseurIce = fournisseur.ice,
            conventionId = convention?.id,
            conventionNumero = convention?.numero,
            conventionLibelle = convention?.libelle,
            cumulDecomptesHT = cumulDecomptesHT,
            cumulDecomptesTTC = cumulDecomptesTTC,
            montantRestantHT = montantRestantHT,
            montantPayeTotal = montantPayeTotal,
            tauxAvancement = tauxAvancement,
            nombreDecomptes = decomptes.size,
            nombreLignes = marche.lignes.size
        )
    }

    /**
     * Résumé d'un fournisseur pour auto-fill dans le formulaire Marché.
     */
    fun getFournisseurSummary(fournisseurId: Long): FournisseurSummaryDTO {
        logger.debug { "Building fournisseur summary for ID: $fournisseurId" }

        val fournisseur = fournisseurRepository.findById(fournisseurId)
            .orElseThrow { IllegalArgumentException("Fournisseur $fournisseurId non trouvé") }

        val marches = marcheRepository.findByFournisseurId(fournisseurId)
        val montantTotal = marches.sumOf { it.montantHt }

        return FournisseurSummaryDTO(
            id = fournisseur.id!!,
            code = fournisseur.code,
            raisonSociale = fournisseur.raisonSociale,
            ice = fournisseur.ice,
            identifiantFiscal = fournisseur.identifiantFiscal,
            adresse = fournisseur.adresse,
            ville = fournisseur.ville,
            telephone = fournisseur.telephone,
            email = fournisseur.email,
            nombreMarches = marches.size,
            montantTotalMarches = montantTotal
        )
    }
}
