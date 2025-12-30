package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité AvenantMarche - Avenant/modification d'un marché
 *
 * Représente une modification contractuelle d'un marché existant.
 * Peut modifier les montants, délais, prestations, etc.
 *
 * Relations:
 * - AvenantMarche → Marche (Many-to-One)
 */
@Entity
@Table(
    name = "avenant_marches",
    indexes = [
        Index(name = "idx_avenant_marches_marche", columnList = "marche_id"),
        Index(name = "idx_avenant_marches_numero", columnList = "numero_avenant"),
        Index(name = "idx_avenant_marches_statut", columnList = "statut")
    ]
)
class AvenantMarche(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche,

    @Column(name = "numero_avenant", nullable = false, length = 50)
    @field:NotBlank
    var numeroAvenant: String = "", // N° avenant (ex: AVE-001)

    @Column(name = "date_avenant", nullable = false)
    @field:NotNull
    var dateAvenant: LocalDate = LocalDate.now(),

    @Column(name = "date_effet")
    var dateEffet: LocalDate? = null, // Date d'entrée en vigueur

    @Column(name = "objet", columnDefinition = "TEXT", nullable = false)
    @field:NotBlank
    var objet: String = "", // Objet de l'avenant

    @Column(name = "motif", columnDefinition = "TEXT")
    var motif: String? = null, // Motif/justification de l'avenant

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutAvenant = StatutAvenant.BROUILLON,

    // Impacts financiers
    @Column(name = "montant_initial_ht", precision = 15, scale = 2)
    var montantInitialHT: BigDecimal? = null, // Montant AVANT avenant

    @Column(name = "montant_avenant_ht", precision = 15, scale = 2)
    var montantAvenantHT: BigDecimal? = null, // Delta de l'avenant (+ ou -)

    @Column(name = "montant_apres_ht", precision = 15, scale = 2)
    var montantApresHT: BigDecimal? = null, // Montant APRÈS avenant

    @Column(name = "pourcentage_variation", precision = 5, scale = 2)
    var pourcentageVariation: BigDecimal? = null, // % de variation

    // Impacts délais
    @Column(name = "delai_initial_mois")
    var delaiInitialMois: Int? = null, // Délai AVANT avenant

    @Column(name = "delai_supplementaire_mois")
    var delaiSupplementaireMois: Int? = null, // Delta de délai (+ ou -)

    @Column(name = "delai_apres_mois")
    var delaiApresMois: Int? = null, // Délai APRÈS avenant

    @Column(name = "date_fin_initiale")
    var dateFinInitiale: LocalDate? = null,

    @Column(name = "date_fin_apres")
    var dateFinApres: LocalDate? = null,

    // Détails AVANT/APRÈS
    @Column(name = "details_avant", columnDefinition = "TEXT")
    var detailsAvant: String? = null, // Description de l'état AVANT

    @Column(name = "details_apres", columnDefinition = "TEXT")
    var detailsApres: String? = null, // Description de l'état APRÈS

    @Column(name = "details_modifications", columnDefinition = "TEXT")
    var detailsModifications: String? = null, // Détails des modifications

    // Validation
    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "valide_par_id")
    var valideParId: Long? = null,

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null,

    // Pièce jointe (URL ou path)
    @Column(name = "fichier_avenant", length = 500)
    var fichierAvenant: String? = null // PDF de l'avenant signé

) : BaseEntity() {

    /**
     * Calcule le pourcentage de variation financière
     */
    fun calculerPourcentageVariation() {
        if (montantInitialHT != null && montantInitialHT!! > BigDecimal.ZERO && montantAvenantHT != null) {
            pourcentageVariation = (montantAvenantHT!! * BigDecimal(100)).divide(montantInitialHT!!, 2, java.math.RoundingMode.HALF_UP)
        }
    }

    /**
     * Calcule le montant après avenant
     */
    fun calculerMontantApres() {
        if (montantInitialHT != null && montantAvenantHT != null) {
            montantApresHT = montantInitialHT!! + montantAvenantHT!!
        }
    }

    /**
     * Calcule le délai après avenant
     */
    fun calculerDelaiApres() {
        if (delaiInitialMois != null && delaiSupplementaireMois != null) {
            delaiApresMois = delaiInitialMois!! + delaiSupplementaireMois!!
        }
    }

    /**
     * Calcule tous les impacts
     */
    fun calculerImpacts() {
        calculerMontantApres()
        calculerPourcentageVariation()
        calculerDelaiApres()
    }
}
