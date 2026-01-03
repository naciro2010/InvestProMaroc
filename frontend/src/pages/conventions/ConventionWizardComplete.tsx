import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  Chip,
  Checkbox,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Add,
  Delete,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { conventionsAPI } from '../../lib/api'
import { dimensionsAPI, DimensionAnalytique, ValeurDimension } from '../../lib/dimensionsAPI'

// ==================== TYPES ====================

interface Partenaire {
  id?: string
  role: 'MOA' | 'MOD' | 'BAILLEUR'
  nom: string
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  ice?: string
  rc?: string
  ifiscale?: string
  representant?: string
}

interface Subvention {
  id?: string
  organisme: string
  type: string
  montant: number
  dateEcheance: string
  conditions?: string
}

interface LigneBudget {
  id?: string
  designation: string
  montantHT: number
  tauxTVA: number
  montantTTC: number
}

interface ImputationPrevisionnelle {
  id?: string
  dimensionsValeurs: Record<string, number> // dimensionId -> valeurId
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue: string
}

interface VersementPrevisionnel {
  id?: string
  dateVersement: string
  montant: number
  partenaireId?: string
  modId?: string
  dimensionsValeurs: Record<string, number> // dimensionId -> valeurId
  volet?: string
}

interface ConventionFormData {
  // Étape 1: Informations de base
  typeConvention: 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'
  numero: string
  code: string
  libelle: string
  objet: string
  dateConvention: string
  dateDebut: string
  dateFin: string

  // Étape 2: Montants
  budgetGlobal: number
  lignesBudget: LigneBudget[]

  // Étape 3: Commission
  baseCommission: 'HT' | 'TTC' | 'AUTRE'
  modeCommission: 'TAUX_FIXE' | 'TRANCHES' | 'MIXTE'
  tauxCommission: number
  plafondCommission?: number
  minimumCommission?: number
  exclusions?: string

  // Étape 4: Partenaires (enrichi)
  partenaires: Partenaire[]

  // Étape 5: Subventions
  subventions: Subvention[]

  // Étape 6: Imputations Prévisionnelles (NOUVELLE)
  imputationsPrevisionnelles: ImputationPrevisionnelle[]

  // Étape 7: Versements Prévisionnels (NOUVELLE)
  versementsPrevisionnels: VersementPrevisionnel[]
}

const steps = [
  'Informations',
  'Budget',
  'Commission',
  'Partenaires',
  'Subventions',
  'Imputations',
  'Versements',
  'Récapitulatif',
]

// ==================== COMPONENT ====================

const ConventionWizardComplete = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Dimensions analytiques
  const [dimensions, setDimensions] = useState<DimensionAnalytique[]>([])
  const [dimensionsValeurs, setDimensionsValeurs] = useState<Record<number, ValeurDimension[]>>({})

  const [formData, setFormData] = useState<ConventionFormData>({
    typeConvention: 'CADRE',
    numero: '',
    code: '',
    libelle: '',
    objet: '',
    dateConvention: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    budgetGlobal: 0,
    lignesBudget: [],
    baseCommission: 'TTC',
    modeCommission: 'TAUX_FIXE',
    tauxCommission: 2.5,
    partenaires: [],
    subventions: [],
    imputationsPrevisionnelles: [],
    versementsPrevisionnels: [],
  })

  // Charger les dimensions actives au montage
  useEffect(() => {
    const loadDimensions = async () => {
      try {
        const response = await dimensionsAPI.getActives()
        const dims: DimensionAnalytique[] = Array.isArray(response.data)
          ? response.data
          : (Array.isArray((response.data as any)?.data) ? (response.data as any).data : [])
        setDimensions(dims)

        // Charger les valeurs pour chaque dimension
        const valeursPromises = dims.map((dim: DimensionAnalytique) =>
          dimensionsAPI.getValeursActives(dim.id)
        )
        const valeursResponses = await Promise.all(valeursPromises)

        const valeursMap: Record<number, ValeurDimension[]> = {}
        dims.forEach((dim: DimensionAnalytique, index: number) => {
          const vals = valeursResponses[index]
          const valeursData = Array.isArray(vals.data)
            ? vals.data
            : (Array.isArray((vals.data as any)?.data) ? (vals.data as any).data : [])
          valeursMap[dim.id] = valeursData
        })
        setDimensionsValeurs(valeursMap)
      } catch (error) {
        console.error('Erreur chargement dimensions:', error)
      }
    }
    loadDimensions()
  }, [])

  const handleNext = () => {
    const validationErrors = validateStep(activeStep)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setErrors([])
  }

  const validateStep = (step: number): string[] => {
    const errors: string[] = []

    switch (step) {
      case 0: // Informations de base
        if (!formData.numero) errors.push('Le numéro est obligatoire')
        if (!formData.code) errors.push('Le code est obligatoire')
        if (!formData.libelle) errors.push('Le libellé est obligatoire')
        if (!formData.objet) errors.push('L\'objet est obligatoire')
        if (!formData.dateDebut) errors.push('La date de début est obligatoire')
        break

      case 1: // Budget
        if (formData.budgetGlobal <= 0) errors.push('Le budget global doit être supérieur à 0')
        const totalLignes = formData.lignesBudget.reduce((sum, ligne) => sum + ligne.montantTTC, 0)
        if (formData.lignesBudget.length > 0 && Math.abs(totalLignes - formData.budgetGlobal) > 0.01) {
          errors.push('Le total des lignes doit être égal au budget global')
        }
        break

      case 2: // Commission
        if (formData.tauxCommission <= 0 || formData.tauxCommission > 100) {
          errors.push('Le taux de commission doit être entre 0 et 100')
        }
        break

      case 3: // Partenaires
        if (formData.partenaires.length === 0) {
          errors.push('Au moins un partenaire est requis')
        }
        const totalPourcentage = formData.partenaires.reduce((sum, p) => sum + p.pourcentage, 0)
        if (formData.partenaires.length > 0 && Math.abs(totalPourcentage - 100) > 0.01) {
          errors.push('Le total des pourcentages doit être égal à 100%')
        }
        break
    }

    return errors
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setErrors([])

      const payload = {
        numero: formData.numero,
        code: formData.code,
        libelle: formData.libelle,
        typeConvention: formData.typeConvention,
        statut: 'BROUILLON',
        dateConvention: formData.dateConvention,
        budget: formData.budgetGlobal,
        tauxCommission: formData.tauxCommission,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || null,
      }

      const response = await conventionsAPI.create(payload)
      console.log('Convention créée:', response.data)

      alert('Convention créée avec succès en BROUILLON !')
      navigate('/conventions')
    } catch (error: any) {
      console.error('Erreur lors de la création:', error)
      setErrors([error.response?.data?.message || 'Erreur lors de la création'])
    } finally {
      setLoading(false)
    }
  }

  // ==================== HANDLERS PARTENAIRES ====================

  const addPartenaire = () => {
    setFormData({
      ...formData,
      partenaires: [
        ...formData.partenaires,
        {
          id: crypto.randomUUID(),
          role: 'MOA',
          nom: '',
          budgetAlloue: 0,
          pourcentage: 0,
          estMaitreOeuvre: false,
          estMaitreOeuvreDelegue: false,
        },
      ],
    })
  }

  const removePartenaire = (id: string) => {
    setFormData({
      ...formData,
      partenaires: formData.partenaires.filter((p) => p.id !== id),
    })
  }

  const updatePartenaire = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      partenaires: formData.partenaires.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value }

          // Recalculer pourcentage si budget alloué change
          if (field === 'budgetAlloue' && formData.budgetGlobal > 0) {
            updated.pourcentage = (updated.budgetAlloue / formData.budgetGlobal) * 100
          }

          // Recalculer budget alloué si pourcentage change
          if (field === 'pourcentage' && formData.budgetGlobal > 0) {
            updated.budgetAlloue = (updated.pourcentage / 100) * formData.budgetGlobal
          }

          return updated
        }
        return p
      }),
    })
  }

  // ==================== HANDLERS IMPUTATIONS ====================

  const addImputation = () => {
    const dateDebut = new Date(formData.dateDebut)
    const dateFin = new Date(dateDebut)
    dateFin.setMonth(dateFin.getMonth() + 12)

    setFormData({
      ...formData,
      imputationsPrevisionnelles: [
        ...formData.imputationsPrevisionnelles,
        {
          id: crypto.randomUUID(),
          dimensionsValeurs: {},
          dateDemarrage: formData.dateDebut,
          delaiMois: 12,
          dateFinPrevue: dateFin.toISOString().split('T')[0],
        },
      ],
    })
  }

  const removeImputation = (id: string) => {
    setFormData({
      ...formData,
      imputationsPrevisionnelles: formData.imputationsPrevisionnelles.filter((i) => i.id !== id),
    })
  }

  const updateImputation = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      imputationsPrevisionnelles: formData.imputationsPrevisionnelles.map((i) => {
        if (i.id === id) {
          const updated = { ...i, [field]: value }

          // Recalculer date fin si date début ou délai change
          if (field === 'dateDemarrage' || field === 'delaiMois') {
            const dateDebut = new Date(updated.dateDemarrage)
            const dateFin = new Date(dateDebut)
            dateFin.setMonth(dateFin.getMonth() + updated.delaiMois)
            updated.dateFinPrevue = dateFin.toISOString().split('T')[0]
          }

          return updated
        }
        return i
      }),
    })
  }

  const updateImputationDimension = (id: string, dimensionId: number, valeurId: number) => {
    setFormData({
      ...formData,
      imputationsPrevisionnelles: formData.imputationsPrevisionnelles.map((i) => {
        if (i.id === id) {
          return {
            ...i,
            dimensionsValeurs: {
              ...i.dimensionsValeurs,
              [dimensionId]: valeurId,
            },
          }
        }
        return i
      }),
    })
  }

  // ==================== HANDLERS VERSEMENTS ====================

  const addVersement = () => {
    setFormData({
      ...formData,
      versementsPrevisionnels: [
        ...formData.versementsPrevisionnels,
        {
          id: crypto.randomUUID(),
          dateVersement: new Date().toISOString().split('T')[0],
          montant: 0,
          dimensionsValeurs: {},
        },
      ],
    })
  }

  const removeVersement = (id: string) => {
    setFormData({
      ...formData,
      versementsPrevisionnels: formData.versementsPrevisionnels.filter((v) => v.id !== id),
    })
  }

  const updateVersement = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      versementsPrevisionnels: formData.versementsPrevisionnels.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    })
  }

  const updateVersementDimension = (id: string, dimensionId: number, valeurId: number) => {
    setFormData({
      ...formData,
      versementsPrevisionnels: formData.versementsPrevisionnels.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            dimensionsValeurs: {
              ...v.dimensionsValeurs,
              [dimensionId]: valeurId,
            },
          }
        }
        return v
      }),
    })
  }

  // ==================== HANDLERS LIGNES BUDGET ====================

  const addLigneBudget = () => {
    setFormData({
      ...formData,
      lignesBudget: [
        ...formData.lignesBudget,
        {
          id: crypto.randomUUID(),
          designation: '',
          montantHT: 0,
          tauxTVA: 20,
          montantTTC: 0,
        },
      ],
    })
  }

  const removeLigneBudget = (id: string) => {
    setFormData({
      ...formData,
      lignesBudget: formData.lignesBudget.filter((l) => l.id !== id),
    })
  }

  const updateLigneBudget = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      lignesBudget: formData.lignesBudget.map((ligne) => {
        if (ligne.id === id) {
          const updated = { ...ligne, [field]: value }
          if (field === 'montantHT' || field === 'tauxTVA') {
            updated.montantTTC = updated.montantHT * (1 + updated.tauxTVA / 100)
          }
          return updated
        }
        return ligne
      }),
    })
  }

  // ==================== HANDLERS SUBVENTIONS ====================

  const addSubvention = () => {
    setFormData({
      ...formData,
      subventions: [
        ...formData.subventions,
        {
          id: crypto.randomUUID(),
          organisme: '',
          type: 'DON',
          montant: 0,
          dateEcheance: new Date().toISOString().split('T')[0],
        },
      ],
    })
  }

  const removeSubvention = (id: string) => {
    setFormData({
      ...formData,
      subventions: formData.subventions.filter((s) => s.id !== id),
    })
  }

  const updateSubvention = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      subventions: formData.subventions.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    })
  }

  // ==================== RENDER STEPS ====================

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderStep1_Informations()
      case 1:
        return renderStep2_Budget()
      case 2:
        return renderStep3_Commission()
      case 3:
        return renderStep4_Partenaires()
      case 4:
        return renderStep5_Subventions()
      case 5:
        return renderStep6_Imputations()
      case 6:
        return renderStep7_Versements()
      case 7:
        return renderStep8_Recapitulatif()
      default:
        return null
    }
  }

  // Étape 1: Informations
  const renderStep1_Informations = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Informations de base
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Type de Convention"
            select
            value={formData.typeConvention}
            onChange={(e) => setFormData({ ...formData, typeConvention: e.target.value as any })}
          >
            <MenuItem value="CADRE">Convention Cadre</MenuItem>
            <MenuItem value="NON_CADRE">Convention Non-Cadre</MenuItem>
            <MenuItem value="SPECIFIQUE">Convention Spécifique</MenuItem>
            <MenuItem value="AVENANT">Avenant</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Numéro"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            placeholder="CONV-2024-001"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="CONV001"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Date de Convention"
            type="date"
            value={formData.dateConvention}
            onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            label="Libellé"
            value={formData.libelle}
            onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
            placeholder="Convention d'intervention pour..."
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Objet de la Convention"
            value={formData.objet}
            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
            placeholder="Description détaillée..."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Date de Début"
            type="date"
            value={formData.dateDebut}
            onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Date de Fin"
            type="date"
            value={formData.dateFin}
            onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </Box>
  )

  // Étape 2: Budget
  const renderStep2_Budget = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Budget & Montants
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            type="number"
            label="Budget Global (MAD)"
            value={formData.budgetGlobal}
            onChange={(e) => setFormData({ ...formData, budgetGlobal: parseFloat(e.target.value) || 0 })}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Détail par Lignes (Optionnel)
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={addLigneBudget}
              sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
            >
              Ajouter une ligne
            </Button>
          </Stack>

          {formData.lignesBudget.map((ligne) => (
            <Card key={ligne.id} sx={{ mb: 2, bgcolor: '#f8fafc' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Désignation"
                      value={ligne.designation}
                      onChange={(e) => updateLigneBudget(ligne.id!, 'designation', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Montant HT"
                      value={ligne.montantHT}
                      onChange={(e) => updateLigneBudget(ligne.id!, 'montantHT', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="TVA (%)"
                      value={ligne.tauxTVA}
                      onChange={(e) => updateLigneBudget(ligne.id!, 'tauxTVA', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 10, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Montant TTC"
                      value={ligne.montantTTC.toFixed(2)}
                      InputProps={{ readOnly: true }}
                      sx={{ bgcolor: '#e0f2fe' }}
                    />
                  </Grid>
                  <Grid size={{ xs: 2, md: 1 }}>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeLigneBudget(ligne.id!)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          {formData.lignesBudget.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} color="#1e40af">
                Total des lignes: {formData.lignesBudget.reduce((sum, l) => sum + l.montantTTC, 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  )

  // Étape 3: Commission
  const renderStep3_Commission = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Commission d'Intervention
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Base de Calcul"
            select
            value={formData.baseCommission}
            onChange={(e) => setFormData({ ...formData, baseCommission: e.target.value as any })}
          >
            <MenuItem value="HT">HT (Hors Taxes)</MenuItem>
            <MenuItem value="TTC">TTC (Toutes Taxes Comprises)</MenuItem>
            <MenuItem value="AUTRE">Autre</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Mode de Calcul"
            select
            value={formData.modeCommission}
            onChange={(e) => setFormData({ ...formData, modeCommission: e.target.value as any })}
          >
            <MenuItem value="TAUX_FIXE">Taux Fixe</MenuItem>
            <MenuItem value="TRANCHES">Par Tranches</MenuItem>
            <MenuItem value="MIXTE">Mixte</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            required
            type="number"
            label="Taux de Commission (%)"
            value={formData.tauxCommission}
            onChange={(e) => setFormData({ ...formData, tauxCommission: parseFloat(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            type="number"
            label="Plafond Commission (MAD)"
            value={formData.plafondCommission || ''}
            onChange={(e) => setFormData({ ...formData, plafondCommission: parseFloat(e.target.value) || undefined })}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            type="number"
            label="Minimum Commission (MAD)"
            value={formData.minimumCommission || ''}
            onChange={(e) => setFormData({ ...formData, minimumCommission: parseFloat(e.target.value) || undefined })}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Exclusions / Conditions Particulières"
            value={formData.exclusions || ''}
            onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
            placeholder="Ex: Exclusion de la TVA, des frais de mission..."
          />
        </Grid>

        {/* Aperçu calcul */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: '#dbeafe', border: '1px solid #3b82f6' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} color="#1e40af" gutterBottom>
                Aperçu du Calcul de Commission
              </Typography>
              <Typography variant="body2">
                Base: <strong>{formData.baseCommission}</strong> |
                Mode: <strong>{formData.modeCommission}</strong> |
                Taux: <strong>{formData.tauxCommission}%</strong>
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, color: '#1e40af' }}>
                Commission estimée: {(formData.budgetGlobal * formData.tauxCommission / 100).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )

  // Étape 4: Partenaires ENRICHIS
  const renderStep4_Partenaires = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Partenaires & Allocation Budgétaire
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Budget total: {formData.budgetGlobal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={addPartenaire}
          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
        >
          Ajouter un partenaire
        </Button>
      </Stack>

      {formData.partenaires.length === 0 && (
        <Alert severity="info">Aucun partenaire ajouté. Veuillez ajouter au moins un partenaire.</Alert>
      )}

      {formData.partenaires.map((partenaire) => (
        <Card key={partenaire.id} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Rôle"
                  select
                  value={partenaire.role}
                  onChange={(e) => updatePartenaire(partenaire.id!, 'role', e.target.value)}
                >
                  <MenuItem value="MOA">MOA (Maître d'Ouvrage)</MenuItem>
                  <MenuItem value="MOD">MOD (Maître d'Ouvrage Délégué)</MenuItem>
                  <MenuItem value="BAILLEUR">Bailleur de Fonds</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Nom"
                  value={partenaire.nom}
                  onChange={(e) => updatePartenaire(partenaire.id!, 'nom', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Budget Alloué (MAD)"
                  value={partenaire.budgetAlloue}
                  onChange={(e) => updatePartenaire(partenaire.id!, 'budgetAlloue', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Pourcentage (%)"
                  value={partenaire.pourcentage.toFixed(2)}
                  onChange={(e) => updatePartenaire(partenaire.id!, 'pourcentage', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 1 }}>
                <IconButton
                  color="error"
                  onClick={() => removePartenaire(partenaire.id!)}
                >
                  <Delete />
                </IconButton>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={partenaire.estMaitreOeuvre}
                      onChange={(e) => updatePartenaire(partenaire.id!, 'estMaitreOeuvre', e.target.checked)}
                    />
                  }
                  label="Est Maître d'Œuvre (MO)"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={partenaire.estMaitreOeuvreDelegue}
                      onChange={(e) => updatePartenaire(partenaire.id!, 'estMaitreOeuvreDelegue', e.target.checked)}
                    />
                  }
                  label="Est Maître d'Œuvre Délégué (MOD)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {formData.partenaires.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600} color="#1e40af">
              Total alloué: {formData.partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} color="#1e40af">
              Total %: {formData.partenaires.reduce((sum, p) => sum + p.pourcentage, 0).toFixed(2)}%
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  )

  // Étape 5: Subventions
  const renderStep5_Subventions = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Subventions (Optionnel)
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Ajoutez les subventions et bailleurs de fonds
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={addSubvention}
          sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
        >
          Ajouter une subvention
        </Button>
      </Stack>

      {formData.subventions.length === 0 && (
        <Alert severity="info">Aucune subvention ajoutée (optionnel).</Alert>
      )}

      {formData.subventions.map((subvention) => (
        <Card key={subvention.id} sx={{ mb: 2, bgcolor: '#f8fafc' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Organisme"
                  value={subvention.organisme}
                  onChange={(e) => updateSubvention(subvention.id!, 'organisme', e.target.value)}
                  placeholder="Ex: Banque Mondiale"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Type"
                  value={subvention.type}
                  onChange={(e) => updateSubvention(subvention.id!, 'type', e.target.value)}
                  placeholder="Don, Prêt..."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="number"
                  label="Montant (MAD)"
                  value={subvention.montant}
                  onChange={(e) => updateSubvention(subvention.id!, 'montant', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="date"
                  label="Date Échéance"
                  value={subvention.dateEcheance}
                  onChange={(e) => updateSubvention(subvention.id!, 'dateEcheance', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 1 }}>
                <IconButton
                  color="error"
                  onClick={() => removeSubvention(subvention.id!)}
                >
                  <Delete />
                </IconButton>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Conditions"
                  value={subvention.conditions || ''}
                  onChange={(e) => updateSubvention(subvention.id!, 'conditions', e.target.value)}
                  placeholder="Conditions de déblocage..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  )

  // Étape 6: Imputations Prévisionnelles DYNAMIQUES ⭐
  const renderStep6_Imputations = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Imputations Prévisionnelles (Dimensions Analytiques)
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Définissez les imputations analytiques avec dimensions dynamiques
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={addImputation}
          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
        >
          Ajouter une imputation
        </Button>
      </Stack>

      {dimensions.length === 0 && (
        <Alert severity="warning">
          Aucune dimension analytique active. Veuillez configurer les dimensions dans le menu Paramétrage.
        </Alert>
      )}

      {formData.imputationsPrevisionnelles.length === 0 && (
        <Alert severity="info">Aucune imputation ajoutée (optionnel).</Alert>
      )}

      {formData.imputationsPrevisionnelles.map((imputation, index) => (
        <Card key={imputation.id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Imputation #{index + 1}
              </Typography>
              <IconButton
                color="error"
                size="small"
                onClick={() => removeImputation(imputation.id!)}
              >
                <Delete />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              {/* Dimensions dynamiques */}
              {dimensions.map((dimension) => (
                <Grid size={{ xs: 12, md: 4 }} key={dimension.id}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{dimension.nom} {dimension.obligatoire && '*'}</InputLabel>
                    <Select
                      value={imputation.dimensionsValeurs[dimension.id] || ''}
                      label={`${dimension.nom} ${dimension.obligatoire ? '*' : ''}`}
                      onChange={(e) => updateImputationDimension(imputation.id!, dimension.id, Number(e.target.value))}
                    >
                      <MenuItem value="">
                        <em>-- Sélectionner --</em>
                      </MenuItem>
                      {(dimensionsValeurs[dimension.id] || []).map((valeur) => (
                        <MenuItem key={valeur.id} value={valeur.id}>
                          {valeur.code} - {valeur.libelle}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Volet / Composante"
                  value={imputation.volet || ''}
                  onChange={(e) => updateImputation(imputation.id!, 'volet', e.target.value)}
                  placeholder="Ex: Volet 1"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="date"
                  label="Date Démarrage"
                  value={imputation.dateDemarrage}
                  onChange={(e) => updateImputation(imputation.id!, 'dateDemarrage', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="number"
                  label="Délai (mois)"
                  value={imputation.delaiMois}
                  onChange={(e) => updateImputation(imputation.id!, 'delaiMois', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date Fin Prévue"
                  value={imputation.dateFinPrevue}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: '#f3f4f6' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  )

  // Étape 7: Versements Prévisionnels DYNAMIQUES ⭐
  const renderStep7_Versements = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
        Versements Prévisionnels (Échéancier)
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Planifiez les versements avec imputation analytique
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={addVersement}
          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
        >
          Ajouter un versement
        </Button>
      </Stack>

      {formData.versementsPrevisionnels.length === 0 && (
        <Alert severity="info">Aucun versement ajouté (optionnel).</Alert>
      )}

      {formData.versementsPrevisionnels.map((versement, index) => (
        <Card key={versement.id} sx={{ mb: 2, bgcolor: '#f8fafc' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Versement #{index + 1}
              </Typography>
              <IconButton
                color="error"
                size="small"
                onClick={() => removeVersement(versement.id!)}
              >
                <Delete />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="date"
                  label="Date Versement"
                  value={versement.dateVersement}
                  onChange={(e) => updateVersement(versement.id!, 'dateVersement', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="number"
                  label="Montant (MAD)"
                  value={versement.montant}
                  onChange={(e) => updateVersement(versement.id!, 'montant', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Partenaire Bénéficiaire</InputLabel>
                  <Select
                    value={versement.partenaireId || ''}
                    label="Partenaire Bénéficiaire"
                    onChange={(e) => updateVersement(versement.id!, 'partenaireId', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>-- Sélectionner --</em>
                    </MenuItem>
                    {formData.partenaires.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nom} ({p.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>MOD Responsable</InputLabel>
                  <Select
                    value={versement.modId || ''}
                    label="MOD Responsable"
                    onChange={(e) => updateVersement(versement.id!, 'modId', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>-- Aucun --</em>
                    </MenuItem>
                    {formData.partenaires.filter(p => p.estMaitreOeuvreDelegue).map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Dimensions analytiques */}
              {dimensions.map((dimension) => (
                <Grid size={{ xs: 12, md: 4 }} key={dimension.id}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{dimension.nom}</InputLabel>
                    <Select
                      value={versement.dimensionsValeurs[dimension.id] || ''}
                      label={dimension.nom}
                      onChange={(e) => updateVersementDimension(versement.id!, dimension.id, Number(e.target.value))}
                    >
                      <MenuItem value="">
                        <em>-- Sélectionner --</em>
                      </MenuItem>
                      {(dimensionsValeurs[dimension.id] || []).map((valeur) => (
                        <MenuItem key={valeur.id} value={valeur.id}>
                          {valeur.code} - {valeur.libelle}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Volet"
                  value={versement.volet || ''}
                  onChange={(e) => updateVersement(versement.id!, 'volet', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {formData.versementsPrevisionnels.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="#1e40af">
            Total prévisionnel: {formData.versementsPrevisionnels.reduce((sum, v) => sum + v.montant, 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
          </Typography>
        </Box>
      )}
    </Box>
  )

  // Étape 8: Récapitulatif
  const renderStep8_Recapitulatif = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1e40af', fontWeight: 700, mb: 3 }}>
        Récapitulatif
      </Typography>

      {/* Informations de base */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Informations de base
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">Type</Typography>
              <Typography variant="body1" fontWeight={600}>{formData.typeConvention}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">Numéro</Typography>
              <Typography variant="body1" fontWeight={600}>{formData.numero}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">Code</Typography>
              <Typography variant="body1" fontWeight={600}>{formData.code}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">Date</Typography>
              <Typography variant="body1" fontWeight={600}>
                {new Date(formData.dateConvention).toLocaleDateString('fr-FR')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">Libellé</Typography>
              <Typography variant="body1">{formData.libelle}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Budget
          </Typography>
          <Typography variant="h4" sx={{ color: '#1e40af', fontWeight: 700 }}>
            {formData.budgetGlobal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
          </Typography>
        </CardContent>
      </Card>

      {/* Partenaires */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Partenaires ({formData.partenaires.length})
          </Typography>
          {formData.partenaires.map((p) => (
            <Chip
              key={p.id}
              label={`${p.role}: ${p.nom} (${p.pourcentage.toFixed(1)}%)`}
              sx={{ mr: 1, mb: 1 }}
              color={p.role === 'MOA' ? 'primary' : p.role === 'MOD' ? 'secondary' : 'default'}
            />
          ))}
        </CardContent>
      </Card>

      {/* Imputations */}
      {formData.imputationsPrevisionnelles.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Imputations Prévisionnelles ({formData.imputationsPrevisionnelles.length})
            </Typography>
            {formData.imputationsPrevisionnelles.map((imp, index) => (
              <Typography key={imp.id} variant="body2" color="text.secondary">
                #{index + 1}: Démarrage {new Date(imp.dateDemarrage).toLocaleDateString('fr-FR')} | Délai: {imp.delaiMois} mois
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Versements */}
      {formData.versementsPrevisionnels.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Versements Prévisionnels ({formData.versementsPrevisionnels.length})
            </Typography>
            <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
              Total: {formData.versementsPrevisionnels.reduce((sum, v) => sum + v.montant, 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <strong>Important:</strong> La convention sera créée avec le statut <strong>BROUILLON</strong>.
        Vous pourrez la soumettre à validation après vérification.
      </Alert>
    </Box>
  )

  // ==================== RENDER ====================

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <IconButton onClick={() => navigate('/conventions')} sx={{ color: '#3b82f6' }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1e3a8a' }}>
                Nouvelle Convention
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wizard complet avec dimensions analytiques dynamiques
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600}>Veuillez corriger:</Typography>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Content */}
        <Paper sx={{ p: 4, minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{ color: '#3b82f6' }}
          >
            Retour
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/conventions')}
              sx={{ borderColor: '#94a3b8', color: '#64748b' }}
            >
              Annuler
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? null : <CheckCircle />}
                sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
              >
                {loading ? 'Création...' : 'Créer en Brouillon'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </AppLayout>
  )
}

export default ConventionWizardComplete
