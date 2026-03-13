import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material'
import { Plus, RefreshCw, Edit2, Trash2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, StatusBadge } from '@/components/core'
import ConfirmDialog from '@/components/core/ConfirmDialog'
import { partenairesAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface Partenaire {
  id: number
  code: string
  raisonSociale: string
  sigle?: string
  typePartenaire?: string
  email?: string
  telephone?: string
  adresse?: string
  description?: string
  actif: boolean
  createdAt?: string
  updatedAt?: string
}

const listStyles = componentStyles.listView

const PartenairesPage = () => {
  const { showToast } = useToast()
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPartenaire, setEditingPartenaire] = useState<Partenaire | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [formData, setFormData] = useState({
    code: '',
    raisonSociale: '',
    sigle: '',
    typePartenaire: '',
    email: '',
    telephone: '',
    adresse: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const filteredPartenaires = useMemo(() => {
    if (!searchQuery) return partenaires
    const q = searchQuery.toLowerCase()
    return partenaires.filter(p =>
      p.code.toLowerCase().includes(q) ||
      p.raisonSociale.toLowerCase().includes(q) ||
      (p.sigle?.toLowerCase() ?? '').includes(q) ||
      (p.email?.toLowerCase() ?? '').includes(q) ||
      (p.typePartenaire?.toLowerCase() ?? '').includes(q)
    )
  }, [partenaires, searchQuery])

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage
    return filteredPartenaires.slice(start, start + rowsPerPage)
  }, [filteredPartenaires, page, rowsPerPage])

  useEffect(() => { loadPartenaires() }, [])

  const loadPartenaires = async () => {
    try {
      setLoading(true)
      const response = await partenairesAPI.getAll()
      setPartenaires(response.data.data || response.data || [])
    } catch {
      showToast('Erreur lors du chargement des partenaires', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (partenaire?: Partenaire) => {
    if (partenaire) {
      setEditingPartenaire(partenaire)
      setFormData({
        code: partenaire.code,
        raisonSociale: partenaire.raisonSociale,
        sigle: partenaire.sigle || '',
        typePartenaire: partenaire.typePartenaire || '',
        email: partenaire.email || '',
        telephone: partenaire.telephone || '',
        adresse: partenaire.adresse || '',
        description: partenaire.description || '',
      })
    } else {
      setEditingPartenaire(null)
      setFormData({ code: '', raisonSociale: '', sigle: '', typePartenaire: '', email: '', telephone: '', adresse: '', description: '' })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => { setModalOpen(false); setEditingPartenaire(null) }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingPartenaire) {
        await partenairesAPI.update(editingPartenaire.id, formData)
        showToast('Partenaire modifie avec succes', 'success')
      } else {
        await partenairesAPI.create(formData)
        showToast('Partenaire cree avec succes', 'success')
      }
      handleCloseModal()
      loadPartenaires()
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      await partenairesAPI.delete(deleteConfirm.id)
      showToast('Partenaire desactive avec succes', 'success')
      loadPartenaires()
    } catch {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </AppLayout>
    )
  }

  const pStart = filteredPartenaires.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredPartenaires.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Configuration', path: '/parametrage/conventions' },
            { label: 'Partenaires' },
          ]}
          searchValue={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setPage(0) }}
          searchPlaceholder="Rechercher par code, raison sociale, sigle..."
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => handleOpenModal()}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau
              </Button>
              <IconButton size="small" onClick={loadPartenaires} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          paginationInfo={filteredPartenaires.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredPartenaires.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={listStyles.container}>
            <TableContainer>
              <Table size="small" sx={listStyles.table}>
                <TableHead>
                  <TableRow sx={listStyles.headerRow}>
                    <TableCell>Code</TableCell>
                    <TableCell>Raison sociale</TableCell>
                    <TableCell>Sigle</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Aucun partenaire trouve</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((p) => (
                      <TableRow key={p.id} sx={listStyles.dataRow}>
                        <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                          {p.code}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: typography.sizes.sm }}>{p.raisonSociale}</Typography>
                          {p.description && (
                            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                              {p.description.substring(0, 50)}{p.description.length > 50 ? '...' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.sigle ? (
                            <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.25, borderRadius: '4px', bgcolor: colors.purple[50], color: colors.purple[700], fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }}>
                              {p.sigle}
                            </Box>
                          ) : '-'}
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>{p.typePartenaire || '-'}</TableCell>
                        <TableCell>
                          {p.email && <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{p.email}</Typography>}
                          {p.telephone && <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{p.telephone}</Typography>}
                          {!p.email && !p.telephone && <Typography sx={{ color: colors.textSecondary }}>-</Typography>}
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={p.actif ? 'ACTIF' : 'INACTIF'} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => handleOpenModal(p)} sx={{ color: colors.neutral[500] }}>
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, id: p.id })} sx={{ color: colors.danger[500] }}>
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
              count={filteredPartenaires.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </Box>
        </Box>
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
        <DialogTitle sx={componentStyles.dialog.title}>
          {editingPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="PART-001" required fullWidth size="small" helperText="Code unique du partenaire" />
              <TextField label="Sigle" value={formData.sigle} onChange={(e) => setFormData({ ...formData, sigle: e.target.value.toUpperCase() })} placeholder="AFD" fullWidth size="small" helperText="Acronyme (ex: AFD, BM, MASEN)" />
            </Stack>
            <TextField label="Raison sociale" value={formData.raisonSociale} onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })} required fullWidth size="small" />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Type de partenaire" value={formData.typePartenaire} onChange={(e) => setFormData({ ...formData, typePartenaire: e.target.value })} placeholder="Ministere" fullWidth size="small" />
              <TextField label="Telephone" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} placeholder="+212 5XX XX XX XX" fullWidth size="small" />
            </Stack>
            <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" />
            <TextField label="Adresse" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} multiline rows={2} fullWidth size="small" />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseModal} disabled={saving} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !formData.code || !formData.raisonSociale} sx={componentStyles.buttonPrimary}>
            {editingPartenaire ? 'Modifier' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactiver le partenaire"
        message="Voulez-vous vraiment desactiver ce partenaire ?"
        variant="danger"
        confirmLabel="Desactiver"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AppLayout>
  )
}

export default PartenairesPage
