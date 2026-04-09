import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material'
import { conventionsAPI } from '../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import Step1Informations from './wizard/Step1Informations'
import Step2DatesEtBudget from './wizard/Step2DatesEtBudget'
import Step3PiecesJointes from './wizard/Step3PiecesJointes'
import Step4Recapitulatif from './wizard/Step4Recapitulatif'
import { ConventionFormData } from './types'
import { colors, typography } from '@/lib/designSystem'

interface ParentConventionInfo {
  id: number
  code: string
  libelle: string
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
}

const steps = [
  { label: 'Informations générales' },
  { label: 'Dates et Budget' },
  { label: 'Pièces jointes' },
  { label: 'Récapitulatif' },
]

const SousConventionWizard = () => {
  const { parentId } = useParams<{ parentId: string }>()
  const navigate = useNavigate()
  const { showError } = useToast()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [parentConvention, setParentConvention] = useState<ParentConventionInfo | null>(null)
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
      const parent = data.data as ParentConventionInfo
      setParentConvention(parent)

      // Préremplir avec les données du parent si héritage
      if (heriteParametres) {
        setFormData(prev => ({
          ...prev,
          tauxCommission: parent.tauxCommission.toString(),
          baseCalcul: parent.baseCalcul,
          tauxTva: parent.tauxTva.toString(),
        }))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de charger la convention parente'
      showError(message)
      setError(message)
    }
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
      setActiveStep(prev => prev + 1)
    } catch (err: unknown) {
      interface ApiError {
        response?: { data?: { message?: string } }
      }
      const apiErr = err as ApiError
      const message = apiErr.response?.data?.message || 'Erreur lors de la création'
      showError(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    navigate(`/conventions/${parentId}`)
  }

  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return !!(formData.code && formData.numero && formData.libelle && formData.objet)
      case 1:
        return !!(formData.dateConvention && formData.dateDebut && formData.budget)
      case 2:
        return createdId !== null
      default:
        return true
    }
  }

  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      // Step before Récapitulatif -- submit the form
      handleSubmit()
    } else if (activeStep === steps.length - 1) {
      // Last step (Récapitulatif) -- finish
      handleFinish()
    } else {
      setActiveStep(prev => prev + 1)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {parentConvention && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Convention parente:</strong> {parentConvention.code} - {parentConvention.libelle}
                </Typography>
              </Alert>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={heriteParametres}
                  onChange={(e) => setHeriteParametres(e.target.checked)}
                />
              }
              label="Hériter les paramètres de commission de la convention parente"
              sx={{
                mb: 3,
                '& .MuiFormControlLabel-label': {
                  fontSize: typography.sizes.sm,
                  color: colors.neutral[700],
                },
              }}
            />
            <Step1Informations formData={formData} setFormData={setFormData} />
          </Box>
        )
      case 1:
        return (
          <Box>
            {heriteParametres && parentConvention && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Les paramètres de commission seront hérités de la convention parente
                </Typography>
              </Alert>
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

  return (
    <AppLayout>
      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
          {error}
        </Alert>
      )}
      <WizardView
        breadcrumbs={[
          { label: 'Conventions', path: '/conventions' },
          { label: parentConvention?.code || '', path: `/conventions/${parentId}` },
          { label: 'Nouvelle Sous-Convention' },
        ]}
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate(`/conventions/${parentId}`)}
        isNextDisabled={!isStepValid()}
        isSubmitting={loading}
        submitLabel="Créer la sous-convention"
      >
        {renderStepContent()}
      </WizardView>
    </AppLayout>
  )
}

export default SousConventionWizard
