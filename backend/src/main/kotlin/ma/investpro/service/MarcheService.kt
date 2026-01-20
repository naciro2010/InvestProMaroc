package ma.investpro.service

import ma.investpro.dto.MarcheListDTO
import ma.investpro.entity.Marche
import ma.investpro.entity.MarcheLigne
import ma.investpro.entity.AvenantMarche
import ma.investpro.entity.Decompte
import ma.investpro.entity.StatutMarche
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.FournisseurRepository
import ma.investpro.repository.ProjetRepository
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
    private val projetRepository: ProjetRepository
) {

    fun findAll(): List<Marche> {
        logger.debug { "Fetching all marches" }
        return marcheRepository.findAll().also { marches ->
            logger.info { "Found ${marches.size} marches" }
        }
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
            marche.montantTva = marche.montantHt.multiply(marche.tauxTva).divide(BigDecimal(100))
            marche.montantTtc = marche.montantHt.add(marche.montantTva)
            logger.debug { "Auto-calculated TVA: ${marche.montantTva}, TTC: ${marche.montantTtc}" }
        }

        return marcheRepository.save(marche).also { saved ->
            logger.info { "Marche created - ID: ${saved.id}, numero: ${saved.numeroMarche}" }
        }
    }

    fun update(id: Long, marche: Marche): Marche {
        logger.info { "Updating marche ID: $id" }

        val existingMarche = marcheRepository.findById(id)
            .orElseThrow {
                logger.warn { "Marche not found for update - ID: $id" }
                IllegalArgumentException("Marche avec ID $id non trouve")
            }

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
            dateDebut = marche.dateDebut
            dateFinPrevue = marche.dateFinPrevue
            delaiExecutionMois = marche.delaiExecutionMois
            retenueGarantie = marche.retenueGarantie
            remarques = marche.remarques
        }

        return marcheRepository.save(existingMarche).also { updated ->
            logger.info { "Marche updated - ID: ${updated.id}" }
        }
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

        marcheRepository.delete(marche)
        logger.info { "Marche deleted - ID: $id, numero: ${marche.numeroMarche}" }
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
    fun getMarcheStats(): Map<String, Any> {
        logger.debug { "Calculating marche statistics" }
        val allMarches = marcheRepository.findAll()

        return mapOf(
            "total" to allMarches.size,
            "byStatus" to allMarches.groupingBy { it.statut }.eachCount(),
            "totalAmount" to allMarches.sumOf { it.montantTtc },
            "avgAmount" to if (allMarches.isNotEmpty()) allMarches.sumOf { it.montantTtc } / BigDecimal(allMarches.size) else BigDecimal.ZERO
        )
    }
}
