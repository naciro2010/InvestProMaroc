package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

/**
 * Entité Partenaire - Organismes participant aux conventions
 * Exemples: Ministères, Agences publiques, Organismes internationaux
 */
@Entity
@Table(
    name = "partenaires",
    indexes = [
        Index(name = "idx_partenaires_code", columnList = "code"),
        Index(name = "idx_partenaires_actif", columnList = "actif")
    ]
)
class Partenaire(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(name = "raison_sociale", nullable = false, length = 200)
    @field:NotBlank
    var raisonSociale: String = "",

    @Column(length = 100)
    var sigle: String? = null, // Sigle/Acronyme (ex: AFD, BM, MASEN)

    @Column(name = "type_partenaire", length = 50)
    var typePartenaire: String? = null, // Ministère, Agence, Bailleur, etc.

    @Column(length = 100)
    var email: String? = null,

    @Column(length = 20)
    var telephone: String? = null,

    @Column(columnDefinition = "TEXT")
    var adresse: String? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null

) : BaseEntity()
