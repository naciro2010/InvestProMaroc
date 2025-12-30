package ma.investpro.service

import ma.investpro.dto.CommissionStats
import ma.investpro.dto.DepenseStats
import ma.investpro.entity.Commission
import ma.investpro.entity.DepenseInvestissement
import mu.KotlinLogging
import org.apache.poi.ss.usermodel.*
import org.apache.poi.xssf.usermodel.XSSFCellStyle
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

@Service
class ExcelExportService {

    private val dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")

    // ==================== EXPORT DÉPENSES ====================

    fun exportDepenses(depenses: List<DepenseInvestissement>): ByteArray {
        logger.info { "Export de ${depenses.size} dépenses vers Excel" }

        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet("Dépenses")

        // Style pour l'en-tête
        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)
        val dateStyle = createDateStyle(workbook)

        // En-tête
        val headerRow = sheet.createRow(0)
        val headers = listOf(
            "N° Facture", "Date Facture", "Fournisseur", "ICE",
            "Convention", "Montant HT", "TVA %", "Montant TVA",
            "Montant TTC", "Retenue TVA", "Retenue IS", "Retenue Non-Résident",
            "Retenue Garantie", "Réf. Marché", "N° Décompte", "Date Paiement",
            "Réf. Paiement", "Compte Bancaire", "Payé", "Remarques"
        )

        headers.forEachIndexed { index, header ->
            val cell = headerRow.createCell(index)
            cell.setCellValue(header)
            cell.cellStyle = headerStyle
        }

        // Données
        depenses.forEachIndexed { rowIndex, depense ->
            val row = sheet.createRow(rowIndex + 1)

            // Numéro facture
            row.createCell(0).setCellValue(depense.numeroFacture)

            // Date facture
            val dateCell = row.createCell(1)
            dateCell.setCellValue(depense.dateFacture.format(dateFormatter))
            dateCell.cellStyle = dateStyle

            // Fournisseur
            row.createCell(2).setCellValue(depense.fournisseur?.raisonSociale ?: "")
            row.createCell(3).setCellValue(depense.fournisseur?.ice ?: "")

            // Convention
            row.createCell(4).setCellValue(depense.convention?.libelle ?: "")

            // Montants
            createCurrencyCell(row, 5, depense.montantHt, currencyStyle)
            row.createCell(6).setCellValue(depense.tauxTva.toDouble())
            createCurrencyCell(row, 7, depense.montantTva, currencyStyle)
            createCurrencyCell(row, 8, depense.montantTtc, currencyStyle)

            // Retenues
            createCurrencyCell(row, 9, depense.retenueTva, currencyStyle)
            createCurrencyCell(row, 10, depense.retenueIsTiers, currencyStyle)
            createCurrencyCell(row, 11, depense.retenueNonResident, currencyStyle)
            createCurrencyCell(row, 12, depense.retenueGarantie, currencyStyle)

            // Références
            row.createCell(13).setCellValue(depense.referenceMarche ?: "")
            row.createCell(14).setCellValue(depense.numeroDecompte ?: "")

            // Paiement
            val datePaiementCell = row.createCell(15)
            depense.datePaiement?.let {
                datePaiementCell.setCellValue(it.format(dateFormatter))
                datePaiementCell.cellStyle = dateStyle
            }

            row.createCell(16).setCellValue(depense.referencePaiement ?: "")
            row.createCell(17).setCellValue(depense.compteBancaire?.code ?: "")
            row.createCell(18).setCellValue(if (depense.paye) "Oui" else "Non")
            row.createCell(19).setCellValue(depense.remarques ?: "")
        }

        // Auto-size columns
        headers.indices.forEach { sheet.autoSizeColumn(it) }

        return workbookToByteArray(workbook)
    }

    // ==================== EXPORT COMMISSIONS ====================

    fun exportCommissions(commissions: List<Commission>): ByteArray {
        logger.info { "Export de ${commissions.size} commissions vers Excel" }

        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet("Commissions")

        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)
        val dateStyle = createDateStyle(workbook)

        // En-tête
        val headerRow = sheet.createRow(0)
        val headers = listOf(
            "Date Calcul", "N° Facture Dépense", "Fournisseur",
            "Convention", "Base Calcul", "Montant Base", "Taux Commission %",
            "Commission HT", "Taux TVA %", "TVA Commission", "Commission TTC"
        )

        headers.forEachIndexed { index, header ->
            val cell = headerRow.createCell(index)
            cell.setCellValue(header)
            cell.cellStyle = headerStyle
        }

        // Données
        commissions.forEachIndexed { rowIndex, commission ->
            val row = sheet.createRow(rowIndex + 1)

            // Date calcul
            val dateCell = row.createCell(0)
            dateCell.setCellValue(commission.dateCalcul.format(dateFormatter))
            dateCell.cellStyle = dateStyle

            // Dépense
            row.createCell(1).setCellValue(commission.depense?.numeroFacture ?: "")

            // Fournisseur
            row.createCell(2).setCellValue(commission.depense?.fournisseur?.raisonSociale ?: "")

            // Convention
            row.createCell(3).setCellValue(commission.convention?.libelle ?: "")

            // Base de calcul
            row.createCell(4).setCellValue(commission.baseCalcul)

            // Montants
            createCurrencyCell(row, 5, commission.montantBase, currencyStyle)
            row.createCell(6).setCellValue(commission.tauxCommission.toDouble())
            createCurrencyCell(row, 7, commission.montantCommissionHt, currencyStyle)
            row.createCell(8).setCellValue(commission.tauxTva.toDouble())
            createCurrencyCell(row, 9, commission.montantTvaCommission, currencyStyle)
            createCurrencyCell(row, 10, commission.montantCommissionTtc, currencyStyle)
        }

        // Auto-size columns
        headers.indices.forEach { sheet.autoSizeColumn(it) }

        return workbookToByteArray(workbook)
    }

    // ==================== EXPORT STATISTIQUES DÉPENSES ====================

    fun exportDepenseStats(stats: List<DepenseStats>, groupBy: String): ByteArray {
        logger.info { "Export statistiques dépenses groupées par $groupBy" }

        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet("Statistiques Dépenses")

        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)

        // En-tête dynamique selon le groupBy
        val headerRow = sheet.createRow(0)
        val headers = mutableListOf<String>()

        when (groupBy) {
            "periode" -> headers.add("Période")
            "fournisseur" -> headers.add("Fournisseur")
            "compte" -> headers.add("Compte Bancaire")
        }

        headers.addAll(
            listOf(
                "Nombre Dépenses", "Total HT", "Total TVA", "Total TTC",
                "Retenue TVA", "Retenue IS", "Retenue Non-Résident", "Retenue Garantie"
            )
        )

        headers.forEachIndexed { index, header ->
            val cell = headerRow.createCell(index)
            cell.setCellValue(header)
            cell.cellStyle = headerStyle
        }

        // Données
        stats.forEachIndexed { rowIndex, stat ->
            val row = sheet.createRow(rowIndex + 1)

            // Première colonne selon le groupBy
            when (groupBy) {
                "periode" -> row.createCell(0).setCellValue(stat.periode ?: "")
                "fournisseur" -> row.createCell(0).setCellValue(stat.fournisseurNom ?: "")
                "compte" -> row.createCell(0).setCellValue(stat.compteBancaireNom ?: "")
            }

            // Statistiques
            row.createCell(1).setCellValue(stat.nombreDepenses.toDouble())
            createCurrencyCell(row, 2, stat.totalMontantHt, currencyStyle)
            createCurrencyCell(row, 3, stat.totalMontantTva, currencyStyle)
            createCurrencyCell(row, 4, stat.totalMontantTtc, currencyStyle)
            createCurrencyCell(row, 5, stat.totalRetenueTva, currencyStyle)
            createCurrencyCell(row, 6, stat.totalRetenueIs, currencyStyle)
            createCurrencyCell(row, 7, stat.totalRetenueNonResident, currencyStyle)
            createCurrencyCell(row, 8, stat.totalRetenueGarantie, currencyStyle)
        }

        // Auto-size columns
        headers.indices.forEach { sheet.autoSizeColumn(it) }

        return workbookToByteArray(workbook)
    }

    // ==================== EXPORT STATISTIQUES COMMISSIONS ====================

    fun exportCommissionStats(stats: List<CommissionStats>, groupBy: String): ByteArray {
        logger.info { "Export statistiques commissions groupées par $groupBy" }

        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet("Statistiques Commissions")

        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)

        // En-tête
        val headerRow = sheet.createRow(0)
        val headers = mutableListOf<String>()

        when (groupBy) {
            "periode" -> headers.add("Période")
            "fournisseur" -> headers.add("Fournisseur")
            "convention" -> headers.add("Convention")
        }

        headers.addAll(
            listOf(
                "Nombre Commissions", "Total Commission HT", "Total TVA", "Total Commission TTC"
            )
        )

        headers.forEachIndexed { index, header ->
            val cell = headerRow.createCell(index)
            cell.setCellValue(header)
            cell.cellStyle = headerStyle
        }

        // Données
        stats.forEachIndexed { rowIndex, stat ->
            val row = sheet.createRow(rowIndex + 1)

            when (groupBy) {
                "periode" -> row.createCell(0).setCellValue(stat.periode ?: "")
                "fournisseur" -> row.createCell(0).setCellValue(stat.fournisseurNom ?: "")
                "convention" -> row.createCell(0).setCellValue(stat.conventionLibelle ?: "")
            }

            row.createCell(1).setCellValue(stat.nombreCommissions.toDouble())
            createCurrencyCell(row, 2, stat.totalCommissionHt, currencyStyle)
            createCurrencyCell(row, 3, stat.totalTvaCommission, currencyStyle)
            createCurrencyCell(row, 4, stat.totalCommissionTtc, currencyStyle)
        }

        // Auto-size columns
        headers.indices.forEach { sheet.autoSizeColumn(it) }

        return workbookToByteArray(workbook)
    }

    // ==================== HELPERS ====================

    private fun createHeaderStyle(workbook: Workbook): XSSFCellStyle {
        val style = workbook.createCellStyle() as XSSFCellStyle
        val font = workbook.createFont()
        font.bold = true
        font.color = IndexedColors.WHITE.index
        style.setFont(font)
        style.fillForegroundColor = IndexedColors.DARK_BLUE.index
        style.fillPattern = FillPatternType.SOLID_FOREGROUND
        style.alignment = HorizontalAlignment.CENTER
        style.borderBottom = BorderStyle.THIN
        style.borderTop = BorderStyle.THIN
        style.borderLeft = BorderStyle.THIN
        style.borderRight = BorderStyle.THIN
        return style
    }

    private fun createCurrencyStyle(workbook: Workbook): XSSFCellStyle {
        val style = workbook.createCellStyle() as XSSFCellStyle
        style.dataFormat = workbook.createDataFormat().getFormat("#,##0.00 MAD")
        return style
    }

    private fun createDateStyle(workbook: Workbook): XSSFCellStyle {
        val style = workbook.createCellStyle() as XSSFCellStyle
        style.dataFormat = workbook.createDataFormat().getFormat("dd/mm/yyyy")
        return style
    }

    private fun createCurrencyCell(row: Row, columnIndex: Int, value: java.math.BigDecimal, style: XSSFCellStyle) {
        val cell = row.createCell(columnIndex)
        cell.setCellValue(value.toDouble())
        cell.cellStyle = style
    }

    private fun workbookToByteArray(workbook: Workbook): ByteArray {
        val outputStream = ByteArrayOutputStream()
        workbook.write(outputStream)
        workbook.close()
        return outputStream.toByteArray()
    }
}
