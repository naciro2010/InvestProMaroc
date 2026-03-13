package ma.investpro.dto

import java.math.BigDecimal

/**
 * Executive Dashboard DTOs — Rich aggregated stats for directors/managers.
 * Single endpoint delivers all KPIs, trends, alerts, and breakdowns.
 */

data class ExecutiveDashboardDTO(
    val kpis: ExecutiveKPIs,
    val workflowFunnel: WorkflowFunnelDTO,
    val monthlyTrends: List<MonthlyTrendDTO>,
    val topMarches: List<TopMarcheDTO>,
    val topFournisseurs: List<TopFournisseurDTO>,
    val alerts: List<DashboardAlertDTO>,
    val recentActivity: List<RecentActivityDTO>,
    val budgetExecution: BudgetExecutionDTO
)

data class ExecutiveKPIs(
    val totalConventions: Long,
    val totalProjets: Long,
    val totalMarches: Long,
    val totalDecomptes: Long,
    val totalPaiements: Long,
    val totalFournisseurs: Long,
    val budgetConventions: BigDecimal,
    val budgetProjets: BigDecimal,
    val engagementMarches: BigDecimal,
    val totalPaye: BigDecimal,
    val tauxEngagement: Double,
    val tauxConsommation: Double,
    val marchesEnRetard: Long,
    val conventionsEnAttente: Long,
    val projetsActifs: Long,
    val decomptesEnAttente: Long
)

data class WorkflowFunnelDTO(
    val conventions: StatusCountsDTO,
    val marches: StatusCountsDTO,
    val projets: StatusCountsDTO,
    val decomptes: StatusCountsDTO
)

data class StatusCountsDTO(
    val counts: Map<String, Long>,
    val total: Long
)

data class MonthlyTrendDTO(
    val month: String,
    val label: String,
    val marchesCreated: Long,
    val decomptesEmis: Long,
    val paiementsEffectues: Long,
    val montantEngage: BigDecimal,
    val montantPaye: BigDecimal
)

data class TopMarcheDTO(
    val id: Long,
    val code: String,
    val objet: String,
    val montantTtc: BigDecimal,
    val statut: String,
    val fournisseur: String?,
    val tauxAvancement: Double
)

data class TopFournisseurDTO(
    val id: Long,
    val nom: String,
    val totalMarches: Long,
    val montantTotal: BigDecimal,
    val dernierMarche: String?
)

data class DashboardAlertDTO(
    val type: String,
    val severity: String,
    val message: String,
    val count: Long,
    val link: String?
)

data class RecentActivityDTO(
    val id: Long,
    val entityType: String,
    val code: String,
    val label: String,
    val statut: String,
    val date: String?,
    val path: String
)

data class BudgetExecutionDTO(
    val budgetTotal: BigDecimal,
    val engage: BigDecimal,
    val paye: BigDecimal,
    val resteBudget: BigDecimal,
    val resteAPayer: BigDecimal,
    val tauxEngagement: Double,
    val tauxPaiement: Double,
    val byConvention: List<ConventionBudgetDTO>
)

data class ConventionBudgetDTO(
    val id: Long,
    val code: String,
    val budget: BigDecimal,
    val engage: BigDecimal,
    val paye: BigDecimal,
    val tauxEngagement: Double
)
