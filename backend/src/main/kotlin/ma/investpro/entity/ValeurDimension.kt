package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

/**
 * Entité ValeurDimension - Valeurs possibles d'une dimension
 * Ex: Pour dimension "Région": Casablanca, Rabat, Marrakech
 * Approche DDD simplifiée
 */
@Entity
@Table(
    name = "valeurs_dimensions",
    indexes = [
        Index(name = "idx_valeurs_dimension", columnList = "dimension_id"),
        Index(name = "idx_valeurs_active", columnList = "active")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_valeur_code", columnNames = ["dimension_id", "code"])
    ]
)
class ValeurDimension(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dimension_id", nullable = false)
    var dimension: DimensionAnalytique? = null,

    @Column(nullable = false, length = 50)
    @field:NotBlank
    var code: String = "", // Code de la valeur (ex: "CAS", "RAB", "MAR")

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var libelle: String = "", // Libellé (ex: "Casablanca", "Rabat", "Marrakech")

    @Column(length = 500)
    var description: String? = null,

    @Column(nullable = false)
    var active: Boolean = true, // Active ou non

    @Column(nullable = false)
    var ordre: Int = 0, // Ordre d'affichage

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

) : BaseEntity()
