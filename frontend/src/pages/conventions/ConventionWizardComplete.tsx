import { useState } from 'react'
import { Alert, Box, Chip, CircularProgress, Typography } from '@mui/material'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { getPlainTextLength } from '../../utils/textUtils'
import { colors, typography } from '@/lib/designSystem'
import {
  WIZARD_STEPS,
  formatCurrency,
  useConventionWizardData,
  WizardStepInformations,
  WizardStepBudget,
  WizardStepPartenaires,
  WizardStepRecapitulatif,
} from './wizard'

const ConventionWizardComplete = () => {
  const [activeStep, setActiveStep] = useState(0)

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
    onDureeMoisChange,
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
      case 0:
        return (
          formData.code &&
          formData.libelle &&
          getPlainTextLength(formData.libelleRich) <= 200 &&
          formData.objetRich
        )
      case 1:
        return (
          formData.budgetGlobal > 0 &&
          totals.differenceGlobalVsLignes >= 0 &&
          (formData.commissionMode === 'GLOBAL'
            ? formData.tauxCommission > 0
            : formData.lignesBudget.length > 0)
        )
      case 2:
        return true
      case 3:
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
            onDureeMoisChange={onDureeMoisChange}
            typeOptionsWithCurrent={typeOptionsWithCurrent}
          />
        )
      case 1:
        return (
          <WizardStepBudget
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            totals={totals}
          />
        )
      case 2:
        return (
          <WizardStepPartenaires
            formData={formData}
            setFormData={setFormData}
            totals={totals}
          />
        )
      case 3:
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

  // Build summary chips for the persistent info bar
  const summaryChips: Array<{ label: string; color: 'primary' | 'info' | 'success' | 'default' | 'warning' }> = []
  if (formData.code) summaryChips.push({ label: formData.code, color: 'primary' })
  if (formData.type) summaryChips.push({ label: formData.type, color: 'info' })
  if (formData.budgetGlobal > 0) summaryChips.push({ label: `Budget: ${formatCurrency(formData.budgetGlobal)}`, color: 'default' })
  if (totals.commissionTTC > 0) summaryChips.push({ label: `Commission: ${formatCurrency(totals.commissionTTC)}`, color: 'success' })
  if (formData.lignesBudget.length > 0) summaryChips.push({ label: `${formData.lignesBudget.length} ligne(s)`, color: 'default' })
  if (formData.partenaires.length > 0) summaryChips.push({ label: `${formData.partenaires.length} partenaire(s)`, color: 'default' })
  if (formData.subventions.length > 0) summaryChips.push({ label: `${formData.subventions.length} subvention(s)`, color: 'default' })

  const wizardSummaryBar = summaryChips.length > 0 ? (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 1,
      py: 1.5,
      px: 2.5,
      bgcolor: colors.neutral[50],
      borderBottom: `1px solid ${colors.border}`,
      borderRadius: 1,
      mb: 1,
    }}>
      <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold, mr: 0.5 }}>
        Résumé :
      </Typography>
      {summaryChips.map((chip, idx) => (
        <Chip key={idx} label={chip.label} size="small" color={chip.color} variant="outlined" />
      ))}
    </Box>
  ) : null

  if (isLoadingConvention) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Chargement...</Typography>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <WizardView
        breadcrumbs={[
          { label: 'Conventions', path: '/conventions' },
          { label: isEditing ? `Modifier ${formData.code || ''}` : 'Nouvelle Convention' },
        ]}
        steps={WIZARD_STEPS.map((label) => ({ label }))}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={handleBack}
        onNext={handleNext}
        onCancel={() => isEditing ? navigate(`/conventions/${id}`) : navigate('/conventions')}
        isNextDisabled={!isStepValid()}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? 'Modifier la convention' : 'Créer la convention'}
        summaryBar={wizardSummaryBar}
      >
        {renderStepContent(activeStep)}

        {activeStep === WIZARD_STEPS.length - 1 && (
          <Alert severity="info" sx={{ mt: 3 }}>
            {isEditing
              ? 'Apres la modification, vous serez redirige vers la page de detail.'
              : 'Apres la creation, vous pourrez ajouter des sous-conventions, des avenants, et gerer les allocations detaillees a partir de la page de detail.'}
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {submitError.message ||
              (isEditing
                ? 'Erreur lors de la modification de la convention'
                : 'Erreur lors de la creation de la convention')}
          </Alert>
        )}
      </WizardView>
    </AppLayout>
  )
}

export default ConventionWizardComplete
