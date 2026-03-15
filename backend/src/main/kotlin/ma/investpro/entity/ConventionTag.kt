package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

/**
 * Tags/Étiquettes pour catégoriser les conventions.
 * Permet un système de tagging flexible (style Jira labels).
 */
@Entity
@Table(
    name = "convention_tags",
    indexes = [
        Index(name = "idx_conv_tags_name", columnList = "name"),
        Index(name = "idx_conv_tags_color", columnList = "color")
    ]
)
class ConventionTag(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var name: String = "",

    /** Couleur du tag (hex: #FF5733) */
    @Column(nullable = false, length = 7)
    var color: String = "#6e5dc6",

    @Column(length = 200)
    var description: String? = null,

    /** Conventions associées à ce tag */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "convention_tag_assignments",
        joinColumns = [JoinColumn(name = "tag_id")],
        inverseJoinColumns = [JoinColumn(name = "convention_id")]
    )
    var conventions: MutableSet<Convention> = mutableSetOf()
) : BaseEntity()
