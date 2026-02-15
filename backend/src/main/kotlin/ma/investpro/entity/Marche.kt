package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Marché - Gestion des marchés publics/contrats de procurement
 *
 * Un marché représente un contrat d'achat avec un fournisseur dans le cadre d'une convention.
 * Chaque marché peut avoir plusieurs lignes avec imputation analytique flexible.
 *
 * Relations:
 * - Marché → Convention (Many-to-One)
 * - Marché → Fournisseur (Many-to-One)
 * - Marché → MarcheLignes (One-to-Many)
 * - Marché → AvenantMarches (One-to-Many)
 * - Marché → BonsCommande (One-to-Many)
 * - Marché → Décomptes (One-to-Many)
 */
@Entity
@Table(
    name = "marches",
    indexes = [
        Index(name = "idx_marches_numero", columnList = "numero_marche", unique = true),
        Index(name = "idx_marches_num_ao", columnList = "num_ao"),
        Index(name = "idx_marches_fournisseur", columnList = "fournisseur_id"),
        Index(name = "idx_marches_convention", columnList = "convention_id"),
        Index(name = "idx_marches_statut", columnList = "statut"),
        Index(name = "idx_marches_date", columnList = "date_marche")
    ]
)
class Marche(
    @Column(name = "numero_marche", nullable = false, unique = true, length = 100)
    @field:NotBlank
    var numeroMarche: String = "",

    @Column(name = "num_ao", length = 100)
    var numAo: String? = null, // Numéro Appel d'Offres

    @Column(name = "date_marche", nullable = false)
    @field:NotNull
    var dateMarche: LocalDate = LocalDate.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    var fournisseur: Fournisseur? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id")
    var convention: Convention? = null, // Rattachement à une convention

    @Column(name = "objet", columnDefinition = "TEXT", nullable = false)
    @field:NotBlank
    var objet: String = "",

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
    var statut: StatutMarche = StatutMarche.EN_COURS,

    @Column(name = "date_debut")
    var dateDebut: LocalDate? = null,

    @Column(name = "date_fin_prevue")
    var dateFinPrevue: LocalDate? = null,

    @Column(name = "delai_execution_mois")
    var delaiExecutionMois: Int? = null,

    @Column(name = "retenue_garantie", precision = 15, scale = 2)
    @field:DecimalMin("0.00")
    var retenueGarantie: BigDecimal = BigDecimal.ZERO,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null,

    // Géolocalisation
    @Column(name = "adresse", columnDefinition = "TEXT")
    var adresse: String? = null,

    @Column(name = "latitude")
    var latitude: Double? = null,

    @Column(name = "longitude")
    var longitude: Double? = null,

    @Column(name = "zone_geographique", length = 100)
    var zoneGeographique: String? = null, // Ex: "Casablanca", "Rabat-Salé-Kénitra"

    // Type et nature du marché
    @Column(name = "type_marche", length = 30)
    @Enumerated(EnumType.STRING)
    var typeMarche: TypeMarche = TypeMarche.MARCHE,

    @Column(name = "nature_prestation", length = 30)
    @Enumerated(EnumType.STRING)
    var naturePrestation: NaturePrestation = NaturePrestation.TRAVAUX,

    @Column(name = "date_signature")
    var dateSignature: LocalDate? = null,

    @Column(name = "date_notification")
    var dateNotification: LocalDate? = null,

    @Column(name = "date_ordre_service")
    var dateOrdreService: LocalDate? = null,

    @Column(name = "taux_penalite", precision = 5, scale = 2)
    @field:DecimalMin("0.00")
    var tauxPenalite: BigDecimal = BigDecimal("0.05"), // 1/2000 par jour par défaut

    // Relations inverses
    @OneToMany(mappedBy = "marche", cascade = [CascadeType.ALL], orphanRemoval = true)
    var lignes: MutableList<MarcheLigne> = mutableListOf(),

    @OneToMany(mappedBy = "marche", cascade = [CascadeType.ALL], orphanRemoval = true)
    var avenants: MutableList<AvenantMarche> = mutableListOf(),

    @OneToMany(mappedBy = "marche", cascade = [CascadeType.ALL], orphanRemoval = true)
    var bonsCommande: MutableList<BonCommande> = mutableListOf(),

    @OneToMany(mappedBy = "marche", cascade = [CascadeType.ALL], orphanRemoval = true)
    var decomptes: MutableList<Decompte> = mutableListOf(),

    @OneToMany(mappedBy = "marche", cascade = [CascadeType.ALL], orphanRemoval = true)
    var ordresService: MutableList<OrdreService> = mutableListOf()

) : BaseEntity() {

    /**
     * Calcule le montant total du marché à partir des lignes
     */
    fun calculerMontantsDepuisLignes() {
        montantHt = lignes.sumOf { it.montantHT }
        montantTva = lignes.sumOf { it.montantTVA }
        montantTtc = lignes.sumOf { it.montantTTC }
    }

    /**
     * Ajoute une ligne au marché
     */
    fun ajouterLigne(ligne: MarcheLigne) {
        ligne.marche = this
        lignes.add(ligne)
    }

    /**
     * Ajoute un avenant au marché
     */
    fun ajouterAvenant(avenant: AvenantMarche) {
        avenant.marche = this
        avenants.add(avenant)
    }
}

enum class StatutMarche {
    EN_COURS,      // Marché en cours d'exécution
    VALIDE,        // Marché validé/approuvé
    TERMINE,       // Marché terminé
    SUSPENDU,      // Marché suspendu temporairement
    ANNULE,        // Marché annulé
    EN_ATTENTE     // En attente de validation
}

enum class TypeMarche {
    MARCHE,             // Marché public classique
    CONTRAT,            // Contrat
    BON_DE_COMMANDE,    // Bon de commande
    LETTRE_DE_COMMANDE  // Lettre de commande (consultation directe)
}

enum class NaturePrestation {
    TRAVAUX,      // Travaux
    FOURNITURES,  // Fournitures
    SERVICES,     // Services
    ETUDES        // Études
}
