package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

/**
 * Entité BudgetLigneImputation - Répartition du montant d'une ligne budget par projet.
 *
 * Chaque imputation représente le pourcentage et montant d'une ligne budget
 * alloué à un projet spécifique (distribution analytique par projet).
 */
@Entity
@Table(
    name = "budget_ligne_imputations",
    indexes = [
        Index(name = "idx_budget_ligne_imp_ligne", columnList = "budget_ligne_id"),
        Index(name = "idx_budget_ligne_imp_projet", columnList = "projet_id")
    ],
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_budget_ligne_imp_projet",
            columnNames = ["budget_ligne_id", "projet_code"]
        )
    ]
)
class BudgetLigneImputation(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_ligne_id", nullable = false)
    @field:NotNull
    var budgetLigne: ConventionBudgetLigne? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    var projet: Projet? = null,

    @Column(name = "projet_code", nullable = false, length = 50)
    @field:NotBlank
    var projetCode: String = "",

    @Column(name = "projet_libelle", length = 200)
    var projetLibelle: String? = null,

    @Column(nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var pourcentage: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montant: BigDecimal = BigDecimal.ZERO

) : BaseEntity()
