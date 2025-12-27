package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
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
 * Imputation analytique du paiement (suivi RÉEL vs BUDGET)
 */
@Entity
@Table(name = "paiement_imputations")
class PaiementImputation(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paiement_id", nullable = false)
    var paiement: Paiement,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    var projet: Projet? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "axe_id")
    var axe: AxeAnalytique? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id")
    var budget: Budget? = null,

    @Column(name = "montant_reel", nullable = false, precision = 15, scale = 2)
    var montantReel: BigDecimal = BigDecimal.ZERO, // Montant réellement payé

    @Column(name = "montant_budgete", precision = 15, scale = 2)
    var montantBudgete: BigDecimal? = null, // Montant budgeté pour comparaison

    @Column(name = "ecart", precision = 15, scale = 2)
    var ecart: BigDecimal? = null // Écart = montantReel - montantBudgete

) : BaseEntity() {

    /**
     * Calcule l'écart RÉEL vs BUDGET
     */
    fun calculerEcart() {
        if (montantBudgete != null) {
            ecart = montantReel - montantBudgete!!
        }
    }
}
