package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité AvenantConvention - Avenant/modification d'une convention
 *
 * Représente une modification d'une convention existante avec workflow complet.
 * Stocke un snapshot des données avant modification et les changements proposés.
 *
 * Workflow: BROUILLON → SOUMIS → VALIDE
 * Seul un avenant VALIDE met à jour la convention parente.
 *
 * Relations:
 * - AvenantConvention → Convention (Many-to-One)
 */
@Entity
@Table(
    name = "avenant_conventions",
    indexes = [
        Index(name = "idx_avenant_conventions_convention", columnList = "convention_id"),
        Index(name = "idx_avenant_conventions_numero", columnList = "numero_avenant"),
        Index(name = "idx_avenant_conventions_statut", columnList = "statut"),
        Index(name = "idx_avenant_conventions_date", columnList = "date_avenant")
    ]
)
class AvenantConvention(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(name = "numero_avenant", nullable = false, length = 50)
    @field:NotBlank
    var numeroAvenant: String = "", // Numéro avenant (ex: AVE-CONV-001)

    @Column(name = "date_avenant", nullable = false)
    @field:NotNull
    var dateAvenant: LocalDate = LocalDate.now(),

    @Column(name = "objet", columnDefinition = "TEXT", nullable = false)
    @field:NotBlank
    var objet: String = "", // Objectif de l'avenant

    @Column(name = "motif", columnDefinition = "TEXT")
    var motif: String? = null, // Justification détaillée de l'avenant

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutAvenantConvention = StatutAvenantConvention.BROUILLON,

    // Snapshot des données AVANT modification (JSONB pour flexibilité)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "donnees_avant", columnDefinition = "jsonb")
    var donneesAvant: Map<String, Any?>? = null,

    // Modifications proposées (JSONB)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "modifications", columnDefinition = "jsonb")
    var modifications: Map<String, Any?>? = null,

    // Description textuelle des modifications pour affichage
    @Column(name = "details_modifications", columnDefinition = "TEXT")
    var detailsModifications: String? = null,

    // Impacts financiers (pour reporting rapide)
    @Column(name = "ancien_budget", precision = 15, scale = 2)
    var ancienBudget: BigDecimal? = null,

    @Column(name = "nouveau_budget", precision = 15, scale = 2)
    var nouveauBudget: BigDecimal? = null,

    @Column(name = "delta_budget", precision = 15, scale = 2)
    var deltaBudget: BigDecimal? = null,

    @Column(name = "ancien_taux_commission", precision = 5, scale = 2)
    var ancienTauxCommission: BigDecimal? = null,

    @Column(name = "nouveau_taux_commission", precision = 5, scale = 2)
    var nouveauTauxCommission: BigDecimal? = null,

    // Dates workflow
    @Column(name = "date_soumission")
    var dateSoumission: LocalDate? = null,

    @Column(name = "date_validation")
    var dateValidation: LocalDate? = null,

    @Column(name = "date_effet")
    var dateEffet: LocalDate? = null, // Date d'entrée en vigueur

    // Utilisateurs workflow
    @Column(name = "created_by_id")
    var createdById: Long? = null, // Créateur de l'avenant

    @Column(name = "soumis_par_id")
    var soumisParId: Long? = null, // Utilisateur qui a soumis

    @Column(name = "valide_par_id")
    var valideParId: Long? = null, // Validateur de l'avenant

    // Remarques et notes
    @Column(columnDefinition = "TEXT")
    var remarques: String? = null,

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    var motifRejet: String? = null, // Si rejeté (retour à BROUILLON)

    // Pièce jointe (URL ou path)
    @Column(name = "fichier_avenant", length = 500)
    var fichierAvenant: String? = null, // PDF de l'avenant signé

    // Ordre d'application (pour historique)
    @Column(name = "ordre_application")
    var ordreApplication: Int? = null // 1, 2, 3... (chronologique)

) : BaseEntity() {

    /**
     * Calcule le delta de budget
     */
    fun calculerDeltaBudget() {
        val ancien = ancienBudget ?: return
        val nouveau = nouveauBudget ?: return
        deltaBudget = nouveau - ancien
    }

    /**
     * Vérifie si l'avenant est éditable
     */
    fun isEditable(): Boolean = statut == StatutAvenantConvention.BROUILLON

    /**
     * Vérifie si l'avenant est validé
     */
    fun isValide(): Boolean = statut == StatutAvenantConvention.VALIDE

    /**
     * Vérifie si l'avenant peut être soumis
     */
    fun canSoumettre(): Boolean = statut == StatutAvenantConvention.BROUILLON

    /**
     * Vérifie si l'avenant peut être validé
     */
    fun canValider(): Boolean = statut == StatutAvenantConvention.SOUMIS

    /**
     * Soumet l'avenant pour validation
     */
    fun soumettre(userId: Long) {
        if (!canSoumettre()) {
            throw IllegalStateException("L'avenant ne peut pas être soumis (statut: $statut)")
        }
        statut = StatutAvenantConvention.SOUMIS
        dateSoumission = LocalDate.now()
        soumisParId = userId
    }

    /**
     * Valide l'avenant
     */
    fun valider(userId: Long) {
        if (!canValider()) {
            throw IllegalStateException("L'avenant ne peut pas être validé (statut: $statut)")
        }
        statut = StatutAvenantConvention.VALIDE
        dateValidation = LocalDate.now()
        valideParId = userId
        if (dateEffet == null) {
            dateEffet = LocalDate.now()
        }
    }

    /**
     * Rejette l'avenant (retour à BROUILLON)
     */
    fun rejeter(motif: String) {
        if (statut != StatutAvenantConvention.SOUMIS) {
            throw IllegalStateException("Seul un avenant SOUMIS peut être rejeté")
        }
        statut = StatutAvenantConvention.BROUILLON
        motifRejet = motif
    }
}

/**
 * Statut d'un avenant de convention
 */
enum class StatutAvenantConvention {
    BROUILLON,  // En cours de création (éditable)
    SOUMIS,     // Soumis pour validation (non éditable)
    VALIDE      // Validé et appliqué à la convention
}
