import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Close,
  Category,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader } from '@/components/core'
import DecimalInput from '@/components/ui/DecimalInput'
import { categoriesDepensesAPI } from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import type { CategorieDepense } from '../../types/api'

const CategoriesDepensesPage = () => {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<CategorieDepense[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategorieDepense | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    description: '',
    categorie: '',
    ordreAffichage: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesDepensesAPI.getAll()
      setCategories(response.data.data || response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des catégories', 'error')
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
      setFormData({
        code: '',
        libelle: '',
        description: '',
        categorie: '',
        ordreAffichage: 0,
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingCategory(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingCategory) {
        await categoriesDepensesAPI.update(editingCategory.id, formData)
        showToast('Catégorie modifiée avec succès', 'success')
      } else {
        await categoriesDepensesAPI.create(formData)
        showToast('Catégorie créée avec succès', 'success')
      }
      handleCloseModal()
      loadCategories()
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment désactiver cette catégorie ?')) {
      try {
        await categoriesDepensesAPI.delete(id)
        showToast('Catégorie désactivée avec succès', 'success')
        loadCategories()
      } catch (error) {
        showToast('Erreur lors de la suppression', 'error')
      }
    }
  }

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader
          title="Catégories de dépenses"
          subtitle="Gestion du référentiel des catégories de dépenses"
          actions={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
            >
              Nouvelle catégorie
            </Button>
          }
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Alert severity="info">
            Aucune catégorie de dépense. Cliquez sur "Nouvelle catégorie" pour en créer une.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Ordre</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {category.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{category.libelle}</TableCell>
                    <TableCell>
                      {category.categorie && (
                        <Chip
                          label={category.categorie}
                          size="small"
                          color={
                            category.categorie === 'Investissement'
                              ? 'primary'
                              : 'secondary'
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{category.ordreAffichage || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={category.actif ? 'Actif' : 'Inactif'}
                        size="small"
                        color={category.actif ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(category)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal Création/Edition */}
        <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            <IconButton onClick={handleCloseModal} size="small">
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="TRAV"
                required
                fullWidth
                helperText="Code unique (ex: TRAV, FOUR, SERV)"
              />

              <TextField
                label="Libellé"
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                placeholder="Travaux"
                required
                fullWidth
              />

              <TextField
                label="Catégorie"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                placeholder="Investissement"
                fullWidth
                helperText="Ex: Investissement, Fonctionnement"
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie..."
                multiline
                rows={3}
                fullWidth
              />

              <DecimalInput
                label="Ordre d'affichage"
                value={formData.ordreAffichage}
                onChange={(value) => setFormData({ ...formData, ordreAffichage: value })}
                decimalPlaces={0}
                min={0}
                fullWidth
                helperText="Ordre de tri dans les listes déroulantes"
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || !formData.code || !formData.libelle}
              startIcon={saving ? <CircularProgress size={16} /> : null}
            >
              {editingCategory ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  )
}

export default CategoriesDepensesPage
