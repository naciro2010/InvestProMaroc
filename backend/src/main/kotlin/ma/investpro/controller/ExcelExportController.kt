package ma.investpro.controller

import ma.investpro.dto.CommissionSearchCriteria
import ma.investpro.dto.DepenseSearchCriteria
import ma.investpro.service.ExcelExportService
import ma.investpro.service.ReportingService
import mu.KotlinLogging
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/export/excel")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
class ExcelExportController(
    private val excelExportService: ExcelExportService,
    private val reportingService: ReportingService
) {

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd")

    // ==================== EXPORT DÉPENSES ====================

    @PostMapping("/depenses")
    fun exportDepenses(@RequestBody criteria: DepenseSearchCriteria): ResponseEntity<ByteArray> {
        logger.info { "Export Excel des dépenses avec critères: $criteria" }

        val depenses = reportingService.searchDepenses(criteria)
        val excelData = excelExportService.exportDepenses(depenses)

        val filename = "depenses_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    @GetMapping("/depenses/all")
    fun exportAllDepenses(): ResponseEntity<ByteArray> {
        logger.info { "Export Excel de toutes les dépenses" }

        val depenses = reportingService.searchDepenses(DepenseSearchCriteria())
        val excelData = excelExportService.exportDepenses(depenses)

        val filename = "depenses_toutes_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    // ==================== EXPORT COMMISSIONS ====================

    @PostMapping("/commissions")
    fun exportCommissions(@RequestBody criteria: CommissionSearchCriteria): ResponseEntity<ByteArray> {
        logger.info { "Export Excel des commissions avec critères: $criteria" }

        val commissions = reportingService.searchCommissions(criteria)
        val excelData = excelExportService.exportCommissions(commissions)

        val filename = "commissions_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    @GetMapping("/commissions/all")
    fun exportAllCommissions(): ResponseEntity<ByteArray> {
        logger.info { "Export Excel de toutes les commissions" }

        val commissions = reportingService.searchCommissions(CommissionSearchCriteria())
        val excelData = excelExportService.exportCommissions(commissions)

        val filename = "commissions_toutes_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    // ==================== EXPORT STATISTIQUES DÉPENSES ====================

    @GetMapping("/stats/depenses/periode")
    fun exportDepenseStatsByPeriod(
        @RequestParam(required = false) annee: Int?,
        @RequestParam(required = false) mois: Int?
    ): ResponseEntity<ByteArray> {
        logger.info { "Export Excel statistiques dépenses par période" }

        val stats = reportingService.getDepenseStatsByPeriod(annee, mois)
        val excelData = excelExportService.exportDepenseStats(stats, "periode")

        val filename = "stats_depenses_periode_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    @GetMapping("/stats/depenses/fournisseur")
    fun exportDepenseStatsByFournisseur(@RequestParam(required = false) fournisseurId: Long?): ResponseEntity<ByteArray> {
        logger.info { "Export Excel statistiques dépenses par fournisseur" }

        val stats = reportingService.getDepenseStatsByFournisseur(fournisseurId)
        val excelData = excelExportService.exportDepenseStats(stats, "fournisseur")

        val filename = "stats_depenses_fournisseur_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    // ==================== EXPORT STATISTIQUES COMMISSIONS ====================

    @GetMapping("/stats/commissions/periode")
    fun exportCommissionStatsByPeriod(
        @RequestParam(required = false) annee: Int?,
        @RequestParam(required = false) mois: Int?
    ): ResponseEntity<ByteArray> {
        logger.info { "Export Excel statistiques commissions par période" }

        val stats = reportingService.getCommissionStatsByPeriod(annee, mois)
        val excelData = excelExportService.exportCommissionStats(stats, "periode")

        val filename = "stats_commissions_periode_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    @GetMapping("/stats/commissions/fournisseur")
    fun exportCommissionStatsByFournisseur(@RequestParam(required = false) fournisseurId: Long?): ResponseEntity<ByteArray> {
        logger.info { "Export Excel statistiques commissions par fournisseur" }

        val stats = reportingService.getCommissionStatsByFournisseur(fournisseurId)
        val excelData = excelExportService.exportCommissionStats(stats, "fournisseur")

        val filename = "stats_commissions_fournisseur_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }

    @GetMapping("/stats/commissions/convention")
    fun exportCommissionStatsByConvention(@RequestParam(required = false) conventionId: Long?): ResponseEntity<ByteArray> {
        logger.info { "Export Excel statistiques commissions par convention" }

        val stats = reportingService.getCommissionStatsByConvention(conventionId)
        val excelData = excelExportService.exportCommissionStats(stats, "convention")

        val filename = "stats_commissions_convention_${LocalDate.now().format(dateFormatter)}.xlsx"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelData)
    }
}
