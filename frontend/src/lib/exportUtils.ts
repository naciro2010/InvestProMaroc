import ExcelJS from 'exceljs'

interface ExportColumn {
  header: string
  key: string
  width?: number
  formatter?: (value: unknown) => string
}

interface ExportOptions {
  filename: string
  sheetName: string
  columns: ExportColumn[]
  data: Record<string, unknown>[]
  title?: string
}

export async function exportToExcel(options: ExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(options.sheetName)

  // Configure columns
  sheet.columns = options.columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }))

  // Style header row
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C66E4' } }
  headerRow.alignment = { horizontal: 'center' }

  // Add data rows
  options.data.forEach(item => {
    const row: Record<string, unknown> = {}
    options.columns.forEach(col => {
      const value = item[col.key]
      row[col.key] = col.formatter ? col.formatter(value) : value
    })
    sheet.addRow(row)
  })

  // Auto-filter on header
  const lastColLetter = String.fromCharCode(64 + options.columns.length)
  sheet.autoFilter = { from: 'A1', to: `${lastColLetter}1` }

  // Download file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${options.filename}_${new Date().toISOString().split('T')[0]}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function formatCurrencyForExport(value: unknown): string {
  if (typeof value !== 'number') return ''
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(value) + ' MAD'
}

export function formatDateForExport(value: unknown): string {
  if (!value || typeof value !== 'string') return ''
  return new Date(value).toLocaleDateString('fr-FR')
}
