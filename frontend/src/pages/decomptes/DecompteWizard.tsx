import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Stack,
} from '@mui/material'
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { decomptesAPI } from '../../lib/api'
import Step1InfoDecompte from './wizard/Step1InfoDecompte'
import Step2Retenues from './wizard/Step2Retenues'
import Step3Imputations from './wizard/Step3Imputations'
import { StatutDecompte, TypeRetenue } from '../../types/entities'
import colors from '../../theme/colors'

export interface DecompteRetenue {
  typeRetenue: TypeRetenue
  montant: number
  tauxPourcent?: number
  libelle?: string
}

export interface DecompteImputation {
  projetId?: number
  axeId?: number
  budgetId?: number
  montant: number
  description?: string
}

export interface DecompteFormData {
  // Step 1: Info générale
  numeroDecompte: string
  marcheId: number | null
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  statut: StatutDecompte
  observations: string

  // Montants
  montantBrutHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number

  // Cumul
  cumulPrecedent: number
  cumulActuel: number
  tauxAvancement: number

  // Step 2: Retenues
  retenues: DecompteRetenue[]
  totalRetenues: number
  netAPayer: number

  // Step 3: Imputations
  imputations: DecompteImputation[]
}

const steps = ['Informations Générales', 'Retenues & Calculs', 'Imputations Analytiques']

const DecompteWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<DecompteFormData>({
    numeroDecompte: '',
    marcheId: null,
    dateDecompte: new Date().toISOString().split('T')[0],
    periodeDebut: '',
    periodeFin: '',
    statut: 'BROUILLON',
    observations: '',

    montantBrutHT: 0,
    tauxTVA: 20,
    montantTVA: 0,
    montantTTC: 0,

    cumulPrecedent: 0,
    cumulActuel: 0,
    tauxAvancement: 0,

    retenues: [],
    totalRetenues: 0,
    netAPayer: 0,

    imputations: [],
  })

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.numeroDecompte) {
          alert('Le numéro de décompte est obligatoire')
          return false
        }
        if (!formData.marcheId) {
          alert('Veuillez sélectionner un marché')
          return false
        }
        if (!formData.periodeDebut || !formData.periodeFin) {
          alert('Veuillez renseigner la période')
          return false
        }
        return true
      case 1:
        return true
      case 2:
        const totalImputations = formData.imputations.reduce((sum, imp) => sum + imp.montant, 0)
        if (Math.abs(totalImputations - formData.netAPayer) > 0.01 && formData.netAPayer > 0) {
          alert(
            `Total imputations (${totalImputations.toLocaleString('fr-FR')} DH) doit égaler le net à payer (${formData.netAPayer.toLocaleString('fr-FR')} DH)`
          )
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return

    try {
      const payload = {
        code: formData.numeroDecompte,
        numero: formData.numeroDecompte,
        marcheId: formData.marcheId ?? undefined,
        dateDecompte: formData.dateDecompte,
        montant: formData.montantTTC,
        netAPayer: formData.netAPayer,
        retenues: formData.totalRetenues,
        montantRetenue: formData.totalRetenues,
        observation: formData.observations,
      }

      await decomptesAPI.create(payload)
      navigate('/decomptes')
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du décompte')
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1InfoDecompte formData={formData} setFormData={setFormData} />
      case 1:
        return <Step2Retenues formData={formData} setFormData={setFormData} />
      case 2:
        return <Step3Imputations formData={formData} setFormData={setFormData} />
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.warning[600]} 0%, ${colors.warning[700]} 100%)`,
              color: 'white',
              borderRadius: '16px 16px 0 0',
              p: 4,
              mb: 0,
            }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/decomptes')}
              sx={{
                color: 'white',
                mb: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Retour
            </Button>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Nouveau Décompte
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Créez un décompte avec retenues détaillées et imputations analytiques
            </Typography>
          </Box>

          <Paper
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: '0 0 16px 16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
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
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#4b5563',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    borderColor: '#9ca3af',
                  },
                }}
              >
                Précédent
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/decomptes')}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                  }}
                >
                  Annuler
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.warning[600]} 0%, ${colors.warning[700]} 100%)`,
                      boxShadow: '0 4px 15px rgba(244, 114, 182, 0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(244, 114, 182, 0.6)',
                      },
                    }}
                  >
                    Créer le Décompte
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleNext}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.warning[600]} 0%, ${colors.warning[700]} 100%)`,
                    }}
                  >
                    Suivant
                  </Button>
                )}
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default DecompteWizard
