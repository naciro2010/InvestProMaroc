package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Ordre de Paiement (OP)
 */
@Entity
@Table(
    name = "ordres_paiement",
    indexes = [
        Index(name = "idx_op_numero", columnList = "numero_op"),
        Index(name = "idx_op_decompte", columnList = "decompte_id"),
        Index(name = "idx_op_statut", columnList = "statut")
    ]
)
class OrdrePaiement(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decompte_id", nullable = false)
    var decompte: Decompte,

    @Column(name = "numero_op", nullable = false, unique = true, length = 50)
    @field:NotBlank
    var numeroOP: String = "",

    @Column(name = "date_op", nullable = false)
    @field:NotNull
    var dateOP: LocalDate = LocalDate.now(),

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutOP = StatutOP.BROUILLON,

    // Montant
    @Column(name = "montant_a_payer", nullable = false, precision = 15, scale = 2)
    var montantAPayer: BigDecimal = BigDecimal.ZERO, // Peut être partiel

    @Column(name = "est_paiement_partiel", nullable = false)
    var estPaiementPartiel: Boolean = false,

    // Dates
    @Column(name = "date_prevue_paiement")
    var datePrevuePaiement: LocalDate? = null,

    // Mode et banque
    @Column(name = "mode_paiement", length = 20)
    @Enumerated(EnumType.STRING)
    var modePaiement: ModePaiement? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_bancaire_id")
    var compteBancaire: CompteBancaire? = null,

    @Column(columnDefinition = "TEXT")
    var observations: String? = null,

    // Validation
    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "valide_par_id")
    var valideParId: Long? = null,

    // Relations
    @OneToMany(mappedBy = "ordrePaiement", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var imputations: MutableList<OPImputation> = mutableListOf()

) : BaseEntity()

/**
 * Imputation analytique de l'ordre de paiement (Plan Analytique Dynamique)
 */
@Entity
@Table(
    name = "op_imputations",
    indexes = [
        Index(name = "idx_op_imp_op", columnList = "ordre_paiement_id"),
        Index(name = "idx_op_imp_dimensions", columnList = "dimensions_valeurs")
    ]
)
class OPImputation(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_paiement_id", nullable = false)
    var ordrePaiement: OrdrePaiement,

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
 * Mode de paiement
 */
enum class ModePaiement {
    VIREMENT,
    CHEQUE,
    ESPECES,
    AUTRE
}

/**
 * Statut de l'ordre de paiement
 */
enum class StatutOP {
    BROUILLON,      // En cours d'élaboration
    VALIDE,         // Validé (prêt à être payé)
    EXECUTE,        // Exécuté (paiement effectué)
    REJETE,         // Rejeté
    ANNULE          // Annulé
}
