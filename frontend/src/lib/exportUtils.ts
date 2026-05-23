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

interface PdfExportOptions {
  title: string
  subtitle?: string
  filename: string
  elementId?: string
}

export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const { title, subtitle, filename, elementId } = options

  const element = elementId
    ? document.getElementById(elementId)
    : document.querySelector('[data-pdf-export]') as HTMLElement

  if (!element) {
    console.error('Element not found for PDF export')
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  const now = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        ${styles}
        @media print {
          body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .pdf-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #14a374; }
          .pdf-header h1 { font-size: 22px; color: #14a374; margin: 0 0 4px 0; }
          .pdf-header p { font-size: 12px; color: #666; margin: 0; }
          .pdf-footer { text-align: center; font-size: 10px; color: #999; margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; }
          nav, button, .MuiDrawer-root, .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; }
          th { background: #f5f7fa; font-weight: 600; }
        }
      </style>
    </head>
    <body>
      <div class="pdf-header">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
        <p>Exporté le ${now}</p>
      </div>
      ${element.innerHTML}
      <div class="pdf-footer">
        InvestPro Maroc - Document généré automatiquement
      </div>
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}
