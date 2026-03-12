package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate

/**
 * DTOs pour l'auto-remplissage Odoo-style dans les formulaires.
 * Ces DTOs sont légers et optimisés pour les cascades de sélection dans les dropdowns.
 */

/**
 * Résumé d'une convention pour auto-fill dans le formulaire Marché.
 * Affiché quand l'utilisateur sélectionne une convention dans le dropdown.
 */
data class ConventionSummaryDTO(
    val id: Long,
    val code: String,
    val numero: String,
    val libelle: String,
    val typeConvention: String,
    val statut: String,
    val budget: BigDecimal,
    val tauxCommission: BigDecimal,
    val baseCalcul: String,
    val tauxTva: BigDecimal,
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    // Données calculées: Prévu vs Réalisé
    val montantEngageHT: BigDecimal,       // Sum marchés HT rattachés
    val montantEngageTTC: BigDecimal,      // Sum marchés TTC rattachés
    val montantDecaisseHT: BigDecimal,     // Sum décomptes validés HT
    val montantDecaisseTTC: BigDecimal,    // Sum décomptes validés TTC
    val montantPaye: BigDecimal,           // Sum paiements effectués
    val budgetRestant: BigDecimal,         // budget - montantEngageHT
    val tauxEngagement: BigDecimal,        // montantEngageHT / budget * 100
    val tauxDecaissement: BigDecimal,      // montantDecaisseHT / montantEngageHT * 100
    val nombreMarches: Int,
    val nombreProjets: Int,
    val nombrePartenaires: Int
)

/**
 * Résumé d'un marché pour auto-fill dans le formulaire Décompte.
 * Affiché quand l'utilisateur sélectionne un marché dans le dropdown.
 */
data class MarcheSummaryDTO(
    val id: Long,
    val numeroMarche: String,
    val objet: String,
    val montantHT: BigDecimal,
    val montantTTC: BigDecimal,
    val tauxTva: BigDecimal,
    val statut: String,
    val typeMarche: String,
    val naturePrestation: String,
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val delaiExecutionMois: Int?,
    // Fournisseur
    val fournisseurCode: String,
    val fournisseurNom: String,
    val fournisseurIce: String?,
    // Convention rattachée
    val conventionId: Long?,
    val conventionNumero: String?,
    val conventionLibelle: String?,
    // Données calculées: Prévu vs Réalisé
    val cumulDecomptesHT: BigDecimal,     // Sum décomptes validés HT
    val cumulDecomptesTTC: BigDecimal,    // Sum décomptes validés TTC
    val montantRestantHT: BigDecimal,     // montantHT - cumulDecomptesHT
    val montantPayeTotal: BigDecimal,     // Sum paiements reçus
    val tauxAvancement: BigDecimal,       // cumulDecomptesHT / montantHT * 100
    val nombreDecomptes: Int,
    val nombreLignes: Int
)

/**
 * Résumé d'un fournisseur pour auto-fill dans le formulaire Marché.
 */
data class FournisseurSummaryDTO(
    val id: Long,
    val code: String,
    val raisonSociale: String,
    val ice: String?,
    val identifiantFiscal: String?,
    val adresse: String?,
    val ville: String?,
    val telephone: String?,
    val email: String?,
    // Stats
    val nombreMarches: Int,
    val montantTotalMarches: BigDecimal
)
