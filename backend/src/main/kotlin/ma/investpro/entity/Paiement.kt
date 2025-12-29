package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Paiement - Paiement réel effectué
 */
@Entity
@Table(
    name = "paiements",
    indexes = [
        Index(name = "idx_paiements_op", columnList = "ordre_paiement_id"),
        Index(name = "idx_paiements_reference", columnList = "reference_paiement")
    ]
)
class Paiement(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_paiement_id", nullable = false)
    var ordrePaiement: OrdrePaiement,

    @Column(name = "reference_paiement", nullable = false, unique = true, length = 100)
    @field:NotBlank
    var referencePaiement: String = "", // Référence virement/chèque

    @Column(name = "date_valeur", nullable = false)
    @field:NotNull
    var dateValeur: LocalDate = LocalDate.now(), // Date de valeur bancaire

    @Column(name = "date_execution")
    var dateExecution: LocalDate? = null, // Date d'exécution effective

    // Montant
    @Column(name = "montant_paye", nullable = false, precision = 15, scale = 2)
    var montantPaye: BigDecimal = BigDecimal.ZERO, // Peut être partiel

    @Column(name = "est_paiement_partiel", nullable = false)
    var estPaiementPartiel: Boolean = false,

    // Mode
    @Column(name = "mode_paiement", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var modePaiement: ModePaiement,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_bancaire_id")
    var compteBancaire: CompteBancaire? = null,

    @Column(columnDefinition = "TEXT")
    var observations: String? = null,

    // Relations
    @OneToMany(mappedBy = "paiement", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var imputations: MutableList<PaiementImputation> = mutableListOf()

) : BaseEntity()

/**
 * Imputation analytique du paiement (Plan Analytique Dynamique)
 * Permet le suivi RÉEL vs BUDGET par dimensions
 */
@Entity
@Table(
    name = "paiement_imputations",
    indexes = [
        Index(name = "idx_paiement_imp_paiement", columnList = "paiement_id"),
        Index(name = "idx_paiement_imp_dimensions", columnList = "dimensions_valeurs")
    ]
)
class PaiementImputation(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paiement_id", nullable = false)
    var paiement: Paiement,

    @Column(name = "montant_reel", nullable = false, precision = 15, scale = 2)
    var montantReel: BigDecimal = BigDecimal.ZERO, // Montant réellement payé

    // Imputation analytique flexible (Plan Analytique Dynamique)
    // Stockage JSONB des valeurs de dimensions
    // Exemple: {"REG": "CAS", "MARCH": "TRAVAUX", "PHASE": "REAL", "SOURCE": "AFD"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensions_valeurs", nullable = false, columnDefinition = "jsonb")
    var dimensionsValeurs: Map<String, String> = mutableMapOf(),

    @Column(name = "montant_budgete", precision = 15, scale = 2)
    var montantBudgete: BigDecimal? = null, // Montant budgeté pour comparaison

    @Column(name = "ecart", precision = 15, scale = 2)
    var ecart: BigDecimal? = null, // Écart = montantReel - montantBudgete

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity() {

    /**
     * Calcule l'écart RÉEL vs BUDGET
     */
    fun calculerEcart() {
        if (montantBudgete != null) {
            ecart = montantReel - montantBudgete!!
        }
    }

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
