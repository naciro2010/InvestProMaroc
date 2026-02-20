package ma.investpro.service

import ma.investpro.dto.OrdrePaiementStatistiques
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

        val decompteId = ordrePaiement.decompte.id
            ?: throw IllegalArgumentException("L'ID du décompte est requis")

        // Vérifier que le décompte existe
        val decompte = decompteRepository.findByIdOrNull(decompteId)
            ?: throw IllegalArgumentException("Décompte avec ID $decompteId non trouvé")

        // Vérifier que le numéro OP n'existe pas déjà
        if (ordrePaiementRepository.existsByNumeroOP(ordrePaiement.numeroOP)) {
            throw IllegalArgumentException("Un ordre de paiement avec le numéro ${ordrePaiement.numeroOP} existe déjà")
        }

        // Valider le montant à payer
        require(ordrePaiement.montantAPayer.compareTo(BigDecimal.ZERO) > 0) {
            "Le montant à payer doit être supérieur à zéro"
        }

        require(decompte.netAPayer.compareTo(BigDecimal.ZERO) > 0) {
            "Le net à payer du décompte doit être supérieur à zéro"
        }

        require(ordrePaiement.montantAPayer.compareTo(decompte.netAPayer) <= 0) {
            "Le montant à payer (${ordrePaiement.montantAPayer}) ne peut pas dépasser le net à payer du décompte (${decompte.netAPayer})"
        }

        // Déterminer si c'est un paiement partiel (use compareTo for BigDecimal)
        ordrePaiement.estPaiementPartiel = ordrePaiement.montantAPayer.compareTo(decompte.netAPayer) < 0

        return ordrePaiementRepository.save(ordrePaiement)
    }

    fun update(id: Long, ordrePaiement: OrdrePaiement): OrdrePaiement {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Ordre de paiement $id introuvable")

        // Seuls les OP en BROUILLON peuvent être modifiés
        require(existing.statut == StatutOP.BROUILLON) {
            "Seuls les ordres de paiement en BROUILLON peuvent être modifiés"
        }

        // Valider le montant à payer
        require(ordrePaiement.montantAPayer.compareTo(BigDecimal.ZERO) > 0) {
            "Le montant à payer doit être supérieur à zéro"
        }

        require(ordrePaiement.montantAPayer.compareTo(existing.decompte.netAPayer) <= 0) {
            "Le montant à payer (${ordrePaiement.montantAPayer}) ne peut pas dépasser le net à payer du décompte (${existing.decompte.netAPayer})"
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

        // Recalculer si c'est partiel (use compareTo for BigDecimal)
        existing.estPaiementPartiel = existing.montantAPayer.compareTo(existing.decompte.netAPayer) < 0

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

    fun getStatistiques(): OrdrePaiementStatistiques {
        val all = ordrePaiementRepository.findAll()
        return OrdrePaiementStatistiques(
            total = all.size,
            brouillon = all.count { it.statut == StatutOP.BROUILLON },
            valides = all.count { it.statut == StatutOP.VALIDE },
            executes = all.count { it.statut == StatutOP.EXECUTE },
            rejetes = all.count { it.statut == StatutOP.REJETE },
            annules = all.count { it.statut == StatutOP.ANNULE },
            montantTotal = all.filter { it.statut == StatutOP.EXECUTE }.sumOf { it.montantAPayer }
        )
    }
}
