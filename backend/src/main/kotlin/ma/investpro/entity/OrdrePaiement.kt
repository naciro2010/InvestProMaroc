package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
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
 * Imputation analytique de l'ordre de paiement
 */
@Entity
@Table(name = "op_imputations")
class OPImputation(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_paiement_id", nullable = false)
    var ordrePaiement: OrdrePaiement,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    var projet: Projet? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "axe_id")
    var axe: AxeAnalytique? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id")
    var budget: Budget? = null,

    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal = BigDecimal.ZERO

) : BaseEntity()

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
