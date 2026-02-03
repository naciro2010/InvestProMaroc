import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  AttachMoney,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import api, { decomptesAPI } from '../../lib/api'
import FileUpload from '../../components/ui/FileUpload'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'

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

// Status Badge utilisant le design system
const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status)
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: '4px',
        bgcolor: config.bgColor,
        color: config.textColor,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
      }}
    >
      {config.label}
    </Box>
  )
}

const DecomptesPage = () => {
  const navigate = useNavigate()
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDecompte, setSelectedDecompte] = useState<Decompte | null>(null)
  const [formData, setFormData] = useState({
    numero: '',
    dateDecompte: new Date().toISOString().split('T')[0],
    montant: '',
    montantRetenue: '',
    netAPayer: '',
    observation: '',
    marcheId: '',
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

  // Pagination
  const paginatedDecomptes = useMemo(() => {
    const start = page * rowsPerPage
    return filteredDecomptes.slice(start, start + rowsPerPage)
  }, [filteredDecomptes, page, rowsPerPage])

  const handleOpenDialog = (decompte: Decompte | null = null) => {
    if (decompte) {
      setSelectedDecompte(decompte)
      setFormData({
        numero: decompte.numero,
        dateDecompte: decompte.dateDecompte,
        montant: decompte.montant.toString(),
        montantRetenue: decompte.montantRetenue.toString(),
        netAPayer: decompte.netAPayer.toString(),
        observation: decompte.observation || '',
        marcheId: decompte.marcheId.toString(),
      })
    } else {
      setSelectedDecompte(null)
      setFormData({
        numero: '',
        dateDecompte: new Date().toISOString().split('T')[0],
        montant: '',
        montantRetenue: '0',
        netAPayer: '',
        observation: '',
        marcheId: '',
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
        montant: parseFloat(formData.montant),
        montantRetenue: parseFloat(formData.montantRetenue),
        netAPayer: parseFloat(formData.netAPayer),
        marcheId: parseInt(formData.marcheId),
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
    const montant = parseFloat(formData.montant) || 0
    const retenue = parseFloat(formData.montantRetenue) || 0
    const net = montant - retenue
    setFormData({ ...formData, netAPayer: net.toFixed(2) })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MAD'
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
      <Box sx={styles.container}>
        {/* Header */}
        <Box sx={styles.header}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={styles.title}>Décomptes</Typography>
              <Typography sx={styles.subtitle}>
                Gestion des décomptes et facturations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ textTransform: 'none', fontWeight: typography.weights.semibold }}
            >
              Nouveau Décompte
            </Button>
          </Box>
        </Box>

        {/* Toolbar avec filtres */}
        <Box sx={styles.toolbar}>
          <TextField
            placeholder="Rechercher par numéro..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            size="small"
            sx={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'EN_ATTENTE', 'VALIDE', 'REJETE', 'PAYE'].map((statut) => {
              const count = statut === 'ALL' ? decomptes.length : (stats[statut as keyof typeof stats] || 0)
              const isActive = statutFilter === statut
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={styles.countBadge}>{count}</Box>
                    </Box>
                  }
                  onClick={() => { setStatutFilter(statut); setPage(0); }}
                  sx={isActive ? styles.filterPillActive : styles.filterPill}
                />
              )
            })}
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={styles.tableContainer}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={styles.tableHeader}>
                    <TableCell>Numéro</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="right">Retenue</TableCell>
                    <TableCell align="right">Net à Payer</TableCell>
                    <TableCell align="center">Statut</TableCell>
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
                        sx={styles.tableRowClickable}
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
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(decompte)}
                              sx={{ color: colors.neutral[500] }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(decompte)}
                              sx={{ color: colors.neutral[500] }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(decompte.id)}
                              sx={{ color: colors.danger[500] }}
                            >
                              <Delete fontSize="small" />
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
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
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

              <TextField
                fullWidth
                required
                type="number"
                label="Montant"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                onBlur={calculateNetAPayer}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  inputProps: { step: '0.01', min: '0' }
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Montant Retenue"
                value={formData.montantRetenue}
                onChange={(e) => setFormData({ ...formData, montantRetenue: e.target.value })}
                onBlur={calculateNetAPayer}
                InputProps={{
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  inputProps: { step: '0.01', min: '0' }
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

              <TextField
                fullWidth
                type="number"
                required
                label="Marché (ID)"
                value={formData.marcheId}
                onChange={(e) => setFormData({ ...formData, marcheId: e.target.value })}
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
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {selectedDecompte ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default DecomptesPage
