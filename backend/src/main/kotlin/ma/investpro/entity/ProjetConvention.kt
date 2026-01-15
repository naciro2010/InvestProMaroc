package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull

/**
 * Entité ProjetConvention - Association Many-to-Many entre Projets et Conventions
 *
 * Gère les associations entre un projet et ses conventions liées.
 * Un projet peut être associé à plusieurs conventions (cadre, non-cadre, etc.)
 * Une convention peut être liée à plusieurs projets.
 *
 * Relations:
 * - ProjetConvention → Projet (Many-to-One)
 * - ProjetConvention → Convention (Many-to-One)
 */
@Entity
@Table(
    name = "projet_conventions",
    indexes = [
        Index(name = "idx_projet_conventions_projet", columnList = "projet_id"),
        Index(name = "idx_projet_conventions_convention", columnList = "convention_id"),
        Index(name = "idx_projet_conventions_ordre", columnList = "projet_id,ordre")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_projet_convention", columnNames = ["projet_id", "convention_id"])
    ]
)
class ProjetConvention(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    @field:NotNull
    var projet: Projet? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    @field:NotNull
    var convention: Convention? = null,

    @Column(name = "ordre", nullable = false)
    var ordre: Int = 0 // Ordre d'affichage de la convention pour ce projet

) : BaseEntity()
