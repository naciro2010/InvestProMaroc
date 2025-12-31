package ma.investpro.service

import ma.investpro.entity.OrdrePaiement
import ma.investpro.entity.StatutOP
import ma.investpro.repository.DecompteRepository
import ma.investpro.repository.OrdrePaiementRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Service Ordre de Paiement
 */
@Service
@Transactional
class OrdrePaiementService(
    private val ordrePaiementRepository: OrdrePaiementRepository,
    private val decompteRepository: DecompteRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<OrdrePaiement> = ordrePaiementRepository.findAll()

    fun findById(id: Long): OrdrePaiement? = ordrePaiementRepository.findByIdOrNull(id)

    fun findByDecompte(decompteId: Long): List<OrdrePaiement> =
        ordrePaiementRepository.findByDecompteId(decompteId)

    fun findByNumeroOP(numeroOP: String): OrdrePaiement? =
        ordrePaiementRepository.findByNumeroOP(numeroOP)

    fun findByStatut(statut: StatutOP): List<OrdrePaiement> =
        ordrePaiementRepository.findByStatut(statut)

    fun findByDatePrevuePaiement(date: LocalDate): List<OrdrePaiement> =
        ordrePaiementRepository.findByDatePrevuePaiement(date)

    fun create(ordrePaiement: OrdrePaiement): OrdrePaiement {
        require(ordrePaiement.id == null) { "Cannot create ordre de paiement with existing ID" }

        // Vérifier que le décompte existe
        val decompte = decompteRepository.findByIdOrNull(ordrePaiement.decompte.id!!)
            ?: throw IllegalArgumentException("Décompte avec ID ${ordrePaiement.decompte.id} non trouvé")

        // Vérifier que le numéro OP n'existe pas déjà
        if (ordrePaiementRepository.existsByNumeroOP(ordrePaiement.numeroOP)) {
            throw IllegalArgumentException("Un ordre de paiement avec le numéro ${ordrePaiement.numeroOP} existe déjà")
        }

        // Déterminer si c'est un paiement partiel
        ordrePaiement.estPaiementPartiel = ordrePaiement.montantAPayer < decompte.netAPayer

        return ordrePaiementRepository.save(ordrePaiement)
    }

    fun update(id: Long, ordrePaiement: OrdrePaiement): OrdrePaiement {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        // Seuls les OP en BROUILLON peuvent être modifiés
        require(existing.statut == StatutOP.BROUILLON) {
            "Seuls les ordres de paiement en BROUILLON peuvent être modifiés"
        }

        existing.apply {
            numeroOP = ordrePaiement.numeroOP
            dateOP = ordrePaiement.dateOP
            montantAPayer = ordrePaiement.montantAPayer
            datePrevuePaiement = ordrePaiement.datePrevuePaiement
            modePaiement = ordrePaiement.modePaiement
            compteBancaire = ordrePaiement.compteBancaire
            observations = ordrePaiement.observations
        }

        // Recalculer si c'est partiel
        existing.estPaiementPartiel = existing.montantAPayer < existing.decompte.netAPayer

        return ordrePaiementRepository.save(existing)
    }

    fun delete(id: Long) {
        val ordrePaiement = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        require(ordrePaiement.statut == StatutOP.BROUILLON) {
            "Seuls les ordres de paiement en BROUILLON peuvent être supprimés"
        }

        ordrePaiementRepository.delete(ordrePaiement)
    }

    // ========== Workflow Operations ==========

    fun valider(id: Long, valideParId: Long): OrdrePaiement {
        val ordrePaiement = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        require(ordrePaiement.statut == StatutOP.BROUILLON) {
            "Seuls les ordres de paiement en BROUILLON peuvent être validés"
        }

        ordrePaiement.apply {
            statut = StatutOP.VALIDE
            dateValidation = LocalDate.now()
            this.valideParId = valideParId
        }

        return ordrePaiementRepository.save(ordrePaiement)
    }

    fun executer(id: Long): OrdrePaiement {
        val ordrePaiement = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        require(ordrePaiement.statut == StatutOP.VALIDE) {
            "Seuls les ordres de paiement VALIDES peuvent être exécutés"
        }

        ordrePaiement.statut = StatutOP.EXECUTE
        return ordrePaiementRepository.save(ordrePaiement)
    }

    fun rejeter(id: Long): OrdrePaiement {
        val ordrePaiement = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        require(ordrePaiement.statut == StatutOP.BROUILLON) {
            "Seuls les ordres de paiement en BROUILLON peuvent être rejetés"
        }

        ordrePaiement.statut = StatutOP.REJETE
        return ordrePaiementRepository.save(ordrePaiement)
    }

    fun annuler(id: Long): OrdrePaiement {
        val ordrePaiement = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        require(ordrePaiement.statut != StatutOP.EXECUTE) {
            "Les ordres de paiement EXECUTES ne peuvent pas être annulés"
        }

        ordrePaiement.statut = StatutOP.ANNULE
        return ordrePaiementRepository.save(ordrePaiement)
    }

    // ========== Statistiques ==========

    fun getTotalMontantAPayer(): BigDecimal {
        return ordrePaiementRepository.findAll()
            .filter { it.statut == StatutOP.VALIDE || it.statut == StatutOP.EXECUTE }
            .sumOf { it.montantAPayer }
    }

    fun getStatistiques(): Map<String, Any> {
        val all = ordrePaiementRepository.findAll()
        return mapOf(
            "total" to all.size,
            "brouillon" to all.count { it.statut == StatutOP.BROUILLON },
            "valides" to all.count { it.statut == StatutOP.VALIDE },
            "executes" to all.count { it.statut == StatutOP.EXECUTE },
            "rejetes" to all.count { it.statut == StatutOP.REJETE },
            "annules" to all.count { it.statut == StatutOP.ANNULE },
            "montantTotal" to all.filter { it.statut == StatutOP.EXECUTE }.sumOf { it.montantAPayer }
        )
    }
}
