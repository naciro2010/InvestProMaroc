package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime

/**
 * Entité pour l'historique des modifications des conventions
 * Stocke l'état avant/après et le motif pour traçabilité complète
 */
@Entity
@Table(
    name = "convention_modifications",
    indexes = [
        Index(name = "idx_convention_modifications_convention", columnList = "convention_id,date_modification"),
        Index(name = "idx_convention_modifications_user", columnList = "modifie_par_id"),
        Index(name = "idx_convention_modifications_date", columnList = "date_modification"),
        Index(name = "idx_convention_modifications_type", columnList = "type_modification")
    ]
)
class ConventionModification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    @field:NotNull
    val convention: Convention,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modifie_par_id", nullable = false)
    @field:NotNull
    val modifiePar: User,

    @Column(name = "date_modification", nullable = false)
    @field:NotNull
    val dateModification: LocalDateTime = LocalDateTime.now(),

    @Column(name = "motif_modification", nullable = false, columnDefinition = "TEXT")
    @field:NotBlank
    val motifModification: String,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "donnees_avant", nullable = false, columnDefinition = "jsonb")
    @field:NotNull
    val donneesAvant: Map<String, Any>,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "donnees_apres", nullable = false, columnDefinition = "jsonb")
    @field:NotNull
    val donneesApres: Map<String, Any>,

    @Column(name = "champs_modifies", nullable = false, columnDefinition = "text[]")
    @field:NotNull
    val champsModifies: List<String>,

    @Column(name = "type_modification", nullable = false, length = 50)
    @field:NotBlank
    val typeModification: String = "UPDATE",

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    /**
     * Obtenir la valeur d'un champ avant modification
     */
    fun getValeurAvant(champ: String): Any? {
        return donneesAvant[champ]
    }

    /**
     * Obtenir la valeur d'un champ après modification
     */
    fun getValeurApres(champ: String): Any? {
        return donneesApres[champ]
    }

    /**
     * Vérifier si un champ spécifique a été modifié
     */
    fun estChampModifie(champ: String): Boolean {
        return champsModifies.contains(champ)
    }
}

/**
 * Types de modifications possibles
 */
object TypeModificationConvention {
    const val UPDATE = "UPDATE"
    const val STATUS_CHANGE = "STATUS_CHANGE"
    const val PARTNER_CHANGE = "PARTNER_CHANGE"
    const val BUDGET_CHANGE = "BUDGET_CHANGE"
    const val FINANCIAL_PARAMS_CHANGE = "FINANCIAL_PARAMS_CHANGE"
    const val DATES_CHANGE = "DATES_CHANGE"
}
