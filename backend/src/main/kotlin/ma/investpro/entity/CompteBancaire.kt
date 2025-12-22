package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

@Entity
@Table(
    name = "comptes_bancaires",
    indexes = [
        Index(name = "idx_comptes_bancaires_code", columnList = "code"),
        Index(name = "idx_comptes_bancaires_rib", columnList = "rib"),
        Index(name = "idx_comptes_bancaires_actif", columnList = "actif")
    ]
)
class CompteBancaire(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(nullable = false, unique = true, length = 24)
    @field:NotBlank
    @field:Pattern(regexp = "^[0-9]{24}$", message = "Le RIB doit contenir 24 chiffres")
    var rib: String = "",

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var banque: String = "",

    @Column(length = 200)
    var agence: String? = null,

    @Column(name = "type_compte", length = 50)
    var typeCompte: String? = null,

    @Column(length = 200)
    var titulaire: String? = null,

    @Column(length = 10)
    var devise: String = "MAD",

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
