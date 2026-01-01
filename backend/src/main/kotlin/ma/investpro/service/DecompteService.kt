package ma.investpro.service

import ma.investpro.dto.DecompteStatistiques
import ma.investpro.entity.Decompte
import ma.investpro.entity.StatutDecompte
import ma.investpro.repository.DecompteRepository
import ma.investpro.repository.MarcheRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

/**
 * Service Decompte - Approche DDD simplifiée
 */
@Service
@Transactional
class DecompteService(
    private val decompteRepository: DecompteRepository,
    private val marcheRepository: MarcheRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<Decompte> = decompteRepository.findAll()

    fun findById(id: Long): Decompte? = decompteRepository.findByIdOrNull(id)

    fun findByMarche(marcheId: Long): List<Decompte> =
        decompteRepository.findByMarcheId(marcheId)

    fun findByStatut(statut: StatutDecompte): List<Decompte> =
        decompteRepository.findByStatut(statut)

    fun create(decompte: Decompte): Decompte {
        require(decompte.id == null) { "Cannot create decompte with existing ID" }

        val marcheId = decompte.marche.id
            ?: throw IllegalArgumentException("L'ID du marché est requis")

        // Vérifier que le marché existe
        marcheRepository.findByIdOrNull(marcheId)
            ?: throw IllegalArgumentException("Marché avec ID $marcheId non trouvé")

        // Calculer les montants via les méthodes de l'entité
        decompte.calculerMontantTTC()
        decompte.calculerTotalRetenues()
        decompte.calculerNetAPayer()

        // Calculer le cumul
        val decomptesPrecedents = decompteRepository.findByMarcheIdAndStatutIn(
            marcheId,
            listOf(StatutDecompte.VALIDE, StatutDecompte.PAYE_TOTAL)
        )
        decompte.cumulPrecedent = decomptesPrecedents.sumOf { it.montantTTC }
        decompte.cumulActuel = (decompte.cumulPrecedent ?: BigDecimal.ZERO) + decompte.montantTTC

        return decompteRepository.save(decompte)
    }

    fun update(id: Long, decompte: Decompte): Decompte {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Décompte $id introuvable")

        // Seuls les décomptes en BROUILLON peuvent être modifiés
        require(existing.statut == StatutDecompte.BROUILLON) {
            "Seuls les décomptes en BROUILLON peuvent être modifiés"
        }

        existing.apply {
            numeroDecompte = decompte.numeroDecompte
            dateDecompte = decompte.dateDecompte
            periodeDebut = decompte.periodeDebut
            periodeFin = decompte.periodeFin
            montantBrutHT = decompte.montantBrutHT
            montantTVA = decompte.montantTVA
            observations = decompte.observations
        }

        // Recalculer les montants
        existing.calculerMontantTTC()
        existing.calculerTotalRetenues()
        existing.calculerNetAPayer()

        return decompteRepository.save(existing)
    }

    fun delete(id: Long) {
        val decompte = findById(id)
            ?: throw IllegalArgumentException("Décompte $id introuvable")

        require(decompte.statut == StatutDecompte.BROUILLON) {
            "Seuls les décomptes en BROUILLON peuvent être supprimés"
        }

        decompteRepository.delete(decompte)
    }

    // ========== Workflow Operations ==========

    fun soumettre(id: Long): Decompte {
        val decompte = findById(id)
            ?: throw IllegalArgumentException("Décompte $id introuvable")

        require(decompte.statut == StatutDecompte.BROUILLON) {
            "Seuls les décomptes en BROUILLON peuvent être soumis"
        }

        decompte.statut = StatutDecompte.SOUMIS
        return decompteRepository.save(decompte)
    }

    fun valider(id: Long, valideParId: Long): Decompte {
        val decompte = findById(id)
            ?: throw IllegalArgumentException("Décompte $id introuvable")

        require(decompte.statut == StatutDecompte.SOUMIS) {
            "Seuls les décomptes SOUMIS peuvent être validés"
        }

        decompte.apply {
            statut = StatutDecompte.VALIDE
            dateValidation = java.time.LocalDate.now()
            this.valideParId = valideParId
        }

        return decompteRepository.save(decompte)
    }

    fun rejeter(id: Long): Decompte {
        val decompte = findById(id)
            ?: throw IllegalArgumentException("Décompte $id introuvable")

        require(decompte.statut == StatutDecompte.SOUMIS) {
            "Seuls les décomptes SOUMIS peuvent être rejetés"
        }

        decompte.statut = StatutDecompte.REJETE
        return decompteRepository.save(decompte)
    }

    // ========== Statistiques ==========

    fun getTotalPayeByMarche(marcheId: Long): BigDecimal {
        return decompteRepository.findByMarcheIdAndStatutIn(
            marcheId,
            listOf(StatutDecompte.PAYE_TOTAL)
        ).sumOf { it.montantPaye }
    }

    fun getStatistiques(): DecompteStatistiques {
        val all = decompteRepository.findAll()
        return DecompteStatistiques(
            total = all.size,
            brouillon = all.count { it.statut == StatutDecompte.BROUILLON },
            soumis = all.count { it.statut == StatutDecompte.SOUMIS },
            valides = all.count { it.statut == StatutDecompte.VALIDE },
            montantTotal = all.sumOf { it.montantTTC }
        )
    }
}
