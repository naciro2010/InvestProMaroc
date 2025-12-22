package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

@Entity
@Table(
    name = "axes_analytiques",
    indexes = [
        Index(name = "idx_axes_analytiques_code", columnList = "code"),
        Index(name = "idx_axes_analytiques_actif", columnList = "actif"),
        Index(name = "idx_axes_analytiques_type", columnList = "type")
    ]
)
class AxeAnalytique(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var libelle: String = "",

    @Column(length = 50)
    var type: String? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null

) : BaseEntity()
