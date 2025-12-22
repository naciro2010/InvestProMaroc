package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "conventions",
    indexes = [
        Index(name = "idx_conventions_code", columnList = "code"),
        Index(name = "idx_conventions_actif", columnList = "actif"),
        Index(name = "idx_conventions_dates", columnList = "date_debut,date_fin")
    ]
)
class Convention(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var libelle: String = "",

    @Column(name = "taux_commission", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var tauxCommission: BigDecimal = BigDecimal.ZERO,

    @Column(name = "base_calcul", nullable = false, length = 10)
    @field:NotBlank
    var baseCalcul: String = "HT", // HT, TTC, AUTRE

    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxTva: BigDecimal = BigDecimal("20.00"),

    @Column(name = "date_debut", nullable = false)
    @field:NotNull
    var dateDebut: LocalDate = LocalDate.now(),

    @Column(name = "date_fin")
    var dateFin: LocalDate? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null

) : BaseEntity()
