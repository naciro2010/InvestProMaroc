import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  Chip,
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Check,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useMutation, useQuery } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { SimplePageLayout } from '../../components/layout/PageLayout'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import DecimalInput from '../../components/ui/DecimalInput'
import { conventionsAPI } from '../../lib/api'
import { getEnabledConventionTypes } from '../../lib/settings/conventionSettings'
import { useConventionConfiguration } from '../../hooks/useConventionConfiguration'
import { incrementConventionCode } from '../../utils/conventionCode'
import { addMonths, calculateDurationMonths, formatDateInput } from '../../utils/dateUtils'
import { getPlainTextLength, stripHtml } from '../../utils/textUtils'

const steps = [
  'Informations',
  'Budget',
  'Commission',
  'Partenaires',
  'Subventions',
  'Récapitulatif',
]

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface BudgetLigne {
  id?: string
  designation: string
  montantHT: number
  tauxTVA: number
  montantTTC: number
}

interface Partenaire {
  id?: string
  designation: string
  budget: number
  pourcentage: number
  ci: number
}

interface Subvention {
  id?: string
  organisme: string
  montant: number
  pourcentage: number
  dateObtention: string
}

interface ConventionFormData {
  // Step 1: Informations
  code: string
  numeroConvention: string
  libelle: string
  libelleRich: string
  objet: string
  objetRich: string
  type: 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'
  dateSignature: string
  dateDebut: string
  dateFin: string
  dureeMois: number

  // Step 2: Budget
  budgetGlobal: number
  lignesBudget: BudgetLigne[]

  // Step 3: Commission
  tauxCommission: number
  baseCalcul: 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT' // ✅ Correspond aux valeurs backend
  tauxTva: number

  // Step 4: Partenaires
  partenaires: Partenaire[]

  // Step 5: Subventions
  subventions: Subvention[]

  // Files
  files: UploadedFile[]
}

const ConventionWizardComplete = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEditing = !!id
  const [activeStep, setActiveStep] = useState(0)
  const { configuration: settings } = useConventionConfiguration()
  const [autoDateFin, setAutoDateFin] = useState(true)

  const defaultFormData: ConventionFormData = {
    code: '',
    numeroConvention: '',
    libelle: '',
    libelleRich: '',
    objet: '',
    objetRich: '',
    type: 'CADRE',
    dateSignature: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: formatDateInput(addMonths(new Date(), 12)),
    dureeMois: 12,
    budgetGlobal: 0,
    lignesBudget: [],
    tauxCommission: 2.5,
    baseCalcul: 'DECAISSEMENTS_TTC', // ✅ Valeur par défaut backend
    tauxTva: 20,
    partenaires: [],
    subventions: [],
    files: [],
  }

  const [formData, setFormData] = useState<ConventionFormData>(defaultFormData)

  // Load existing convention when in edit mode
  const { data: existingConvention, isLoading: isLoadingConvention } = useQuery({
    queryKey: ['convention', id],
    queryFn: () => (id ? conventionsAPI.getById(parseInt(id)) : null),
    enabled: isEditing,
  })

  // Initialize form with loaded data
  useEffect(() => {
    if (existingConvention?.data) {
      const convention = existingConvention.data
      const formatDate = (dateStr: string | Date | null | undefined) => {
        if (!dateStr) return ''
        return typeof dateStr === 'string'
          ? dateStr.split('T')[0]
          : new Date(dateStr).toISOString().split('T')[0]
      }

      setFormData({
        code: convention.code || '',
        numeroConvention: '',
        libelle: convention.designation || '',
        libelleRich: convention.designation || '',
        objet: convention.objet || '',
        objetRich: convention.objetRich || '',
        type: convention.type || 'CADRE',
        dateSignature: new Date().toISOString().split('T')[0],
        dateDebut: formatDate(convention.dateDebut),
        dateFin: formatDate(convention.dateFin),
        dureeMois: convention.dateFin && convention.dateDebut
          ? calculateDurationMonths(new Date(convention.dateDebut), new Date(convention.dateFin))
          : 12,
        budgetGlobal: convention.budgetTotal || 0,
        lignesBudget: [],
        tauxCommission: convention.tauxCommission || 2.5,
        baseCalcul: (convention.baseCalcul as 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT') || 'DECAISSEMENTS_TTC',
        tauxTva: 20,
        partenaires: [],
        subventions: [],
        files: [],
      })
    }
  }, [existingConvention])

  useEffect(() => {
    const loadNextCode = async () => {
      if (isEditing || formData.code) return
      try {
        const response = await conventionsAPI.getAll()
        const conventions = response.data.data || response.data
        if (Array.isArray(conventions) && conventions.length > 0) {
          const latestConvention = conventions.reduce((latest, current) =>
            current.id > latest.id ? current : latest
          )
          if (latestConvention?.code) {
            setFormData((prev) => ({
              ...prev,
              code: incrementConventionCode(latestConvention.code),
            }))
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du code de convention', error)
      }
    }

    loadNextCode()
  }, [formData.code, isEditing])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ConventionFormData) => {
      // Payload qui correspond EXACTEMENT à l'entité Convention backend
      const payload = {
        code: data.code,
        numero: data.numeroConvention, // ✅ 'numero' au lieu de 'numeroConvention'
        dateConvention: data.dateSignature, // ✅ 'dateConvention' au lieu de 'dateSignature'
        typeConvention: data.type, // ✅ 'typeConvention' au lieu de 'type'
        libelle: data.libelle, // ✅ 'libelle' au lieu de 'designation'
        objet: data.objetRich || data.objet, // ✅ Utiliser objetRich (rich text) ou objet en fallback
        tauxCommission: data.tauxCommission,
        budget: data.budgetGlobal, // ✅ 'budget' au lieu de 'budgetTotal'
        baseCalcul: data.baseCalcul,
        tauxTva: data.tauxTva,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin || undefined,
        description: undefined,
      }
      return await conventionsAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/conventions')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ConventionFormData) => {
      // Payload qui correspond EXACTEMENT à l'entité Convention backend
      const payload = {
        code: data.code,
        numero: data.numeroConvention, // ✅ 'numero' au lieu de 'numeroConvention'
        dateConvention: data.dateSignature, // ✅ 'dateConvention' au lieu de 'dateSignature'
        typeConvention: data.type, // ✅ 'typeConvention' au lieu de 'type'
        libelle: data.libelle, // ✅ 'libelle' au lieu de 'designation'
        objet: data.objetRich || data.objet, // ✅ Utiliser objetRich (rich text) ou objet en fallback
        tauxCommission: data.tauxCommission,
        budget: data.budgetGlobal, // ✅ 'budget' au lieu de 'budgetTotal'
        baseCalcul: data.baseCalcul,
        tauxTva: data.tauxTva,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin || undefined,
        description: undefined,
      }
      return await conventionsAPI.update(parseInt(id!), payload)
    },
    onSuccess: () => {
      navigate(`/conventions/${id}`)
    },
  })

  const handleChange = (field: keyof ConventionFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value

    if (field === 'dateDebut') {
      const nextDateDebut = value
      setFormData((prev) => {
        const updated = { ...prev, dateDebut: nextDateDebut }
        if (autoDateFin && prev.dureeMois) {
          updated.dateFin = formatDateInput(addMonths(new Date(nextDateDebut), prev.dureeMois))
        }
        return updated
      })
      return
    }

    if (field === 'dateFin') {
      setAutoDateFin(false)
      setFormData((prev) => ({
        ...prev,
        dateFin: value,
        dureeMois:
          prev.dateDebut && value
            ? calculateDurationMonths(new Date(prev.dateDebut), new Date(value))
            : prev.dureeMois,
      }))
      return
    }

    if (field === 'dureeMois') {
      const duration = Number(value)
      setAutoDateFin(true)
      setFormData((prev) => ({
        ...prev,
        dureeMois: duration,
        dateFin: prev.dateDebut
          ? formatDateInput(addMonths(new Date(prev.dateDebut), duration))
          : prev.dateFin,
      }))
      return
    }

    setFormData({ ...formData, [field]: value })
  }

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      if (isEditing) {
        updateMutation.mutate(formData)
      } else {
        createMutation.mutate(formData)
      }
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  // Calculate totals
  const calculateTotals = () => {
    const totalLignesHT = formData.lignesBudget.reduce((sum, ligne) => sum + ligne.montantHT, 0)
    const totalLignesTTC = formData.lignesBudget.reduce((sum, ligne) => sum + ligne.montantTTC, 0)
    const differenceGlobalVsLignes = formData.budgetGlobal - totalLignesTTC
    const totalPartenaires = formData.partenaires.reduce((sum, p) => sum + p.budget, 0)
    const totalSubventions = formData.subventions.reduce((sum, s) => sum + s.montant, 0)

    // Calculate commission based on baseCalcul
    const baseAmount =
      formData.baseCalcul === 'DECAISSEMENTS_HT' ? totalLignesHT || formData.budgetGlobal : totalLignesTTC || formData.budgetGlobal
    const commissionEstimee = (baseAmount * formData.tauxCommission) / 100

    return {
      totalLignesHT,
      totalLignesTTC,
      differenceGlobalVsLignes,
      totalPartenaires,
      totalSubventions,
      commissionEstimee,
    }
  }

  const totals = calculateTotals()

  // Add ligne budget
  const [newLigne, setNewLigne] = useState<BudgetLigne>({
    designation: '',
    montantHT: 0,
    tauxTVA: 20,
    montantTTC: 0,
  })

  const handleAddLigne = () => {
    if (newLigne.designation && newLigne.montantHT > 0) {
      const montantTTC = newLigne.montantHT * (1 + newLigne.tauxTVA / 100)
      const ligneToAdd = { ...newLigne, montantTTC }
      setFormData({
        ...formData,
        lignesBudget: [...formData.lignesBudget, ligneToAdd],
      })
      setNewLigne({ designation: '', montantHT: 0, tauxTVA: 20, montantTTC: 0 })
    }
  }

  const handleDeleteLigne = (index: number) => {
    setFormData({
      ...formData,
      lignesBudget: formData.lignesBudget.filter((_, i) => i !== index),
    })
  }

  // Add partenaire
  const [newPartenaire, setNewPartenaire] = useState<Partenaire>({
    designation: '',
    budget: 0,
    pourcentage: 0,
    ci: 0,
  })

  const handleAddPartenaire = () => {
    if (newPartenaire.designation && newPartenaire.budget > 0) {
      setFormData({
        ...formData,
        partenaires: [...formData.partenaires, newPartenaire],
      })
      setNewPartenaire({ designation: '', budget: 0, pourcentage: 0, ci: 0 })
    }
  }

  const handleDeletePartenaire = (index: number) => {
    setFormData({
      ...formData,
      partenaires: formData.partenaires.filter((_, i) => i !== index),
    })
  }

  // Add subvention
  const [newSubvention, setNewSubvention] = useState<Subvention>({
    organisme: '',
    montant: 0,
    pourcentage: 0,
    dateObtention: new Date().toISOString().split('T')[0],
  })

  const handleAddSubvention = () => {
    if (newSubvention.organisme && newSubvention.montant > 0) {
      setFormData({
        ...formData,
        subventions: [...formData.subventions, newSubvention],
      })
      setNewSubvention({
        organisme: '',
        montant: 0,
        pourcentage: 0,
        dateObtention: new Date().toISOString().split('T')[0],
      })
    }
  }

  const handleDeleteSubvention = (index: number) => {
    setFormData({
      ...formData,
      subventions: formData.subventions.filter((_, i) => i !== index),
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(value)
  }

  const typeOptions = getEnabledConventionTypes(settings)
  const typeOptionsWithCurrent =
    typeOptions.find((option) => option.value === formData.type)
      ? typeOptions
      : [...typeOptions, { value: formData.type, label: formData.type, enabled: true }]

  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Informations
        return (
          formData.code &&
          formData.libelle &&
          getPlainTextLength(formData.libelleRich) <= 200 &&
          formData.objetRich
        )
      case 1: // Budget
        return formData.budgetGlobal > 0
      case 2: // Commission
        return formData.tauxCommission > 0
      case 3: // Partenaires (optional)
        return true
      case 4: // Subventions (optional)
        return true
      case 5: // Récapitulatif
        return true
      default:
        return false
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Informations
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                📋 Informations générales
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Code, Numéro, Type */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Code *"
                value={formData.code}
                onChange={handleChange('code')}
                placeholder={settings.codeMaskPlaceholder}
                inputProps={{ pattern: settings.codeMaskPattern }}
                helperText={`Format attendu : ${settings.codeMaskPlaceholder}`}
                size="small"
              />
              <TextField
                fullWidth
                label="Numéro de convention"
                value={formData.numeroConvention}
                onChange={handleChange('numeroConvention')}
                placeholder={settings.numeroMaskPlaceholder}
                inputProps={{ pattern: settings.numeroMaskPattern }}
                helperText={`Format attendu : ${settings.numeroMaskPlaceholder}`}
                size="small"
              />
              <TextField
                fullWidth
                select
                label="Type *"
                value={formData.type}
                onChange={handleChange('type')}
                size="small"
              >
                {typeOptionsWithCurrent.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Info alert */}
            <Alert severity="info">
              {formData.type === 'CADRE'
                ? '📌 Convention CADRE - Permet de créer des sous-conventions après validation.'
                : '📋 Convention NON_CADRE - Convention simple et directe.'}
            </Alert>

            {/* Libellé */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Libellé de la convention *
              </Typography>
              <RichTextEditor
                value={formData.libelleRich}
                onChange={(value) => {
                  const plain = stripHtml(value).substring(0, 200)
                  setFormData((prev) => ({
                    ...prev,
                    libelleRich: value,
                    libelle: plain,
                  }))
                }}
                placeholder="Libellé de la convention..."
                minHeight={120}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {getPlainTextLength(formData.libelleRich)} / 200 caractères
              </Typography>
            </Box>

            {/* Objet (Rich Text) */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Objet de la convention *
              </Typography>
              <RichTextEditor
                value={formData.objetRich}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    objetRich: value,
                    objet: stripHtml(value).substring(0, 500),
                  })
                }}
                placeholder="Décrivez l'objet de la convention en détail..."
                minHeight={200}
              />
            </Box>

            {/* Dates */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                📅 Dates
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Date de signature"
                  type="date"
                  value={formData.dateSignature}
                  onChange={handleChange('dateSignature')}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Date de début *"
                  type="date"
                  value={formData.dateDebut}
                  onChange={handleChange('dateDebut')}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={formData.dateFin}
                  onChange={handleChange('dateFin')}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Box>
              <Box sx={{ mt: 2, maxWidth: 260 }}>
                <TextField
                  fullWidth
                  label="Durée (mois)"
                  type="number"
                  value={formData.dureeMois}
                  onChange={handleChange('dureeMois')}
                  inputProps={{ min: 0 }}
                  helperText={
                    autoDateFin
                      ? 'La date de fin est calculée automatiquement.'
                      : 'Modifiez la durée pour recalculer la date de fin.'
                  }
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        )

      case 1: // Budget
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                💰 Budget & Montants
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Budget Global */}
            <Card sx={{ p: 2, bgcolor: '#f0f9ff' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Budget Global (MAD) *
              </Typography>
              <DecimalInput
                fullWidth
                value={formData.budgetGlobal}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    budgetGlobal: value,
                  })
                }}
                decimalPlaces={2}
                min={0}
                size="medium"
                sx={{ bgcolor: 'white' }}
              />
            </Card>

            {/* Détail par lignes (Optionnel) */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Détail par Lignes (Optionnel)
                </Typography>
                <Chip
                  label={`${formData.lignesBudget.length} ligne(s)`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* Add ligne form */}
              <Card sx={{ p: 2, mb: 2 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
                    gap: 1,
                    alignItems: 'flex-end',
                  }}
                >
                  <TextField
                    size="small"
                    label="Désignation"
                    value={newLigne.designation}
                    onChange={(e) => setNewLigne({ ...newLigne, designation: e.target.value })}
                    placeholder="Travaux, Fournitures, etc."
                  />
                  <DecimalInput
                    size="small"
                    label="Montant HT"
                    value={newLigne.montantHT}
                    onChange={(montantHT) => {
                      const montantTTC = montantHT * (1 + newLigne.tauxTVA / 100)
                      setNewLigne({ ...newLigne, montantHT, montantTTC })
                    }}
                    decimalPlaces={2}
                    min={0}
                  />
                  <DecimalInput
                    size="small"
                    label="TVA (%)"
                    value={newLigne.tauxTVA}
                    onChange={(tauxTVA) => {
                      const montantTTC = newLigne.montantHT * (1 + tauxTVA / 100)
                      setNewLigne({ ...newLigne, tauxTVA, montantTTC })
                    }}
                    decimalPlaces={2}
                    min={0}
                    max={100}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Montant TTC"
                    value={newLigne.montantTTC.toFixed(2)}
                    InputProps={{ readOnly: true }}
                    sx={{ bgcolor: '#f5f5f5' }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddLigne}
                    sx={{ height: 40 }}
                  >
                    Ajouter
                  </Button>
                </Box>
              </Card>

              {/* Lignes table */}
              {formData.lignesBudget.length > 0 && (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Montant HT
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          TVA (%)
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Montant TTC
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.lignesBudget.map((ligne, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{ligne.designation}</TableCell>
                          <TableCell align="right">{formatCurrency(ligne.montantHT)}</TableCell>
                          <TableCell align="right">{ligne.tauxTVA}%</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(ligne.montantTTC)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleDeleteLigne(idx)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Total des lignes */}
              {formData.lignesBudget.length > 0 && (
                <Card sx={{ p: 2, bgcolor: '#e0f2fe' }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary">
                    Total des lignes : {formatCurrency(totals.totalLignesTTC)}
                  </Typography>
                </Card>
              )}
            </Box>

            {/* Résumé de la Convention */}
            <Card sx={{ p: 3, bgcolor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                  📊 Résumé de la Convention
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Budget Global
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                    {formatCurrency(formData.budgetGlobal)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Taux Commission
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formData.tauxCommission}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Commission Estimée
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>
                    {formatCurrency(totals.commissionEstimee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Partenaires
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formData.partenaires.length} ({((totals.totalPartenaires / formData.budgetGlobal) * 100 || 0).toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>

              {/* Difference alert */}
              {formData.lignesBudget.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Différence Budget Global vs Total Lignes
                    </Typography>
                    <Typography
                      variant="h6"
                      color={totals.differenceGlobalVsLignes >= 0 ? 'success.main' : 'error.main'}
                      sx={{ mt: 0.5 }}
                    >
                      {formatCurrency(totals.differenceGlobalVsLignes)}
                    </Typography>
                    {totals.differenceGlobalVsLignes < 0 && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        ⚠️ Le total des lignes dépasse le budget global !
                      </Alert>
                    )}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Lignes de budget : {formData.lignesBudget.length} ligne(s) | Total : {formatCurrency(totals.totalLignesTTC)}
                    </Typography>
                  </Box>
                </>
              )}
            </Card>
          </Box>
        )

      case 2: // Commission
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                ⚙️ Configuration de la Commission
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Alert severity="info">
              💡 La commission sera calculée sur la base choisie (HT ou TTC) en appliquant le taux défini.
            </Alert>

            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <DecimalInput
                  fullWidth
                  label="Taux de commission (%)"
                  value={formData.tauxCommission}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      tauxCommission: value,
                    })
                  }}
                  decimalPlaces={2}
                  min={0}
                  max={100}
                  helperText="Taux appliqué pour calculer la commission"
                />

                <TextField
                  fullWidth
                  select
                  label="Base de calcul"
                  value={formData.baseCalcul}
                  onChange={handleChange('baseCalcul')}
                >
                  <MenuItem value="DECAISSEMENTS_HT">Décaissements HT - Hors taxes</MenuItem>
                  <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC - Toutes taxes comprises</MenuItem>
                </TextField>

                <DecimalInput
                  fullWidth
                  label="Taux TVA (%)"
                  value={formData.tauxTva}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      tauxTva: value,
                    })
                  }}
                  decimalPlaces={2}
                  min={0}
                  max={100}
                  helperText="Taux de TVA applicable"
                />
              </Box>
            </Card>

            {/* Preview calcul */}
            <Card sx={{ p: 3, bgcolor: '#f0fdf4', border: '2px solid #22c55e' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                📊 Aperçu du calcul de commission
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Base de calcul
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formData.baseCalcul === 'DECAISSEMENTS_HT' ? 'Décaissements HT' : 'Décaissements TTC'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Taux appliqué
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formData.tauxCommission}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Commission estimée
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>
                    {formatCurrency(totals.commissionEstimee)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )

      case 3: // Partenaires
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                🤝 Allocation aux partenaires
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Alert severity="info">
              💡 Ajouter les partenaires et allouer des budgets. Le total ne doit pas dépasser le budget global.
            </Alert>

            {/* Add partenaire form */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Ajouter un partenaire
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
                  gap: 1,
                  alignItems: 'flex-end',
                }}
              >
                <TextField
                  size="small"
                  label="Nom du partenaire"
                  value={newPartenaire.designation}
                  onChange={(e) => setNewPartenaire({ ...newPartenaire, designation: e.target.value })}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Budget"
                  value={newPartenaire.budget}
                  onChange={(e) =>
                    setNewPartenaire({
                      ...newPartenaire,
                      budget: parseFloat(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="%"
                  value={newPartenaire.pourcentage}
                  onChange={(e) =>
                    setNewPartenaire({
                      ...newPartenaire,
                      pourcentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0, max: 100 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="CI (%)"
                  value={newPartenaire.ci}
                  onChange={(e) =>
                    setNewPartenaire({
                      ...newPartenaire,
                      ci: parseFloat(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddPartenaire}
                  sx={{ height: 40 }}
                >
                  Ajouter
                </Button>
              </Box>
            </Card>

            {/* Partenaires table */}
            {formData.partenaires.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Partenaire</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Budget
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        %
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        CI (%)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.partenaires.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{p.designation}</TableCell>
                        <TableCell align="right">{formatCurrency(p.budget)}</TableCell>
                        <TableCell align="right">{p.pourcentage.toFixed(2)}%</TableCell>
                        <TableCell align="right">{p.ci}%</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeletePartenaire(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Summary */}
            <Card sx={{ p: 2, bgcolor: '#f0f9ff' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Budget total
                  </Typography>
                  <Typography variant="h6">{formatCurrency(formData.budgetGlobal)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total alloué
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(totals.totalPartenaires)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Restant
                  </Typography>
                  <Typography
                    variant="h6"
                    color={
                      formData.budgetGlobal - totals.totalPartenaires >= 0 ? 'success.main' : 'error.main'
                    }
                  >
                    {formatCurrency(formData.budgetGlobal - totals.totalPartenaires)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )

      case 4: // Subventions
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                💸 Subventions
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Alert severity="info">
              💡 Enregistrer les subventions obtenues ou prévues pour cette convention.
            </Alert>

            {/* Add subvention form */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Ajouter une subvention
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
                  gap: 1,
                  alignItems: 'flex-end',
                }}
              >
                <TextField
                  size="small"
                  label="Organisme"
                  value={newSubvention.organisme}
                  onChange={(e) => setNewSubvention({ ...newSubvention, organisme: e.target.value })}
                  placeholder="Nom de l'organisme"
                />
                <TextField
                  size="small"
                  type="number"
                  label="Montant"
                  value={newSubvention.montant}
                  onChange={(e) =>
                    setNewSubvention({
                      ...newSubvention,
                      montant: parseFloat(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="%"
                  value={newSubvention.pourcentage}
                  onChange={(e) =>
                    setNewSubvention({
                      ...newSubvention,
                      pourcentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0, max: 100 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Date obtention"
                  value={newSubvention.dateObtention}
                  onChange={(e) => setNewSubvention({ ...newSubvention, dateObtention: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddSubvention}
                  sx={{ height: 40 }}
                >
                  Ajouter
                </Button>
              </Box>
            </Card>

            {/* Subventions table */}
            {formData.subventions.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Organisme</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Montant
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        %
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Date obtention
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.subventions.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{s.organisme}</TableCell>
                        <TableCell align="right">{formatCurrency(s.montant)}</TableCell>
                        <TableCell align="right">{s.pourcentage.toFixed(2)}%</TableCell>
                        <TableCell align="right">
                          {new Date(s.dateObtention).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeleteSubvention(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Summary */}
            {formData.subventions.length > 0 && (
              <Card sx={{ p: 2, bgcolor: '#f0fdf4' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nombre de subventions
                    </Typography>
                    <Typography variant="h6">{formData.subventions.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total subventions
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(totals.totalSubventions)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}
          </Box>
        )

      case 5: // Récapitulatif
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                ✅ Récapitulatif complet
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Section 1: Identité */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                📋 Identité de la convention
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Code
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formData.code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Numéro
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formData.numeroConvention || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formData.type === 'CADRE' ? '🔴 CADRE' : '🔵 NON_CADRE'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Section 2: Budget & Commission */}
            <Paper sx={{ p: 3, bgcolor: '#f0f9ff' }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                💰 Budget & Commission
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Budget Global
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                    {formatCurrency(formData.budgetGlobal)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Lignes de budget
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formData.lignesBudget.length} ligne(s)
                  </Typography>
                  {formData.lignesBudget.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Total: {formatCurrency(totals.totalLignesTTC)}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Taux Commission
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formData.tauxCommission}% ({formData.baseCalcul})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Commission Estimée
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>
                    {formatCurrency(totals.commissionEstimee)}
                  </Typography>
                </Box>
              </Box>

              {formData.lignesBudget.length > 0 && totals.differenceGlobalVsLignes !== 0 && (
                <Alert
                  severity={totals.differenceGlobalVsLignes >= 0 ? 'info' : 'warning'}
                  sx={{ mt: 2 }}
                >
                  Différence Budget Global vs Total Lignes : {formatCurrency(totals.differenceGlobalVsLignes)}
                </Alert>
              )}
            </Paper>

            {/* Section 3: Partenaires */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                🤝 Partenaires
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Nombre de partenaires
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formData.partenaires.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total alloué
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formatCurrency(totals.totalPartenaires)} (
                    {((totals.totalPartenaires / formData.budgetGlobal) * 100 || 0).toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Section 4: Subventions */}
            {formData.subventions.length > 0 && (
              <Paper sx={{ p: 3, bgcolor: '#f0fdf4' }}>
                <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                  💸 Subventions
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Nombre de subventions
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.subventions.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Total subventions
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formatCurrency(totals.totalSubventions)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Section 5: Dates */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                📅 Période
              </Typography>
              <Typography variant="body2">
                Du {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                {formData.dateFin && ` au ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Durée : {formData.dureeMois} mois
              </Typography>
            </Paper>

            {/* File upload */}
            <Paper sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                📎 Pièces jointes
              </Typography>
              <FileUploadZone
                files={formData.files}
                onFilesChange={(files) => setFormData({ ...formData, files })}
                maxFiles={10}
                maxSizeMB={10}
                label="Documents de la convention"
              />
            </Paper>
          </Box>
        )

      default:
        return null
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isLoadingConvention) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography variant="h6">Chargement...</Typography>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <SimplePageLayout
        title={isEditing ? 'Modifier la Convention' : 'Nouvelle Convention'}
        subtitle={
          isEditing
            ? 'Modifier la convention en 6 étapes'
            : 'Créer une convention CADRE ou NON_CADRE en 6 étapes'
        }
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => (isEditing ? navigate(`/conventions/${id}`) : navigate('/conventions'))}
            size={isMobile ? 'small' : 'medium'}
          >
            Retour
          </Button>
        }
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper
            elevation={8}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
            }}
          >
            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 4,
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                },
              }}
              orientation={isMobile ? 'vertical' : 'horizontal'}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {/* Step Content */}
            <Box sx={{ minHeight: { xs: 300, md: 450 }, mb: 4 }}>{renderStepContent(activeStep)}</Box>

            <Divider sx={{ mb: 3 }} />

            {/* Navigation Buttons */}
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                fullWidth={isMobile}
              >
                Précédent
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || createMutation.isPending || updateMutation.isPending}
                endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
                fullWidth={isMobile}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isEditing
                    ? 'Modification...'
                    : 'Création...'
                  : activeStep === steps.length - 1
                  ? isEditing
                    ? 'Modifier la convention'
                    : 'Créer la convention'
                  : 'Suivant'}
              </Button>
            </Stack>

            {/* Info Alert */}
            {activeStep === steps.length - 1 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                ℹ️{' '}
                {isEditing
                  ? 'Après la modification, vous serez redirigé vers la page de détail.'
                  : 'Après la création, vous pourrez ajouter des sous-conventions, des avenants, et gérer les allocations détaillées à partir de la page de détail.'}
              </Alert>
            )}

            {/* Error Alert */}
            {(createMutation.error || updateMutation.error) && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {(createMutation.error as Error)?.message ||
                  (updateMutation.error as Error)?.message ||
                  (isEditing
                    ? 'Erreur lors de la modification de la convention'
                    : 'Erreur lors de la création de la convention')}
              </Alert>
            )}
          </Paper>
        </Container>
      </SimplePageLayout>
    </AppLayout>
  )
}

export default ConventionWizardComplete
