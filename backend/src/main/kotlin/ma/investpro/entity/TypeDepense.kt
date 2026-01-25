package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

/**
 * Entité TypeDepense - Référentiel des types de dépenses
 *
 * Permet de catégoriser les dépenses dans les marchés/décomptes
 * Exemples: Travaux, Fournitures, Services, Etudes, Formation, etc.
 *
 * Utilisé pour faciliter la saisie et assurer la cohérence des données
 */
@Entity
@Table(
    name = "types_depenses",
    indexes = [
        Index(name = "idx_types_depenses_code", columnList = "code", unique = true),
        Index(name = "idx_types_depenses_libelle", columnList = "libelle"),
        Index(name = "idx_types_depenses_actif", columnList = "actif")
    ]
)
class TypeDepense(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var libelle: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "categorie", length = 100)
    var categorie: String? = null, // Catégorie (ex: Investissement, Fonctionnement)

    @Column(name = "ordre_affichage")
    var ordreAffichage: Int? = null // Pour trier l'affichage dans les listes

) : BaseEntity()
