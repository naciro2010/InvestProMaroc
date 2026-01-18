import { useState, useEffect } from 'react'
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
  Alert,
  Divider,
  Chip,
  IconButton,
} from '@mui/material'
import { ArrowBack, ArrowForward, Check, Add, Delete } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import { decomptesAPI, marchesAPI } from '../../lib/api'

const steps = ['Informations générales', 'Montants & Retenues', 'Pièces jointes & Confirmation']

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface Marche {
  id: number
  code: string
  objet: string
}

interface Retenue {
  type: 'RG' | 'PENALITE' | 'AVANCE' | 'AUTRE'
  montant: number
  description: string
}

interface DecompteFormData {
  numeroDecompte: string
  marcheId: number | null
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  montantBrutHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  retenues: Retenue[]
  totalRetenues: number
  netAPayer: number
  observations: string
  observationsRich: string
  statut: 'BROUILLON' | 'VALIDE' | 'PAYE'
  files: UploadedFile[]
}

const DecompteWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [marches, setMarches] = useState<Marche[]>([])

  const [formData, setFormData] = useState<DecompteFormData>({
    numeroDecompte: '',
    marcheId: null,
    dateDecompte: new Date().toISOString().split('T')[0],
    periodeDebut: '',
    periodeFin: '',
    montantBrutHT: 0,
    tauxTVA: 20,
    montantTVA: 0,
    montantTTC: 0,
    retenues: [],
    totalRetenues: 0,
    netAPayer: 0,
    observations: '',
    observationsRich: '',
    statut: 'BROUILLON',
    files: [],
  })

  // Load marches
  useEffect(() => {
    const loadMarches = async () => {
      try {
        const res = await marchesAPI.getAll()
        setMarches(res.data.data || [])
      } catch (error) {
        console.error('Error loading marches:', error)
      }
    }
    loadMarches()
  }, [])

  // Auto-calculate montants
  useEffect(() => {
    const montantTVA = formData.montantBrutHT * (formData.tauxTVA / 100)
    const montantTTC = formData.montantBrutHT + montantTVA
    const totalRetenues = formData.retenues.reduce((sum, r) => sum + r.montant, 0)
    const netAPayer = montantTTC - totalRetenues

    setFormData(prev => ({
      ...prev,
      montantTVA,
      montantTTC,
      totalRetenues,
      netAPayer
    }))
  }, [formData.montantBrutHT, formData.tauxTVA, formData.retenues])

  // React Query mutation pour la création
  const createMutation = useMutation({
    mutationFn: async (data: DecompteFormData) => {
      const payload = {
        code: data.numeroDecompte,
        montant: data.montantTTC,
        netAPayer: data.netAPayer,
        retenues: data.totalRetenues,
        dateDecompte: data.dateDecompte,
        marcheId: data.marcheId || undefined,
        status: data.statut,
        observation: data.observations,
      }
      return await decomptesAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/decomptes')
    },
  })

  const handleChange = (field: keyof DecompteFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'marcheId'
        ? value ? Number(value) : null
        : field === 'montantBrutHT' || field === 'tauxTVA'
        ? parseFloat(value) || 0
        : value
    })
  }

  const addRetenue = () => {
    setFormData({
      ...formData,
      retenues: [
        ...formData.retenues,
        { type: 'RG', montant: 0, description: '' }
      ]
    })
  }

  const updateRetenue = (index: number, field: keyof Retenue, value: string | number) => {
    const newRetenues = [...formData.retenues]
    newRetenues[index] = {
      ...newRetenues[index],
      [field]: field === 'montant' ? parseFloat(value as string) || 0 : value
    }
    setFormData({ ...formData, retenues: newRetenues })
  }

  const removeRetenue = (index: number) => {
    setFormData({
      ...formData,
      retenues: formData.retenues.filter((_, i) => i !== index)
    })
  }

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
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
      case 0:
        return (
          formData.numeroDecompte &&
          formData.marcheId &&
          formData.dateDecompte &&
          formData.periodeDebut &&
          formData.periodeFin
        )
      case 1:
        return formData.montantBrutHT > 0
      case 2:
        return true
      default:
        return false
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Informations de base
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Numéro de décompte"
                required
                value={formData.numeroDecompte}
                onChange={handleChange('numeroDecompte')}
                placeholder="DEC-001"
              />

              <TextField
                fullWidth
                label="Date du décompte"
                type="date"
                required
                value={formData.dateDecompte}
                onChange={handleChange('dateDecompte')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              select
              label="Marché"
              required
              value={formData.marcheId || ''}
              onChange={handleChange('marcheId')}
            >
              <MenuItem value="">-- Sélectionner un marché --</MenuItem>
              {marches.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.code} - {m.objet.substring(0, 50)}...
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Période couverte
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Début de période"
                type="date"
                required
                value={formData.periodeDebut}
                onChange={handleChange('periodeDebut')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Fin de période"
                type="date"
                required
                value={formData.periodeFin}
                onChange={handleChange('periodeFin')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <RichTextEditor
              label="Observations"
              value={formData.observationsRich}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  observationsRich: value,
                  observations: value.replace(/<[^>]*>/g, '').substring(0, 500),
                })
              }}
              placeholder="Observations sur ce décompte..."
              minHeight={150}
            />

            <TextField
              fullWidth
              select
              label="Statut"
              required
              value={formData.statut}
              onChange={handleChange('statut')}
            >
              <MenuItem value="BROUILLON">Brouillon</MenuItem>
              <MenuItem value="VALIDE">Validé</MenuItem>
              <MenuItem value="PAYE">Payé</MenuItem>
            </TextField>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Montants
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Montant brut HT (DH)"
                type="number"
                required
                value={formData.montantBrutHT}
                onChange={handleChange('montantBrutHT')}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                fullWidth
                label="Taux TVA (%)"
                type="number"
                required
                value={formData.tauxTVA}
                onChange={handleChange('tauxTVA')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />

              <TextField
                fullWidth
                label="Montant TTC (DH)"
                type="number"
                value={formData.montantTTC}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    bgcolor: '#f9fafb',
                    fontWeight: 600,
                    color: '#3b82f6',
                  },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Retenues
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addRetenue}
                >
                  Ajouter une retenue
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {formData.retenues.map((retenue, index) => (
              <Paper key={index} sx={{ p: 2, bgcolor: '#f9fafb' }}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Retenue {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeRetenue(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 2fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      select
                      label="Type"
                      size="small"
                      value={retenue.type}
                      onChange={(e) => updateRetenue(index, 'type', e.target.value)}
                    >
                      <MenuItem value="RG">Retenue de garantie</MenuItem>
                      <MenuItem value="PENALITE">Pénalité</MenuItem>
                      <MenuItem value="AVANCE">Avance</MenuItem>
                      <MenuItem value="AUTRE">Autre</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      label="Montant (DH)"
                      type="number"
                      size="small"
                      value={retenue.montant}
                      onChange={(e) => updateRetenue(index, 'montant', e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                    />

                    <TextField
                      fullWidth
                      label="Description"
                      size="small"
                      value={retenue.description}
                      onChange={(e) => updateRetenue(index, 'description', e.target.value)}
                    />
                  </Box>
                </Box>
              </Paper>
            ))}

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                Résumé financier
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary">
                    Montant brut HT
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montantBrutHT)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary">
                    TVA ({formData.tauxTVA}%)
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montantTVA)}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary">
                    Montant TTC
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montantTTC)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="error">
                    Total retenues
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="error">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.totalRetenues)}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    Net à payer
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight={700}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.netAPayer)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Pièces jointes
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <FileUploadZone
              files={formData.files}
              onFilesChange={(files) => setFormData({ ...formData, files })}
              maxFiles={10}
              maxSizeMB={10}
              label="Documents du décompte"
            />

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
                Récapitulatif
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Numéro de décompte
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.numeroDecompte}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(formData.dateDecompte).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Marché
                  </Typography>
                  <Typography variant="body1">
                    {marches.find(m => m.id === formData.marcheId)?.code || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Période
                  </Typography>
                  <Typography variant="body1">
                    Du {new Date(formData.periodeDebut).toLocaleDateString('fr-FR')}
                    {' au '}
                    {new Date(formData.periodeFin).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Montant TTC
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.montantTTC)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Net à payer
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.netAPayer)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nombre de retenues
                    </Typography>
                    <Typography variant="body1">
                      {formData.retenues.length} retenue(s)
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip
                      label={formData.statut}
                      size="small"
                      color={formData.statut === 'VALIDE' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pièces jointes
                  </Typography>
                  <Typography variant="body1">
                    {formData.files.length} fichier(s)
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {createMutation.error && (
              <Alert severity="error">
                {(createMutation.error as any)?.response?.data?.message ||
                  'Erreur lors de la création du décompte'}
              </Alert>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <PageHeader
            title="Nouveau Décompte"
            subtitle="Créer un nouveau décompte en 3 étapes"
            actions={
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/decomptes')}
              >
                Retour
              </Button>
            }
          />

          <Paper sx={{ p: 4 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: 400, mb: 4 }}>{renderStepContent(activeStep)}</Box>

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 3,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Précédent
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || createMutation.isPending}
                endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
              >
                {createMutation.isPending
                  ? 'Création...'
                  : activeStep === steps.length - 1
                  ? 'Créer le décompte'
                  : 'Suivant'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default DecompteWizard
