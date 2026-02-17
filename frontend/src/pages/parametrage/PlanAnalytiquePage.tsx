import { useState, useEffect } from 'react'
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material'
import { dimensionsAPI } from '../../lib/api'
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
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [loading, setLoading] = useState(true)
  const [openDimDialog, setOpenDimDialog] = useState(false)
  const [openValDialog, setOpenValDialog] = useState(false)
  const [selectedDimension, setSelectedDimension] = useState<Dimension | null>(null)
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

  const fetchDimensions = async () => {
    try {
      const response = await dimensionsAPI.getAll()
      // Gérer le format de réponse API
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
    } catch (error) {
      console.error('Erreur chargement dimensions:', error)
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
    } catch (error) {
      console.error('Erreur création dimension:', error)
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await dimensionsAPI.toggleActive(id)
      fetchDimensions()
    } catch (error) {
      console.error('Erreur toggle active:', error)
    }
  }

  const handleDeleteDimension = async (id: number) => {
    if (!confirm('Supprimer cette dimension?')) return
    try {
      await dimensionsAPI.delete(id)
      fetchDimensions()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const handleCreateValeur = async () => {
    if (!selectedDimension) return
    try {
      await dimensionsAPI.createValeur(selectedDimension.id, valeurFormData)
      fetchDimensions()
      setOpenValDialog(false)
      resetValeurForm()
    } catch (error) {
      console.error('Erreur création valeur:', error)
    }
  }

  const handleDeleteValeur = async (valeurId: number) => {
    if (!confirm('Supprimer cette valeur?')) return
    try {
      await dimensionsAPI.deleteValeur(valeurId)
      fetchDimensions()
    } catch (error) {
      console.error('Erreur suppression valeur:', error)
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
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">📊 Plan Analytique Dynamique</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm()
            setOpenDimDialog(true)
          }}
        >
          Créer Dimension
        </Button>
      </Stack>

      {dimensions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              Aucune dimension configurée. Créez votre première dimension analytique.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {dimensions.map((dimension) => (
            <Card key={dimension.id}>
              <CardContent>
                <Stack spacing={2}>
                  {/* En-tête dimension */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <DragIcon sx={{ color: 'text.secondary', cursor: 'move' }} />
                      <div>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6">{dimension.nom}</Typography>
                          <Chip label={dimension.code} size="small" />
                          {dimension.obligatoire && (
                            <Chip label="Obligatoire" color="error" size="small" />
                          )}
                          {!dimension.active && (
                            <Chip label="Inactive" color="default" size="small" />
                          )}
                        </Stack>
                        {dimension.description && (
                          <Typography variant="body2" color="text.secondary">
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
                      <Typography variant="subtitle2" color="text.secondary">
                        Valeurs ({dimension.valeurs?.length || 0})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedDimension(dimension)
                          resetValeurForm()
                          setOpenValDialog(true)
                        }}
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
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              mb: 0.5,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body2">{valeur.libelle}</Typography>
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
                      <Typography variant="body2" color="text.secondary" align="center" py={2}>
                        Aucune valeur configurée
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog Créer Dimension */}
      <Dialog open={openDimDialog} onClose={() => setOpenDimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une Dimension</DialogTitle>
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
              placeholder="Région, Type Marché, Phase..."
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
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Créer Valeur */}
      <Dialog open={openValDialog} onClose={() => setOpenValDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Ajouter une Valeur à {selectedDimension?.nom}
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
              label="Libellé"
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
  )
}
