package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

/**
 * Entité ConventionBudgetLigne - Répartition du budget d'une convention par catégorie de dépense.
 *
 * Chaque ligne représente l'allocation d'un montant du budget de la convention
 * à une catégorie de dépense spécifique (Travaux, Fournitures, Services, etc.).
 */
@Entity
@Table(
    name = "convention_budget_lignes",
    indexes = [
        Index(name = "idx_conv_budget_lignes_conv", columnList = "convention_id"),
        Index(name = "idx_conv_budget_lignes_cat", columnList = "categorie_depense_id")
    ],
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_convention_budget_ligne_cat",
            columnNames = ["convention_id", "categorie_depense_id"]
        )
    ]
)
class ConventionBudgetLigne(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    @field:NotNull
    var convention: Convention? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_depense_id", nullable = false)
    @field:NotNull
    var categorieDepense: CategorieDepense? = null,

    @Column(length = 300)
    var designation: String? = null,

    @Column(nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montant: BigDecimal = BigDecimal.ZERO,

    @Column(precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var pourcentage: BigDecimal = BigDecimal.ZERO,

    @Column(name = "engagement_montant", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var engagementMontant: BigDecimal = BigDecimal.ZERO,

    @Column(name = "depenses_montant", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var depensesMontant: BigDecimal = BigDecimal.ZERO,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
