import { useState } from 'react'
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
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Save,
  CheckCircle,
  Add,
  Delete,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { conventionsAPI } from '../../lib/api'

// Types
interface Partenaire {
  id?: string
  role: 'MOA' | 'MOD' | 'BAILLEUR'
  nom: string
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

  // Étape 4: Partenaires
  partenaires: Partenaire[]

  // Étape 5: Subventions
  subventions: Subvention[]
}

const steps = [
  'Informations de base',
  'Budget & Montants',
  'Commission',
  'Partenaires',
  'Subventions',
  'Récapitulatif',
]

const ConventionWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

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
  })

  const handleNext = () => {
    const validationErrors = validateStep(activeStep)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
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

      case 1: // Budget & Montants
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
        break
    }

    return errors
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setErrors([])

      // Préparer les données pour l'API
      const payload = {
        numero: formData.numero,
        code: formData.code,
        libelle: formData.libelle,
        typeConvention: formData.typeConvention,
        statut: 'BROUILLON', // Toujours créer en BROUILLON selon le workflow
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
      setErrors([error.response?.data?.message || 'Erreur lors de la création de la convention'])
    } finally {
      setLoading(false)
    }
  }

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
          // Recalculer TTC si HT ou TVA change
          if (field === 'montantHT' || field === 'tauxTVA') {
            updated.montantTTC = updated.montantHT * (1 + updated.tauxTVA / 100)
          }
          return updated
        }
        return ligne
      }),
    })
  }

  const addPartenaire = () => {
    setFormData({
      ...formData,
      partenaires: [
        ...formData.partenaires,
        {
          id: crypto.randomUUID(),
          role: 'MOA',
          nom: '',
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
      partenaires: formData.partenaires.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    })
  }

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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
              Informations de base
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Numéro"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="CONV-2024-001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CONV001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Libellé"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  placeholder="Convention d'intervention pour..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Objet de la Convention"
                  value={formData.objet}
                  onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                  placeholder="Description détaillée de l'objet de la convention..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
              Budget & Montants
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
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

              <Grid item xs={12}>
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
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Désignation"
                            value={ligne.designation}
                            onChange={(e) => updateLigneBudget(ligne.id!, 'designation', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
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
                        <Grid item xs={6} md={2}>
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
                        <Grid item xs={10} md={3}>
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
                        <Grid item xs={2} md={1}>
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

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
              Commission d'Intervention
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Plafond Commission (MAD)"
                  value={formData.plafondCommission || ''}
                  onChange={(e) => setFormData({ ...formData, plafondCommission: parseFloat(e.target.value) || undefined })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Commission (MAD)"
                  value={formData.minimumCommission || ''}
                  onChange={(e) => setFormData({ ...formData, minimumCommission: parseFloat(e.target.value) || undefined })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
              Partenaires
            </Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                Ajoutez les partenaires impliqués (MOA, MOD, Bailleur)
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
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Nom"
                        value={partenaire.nom}
                        onChange={(e) => updatePartenaire(partenaire.id!, 'nom', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="ICE"
                        value={partenaire.ice || ''}
                        onChange={(e) => updatePartenaire(partenaire.id!, 'ice', e.target.value)}
                        placeholder="15 chiffres"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="RC"
                        value={partenaire.rc || ''}
                        onChange={(e) => updatePartenaire(partenaire.id!, 'rc', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="IF"
                        value={partenaire.ifiscale || ''}
                        onChange={(e) => updatePartenaire(partenaire.id!, 'ifiscale', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Représentant"
                        value={partenaire.representant || ''}
                        onChange={(e) => updatePartenaire(partenaire.id!, 'representant', e.target.value)}
                        placeholder="Nom du signataire"
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
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
          </Box>
        )

      case 4:
        return (
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
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Type"
                        value={subvention.type}
                        onChange={(e) => updateSubvention(subvention.id!, 'type', e.target.value)}
                        placeholder="Don, Prêt..."
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={2}>
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
                    <Grid item xs={12} md={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeSubvention(subvention.id!)}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                    <Grid item xs={12}>
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

      case 5:
        return (
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
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Type</Typography>
                    <Typography variant="body1" fontWeight={600}>{formData.typeConvention}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Numéro</Typography>
                    <Typography variant="body1" fontWeight={600}>{formData.numero}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Code</Typography>
                    <Typography variant="body1" fontWeight={600}>{formData.code}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(formData.dateConvention).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Libellé</Typography>
                    <Typography variant="body1">{formData.libelle}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Objet</Typography>
                    <Typography variant="body2" color="text.secondary">{formData.objet}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Budget & Montants
                </Typography>
                <Typography variant="h4" sx={{ color: '#1e40af', fontWeight: 700 }}>
                  {formData.budgetGlobal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                </Typography>
                {formData.lignesBudget.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Détail ({formData.lignesBudget.length} lignes)
                    </Typography>
                    {formData.lignesBudget.map((ligne) => (
                      <Typography key={ligne.id} variant="body2" color="text.secondary">
                        • {ligne.designation}: {ligne.montantTTC.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                      </Typography>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Commission */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Commission d'Intervention
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Base</Typography>
                    <Typography variant="body1" fontWeight={600}>{formData.baseCommission}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mode</Typography>
                    <Typography variant="body1" fontWeight={600}>{formData.modeCommission}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Taux</Typography>
                    <Typography variant="body1" fontWeight={600}>{formData.tauxCommission}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Commission estimée</Typography>
                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                      {(formData.budgetGlobal * formData.tauxCommission / 100).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                    </Typography>
                  </Box>
                </Stack>
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
                    label={`${p.role}: ${p.nom}`}
                    sx={{ mr: 1, mb: 1 }}
                    color={p.role === 'MOA' ? 'primary' : p.role === 'MOD' ? 'secondary' : 'default'}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Subventions */}
            {formData.subventions.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Subventions ({formData.subventions.length})
                  </Typography>
                  {formData.subventions.map((s) => (
                    <Typography key={s.id} variant="body2" color="text.secondary">
                      • {s.organisme}: {s.montant.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })} ({s.type})
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>Important:</strong> La convention sera créée avec le statut <strong>BROUILLON</strong>.
              Vous pourrez la soumettre à validation après vérification.
            </Alert>
          </Box>
        )

      default:
        return null
    }
  }

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
                Créez une nouvelle convention en suivant les étapes ci-dessous
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
            <Typography variant="subtitle2" fontWeight={600}>Veuillez corriger les erreurs suivantes:</Typography>
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

export default ConventionWizard
