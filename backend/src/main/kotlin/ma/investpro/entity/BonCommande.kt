package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Bon de Commande - Commandes d'achat liées à un marché
 *
 * Un bon de commande est une commande spécifique émise dans le cadre d'un marché.
 * Relations:
 * - BonCommande → Marché (Many-to-One)
 * - BonCommande → Fournisseur (Many-to-One)
 */
@Entity
@Table(
    name = "bons_commande",
    indexes = [
        Index(name = "idx_bons_commande_numero", columnList = "numero", unique = true),
        Index(name = "idx_bons_commande_marche", columnList = "marche_id"),
        Index(name = "idx_bons_commande_fournisseur", columnList = "fournisseur_id"),
        Index(name = "idx_bons_commande_date", columnList = "date_bon_commande")
    ]
)
class BonCommande(
    @Column(name = "numero", nullable = false, unique = true, length = 100)
    @field:NotBlank
    var numero: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    var fournisseur: Fournisseur? = null,

    @Column(name = "num_consultation", length = 100)
    var numConsultation: String? = null,

    @Column(name = "date_bon_commande", nullable = false)
    @field:NotNull
    var dateBonCommande: LocalDate = LocalDate.now(),

    @Column(name = "date_approbation")
    var dateApprobation: LocalDate? = null,

    @Column(name = "objet", columnDefinition = "TEXT")
    var objet: String? = null,

    @Column(name = "montant_ht", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantHt: BigDecimal = BigDecimal.ZERO,

    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxTva: BigDecimal = BigDecimal("20.00"),

    @Column(name = "montant_tva", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantTva: BigDecimal = BigDecimal.ZERO,

    @Column(name = "montant_ttc", nullable = false, precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var montantTtc: BigDecimal = BigDecimal.ZERO,

    @Column(name = "statut", length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutBonCommande = StatutBonCommande.EN_ATTENTE,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()

enum class StatutBonCommande {
    EN_ATTENTE,    // En attente d'approbation
    APPROUVE,      // Bon de commande approuvé
    EN_COURS,      // En cours d'exécution
    LIVRE,         // Livré
    ANNULE         // Annulé
}
