package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Projet - Gestion des projets d'investissement
 *
 * Un projet représente une initiative ou un programme d'investissement qui peut être lié à une convention.
 * Les projets peuvent avoir un budget, des dates de réalisation et être suivis analytiquement.
 *
 * Relations:
 * - Projet → Convention (Many-to-One, optionnel)
 * - Projet → Partenaire (Chef de projet) (Many-to-One, optionnel)
 */
@Entity
@Table(
    name = "projets",
    indexes = [
        Index(name = "idx_projets_code", columnList = "code", unique = true),
        Index(name = "idx_projets_convention", columnList = "convention_id"),
        Index(name = "idx_projets_statut", columnList = "statut"),
        Index(name = "idx_projets_dates", columnList = "date_debut,date_fin_prevue")
    ]
)
class Projet(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "", // Code unique du projet (ex: PRJ-2024-001)

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var nom: String = "", // Nom/titre du projet

    @Column(columnDefinition = "TEXT")
    var description: String? = null, // Description détaillée

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id")
    var convention: Convention? = null, // Convention de rattachement (optionnel)

    @Column(name = "budget_total", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var budgetTotal: BigDecimal = BigDecimal.ZERO,

    @Column(name = "date_debut")
    var dateDebut: LocalDate? = null,

    @Column(name = "date_fin_prevue")
    var dateFinPrevue: LocalDate? = null,

    @Column(name = "date_fin_reelle")
    var dateFinReelle: LocalDate? = null,

    @Column(name = "duree_mois")
    var dureeMois: Int? = null, // Durée estimée en mois

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chef_projet_id")
    var chefProjet: Partenaire? = null, // Chef de projet / Responsable

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutProjet = StatutProjet.EN_PREPARATION,

    @Column(name = "pourcentage_avancement")
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var pourcentageAvancement: BigDecimal = BigDecimal.ZERO, // % d'avancement

    @Column(length = 200)
    var localisation: String? = null, // Localisation géographique

    @Column(columnDefinition = "TEXT")
    var objectifs: String? = null, // Objectifs du projet

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity() {

    /**
     * Calcule la date de fin prévue si durée est fournie
     */
    fun calculerDateFinPrevue() {
        if (dateDebut != null && dureeMois != null) {
            dateFinPrevue = dateDebut!!.plusMonths(dureeMois!!.toLong())
        }
    }

    /**
     * Vérifie si le projet est en retard
     */
    fun estEnRetard(): Boolean {
        val aujourd = LocalDate.now()
        return dateFinPrevue != null &&
               aujourd.isAfter(dateFinPrevue) &&
               statut != StatutProjet.TERMINE &&
               statut != StatutProjet.ANNULE
    }

    /**
     * Vérifie si le projet est actif
     */
    fun estActif(): Boolean {
        return statut == StatutProjet.EN_COURS || statut == StatutProjet.EN_PREPARATION
    }
}

/**
 * Statut d'un projet
 */
enum class StatutProjet {
    EN_PREPARATION,  // Projet en phase de préparation
    EN_COURS,        // Projet en cours d'exécution
    SUSPENDU,        // Projet suspendu temporairement
    TERMINE,         // Projet terminé
    ANNULE           // Projet annulé
}
