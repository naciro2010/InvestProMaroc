package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Budget - Gestion des budgets avec versions (V0, V1, V2...)
 * V0 = Budget initial, V1/V2/V3 = Révisions budgétaires
 */
@Entity
@Table(
    name = "budgets",
    indexes = [
        Index(name = "idx_budgets_convention", columnList = "convention_id"),
        Index(name = "idx_budgets_version", columnList = "version"),
        Index(name = "idx_budgets_statut", columnList = "statut")
    ]
)
class Budget(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(nullable = false, length = 10)
    @field:NotBlank
    var version: String = "V0", // V0, V1, V2, V3...

    @Column(name = "date_budget", nullable = false)
    @field:NotNull
    var dateBudget: LocalDate = LocalDate.now(),

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutBudget = StatutBudget.BROUILLON,

    // Plafond et total
    @Column(name = "plafond_convention", nullable = false, precision = 15, scale = 2)
    var plafondConvention: BigDecimal = BigDecimal.ZERO,

    @Column(name = "total_budget", nullable = false, precision = 15, scale = 2)
    var totalBudget: BigDecimal = BigDecimal.ZERO,

    // Révision (si version > V0)
    @Column(name = "budget_precedent_id")
    var budgetPrecedentId: Long? = null, // Reference to previous budget version

    @Column(name = "delta_montant", precision = 15, scale = 2)
    var deltaMontant: BigDecimal? = null, // Difference with previous version

    @Column(columnDefinition = "TEXT")
    var justification: String? = null, // Justification for revision

    @Column(columnDefinition = "TEXT")
    var observations: String? = null,

    // Validation
    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "valide_par_id")
    var valideParId: Long? = null,

    // Relations
    @OneToMany(mappedBy = "budget", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var lignes: MutableList<LigneBudget> = mutableListOf()

) : BaseEntity() {

    /**
     * Calcule le total du budget à partir des lignes
     */
    fun calculerTotal() {
        totalBudget = lignes.filter { it.actif }.fold(BigDecimal.ZERO) { acc, ligne ->
            acc + ligne.montant
        }
    }

    /**
     * Vérifie que le total ne dépasse pas le plafond
     */
    fun verifierPlafond(): Boolean {
        return totalBudget <= plafondConvention
    }

    /**
     * Calcule le delta avec le budget précédent
     */
    fun calculerDelta(montantPrecedent: BigDecimal) {
        deltaMontant = totalBudget - montantPrecedent
    }
}

/**
 * Ligne de budget (chapitre/poste budgétaire)
 */
@Entity
@Table(name = "lignes_budget")
class LigneBudget(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    var budget: Budget,

    @Column(nullable = false, length = 50)
    @field:NotBlank
    var code: String = "", // Code du chapitre/poste

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var libelle: String = "",

    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal = BigDecimal.ZERO,

    @Column(name = "ordre_affichage")
    var ordreAffichage: Int = 0,

    @Column(columnDefinition = "TEXT")
    var description: String? = null

) : BaseEntity()

/**
 * Statut du budget
 */
enum class StatutBudget {
    BROUILLON,      // En cours d'élaboration
    SOUMIS,         // Soumis pour validation
    VALIDE,         // Validé
    REJETE,         // Rejeté
    ARCHIVE         // Archivé (remplacé par nouvelle version)
}
