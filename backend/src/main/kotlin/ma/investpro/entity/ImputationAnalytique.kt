package ma.investpro.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDateTime

/**
 * Entité ImputationAnalytique - Ventilation budget/décompte par dimensions
 * Stockage flexible avec JSONB PostgreSQL
 * Approche DDD simplifiée
 */
@Entity
@Table(
    name = "imputations_analytiques",
    indexes = [
        Index(name = "idx_imputations_type_ref", columnList = "type_imputation,reference_id"),
        Index(name = "idx_imputations_dimensions", columnList = "dimensions_valeurs")
    ]
)
class ImputationAnalytique(

    @Enumerated(EnumType.STRING)
    @Column(name = "type_imputation", nullable = false, length = 50)
    var typeImputation: TypeImputation, // BUDGET, DECOMPTE, PAIEMENT

    @Column(name = "reference_id", nullable = false)
    var referenceId: Long, // ID du Budget, Décompte, ou Paiement

    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal = BigDecimal.ZERO,

    // Stockage JSONB des valeurs de dimensions
    // Exemple: {"REG": "CAS", "MARCH": "TRAVAUX", "PHASE": "REAL"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensions_valeurs", nullable = false, columnDefinition = "jsonb")
    var dimensionsValeurs: Map<String, String> = mutableMapOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    var createdBy: User? = null

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
 * Type d'imputation
 */
enum class TypeImputation {
    BUDGET,           // Imputation de budget
    DECOMPTE,         // Imputation de décompte
    ORDRE_PAIEMENT,   // Imputation d'ordre de paiement
    PAIEMENT          // Imputation de paiement
}
