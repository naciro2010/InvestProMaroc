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
import RichTextEditor from '../../components/ui/RichTextEditor'

// ==================== TYPES ====================

interface Partenaire {
  id?: string
  role: 'MOA' | 'BAILLEUR'
  nom: string
  budgetAlloue: number
  pourcentage: number
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

interface TrancheCommission {
  id?: string
  montantDebut: number
  montantFin: number
  taux: number
}

interface ConventionFormData {
  // Étape 1: Informations de base
  typeConvention: 'CADRE' | 'NON_CADRE'
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
  baseCommission: 'HT' | 'TTC'
  modeCommission: 'TAUX_FIXE' | 'TRANCHES' | 'MIXTE'
  tauxCommission: number
  tranchesCommission: TrancheCommission[]
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
    tranchesCommission: [],
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

      // Mapper les subventions au format backend
      const subventions = formData.subventions.map(sub => ({
        organismeBailleur: sub.organisme,
        typeSubvention: sub.type,
        montantTotal: sub.montant,
        devise: 'MAD',
        dateFinValidite: sub.dateEcheance,
        conditions: sub.conditions || null,
      }))

      const payload = {
        numero: formData.numero,
        code: formData.code,
        libelle: formData.libelle,
        objet: formData.objet,
        typeConvention: formData.typeConvention,
        statut: 'BROUILLON',
        dateConvention: formData.dateConvention,
        budget: formData.budgetGlobal,
        tauxCommission: formData.tauxCommission,
        baseCalcul: formData.baseCommission === 'HT' ? 'DECAISSEMENTS_HT' : 'DECAISSEMENTS_TTC',
        tauxTva: 20.00,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || null,
        subventions: subventions,
      }

      const response = await conventionsAPI.create(payload)

      // Vérifier le statut HTTP réel
      if (response.status === 201 || response.status === 200) {
        console.log('✅ Convention créée avec succès:', response.data)
        alert('Convention créée avec succès en BROUILLON !')
        navigate('/conventions')
      } else {
        throw new Error(`Statut inattendu: ${response.status}`)
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error)

      // Gérer les différents types d'erreurs
      let errorMessage = 'Erreur lors de la création de la convention'

      if (error.response?.status === 403) {
        errorMessage = '🔒 Accès refusé. Vous n\'avez pas la permission de créer une convention. Rôle requis: ADMIN ou MANAGER.'
      } else if (error.response?.status === 401) {
        errorMessage = '🔐 Session expirée. Veuillez vous reconnecter.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || '⚠️ Données invalides. Vérifiez le formulaire.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setErrors([errorMessage])
      alert(`❌ ${errorMessage}`)
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

  // ==================== HANDLERS TRANCHES COMMISSION ====================

  const addTrancheCommission = () => {
    const derniereTranche = formData.tranchesCommission[formData.tranchesCommission.length - 1]
    const nouveauMontantDebut = derniereTranche ? derniereTranche.montantFin : 0

    setFormData({
      ...formData,
      tranchesCommission: [
        ...formData.tranchesCommission,
        {
          id: crypto.randomUUID(),
          montantDebut: nouveauMontantDebut,
          montantFin: nouveauMontantDebut + 100000,
          taux: 0,
        },
      ],
    })
  }

  const removeTrancheCommission = (id: string) => {
    setFormData({
      ...formData,
      tranchesCommission: formData.tranchesCommission.filter((t) => t.id !== id),
    })
  }

  const updateTrancheCommission = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      tranchesCommission: formData.tranchesCommission.map((tranche) =>
        tranche.id === id ? { ...tranche, [field]: value } : tranche
      ),
    })
  }

  // Calculer la commission totale avec tranches
  const calculateCommissionAvecTranches = (budget: number): number => {
    if (formData.modeCommission === 'TAUX_FIXE') {
      return (budget * formData.tauxCommission) / 100
    }

    if (formData.modeCommission === 'TRANCHES' && formData.tranchesCommission.length > 0) {
      let commissionTotale = 0
      let budgetRestant = budget

      for (const tranche of formData.tranchesCommission) {
        if (budgetRestant <= 0) break

        const montantTranche = Math.min(
          budgetRestant,
          tranche.montantFin - tranche.montantDebut
        )

        if (montantTranche > 0) {
          commissionTotale += (montantTranche * tranche.taux) / 100
          budgetRestant -= montantTranche
        }
      }

      return commissionTotale
    }

    return (budget * formData.tauxCommission) / 100
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
    const stepContent = (() => {
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
          return renderStep8_Recapitulatif()
        default:
          return null
      }
    })()

    // Show SummaryBar for steps >= 2 (Commission, Partenaires, Subventions, Récap)
    return (
      <>
        {stepContent}
        {step >= 2 && <SummaryBar />}
      </>
    )
  }

  // Helper component for step headers
  const StepHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: subtitle ? 0.5 : 0,
          fontSize: { xs: '1.25rem', md: '1.5rem' }
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 2, borderColor: '#e2e8f0' }} />
    </Box>
  )

  // Helper component for summary bar at bottom of each step (hidden for steps 0 and 1)
  const SummaryBar = () => {
    const commissionEstimee = calculateCommissionAvecTranches(formData.budgetGlobal)
    const totalPartenaires = formData.partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
    const totalPourcentage = formData.partenaires.reduce((sum, p) => sum + p.pourcentage, 0)

    return (
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: 2,
          border: '2px solid #3b82f6',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
          📊 Résumé de la Convention
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Budget Global
            </Typography>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
              {formData.budgetGlobal.toLocaleString('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} DH
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Taux Commission
            </Typography>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
              {formData.tauxCommission}%
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Commission Estimée
            </Typography>
            <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
              {commissionEstimee.toLocaleString('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} DH
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Partenaires
            </Typography>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
              {formData.partenaires.length} ({totalPourcentage.toFixed(1)}%)
            </Typography>
          </Grid>
        </Grid>
        {formData.partenaires.length > 0 && totalPourcentage !== 100 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ⚠️ Le total des pourcentages des partenaires n'est pas égal à 100% (actuellement {totalPourcentage.toFixed(1)}%)
          </Alert>
        )}
        {formData.lignesBudget.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Lignes de budget : {formData.lignesBudget.length} ligne(s) | Total : {
                formData.lignesBudget.reduce((sum, l) => sum + l.montantTTC, 0).toLocaleString('fr-MA', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              } DH
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

  // Étape 1: Informations
  const renderStep1_Informations = () => (
    <Box>
      <StepHeader
        title="Informations de base"
        subtitle="Définissez les informations principales de la convention"
      />
      <Grid container spacing={3}>
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
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Objet de la Convention *
            </Typography>
            <RichTextEditor
              value={formData.objet}
              onChange={(value) => setFormData({ ...formData, objet: value })}
              placeholder="Décrivez l'objet de la convention de manière détaillée..."
              minHeight={250}
            />
          </Box>
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
  const renderStep2_Budget = () => {
    const totalLignes = formData.lignesBudget.reduce((sum, l) => sum + l.montantTTC, 0)
    const difference = formData.budgetGlobal - totalLignes

    return (
      <Box>
        <StepHeader
          title="Budget & Montants"
          subtitle="Définissez le budget global et son détail par lignes"
        />
        <Grid container spacing={3}>
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
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Désignation"
                        value={ligne.designation}
                        onChange={(e) => updateLigneBudget(ligne.id!, 'designation', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
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
                    <Grid size={{ xs: 12, sm: 3 }}>
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
                    <Grid size={{ xs: 12, sm: 4 }}>
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
                    <Grid size={{ xs: 12, sm: 1 }}>
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
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Budget Global
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e40af">
                      {formData.budgetGlobal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Total des Lignes
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="#1e40af">
                      {totalLignes.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Différence
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color={Math.abs(difference) < 0.01 ? '#059669' : difference > 0 ? '#dc2626' : '#f59e0b'}
                    >
                      {difference.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                    </Typography>
                  </Grid>
                </Grid>
                {Math.abs(difference) >= 0.01 && (
                  <Alert severity={difference > 0 ? 'warning' : 'info'} sx={{ mt: 2 }}>
                    {difference > 0
                      ? `⚠️ Il reste ${difference.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })} à allouer`
                      : `ℹ️ Les lignes dépassent le budget global de ${Math.abs(difference).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}`
                    }
                  </Alert>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Étape 3: Commission
  const renderStep3_Commission = () => {
    const commissionEstimee = calculateCommissionAvecTranches(formData.budgetGlobal)

    return (
      <Box>
        <StepHeader
          title="Commission d'Intervention"
          subtitle="Paramètres de calcul de la commission"
        />
        <Grid container spacing={3}>
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

          {/* Taux Fixe OU Tranches selon le mode */}
          {formData.modeCommission === 'TAUX_FIXE' || formData.modeCommission === 'MIXTE' ? (
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
          ) : null}

          {formData.modeCommission === 'TRANCHES' && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Tranches de Commission (Base: {formData.baseCommission})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addTrancheCommission}
                  sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                >
                  Ajouter une tranche
                </Button>
              </Stack>

              {formData.tranchesCommission.length === 0 && (
                <Alert severity="info">Aucune tranche définie. Ajoutez au moins une tranche de commission.</Alert>
              )}

              {formData.tranchesCommission.map((tranche, index) => (
                <Card key={tranche.id} sx={{ mb: 2, bgcolor: '#f8fafc' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" fontWeight={600} color="primary">
                          Tranche {index + 1}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label={`Montant Début (${formData.baseCommission})`}
                          value={tranche.montantDebut}
                          onChange={(e) => updateTrancheCommission(tranche.id!, 'montantDebut', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label={`Montant Fin (${formData.baseCommission})`}
                          value={tranche.montantFin}
                          onChange={(e) => updateTrancheCommission(tranche.id!, 'montantFin', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Taux (%)"
                          value={tranche.taux}
                          onChange={(e) => updateTrancheCommission(tranche.id!, 'taux', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeTrancheCommission(tranche.id!)}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#e0f2fe', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Commission sur cette tranche: {((tranche.montantFin - tranche.montantDebut) * tranche.taux / 100).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          )}

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
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Base de Calcul
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.baseCommission}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Mode de Calcul
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.modeCommission === 'TAUX_FIXE' ? 'Taux Fixe' :
                       formData.modeCommission === 'TRANCHES' ? 'Par Tranches' : 'Mixte'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Taux Appliqué
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.tauxCommission}%
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
                  Commission estimée: {commissionEstimee.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                </Typography>
                {formData.plafondCommission && commissionEstimee > formData.plafondCommission && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ La commission dépasse le plafond fixé ({formData.plafondCommission.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })})
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Étape 4: Partenaires
  const renderStep4_Partenaires = () => {
    const totalAlloue = formData.partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
    const totalPourcentage = formData.partenaires.reduce((sum, p) => sum + p.pourcentage, 0)

    return (
      <Box>
        <StepHeader
          title="Partenaires & Allocation Budgétaire"
          subtitle="Définissez les partenaires et leur allocation budgétaire"
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
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
          <Card key={partenaire.id} sx={{ mb: 2, bgcolor: '#fafafa' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    <MenuItem value="BAILLEUR">Bailleur de Fonds</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Nom"
                    value={partenaire.nom}
                    onChange={(e) => updatePartenaire(partenaire.id!, 'nom', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Grid size={{ xs: 12, sm: 5, md: 2 }}>
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
                <Grid size={{ xs: 12, sm: 1, md: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    color="error"
                    onClick={() => removePartenaire(partenaire.id!)}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        {formData.partenaires.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Total Alloué
                </Typography>
                <Typography variant="h6" fontWeight={600} color="#1e40af">
                  {totalAlloue.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Total Pourcentage
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={Math.abs(totalPourcentage - 100) < 0.01 ? '#059669' : '#dc2626'}
                >
                  {totalPourcentage.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
            {Math.abs(totalPourcentage - 100) >= 0.01 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ Le total des pourcentages doit être égal à 100% (actuellement {totalPourcentage.toFixed(2)}%)
              </Alert>
            )}
          </Box>
        )}
      </Box>
    )
  }

  // Étape 5: Subventions
  const renderStep5_Subventions = () => {
    const totalSubventions = formData.subventions.reduce((sum, s) => sum + s.montant, 0)

    return (
      <Box>
        <StepHeader
          title="Subventions (Optionnel)"
          subtitle="Ajoutez les subventions et bailleurs de fonds"
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="body2" color="text.secondary">
            {formData.subventions.length > 0
              ? `${formData.subventions.length} subvention(s) ajoutée(s)`
              : 'Aucune subvention'}
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Type"
                    value={subvention.type}
                    onChange={(e) => updateSubvention(subvention.id!, 'type', e.target.value)}
                    placeholder="Don, Prêt..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    multiline
                    rows={2}
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

        {formData.subventions.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Total des Subventions
            </Typography>
            <Typography variant="h6" fontWeight={600} color="#1e40af">
              {totalSubventions.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

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
                <Grid container spacing={2}>
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

              <Grid container spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Volet / Composante"
                  value={imputation.volet || ''}
                  onChange={(e) => updateImputation(imputation.id!, 'volet', e.target.value)}
                  placeholder="Ex: Volet 1"
                />
              </Grid>
              <Grid container spacing={2}>
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
              <Grid container spacing={2}>
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
              <Grid container spacing={2}>
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
              <Grid container spacing={2}>
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
              <Grid container spacing={2}>
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
              <Grid container spacing={2}>
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

              {/* Dimensions analytiques */}
              {dimensions.map((dimension) => (
                <Grid container spacing={2}>
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

              <Grid container spacing={2}>
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
  const renderStep8_Recapitulatif = () => {
    const commissionEstimee = calculateCommissionAvecTranches(formData.budgetGlobal)
    const totalLignesBudget = formData.lignesBudget.reduce((sum, l) => sum + l.montantTTC, 0)
    const totalPartenaires = formData.partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
    const totalPourcentage = formData.partenaires.reduce((sum, p) => sum + p.pourcentage, 0)
    const totalSubventions = formData.subventions.reduce((sum, s) => sum + s.montant, 0)

    return (
      <Box>
        <StepHeader
          title="Récapitulatif Final"
          subtitle="Vérifiez toutes les informations avant de soumettre"
        />

        {/* Informations de base */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
              📋 Informations de base
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Type</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formData.typeConvention === 'CADRE' ? 'Convention Cadre' :
                   formData.typeConvention === 'NON_CADRE' ? 'Convention Non-Cadre' :
                   formData.typeConvention === 'SPECIFIQUE' ? 'Convention Spécifique' : 'Avenant'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Numéro</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.numero}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Code</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.code}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Date</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(formData.dateConvention).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Libellé</Typography>
                <Typography variant="body1">{formData.libelle}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>Objet</Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 1,
                    border: '1px solid #e2e8f0',
                    '& p': { margin: 0 },
                    '& ul, & ol': { marginTop: 0.5, marginBottom: 0.5 }
                  }}
                  dangerouslySetInnerHTML={{ __html: formData.objet }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Date de Début</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>
              {formData.dateFin && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Date de Fin</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(formData.dateFin).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
              💰 Budget Global
            </Typography>
            <Typography variant="h4" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
              {formData.budgetGlobal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </Typography>
            {formData.lignesBudget.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Détail des Lignes ({formData.lignesBudget.length})
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {formData.lignesBudget.map((ligne, index) => (
                    <Box key={ligne.id} sx={{ mb: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {index + 1}. {ligne.designation}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>HT</Typography>
                          <Typography variant="body2">{ligne.montantHT.toLocaleString('fr-MA')} DH</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>TTC</Typography>
                          <Typography variant="body2" fontWeight={600}>{ligne.montantTTC.toLocaleString('fr-MA')} DH</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Total Lignes</Typography>
                      <Typography variant="h6" fontWeight={600} color="#1e40af">
                        {totalLignesBudget.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Différence</Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={Math.abs(formData.budgetGlobal - totalLignesBudget) < 0.01 ? '#059669' : '#dc2626'}
                      >
                        {(formData.budgetGlobal - totalLignesBudget).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Commission */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
              📊 Commission d'Intervention
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Base</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.baseCommission}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Mode</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formData.modeCommission === 'TAUX_FIXE' ? 'Taux Fixe' :
                   formData.modeCommission === 'TRANCHES' ? 'Par Tranches' : 'Mixte'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Taux</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.tauxCommission}%</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Commission Estimée</Typography>
                <Typography variant="h6" fontWeight={700} color="#059669">
                  {commissionEstimee.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                </Typography>
              </Grid>
              {formData.plafondCommission && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Plafond</Typography>
                  <Typography variant="body1">{formData.plafondCommission.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</Typography>
                </Grid>
              )}
              {formData.minimumCommission && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Minimum</Typography>
                  <Typography variant="body1">{formData.minimumCommission.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</Typography>
                </Grid>
              )}
            </Grid>
            {formData.exclusions && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Exclusions / Conditions</Typography>
                <Typography variant="body2">{formData.exclusions}</Typography>
              </>
            )}
            {formData.modeCommission === 'TRANCHES' && formData.tranchesCommission.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Détail des Tranches
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {formData.tranchesCommission.map((tranche, index) => (
                    <Box key={tranche.id} sx={{ mb: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            Tranche {index + 1}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {tranche.montantDebut.toLocaleString('fr-MA')} - {tranche.montantFin.toLocaleString('fr-MA')} DH ({formData.baseCommission})
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Taux</Typography>
                          <Typography variant="body2" fontWeight={600}>{tranche.taux}%</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Commission</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {((tranche.montantFin - tranche.montantDebut) * tranche.taux / 100).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Partenaires */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
              🤝 Partenaires ({formData.partenaires.length})
            </Typography>
            {formData.partenaires.map((p) => (
              <Box key={p.id} sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Nom</Typography>
                    <Typography variant="body1" fontWeight={600}>{p.nom}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Rôle</Typography>
                    <Chip
                      label={p.role}
                      size="small"
                      color={p.role === 'MOA' ? 'primary' : 'default'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Budget Alloué</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {p.budgetAlloue.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Pourcentage</Typography>
                    <Typography variant="body1" fontWeight={600}>{p.pourcentage.toFixed(2)}%</Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Total Alloué</Typography>
                  <Typography variant="h6" fontWeight={600} color="#1e40af">
                    {totalPartenaires.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Total Pourcentage</Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={Math.abs(totalPourcentage - 100) < 0.01 ? '#059669' : '#dc2626'}
                  >
                    {totalPourcentage.toFixed(2)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Subventions */}
        {formData.subventions.length > 0 && (
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700, mb: 2 }}>
                🏦 Subventions ({formData.subventions.length})
              </Typography>
              {formData.subventions.map((s) => (
                <Box key={s.id} sx={{ mb: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" fontWeight={600}>{s.organisme}</Typography>
                      {s.type && <Typography variant="caption" color="text.secondary">{s.type}</Typography>}
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Montant</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {s.montant.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Échéance</Typography>
                      <Typography variant="body2">{new Date(s.dateEcheance).toLocaleDateString('fr-FR')}</Typography>
                    </Grid>
                    {s.conditions && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">{s.conditions}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ))}
              <Box sx={{ mt: 2, p: 2, bgcolor: '#dbeafe', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Total Subventions</Typography>
                <Typography variant="h6" fontWeight={600} color="#1e40af">
                  {totalSubventions.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        <Alert severity="info" icon={false} sx={{ boxShadow: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📝 Important
          </Typography>
          <Typography variant="body2">
            La convention sera créée avec le statut <strong>BROUILLON</strong>.
            Vous pourrez la soumettre à validation après vérification.
          </Typography>
        </Alert>
      </Box>
    )
  }

  // ==================== RENDER ====================

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <IconButton
              onClick={() => navigate('/conventions')}
              sx={{
                color: '#3b82f6',
                bgcolor: '#eff6ff',
                '&:hover': {
                  bgcolor: '#dbeafe',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s'
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                  mb: 0.5
                }}
              >
                Nouvelle Convention
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '0.875rem', md: '1rem' }
                }}
              >
                Création simplifiée en 8 étapes
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            mb: 3,
            border: '1px solid',
            borderColor: '#e2e8f0',
            borderRadius: 3,
            background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'auto'
          }}
        >
          <Stepper
            activeStep={activeStep}
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                fontWeight: 500
              },
              '& .MuiStepIcon-root': {
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: '#3b82f6'
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: '#10b981'
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: '1px solid #fecaca',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Veuillez corriger les erreurs suivantes:
            </Typography>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Content */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            minHeight: { xs: 300, md: 400 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
        >
          {renderStepContent(activeStep)}
        </Paper>

        {/* Navigation */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: { xs: 2, md: 3 },
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{
              color: '#3b82f6',
              fontWeight: 500,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: '#eff6ff',
                transform: 'translateX(-2px)'
              },
              '&:disabled': {
                color: '#cbd5e1'
              },
              transition: 'all 0.2s',
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Retour
          </Button>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate('/conventions')}
              sx={{
                borderColor: '#cbd5e1',
                color: '#64748b',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Annuler
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? null : <CheckCircle />}
                sx={{
                  bgcolor: '#10b981',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgb(16 185 129 / 0.3)',
                  '&:hover': {
                    bgcolor: '#059669',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 15px -3px rgb(16 185 129 / 0.4)'
                  },
                  '&:disabled': {
                    bgcolor: '#cbd5e1'
                  },
                  transition: 'all 0.2s',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {loading ? 'Création...' : 'Créer en Brouillon'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: '#3b82f6',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgb(59 130 246 / 0.3)',
                  '&:hover': {
                    bgcolor: '#2563eb',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 15px -3px rgb(59 130 246 / 0.4)'
                  },
                  transition: 'all 0.2s',
                  width: { xs: '100%', sm: 'auto' }
                }}
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
