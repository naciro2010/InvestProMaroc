import { useState, useEffect, useMemo } from 'react'
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
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  Delete,
  AttachMoney,
} from '@mui/icons-material'
import { CreditCard } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { paiementsAPI } from '../../lib/api'
import FileUpload from '../../components/ui/FileUpload'
import StatusBadge from '../../components/core/StatusBadge'
import { colors, typography, componentStyles, getStatusConfig, borders } from '../../lib/designSystem'

// Types
interface Paiement {
  id: number
  numeroPaiement: string
  datePaiement: string
  montant: number
  modeReglement: string
  referenceBancaire?: string
  beneficiaire?: string
  observation?: string
  statut?: string
  ordrePaiementId?: number
}

interface PaiementFormData {
  numeroPaiement: string
  datePaiement: string
  montant: string
  modeReglement: string
  referenceBancaire: string
  beneficiaire: string
  observation: string
  ordrePaiementId: string
}

const styles = componentStyles.listPage

const modeReglementLabels: Record<string, string> = {
  'VIREMENT': 'Virement',
  'CHEQUE': 'Cheque',
  'ESPECES': 'Especes',
  'CARTE': 'Carte Bancaire',
  'PRELEVEMENT': 'Prelevement',
}

const PaiementsPage = () => {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [formData, setFormData] = useState<PaiementFormData>({
    numeroPaiement: '',
    datePaiement: new Date().toISOString().split('T')[0],
    montant: '',
    modeReglement: 'VIREMENT',
    referenceBancaire: '',
    beneficiaire: '',
    observation: '',
    ordrePaiementId: '',
  })

  useEffect(() => {
    loadPaiements()
  }, [])

  const loadPaiements = async () => {
    setLoading(true)
    try {
      const { data } = await paiementsAPI.getAll()
      setPaiements(data.data || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total: paiements.length,
    EN_ATTENTE: paiements.filter(p => p.statut === 'EN_ATTENTE').length,
    EFFECTUE: paiements.filter(p => p.statut === 'EFFECTUE').length,
    ANNULE: paiements.filter(p => p.statut === 'ANNULE').length,
  }), [paiements])

  const filteredPaiements = useMemo(() => {
    return paiements.filter(p => {
      if (searchTerm && !p.numeroPaiement?.toLowerCase().includes(searchTerm.toLowerCase())
        && !p.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (statutFilter !== 'ALL' && p.statut !== statutFilter) return false
      return true
    })
  }, [paiements, searchTerm, statutFilter])

  const paginatedPaiements = useMemo(() => {
    const start = page * rowsPerPage
    return filteredPaiements.slice(start, start + rowsPerPage)
  }, [filteredPaiements, page, rowsPerPage])

  const handleOpenDialog = (paiement: Paiement | null = null) => {
    if (paiement) {
      setSelectedPaiement(paiement)
      setFormData({
        numeroPaiement: paiement.numeroPaiement,
        datePaiement: paiement.datePaiement,
        montant: paiement.montant.toString(),
        modeReglement: paiement.modeReglement || 'VIREMENT',
        referenceBancaire: paiement.referenceBancaire || '',
        beneficiaire: paiement.beneficiaire || '',
        observation: paiement.observation || '',
        ordrePaiementId: paiement.ordrePaiementId?.toString() || '',
      })
    } else {
      setSelectedPaiement(null)
      setFormData({
        numeroPaiement: '',
        datePaiement: new Date().toISOString().split('T')[0],
        montant: '',
        modeReglement: 'VIREMENT',
        referenceBancaire: '',
        beneficiaire: '',
        observation: '',
        ordrePaiementId: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedPaiement(null)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        montant: parseFloat(formData.montant),
        ordrePaiementId: parseInt(formData.ordrePaiementId),
      }
      if (selectedPaiement) {
        await paiementsAPI.update(selectedPaiement.id, payload)
      } else {
        await paiementsAPI.create(payload)
      }
      handleCloseDialog()
      loadPaiements()
    } catch {
      // silently handle
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return
    try {
      await paiementsAPI.delete(id)
      loadPaiements()
    } catch {
      // silently handle
    }
  }

  const formatCurrency = (amount: number): string => {
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
              <Typography sx={styles.title}>Paiements</Typography>
              <Typography sx={styles.subtitle}>
                Gestion des paiements et reglements
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={componentStyles.buttonPrimary}
            >
              Nouveau Paiement
            </Button>
          </Box>
        </Box>

        {/* Toolbar */}
        <Box sx={styles.toolbar}>
          <TextField
            placeholder="Rechercher par numero ou beneficiaire..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
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
            {['ALL', 'EN_ATTENTE', 'EFFECTUE', 'ANNULE'].map((statut) => {
              const count = statut === 'ALL' ? paiements.length : (stats[statut as keyof typeof stats] || 0)
              const isActive = statutFilter === statut
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>
                        {count}
                      </Box>
                    </Box>
                  }
                  onClick={() => { setStatutFilter(statut); setPage(0) }}
                  sx={isActive ? styles.filterPillActive : styles.filterPill}
                />
              )
            })}
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
          <Box sx={styles.tableContainer}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={styles.tableHeader}>
                    <TableCell>Numero</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Beneficiaire</TableCell>
                    <TableCell>Mode Reglement</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPaiements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box>
                          <CreditCard size={40} color={colors.textDisabled} style={{ marginBottom: 12 }} />
                          <Typography sx={{ color: colors.textSecondary, fontWeight: typography.weights.medium }}>
                            Aucun paiement trouve
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPaiements.map((paiement) => (
                      <TableRow
                        key={paiement.id}
                        sx={styles.tableRowClickable}
                        onClick={() => handleOpenDialog(paiement)}
                      >
                        <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                          {paiement.numeroPaiement}
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>
                          {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{paiement.beneficiaire || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: borders.radius.full,
                            bgcolor: colors.neutral[100],
                            fontSize: typography.sizes.xs,
                            fontWeight: typography.weights.medium,
                            color: colors.textSecondary,
                          }}>
                            <CreditCard size={12} />
                            {modeReglementLabels[paiement.modeReglement] || paiement.modeReglement}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                          {formatCurrency(paiement.montant)}
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={paiement.statut || 'EN_ATTENTE'} size="small" />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(paiement)} sx={{ color: colors.neutral[500] }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(paiement.id)} sx={{ color: colors.danger[500] }}>
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
              count={filteredPaiements.length}
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

        {/* Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: componentStyles.dialog.paper }}
        >
          <DialogTitle sx={componentStyles.dialog.title}>
            {selectedPaiement ? 'Modifier le Paiement' : 'Nouveau Paiement'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Numero Paiement"
                  value={formData.numeroPaiement}
                  onChange={(e) => setFormData({ ...formData, numeroPaiement: e.target.value })}
                  placeholder="PAI-001"
                />
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date de Paiement"
                  value={formData.datePaiement}
                  onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Montant"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                    inputProps: { step: '0.01', min: '0' }
                  }}
                />
                <TextField
                  fullWidth
                  required
                  select
                  label="Mode de Reglement"
                  value={formData.modeReglement}
                  onChange={(e) => setFormData({ ...formData, modeReglement: e.target.value })}
                >
                  <MenuItem value="VIREMENT">Virement</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="ESPECES">Especes</MenuItem>
                  <MenuItem value="CARTE">Carte Bancaire</MenuItem>
                  <MenuItem value="PRELEVEMENT">Prelevement</MenuItem>
                </TextField>
              </Stack>

              <TextField
                fullWidth
                required
                label="Beneficiaire"
                value={formData.beneficiaire}
                onChange={(e) => setFormData({ ...formData, beneficiaire: e.target.value })}
              />

              <TextField
                fullWidth
                label="Reference Bancaire"
                value={formData.referenceBancaire}
                onChange={(e) => setFormData({ ...formData, referenceBancaire: e.target.value })}
              />

              <TextField
                fullWidth
                type="number"
                required
                label="Ordre de Paiement (ID)"
                value={formData.ordrePaiementId}
                onChange={(e) => setFormData({ ...formData, ordrePaiementId: e.target.value })}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              />

              {selectedPaiement && (
                <Box>
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1 }}>
                    Pieces jointes
                  </Typography>
                  <FileUpload typeEntite="PAIEMENT" entiteId={selectedPaiement.id} maxFiles={10} maxFileSize={10} />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} sx={componentStyles.buttonSecondary}>Annuler</Button>
            <Button onClick={handleSubmit} sx={componentStyles.buttonPrimary}>
              {selectedPaiement ? 'Modifier' : 'Creer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default PaiementsPage
