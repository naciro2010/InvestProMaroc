import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'
import Step1Informations from './wizard/Step1Informations'
import Step2DatesEtBudget from './wizard/Step2DatesEtBudget'
import Step3PiecesJointes from './wizard/Step3PiecesJointes'
import Step4Recapitulatif from './wizard/Step4Recapitulatif'
import { ConventionFormData } from './types'

const steps = [
  'Informations générales',
  'Dates et Budget',
  'Pièces jointes',
  'Récapitulatif'
]

const SousConventionWizard = () => {
  const { parentId } = useParams<{ parentId: string }>()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [parentConvention, setParentConvention] = useState<any>(null)
  const [heriteParametres, setHeriteParametres] = useState(true)

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
    typeConvention: 'SPECIFIQUE',
  })

  useEffect(() => {
    if (parentId) {
      loadParentConvention()
    }
  }, [parentId])

  const loadParentConvention = async () => {
    try {
      const { data } = await conventionsAPI.getById(Number(parentId))
      setParentConvention(data.data)

      // Préremplir avec les données du parent si héritage
      if (heriteParametres) {
        setFormData(prev => ({
          ...prev,
          tauxCommission: data.data.tauxCommission.toString(),
          baseCalcul: data.data.baseCalcul,
          tauxTva: data.data.tauxTva.toString(),
        }))
      }
    } catch (error) {
      console.error('Erreur chargement convention parent:', error)
      setError('Impossible de charger la convention parente')
    }
  }

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
        tauxCommission: heriteParametres ? null : parseFloat(formData.tauxCommission),
        baseCalcul: heriteParametres ? null : formData.baseCalcul,
        tauxTva: heriteParametres ? null : parseFloat(formData.tauxTva),
        typeConvention: 'SPECIFIQUE',
        heriteParametres,
      }

      const { data } = await conventionsAPI.createSousConvention(Number(parentId), payload)
      setCreatedId(data.data.id)
      handleNext()
    } catch (err: any) {
      console.error('Erreur création sous-convention:', err)
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    navigate(`/conventions/${parentId}`)
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {parentConvention && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>Convention parente:</strong> {parentConvention.code} - {parentConvention.libelle}
                </Typography>
              </Paper>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={heriteParametres}
                  onChange={(e) => setHeriteParametres(e.target.checked)}
                />
              }
              label="Hériter les paramètres de commission de la convention parente"
              sx={{ mb: 3 }}
            />
            <Step1Informations formData={formData} setFormData={setFormData} />
          </Box>
        )
      case 1:
        return (
          <Box>
            {heriteParametres && parentConvention && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
                <Typography variant="body2">
                  Les paramètres de commission seront hérités de la convention parente
                </Typography>
              </Paper>
            )}
            <Step2DatesEtBudget
              formData={formData}
              setFormData={setFormData}
            />
          </Box>
        )
      case 2:
        return (
          <Step3PiecesJointes
            entityId={createdId}
            typeEntite="SOUS_CONVENTION"
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
        return formData.dateConvention && formData.dateDebut && formData.budget
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
            onClick={() => navigate(`/conventions/${parentId}`)}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Nouvelle Sous-Convention
          </Typography>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            {error}
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper sx={{ p: 4, mb: 3 }}>
          {renderStepContent()}
        </Paper>

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
              createdId ? (
                <Button variant="outlined" onClick={handleFinish}>
                  Passer cette étape
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  startIcon={<Save />}
                >
                  {loading ? 'Enregistrement...' : 'Créer la sous-convention'}
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

export default SousConventionWizard
