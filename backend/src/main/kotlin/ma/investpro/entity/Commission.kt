package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "commissions",
    indexes = [
        Index(name = "idx_commissions_depense", columnList = "depense_id"),
        Index(name = "idx_commissions_convention", columnList = "convention_id"),
        Index(name = "idx_commissions_date", columnList = "date_calcul")
    ]
)
class Commission(
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depense_id", nullable = false, unique = true)
    var depense: DepenseInvestissement? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention? = null,

    @Column(name = "date_calcul", nullable = false)
    @field:NotNull
    var dateCalcul: LocalDate = LocalDate.now(),

    // Base de calcul
    @Column(name = "base_calcul", nullable = false, length = 10)
    @field:NotBlank
    var baseCalcul: String = "HT",

    @Column(name = "montant_base", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantBase: BigDecimal = BigDecimal.ZERO,

    // Taux (stockés pour historique)
    @Column(name = "taux_commission", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxCommission: BigDecimal = BigDecimal.ZERO,

    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxTva: BigDecimal = BigDecimal.ZERO,

    // Montants calculés
    @Column(name = "montant_commission_ht", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantCommissionHt: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_tva_commission", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantTvaCommission: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_commission_ttc", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantCommissionTtc: BigDecimal = BigDecimal.ZERO,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
