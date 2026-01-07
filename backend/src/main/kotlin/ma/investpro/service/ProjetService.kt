package ma.investpro.service

import ma.investpro.entity.Projet
import ma.investpro.entity.StatutProjet
import ma.investpro.repository.ProjetRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Transactional
class ProjetService(
    private val projetRepository: ProjetRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<Projet> = projetRepository.findAll()

    fun findById(id: Long): Projet? = projetRepository.findByIdOrNull(id)

    fun findByCode(code: String): Projet? = projetRepository.findByCode(code)

    fun findByStatut(statut: StatutProjet): List<Projet> = projetRepository.findByStatut(statut)

    fun findByConventionId(conventionId: Long): List<Projet> = projetRepository.findByConventionId(conventionId)

    fun findByChefProjetId(chefProjetId: Long): List<Projet> = projetRepository.findByChefProjetId(chefProjetId)

    fun findProjetsActifs(): List<Projet> = projetRepository.findProjetsActifs()

    fun findProjetsEnRetard(): List<Projet> = projetRepository.findProjetsEnRetard()

    fun findByPeriode(debut: LocalDate, fin: LocalDate): List<Projet> =
        projetRepository.findByPeriode(debut, fin)

    fun search(query: String): List<Projet> = projetRepository.search(query)

    fun create(projet: Projet): Projet {
        require(projet.id == null) { "Cannot create projet with existing ID" }
        require(!projetRepository.existsByCode(projet.code)) {
            "Projet avec code ${projet.code} existe déjà"
        }

        // Calculer date fin prévue si durée fournie
        if (projet.dateDebut != null && projet.dureeMois != null && projet.dateFinPrevue == null) {
            projet.calculerDateFinPrevue()
        }

        return projetRepository.save(projet)
    }

    fun update(id: Long, projet: Projet): Projet {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        // Mise à jour des champs
        existing.apply {
            nom = projet.nom
            description = projet.description
            convention = projet.convention
            budgetTotal = projet.budgetTotal
            dateDebut = projet.dateDebut
            dateFinPrevue = projet.dateFinPrevue
            dateFinReelle = projet.dateFinReelle
            dureeMois = projet.dureeMois
            chefProjet = projet.chefProjet
            statut = projet.statut
            pourcentageAvancement = projet.pourcentageAvancement
            localisation = projet.localisation
            objectifs = projet.objectifs
            remarques = projet.remarques
        }

        // Recalculer date fin si nécessaire
        if (existing.dateDebut != null && existing.dureeMois != null) {
            existing.calculerDateFinPrevue()
        }

        return projetRepository.save(existing)
    }

    fun delete(id: Long) {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        projetRepository.delete(projet)
    }

    // ========== Business Operations ==========

    /**
     * Démarrer un projet (EN_PREPARATION → EN_COURS)
     */
    fun demarrer(id: Long): Projet {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        require(projet.statut == StatutProjet.EN_PREPARATION) {
            "Seuls les projets EN_PREPARATION peuvent être démarrés"
        }

        projet.statut = StatutProjet.EN_COURS
        if (projet.dateDebut == null) {
            projet.dateDebut = LocalDate.now()
        }

        return projetRepository.save(projet)
    }

    /**
     * Suspendre un projet
     */
    fun suspendre(id: Long, motif: String?): Projet {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        require(projet.statut == StatutProjet.EN_COURS) {
            "Seuls les projets EN_COURS peuvent être suspendus"
        }

        projet.statut = StatutProjet.SUSPENDU
        if (motif != null) {
            projet.remarques = (projet.remarques ?: "") + "\n[SUSPENSION] $motif"
        }

        return projetRepository.save(projet)
    }

    /**
     * Reprendre un projet suspendu
     */
    fun reprendre(id: Long): Projet {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        require(projet.statut == StatutProjet.SUSPENDU) {
            "Seuls les projets SUSPENDUS peuvent être repris"
        }

        projet.statut = StatutProjet.EN_COURS

        return projetRepository.save(projet)
    }

    /**
     * Terminer un projet
     */
    fun terminer(id: Long): Projet {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        require(projet.statut == StatutProjet.EN_COURS || projet.statut == StatutProjet.SUSPENDU) {
            "Seuls les projets EN_COURS ou SUSPENDUS peuvent être terminés"
        }

        projet.statut = StatutProjet.TERMINE
        projet.dateFinReelle = LocalDate.now()
        projet.pourcentageAvancement = 100.toBigDecimal()

        return projetRepository.save(projet)
    }

    /**
     * Annuler un projet
     */
    fun annuler(id: Long, motif: String?): Projet {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        require(projet.statut != StatutProjet.TERMINE) {
            "Un projet terminé ne peut pas être annulé"
        }

        projet.statut = StatutProjet.ANNULE
        if (motif != null) {
            projet.remarques = (projet.remarques ?: "") + "\n[ANNULATION] $motif"
        }

        return projetRepository.save(projet)
    }

    /**
     * Mettre à jour l'avancement d'un projet
     */
    fun mettreAJourAvancement(id: Long, pourcentage: Double): Projet {
        val projet = findById(id)
            ?: throw IllegalArgumentException("Projet $id introuvable")

        require(pourcentage in 0.0..100.0) {
            "Le pourcentage d'avancement doit être entre 0 et 100"
        }

        projet.pourcentageAvancement = pourcentage.toBigDecimal()

        // Si 100%, considérer comme terminé
        if (pourcentage >= 100.0 && projet.statut == StatutProjet.EN_COURS) {
            projet.statut = StatutProjet.TERMINE
            projet.dateFinReelle = LocalDate.now()
        }

        return projetRepository.save(projet)
    }

    // ========== Statistics ==========

    fun getStatistiques(): Map<String, Long> {
        return mapOf(
            "total" to projetRepository.count(),
            "EN_PREPARATION" to projetRepository.countByStatut(StatutProjet.EN_PREPARATION),
            "EN_COURS" to projetRepository.countByStatut(StatutProjet.EN_COURS),
            "SUSPENDU" to projetRepository.countByStatut(StatutProjet.SUSPENDU),
            "TERMINE" to projetRepository.countByStatut(StatutProjet.TERMINE),
            "ANNULE" to projetRepository.countByStatut(StatutProjet.ANNULE),
            "EN_RETARD" to projetRepository.findProjetsEnRetard().size.toLong()
        )
    }
}
