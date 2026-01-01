package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Avenant - Modification d'une convention avec versions (V1, V2, V3...)
 * Permet de tracker les changements AVANT/APRÈS et créer des versions consolidées
 */
@Entity
@Table(
    name = "avenants",
    indexes = [
        Index(name = "idx_avenants_convention", columnList = "convention_id"),
        Index(name = "idx_avenants_numero", columnList = "numero_avenant"),
        Index(name = "idx_avenants_statut", columnList = "statut"),
        Index(name = "idx_avenants_version", columnList = "version_resultante")
    ]
)
class Avenant(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(name = "numero_avenant", nullable = false, length = 50)
    @field:NotBlank
    var numeroAvenant: String = "", // Numéro de l'avenant (ex: AV-001, AV-002)

    @Column(name = "date_avenant", nullable = false)
    @field:NotNull
    var dateAvenant: LocalDate = LocalDate.now(),

    @Column(name = "date_signature")
    var dateSignature: LocalDate? = null,

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutAvenant = StatutAvenant.BROUILLON,

    @Column(name = "version_resultante", nullable = false, length = 10)
    @field:NotBlank
    var versionResultante: String = "", // V1, V2, V3...

    @Column(nullable = false, columnDefinition = "TEXT")
    @field:NotBlank
    var objet: String = "", // Objet de l'avenant

    // Valeurs AVANT (héritées de la version précédente de la convention)
    @Column(name = "montant_avant", precision = 15, scale = 2)
    var montantAvant: BigDecimal? = null,

    @Column(name = "taux_commission_avant", precision = 5, scale = 2)
    var tauxCommissionAvant: BigDecimal? = null,

    @Column(name = "date_fin_avant")
    var dateFinAvant: LocalDate? = null,

    // Valeurs APRÈS (nouvelles valeurs suite à l'avenant)
    @Column(name = "montant_apres", precision = 15, scale = 2)
    var montantApres: BigDecimal? = null,

    @Column(name = "taux_commission_apres", precision = 5, scale = 2)
    var tauxCommissionApres: BigDecimal? = null,

    @Column(name = "date_fin_apres")
    var dateFinApres: LocalDate? = null,

    // Delta / Impact
    @Column(name = "impact_montant", precision = 15, scale = 2)
    var impactMontant: BigDecimal? = null, // Calculé: montantApres - montantAvant

    @Column(name = "impact_commission", precision = 15, scale = 2)
    var impactCommission: BigDecimal? = null, // Impact sur la commission

    @Column(name = "impact_delai_jours")
    var impactDelaiJours: Int? = null, // Impact sur le délai en jours

    @Column(columnDefinition = "TEXT")
    var justification: String? = null,

    @Column(columnDefinition = "TEXT")
    var details: String? = null, // Détails complets des modifications

    // Workflow
    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "valide_par_id")
    var valideParId: Long? = null,

    @Column(name = "is_locked", nullable = false)
    var isLocked: Boolean = false

) : BaseEntity() {

    /**
     * Calcule l'impact sur le montant
     */
    fun calculerImpactMontant() {
        val avant = montantAvant ?: return
        val apres = montantApres ?: return
        impactMontant = apres - avant
    }

    /**
     * Calcule l'impact sur le délai
     */
    fun calculerImpactDelai() {
        if (dateFinAvant != null && dateFinApres != null) {
            impactDelaiJours = java.time.temporal.ChronoUnit.DAYS.between(dateFinAvant, dateFinApres).toInt()
        }
    }

    /**
     * Applique l'avenant à la convention (mise à jour des valeurs consolidées)
     */
    fun appliquerAConvention() {
        require(statut == StatutAvenant.VALIDE) {
            "Seuls les avenants validés peuvent être appliqués"
        }

        montantApres?.let { convention.budget = it }
        tauxCommissionApres?.let { convention.tauxCommission = it }
        dateFinApres?.let { convention.dateFin = it }

        // Update convention version
        convention.version = versionResultante
    }
}

/**
 * Statut de l'avenant
 */
enum class StatutAvenant {
    BROUILLON,      // En cours de rédaction
    SOUMIS,         // Soumis pour approbation
    VALIDE,         // Validé et appliqué
    REJETE,         // Rejeté
    ANNULE          // Annulé
}
