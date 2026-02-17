import { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Check,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { SimplePageLayout } from '../../components/layout/PageLayout'
import { getPlainTextLength } from '../../utils/textUtils'
import {
  WIZARD_STEPS,
  useConventionWizardData,
  WizardStepInformations,
  WizardStepBudget,
  WizardStepCommission,
  WizardStepSubventions,
  WizardStepRecapitulatif,
} from './wizard'

const ConventionWizardComplete = () => {
  const [activeStep, setActiveStep] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    id,
    isEditing,
    navigate,
    formData,
    setFormData,
    autoDateFin,
    settings,
    typeOptionsWithCurrent,
    totals,
    handleChange,
    handleSubmit,
    isLoadingConvention,
    isSubmitting,
    submitError,
  } = useConventionWizardData()

  const handleNext = () => {
    if (activeStep === WIZARD_STEPS.length - 1) {
      handleSubmit()
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

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
        return formData.budgetGlobal > 0 && totals.differenceGlobalVsLignes >= 0
      case 2: // Commission
        return formData.tauxCommission > 0
      case 3: // Subventions (optional)
        return true
      case 4: // Récapitulatif
        return true
      default:
        return false
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <WizardStepInformations
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            settings={settings}
            autoDateFin={autoDateFin}
            typeOptionsWithCurrent={typeOptionsWithCurrent}
          />
        )
      case 1:
        return (
          <WizardStepBudget
            formData={formData}
            setFormData={setFormData}
            totals={totals}
          />
        )
      case 2:
        return (
          <WizardStepCommission
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            totals={totals}
          />
        )
      case 3:
        return (
          <WizardStepSubventions
            formData={formData}
            setFormData={setFormData}
            totals={totals}
          />
        )
      case 4:
        return (
          <WizardStepRecapitulatif
            formData={formData}
            setFormData={setFormData}
            totals={totals}
          />
        )
      default:
        return null
    }
  }

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
            ? 'Modifier la convention en 5 étapes'
            : 'Créer une convention CADRE ou NON_CADRE en 5 étapes'
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
              {WIZARD_STEPS.map((label) => (
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
                disabled={!isStepValid() || isSubmitting}
                endIcon={activeStep === WIZARD_STEPS.length - 1 ? <Check /> : <ArrowForward />}
                fullWidth={isMobile}
              >
                {isSubmitting
                  ? isEditing
                    ? 'Modification...'
                    : 'Création...'
                  : activeStep === WIZARD_STEPS.length - 1
                  ? isEditing
                    ? 'Modifier la convention'
                    : 'Créer la convention'
                  : 'Suivant'}
              </Button>
            </Stack>

            {/* Info Alert */}
            {activeStep === WIZARD_STEPS.length - 1 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                ℹ️{' '}
                {isEditing
                  ? 'Après la modification, vous serez redirigé vers la page de détail.'
                  : 'Après la création, vous pourrez ajouter des partenaires, des sous-conventions, des avenants, et gérer les allocations détaillées à partir de la page de détail.'}
              </Alert>
            )}

            {/* Error Alert */}
            {submitError && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {submitError.message ||
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
