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
} from '@mui/material'
import { BarChart as BarChartIcon, TableChart as TableIcon } from '@mui/icons-material'
import { dimensionsAPI, imputationsAPI } from '../../lib/api'

interface Dimension {
  id: number
  code: string
  nom: string
  active: boolean
}

export default function ReportingAnalytiquePage() {
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [selectedType, setSelectedType] = useState('BUDGET')
  const [selectedDim1, setSelectedDim1] = useState('')
  const [selectedDim2, setSelectedDim2] = useState('')
  const [aggregation1D, setAggregation1D] = useState<Record<string, number>>({})
  const [aggregation2D, setAggregation2D] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'simple' | 'croise'>('simple')

  useEffect(() => {
    fetchDimensions()
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

  // Créer tableau croisé pour affichage
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>
        📊 Reporting Analytique Multi-Dimensionnel
      </Typography>

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

      {/* Résultats */}
      {viewMode === 'simple' && Object.keys(aggregation1D).length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Répartition par {getDimensionName(selectedDim1)}
                </Typography>
                <Chip label={`Total: ${formatMontant(getTotal())}`} color="primary" />
              </Stack>

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
            </Stack>
          </CardContent>
        </Card>
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
    </Box>
  )
}
