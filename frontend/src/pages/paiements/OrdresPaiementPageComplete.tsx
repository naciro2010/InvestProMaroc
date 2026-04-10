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
  Chip,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Plus, RefreshCw, Eye, Edit2, Trash2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, StatusBadge, ExportButton } from '@/components/core'
import ConfirmDialog from '@/components/core/ConfirmDialog'
import { ordresPaiementAPI } from '@/lib/api'
import FileUpload from '@/components/ui/FileUpload'
import DecimalInput from '@/components/ui/DecimalInput'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { AttachMoney } from '@mui/icons-material'
import { formatCurrency } from '@/lib/utils'

interface OrdrePaiementItem {
  id: number
  numeroOrdre: string
  dateEmission: string
  dateExecution?: string
  montant: number
  beneficiaire?: string
  compteBancaire?: string
  reference?: string
  observation?: string
  decompteId: number
  statut?: string
}

const styles = componentStyles.listPage
const listStyles = componentStyles.listView

const OrdresPaiementPage = () => {
  const { showToast } = useToast()
  const [ordres, setOrdres] = useState<OrdrePaiementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrdre, setSelectedOrdre] = useState<OrdrePaiementItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [formData, setFormData] = useState({
    numeroOrdre: '',
    dateEmission: new Date().toISOString().split('T')[0],
    dateExecution: '',
    montant: 0,
    beneficiaire: '',
    compteBancaire: '',
    reference: '',
    observation: '',
    decompteId: 0,
  })

  useEffect(() => { loadOrdres() }, [])

  const loadOrdres = async () => {
    setLoading(true)
    try {
      const { data } = await ordresPaiementAPI.getAll()
      setOrdres(data.data || [])
    } catch {
      showToast('Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total: ordres.length,
    EN_ATTENTE: ordres.filter(o => o.statut === 'EN_ATTENTE').length,
    EXECUTE: ordres.filter(o => o.statut === 'EXECUTE').length,
    ANNULE: ordres.filter(o => o.statut === 'ANNULE').length,
  }), [ordres])

  const filteredOrdres = useMemo(() => {
    return ordres.filter(o => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        if (!(
          o.numeroOrdre?.toLowerCase().includes(q) ||
          o.beneficiaire?.toLowerCase().includes(q)
        )) return false
      }
      if (statutFilter !== 'ALL' && o.statut !== statutFilter) return false
      return true
    })
  }, [ordres, searchTerm, statutFilter])

  const paginatedOrdres = useMemo(() => {
    const start = page * rowsPerPage
    return filteredOrdres.slice(start, start + rowsPerPage)
  }, [filteredOrdres, page, rowsPerPage])

  const handleOpenDialog = (ordre: OrdrePaiementItem | null = null) => {
    if (ordre) {
      setSelectedOrdre(ordre)
      setFormData({
        numeroOrdre: ordre.numeroOrdre,
        dateEmission: ordre.dateEmission,
        dateExecution: ordre.dateExecution || '',
        montant: ordre.montant,
        beneficiaire: ordre.beneficiaire || '',
        compteBancaire: ordre.compteBancaire || '',
        reference: ordre.reference || '',
        observation: ordre.observation || '',
        decompteId: ordre.decompteId,
      })
    } else {
      setSelectedOrdre(null)
      setFormData({
        numeroOrdre: '',
        dateEmission: new Date().toISOString().split('T')[0],
        dateExecution: '',
        montant: 0,
        beneficiaire: '',
        compteBancaire: '',
        reference: '',
        observation: '',
        decompteId: 0,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setSelectedOrdre(null) }

  const handleSubmit = async () => {
    try {
      if (selectedOrdre) {
        await ordresPaiementAPI.update(selectedOrdre.id, formData)
        showToast('Ordre modifie avec succes', 'success')
      } else {
        await ordresPaiementAPI.create(formData)
        showToast('Ordre cree avec succes', 'success')
      }
      handleCloseDialog()
      loadOrdres()
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      await ordresPaiementAPI.delete(deleteConfirm.id)
      showToast('Ordre supprime', 'success')
      loadOrdres()
    } catch {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
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

  const pStart = filteredOrdres.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredOrdres.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Ordres de paiement' }]}
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
              <ExportButton onClick={() => { /* TODO */ }} />
              <IconButton size="small" onClick={loadOrdres} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setPage(0) }}
          searchPlaceholder="Rechercher par numero, beneficiaire..."
          paginationInfo={filteredOrdres.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredOrdres.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          {(['ALL', 'EN_ATTENTE', 'EXECUTE', 'ANNULE'] as const).map((statut) => {
            const count = statut === 'ALL' ? ordres.length : (stats[statut as keyof typeof stats] || 0)
            const isActive = statutFilter === statut
            return (
              <Chip
                key={statut}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                    <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
                  </Box>
                }
                onClick={() => { setStatutFilter(statut); setPage(0) }}
                sx={isActive ? styles.filterPillActive : styles.filterPill}
              />
            )
          })}
        </ControlPanel>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={listStyles.container}>
            <TableContainer>
              <Table size="small" sx={listStyles.table}>
                <TableHead>
                  <TableRow sx={listStyles.headerRow}>
                    <TableCell>Numero OP</TableCell>
                    <TableCell>Date Emission</TableCell>
                    <TableCell>Date Execution</TableCell>
                    <TableCell>Beneficiaire</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrdres.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Aucun ordre de paiement trouve</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrdres.map((ordre) => (
                      <TableRow key={ordre.id} sx={listStyles.dataRow} onClick={() => handleOpenDialog(ordre)}>
                        <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                          {ordre.numeroOrdre}
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>
                          {new Date(ordre.dateEmission).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>
                          {ordre.dateExecution ? new Date(ordre.dateExecution).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell>{ordre.beneficiaire || '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                          {formatCurrency(ordre.montant)}
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={ordre.statut || 'EN_ATTENTE'} size="small" />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(ordre)} sx={{ color: colors.neutral[500] }}>
                              <Eye size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleOpenDialog(ordre)} sx={{ color: colors.neutral[500] }}>
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, id: ordre.id })} sx={{ color: colors.danger[500] }}>
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
              count={filteredOrdres.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </Box>
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
        <DialogTitle sx={componentStyles.dialog.title}>
          {selectedOrdre ? 'Modifier l\'Ordre de Paiement' : 'Nouvel Ordre de Paiement'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth required label="Numero OP" value={formData.numeroOrdre} onChange={(e) => setFormData({ ...formData, numeroOrdre: e.target.value })} placeholder="OP-001" size="small" />
              <TextField fullWidth required type="date" label="Date d'Emission" value={formData.dateEmission} onChange={(e) => setFormData({ ...formData, dateEmission: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth type="date" label="Date d'Execution Prevue" value={formData.dateExecution} onChange={(e) => setFormData({ ...formData, dateExecution: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
              <DecimalInput fullWidth required label="Montant" value={formData.montant} onChange={(value) => setFormData({ ...formData, montant: value })} decimalPlaces={2} min={0}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>, endAdornment: <InputAdornment position="end">MAD</InputAdornment> }} />
            </Stack>
            <TextField fullWidth required label="Beneficiaire" value={formData.beneficiaire} onChange={(e) => setFormData({ ...formData, beneficiaire: e.target.value })} size="small" />
            <TextField fullWidth label="Compte Bancaire" value={formData.compteBancaire} onChange={(e) => setFormData({ ...formData, compteBancaire: e.target.value })} size="small" />
            <TextField fullWidth label="Reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} size="small" />
            <DecimalInput fullWidth required label="Decompte (ID)" value={formData.decompteId} onChange={(value) => setFormData({ ...formData, decompteId: value })} decimalPlaces={0} min={0} helperText="ID du decompte associe" />
            <TextField fullWidth multiline rows={3} label="Observation" value={formData.observation} onChange={(e) => setFormData({ ...formData, observation: e.target.value })} size="small" />
            {selectedOrdre && (
              <Box>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1 }}>
                  Pieces jointes
                </Typography>
                <FileUpload typeEntite="ORDRE_PAIEMENT" entiteId={selectedOrdre.id} maxFiles={10} maxFileSize={10} />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleSubmit} sx={componentStyles.buttonPrimary}>
            {selectedOrdre ? 'Modifier' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Supprimer l'ordre de paiement"
        message="Cette action est irreversible. Voulez-vous continuer ?"
        variant="danger"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AppLayout>
  )
}

export default OrdresPaiementPage
