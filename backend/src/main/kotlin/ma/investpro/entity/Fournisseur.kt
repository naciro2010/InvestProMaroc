package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

@Entity
@Table(
    name = "fournisseurs",
    indexes = [
        Index(name = "idx_fournisseurs_code", columnList = "code"),
        Index(name = "idx_fournisseurs_ice", columnList = "ice"),
        Index(name = "idx_fournisseurs_actif", columnList = "actif"),
        Index(name = "idx_fournisseurs_non_resident", columnList = "non_resident")
    ]
)
class Fournisseur(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(name = "raison_sociale", nullable = false, length = 200)
    @field:NotBlank
    var raisonSociale: String = "",

    @Column(name = "identifiant_fiscal", length = 20)
    @field:Pattern(regexp = "^[0-9]*$")
    var identifiantFiscal: String? = null,

    @Column(unique = true, length = 15)
    @field:Pattern(regexp = "^[0-9]{15}$")
    var ice: String? = null,

    @Column(columnDefinition = "TEXT")
    var adresse: String? = null,

    @Column(length = 100)
    var ville: String? = null,

    @Column(length = 20)
    var telephone: String? = null,

    @Column(length = 20)
    var fax: String? = null,

    @Column(length = 150)
    @field:Email
    var email: String? = null,

    @Column(length = 100)
    var contact: String? = null,

    @Column(name = "non_resident", nullable = false)
    var nonResident: Boolean = false,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
