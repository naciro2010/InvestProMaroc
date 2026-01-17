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
import AppLayout from '../../components/layout/AppLayout'
import Step1InfoMarche from './wizard/Step1InfoMarche'
import Step2LignesPrix from './wizard/Step2LignesPrix'
import Step3Imputations from './wizard/Step3Imputations'
import { marchesAPI } from '../../lib/api'
import colors from '../../theme/colors'

export interface MarcheFormData {
  // Étape 1: Info Marché
  numeroMarche: string
  numAO: string
  dateMarche: string
  objet: string
  conventionId: number | null
  fournisseurId: number | null
  typePrestation: 'TRAVAUX' | 'FOURNITURES' | 'SERVICES'
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  tauxRG: number // Taux Retenue de Garantie
  tauxLimite: number
  cautionBancaire: number
  dateDebut: string
  dateFinPrevue: string
  delaiExecutionMois: number
  // Géolocalisation
  adresse: string
  latitude?: number
  longitude?: number
  zoneGeographique: string
  // Étape 2: Lignes de Prix
  lignes: MarcheLigne[]
  // Étape 3: Imputations
  imputations: MarcheImputation[]
}

export interface MarcheLigne {
  id?: number
  numeroPrix: string
  designation: string
  quantite: number
  puHT: number
  total: number
}

export interface MarcheImputation {
  id?: number
  conventionId: number
  axeCode?: string
  projetCode?: string
  voletCode?: string
  montant: number
}

const steps = [
  'Informations Marché',
  'Lignes de Prix',
  'Imputations Analytiques'
]

const MarcheWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<MarcheFormData>({
    numeroMarche: '',
    numAO: '',
    dateMarche: new Date().toISOString().split('T')[0],
    objet: '',
    conventionId: null,
    fournisseurId: null,
    typePrestation: 'TRAVAUX',
    montantHT: 0,
    tauxTVA: 20,
    montantTVA: 0,
    montantTTC: 0,
    tauxRG: 10,
    tauxLimite: 5,
    cautionBancaire: 0,
    dateDebut: '',
    dateFinPrevue: '',
    delaiExecutionMois: 12,
    adresse: '',
    latitude: undefined,
    longitude: undefined,
    zoneGeographique: '',
    lignes: [],
    imputations: [],
  })

  const handleNext = () => {
    if (activeStep === 0) {
      // Validation étape 1
      if (!formData.numeroMarche || !formData.objet || !formData.fournisseurId) {
        setError('Veuillez remplir tous les champs obligatoires')
        return
      }
    }

    if (activeStep === 1) {
      // Validation étape 2
      if (formData.lignes.length === 0) {
        setError('Veuillez ajouter au moins une ligne de prix')
        return
      }
    }

    if (activeStep === 2) {
      // Validation étape 3
      const totalImputations = formData.imputations.reduce((sum, imp) => sum + imp.montant, 0)
      const totalMarche = formData.montantTTC

      if (Math.abs(totalImputations - totalMarche) > 0.01) {
        setError(`Total imputations (${totalImputations.toFixed(2)} DH) doit égaler le montant TTC (${totalMarche.toFixed(2)} DH)`)
        return
      }
    }

    setError('')
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setError('')
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Préparer les données pour l'API
      const payload = {
        numeroMarche: formData.numeroMarche,
        numAO: formData.numAO,
        dateMarche: formData.dateMarche,
        objet: formData.objet,
        conventionId: formData.conventionId,
        fournisseurId: formData.fournisseurId,
        typePrestation: formData.typePrestation,
        montantHT: formData.montantHT,
        tauxTVA: formData.tauxTVA,
        montantTVA: formData.montantTVA,
        montantTTC: formData.montantTTC,
        tauxRG: formData.tauxRG,
        tauxLimite: formData.tauxLimite,
        cautionBancaire: formData.cautionBancaire,
        dateDebut: formData.dateDebut,
        dateFinPrevue: formData.dateFinPrevue,
        delaiExecutionMois: formData.delaiExecutionMois,
        adresse: formData.adresse,
        latitude: formData.latitude,
        longitude: formData.longitude,
        zoneGeographique: formData.zoneGeographique,
        lignes: formData.lignes,
        imputations: formData.imputations,
      }

      await marchesAPI.create(payload)
      navigate('/marches')
    } catch (err: any) {
      console.error('Erreur création marché:', err)
      setError(err.response?.data?.message || 'Erreur lors de la création du marché')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, #ffffff)', py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header Section */}
          <Box
            sx={{
              background: colors.gradients.primary,
              color: 'white',
              borderRadius: '16px 16px 0 0',
              p: 4,
              mb: 0,
            }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/marches')}
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
              Nouveau Marché
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Créez un nouveau marché en 3 étapes simples
            </Typography>
          </Box>

          {/* Stepper */}
          <Paper sx={{ p: 4, borderRadius: '0 0 16px 16px', boxShadow: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Message */}
            {error && (
              <Box
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography>{error}</Typography>
              </Box>
            )}

            {/* Step Content */}
            <Box sx={{ minHeight: 400 }}>
              {activeStep === 0 && (
                <Step1InfoMarche formData={formData} setFormData={setFormData} />
              )}
              {activeStep === 1 && (
                <Step2LignesPrix formData={formData} setFormData={setFormData} />
              )}
              {activeStep === 2 && (
                <Step3Imputations formData={formData} setFormData={setFormData} />
              )}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                startIcon={<ArrowBack />}
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  variant="contained"
                  startIcon={<Save />}
                  sx={{
                    bgcolor: colors.success[600],
                    '&:hover': { bgcolor: colors.success[700] },
                  }}
                >
                  {loading ? 'Création...' : 'Créer le Marché'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowForward />}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default MarcheWizard
