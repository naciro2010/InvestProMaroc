package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.service.ReportingService
import ma.investpro.service.ExecutiveDashboardService
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/reporting")
@ReadAccess
class ReportingController(
    private val reportingService: ReportingService,
    private val executiveDashboardService: ExecutiveDashboardService
) {

    // ==================== EXECUTIVE DASHBOARD ====================

    @GetMapping("/dashboard/executive")
    fun getExecutiveDashboard() =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Tableau de bord executif",
                executiveDashboardService.getExecutiveDashboard()
            )
        )

    // ==================== RECHERCHE AVANCÉE ====================

    @PostMapping("/depenses/search")
    fun searchDepenses(@RequestBody criteria: DepenseSearchCriteria) =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Résultats de recherche",
                reportingService.searchDepenses(criteria)
            )
        )

    @PostMapping("/commissions/search")
    fun searchCommissions(@RequestBody criteria: CommissionSearchCriteria) =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Résultats de recherche",
                reportingService.searchCommissions(criteria)
            )
        )

    // ==================== STATISTIQUES COMMISSIONS ====================

    @GetMapping("/commissions/stats/periode")
    fun getCommissionStatsByPeriod(
        @RequestParam(required = false) annee: Int?,
        @RequestParam(required = false) mois: Int?
    ) = ResponseEntity.ok(
        ApiResponse(
            true,
            "Statistiques commissions par période",
            reportingService.getCommissionStatsByPeriod(annee, mois)
        )
    )

    @GetMapping("/commissions/stats/fournisseur")
    fun getCommissionStatsByFournisseur(@RequestParam(required = false) fournisseurId: Long?) =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Statistiques commissions par fournisseur",
                reportingService.getCommissionStatsByFournisseur(fournisseurId)
            )
        )

    @GetMapping("/commissions/stats/convention")
    fun getCommissionStatsByConvention(@RequestParam(required = false) conventionId: Long?) =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Statistiques commissions par convention",
                reportingService.getCommissionStatsByConvention(conventionId)
            )
        )

    // ==================== STATISTIQUES DÉPENSES ====================

    @GetMapping("/depenses/stats/periode")
    fun getDepenseStatsByPeriod(
        @RequestParam(required = false) annee: Int?,
        @RequestParam(required = false) mois: Int?
    ) = ResponseEntity.ok(
        ApiResponse(
            true,
            "Statistiques dépenses par période",
            reportingService.getDepenseStatsByPeriod(annee, mois)
        )
    )

    @GetMapping("/depenses/stats/fournisseur")
    fun getDepenseStatsByFournisseur(@RequestParam(required = false) fournisseurId: Long?) =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Statistiques dépenses par fournisseur",
                reportingService.getDepenseStatsByFournisseur(fournisseurId)
            )
        )

    @GetMapping("/paiements/stats")
    fun getPaiementStats() =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Statistiques paiements",
                reportingService.getPaiementStats()
            )
        )

    // ==================== DASHBOARD GLOBAL ====================

    @GetMapping("/dashboard")
    fun getDashboard() =
        ResponseEntity.ok(
            ApiResponse(
                true,
                "Statistiques du tableau de bord",
                reportingService.getDashboardStats()
            )
        )
}
