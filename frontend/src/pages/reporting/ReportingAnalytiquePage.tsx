import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  IconButton,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  TableChart as TableIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon,
  PieChart as PieChartIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import * as XLSX from 'xlsx'
import { dimensionsAPI, imputationsAPI } from '../../lib/api'

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D']

export default function ReportingAnalytiquePage() {
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [selectedType, setSelectedType] = useState('BUDGET')
  const [selectedDim1, setSelectedDim1] = useState('')
  const [selectedDim2, setSelectedDim2] = useState('')
  const [aggregation1D, setAggregation1D] = useState<Record<string, number>>({})
  const [aggregation2D, setAggregation2D] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'simple' | 'croise'>('simple')
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'table'>('bar')

  // Filtres par date
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  // Vues sauvegardées
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [viewName, setViewName] = useState('')

  useEffect(() => {
    fetchDimensions()
    loadSavedViews()
  }, [])

  const fetchDimensions = async () => {
    try {
      const { data } = await dimensionsAPI.getActives()
      setDimensions(data)
      if (data.length > 0) {
        setSelectedDim1(data[0].code)
        if (data.length > 1) {
          setSelectedDim2(data[1].code)
        }
      }
    } catch (error) {
      console.error('Erreur chargement dimensions:', error)
    }
  }

  const loadSavedViews = () => {
    const stored = localStorage.getItem('reporting_saved_views')
    if (stored) {
      setSavedViews(JSON.parse(stored))
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      if (viewMode === 'simple') {
        const { data } = await imputationsAPI.aggregateByDimension({
          type: selectedType,
          dimension: selectedDim1,
        })
        setAggregation1D(data)
      } else {
        const { data } = await imputationsAPI.aggregateByTwoDimensions({
          type: selectedType,
          dimension1: selectedDim1,
          dimension2: selectedDim2,
        })
        setAggregation2D(data.data || [])
      }
    } catch (error) {
      console.error('Erreur agrégation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveView = () => {
    const newView: SavedView = {
      id: Date.now().toString(),
      name: viewName,
      type: selectedType,
      dim1: selectedDim1,
      dim2: viewMode === 'croise' ? selectedDim2 : undefined,
      mode: viewMode,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined,
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
    // Auto-analyze après chargement
    setTimeout(handleAnalyze, 100)
  }

  const handleDeleteView = (id: string) => {
    const updated = savedViews.filter((v) => v.id !== id)
    setSavedViews(updated)
    localStorage.setItem('reporting_saved_views', JSON.stringify(updated))
  }

  const handleExportExcel = () => {
    if (viewMode === 'simple') {
      // Export 1D
      const data = Object.entries(aggregation1D).map(([valeur, montant]) => ({
        [getDimensionName(selectedDim1)]: valeur,
        'Montant (MAD)': montant,
        '% du Total': ((montant / getTotal()) * 100).toFixed(2) + '%',
      }))
      data.push({
        [getDimensionName(selectedDim1)]: 'TOTAL',
        'Montant (MAD)': getTotal(),
        '% du Total': '100%',
      })

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Reporting')
      XLSX.writeFile(wb, `reporting_${selectedType}_${selectedDim1}_${Date.now()}.xlsx`)
    } else {
      // Export 2D (tableau croisé)
      const { rows, cols, data } = createCrossTable()
      const excelData = rows.map((row) => {
        const rowData: any = { [getDimensionName(selectedDim1)]: row }
        cols.forEach((col) => {
          rowData[col] = data[row][col] || 0
        })
        const rowTotal = Object.values(data[row]).reduce((sum: number, val) => sum + (val as number), 0)
        rowData['Total'] = rowTotal
        return rowData
      })

      // Ligne totaux
      const totalRow: any = { [getDimensionName(selectedDim1)]: 'Total' }
      cols.forEach((col) => {
        const colTotal = rows.reduce((sum, row) => sum + (data[row][col] || 0), 0)
        totalRow[col] = colTotal
      })
      totalRow['Total'] = getTotal()
      excelData.push(totalRow)

      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Tableau Croisé')
      XLSX.writeFile(wb, `reporting_croise_${selectedDim1}_${selectedDim2}_${Date.now()}.xlsx`)
    }
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(2)} M MAD`
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)} K MAD`
    }
    return `${montant.toFixed(2)} MAD`
  }

  const getDimensionName = (code: string) => {
    return dimensions.find((d) => d.code === code)?.nom || code
  }

  const getTotal = () => {
    if (viewMode === 'simple') {
      return Object.values(aggregation1D).reduce((sum, val) => sum + val, 0)
    } else {
      return aggregation2D.reduce((sum, row) => sum + parseFloat(row.montant), 0)
    }
  }

  const createCrossTable = () => {
    const rows = new Set<string>()
    const cols = new Set<string>()
    const data: Record<string, Record<string, number>> = {}

    aggregation2D.forEach((item) => {
      rows.add(item.dimension1)
      cols.add(item.dimension2)
      if (!data[item.dimension1]) {
        data[item.dimension1] = {}
      }
      data[item.dimension1][item.dimension2] = parseFloat(item.montant)
    })

    return { rows: Array.from(rows), cols: Array.from(cols), data }
  }

  // Données pour graphiques
  const getChartData = () => {
    if (viewMode === 'simple') {
      return Object.entries(aggregation1D)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({
          name,
          value,
          valueFormatted: formatMontant(value),
        }))
    }
    return []
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">📊 Reporting Analytique Multi-Dimensionnel</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            disabled={savedViews.length === 0}
          >
            <BookmarkIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={!selectedDim1}
          >
            Sauvegarder Vue
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={
              (viewMode === 'simple' && Object.keys(aggregation1D).length === 0) ||
              (viewMode === 'croise' && aggregation2D.length === 0)
            }
          >
            Export Excel
          </Button>
        </Stack>
      </Stack>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Configuration de l'Analyse</Typography>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Type de Données</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Type de Données"
                >
                  <MenuItem value="BUDGET">Budget</MenuItem>
                  <MenuItem value="DECOMPTE">Décompte</MenuItem>
                  <MenuItem value="PAIEMENT">Paiement</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Mode d'Analyse</InputLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'simple' | 'croise')}
                  label="Mode d'Analyse"
                >
                  <MenuItem value="simple">Simple (1 dimension)</MenuItem>
                  <MenuItem value="croise">Croisé (2 dimensions)</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Dimension 1</InputLabel>
                <Select
                  value={selectedDim1}
                  onChange={(e) => setSelectedDim1(e.target.value)}
                  label="Dimension 1"
                >
                  {dimensions.map((dim) => (
                    <MenuItem key={dim.code} value={dim.code}>
                      {dim.nom} ({dim.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {viewMode === 'croise' && (
                <FormControl fullWidth>
                  <InputLabel>Dimension 2</InputLabel>
                  <Select
                    value={selectedDim2}
                    onChange={(e) => setSelectedDim2(e.target.value)}
                    label="Dimension 2"
                  >
                    {dimensions
                      .filter((d) => d.code !== selectedDim1)
                      .map((dim) => (
                        <MenuItem key={dim.code} value={dim.code}>
                          {dim.nom} ({dim.code})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Stack>

            {/* Filtres par Date */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Date Début"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                helperText="Optionnel - Filtre par période"
              />
              <TextField
                label="Date Fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                helperText="Optionnel - Filtre par période"
              />
            </Stack>

            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading || !selectedDim1}
              startIcon={viewMode === 'simple' ? <BarChartIcon /> : <TableIcon />}
            >
              {loading ? 'Analyse en cours...' : 'Analyser'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Résultats Mode Simple */}
      {viewMode === 'simple' && Object.keys(aggregation1D).length > 0 && (
        <Stack spacing={2}>
          {/* Sélecteur Type de Vue */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Répartition par {getDimensionName(selectedDim1)}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label={`Total: ${formatMontant(getTotal())}`} color="primary" />
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={(_, val) => val && setChartType(val)}
                    size="small"
                  >
                    <ToggleButton value="bar">
                      <BarChartIcon />
                    </ToggleButton>
                    <ToggleButton value="pie">
                      <PieChartIcon />
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Graphique à Barres */}
          {chartType === 'bar' && (
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => formatMontant(value || 0)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#1976d2" name="Montant (MAD)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Graphique Camembert */}
          {chartType === 'pie' && (
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={getChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getChartData().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatMontant(value || 0)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tableau */}
          {chartType === 'table' && (
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>{getDimensionName(selectedDim1)}</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Montant</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>% du Total</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(aggregation1D)
                        .sort(([, a], [, b]) => b - a)
                        .map(([valeur, montant]) => {
                          const pourcentage = (montant / getTotal()) * 100
                          return (
                            <TableRow key={valeur}>
                              <TableCell>{valeur}</TableCell>
                              <TableCell align="right">{formatMontant(montant)}</TableCell>
                              <TableCell align="right">
                                <Chip label={`${pourcentage.toFixed(1)}%`} size="small" />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          <strong>TOTAL</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatMontant(getTotal())}</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>100%</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* Tableau Croisé */}
      {viewMode === 'croise' && aggregation2D.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Tableau Croisé: {getDimensionName(selectedDim1)} × {getDimensionName(selectedDim2)}
                </Typography>
                <Chip label={`Total: ${formatMontant(getTotal())}`} color="primary" />
              </Stack>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'action.hover' }}>
                        <strong>
                          {getDimensionName(selectedDim1)} \ {getDimensionName(selectedDim2)}
                        </strong>
                      </TableCell>
                      {createCrossTable().cols.map((col) => (
                        <TableCell key={col} align="right" sx={{ bgcolor: 'action.hover' }}>
                          <strong>{col}</strong>
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <strong>Total</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {createCrossTable().rows.map((row) => {
                      const rowData = createCrossTable().data[row]
                      const rowTotal = Object.values(rowData).reduce((sum, val) => sum + val, 0)
                      return (
                        <TableRow key={row}>
                          <TableCell sx={{ bgcolor: 'action.hover' }}>
                            <strong>{row}</strong>
                          </TableCell>
                          {createCrossTable().cols.map((col) => (
                            <TableCell key={col} align="right">
                              {rowData[col] ? formatMontant(rowData[col]) : '-'}
                            </TableCell>
                          ))}
                          <TableCell align="right" sx={{ bgcolor: 'action.hover' }}>
                            <strong>{formatMontant(rowTotal)}</strong>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white' }}>
                        <strong>Total</strong>
                      </TableCell>
                      {createCrossTable().cols.map((col) => {
                        const colTotal = createCrossTable().rows.reduce((sum, row) => {
                          return sum + (createCrossTable().data[row][col] || 0)
                        }, 0)
                        return (
                          <TableCell key={col} align="right" sx={{ color: 'white' }}>
                            <strong>{formatMontant(colTotal)}</strong>
                          </TableCell>
                        )
                      })}
                      <TableCell align="right" sx={{ color: 'white' }}>
                        <strong>{formatMontant(getTotal())}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Message si pas de données */}
      {!loading &&
        ((viewMode === 'simple' && Object.keys(aggregation1D).length === 0) ||
          (viewMode === 'croise' && aggregation2D.length === 0)) && (
          <Card>
            <CardContent>
              <Typography color="text.secondary" align="center" py={4}>
                Aucune donnée à afficher. Cliquez sur "Analyser" pour générer le rapport.
              </Typography>
            </CardContent>
          </Card>
        )}

      {/* Menu Vues Sauvegardées */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <List sx={{ minWidth: 300 }}>
          {savedViews.map((view) => (
            <ListItem
              key={view.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDeleteView(view.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton onClick={() => handleLoadView(view)}>
                <ListItemText
                  primary={view.name}
                  secondary={`${view.type} - ${view.dim1}${view.dim2 ? ' × ' + view.dim2 : ''}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Menu>

      {/* Dialog Sauvegarder Vue */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Sauvegarder Vue Favorite</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la vue"
            fullWidth
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="Ex: Analyse Budget par Région Q1 2024"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSaveView} variant="contained" disabled={!viewName.trim()}>
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
