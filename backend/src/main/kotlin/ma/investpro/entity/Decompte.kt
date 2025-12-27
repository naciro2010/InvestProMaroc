package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Décompte - Factures progressives/situations de travaux
 *
 * Un décompte représente une facture progressive pour un marché (travaux, services, etc.).
 * Utilisé pour le suivi de l'avancement et des paiements progressifs.
 *
 * Relations:
 * - Décompte → Marché (Many-to-One)
 * - Décompte → Fournisseur (Many-to-One)
 */
@Entity
@Table(
    name = "decomptes",
    indexes = [
        Index(name = "idx_decomptes_numero", columnList = "numero_decompte"),
        Index(name = "idx_decomptes_marche", columnList = "marche_id"),
        Index(name = "idx_decomptes_fournisseur", columnList = "fournisseur_id"),
        Index(name = "idx_decomptes_date", columnList = "date_decompte"),
        Index(name = "idx_decomptes_type", columnList = "type_decompte")
    ]
)
class Decompte(
    @Column(name = "numero_decompte", nullable = false, length = 100)
    @field:NotBlank
    var numeroDecompte: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    var fournisseur: Fournisseur? = null,

    @Column(name = "date_decompte", nullable = false)
    @field:NotNull
    var dateDecompte: LocalDate = LocalDate.now(),

    @Column(name = "type_decompte", length = 20)
    @Enumerated(EnumType.STRING)
    var typeDecompte: TypeDecompte = TypeDecompte.PROVISOIRE,

    @Column(name = "numero_situation")
    var numeroSituation: Int? = null, // Ex: Décompte N°1, N°2, etc.

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

    // Retenue de garantie (montant RG dans XCOMPTA)
    @Column(name = "retenue_garantie", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var retenueGarantie: BigDecimal = BigDecimal.ZERO,

    @Column(name = "taux_retenue_garantie", precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxRetenueGarantie: BigDecimal = BigDecimal("10.00"), // Généralement 10%

    // Cumul des décomptes
    @Column(name = "cumul_anterieur", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var cumulAnterieur: BigDecimal = BigDecimal.ZERO,

    @Column(name = "cumul_actuel", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var cumulActuel: BigDecimal = BigDecimal.ZERO,

    // Avancement en pourcentage
    @Column(name = "taux_avancement", precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var tauxAvancement: BigDecimal? = null,

    @Column(name = "statut", length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutDecompte = StatutDecompte.EN_COURS,

    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "date_paiement")
    var datePaiement: LocalDate? = null,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()

enum class TypeDecompte {
    PROVISOIRE,    // Décompte provisoire (situation de travaux)
    DEFINITIF,     // Décompte définitif
    FINAL          // Décompte final (solde de tout compte)
}

enum class StatutDecompte {
    EN_COURS,      // En cours de préparation
    SOUMIS,        // Soumis pour validation
    VALIDE,        // Validé
    PAYE,          // Payé
    REJETE,        // Rejeté
    ANNULE         // Annulé
}
