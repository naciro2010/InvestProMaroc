import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
} from '@mui/material'
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'
import Step1Informations from './wizard/Step1Informations'
import Step2DatesEtBudget from './wizard/Step2DatesEtBudget'
import Step3PiecesJointes from './wizard/Step3PiecesJointes'
import Step4Recapitulatif from './wizard/Step4Recapitulatif'

const steps = [
  'Informations générales',
  'Dates et Budget',
  'Pièces jointes',
  'Récapitulatif'
]

export interface ConventionFormData {
  code: string
  numero: string
  libelle: string
  objet: string
  typeConvention: string
  dateConvention: string
  dateDebut: string
  dateFin: string
  budget: string
  tauxCommission: string
  baseCalcul: string
  tauxTva: string
}

const ConventionWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  const [formData, setFormData] = useState<ConventionFormData>({
    code: '',
    numero: '',
    libelle: '',
    objet: '',
    dateConvention: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    budget: '',
    tauxCommission: '2.50',
    baseCalcul: 'DECAISSEMENTS_TTC',
    tauxTva: '20.00',
    typeConvention: 'CADRE',
  })

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/\s/g, '').replace(/,/g, '.')
    return parseFloat(cleaned) || 0
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const payload = {
        code: formData.code,
        numero: formData.numero,
        libelle: formData.libelle,
        objet: formData.objet,
        dateConvention: formData.dateConvention,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || null,
        budget: parseNumber(formData.budget),
        tauxCommission: parseFloat(formData.tauxCommission),
        baseCalcul: formData.baseCalcul,
        tauxTva: parseFloat(formData.tauxTva),
        typeConvention: formData.typeConvention,
      }

      const { data } = await conventionsAPI.create(payload)
      setCreatedId(data.data.id)
      handleNext() // Aller à l'étape pièces jointes
    } catch (err: any) {
      console.error('Erreur création convention:', err)
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    navigate('/conventions')
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <Step1Informations formData={formData} setFormData={setFormData} />
      case 1:
        return <Step2DatesEtBudget formData={formData} setFormData={setFormData} />
      case 2:
        return (
          <Step3PiecesJointes
            entityId={createdId}
            typeEntite="CONVENTION"
            onSkip={handleFinish}
          />
        )
      case 3:
        return <Step4Recapitulatif formData={formData} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formData.code && formData.numero && formData.libelle && formData.objet
      case 1:
        return formData.dateConvention && formData.dateDebut && formData.budget && formData.tauxCommission
      case 2:
        return createdId !== null
      default:
        return true
    }
  }

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/conventions')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Nouvelle Convention
          </Typography>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            {error}
          </Paper>
        )}

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Contenu de l'étape */}
        <Paper sx={{ p: 4, mb: 3 }}>
          {renderStepContent()}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Précédent
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleFinish}
                startIcon={<Save />}
              >
                Terminer
              </Button>
            ) : activeStep === steps.length - 2 ? (
              // Étape pièces jointes - créer d'abord la convention
              createdId ? (
                <Button
                  variant="outlined"
                  onClick={handleFinish}
                >
                  Passer cette étape
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  startIcon={<Save />}
                >
                  {loading ? 'Enregistrement...' : 'Créer la convention'}
                </Button>
              )
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed()}
                endIcon={<ArrowForward />}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default ConventionWizard
