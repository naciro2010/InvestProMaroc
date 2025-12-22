package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

@Entity
@Table(
    name = "projets",
    indexes = [
        Index(name = "idx_projets_code", columnList = "code"),
        Index(name = "idx_projets_actif", columnList = "actif"),
        Index(name = "idx_projets_statut", columnList = "statut")
    ]
)
class Projet(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var nom: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(length = 100)
    var responsable: String? = null,

    @Column(length = 50)
    var statut: String? = null

) : BaseEntity()
