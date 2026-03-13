package ma.investpro.service

import ma.investpro.dto.*
import ma.investpro.repository.*
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

/**
 * Executive Dashboard Service — Aggregates rich KPIs for directors.
 * Single service call returns all data needed for the executive dashboard.
 */
@Service
@Transactional(readOnly = true)
class ExecutiveDashboardService(
    private val conventionRepository: ConventionRepository,
    private val projetRepository: ProjetRepository,
    private val marcheRepository: MarcheRepository,
    private val decompteRepository: DecompteRepository,
    private val paiementRepository: PaiementRepository,
    private val fournisseurRepository: FournisseurRepository
) {

    fun getExecutiveDashboard(): ExecutiveDashboardDTO {
        logger.info { "Building executive dashboard" }

        val conventions = conventionRepository.findAll()
        val projets = projetRepository.findAll()
        val marches = marcheRepository.findAll()
        val decomptes = decompteRepository.findAll()
        val paiements = paiementRepository.findAll()
        val fournisseurs = fournisseurRepository.findAll()

        val budgetConventions = conventions.sumOf { it.budget ?: BigDecimal.ZERO }
        val budgetProjets = projets.sumOf { it.budgetTotal ?: BigDecimal.ZERO }
        val engagementMarches = marches.sumOf { it.montantTtc ?: BigDecimal.ZERO }
        val totalPaye = paiements.sumOf { it.montantPaye }

        val tauxEngagement = if (budgetConventions > BigDecimal.ZERO) {
            engagementMarches.divide(budgetConventions, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal("100")).toDouble()
        } else 0.0

        val tauxConsommation = if (budgetConventions > BigDecimal.ZERO) {
            totalPaye.divide(budgetConventions, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal("100")).toDouble()
        } else 0.0

        val marchesEnRetard = try {
            marcheRepository.findMarchesEnRetard().size.toLong()
        } catch (e: Exception) { 0L }

        val conventionsEnAttente = conventions.count {
            it.statut?.name == "SOUMIS"
        }.toLong()

        val projetsActifs = projets.count {
            it.statut?.name in listOf("EN_PREPARATION", "EN_COURS", "ACTIF")
        }.toLong()

        val decomptesEnAttente = decomptes.count {
            it.statut?.name in listOf("BROUILLON", "SOUMIS")
        }.toLong()

        // KPIs
        val kpis = ExecutiveKPIs(
            totalConventions = conventions.size.toLong(),
            totalProjets = projets.size.toLong(),
            totalMarches = marches.size.toLong(),
            totalDecomptes = decomptes.size.toLong(),
            totalPaiements = paiements.size.toLong(),
            totalFournisseurs = fournisseurs.size.toLong(),
            budgetConventions = budgetConventions,
            budgetProjets = budgetProjets,
            engagementMarches = engagementMarches,
            totalPaye = totalPaye,
            tauxEngagement = tauxEngagement,
            tauxConsommation = tauxConsommation,
            marchesEnRetard = marchesEnRetard,
            conventionsEnAttente = conventionsEnAttente,
            projetsActifs = projetsActifs,
            decomptesEnAttente = decomptesEnAttente
        )

        // Workflow funnel
        val workflowFunnel = WorkflowFunnelDTO(
            conventions = buildStatusCounts(conventions.map { it.statut?.name ?: "INCONNU" }),
            marches = buildStatusCounts(marches.map { it.statut?.name ?: "INCONNU" }),
            projets = buildStatusCounts(projets.map { it.statut?.name ?: "INCONNU" }),
            decomptes = buildStatusCounts(decomptes.map { it.statut?.name ?: "INCONNU" })
        )

        // Monthly trends (last 12 months)
        val monthlyTrends = buildMonthlyTrends(marches, decomptes, paiements)

        // Top 5 marches by amount
        val topMarches = marches
            .sortedByDescending { it.montantTtc ?: BigDecimal.ZERO }
            .take(5)
            .mapNotNull { m ->
                m.id?.let { id ->
                    val decsForMarche = decomptes.filter { it.marche?.id == m.id }
                    val montantTtc = m.montantTtc ?: BigDecimal.ZERO
                    val totalDecomptes = decsForMarche.sumOf { it.montantBrutHT ?: BigDecimal.ZERO }
                    val avancement = if (montantTtc > BigDecimal.ZERO) {
                        totalDecomptes.divide(montantTtc, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal("100")).toDouble()
                    } else 0.0

                    TopMarcheDTO(
                        id = id,
                        code = m.numeroMarche ?: "M-$id",
                        objet = m.objet ?: "",
                        montantTtc = montantTtc,
                        statut = m.statut?.name ?: "INCONNU",
                        fournisseur = m.fournisseur?.raisonSociale,
                        tauxAvancement = avancement.coerceAtMost(100.0)
                    )
                }
            }

        // Top 5 fournisseurs by total marche amount
        val topFournisseursData = marches
            .filter { it.fournisseur != null }
            .groupBy { it.fournisseur!! }
            .map { (fournisseur, fournisseurMarches) ->
                TopFournisseurDTO(
                    id = fournisseur.id ?: 0,
                    nom = fournisseur.raisonSociale ?: fournisseur.code ?: "N/A",
                    totalMarches = fournisseurMarches.size.toLong(),
                    montantTotal = fournisseurMarches.sumOf { it.montantTtc ?: BigDecimal.ZERO },
                    dernierMarche = fournisseurMarches
                        .maxByOrNull { it.dateMarche ?: LocalDate.MIN }
                        ?.numeroMarche
                )
            }
            .sortedByDescending { it.montantTotal }
            .take(5)

        // Alerts
        val alerts = buildAlerts(conventions, marches, decomptes, marchesEnRetard, conventionsEnAttente)

        // Recent activity (last 8 items across all entities)
        val recentActivity = buildRecentActivity(conventions, marches, projets, decomptes)

        // Budget execution per convention
        val budgetExecution = buildBudgetExecution(conventions, marches, paiements, decomptes, budgetConventions, engagementMarches, totalPaye)

        return ExecutiveDashboardDTO(
            kpis = kpis,
            workflowFunnel = workflowFunnel,
            monthlyTrends = monthlyTrends,
            topMarches = topMarches,
            topFournisseurs = topFournisseursData,
            alerts = alerts,
            recentActivity = recentActivity,
            budgetExecution = budgetExecution
        )
    }

    private fun buildStatusCounts(statuts: List<String>): StatusCountsDTO {
        val counts = statuts.groupBy { it }.mapValues { it.value.size.toLong() }
        return StatusCountsDTO(counts = counts, total = statuts.size.toLong())
    }

    private fun buildMonthlyTrends(
        marches: List<ma.investpro.entity.Marche>,
        decomptes: List<ma.investpro.entity.Decompte>,
        paiements: List<ma.investpro.entity.Paiement>
    ): List<MonthlyTrendDTO> {
        val now = LocalDate.now()
        val monthNames = listOf("Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec")
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        return (11 downTo 0).map { i ->
            val date = now.minusMonths(i.toLong())
            val key = date.format(formatter)
            val year = date.year
            val month = date.monthValue

            val marchesInMonth = marches.filter {
                it.dateMarche?.year == year && it.dateMarche?.monthValue == month
            }
            val decomptesInMonth = decomptes.filter {
                it.createdAt?.year == year && it.createdAt?.monthValue == month
            }
            val paiementsInMonth = paiements.filter {
                it.dateValeur?.year == year && it.dateValeur?.monthValue == month
            }

            MonthlyTrendDTO(
                month = key,
                label = "${monthNames[month - 1]} ${year % 100}",
                marchesCreated = marchesInMonth.size.toLong(),
                decomptesEmis = decomptesInMonth.size.toLong(),
                paiementsEffectues = paiementsInMonth.size.toLong(),
                montantEngage = marchesInMonth.sumOf { it.montantTtc ?: BigDecimal.ZERO },
                montantPaye = paiementsInMonth.sumOf { it.montantPaye }
            )
        }
    }

    private fun buildAlerts(
        conventions: List<ma.investpro.entity.Convention>,
        marches: List<ma.investpro.entity.Marche>,
        decomptes: List<ma.investpro.entity.Decompte>,
        marchesEnRetard: Long,
        conventionsEnAttente: Long
    ): List<DashboardAlertDTO> {
        val alerts = mutableListOf<DashboardAlertDTO>()

        if (marchesEnRetard > 0) {
            alerts.add(DashboardAlertDTO(
                type = "RETARD_MARCHE",
                severity = "danger",
                message = "$marchesEnRetard marche${if (marchesEnRetard > 1) "s" else ""} en retard de livraison",
                count = marchesEnRetard,
                link = "/marches"
            ))
        }

        if (conventionsEnAttente > 0) {
            alerts.add(DashboardAlertDTO(
                type = "CONVENTION_EN_ATTENTE",
                severity = "warning",
                message = "$conventionsEnAttente convention${if (conventionsEnAttente > 1) "s" else ""} en attente de validation",
                count = conventionsEnAttente,
                link = "/conventions"
            ))
        }

        val brouillons = conventions.count { it.statut?.name == "BROUILLON" }.toLong()
        if (brouillons > 0) {
            alerts.add(DashboardAlertDTO(
                type = "BROUILLONS",
                severity = "info",
                message = "$brouillons brouillon${if (brouillons > 1) "s" else ""} a finaliser",
                count = brouillons,
                link = "/conventions"
            ))
        }

        val decomptesAValider = decomptes.count { it.statut?.name == "SOUMIS" }.toLong()
        if (decomptesAValider > 0) {
            alerts.add(DashboardAlertDTO(
                type = "DECOMPTE_A_VALIDER",
                severity = "warning",
                message = "$decomptesAValider decompte${if (decomptesAValider > 1) "s" else ""} a valider",
                count = decomptesAValider,
                link = "/decomptes"
            ))
        }

        val enExecution = conventions.count { it.statut?.name == "EN_EXECUTION" }.toLong()
        if (enExecution > 0) {
            alerts.add(DashboardAlertDTO(
                type = "EN_EXECUTION",
                severity = "success",
                message = "$enExecution convention${if (enExecution > 1) "s" else ""} en cours d'execution",
                count = enExecution,
                link = "/conventions"
            ))
        }

        if (alerts.isEmpty()) {
            alerts.add(DashboardAlertDTO(
                type = "OK",
                severity = "success",
                message = "Tout est a jour, aucune action requise",
                count = 0,
                link = null
            ))
        }

        return alerts
    }

    private fun buildRecentActivity(
        conventions: List<ma.investpro.entity.Convention>,
        marches: List<ma.investpro.entity.Marche>,
        projets: List<ma.investpro.entity.Projet>,
        decomptes: List<ma.investpro.entity.Decompte>
    ): List<RecentActivityDTO> {
        data class ActivityEntry(val date: LocalDate?, val dto: RecentActivityDTO)

        val items = mutableListOf<ActivityEntry>()

        conventions.take(10).forEach { c ->
            c.id?.let { id ->
                items.add(ActivityEntry(
                    date = c.updatedAt?.toLocalDate() ?: c.createdAt?.toLocalDate(),
                    dto = RecentActivityDTO(
                        id = id,
                        entityType = "convention",
                        code = c.code ?: "CONV-$id",
                        label = c.objet ?: c.libelle ?: "",
                        statut = c.statut?.name ?: "INCONNU",
                        date = (c.updatedAt ?: c.createdAt)?.toString(),
                        path = "/conventions/$id"
                    )
                ))
            }
        }

        marches.take(10).forEach { m ->
            m.id?.let { id ->
                items.add(ActivityEntry(
                    date = m.dateMarche,
                    dto = RecentActivityDTO(
                        id = id,
                        entityType = "marche",
                        code = m.numeroMarche ?: "M-$id",
                        label = m.objet ?: "",
                        statut = m.statut?.name ?: "INCONNU",
                        date = m.dateMarche?.toString(),
                        path = "/marches/$id"
                    )
                ))
            }
        }

        projets.take(5).forEach { p ->
            p.id?.let { id ->
                items.add(ActivityEntry(
                    date = p.updatedAt?.toLocalDate() ?: p.createdAt?.toLocalDate(),
                    dto = RecentActivityDTO(
                        id = id,
                        entityType = "projet",
                        code = p.code ?: "P-$id",
                        label = p.nom ?: "",
                        statut = p.statut?.name ?: "INCONNU",
                        date = (p.updatedAt ?: p.createdAt)?.toString(),
                        path = "/projets/$id"
                    )
                ))
            }
        }

        decomptes.take(5).forEach { d ->
            d.id?.let { id ->
                items.add(ActivityEntry(
                    date = d.createdAt?.toLocalDate(),
                    dto = RecentActivityDTO(
                        id = id,
                        entityType = "decompte",
                        code = d.numeroDecompte ?: "DEC-$id",
                        label = "Decompte #${d.numeroDecompte ?: id}",
                        statut = d.statut?.name ?: "INCONNU",
                        date = d.createdAt?.toString(),
                        path = "/decomptes/$id"
                    )
                ))
            }
        }

        return items
            .sortedByDescending { it.date }
            .take(8)
            .map { it.dto }
    }

    private fun buildBudgetExecution(
        conventions: List<ma.investpro.entity.Convention>,
        marches: List<ma.investpro.entity.Marche>,
        paiements: List<ma.investpro.entity.Paiement>,
        decomptes: List<ma.investpro.entity.Decompte>,
        budgetTotal: BigDecimal,
        engage: BigDecimal,
        paye: BigDecimal
    ): BudgetExecutionDTO {
        val resteBudget = (budgetTotal - engage).coerceAtLeast(BigDecimal.ZERO)
        val resteAPayer = (engage - paye).coerceAtLeast(BigDecimal.ZERO)

        val tauxEng = if (budgetTotal > BigDecimal.ZERO)
            engage.divide(budgetTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal("100")).toDouble()
        else 0.0

        val tauxPai = if (engage > BigDecimal.ZERO)
            paye.divide(engage, 4, RoundingMode.HALF_UP).multiply(BigDecimal("100")).toDouble()
        else 0.0

        val byConvention = conventions
            .filter { (it.budget ?: BigDecimal.ZERO) > BigDecimal.ZERO }
            .mapNotNull { conv ->
                conv.id?.let { convId ->
                    val convBudget = conv.budget ?: BigDecimal.ZERO
                    val convMarches = marches.filter { it.convention?.id == convId }
                    val convEngage = convMarches.sumOf { it.montantTtc ?: BigDecimal.ZERO }
                    val convTaux = if (convBudget > BigDecimal.ZERO)
                        convEngage.divide(convBudget, 4, RoundingMode.HALF_UP).multiply(BigDecimal("100")).toDouble()
                    else 0.0

                    ConventionBudgetDTO(
                        id = convId,
                        code = conv.code ?: "CONV-$convId",
                        budget = convBudget,
                        engage = convEngage,
                        paye = BigDecimal.ZERO,
                        tauxEngagement = convTaux.coerceAtMost(100.0)
                    )
                }
            }
            .sortedByDescending { it.budget }
            .take(8)

        return BudgetExecutionDTO(
            budgetTotal = budgetTotal,
            engage = engage,
            paye = paye,
            resteBudget = resteBudget,
            resteAPayer = resteAPayer,
            tauxEngagement = tauxEng,
            tauxPaiement = tauxPai,
            byConvention = byConvention
        )
    }
}
