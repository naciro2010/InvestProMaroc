package ma.investpro.service

import ma.investpro.entity.Marche
import ma.investpro.entity.StatutMarche
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.FournisseurRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class MarcheService(
    private val marcheRepository: MarcheRepository,
    private val fournisseurRepository: FournisseurRepository
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
}
