package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

/**
 * Entité ConventionPartenaire - Table de liaison entre Convention et Partenaire
 * Contient les allocations budgétaires et rôles (MO/MOD)
 */
@Entity
@Table(
    name = "convention_partenaires",
    indexes = [
        Index(name = "idx_convention_partenaires_convention", columnList = "convention_id"),
        Index(name = "idx_convention_partenaires_partenaire", columnList = "partenaire_id")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_convention_partenaire", columnNames = ["convention_id", "partenaire_id"])
    ]
)
class ConventionPartenaire(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    @field:NotNull
    var convention: Convention? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partenaire_id", nullable = false)
    @field:NotNull
    var partenaire: Partenaire? = null,

    // Allocation budgétaire du partenaire
    @Column(name = "budget_alloue", nullable = false, precision = 15, scale = 2)
    var budgetAlloue: BigDecimal = BigDecimal.ZERO, // En DH

    @Column(nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var pourcentage: BigDecimal = BigDecimal.ZERO, // % du budget total

    @Column(name = "commission_intervention", precision = 15, scale = 2)
    var commissionIntervention: BigDecimal? = null, // CI = budget × taux

    // Rôles dans la convention
    @Column(name = "est_maitre_oeuvre")
    var estMaitreOeuvre: Boolean = false, // MO

    @Column(name = "est_maitre_oeuvre_delegue")
    var estMaitreOeuvreDelegue: Boolean = false, // MOD

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
