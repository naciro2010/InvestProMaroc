package ma.investpro.service

import ma.investpro.dto.MarcheListDTO
import ma.investpro.dto.MarcheGlobalStatsDTO
import ma.investpro.dto.MarchePaiementDTO
import ma.investpro.dto.MarcheSituationPaiementDTO
import ma.investpro.entity.Marche
import ma.investpro.entity.MarcheLigne
import ma.investpro.entity.AvenantMarche
import ma.investpro.entity.Decompte
import ma.investpro.entity.Paiement
import ma.investpro.entity.StatutMarche
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.FournisseurRepository
import ma.investpro.repository.ProjetRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.OrdrePaiementRepository
import ma.investpro.repository.PaiementRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class MarcheService(
    private val marcheRepository: MarcheRepository,
    private val fournisseurRepository: FournisseurRepository,
    private val projetRepository: ProjetRepository,
    private val conventionRepository: ConventionRepository,
    private val ordrePaiementRepository: OrdrePaiementRepository,
    private val paiementRepository: PaiementRepository,
    private val modificationEventPublisher: ModificationEventPublisher
) {

    fun findAll(): List<Marche> {
        logger.debug { "Fetching all marches" }
        return marcheRepository.findAll().also { marches ->
            logger.info { "Found ${marches.size} marches" }
        }
    }

    @Transactional(readOnly = true)
    fun findAll(pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<Marche> {
        return marcheRepository.findAll(pageable)
    }

    fun findById(id: Long): Marche {
        logger.debug { "Fetching marche by ID: $id" }
        return marcheRepository.findById(id)
            .orElseThrow {
                logger.warn { "Marche not found - ID: $id" }
                IllegalArgumentException("Marche avec ID $id non trouve")
            }
    }

    fun create(marche: Marche): Marche {
        logger.info { "Creating marche: ${marche.numeroMarche}" }

        // Validation
        if (marcheRepository.existsByNumeroMarche(marche.numeroMarche)) {
            logger.warn { "Marche creation failed - numero already exists: ${marche.numeroMarche}" }
            throw IllegalArgumentException("Un marche avec le numero ${marche.numeroMarche} existe deja")
        }

        // Verifier que le fournisseur existe
        marche.fournisseur?.id?.let { fournisseurId ->
            if (!fournisseurRepository.existsById(fournisseurId)) {
                logger.warn { "Fournisseur not found - ID: $fournisseurId" }
                throw IllegalArgumentException("Fournisseur avec ID $fournisseurId non trouve")
            }
        }

        // Calculer les montants si necessaire
        if (marche.montantTva == BigDecimal.ZERO && marche.montantHt > BigDecimal.ZERO) {
            marche.montantTva = marche.montantHt.multiply(marche.tauxTva).divide(BigDecimal(100), 2, java.math.RoundingMode.HALF_UP)
            marche.montantTtc = marche.montantHt.add(marche.montantTva)
            logger.debug { "Auto-calculated TVA: ${marche.montantTva}, TTC: ${marche.montantTtc}" }
        }

        val saved = marcheRepository.save(marche)
        logger.info { "Marche created - ID: ${saved.id}, numero: ${saved.numeroMarche}" }

        modificationEventPublisher.publishCreation(
            entityType = "MARCHE",
            entityId = saved.id!!,
            description = "Creation du marche ${saved.numeroMarche}"
        )

        return saved
    }

    fun update(id: Long, marche: Marche): Marche {
        logger.info { "Updating marche ID: $id" }

        val existingMarche = marcheRepository.findById(id)
            .orElseThrow {
                logger.warn { "Marche not found for update - ID: $id" }
                IllegalArgumentException("Marche avec ID $id non trouve")
            }

        val ancienStatut = existingMarche.statut.name
        val ancienMontant = existingMarche.montantTtc.toString()

        // Log significant changes
        if (existingMarche.statut != marche.statut) {
            logger.info { "Marche $id status change: ${existingMarche.statut} -> ${marche.statut}" }
        }

        // Mise a jour des champs
        existingMarche.apply {
            numeroMarche = marche.numeroMarche
            numAo = marche.numAo
            dateMarche = marche.dateMarche
            fournisseur = marche.fournisseur
            objet = marche.objet
            montantHt = marche.montantHt
            tauxTva = marche.tauxTva
            montantTva = marche.montantTva
            montantTtc = marche.montantTtc
            statut = marche.statut
            typeMarche = marche.typeMarche
            naturePrestation = marche.naturePrestation
            dateSignature = marche.dateSignature
            dateNotification = marche.dateNotification
            dateOrdreService = marche.dateOrdreService
            tauxPenalite = marche.tauxPenalite
            dateDebut = marche.dateDebut
            dateFinPrevue = marche.dateFinPrevue
            delaiExecutionMois = marche.delaiExecutionMois
            retenueGarantie = marche.retenueGarantie
            remarques = marche.remarques
        }

        val updated = marcheRepository.save(existingMarche)
        logger.info { "Marche updated - ID: ${updated.id}" }

        // Publier l'event de modification
        val champsModifies = mutableListOf<String>()
        if (ancienStatut != updated.statut.name) champsModifies.add("statut")
        if (ancienMontant != updated.montantTtc.toString()) champsModifies.add("montantTtc")

        if (ancienStatut != updated.statut.name) {
            modificationEventPublisher.publishStatusChange(
                entityType = "MARCHE", entityId = id,
                description = "Changement de statut du marche ${updated.numeroMarche}",
                ancienStatut = ancienStatut, nouveauStatut = updated.statut.name
            )
        } else {
            modificationEventPublisher.publish(
                entityType = "MARCHE", entityId = id,
                typeModification = "UPDATE",
                description = "Mise a jour du marche ${updated.numeroMarche}",
                champsModifies = champsModifies
            )
        }

        return updated
    }

    fun delete(id: Long) {
        logger.info { "Deleting marche ID: $id" }

        val marche = marcheRepository.findById(id)
            .orElseThrow {
                logger.warn { "Marche not found for deletion - ID: $id" }
                IllegalArgumentException("Marche avec ID $id non trouve")
            }

        // Log cascade warning
        val hasRelations = marche.bonsCommande.isNotEmpty() || marche.decomptes.isNotEmpty()
        if (hasRelations) {
            logger.warn { "Cascade delete: marche ${marche.numeroMarche} has ${marche.bonsCommande.size} bons and ${marche.decomptes.size} decomptes" }
        }

        val numero = marche.numeroMarche
        marcheRepository.delete(marche)
        logger.info { "Marche deleted - ID: $id, numero: $numero" }

        modificationEventPublisher.publishDeletion(
            entityType = "MARCHE", entityId = id,
            description = "Suppression du marche $numero"
        )
    }

    fun findByFournisseur(fournisseurId: Long): List<Marche> {
        logger.debug { "Fetching marches for fournisseur ID: $fournisseurId" }
        return marcheRepository.findByFournisseurId(fournisseurId)
    }

    fun findMarchesEnRetard(): List<Marche> {
        logger.debug { "Fetching overdue marches" }
        return marcheRepository.findMarchesEnRetard().also { marches ->
            if (marches.isNotEmpty()) {
                logger.warn { "Found ${marches.size} overdue marches" }
            }
        }
    }

    fun findByStatut(statut: StatutMarche): List<Marche> {
        logger.debug { "Fetching marches with status: $statut" }
        return marcheRepository.findByStatut(statut)
    }

    fun findByConvention(conventionId: Long): List<Marche> {
        logger.debug { "Fetching marches for convention ID: $conventionId" }
        return marcheRepository.findByConventionId(conventionId).also { marches ->
            logger.info { "Found ${marches.size} marches for convention $conventionId" }
        }
    }

    fun findByProjet(projetId: Long): List<Marche> {
        logger.debug { "Fetching marches for projet ID: $projetId" }

        // Récupérer le projet
        val projet = projetRepository.findById(projetId)
            .orElseThrow {
                logger.warn { "Projet not found - ID: $projetId" }
                IllegalArgumentException("Projet avec ID $projetId non trouvé")
            }

        // Si le projet a une convention, récupérer ses marchés
        return if (projet.convention != null) {
            val conventionId = projet.convention!!.id!!
            logger.debug { "Projet $projetId has convention $conventionId, fetching marches" }
            marcheRepository.findByConventionId(conventionId).also { marches ->
                logger.info { "Found ${marches.size} marches for projet $projetId (via convention $conventionId)" }
            }
        } else {
            logger.info { "Projet $projetId has no convention, returning empty list" }
            emptyList()
        }
    }

    /**
     * Optimized list view - returns only essential fields for efficient loading
     * Used by frontend list page to display marches with minimal data transfer
     */
    fun findAllForListView(): List<MarcheListDTO> {
        logger.debug { "Fetching all marches for list view (optimized)" }
        return marcheRepository.findAll().map { marche ->
            convertToListDTO(marche)
        }.also { list ->
            logger.info { "Found ${list.size} marches for list view" }
        }
    }

    /**
     * Convert Marche entity to MarcheListDTO with counts instead of full collections
     */
    private fun convertToListDTO(marche: Marche): MarcheListDTO {
        return MarcheListDTO(
            id = marche.id,
            numeroMarche = marche.numeroMarche,
            numAo = marche.numAo,
            dateMarche = marche.dateMarche,
            fournisseurId = marche.fournisseur?.id ?: 0,
            fournisseurCode = marche.fournisseur?.code ?: "",
            fournisseurNom = marche.fournisseur?.raisonSociale ?: "",
            fournisseurIce = marche.fournisseur?.ice,
            conventionId = marche.convention?.id,
            conventionNumero = marche.convention?.numero,
            conventionLibelle = marche.convention?.libelle,
            objet = marche.objet,
            montantHt = marche.montantHt,
            tauxTva = marche.tauxTva,
            montantTva = marche.montantTva,
            montantTtc = marche.montantTtc,
            statut = marche.statut.toString(),
            typeMarche = marche.typeMarche.name,
            naturePrestation = marche.naturePrestation.name,
            dateDebut = marche.dateDebut,
            dateFinPrevue = marche.dateFinPrevue,
            delaiExecutionMois = marche.delaiExecutionMois,
            adresse = marche.adresse,
            latitude = marche.latitude,
            longitude = marche.longitude,
            zoneGeographique = marche.zoneGeographique,
            nbLignes = marche.lignes.size,
            nbAvenants = marche.avenants.size,
            nbDecomptes = marche.decomptes.size,
            actif = true, // Adjust based on your entity structure
            createdAt = marche.createdAt
        )
    }

    /**
     * ✅ FIXED: Returns strongly typed List<MarcheLigne> instead of List<Any>
     * Get lignes for a specific marche
     * Called by detail page component to load line items separately
     */
    fun findLignesByMarcheId(marcheId: Long): List<MarcheLigne> {
        logger.debug { "Fetching lignes for marche ID: $marcheId" }
        val marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marche not found - ID: $marcheId" }
                IllegalArgumentException("Marche avec ID $marcheId non trouve")
            }
        return marche.lignes.toList()
    }

    /**
     * ✅ FIXED: Returns strongly typed List<AvenantMarche> instead of List<Any>
     * Get avenants for a specific marche
     * Called by detail page component to load amendments separately
     */
    fun findAvenantsByMarcheId(marcheId: Long): List<AvenantMarche> {
        logger.debug { "Fetching avenants for marche ID: $marcheId" }
        val marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marche not found - ID: $marcheId" }
                IllegalArgumentException("Marche avec ID $marcheId non trouve")
            }
        return marche.avenants.toList()
    }

    /**
     * ✅ FIXED: Returns strongly typed List<Decompte> instead of List<Any>
     * Get decomptes for a specific marche
     * Called by detail page component to load billing statements separately
     */
    fun findDecomptesByMarcheId(marcheId: Long): List<Decompte> {
        logger.debug { "Fetching decomptes for marche ID: $marcheId" }
        val marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marche not found - ID: $marcheId" }
                IllegalArgumentException("Marche avec ID $marcheId non trouve")
            }
        return marche.decomptes.toList()
    }

    /**
     * Get marche statistics (counts) without loading full collections
     */
    fun getMarcheStats(): MarcheGlobalStatsDTO {
        logger.debug { "Calculating marche statistics" }
        val allMarches = marcheRepository.findAll()

        return MarcheGlobalStatsDTO(
            total = allMarches.size,
            byStatus = allMarches.groupingBy { it.statut.name }.eachCount(),
            totalAmount = allMarches.sumOf { it.montantTtc },
            avgAmount = if (allMarches.isNotEmpty()) allMarches.sumOf { it.montantTtc } / BigDecimal(allMarches.size) else BigDecimal.ZERO
        )
    }

    /**
     * Link a marché to a convention
     * Sets the convention field of the marché
     */
    fun linkMarcheToConvention(marcheId: Long, conventionId: Long): Marche {
        logger.info { "Linking marché $marcheId to convention $conventionId" }

        // Fetch marché
        val marche: Marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marché not found - ID: $marcheId" }
                IllegalArgumentException("Marché avec ID $marcheId non trouvé")
            }

        // Fetch convention
        val convention = conventionRepository.findById(conventionId)
            .orElseThrow {
                logger.warn { "Convention not found - ID: $conventionId" }
                IllegalArgumentException("Convention avec ID $conventionId non trouvée")
            }

        // Check if already linked
        if (marche.convention?.id == conventionId) {
            logger.info { "Marché $marcheId already linked to convention $conventionId" }
            return marche
        }

        // Link marché to convention
        marche.convention = convention

        return marcheRepository.save(marche).also {
            logger.info { "Marché $marcheId successfully linked to convention $conventionId" }
        }
    }

    /**
     * Unlink a marché from its convention
     * Sets the convention field to null
     */
    fun unlinkMarcheFromConvention(marcheId: Long): Marche {
        logger.info { "Unlinking marché $marcheId from convention" }

        // Fetch marché
        val marche: Marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marché not found - ID: $marcheId" }
                IllegalArgumentException("Marché avec ID $marcheId non trouvé")
            }

        // Check if marché has a convention
        if (marche.convention == null) {
            logger.info { "Marché $marcheId has no convention to unlink" }
            return marche
        }

        val oldConventionId: Long? = marche.convention?.id

        // Unlink marché from convention
        marche.convention = null

        return marcheRepository.save(marche).also {
            logger.info { "Marché $marcheId successfully unlinked from convention $oldConventionId" }
        }
    }

    /**
     * Get all paiements for a marché by traversing:
     * Marché -> Décomptes -> OrdresPaiement -> Paiements
     */
    fun findPaiementsByMarcheId(marcheId: Long): List<MarchePaiementDTO> {
        logger.debug { "Fetching paiements for marche ID: $marcheId" }
        val marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marche not found - ID: $marcheId" }
                IllegalArgumentException("Marché avec ID $marcheId non trouvé")
            }

        val decomptes = marche.decomptes.toList()
        if (decomptes.isEmpty()) {
            logger.debug { "No decomptes found for marche $marcheId, returning empty paiements" }
            return emptyList()
        }

        // Build a map of decompte ID -> Decompte for quick lookup
        val decompteMap: Map<Long, Decompte> = decomptes.associateBy { it.id ?: 0L }
        val decompteIds: List<Long> = decomptes.mapNotNull { it.id }

        // Get all ordres de paiement for these décomptes
        val ordresPaiement = ordrePaiementRepository.findByDecompteIdIn(decompteIds)
        if (ordresPaiement.isEmpty()) {
            logger.debug { "No ordres de paiement found for marche $marcheId decomptes" }
            return emptyList()
        }

        val opIds: List<Long> = ordresPaiement.mapNotNull { it.id }

        // Get all paiements for these ordres de paiement
        val paiements: List<Paiement> = paiementRepository.findByOrdrePaiementIdIn(opIds)

        logger.info { "Found ${paiements.size} paiements for marche $marcheId" }

        return paiements.map { paiement: Paiement ->
            val op = paiement.ordrePaiement
            val decompte = decompteMap[op.decompte.id]
            MarchePaiementDTO(
                id = paiement.id,
                referencePaiement = paiement.referencePaiement,
                dateValeur = paiement.dateValeur,
                dateExecution = paiement.dateExecution,
                montantPaye = paiement.montantPaye,
                modePaiement = paiement.modePaiement.name,
                estPaiementPartiel = paiement.estPaiementPartiel,
                decompteId = op.decompte.id ?: 0L,
                numeroDecompte = decompte?.numeroDecompte ?: "",
                ordrePaiementId = op.id ?: 0L,
                numeroOP = op.numeroOP,
                observations = paiement.observations
            )
        }
    }

    /**
     * Get payment situation summary for a marché.
     * Computes aggregated metrics from décomptes.
     */
    fun getSituationPaiement(marcheId: Long): MarcheSituationPaiementDTO {
        logger.debug { "Computing situation paiement for marche ID: $marcheId" }
        val marche = marcheRepository.findById(marcheId)
            .orElseThrow {
                logger.warn { "Marche not found - ID: $marcheId" }
                IllegalArgumentException("Marché avec ID $marcheId non trouvé")
            }

        val decomptes = marche.decomptes.toList()

        val totalNetAPayer = decomptes.fold(BigDecimal.ZERO) { acc: BigDecimal, d: Decompte ->
            acc + d.netAPayer
        }
        val totalMontantPaye = decomptes.fold(BigDecimal.ZERO) { acc: BigDecimal, d: Decompte ->
            acc + d.montantPaye
        }
        val resteAPayer = totalNetAPayer - totalMontantPaye

        val tauxPaiement = if (totalNetAPayer > BigDecimal.ZERO) {
            totalMontantPaye.multiply(BigDecimal(100)).divide(totalNetAPayer, 2, java.math.RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        val decomptesNonPayes = decomptes.count { d: Decompte -> d.montantPaye.compareTo(BigDecimal.ZERO) == 0 }
        val decomptesPayesTotalement = decomptes.count { d: Decompte -> d.estSolde }
        val decomptesPayesPartiellement = decomptes.count { d: Decompte ->
            d.montantPaye > BigDecimal.ZERO && !d.estSolde
        }

        // Count total paiements by traversing the chain
        val decompteIds: List<Long> = decomptes.mapNotNull { it.id }
        val nombrePaiements = if (decompteIds.isNotEmpty()) {
            val opIds = ordrePaiementRepository.findByDecompteIdIn(decompteIds).mapNotNull { it.id }
            if (opIds.isNotEmpty()) paiementRepository.findByOrdrePaiementIdIn(opIds).size else 0
        } else {
            0
        }

        logger.info { "Situation paiement marche $marcheId: ${decomptes.size} decomptes, $nombrePaiements paiements, taux=$tauxPaiement%" }

        return MarcheSituationPaiementDTO(
            totalDecomptes = decomptes.size,
            totalNetAPayer = totalNetAPayer,
            totalMontantPaye = totalMontantPaye,
            resteAPayer = resteAPayer,
            tauxPaiement = tauxPaiement,
            decomptesNonPayes = decomptesNonPayes,
            decomptesPayesPartiellement = decomptesPayesPartiellement,
            decomptesPayesTotalement = decomptesPayesTotalement,
            nombrePaiements = nombrePaiements
        )
    }
}
