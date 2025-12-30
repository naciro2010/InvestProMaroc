package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate

// DTO pour statistiques des commissions
data class CommissionStats(
    val periode: String? = null,
    val fournisseurId: Long? = null,
    val fournisseurNom: String? = null,
    val conventionId: Long? = null,
    val conventionLibelle: String? = null,
    val nombreCommissions: Long = 0,
    val totalCommissionHt: BigDecimal = BigDecimal.ZERO,
    val totalTvaCommission: BigDecimal = BigDecimal.ZERO,
    val totalCommissionTtc: BigDecimal = BigDecimal.ZERO
)

// DTO pour statistiques des dépenses
data class DepenseStats(
    val periode: String? = null,
    val fournisseurId: Long? = null,
    val fournisseurNom: String? = null,
    val compteBancaireId: Long? = null,
    val compteBancaireNom: String? = null,
    val nombreDepenses: Long = 0,
    val totalMontantHt: BigDecimal = BigDecimal.ZERO,
    val totalMontantTva: BigDecimal = BigDecimal.ZERO,
    val totalMontantTtc: BigDecimal = BigDecimal.ZERO,
    val totalRetenueTva: BigDecimal = BigDecimal.ZERO,
    val totalRetenueIs: BigDecimal = BigDecimal.ZERO,
    val totalRetenueNonResident: BigDecimal = BigDecimal.ZERO,
    val totalRetenueGarantie: BigDecimal = BigDecimal.ZERO
)

// DTO pour les paiements
data class PaiementStats(
    val nombrePaiements: Long = 0,
    val nombreEnAttente: Long = 0,
    val totalPaye: BigDecimal = BigDecimal.ZERO,
    val totalEnAttente: BigDecimal = BigDecimal.ZERO,
    val tauxPaiement: Double = 0.0
)

// DTO pour le dashboard global
data class DashboardStats(
    val depenses: DepenseGlobalStats,
    val commissions: CommissionGlobalStats,
    val paiements: PaiementStats,
    val topFournisseurs: List<TopFournisseurStats>
)

data class DepenseGlobalStats(
    val total: Long = 0,
    val totalHt: BigDecimal = BigDecimal.ZERO,
    val totalTtc: BigDecimal = BigDecimal.ZERO,
    val anneeEnCours: BigDecimal = BigDecimal.ZERO,
    val moisEnCours: BigDecimal = BigDecimal.ZERO
)

data class CommissionGlobalStats(
    val total: Long = 0,
    val totalHt: BigDecimal = BigDecimal.ZERO,
    val totalTtc: BigDecimal = BigDecimal.ZERO,
    val anneeEnCours: BigDecimal = BigDecimal.ZERO,
    val moisEnCours: BigDecimal = BigDecimal.ZERO
)

data class TopFournisseurStats(
    val fournisseurId: Long,
    val fournisseurNom: String,
    val montantTotal: BigDecimal,
    val nombreDepenses: Long
)

// Paramètres de recherche avancée
data class DepenseSearchCriteria(
    val dateDebut: LocalDate? = null,
    val dateFin: LocalDate? = null,
    val fournisseurId: Long? = null,
    val conventionId: Long? = null,
    val compteBancaireId: Long? = null,
    val paye: Boolean? = null,
    val annee: Int? = null,
    val mois: Int? = null
)

data class CommissionSearchCriteria(
    val dateDebut: LocalDate? = null,
    val dateFin: LocalDate? = null,
    val conventionId: Long? = null,
    val fournisseurId: Long? = null,
    val annee: Int? = null,
    val mois: Int? = null
)
