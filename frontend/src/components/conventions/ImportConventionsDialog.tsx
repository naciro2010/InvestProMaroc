import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  LinearProgress,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Delete,
  Edit,
  Download,
  Close,
  Refresh,
} from '@mui/icons-material'
import ExcelJS from 'exceljs'
import { colors, typography, borders } from '@/lib/designSystem'
import { conventionsAPI } from '@/lib/api'
import type { CreateConventionDTO } from '@/types/api'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type RowStatus = 'valid' | 'warning' | 'error'

interface CellError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

interface ImportRow {
  rowIndex: number
  status: RowStatus
  errors: CellError[]
  data: ImportRowData
  selected: boolean
}

interface ImportRowData {
  code: string
  numero: string
  libelle: string
  objet: string
  typeConvention: string
  budget: number | string
  tauxCommission: number | string
  baseCalcul: string
  tauxTva: number | string
  dateDebut: string
  dateFin: string
  description: string
}

type ImportRowDataKey = keyof ImportRowData

interface ImportResult {
  success: number
  failed: number
  errors: { row: number; message: string }[]
}

interface ImportConventionsDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  existingCodes: string[]
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STEPS = ['Charger le fichier', 'Verifier et corriger', 'Importer']

const EXPECTED_COLUMNS: { key: ImportRowDataKey; label: string; required: boolean }[] = [
  { key: 'code', label: 'Code', required: true },
  { key: 'numero', label: 'Numero', required: false },
  { key: 'libelle', label: 'Libelle', required: true },
  { key: 'objet', label: 'Objet', required: false },
  { key: 'typeConvention', label: 'Type', required: false },
  { key: 'budget', label: 'Budget (MAD)', required: false },
  { key: 'tauxCommission', label: 'Taux Commission (%)', required: false },
  { key: 'baseCalcul', label: 'Base Calcul', required: false },
  { key: 'tauxTva', label: 'Taux TVA (%)', required: false },
  { key: 'dateDebut', label: 'Date Debut', required: true },
  { key: 'dateFin', label: 'Date Fin', required: false },
  { key: 'description', label: 'Description', required: false },
]

const VALID_TYPES = ['CADRE', 'NON_CADRE', 'SPECIFIQUE', 'AVENANT']
const VALID_BASE_CALCUL = ['MONTANT', 'POURCENTAGE', 'DECAISSEMENTS_TTC', 'DECAISSEMENTS_HT', '']

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function cellToString(cell: ExcelJS.CellValue): string {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'object' && 'result' in cell) return String(cell.result ?? '')
  if (cell instanceof Date) return cell.toISOString().split('T')[0]
  return String(cell).trim()
}

function cellToNumber(cell: ExcelJS.CellValue): number | string {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'number') return cell
  const s = String(cell).replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? String(cell) : n
}

function parseExcelDate(cell: ExcelJS.CellValue): string {
  if (!cell) return ''
  if (cell instanceof Date) return cell.toISOString().split('T')[0]
  const s = String(cell).trim()
  // Try ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10)
  // Try DD/MM/YYYY
  const parts = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (parts) return `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
  return s
}

function validateRow(row: ImportRowData, existingCodes: Set<string>, allCodes: string[], rowIdx: number): CellError[] {
  const errors: CellError[] = []

  // Required fields
  if (!row.code.trim()) {
    errors.push({ field: 'code', message: 'Code obligatoire', severity: 'error' })
  } else if (existingCodes.has(row.code.trim().toUpperCase())) {
    errors.push({ field: 'code', message: 'Code deja existant en base', severity: 'error' })
  } else {
    const duplicates = allCodes.filter((c, i) => c === row.code.trim().toUpperCase() && i !== rowIdx)
    if (duplicates.length > 0) {
      errors.push({ field: 'code', message: 'Code en double dans le fichier', severity: 'error' })
    }
  }

  if (!row.libelle.trim()) {
    errors.push({ field: 'libelle', message: 'Libelle obligatoire', severity: 'error' })
  }

  if (!row.dateDebut) {
    errors.push({ field: 'dateDebut', message: 'Date debut obligatoire', severity: 'error' })
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dateDebut)) {
    errors.push({ field: 'dateDebut', message: 'Format date invalide (YYYY-MM-DD)', severity: 'error' })
  }

  if (row.dateFin && !/^\d{4}-\d{2}-\d{2}$/.test(row.dateFin)) {
    errors.push({ field: 'dateFin', message: 'Format date invalide', severity: 'warning' })
  }

  if (row.dateFin && row.dateDebut && row.dateFin < row.dateDebut) {
    errors.push({ field: 'dateFin', message: 'Date fin avant date debut', severity: 'error' })
  }

  // Type
  if (row.typeConvention && !VALID_TYPES.includes(row.typeConvention.toUpperCase())) {
    errors.push({ field: 'typeConvention', message: `Type invalide. Attendu: ${VALID_TYPES.join(', ')}`, severity: 'error' })
  }

  // Budget
  if (row.budget !== '' && typeof row.budget === 'string') {
    errors.push({ field: 'budget', message: 'Budget doit etre un nombre', severity: 'error' })
  } else if (typeof row.budget === 'number' && row.budget < 0) {
    errors.push({ field: 'budget', message: 'Budget ne peut pas etre negatif', severity: 'error' })
  }

  // Taux commission
  if (row.tauxCommission !== '' && typeof row.tauxCommission === 'string') {
    errors.push({ field: 'tauxCommission', message: 'Taux doit etre un nombre', severity: 'error' })
  } else if (typeof row.tauxCommission === 'number' && (row.tauxCommission < 0 || row.tauxCommission > 100)) {
    errors.push({ field: 'tauxCommission', message: 'Taux entre 0 et 100', severity: 'warning' })
  }

  // TVA
  if (row.tauxTva !== '' && typeof row.tauxTva === 'string') {
    errors.push({ field: 'tauxTva', message: 'TVA doit etre un nombre', severity: 'error' })
  }

  // Base calcul
  if (row.baseCalcul && !VALID_BASE_CALCUL.includes(row.baseCalcul.toUpperCase())) {
    errors.push({ field: 'baseCalcul', message: 'Base invalide', severity: 'warning' })
  }

  // Warning: missing optional fields
  if (!row.objet && !row.description) {
    errors.push({ field: 'objet', message: 'Pas d\'objet ni description', severity: 'warning' })
  }

  return errors
}

function getRowStatus(errors: CellError[]): RowStatus {
  if (errors.some(e => e.severity === 'error')) return 'error'
  if (errors.some(e => e.severity === 'warning')) return 'warning'
  return 'valid'
}

// ─────────────────────────────────────────────────────────────
// Template download
// ─────────────────────────────────────────────────────────────

async function downloadTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Conventions')

  sheet.columns = EXPECTED_COLUMNS.map(col => ({
    header: col.label + (col.required ? ' *' : ''),
    key: col.key,
    width: col.key === 'libelle' || col.key === 'objet' ? 35 : col.key === 'description' ? 40 : 20,
  }))

  // Style header
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3b5998' } }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 30

  // Add example rows
  const examples: Partial<ImportRowData>[] = [
    { code: 'CONV-001', numero: 'N-2026-001', libelle: 'Convention Infrastructure Routiere', objet: 'Amenagement des routes nationales', typeConvention: 'CADRE', budget: 5000000, tauxCommission: 2.5, baseCalcul: 'DECAISSEMENTS_TTC', tauxTva: 20, dateDebut: '2026-01-01', dateFin: '2028-12-31', description: 'Convention cadre pour infrastructure' },
    { code: 'CONV-002', numero: 'N-2026-002', libelle: 'Convention Equipement Scolaire', objet: 'Equipement des ecoles primaires', typeConvention: 'NON_CADRE', budget: 2000000, tauxCommission: 1.5, baseCalcul: 'MONTANT', tauxTva: 20, dateDebut: '2026-03-01', dateFin: '2027-06-30', description: '' },
  ]
  examples.forEach(ex => {
    const row = sheet.addRow(ex)
    row.font = { color: { argb: 'FF666666' }, italic: true }
  })

  // Add data validation for Type
  sheet.getColumn('typeConvention').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"CADRE,NON_CADRE,SPECIFIQUE,AVENANT"'],
        showErrorMessage: true,
        errorTitle: 'Type invalide',
        error: 'Choisir: CADRE, NON_CADRE, SPECIFIQUE ou AVENANT',
      }
    }
  })

  // Instructions sheet
  const instrSheet = workbook.addWorksheet('Instructions')
  instrSheet.getColumn('A').width = 25
  instrSheet.getColumn('B').width = 60
  const instrData = [
    ['Champ', 'Description'],
    ['Code *', 'Code unique de la convention (ex: CONV-001)'],
    ['Numero', 'Numero officiel de la convention'],
    ['Libelle *', 'Titre / libelle de la convention'],
    ['Objet', 'Objet detaille de la convention'],
    ['Type', 'CADRE, NON_CADRE, SPECIFIQUE ou AVENANT'],
    ['Budget (MAD)', 'Montant du budget en MAD (nombre)'],
    ['Taux Commission (%)', 'Pourcentage de commission (0-100)'],
    ['Base Calcul', 'MONTANT, POURCENTAGE, DECAISSEMENTS_TTC ou DECAISSEMENTS_HT'],
    ['Taux TVA (%)', 'Pourcentage de TVA (ex: 20)'],
    ['Date Debut *', 'Format: AAAA-MM-JJ ou JJ/MM/AAAA'],
    ['Date Fin', 'Format: AAAA-MM-JJ ou JJ/MM/AAAA'],
    ['Description', 'Description libre'],
    ['', ''],
    ['* = Champ obligatoire', ''],
    ['', 'Les conventions importees seront creees avec le statut BROUILLON.'],
    ['', 'Supprimez les lignes d\'exemple avant d\'importer.'],
  ]
  instrData.forEach((row, i) => {
    const r = instrSheet.addRow(row)
    if (i === 0) {
      r.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3b5998' } }
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'modele_import_conventions.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function ImportConventionsDialog({
  open,
  onClose,
  onSuccess,
  existingCodes,
}: ImportConventionsDialogProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; field: ImportRowDataKey } | null>(null)

  const existingSet = useMemo(() => new Set(existingCodes.map(c => c.toUpperCase())), [existingCodes])

  // ── Step 1: Parse file ──
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParseError('')
    setFileName(file.name)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)

      const sheet = workbook.worksheets[0]
      if (!sheet || sheet.rowCount < 2) {
        setParseError('Le fichier est vide ou ne contient pas de donnees.')
        return
      }

      // Read header row to map columns
      const headerRow = sheet.getRow(1)
      const headerMap = new Map<number, ImportRowDataKey>()

      headerRow.eachCell((cell, colNumber) => {
        const headerText = cellToString(cell.value).toLowerCase().replace(/[*\s()%]/g, '')
        // Fuzzy match headers to expected columns
        for (const col of EXPECTED_COLUMNS) {
          const normalizedLabel = col.label.toLowerCase().replace(/[*\s()%]/g, '')
          const normalizedKey = col.key.toLowerCase()
          if (headerText === normalizedLabel || headerText === normalizedKey || headerText.includes(normalizedLabel) || normalizedLabel.includes(headerText)) {
            headerMap.set(colNumber, col.key)
            break
          }
        }
      })

      if (headerMap.size < 2) {
        setParseError('Impossible de reconnaitre les colonnes. Utilisez le modele fourni.')
        return
      }

      // Parse data rows
      const parsed: ImportRow[] = []
      const allCodes: string[] = []

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // skip header

        const data: ImportRowData = {
          code: '', numero: '', libelle: '', objet: '',
          typeConvention: '', budget: '', tauxCommission: '',
          baseCalcul: '', tauxTva: '', dateDebut: '', dateFin: '', description: '',
        }

        headerMap.forEach((key, colNumber) => {
          const cellVal = row.getCell(colNumber).value
          if (key === 'budget' || key === 'tauxCommission' || key === 'tauxTva') {
            data[key] = cellToNumber(cellVal)
          } else if (key === 'dateDebut' || key === 'dateFin') {
            data[key] = parseExcelDate(cellVal)
          } else {
            data[key] = cellToString(cellVal)
          }
        })

        // Skip completely empty rows
        const hasData = Object.values(data).some(v => v !== '' && v !== 0)
        if (!hasData) return

        allCodes.push(data.code.trim().toUpperCase())
        parsed.push({ rowIndex: rowNumber, status: 'valid', errors: [], data, selected: true })
      })

      // Validate all rows
      const allCodesList = parsed.map(r => r.data.code.trim().toUpperCase())
      const validated = parsed.map((r, i) => {
        const errors = validateRow(r.data, existingSet, allCodesList, i)
        return { ...r, errors, status: getRowStatus(errors) }
      })

      setRows(validated)
      if (validated.length === 0) {
        setParseError('Aucune ligne de donnees trouvee dans le fichier.')
      } else {
        setActiveStep(1)
      }
    } catch {
      setParseError('Erreur lors de la lecture du fichier. Verifiez le format (xlsx).')
    }

    // Reset input so same file can be re-uploaded
    e.target.value = ''
  }, [existingSet])

  // ── Step 2: Edit cell inline ──
  const updateCell = (rowIndex: number, field: ImportRowDataKey, value: string) => {
    setRows(prev => {
      const updated = [...prev]
      const row = { ...updated[rowIndex] }
      const data = { ...row.data }

      if (field === 'budget' || field === 'tauxCommission' || field === 'tauxTva') {
        const parsed = parseFloat(value.replace(',', '.'))
        data[field] = value === '' ? '' : (isNaN(parsed) ? value : parsed)
      } else {
        data[field] = value
      }

      row.data = data
      // Re-validate
      const allCodesList = updated.map(r => r.data.code.trim().toUpperCase())
      row.errors = validateRow(data, existingSet, allCodesList, rowIndex)
      row.status = getRowStatus(row.errors)
      updated[rowIndex] = row
      return updated
    })
  }

  const removeRow = (rowIndex: number) => {
    setRows(prev => {
      const updated = prev.filter((_, i) => i !== rowIndex)
      // Re-validate all (codes may have changed)
      const allCodesList = updated.map(r => r.data.code.trim().toUpperCase())
      return updated.map((r, i) => {
        const errors = validateRow(r.data, existingSet, allCodesList, i)
        return { ...r, errors, status: getRowStatus(errors) }
      })
    })
  }

  // ── Step 3: Import ──
  const handleImport = async () => {
    const toImport = rows.filter(r => r.selected && r.status !== 'error')
    if (toImport.length === 0) return

    setImporting(true)
    setActiveStep(2)

    const result: ImportResult = { success: 0, failed: 0, errors: [] }

    for (const row of toImport) {
      try {
        const d = row.data
        const dto: CreateConventionDTO = {
          code: d.code.trim(),
          numero: d.numero.trim() || undefined,
          libelle: d.libelle.trim(),
          objet: d.objet.trim() || d.libelle.trim(),
          typeConvention: d.typeConvention ? d.typeConvention.toUpperCase() : 'CADRE',
          budget: typeof d.budget === 'number' ? d.budget : 0,
          tauxCommission: typeof d.tauxCommission === 'number' ? d.tauxCommission : 0,
          baseCalcul: d.baseCalcul || null,
          tauxTva: typeof d.tauxTva === 'number' ? d.tauxTva : 20,
          dateDebut: d.dateDebut,
          dateFin: d.dateFin || null,
          description: d.description || undefined,
        }
        await conventionsAPI.create(dto)
        result.success++
      } catch (err: unknown) {
        result.failed++
        const axiosErr = err as { response?: { data?: { message?: string } } }
        result.errors.push({
          row: row.rowIndex,
          message: axiosErr.response?.data?.message || (err instanceof Error ? err.message : 'Erreur inconnue'),
        })
      }
    }

    setImportResult(result)
    setImporting(false)

    if (result.success > 0) {
      onSuccess()
    }
  }

  // ── Reset ──
  const handleClose = () => {
    setActiveStep(0)
    setFileName('')
    setRows([])
    setParseError('')
    setImporting(false)
    setImportResult(null)
    setEditingCell(null)
    onClose()
  }

  // ── Stats ──
  const stats = {
    total: rows.length,
    valid: rows.filter(r => r.status === 'valid').length,
    warning: rows.filter(r => r.status === 'warning').length,
    error: rows.filter(r => r.status === 'error').length,
    selected: rows.filter(r => r.selected && r.status !== 'error').length,
  }

  // ── Render helpers ──
  const statusIcon = (status: RowStatus) => {
    switch (status) {
      case 'valid': return <CheckCircle sx={{ fontSize: 16, color: colors.success[500] }} />
      case 'warning': return <WarningIcon sx={{ fontSize: 16, color: colors.warning[500] }} />
      case 'error': return <ErrorIcon sx={{ fontSize: 16, color: colors.danger[500] }} />
    }
  }

  const getFieldError = (row: ImportRow, field: string): CellError | undefined =>
    row.errors.find(e => e.field === field)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { minHeight: '70vh', maxHeight: '90vh' } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CloudUpload sx={{ color: colors.primary[600] }} />
          <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold }}>
            Importer des conventions
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontSize: typography.sizes.xs } }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ── STEP 0: Upload ── */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 4 }}>
            {parseError && <Alert severity="error" sx={{ width: '100%' }}>{parseError}</Alert>}

            <Box
              sx={{
                border: `2px dashed ${colors.neutral[300]}`,
                borderRadius: borders.radius.lg,
                p: 6,
                textAlign: 'center',
                width: '100%',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: colors.primary[400] },
              }}
              component="label"
            >
              <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileChange} />
              <CloudUpload sx={{ fontSize: 48, color: colors.neutral[400], mb: 2 }} />
              <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 0.5 }}>
                {fileName || 'Glissez ou cliquez pour charger un fichier Excel'}
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Formats acceptes: .xlsx, .xls
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download sx={{ fontSize: 16 }} />}
                onClick={downloadTemplate}
                sx={{ textTransform: 'none', fontSize: typography.sizes.sm }}
              >
                Telecharger le modele
              </Button>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Utilisez ce modele pour preparer vos donnees
              </Typography>
            </Box>

            <Alert severity="info" sx={{ width: '100%', fontSize: typography.sizes.sm }}>
              Les conventions importees seront creees avec le statut <strong>BROUILLON</strong>.
              Vous pourrez les modifier et les soumettre individuellement apres l'import.
            </Alert>
          </Box>
        )}

        {/* ── STEP 1: Review & Fix ── */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            {/* Summary bar */}
            <Box sx={{
              display: 'flex', gap: 2, mb: 2, p: 1.5,
              bgcolor: colors.neutral[25], borderRadius: borders.radius.md,
              border: `1px solid ${colors.neutral[200]}`,
              flexWrap: 'wrap',
            }}>
              <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label={`${stats.valid} valides`} size="small"
                sx={{ bgcolor: colors.success[50], color: colors.success[700], fontWeight: typography.weights.semibold }} />
              <Chip icon={<WarningIcon sx={{ fontSize: 14 }} />} label={`${stats.warning} avertissements`} size="small"
                sx={{ bgcolor: colors.warning[50], color: colors.warning[700], fontWeight: typography.weights.semibold }} />
              <Chip icon={<ErrorIcon sx={{ fontSize: 14 }} />} label={`${stats.error} erreurs`} size="small"
                sx={{ bgcolor: colors.danger[50], color: colors.danger[700], fontWeight: typography.weights.semibold }} />
              <Box sx={{ flex: 1 }} />
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, alignSelf: 'center' }}>
                {stats.selected} ligne(s) a importer
              </Typography>
            </Box>

            {stats.error > 0 && (
              <Alert severity="warning" sx={{ mb: 2, fontSize: typography.sizes.sm }}>
                Les lignes en erreur ne seront pas importees. Cliquez sur une cellule pour corriger directement.
              </Alert>
            )}

            {/* Data table */}
            <TableContainer sx={{ flex: 1, overflow: 'auto', border: `1px solid ${colors.neutral[200]}`, borderRadius: borders.radius.md }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 40, bgcolor: colors.neutral[50], fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>#</TableCell>
                    <TableCell sx={{ width: 32, bgcolor: colors.neutral[50] }} />
                    {EXPECTED_COLUMNS.filter(c => ['code', 'libelle', 'typeConvention', 'budget', 'tauxCommission', 'dateDebut'].includes(c.key)).map(col => (
                      <TableCell key={col.key} sx={{
                        bgcolor: colors.neutral[50],
                        fontWeight: typography.weights.bold,
                        fontSize: typography.sizes.xs,
                        textTransform: 'uppercase',
                        color: colors.textSecondary,
                        whiteSpace: 'nowrap',
                      }}>
                        {col.label}{col.required ? ' *' : ''}
                      </TableCell>
                    ))}
                    <TableCell sx={{ width: 80, bgcolor: colors.neutral[50], fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>
                      Erreurs
                    </TableCell>
                    <TableCell sx={{ width: 40, bgcolor: colors.neutral[50] }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => {
                    const visibleFields: ImportRowDataKey[] = ['code', 'libelle', 'typeConvention', 'budget', 'tauxCommission', 'dateDebut']
                    return (
                      <TableRow
                        key={idx}
                        sx={{
                          bgcolor: row.status === 'error' ? colors.danger[25] : row.status === 'warning' ? colors.warning[25] : 'transparent',
                          opacity: row.selected ? 1 : 0.5,
                          '&:hover': { bgcolor: row.status === 'error' ? colors.danger[50] : colors.neutral[25] },
                        }}
                      >
                        <TableCell sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                          {row.rowIndex}
                        </TableCell>
                        <TableCell>{statusIcon(row.status)}</TableCell>
                        {visibleFields.map(field => {
                          const cellError = getFieldError(row, field)
                          const isEditing = editingCell?.row === idx && editingCell?.field === field
                          const value = String(row.data[field] ?? '')

                          return (
                            <TableCell
                              key={field}
                              onClick={() => setEditingCell({ row: idx, field })}
                              sx={{
                                cursor: 'pointer',
                                position: 'relative',
                                borderLeft: cellError ? `3px solid ${cellError.severity === 'error' ? colors.danger[400] : colors.warning[400]}` : undefined,
                                minWidth: field === 'libelle' ? 200 : 100,
                                maxWidth: field === 'libelle' ? 300 : 160,
                              }}
                            >
                              {isEditing ? (
                                field === 'typeConvention' ? (
                                  <Select
                                    size="small"
                                    value={value}
                                    onChange={(e) => { updateCell(idx, field, e.target.value); setEditingCell(null) }}
                                    onBlur={() => setEditingCell(null)}
                                    autoFocus
                                    fullWidth
                                    sx={{ fontSize: typography.sizes.sm }}
                                  >
                                    <MenuItem value="">-</MenuItem>
                                    {VALID_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                  </Select>
                                ) : (
                                  <TextField
                                    size="small"
                                    value={value}
                                    onChange={(e) => updateCell(idx, field, e.target.value)}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingCell(null) }}
                                    autoFocus
                                    fullWidth
                                    type={['budget', 'tauxCommission', 'tauxTva'].includes(field) ? 'number' : 'text'}
                                    sx={{ '& input': { fontSize: typography.sizes.sm, py: 0.5 } }}
                                  />
                                )
                              ) : (
                                <Tooltip title={cellError?.message || ''} arrow placement="top" disableHoverListener={!cellError}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography
                                      sx={{
                                        fontSize: typography.sizes.sm,
                                        color: cellError?.severity === 'error' ? colors.danger[700] : colors.textPrimary,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {value || <span style={{ color: colors.textDisabled }}>-</span>}
                                    </Typography>
                                    {cellError && (
                                      <Edit sx={{ fontSize: 12, color: colors.textSecondary, flexShrink: 0 }} />
                                    )}
                                  </Box>
                                </Tooltip>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell>
                          {row.errors.length > 0 && (
                            <Tooltip title={row.errors.map(e => `${e.field}: ${e.message}`).join('\n')} arrow>
                              <Chip
                                size="small"
                                label={row.errors.length}
                                sx={{
                                  height: 20,
                                  fontSize: typography.sizes['2xs'],
                                  bgcolor: row.status === 'error' ? colors.danger[100] : colors.warning[100],
                                  color: row.status === 'error' ? colors.danger[700] : colors.warning[700],
                                }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => removeRow(idx)} sx={{ color: colors.neutral[400], '&:hover': { color: colors.danger[500] } }}>
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ── STEP 2: Import results ── */}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 4 }}>
            {importing ? (
              <>
                <CircularProgress size={48} />
                <Typography sx={{ fontSize: typography.sizes.md, color: colors.textSecondary }}>
                  Import en cours...
                </Typography>
                <LinearProgress sx={{ width: '60%' }} />
              </>
            ) : importResult && (
              <>
                {importResult.success > 0 && (
                  <Alert severity="success" sx={{ width: '100%' }}>
                    <strong>{importResult.success}</strong> convention(s) importee(s) avec succes.
                  </Alert>
                )}
                {importResult.failed > 0 && (
                  <Alert severity="error" sx={{ width: '100%' }}>
                    <strong>{importResult.failed}</strong> convention(s) en echec.
                    {importResult.errors.length > 0 && (
                      <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
                        {importResult.errors.map((e, i) => (
                          <li key={i} style={{ fontSize: typography.sizes.sm }}>
                            Ligne {e.row}: {e.message}
                          </li>
                        ))}
                      </Box>
                    )}
                  </Alert>
                )}
                {importResult.success > 0 && importResult.failed === 0 && (
                  <CheckCircle sx={{ fontSize: 64, color: colors.success[500] }} />
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${colors.divider}` }}>
        {activeStep === 1 && (
          <Button
            size="small"
            startIcon={<Refresh sx={{ fontSize: 16 }} />}
            onClick={() => { setActiveStep(0); setRows([]); setFileName('') }}
            sx={{ mr: 'auto', textTransform: 'none' }}
          >
            Recharger
          </Button>
        )}

        <Button onClick={handleClose} size="small" sx={{ textTransform: 'none' }}>
          {activeStep === 2 && importResult ? 'Fermer' : 'Annuler'}
        </Button>

        {activeStep === 1 && (
          <Button
            variant="contained"
            size="small"
            onClick={handleImport}
            disabled={stats.selected === 0}
            startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
            sx={{ bgcolor: colors.primary[600], textTransform: 'none' }}
          >
            Importer {stats.selected} convention(s)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
