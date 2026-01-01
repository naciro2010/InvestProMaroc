package ma.investpro.service

import ma.investpro.entity.ModePaiement
import ma.investpro.entity.Paiement
import ma.investpro.repository.OrdrePaiementRepository
import ma.investpro.repository.PaiementRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Service Paiement - Gestion des paiements réels
 */
@Service
@Transactional
class PaiementService(
    private val paiementRepository: PaiementRepository,
    private val ordrePaiementRepository: OrdrePaiementRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<Paiement> = paiementRepository.findAll()

    fun findById(id: Long): Paiement? = paiementRepository.findByIdOrNull(id)

    fun findByOrdrePaiement(ordrePaiementId: Long): List<Paiement> =
        paiementRepository.findByOrdrePaiementId(ordrePaiementId)

    fun findByReferencePaiement(referencePaiement: String): Paiement? =
        paiementRepository.findByReferencePaiement(referencePaiement)

    fun findByModePaiement(modePaiement: ModePaiement): List<Paiement> =
        paiementRepository.findByModePaiement(modePaiement)

    fun findByPeriode(dateDebut: LocalDate, dateFin: LocalDate): List<Paiement> =
        paiementRepository.findByDateValeurBetween(dateDebut, dateFin)

    fun create(paiement: Paiement): Paiement {
        require(paiement.id == null) { "Cannot create paiement with existing ID" }

        val ordrePaiementId = paiement.ordrePaiement.id
            ?: throw IllegalArgumentException("L'ID de l'ordre de paiement est requis")

        // Vérifier que l'ordre de paiement existe
        val ordrePaiement = ordrePaiementRepository.findByIdOrNull(ordrePaiementId)
            ?: throw IllegalArgumentException("Ordre de paiement avec ID $ordrePaiementId non trouvé")

        // Vérifier que la référence n'existe pas déjà
        if (paiementRepository.existsByReferencePaiement(paiement.referencePaiement)) {
            throw IllegalArgumentException("Un paiement avec la référence ${paiement.referencePaiement} existe déjà")
        }

        // Déterminer si c'est un paiement partiel
        paiement.estPaiementPartiel = paiement.montantPaye < ordrePaiement.montantAPayer

        // Calculer les écarts pour les imputations
        paiement.imputations.forEach { it.calculerEcart() }

        return paiementRepository.save(paiement)
    }

    fun update(id: Long, paiement: Paiement): Paiement {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Paiement $id introuvable")

        existing.apply {
            referencePaiement = paiement.referencePaiement
            dateValeur = paiement.dateValeur
            dateExecution = paiement.dateExecution
            montantPaye = paiement.montantPaye
            modePaiement = paiement.modePaiement
            compteBancaire = paiement.compteBancaire
            observations = paiement.observations
        }

        // Recalculer si c'est partiel
        existing.estPaiementPartiel = existing.montantPaye < existing.ordrePaiement.montantAPayer

        return paiementRepository.save(existing)
    }

    fun delete(id: Long) {
        val paiement = findById(id)
            ?: throw IllegalArgumentException("Paiement $id introuvable")

        paiementRepository.delete(paiement)
    }

    // ========== Statistiques ==========

    fun getTotalPaye(): BigDecimal {
        return paiementRepository.findAll().sumOf { it.montantPaye }
    }

    fun getTotalPayeByPeriode(dateDebut: LocalDate, dateFin: LocalDate): BigDecimal {
        return paiementRepository.findByDateValeurBetween(dateDebut, dateFin)
            .sumOf { it.montantPaye }
    }

    fun getTotalPayeByMode(modePaiement: ModePaiement): BigDecimal {
        return paiementRepository.findByModePaiement(modePaiement)
            .sumOf { it.montantPaye }
    }

    fun getStatistiques(): Map<String, Any> {
        val all = paiementRepository.findAll()
        return mapOf(
            "total" to all.size,
            "montantTotal" to all.sumOf { it.montantPaye },
            "paiementsPartiels" to all.count { it.estPaiementPartiel },
            "parMode" to ModePaiement.entries.associateWith { mode ->
                all.filter { it.modePaiement == mode }.sumOf { it.montantPaye }
            }
        )
    }
}
