package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "depenses_investissement",
    indexes = [
        Index(name = "idx_depenses_numero_facture", columnList = "numero_facture"),
        Index(name = "idx_depenses_date_facture", columnList = "date_facture"),
        Index(name = "idx_depenses_fournisseur", columnList = "fournisseur_id"),
        Index(name = "idx_depenses_projet", columnList = "projet_id"),
        Index(name = "idx_depenses_axe", columnList = "axe_analytique_id"),
        Index(name = "idx_depenses_convention", columnList = "convention_id"),
        Index(name = "idx_depenses_paye", columnList = "paye")
    ]
)
class DepenseInvestissement(
    @Column(name = "numero_facture", nullable = false, length = 100)
    @field:NotBlank
    var numeroFacture: String = "",

    @Column(name = "date_facture", nullable = false)
    @field:NotNull
    var dateFacture: LocalDate = LocalDate.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    var fournisseur: Fournisseur? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    var projet: Projet? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "axe_analytique_id")
    var axeAnalytique: AxeAnalytique? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id")
    var convention: Convention? = null,

    // Montants facture
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

    // Références
    @Column(name = "reference_marche", length = 100)
    var referenceMarche: String? = null,

    @Column(name = "numero_decompte", length = 100)
    var numeroDecompte: String? = null,

    // Retenues
    @Column(name = "retenue_tva", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var retenueTva: BigDecimal = BigDecimal.ZERO,

    @Column(name = "retenue_is_tiers", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var retenueIsTiers: BigDecimal = BigDecimal.ZERO,

    @Column(name = "retenue_non_resident", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var retenueNonResident: BigDecimal = BigDecimal.ZERO,

    @Column(name = "retenue_garantie", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var retenueGarantie: BigDecimal = BigDecimal.ZERO,

    // Paiement
    @Column(name = "date_paiement")
    var datePaiement: LocalDate? = null,

    @Column(name = "reference_paiement", length = 100)
    var referencePaiement: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_bancaire_id")
    var compteBancaire: CompteBancaire? = null,

    @Column(nullable = false)
    var paye: Boolean = false,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null,

    // Champs de gestion avancée
    @Column(name = "type_depense", length = 20)
    @Enumerated(EnumType.STRING)
    var typeDepense: TypeDepense = TypeDepense.STANDARD,

    @Column(name = "statut", length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutDepense = StatutDepense.EN_COURS,

    @Column(name = "taux_commission", precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    @field:DecimalMax("100.00")
    var tauxCommission: BigDecimal? = null,

    @Column(name = "base_calcul", length = 10)
    @Enumerated(EnumType.STRING)
    var baseCalcul: BaseCalcul = BaseCalcul.TTC,

    @Column(name = "objet", columnDefinition = "TEXT")
    var objet: String? = null,

    @Column(name = "date_demarrage")
    var dateDemarrage: LocalDate? = null,

    @Column(name = "delai_mois")
    var delaiMois: Int? = null,

    @Column(name = "date_fin_prevue")
    var dateFinPrevue: LocalDate? = null,

    @Column(name = "designation", length = 500)
    var designation: String? = null

) : BaseEntity()

enum class TypeDepense {
    STANDARD,
    CADRE,
    NON_CADRE,
    SPECIFIQUE,
    AVENANT
}

enum class StatutDepense {
    VALIDEE,
    EN_COURS,
    ACHEVE,
    EN_RETARD,
    ANNULE
}

enum class BaseCalcul {
    TTC,
    HT
}
