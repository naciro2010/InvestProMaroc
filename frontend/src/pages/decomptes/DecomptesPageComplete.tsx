import { useState, useEffect, useMemo } from 'react'
// import { useNavigate } from 'react-router-dom' // TODO: use when detail page navigation is ready
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material'
import { AttachMoney } from '@mui/icons-material'
import { Plus, RefreshCw, Eye, Edit2, Trash2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import api, { decomptesAPI } from '../../lib/api'
import DecimalInput from '@/components/ui/DecimalInput'
import FileUpload from '../../components/ui/FileUpload'
import { ControlPanel, StatusBadge, ExportButton } from '../../components/core'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'
import { exportToExcel, formatCurrencyForExport, formatDateForExport } from '../../lib/exportUtils'
import { useTableSort } from '@/hooks/useTableSort'

// Types
interface Decompte {
  id: number
  numero: string
  dateDecompte: string
  montant: number
  montantRetenue: number
  netAPayer: number
  observation?: string
  statut: string
  marcheId: number
}

// Styles from design system
const styles = componentStyles.listPage
const listViewStyles = componentStyles.listView

const DecomptesPage = () => {
  // const navigate = useNavigate() // TODO: use when detail page navigation is ready
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDecompte, setSelectedDecompte] = useState<Decompte | null>(null)
  const [formData, setFormData] = useState({
    numero: '',
    dateDecompte: new Date().toISOString().split('T')[0],
    montant: 0,
    montantRetenue: 0,
    netAPayer: 0,
    observation: '',
    marcheId: 0,
  })

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => {
    loadDecomptes()
  }, [])

  const loadDecomptes = async () => {
    setLoading(true)
    try {
      const response = await api.get('/decomptes/list')
      setDecomptes(response.data)
    } catch (error) {
      console.error('Erreur chargement décomptes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: decomptes.length,
      EN_ATTENTE: decomptes.filter(d => d.statut === 'EN_ATTENTE').length,
      VALIDE: decomptes.filter(d => d.statut === 'VALIDE').length,
      REJETE: decomptes.filter(d => d.statut === 'REJETE').length,
      PAYE: decomptes.filter(d => d.statut === 'PAYE').length,
    }
  }, [decomptes])

  // Filtrage
  const filteredDecomptes = useMemo(() => {
    return decomptes.filter(d => {
      if (searchTerm && !d.numero?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (statutFilter !== 'ALL' && d.statut !== statutFilter) {
        return false
      }
      return true
    })
  }, [decomptes, searchTerm, statutFilter])

  const { sortedItems: sortedDecomptes, sortConfig, requestSort } = useTableSort<Decompte>(filteredDecomptes, { key: 'numero', direction: 'asc' })

  // Pagination
  const paginatedDecomptes = useMemo(() => {
    const start = page * rowsPerPage
    return sortedDecomptes.slice(start, start + rowsPerPage)
  }, [sortedDecomptes, page, rowsPerPage])

  const handleOpenDialog = (decompte: Decompte | null = null) => {
    if (decompte) {
      setSelectedDecompte(decompte)
      setFormData({
        numero: decompte.numero,
        dateDecompte: decompte.dateDecompte,
        montant: decompte.montant,
        montantRetenue: decompte.montantRetenue,
        netAPayer: decompte.netAPayer,
        observation: decompte.observation || '',
        marcheId: decompte.marcheId,
      })
    } else {
      setSelectedDecompte(null)
      setFormData({
        numero: '',
        dateDecompte: new Date().toISOString().split('T')[0],
        montant: 0,
        montantRetenue: 0,
        netAPayer: 0,
        observation: '',
        marcheId: 0,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedDecompte(null)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
      }

      if (selectedDecompte) {
        await decomptesAPI.update(selectedDecompte.id, payload)
      } else {
        await decomptesAPI.create(payload)
      }

      handleCloseDialog()
      loadDecomptes()
    } catch (error) {
      console.error('Erreur sauvegarde décompte:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return

    try {
      await decomptesAPI.delete(id)
      loadDecomptes()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const calculateNetAPayer = () => {
    const montant = formData.montant || 0
    const retenue = formData.montantRetenue || 0
    const net = Math.round((montant - retenue) * 100) / 100
    setFormData({ ...formData, netAPayer: net })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MAD'
  }

  // Export handler
  const handleExport = () => {
    const exportData: Record<string, unknown>[] = filteredDecomptes.map(d => ({
      numero: d.numero,
      dateDecompte: d.dateDecompte,
      montant: d.montant,
      netAPayer: d.netAPayer,
      statut: d.statut,
    }))
    exportToExcel({
      filename: 'decomptes',
      sheetName: 'Décomptes',
      columns: [
        { header: 'Numéro', key: 'numero', width: 18 },
        { header: 'Date', key: 'dateDecompte', width: 16, formatter: formatDateForExport },
        { header: 'Montant Brut (MAD)', key: 'montant', width: 22, formatter: formatCurrencyForExport },
        { header: 'Net à Payer (MAD)', key: 'netAPayer', width: 22, formatter: formatCurrencyForExport },
        { header: 'Statut', key: 'statut', width: 14 },
      ],
      data: exportData,
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Control Panel */}
        <ControlPanel
          breadcrumbs={[{ label: 'Decomptes' }]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => handleOpenDialog()}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau
              </Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={loadDecomptes} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(value: string) => { setSearchTerm(value); setPage(0); }}
          searchPlaceholder="Rechercher par numero, marche..."
          paginationInfo={{
            currentStart: filteredDecomptes.length === 0 ? 0 : page * rowsPerPage + 1,
            currentEnd: Math.min((page + 1) * rowsPerPage, filteredDecomptes.length),
            total: filteredDecomptes.length,
          }}
          onPreviousPage={() => setPage((prev) => Math.max(0, prev - 1))}
          onNextPage={() => setPage((prev) => prev + 1)}
        >
          {/* Status filter chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'EN_ATTENTE', 'VALIDE', 'REJETE', 'PAYE'].map((statut) => {
              const count = statut === 'ALL' ? decomptes.length : (stats[statut as keyof typeof stats] || 0)
              const isActive = statutFilter === statut
              const listPageStyles = componentStyles.listPage
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={isActive ? listPageStyles.countBadge : listPageStyles.countBadgeInactive}>{count}</Box>
                    </Box>
                  }
                  onClick={() => { setStatutFilter(statut); setPage(0); }}
                  sx={isActive ? listPageStyles.filterPillActive : listPageStyles.filterPill}
                />
              )
            })}
          </Box>
        </ControlPanel>

        {/* Main Content Area */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          <Box sx={listViewStyles.container}>
            <TableContainer>
              <Table size="small" sx={listViewStyles.table}>
                <TableHead>
                  <TableRow sx={listViewStyles.headerRow}>
                    <TableCell sortDirection={sortConfig?.key === 'numero' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'numero'} direction={sortConfig?.key === 'numero' ? sortConfig.direction : 'asc'} onClick={() => requestSort('numero')}>Numéro</TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortConfig?.key === 'dateDecompte' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'dateDecompte'} direction={sortConfig?.key === 'dateDecompte' ? sortConfig.direction : 'asc'} onClick={() => requestSort('dateDecompte')}>Date</TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sortConfig?.key === 'montant' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'montant'} direction={sortConfig?.key === 'montant' ? sortConfig.direction : 'asc'} onClick={() => requestSort('montant')}>Montant</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Retenue</TableCell>
                    <TableCell align="right" sortDirection={sortConfig?.key === 'netAPayer' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'netAPayer'} direction={sortConfig?.key === 'netAPayer' ? sortConfig.direction : 'asc'} onClick={() => requestSort('netAPayer')}>Net à Payer</TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sortDirection={sortConfig?.key === 'statut' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'statut'} direction={sortConfig?.key === 'statut' ? sortConfig.direction : 'asc'} onClick={() => requestSort('statut')}>Statut</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDecomptes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Aucun décompte trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDecomptes.map((decompte) => (
                      <TableRow
                        key={decompte.id}
                        sx={listViewStyles.dataRow}
                        onClick={() => handleOpenDialog(decompte)}
                      >
                        <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                          {decompte.numero}
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>
                          {new Date(decompte.dateDecompte).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(decompte.montant)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: colors.textSecondary }}>
                          {formatCurrency(decompte.montantRetenue)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                          {formatCurrency(decompte.netAPayer)}
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={decompte.statut || 'EN_ATTENTE'} />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(decompte)} sx={{ color: colors.neutral[500] }}>
                              <Eye size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleOpenDialog(decompte)} sx={{ color: colors.neutral[500] }}>
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(decompte.id)} sx={{ color: colors.danger[500] }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredDecomptes.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </Box>
        </Box>

        {/* Dialog Formulaire */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
          <DialogTitle sx={componentStyles.dialog.title}>
            {selectedDecompte ? 'Modifier le Décompte' : 'Nouveau Décompte'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Numéro"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="DEC-001"
                />
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date"
                  value={formData.dateDecompte}
                  onChange={(e) => setFormData({ ...formData, dateDecompte: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <DecimalInput
                fullWidth
                required
                label="Montant"
                value={formData.montant}
                onChange={(value) => setFormData({ ...formData, montant: value })}
                onBlur={calculateNetAPayer}
                min={0}
                decimalPlaces={2}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                }}
              />

              <DecimalInput
                fullWidth
                label="Montant Retenue"
                value={formData.montantRetenue}
                onChange={(value) => setFormData({ ...formData, montantRetenue: value })}
                onBlur={calculateNetAPayer}
                min={0}
                decimalPlaces={2}
                InputProps={{
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                }}
                helperText="Retenues: garantie, pénalités, RAS..."
              />

              <TextField
                fullWidth
                label="Net à Payer"
                value={formData.netAPayer}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                }}
                sx={{ bgcolor: colors.neutral[50] }}
              />

              <DecimalInput
                fullWidth
                required
                label="Marché (ID)"
                value={formData.marcheId}
                onChange={(value) => setFormData({ ...formData, marcheId: value })}
                min={0}
                decimalPlaces={0}
                helperText="ID du marché associé"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              />

              {selectedDecompte && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Pièces jointes
                  </Typography>
                  <FileUpload
                    typeEntite="DECOMPTE"
                    entiteId={selectedDecompte.id}
                    maxFiles={10}
                    maxFileSize={10}
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} sx={componentStyles.buttonSecondary}>Annuler</Button>
            <Button onClick={handleSubmit} sx={componentStyles.buttonPrimary}>
              {selectedDecompte ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default DecomptesPage
