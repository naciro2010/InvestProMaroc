package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

/**
 * Entité DimensionAnalytique - Configuration des dimensions d'analyse
 * Permet de créer des dimensions personnalisées (Région, Marché, Phase, etc.)
 * Approche DDD simplifiée
 */
@Entity
@Table(
    name = "dimensions_analytiques",
    indexes = [
        Index(name = "idx_dimensions_code", columnList = "code"),
        Index(name = "idx_dimensions_active", columnList = "active")
    ]
)
class DimensionAnalytique(

    @Column(nullable = false, unique = true, length = 20)
    @field:NotBlank
    var code: String = "", // Code court (ex: "REG", "MARCH", "PHASE")

    @Column(nullable = false, length = 100)
    @field:NotBlank
    var nom: String = "", // Nom de la dimension (ex: "Région", "Type Marché")

    @Column(length = 500)
    var description: String? = null,

    @Column(nullable = false)
    var ordre: Int = 0, // Ordre d'affichage

    @Column(nullable = false)
    var active: Boolean = true, // Active ou non

    @Column(nullable = false)
    var obligatoire: Boolean = false, // Obligatoire pour imputation ?

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    var createdBy: User? = null,

    // Valeurs possibles
    @OneToMany(mappedBy = "dimension", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var valeurs: MutableList<ValeurDimension> = mutableListOf()

) : BaseEntity() {

    /**
     * Ajouter une valeur à la dimension
     */
    fun ajouterValeur(valeur: ValeurDimension) {
        valeur.dimension = this
        valeurs.add(valeur)
    }

    /**
     * Retirer une valeur de la dimension
     */
    fun retirerValeur(valeur: ValeurDimension) {
        valeurs.remove(valeur)
        valeur.dimension = null
    }

    /**
     * Vérifier si la dimension a des valeurs actives
     */
    fun hasValeursActives(): Boolean {
        return valeurs.any { it.active }
    }
}
