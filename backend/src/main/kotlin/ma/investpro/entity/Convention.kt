package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Convention - Conforme à XCOMPTA
 * Gestion des conventions avec 4 types: CADRE, NON_CADRE, SPECIFIQUE, AVENANT
 */
@Entity
@Table(
    name = "conventions",
    indexes = [
        Index(name = "idx_conventions_code", columnList = "code"),
        Index(name = "idx_conventions_numero", columnList = "numero"),
        Index(name = "idx_conventions_type", columnList = "type_convention"),
        Index(name = "idx_conventions_statut", columnList = "statut"),
        Index(name = "idx_conventions_actif", columnList = "actif"),
        Index(name = "idx_conventions_dates", columnList = "date_debut,date_fin")
    ]
)
class Convention(
    // Code interne (pour compatibilité avec l'ancien système)
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    var code: String = "",

    // Champs XCOMPTA - Informations de base
    @Column(nullable = false, unique = true, length = 100)
    @field:NotBlank
    var numero: String = "", // Numéro unique de la convention (ex: CONV-2024-001)

    @Column(name = "date_convention", nullable = false)
    @field:NotNull
    var dateConvention: LocalDate = LocalDate.now(), // Date de signature

    @Column(name = "type_convention", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var typeConvention: TypeConvention = TypeConvention.CADRE,

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutConvention = StatutConvention.EN_COURS,

    @Column(nullable = false, length = 200)
    @field:NotBlank
    var libelle: String = "",

    @Column(columnDefinition = "TEXT")
    var objet: String? = null, // Description détaillée

    // Champs financiers
    @Column(name = "taux_commission", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var tauxCommission: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false, precision = 15, scale = 2)
    var budget: BigDecimal = BigDecimal.ZERO, // Budget total en DH (stocké en DH, affiché en M DH)

    @Column(name = "base_calcul", nullable = false, length = 20)
    @field:NotBlank
    var baseCalcul: String = "DECAISSEMENTS_TTC", // DECAISSEMENTS_TTC, DECAISSEMENTS_HT

    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxTva: BigDecimal = BigDecimal("20.00"),

    // Dates
    @Column(name = "date_debut", nullable = false)
    @field:NotNull
    var dateDebut: LocalDate = LocalDate.now(),

    @Column(name = "date_fin")
    var dateFin: LocalDate? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    // Relations
    @OneToMany(mappedBy = "convention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var partenaires: MutableList<ConventionPartenaire> = mutableListOf(),

    @OneToMany(mappedBy = "convention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var imputationsPrevisionnelles: MutableList<ImputationPrevisionnelle> = mutableListOf(),

    @OneToMany(mappedBy = "convention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var versementsPrevisionnels: MutableList<VersementPrevisionnel> = mutableListOf()

) : BaseEntity()

/**
 * Type de convention selon XCOMPTA
 */
enum class TypeConvention {
    CADRE,          // Convention mère qui sert de cadre
    NON_CADRE,      // Convention indépendante avec partenaires
    SPECIFIQUE,     // Convention complète avec wizard 5 étapes
    AVENANT         // Modification d'une convention cadre
}

/**
 * Statut de la convention selon XCOMPTA
 */
enum class StatutConvention {
    VALIDEE,        // Convention validée
    EN_COURS,       // En cours d'exécution
    ACHEVE,         // Achevée/Terminée
    EN_RETARD,      // En retard par rapport au planning
    ANNULE          // Annulée
}
