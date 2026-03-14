import { useState, useEffect } from 'react'
import {
  Box, Button, Card, CardContent, IconButton, Stack, Typography, TextField,
  Menu, List, ListItem, ListItemText, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { Download as DownloadIcon, Save as SaveIcon, Bookmark as BookmarkIcon, Delete as DeleteIcon } from '@mui/icons-material'
import * as ExcelJS from 'exceljs'
import { dimensionsAPI, imputationsAPI } from '@/lib/api'
import { ReportingFilterPanel, ReportingChartSection, ReportingCrossTable, type Aggregation2DItem } from './components'

interface Dimension {
  id: number
  code: string
  nom: string
  active: boolean
}

interface SavedView {
  id: string
  name: string
  type: string
  dim1: string
  dim2?: string
  mode: 'simple' | 'croise'
  dateDebut?: string
  dateFin?: string
}

const formatMontant = (montant: number) => {
  if (montant >= 1000000) return `${(montant / 1000000).toFixed(2)} M MAD`
  if (montant >= 1000) return `${(montant / 1000).toFixed(0)} K MAD`
  return `${montant.toFixed(2)} MAD`
}

export default function ReportingAnalytiquePage() {
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [selectedType, setSelectedType] = useState('BUDGET')
  const [selectedDim1, setSelectedDim1] = useState('')
  const [selectedDim2, setSelectedDim2] = useState('')
  const [aggregation1D, setAggregation1D] = useState<Record<string, number>>({})
  const [aggregation2D, setAggregation2D] = useState<Aggregation2DItem[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'simple' | 'croise'>('simple')
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'table'>('bar')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [viewName, setViewName] = useState('')

  useEffect(() => {
    dimensionsAPI.getActives()
      .then(({ data }) => {
        setDimensions(data)
        if (data.length > 0) setSelectedDim1(data[0].code)
        if (data.length > 1) setSelectedDim2(data[1].code)
      })
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error('Erreur chargement dimensions:', msg)
      })
    const stored = localStorage.getItem('reporting_saved_views')
    if (stored) setSavedViews(JSON.parse(stored))
  }, [])

  const getDimensionName = (code: string) => dimensions.find((d) => d.code === code)?.nom || code

  const getTotal = () => {
    if (viewMode === 'simple') return Object.values(aggregation1D).reduce((sum, val) => sum + val, 0)
    return aggregation2D.reduce((sum, row) => sum + (typeof row.montant === 'number' ? row.montant : parseFloat(row.montant)), 0)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      if (viewMode === 'simple') {
        const { data } = await imputationsAPI.aggregateByDimension({ type: selectedType, dimension: selectedDim1 })
        setAggregation1D(data)
      } else {
        const { data } = await imputationsAPI.aggregateByTwoDimensions({ type: selectedType, dimension1: selectedDim1, dimension2: selectedDim2 })
        setAggregation2D(data.data || [])
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur agrégation:', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveView = () => {
    const newView: SavedView = {
      id: Date.now().toString(), name: viewName, type: selectedType, dim1: selectedDim1,
      dim2: viewMode === 'croise' ? selectedDim2 : undefined, mode: viewMode,
      dateDebut: dateDebut || undefined, dateFin: dateFin || undefined,
    }
    const updated = [...savedViews, newView]
    setSavedViews(updated)
    localStorage.setItem('reporting_saved_views', JSON.stringify(updated))
    setSaveDialogOpen(false)
    setViewName('')
  }

  const handleLoadView = (view: SavedView) => {
    setSelectedType(view.type)
    setSelectedDim1(view.dim1)
    if (view.dim2) setSelectedDim2(view.dim2)
    setViewMode(view.mode)
    if (view.dateDebut) setDateDebut(view.dateDebut)
    if (view.dateFin) setDateFin(view.dateFin)
    setAnchorEl(null)
    setTimeout(handleAnalyze, 100)
  }

  const handleDeleteView = (id: string) => {
    const updated = savedViews.filter((v) => v.id !== id)
    setSavedViews(updated)
    localStorage.setItem('reporting_saved_views', JSON.stringify(updated))
  }

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Reporting')

    if (viewMode === 'simple') {
      const data = Object.entries(aggregation1D).map(([valeur, montant]) => ({
        dimension: valeur, montant, pourcentage: ((montant / getTotal()) * 100).toFixed(2) + '%',
      }))
      data.push({ dimension: 'TOTAL', montant: getTotal(), pourcentage: '100%' })
      worksheet.columns = [
        { header: getDimensionName(selectedDim1), key: 'dimension' },
        { header: 'Montant (MAD)', key: 'montant' },
        { header: '% du Total', key: 'pourcentage' },
      ]
      data.forEach(row => worksheet.addRow(row))
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(data.length).font = { bold: true }
      worksheet.getRow(data.length).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } }
    } else {
      exportCrossTableExcel(worksheet)
    }

    const fileName = viewMode === 'simple'
      ? `reporting_${selectedType}_${selectedDim1}_${Date.now()}.xlsx`
      : `reporting_croise_${selectedDim1}_${selectedDim2}_${Date.now()}.xlsx`
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  }

  const exportCrossTableExcel = (worksheet: ExcelJS.Worksheet) => {
    const { rows, cols, data } = buildCrossTableData()
    const headers = [getDimensionName(selectedDim1), ...cols, 'Total']
    worksheet.columns = headers.map(header => ({ header, key: header }))
    rows.forEach(row => {
      const rowData: Record<string, string | number> = { [getDimensionName(selectedDim1)]: row }
      cols.forEach(col => { rowData[col] = data[row][col] || 0 })
      rowData['Total'] = Object.values(data[row]).reduce((sum: number, val) => sum + (val as number), 0)
      worksheet.addRow(rowData)
    })
    const totalRow: Record<string, string | number> = { [getDimensionName(selectedDim1)]: 'Total' }
    cols.forEach(col => { totalRow[col] = rows.reduce((sum, row) => sum + (data[row][col] || 0), 0) })
    totalRow['Total'] = getTotal()
    worksheet.addRow(totalRow)
    worksheet.getRow(1).font = { bold: true }
    const lastRow = worksheet.lastRow
    if (lastRow) {
      lastRow.font = { bold: true }
      lastRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } }
    }
  }

  const buildCrossTableData = () => {
    const rows = new Set<string>()
    const cols = new Set<string>()
    const data: Record<string, Record<string, number>> = {}
    aggregation2D.forEach((item) => {
      rows.add(item.dimension1)
      cols.add(item.dimension2)
      if (!data[item.dimension1]) data[item.dimension1] = {}
      data[item.dimension1][item.dimension2] = typeof item.montant === 'number' ? item.montant : parseFloat(item.montant)
    })
    return { rows: Array.from(rows), cols: Array.from(cols), data }
  }

  const hasSimpleData = viewMode === 'simple' && Object.keys(aggregation1D).length > 0
  const hasCrossData = viewMode === 'croise' && aggregation2D.length > 0
  const noData = !loading && !hasSimpleData && !hasCrossData

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reporting Analytique Multi-Dimensionnel</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={(e) => setAnchorEl(e.currentTarget)} disabled={savedViews.length === 0}>
            <BookmarkIcon />
          </IconButton>
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => setSaveDialogOpen(true)} disabled={!selectedDim1}>
            Sauvegarder Vue
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportExcel} disabled={!hasSimpleData && !hasCrossData}>
            Export Excel
          </Button>
        </Stack>
      </Stack>

      <ReportingFilterPanel dimensions={dimensions} selectedType={selectedType} onTypeChange={setSelectedType}
        viewMode={viewMode} onViewModeChange={setViewMode} selectedDim1={selectedDim1} onDim1Change={setSelectedDim1}
        selectedDim2={selectedDim2} onDim2Change={setSelectedDim2} dateDebut={dateDebut} onDateDebutChange={setDateDebut}
        dateFin={dateFin} onDateFinChange={setDateFin} loading={loading} onAnalyze={handleAnalyze} />

      {hasSimpleData && (
        <ReportingChartSection dimensionName={getDimensionName(selectedDim1)} aggregation1D={aggregation1D}
          chartType={chartType} onChartTypeChange={setChartType} formatMontant={formatMontant} />
      )}

      {hasCrossData && (
        <ReportingCrossTable dim1Name={getDimensionName(selectedDim1)} dim2Name={getDimensionName(selectedDim2)}
          aggregation2D={aggregation2D} formatMontant={formatMontant} />
      )}

      {noData && (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center" py={4}>
              Aucune donnée à afficher. Cliquez sur "Analyser" pour générer le rapport.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <List sx={{ minWidth: 300 }}>
          {savedViews.map((view) => (
            <ListItem key={view.id} disablePadding
              secondaryAction={<IconButton edge="end" onClick={() => handleDeleteView(view.id)} size="small"><DeleteIcon fontSize="small" /></IconButton>}>
              <ListItemButton onClick={() => handleLoadView(view)}>
                <ListItemText primary={view.name} secondary={`${view.type} - ${view.dim1}${view.dim2 ? ' × ' + view.dim2 : ''}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Menu>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Sauvegarder Vue Favorite</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Nom de la vue" fullWidth value={viewName}
            onChange={(e) => setViewName(e.target.value)} placeholder="Ex: Analyse Budget par Région Q1 2024" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSaveView} variant="contained" disabled={!viewName.trim()}>Sauvegarder</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
