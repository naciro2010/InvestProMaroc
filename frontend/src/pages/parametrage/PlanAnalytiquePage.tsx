import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material'
import { RefreshCw, Plus } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import { colors, typography } from '@/lib/designSystem'
import { dimensionsAPI } from '../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import DecimalInput from '@/components/ui/DecimalInput'

interface Dimension {
  id: number
  code: string
  nom: string
  description?: string
  ordre: number
  active: boolean
  obligatoire: boolean
  valeurs?: Valeur[]
}

interface Valeur {
  id: number
  code: string
  libelle: string
  description?: string
  ordre: number
  active: boolean
}

export default function PlanAnalytiquePage() {
  const { showToast } = useToast()
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [loading, setLoading] = useState(true)
  const [openDimDialog, setOpenDimDialog] = useState(false)
  const [openValDialog, setOpenValDialog] = useState(false)
  const [selectedDimension, setSelectedDimension] = useState<Dimension | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    ordre: 0,
    obligatoire: false,
  })
  const [valeurFormData, setValeurFormData] = useState({
    code: '',
    libelle: '',
    description: '',
    ordre: 0,
  })

  useEffect(() => {
    fetchDimensions()
  }, [])

  const filteredDimensions = useMemo(() => {
    if (!searchQuery) return dimensions
    const q = searchQuery.toLowerCase()
    return dimensions.filter(d =>
      d.code.toLowerCase().includes(q) ||
      d.nom.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    )
  }, [dimensions, searchQuery])

  const fetchDimensions = async () => {
    try {
      const response = await dimensionsAPI.getAll()
      // Gerer le format de reponse API
      const dimensionsData = Array.isArray(response.data) ? response.data : (response.data?.data || [])

      // Charger les valeurs pour chaque dimension
      const dimensionsWithValeurs = await Promise.all(
        dimensionsData.map(async (dim: Dimension) => {
          const valeursResponse = await dimensionsAPI.getValeurs(dim.id)
          const valeurs = Array.isArray(valeursResponse.data) ? valeursResponse.data : (valeursResponse.data?.data || [])
          return { ...dim, valeurs }
        })
      )
      setDimensions(dimensionsWithValeurs.sort((a, b) => a.ordre - b.ordre))
    } catch {
      showToast('Erreur lors du chargement des dimensions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDimension = async () => {
    try {
      await dimensionsAPI.create(formData)
      fetchDimensions()
      setOpenDimDialog(false)
      resetForm()
    } catch {
      showToast('Erreur lors de la creation de la dimension', 'error')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await dimensionsAPI.toggleActive(id)
      fetchDimensions()
    } catch {
      showToast('Erreur lors de la modification du statut', 'error')
    }
  }

  const handleDeleteDimension = async (id: number) => {
    if (!confirm('Supprimer cette dimension?')) return
    try {
      await dimensionsAPI.delete(id)
      fetchDimensions()
    } catch {
      showToast('Erreur lors de la suppression de la dimension', 'error')
    }
  }

  const handleCreateValeur = async () => {
    if (!selectedDimension) return
    try {
      await dimensionsAPI.createValeur(selectedDimension.id, valeurFormData)
      fetchDimensions()
      setOpenValDialog(false)
      resetValeurForm()
    } catch {
      showToast('Erreur lors de la creation de la valeur', 'error')
    }
  }

  const handleDeleteValeur = async (valeurId: number) => {
    if (!confirm('Supprimer cette valeur?')) return
    try {
      await dimensionsAPI.deleteValeur(valeurId)
      fetchDimensions()
    } catch {
      showToast('Erreur lors de la suppression de la valeur', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      nom: '',
      description: '',
      ordre: dimensions.length + 1,
      obligatoire: false,
    })
  }

  const resetValeurForm = () => {
    setValeurFormData({
      code: '',
      libelle: '',
      description: '',
      ordre: (selectedDimension?.valeurs?.length || 0) + 1,
    })
  }

  if (loading) return <Typography>Chargement...</Typography>

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Plan Analytique' },
          ]}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshCw size={16} />}
                onClick={fetchDimensions}
                sx={{ textTransform: 'none' }}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => {
                  resetForm()
                  setOpenDimDialog(true)
                }}
                sx={{ textTransform: 'none' }}
              >
                Creer Dimension
              </Button>
            </Box>
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Rechercher par code, nom..."
        />

        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          {filteredDimensions.length === 0 ? (
            <Card>
              <CardContent>
                <Typography
                  sx={{ color: colors.textSecondary, textAlign: 'center', fontSize: typography.sizes.sm }}
                >
                  {searchQuery
                    ? 'Aucune dimension ne correspond a votre recherche.'
                    : 'Aucune dimension configuree. Creez votre premiere dimension analytique.'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {filteredDimensions.map((dimension) => (
                <Card key={dimension.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* En-tete dimension */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <DragIcon sx={{ color: colors.textSecondary, cursor: 'move' }} />
                          <div>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography
                                sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold }}
                              >
                                {dimension.nom}
                              </Typography>
                              <Chip label={dimension.code} size="small" />
                              {dimension.obligatoire && (
                                <Chip label="Obligatoire" color="error" size="small" />
                              )}
                              {!dimension.active && (
                                <Chip label="Inactive" color="default" size="small" />
                              )}
                            </Stack>
                            {dimension.description && (
                              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                                {dimension.description}
                              </Typography>
                            )}
                          </div>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={dimension.active}
                                onChange={() => handleToggleActive(dimension.id)}
                              />
                            }
                            label="Active"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDimension(dimension.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {/* Valeurs */}
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textSecondary }}>
                            Valeurs ({dimension.valeurs?.length || 0})
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Plus size={14} />}
                            onClick={() => {
                              setSelectedDimension(dimension)
                              resetValeurForm()
                              setOpenValDialog(true)
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            Ajouter Valeur
                          </Button>
                        </Stack>

                        {dimension.valeurs && dimension.valeurs.length > 0 ? (
                          <List dense>
                            {dimension.valeurs.map((valeur) => (
                              <ListItem
                                key={valeur.id}
                                sx={{
                                  bgcolor: colors.neutral[50],
                                  borderRadius: 1,
                                  mb: 0.5,
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography sx={{ fontSize: typography.sizes.sm }}>
                                        {valeur.libelle}
                                      </Typography>
                                      <Chip label={valeur.code} size="small" variant="outlined" />
                                      {!valeur.active && (
                                        <Chip label="Inactive" size="small" variant="outlined" />
                                      )}
                                    </Stack>
                                  }
                                  secondary={valeur.description}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleDeleteValeur(valeur.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography
                            sx={{
                              fontSize: typography.sizes.sm,
                              color: colors.textSecondary,
                              textAlign: 'center',
                              py: 2,
                            }}
                          >
                            Aucune valeur configuree
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Dialog Creer Dimension */}
        <Dialog open={openDimDialog} onClose={() => setOpenDimDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Creer une Dimension</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="REG, MARCH, PHASE..."
                required
              />
              <TextField
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Region, Type Marche, Phase..."
                required
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
              <DecimalInput
                label="Ordre"
                value={formData.ordre}
                onChange={(value) => setFormData({ ...formData, ordre: value })}
                decimalPlaces={0}
                min={0}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.obligatoire}
                    onChange={(e) => setFormData({ ...formData, obligatoire: e.target.checked })}
                  />
                }
                label="Dimension obligatoire pour imputation"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDimDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateDimension} variant="contained">
              Creer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Creer Valeur */}
        <Dialog open={openValDialog} onClose={() => setOpenValDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Ajouter une Valeur a {selectedDimension?.nom}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Code"
                value={valeurFormData.code}
                onChange={(e) =>
                  setValeurFormData({ ...valeurFormData, code: e.target.value.toUpperCase() })
                }
                placeholder="CAS, RAB, MAR..."
                required
              />
              <TextField
                label="Libelle"
                value={valeurFormData.libelle}
                onChange={(e) => setValeurFormData({ ...valeurFormData, libelle: e.target.value })}
                placeholder="Casablanca, Rabat, Marrakech..."
                required
              />
              <TextField
                label="Description"
                value={valeurFormData.description}
                onChange={(e) =>
                  setValeurFormData({ ...valeurFormData, description: e.target.value })
                }
                multiline
                rows={2}
              />
              <DecimalInput
                label="Ordre"
                value={valeurFormData.ordre}
                onChange={(value) => setValeurFormData({ ...valeurFormData, ordre: value })}
                decimalPlaces={0}
                min={0}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenValDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateValeur} variant="contained">
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}
