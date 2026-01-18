import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Check,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { SimplePageLayout } from '../../components/layout/PageLayout'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import { conventionsAPI } from '../../lib/api'

const steps = [
  'Informations générales',
  'Paramètres financiers',
  'Partenaires',
  'Autorités de maîtrise',
  'Imputations provisionnelles',
  'Versements prévisionels',
  'Pièces jointes & Confirmation',
]

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface Partenaire {
  id?: string
  designation: string
  budget: number
  pourcentage: number
  tauxCI: number
}

interface MO {
  id?: string
  designation: string
  contact?: string
}

interface Imputation {
  id?: string
  axe: string
  projet: string
  volet: string
  dateDebut: string
  delai: number
  dateFin: string
}

interface Versement {
  id?: string
  axe: string
  projet: string
  volet: string
  date: string
  montant: number
  partenaire: string
  mod: string
}

interface ConventionFormData {
  code: string
  numeroConvention: string
  libelle: string
  objet: string
  objetRich: string
  type: 'CADRE' | 'NON_CADRE'
  statut: 'BROUILLON'
  tauxCommission: number
  baseCalcul: 'MONTANT_TTC' | 'MONTANT_HT'
  montant: number
  dateSignature: string
  dateDebut: string
  dateFin: string
  tauxTva: number
  partenaires: Partenaire[]
  mo: MO[]
  mod: MO[]
  imputations: Imputation[]
  versements: Versement[]
  files: UploadedFile[]
}

// Helper Components for Adding Rows
interface AddPartenaireFormProps {
  onAdd: (partenaire: Partenaire) => void
  maxBudget: number
}

const AddPartenaireForm = ({ onAdd, maxBudget }: AddPartenaireFormProps) => {
  const [formData, setFormData] = useState({
    designation: '',
    budget: 0,
    pourcentage: 0,
    tauxCI: 0,
  })

  const handleSubmit = () => {
    if (formData.designation && formData.budget > 0) {
      onAdd({
        designation: formData.designation,
        budget: formData.budget,
        pourcentage: formData.pourcentage,
        tauxCI: formData.tauxCI,
      })
      setFormData({ designation: '', budget: 0, pourcentage: 0, tauxCI: 0 })
    }
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' }, gap: 1, alignItems: 'flex-end' }}>
      <TextField
        size="small"
        placeholder="Nom du partenaire"
        value={formData.designation}
        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
      />
      <TextField
        size="small"
        type="number"
        placeholder="Budget"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
        inputProps={{ min: 0 }}
      />
      <TextField
        size="small"
        type="number"
        placeholder="%"
        value={formData.pourcentage}
        onChange={(e) => setFormData({ ...formData, pourcentage: parseFloat(e.target.value) || 0 })}
        inputProps={{ min: 0, max: 100 }}
      />
      <TextField
        size="small"
        type="number"
        placeholder="Taux CI %"
        value={formData.tauxCI}
        onChange={(e) => setFormData({ ...formData, tauxCI: parseFloat(e.target.value) || 0 })}
        inputProps={{ min: 0 }}
      />
      <Button variant="contained" size="small" onClick={handleSubmit}>
        Ajouter
      </Button>
    </Box>
  )
}

interface AddMOFormProps {
  onAdd: (mo: MO) => void
}

const AddMOForm = ({ onAdd }: AddMOFormProps) => {
  const [formData, setFormData] = useState({ designation: '', contact: '' })

  const handleSubmit = () => {
    if (formData.designation) {
      onAdd(formData)
      setFormData({ designation: '', contact: '' })
    }
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1, alignItems: 'flex-end' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Désignation"
        value={formData.designation}
        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
      />
      <TextField
        fullWidth
        size="small"
        placeholder="Contact"
        value={formData.contact}
        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
      />
      <Button variant="contained" size="small" onClick={handleSubmit}>
        Ajouter
      </Button>
    </Box>
  )
}

interface AddMODFormProps {
  onAdd: (mod: MO) => void
}

const AddMODForm = ({ onAdd }: AddMODFormProps) => {
  const [formData, setFormData] = useState({ designation: '', contact: '' })

  const handleSubmit = () => {
    if (formData.designation) {
      onAdd(formData)
      setFormData({ designation: '', contact: '' })
    }
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1, alignItems: 'flex-end' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Désignation"
        value={formData.designation}
        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
      />
      <TextField
        fullWidth
        size="small"
        placeholder="Contact"
        value={formData.contact}
        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
      />
      <Button variant="contained" size="small" onClick={handleSubmit}>
        Ajouter
      </Button>
    </Box>
  )
}

interface AddImputationFormProps {
  onAdd: (imputation: Imputation) => void
}

const AddImputationForm = ({ onAdd }: AddImputationFormProps) => {
  const [formData, setFormData] = useState({
    axe: '',
    projet: '',
    volet: '',
    dateDebut: '',
    delai: 0,
    dateFin: '',
  })

  const handleSubmit = () => {
    if (formData.axe && formData.projet && formData.volet) {
      onAdd(formData)
      setFormData({ axe: '', projet: '', volet: '', dateDebut: '', delai: 0, dateFin: '' })
    }
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, 1fr)' }, gap: 1, alignItems: 'flex-end' }}>
      <TextField size="small" placeholder="Axe" value={formData.axe} onChange={(e) => setFormData({ ...formData, axe: e.target.value })} />
      <TextField size="small" placeholder="Projet" value={formData.projet} onChange={(e) => setFormData({ ...formData, projet: e.target.value })} />
      <TextField size="small" placeholder="Volet" value={formData.volet} onChange={(e) => setFormData({ ...formData, volet: e.target.value })} />
      <TextField
        size="small"
        type="date"
        value={formData.dateDebut}
        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        type="number"
        placeholder="Délai (j)"
        value={formData.delai}
        onChange={(e) => setFormData({ ...formData, delai: parseInt(e.target.value) || 0 })}
      />
      <TextField
        size="small"
        type="date"
        value={formData.dateFin}
        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <Button variant="contained" size="small" onClick={handleSubmit}>
        Ajouter
      </Button>
    </Box>
  )
}

interface AddVersementFormProps {
  partenaires: string[]
  mods: string[]
  onAdd: (versement: Versement) => void
}

const AddVersementForm = ({ partenaires, mods, onAdd }: AddVersementFormProps) => {
  const [formData, setFormData] = useState({
    axe: '',
    projet: '',
    volet: '',
    date: '',
    montant: 0,
    partenaire: '',
    mod: '',
  })

  const handleSubmit = () => {
    if (formData.axe && formData.projet && formData.volet && formData.montant > 0) {
      onAdd(formData)
      setFormData({ axe: '', projet: '', volet: '', date: '', montant: 0, partenaire: '', mod: '' })
    }
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(8, 1fr)' }, gap: 1, alignItems: 'flex-end' }}>
      <TextField size="small" placeholder="Axe" value={formData.axe} onChange={(e) => setFormData({ ...formData, axe: e.target.value })} />
      <TextField size="small" placeholder="Projet" value={formData.projet} onChange={(e) => setFormData({ ...formData, projet: e.target.value })} />
      <TextField size="small" placeholder="Volet" value={formData.volet} onChange={(e) => setFormData({ ...formData, volet: e.target.value })} />
      <TextField
        size="small"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        type="number"
        placeholder="Montant"
        value={formData.montant}
        onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
      />
      <TextField
        select
        size="small"
        value={formData.partenaire}
        onChange={(e) => setFormData({ ...formData, partenaire: e.target.value })}
      >
        <MenuItem value="">Partenaire</MenuItem>
        {partenaires.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        value={formData.mod}
        onChange={(e) => setFormData({ ...formData, mod: e.target.value })}
      >
        <MenuItem value="">MOD</MenuItem>
        {mods.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" size="small" onClick={handleSubmit}>
        Ajouter
      </Button>
    </Box>
  )
}

const ConventionWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState<ConventionFormData>({
    code: '',
    numeroConvention: '',
    libelle: '',
    objet: '',
    objetRich: '',
    type: 'CADRE',
    statut: 'BROUILLON',
    tauxCommission: 3.5,
    baseCalcul: 'MONTANT_TTC',
    montant: 0,
    dateSignature: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    tauxTva: 20,
    partenaires: [],
    mo: [],
    mod: [],
    imputations: [],
    versements: [],
    files: [],
  })

  // React Query mutation pour la création
  const createMutation = useMutation({
    mutationFn: async (data: ConventionFormData) => {
      const payload = {
        code: data.code,
        objet: data.objet,
        objetRich: data.objetRich,
        type: data.type,
        tauxCommission: data.tauxCommission,
        budgetTotal: data.montant,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        tauxTva: data.tauxTva,
        baseCalcul: data.baseCalcul,
        numeroConvention: data.numeroConvention,
        designation: data.libelle,
        dateSignature: data.dateSignature,
      }
      return await conventionsAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/conventions')
    },
  })

  const handleChange = (field: keyof ConventionFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Create the convention with core fields only
      createMutation.mutate(formData)
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Informations générales
        return (
          formData.code &&
          formData.numeroConvention &&
          formData.libelle &&
          formData.objetRich
        )
      case 1: // Paramètres financiers
        return formData.montant > 0 && formData.tauxCommission > 0
      case 2: // Partenaires (optional but should have at least 0)
        return true
      case 3: // MO/MOD (optional)
        return true
      case 4: // Imputations (optional)
        return true
      case 5: // Versements (optional)
        return true
      case 6: // Pièces jointes & Confirmation
        return true
      default:
        return false
    }
  }

  // Calculate summary statistics for recap block
  const calculateRecapData = () => {
    const totalPartenairesBudget = formData.partenaires.reduce(
      (sum, p) => sum + p.budget,
      0
    )
    const remainingBudget = formData.montant - totalPartenairesBudget
    const allocatedPercentage =
      formData.montant > 0
        ? ((totalPartenairesBudget / formData.montant) * 100).toFixed(2)
        : '0'
    const totalVersements = formData.versements.reduce(
      (sum, v) => sum + v.montant,
      0
    )

    return {
      totalPartenairesBudget,
      remainingBudget,
      allocatedPercentage,
      totalVersements,
    }
  }

  const renderStepContent = (step: number) => {
    const recap = calculateRecapData()

    switch (step) {
      case 0: // Informations générales
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Informations de base
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Row 1: Code, Numéro */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Code"
                required
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="CONV-001"
                size="small"
              />
              <TextField
                fullWidth
                label="Numéro de convention"
                required
                value={formData.numeroConvention}
                onChange={handleChange('numeroConvention')}
                placeholder="N°2024/001"
                size="small"
              />
            </Box>

            {/* Row 2: Type de convention */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Type de convention"
                required
                value={formData.type}
                onChange={handleChange('type')}
                size="small"
              >
                <MenuItem value="CADRE">CADRE - Convention cadre</MenuItem>
                <MenuItem value="NON_CADRE">NON_CADRE - Convention simple</MenuItem>
              </TextField>
            </Box>

            {/* Info message */}
            <Alert severity="info" sx={{ mt: 1 }}>
              {formData.type === 'CADRE'
                ? '📌 Convention CADRE - Sert de base et vous pourrez ajouter des sous-conventions après création.'
                : '📋 Convention NON_CADRE - Convention simple et directe.'}
            </Alert>

            {/* Row 3: Libellé */}
            <TextField
              fullWidth
              label="Libellé"
              required
              value={formData.libelle}
              onChange={handleChange('libelle')}
              placeholder="Convention de gestion des dépenses d'investissement..."
              multiline
              rows={2}
            />

            {/* Row 4: Objet (Rich Text) */}
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
                    objet: value.replace(/<[^>]*>/g, '').substring(0, 500),
                  })
                }}
                placeholder="Décrivez l'objet de la convention en détail..."
                minHeight={200}
              />
            </Box>
          </Box>
        )

      case 1: // Paramètres financiers
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Section: Paramètres financiers */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Paramètres financiers
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Row 1: Montant, Taux Commission, TVA */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Montant (DH)"
                type="number"
                required
                value={formData.montant}
                onChange={handleChange('montant')}
                inputProps={{ min: 0, step: 0.01 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Taux de commission (%)"
                type="number"
                required
                value={formData.tauxCommission}
                onChange={handleChange('tauxCommission')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Taux TVA (%)"
                type="number"
                value={formData.tauxTva}
                onChange={handleChange('tauxTva')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                size="small"
              />
            </Box>

            {/* Row 2: Base de calcul */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Base de calcul"
                value={formData.baseCalcul}
                onChange={handleChange('baseCalcul')}
                size="small"
              >
                <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
                <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
              </TextField>
            </Box>

            {/* Section: Dates */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Dates
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Row 3: Dates (xs:1, md:3) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
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
                label="Date de début"
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
          </Box>
        )

      case 2: // Partenaires
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Allocation aux partenaires
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Alert severity="info">
              💡 Ajouter les partenaires et allouer des budgets. Le total ne doit pas dépasser {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(formData.montant)}
            </Alert>

            {/* Add Partenaire Section */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Ajouter un partenaire
              </Typography>
              <AddPartenaireForm
                onAdd={(partenaire) => {
                  setFormData({
                    ...formData,
                    partenaires: [...formData.partenaires, partenaire],
                  })
                }}
                maxBudget={recap.remainingBudget}
              />
            </Card>

            {/* Partenaires Table */}
            {formData.partenaires.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Partenaire</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Budget</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Taux CI</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.partenaires.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{p.designation}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('fr-MA', {
                            style: 'currency',
                            currency: 'MAD',
                          }).format(p.budget)}
                        </TableCell>
                        <TableCell align="right">{p.pourcentage.toFixed(2)}%</TableCell>
                        <TableCell align="right">{p.tauxCI}%</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                partenaires: formData.partenaires.filter((_, i) => i !== idx),
                              })
                            }}
                          >
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
            <Card sx={{ p: 2, bgcolor: '#f0f7ff' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Budget total
                  </Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montant)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total alloué
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(recap.totalPartenairesBudget)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Restant
                  </Typography>
                  <Typography
                    variant="h6"
                    color={recap.remainingBudget >= 0 ? 'success.main' : 'error.main'}
                  >
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(recap.remainingBudget)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    % alloué
                  </Typography>
                  <Typography variant="h6">{recap.allocatedPercentage}%</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )

      case 3: // Autorités de maîtrise (MO/MOD)
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Autorités de maîtrise d'ouvrage
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* MO Column */}
              <Box>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Maître d'ouvrage (MO)
                  </Typography>
                  <AddMOForm
                    onAdd={(mo) => {
                      setFormData({
                        ...formData,
                        mo: [...formData.mo, mo],
                      })
                    }}
                  />

                  {formData.mo.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {formData.mo.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.designation}
                            </Typography>
                            {item.contact && (
                              <Typography variant="caption" color="text.secondary">
                                {item.contact}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                mo: formData.mo.filter((_, i) => i !== idx),
                              })
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Card>
              </Box>

              {/* MOD Column */}
              <Box>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Maître d'ouvrage Délégué (MOD)
                  </Typography>
                  <AddMODForm
                    onAdd={(mod) => {
                      setFormData({
                        ...formData,
                        mod: [...formData.mod, mod],
                      })
                    }}
                  />

                  {formData.mod.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {formData.mod.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.designation}
                            </Typography>
                            {item.contact && (
                              <Typography variant="caption" color="text.secondary">
                                {item.contact}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                mod: formData.mod.filter((_, i) => i !== idx),
                              })
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Card>
              </Box>
            </Box>

            {/* Summary */}
            <Card sx={{ p: 2, bgcolor: '#f0f7ff' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Maîtres d'ouvrage
                  </Typography>
                  <Typography variant="h6">{formData.mo.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Maîtres d'ouvrage Délégués
                  </Typography>
                  <Typography variant="h6">{formData.mod.length}</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )

      case 4: // Imputations provisionnelles
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Imputations provisionnelles
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Ajouter une imputation
              </Typography>
              <AddImputationForm
                onAdd={(imputation) => {
                  setFormData({
                    ...formData,
                    imputations: [...formData.imputations, imputation],
                  })
                }}
              />
            </Card>

            {formData.imputations.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Axe</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Projet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Volet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Démarrage</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Délai (j)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fin</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.imputations.map((imp, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{imp.axe}</TableCell>
                        <TableCell>{imp.projet}</TableCell>
                        <TableCell>{imp.volet}</TableCell>
                        <TableCell>{imp.dateDebut}</TableCell>
                        <TableCell align="right">{imp.delai}</TableCell>
                        <TableCell>{imp.dateFin}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                imputations: formData.imputations.filter((_, i) => i !== idx),
                              })
                            }}
                          >
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
            <Card sx={{ p: 2, bgcolor: '#f0f7ff' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total d'imputations
                  </Typography>
                  <Typography variant="h6">{formData.imputations.length}</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )

      case 5: // Versements prévisionels
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Versements prévisionels
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Ajouter un versement
              </Typography>
              <AddVersementForm
                partenaires={formData.partenaires.map((p) => p.designation)}
                mods={formData.mod.map((m) => m.designation)}
                onAdd={(versement) => {
                  setFormData({
                    ...formData,
                    versements: [...formData.versements, versement],
                  })
                }}
              />
            </Card>

            {formData.versements.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Axe</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Projet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Volet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Partenaire</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>MOD</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.versements.map((vers, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{vers.axe}</TableCell>
                        <TableCell>{vers.projet}</TableCell>
                        <TableCell>{vers.volet}</TableCell>
                        <TableCell>{vers.date}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('fr-MA', {
                            style: 'currency',
                            currency: 'MAD',
                          }).format(vers.montant)}
                        </TableCell>
                        <TableCell>{vers.partenaire}</TableCell>
                        <TableCell>{vers.mod}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                versements: formData.versements.filter((_, i) => i !== idx),
                              })
                            }}
                          >
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
            <Card sx={{ p: 2, bgcolor: '#f0f7ff' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total versements prévus
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(recap.totalVersements)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nombre de versements
                  </Typography>
                  <Typography variant="h6">{formData.versements.length}</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )

      case 6: // Pièces jointes & Confirmation
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📎 Pièces jointes
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', borderRadius: 2 }}>
              <FileUploadZone
                files={formData.files}
                onFilesChange={(files) => setFormData({ ...formData, files })}
                maxFiles={10}
                maxSizeMB={10}
                label="Documents de la convention"
              />
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                ✅ Récapitulatif complet
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 } }}>
                {/* Section 1: Identité */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                    📋 Identité de la convention
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
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
                        {formData.numeroConvention}
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
                </Box>

                <Divider />

                {/* Section 2: Finances */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                    💰 Paramètres financiers
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Montant total
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                        {new Intl.NumberFormat('fr-MA', {
                          style: 'currency',
                          currency: 'MAD',
                        }).format(formData.montant)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Taux commission
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formData.tauxCommission}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Taux TVA
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formData.tauxTva}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Section 3: Allocations */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                    🤝 Allocations partenaires
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
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
                        {new Intl.NumberFormat('fr-MA', {
                          style: 'currency',
                          currency: 'MAD',
                        }).format(recap.totalPartenairesBudget)}{' '}
                        ({recap.allocatedPercentage}%)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Section 4: Autorités */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                    👨‍💼 Autorités de maîtrise
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Maîtres d'ouvrage (MO)
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formData.mo.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Maîtres d'ouvrage Délégués (MOD)
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formData.mod.length}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Section 5: Versements */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                    💵 Versements
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Total versements prévus
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                        {new Intl.NumberFormat('fr-MA', {
                          style: 'currency',
                          currency: 'MAD',
                        }).format(recap.totalVersements)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Nombre de versements
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formData.versements.length}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Section 6: Dates & Pièces */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                    📅 Période & Pièces jointes
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Période
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Du {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                        {formData.dateFin && ` au ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}`}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Pièces jointes
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formData.files.length} fichier(s)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )

      default:
        return null
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <AppLayout>
      <SimplePageLayout
        title="Nouvelle Convention"
        subtitle="Créer une convention CADRE ou SPECIFIQUE en 7 étapes"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/conventions')}
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
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)'
            }}
          >
            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 4,
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }
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
            <Box sx={{ minHeight: { xs: 300, md: 450 }, mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

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
                disabled={!isStepValid() || createMutation.isPending}
                endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
                fullWidth={isMobile}
              >
                {createMutation.isPending
                  ? 'Création...'
                  : activeStep === steps.length - 1
                  ? 'Créer la convention'
                  : 'Suivant'}
              </Button>
            </Stack>

            {/* Info Alert */}
            {activeStep === steps.length - 1 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                ℹ️ Après la création, vous pourrez ajouter des sous-conventions, des avenants, et gérer les allocations détaillées à partir de la page de détail.
              </Alert>
            )}

            {/* Error Alert */}
            {createMutation.error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {(createMutation.error as any)?.response?.data?.message ||
                  'Erreur lors de la création de la convention'}
              </Alert>
            )}
          </Paper>
        </Container>
      </SimplePageLayout>
    </AppLayout>
  )
}

export default ConventionWizard
