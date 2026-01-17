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
} from '@mui/material'
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { conventionsAPI } from '../../lib/api'

const steps = ['Informations générales', 'Paramètres financiers', 'Confirmation']

interface ConventionFormData {
  code: string
  numeroConvention: string
  libelle: string
  objet: string
  type: 'CADRE' | 'SPECIFIQUE'
  tauxCommission: number
  baseCalcul: 'MONTANT_TTC' | 'MONTANT_HT'
  montant: number
  dateSignature: string
  dateDebut: string
  dateFin: string
  tauxTva: number
}

const ConventionWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ConventionFormData>({
    code: '',
    numeroConvention: '',
    libelle: '',
    objet: '',
    type: 'CADRE',
    tauxCommission: 3.5,
    baseCalcul: 'MONTANT_TTC',
    montant: 0,
    dateSignature: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    tauxTva: 20,
  })

  const handleChange = (field: keyof ConventionFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit()
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const payload = {
        code: formData.code,
        objet: formData.objet,
        type: formData.type,
        tauxCommission: formData.tauxCommission,
        budgetTotal: formData.montant,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        tauxTva: formData.tauxTva,
        baseCalcul: formData.baseCalcul,
        numeroConvention: formData.numeroConvention,
        designation: formData.libelle,
        dateSignature: formData.dateSignature,
      }

      await conventionsAPI.create(payload)
      navigate('/conventions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la convention')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.code && formData.numeroConvention && formData.libelle && formData.objet
      case 1:
        return formData.montant > 0 && formData.tauxCommission > 0
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
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Informations de base
            </Typography>

            <TextField
              fullWidth
              label="Code"
              required
              value={formData.code}
              onChange={handleChange('code')}
              placeholder="CONV-001"
            />

            <TextField
              fullWidth
              label="Numéro de convention"
              required
              value={formData.numeroConvention}
              onChange={handleChange('numeroConvention')}
              placeholder="N°2024/001"
            />

            <TextField
              fullWidth
              label="Libellé"
              required
              value={formData.libelle}
              onChange={handleChange('libelle')}
              placeholder="Convention de gestion..."
            />

            <TextField
              fullWidth
              label="Objet"
              required
              multiline
              rows={4}
              value={formData.objet}
              onChange={handleChange('objet')}
              placeholder="Description détaillée de l'objet de la convention..."
            />

            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={handleChange('type')}
            >
              <MenuItem value="CADRE">CADRE - Convention cadre</MenuItem>
              <MenuItem value="SPECIFIQUE">SPECIFIQUE - Convention spécifique</MenuItem>
            </TextField>
          </Stack>
        )

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Paramètres financiers et dates
            </Typography>

            <TextField
              fullWidth
              label="Montant (DH)"
              type="number"
              required
              value={formData.montant}
              onChange={handleChange('montant')}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              fullWidth
              label="Taux de commission (%)"
              type="number"
              required
              value={formData.tauxCommission}
              onChange={handleChange('tauxCommission')}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
            />

            <TextField
              fullWidth
              select
              label="Base de calcul"
              value={formData.baseCalcul}
              onChange={handleChange('baseCalcul')}
            >
              <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
              <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Taux TVA (%)"
              type="number"
              value={formData.tauxTva}
              onChange={handleChange('tauxTva')}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Date de signature"
                type="date"
                value={formData.dateSignature}
                onChange={handleChange('dateSignature')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={formData.dateDebut}
                onChange={handleChange('dateDebut')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                value={formData.dateFin}
                onChange={handleChange('dateFin')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Stack>
        )

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Récapitulatif
            </Typography>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Code
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.code}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Numéro de convention
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.numeroConvention}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Libellé
                  </Typography>
                  <Typography variant="body1">{formData.libelle}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {formData.type === 'CADRE' ? 'Convention cadre' : 'Convention spécifique'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montant)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Taux de commission
                  </Typography>
                  <Typography variant="body1">{formData.tauxCommission}%</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Base de calcul
                  </Typography>
                  <Typography variant="body1">
                    {formData.baseCalcul === 'MONTANT_TTC' ? 'Montant TTC' : 'Montant HT'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Période
                  </Typography>
                  <Typography variant="body1">
                    Du {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                    {formData.dateFin && ` au ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}`}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Stack>
        )

      default:
        return null
    }
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <PageHeader
            title="Nouvelle Convention"
            subtitle="Créer une nouvelle convention en 3 étapes"
            actions={
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/conventions')}>
                Retour
              </Button>
            }
          />

          <Paper sx={{ p: 4, borderRadius: '12px' }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
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
                disabled={!isStepValid() || loading}
                endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
              >
                {activeStep === steps.length - 1 ? 'Créer la convention' : 'Suivant'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionWizard
