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
import DecimalInput from '@/components/ui/DecimalInput'
import { categoriesDepensesAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { CategorieDepense } from '@/types/api'

const listStyles = componentStyles.listView

const CategoriesDepensesPage = () => {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<CategorieDepense[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategorieDepense | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    description: '',
    categorie: '',
    ordreAffichage: 0,
  })
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    const q = searchQuery.toLowerCase()
    return categories.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.libelle.toLowerCase().includes(q) ||
      (c.categorie?.toLowerCase() ?? '').includes(q) ||
      (c.description?.toLowerCase() ?? '').includes(q)
    )
  }, [categories, searchQuery])

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage
    return filteredCategories.slice(start, start + rowsPerPage)
  }, [filteredCategories, page, rowsPerPage])

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesDepensesAPI.getAll()
      setCategories(response.data.data || response.data || [])
    } catch {
      showToast('Erreur lors du chargement des categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: CategorieDepense) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        code: category.code,
        libelle: category.libelle,
        description: category.description || '',
        categorie: category.categorie || '',
        ordreAffichage: category.ordreAffichage || 0,
      })
    } else {
      setEditingCategory(null)
      setFormData({ code: '', libelle: '', description: '', categorie: '', ordreAffichage: 0 })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => { setModalOpen(false); setEditingCategory(null) }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingCategory) {
        await categoriesDepensesAPI.update(editingCategory.id, formData)
        showToast('Categorie modifiee avec succes', 'success')
      } else {
        await categoriesDepensesAPI.create(formData)
        showToast('Categorie creee avec succes', 'success')
      }
      handleCloseModal()
      loadCategories()
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      await categoriesDepensesAPI.delete(deleteConfirm.id)
      showToast('Categorie desactivee avec succes', 'success')
      loadCategories()
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

  const pStart = filteredCategories.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredCategories.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Configuration', path: '/parametrage/conventions' },
            { label: 'Categories de depenses' },
          ]}
          searchValue={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setPage(0) }}
          searchPlaceholder="Rechercher par code, libelle, categorie..."
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
              <IconButton size="small" onClick={loadCategories} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          paginationInfo={filteredCategories.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredCategories.length } : undefined}
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
                    <TableCell>Libelle</TableCell>
                    <TableCell>Categorie</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Ordre</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Aucune categorie trouvee</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((cat) => (
                      <TableRow key={cat.id} sx={listStyles.dataRow}>
                        <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                          {cat.code}
                        </TableCell>
                        <TableCell>{cat.libelle}</TableCell>
                        <TableCell>
                          {cat.categorie ? (
                            <Box sx={{
                              display: 'inline-flex',
                              px: 1.5, py: 0.25,
                              borderRadius: '4px',
                              bgcolor: cat.categorie === 'Investissement' ? colors.primary[50] : colors.purple[50],
                              color: cat.categorie === 'Investissement' ? colors.primary[700] : colors.purple[700],
                              fontSize: typography.sizes.xs,
                              fontWeight: typography.weights.semibold,
                            }}>
                              {cat.categorie}
                            </Box>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ color: colors.textSecondary }}>{cat.ordreAffichage || '-'}</TableCell>
                        <TableCell align="center">
                          <StatusBadge status={cat.actif ? 'ACTIF' : 'INACTIF'} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => handleOpenModal(cat)} sx={{ color: colors.neutral[500] }}>
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, id: cat.id })} sx={{ color: colors.danger[500] }}>
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
              count={filteredCategories.length}
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

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
        <DialogTitle sx={componentStyles.dialog.title}>
          {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="TRAV" required fullWidth size="small" helperText="Code unique (ex: TRAV, FOUR, SERV)" />
            <TextField label="Libelle" value={formData.libelle} onChange={(e) => setFormData({ ...formData, libelle: e.target.value })} placeholder="Travaux" required fullWidth size="small" />
            <TextField label="Categorie" value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} placeholder="Investissement" fullWidth size="small" helperText="Ex: Investissement, Fonctionnement" />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth size="small" />
            <DecimalInput label="Ordre d'affichage" value={formData.ordreAffichage} onChange={(value) => setFormData({ ...formData, ordreAffichage: value })} decimalPlaces={0} min={0} fullWidth helperText="Ordre de tri dans les listes" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseModal} disabled={saving} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !formData.code || !formData.libelle} sx={componentStyles.buttonPrimary}>
            {editingCategory ? 'Modifier' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactiver la categorie"
        message="Voulez-vous vraiment desactiver cette categorie ?"
        variant="danger"
        confirmLabel="Desactiver"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AppLayout>
  )
}

export default CategoriesDepensesPage
