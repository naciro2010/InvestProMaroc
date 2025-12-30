package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Décompte - Situation de travaux/prestations
 */
@Entity
@Table(
    name = "decomptes",
    indexes = [
        Index(name = "idx_decomptes_marche", columnList = "marche_id"),
        Index(name = "idx_decomptes_numero", columnList = "numero_decompte"),
        Index(name = "idx_decomptes_statut", columnList = "statut")
    ]
)
class Decompte(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche,

    @Column(name = "numero_decompte", nullable = false, length = 50)
    @field:NotBlank
    var numeroDecompte: String = "", // N° décompte (ex: DEC-001)

    @Column(name = "date_decompte", nullable = false)
    @field:NotNull
    var dateDecompte: LocalDate = LocalDate.now(),

    @Column(name = "periode_debut", nullable = false)
    var periodeDebut: LocalDate,

    @Column(name = "periode_fin", nullable = false)
    var periodeFin: LocalDate,

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutDecompte = StatutDecompte.BROUILLON,

    // Montants
    @Column(name = "montant_brut_ht", nullable = false, precision = 15, scale = 2)
    var montantBrutHT: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_tva", nullable = false, precision = 15, scale = 2)
    var montantTVA: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_ttc", nullable = false, precision = 15, scale = 2)
    var montantTTC: BigDecimal = BigDecimal.ZERO,

    // Retenues
    @Column(name = "total_retenues", nullable = false, precision = 15, scale = 2)
    var totalRetenues: BigDecimal = BigDecimal.ZERO,

    // Net à payer
    @Column(name = "net_a_payer", nullable = false, precision = 15, scale = 2)
    var netAPayer: BigDecimal = BigDecimal.ZERO,

    // Cumul
    @Column(name = "cumul_precedent", precision = 15, scale = 2)
    var cumulPrecedent: BigDecimal? = BigDecimal.ZERO,

    @Column(name = "cumul_actuel", precision = 15, scale = 2)
    var cumulActuel: BigDecimal? = BigDecimal.ZERO,

    @Column(columnDefinition = "TEXT")
    var observations: String? = null,

    // Validation
    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "valide_par_id")
    var valideParId: Long? = null,

    // Paiement
    @Column(name = "montant_paye", precision = 15, scale = 2)
    var montantPaye: BigDecimal = BigDecimal.ZERO,

    @Column(name = "est_solde", nullable = false)
    var estSolde: Boolean = false, // True si cumul payé = net à payer

    // Relations
    @OneToMany(mappedBy = "decompte", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var retenues: MutableList<DecompteRetenue> = mutableListOf(),

    @OneToMany(mappedBy = "decompte", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var imputations: MutableList<DecompteImputation> = mutableListOf()

) : BaseEntity() {

    /**
     * Calcule le montant TTC
     */
    fun calculerMontantTTC() {
        montantTTC = montantBrutHT + montantTVA
    }

    /**
     * Calcule le total des retenues
     */
    fun calculerTotalRetenues() {
        totalRetenues = retenues.filter { it.actif }.fold(BigDecimal.ZERO) { acc, retenue ->
            acc + retenue.montant
        }
    }

    /**
     * Calcule le net à payer
     */
    fun calculerNetAPayer() {
        netAPayer = montantTTC - totalRetenues
    }

    /**
     * Vérifie si le décompte est soldé
     */
    fun verifierSolde() {
        estSolde = montantPaye >= netAPayer
    }
}

/**
 * Retenues sur décompte (garantie, RAS, pénalités...)
 */
@Entity
@Table(
    name = "decompte_retenues",
    indexes = [
        Index(name = "idx_decompte_ret_decompte", columnList = "decompte_id"),
        Index(name = "idx_decompte_ret_type", columnList = "type_retenue")
    ]
)
class DecompteRetenue(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decompte_id", nullable = false)
    var decompte: Decompte,

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var typeRetenue: TypeRetenue,

    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal = BigDecimal.ZERO,

    @Column(name = "taux_pourcent", precision = 5, scale = 2)
    var tauxPourcent: BigDecimal? = null,

    @Column(length = 200)
    var libelle: String? = null

) : BaseEntity()

/**
 * Imputation analytique du décompte (Plan Analytique Dynamique)
 */
@Entity
@Table(
    name = "decompte_imputations",
    indexes = [
        Index(name = "idx_decompte_imp_decompte", columnList = "decompte_id"),
        Index(name = "idx_decompte_imp_dimensions", columnList = "dimensions_valeurs")
    ]
)
class DecompteImputation(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decompte_id", nullable = false)
    var decompte: Decompte,

    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal = BigDecimal.ZERO,

    // Imputation analytique flexible (Plan Analytique Dynamique)
    // Stockage JSONB des valeurs de dimensions
    // Exemple: {"REG": "CAS", "MARCH": "TRAVAUX", "PHASE": "REAL", "SOURCE": "AFD"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensions_valeurs", nullable = false, columnDefinition = "jsonb")
    var dimensionsValeurs: Map<String, String> = mutableMapOf(),

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity() {

    /**
     * Obtenir la valeur d'une dimension spécifique
     */
    fun getValeurDimension(codeDimension: String): String? {
        return dimensionsValeurs[codeDimension]
    }

    /**
     * Définir la valeur d'une dimension
     */
    fun setValeurDimension(codeDimension: String, codeValeur: String) {
        val mutableMap = dimensionsValeurs.toMutableMap()
        mutableMap[codeDimension] = codeValeur
        dimensionsValeurs = mutableMap
    }

    /**
     * Vérifier si toutes les dimensions obligatoires sont renseignées
     */
    fun isComplete(dimensionsObligatoires: List<String>): Boolean {
        return dimensionsObligatoires.all { dimensionsValeurs.containsKey(it) }
    }
}

/**
 * Type de retenue
 */
enum class TypeRetenue {
    GARANTIE,       // Retenue de garantie
    RAS,            // Retenue à la source (impôts)
    PENALITES,      // Pénalités de retard
    AVANCES         // Remboursement d'avances
}

/**
 * Statut du décompte
 */
enum class StatutDecompte {
    BROUILLON,      // En cours d'élaboration
    SOUMIS,         // Soumis pour validation
    VALIDE,         // Validé
    REJETE,         // Rejeté
    PAYE_PARTIEL,   // Partiellement payé
    PAYE_TOTAL      // Totalement payé (soldé)
}
