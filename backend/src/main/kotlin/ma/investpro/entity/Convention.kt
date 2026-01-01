package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Convention - Gestion des conventions d'investissement
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

    // Informations de base
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
    var statut: StatutConvention = StatutConvention.BROUILLON,

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

    // Workflow fields
    @Column(name = "date_soumission")
    var dateSoumission: LocalDate? = null, // Date de soumission pour validation

    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null, // Date de validation (création V0)

    @Column(name = "valide_par_id")
    var valideParId: Long? = null, // ID de l'utilisateur qui a validé

    @Column(name = "version", length = 10)
    var version: String? = null, // Version courante (V0, V1, V2...)

    @Column(name = "is_locked", nullable = false)
    var isLocked: Boolean = false, // True si la convention est verrouillée après validation

    @Column(name = "motif_verrouillage", columnDefinition = "TEXT")
    var motifVerrouillage: String? = null, // Raison du verrouillage

    // Sous-convention fields (self-referencing parent-child)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_convention_id")
    var parentConvention: Convention? = null, // Convention parente pour sous-conventions

    @Column(name = "herite_parametres", nullable = false)
    var heriteParametres: Boolean = false, // True si hérite des paramètres de la convention parente

    @Column(name = "surcharge_taux_commission")
    var surchargeTauxCommission: BigDecimal? = null, // Surcharge du taux de commission (si différent du parent)

    @Column(name = "surcharge_base_calcul", length = 50)
    var surchargeBaseCalcul: String? = null, // Surcharge de la base de calcul (si différent du parent)

    // Relations
    @OneToMany(mappedBy = "parentConvention", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var sousConventions: MutableList<Convention> = mutableListOf(), // Sous-conventions de cette convention

    @OneToMany(mappedBy = "convention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var partenaires: MutableList<ConventionPartenaire> = mutableListOf(),

    @OneToMany(mappedBy = "convention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var imputationsPrevisionnelles: MutableList<ImputationPrevisionnelle> = mutableListOf(),

    @OneToMany(mappedBy = "convention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var versementsPrevisionnels: MutableList<VersementPrevisionnel> = mutableListOf()

) : BaseEntity() {

    /**
     * Retourne le taux de commission effectif (avec héritage si sous-convention)
     */
    fun getTauxCommissionEffectif(): BigDecimal {
        val parent = parentConvention
        return if (heriteParametres && parent != null) {
            surchargeTauxCommission ?: parent.getTauxCommissionEffectif()
        } else {
            tauxCommission
        }
    }

    /**
     * Retourne la base de calcul effective (avec héritage si sous-convention)
     */
    fun getBaseCalculEffective(): String {
        val parent = parentConvention
        return if (heriteParametres && parent != null) {
            surchargeBaseCalcul ?: parent.getBaseCalculEffective()
        } else {
            baseCalcul
        }
    }

    /**
     * Vérifie si cette convention est une sous-convention
     */
    fun isSousConvention(): Boolean = parentConvention != null

    /**
     * Vérifie si cette convention a des sous-conventions
     */
    fun hasSousConventions(): Boolean = sousConventions.isNotEmpty()
}

/**
 * Type de convention
 */
enum class TypeConvention {
    CADRE,          // Convention mère qui sert de cadre
    NON_CADRE,      // Convention indépendante avec partenaires
    SPECIFIQUE,     // Convention complète avec wizard 5 étapes
    AVENANT         // Modification d'une convention cadre
}

/**
 * Statut de la convention avec workflow complet
 */
enum class StatutConvention {
    BROUILLON,      // Brouillon en cours de saisie (éditable)
    SOUMIS,         // Soumis pour validation (non éditable)
    VALIDEE,        // Convention validée avec V0 créée (verrouillée)
    EN_COURS,       // En cours d'exécution
    ACHEVE,         // Achevée/Terminée
    EN_RETARD,      // En retard par rapport au planning
    ANNULE          // Annulée
}
