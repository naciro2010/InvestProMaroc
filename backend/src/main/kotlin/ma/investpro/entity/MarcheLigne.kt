package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal

/**
 * Entité MarcheLigne - Ligne de détail d'un marché
 *
 * Représente une ligne budgétaire du marché avec imputation analytique flexible.
 * Chaque ligne peut être ventilée selon différentes dimensions analytiques.
 *
 * Relations:
 * - MarcheLigne → Marche (Many-to-One)
 * - MarcheLigne → Imputations Analytiques (via JSONB)
 */
@Entity
@Table(
    name = "marche_lignes",
    indexes = [
        Index(name = "idx_marche_lignes_marche", columnList = "marche_id"),
        Index(name = "idx_marche_lignes_numero", columnList = "numero_ligne")
    ]
)
class MarcheLigne(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche,

    @Column(name = "numero_ligne", nullable = false)
    @field:Min(1)
    var numeroLigne: Int = 1, // Numéro d'ordre de la ligne

    @Column(name = "designation", columnDefinition = "TEXT", nullable = false)
    @field:NotBlank
    var designation: String = "", // Description de la ligne

    @Column(name = "unite", length = 50)
    var unite: String? = null, // Unité de mesure (m², ml, u, forfait...)

    @Column(name = "quantite", precision = 15, scale = 3)
    @field:DecimalMin("0.001")
    var quantite: BigDecimal? = null, // Quantité

    @Column(name = "prix_unitaire_ht", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var prixUnitaireHT: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_ht", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantHT: BigDecimal = BigDecimal.ZERO, // montantHT = quantite * prixUnitaireHT

    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxTVA: BigDecimal = BigDecimal("20.00"),

    @Column(name = "montant_tva", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantTVA: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_ttc", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantTTC: BigDecimal = BigDecimal.ZERO,

    // Imputation analytique flexible (Plan Analytique Dynamique)
    // Stockage JSONB des valeurs de dimensions
    // Exemple: {"REG": "CAS", "MARCH": "TRAVAUX", "PHASE": "REAL", "SOURCE": "AFD"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "imputation_analytique", columnDefinition = "jsonb")
    var imputationAnalytique: Map<String, String>? = mutableMapOf(),

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity() {

    /**
     * Calcule le montant HT à partir de la quantité et du prix unitaire
     */
    fun calculerMontantHT() {
        montantHT = quantite?.multiply(prixUnitaireHT) ?: prixUnitaireHT // Forfait si pas de quantité
    }

    /**
     * Calcule le montant TVA
     */
    fun calculerMontantTVA() {
        montantTVA = montantHT * tauxTVA.divide(BigDecimal(100))
    }

    /**
     * Calcule le montant TTC
     */
    fun calculerMontantTTC() {
        montantTTC = montantHT + montantTVA
    }

    /**
     * Calcule tous les montants
     */
    fun calculerMontants() {
        calculerMontantHT()
        calculerMontantTVA()
        calculerMontantTTC()
    }

    /**
     * Obtenir la valeur d'une dimension analytique
     */
    fun getValeurDimension(codeDimension: String): String? {
        return imputationAnalytique?.get(codeDimension)
    }

    /**
     * Définir la valeur d'une dimension analytique
     */
    fun setValeurDimension(codeDimension: String, codeValeur: String) {
        val mutableMap = (imputationAnalytique ?: emptyMap()).toMutableMap()
        mutableMap[codeDimension] = codeValeur
        imputationAnalytique = mutableMap
    }

    /**
     * Vérifier si toutes les dimensions obligatoires sont renseignées
     */
    fun isImputationComplete(dimensionsObligatoires: List<String>): Boolean {
        return dimensionsObligatoires.all { imputationAnalytique?.containsKey(it) == true }
    }
}
