import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import {
  Restore as RestoreIcon,
  Close as CloseIcon,
  CloudDone as SavedIcon,
  Schedule as DraftIcon,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { getPlainTextLength } from '../../utils/textUtils'
import { colors, typography, borders } from '@/lib/designSystem'
import {
  WIZARD_STEPS,
  formatCurrency,
  useConventionWizardData,
  WizardStepInformations,
  WizardStepBudget,
  WizardStepPartenaires,
  WizardStepRecapitulatif,
} from './wizard'
import type { ConventionWizardFormData } from './wizard'
import { useConventionAutosave } from './wizard/useConventionAutosave'
import ConventionSmartSidebar from './wizard/ConventionSmartSidebar'

// Calculate completion percentage based on form state
const calculateCompletion = (
  formData: ReturnType<typeof useConventionWizardData>['formData'],
  activeStep: number
): number => {
  let score = 0
  const maxScore = 10

  // Step 1: Informations (4 points)
  if (formData.code) score += 1
  if (formData.libelle) score += 1
  if (getPlainTextLength(formData.objetRich) > 0) score += 1
  if (formData.dateDebut && formData.dureeMois > 0) score += 1

  // Step 2: Budget (3 points)
  if (formData.budgetGlobal > 0) score += 1.5
  if (formData.tauxCommission > 0 || formData.lignesBudget.length > 0) score += 1.5

  // Step 3: Partenaires (2 points)
  if (formData.partenaires.length > 0) score += 2

  // Step 4: Review (1 point)
  if (activeStep >= 3) score += 1

  return Math.round((score / maxScore) * 100)
}

const ConventionWizardComplete = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [showSavedSnack, setShowSavedSnack] = useState(false)

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

  const {
    hasDraft,
    lastSaved,
    isSaving: isAutosaving,
    restoreDraft,
    clearDraft,
    saveDraft,
  } = useConventionAutosave(isEditing)

  const completionPercent = useMemo(() => calculateCompletion(formData, activeStep), [formData, activeStep])

  // Show draft restoration banner on mount
  useEffect(() => {
    if (hasDraft && !isEditing) {
      setShowDraftBanner(true)
    }
  }, [hasDraft, isEditing])

  // Autosave on every change
  useEffect(() => {
    if (!isEditing && formData.code) {
      saveDraft(formData, activeStep)
    }
  }, [formData, activeStep, isEditing, saveDraft])

  // Show saved indicator (only when not already showing)
  useEffect(() => {
    if (lastSaved && !showSavedSnack) {
      setShowSavedSnack(true)
      const timer = setTimeout(() => setShowSavedSnack(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestoreDraft = useCallback(() => {
    const draft = restoreDraft()
    if (draft) {
      setFormData(draft.formData)
      setActiveStep(draft.activeStep)
    }
    setShowDraftBanner(false)
  }, [restoreDraft, setFormData])

  const handleDismissDraft = useCallback(() => {
    clearDraft()
    setShowDraftBanner(false)
  }, [clearDraft])

  const handleNext = () => {
    if (activeStep === WIZARD_STEPS.length - 1) {
      clearDraft()
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
  const summaryChips = useMemo(() => {
    const chips: Array<{
      label: string
      color: 'primary' | 'info' | 'success' | 'default' | 'warning'
    }> = []
    if (formData.code)
      chips.push({ label: formData.code, color: 'primary' })
    if (formData.type)
      chips.push({ label: formData.type, color: 'info' })
    if (formData.budgetGlobal > 0)
      chips.push({ label: `Budget: ${formatCurrency(formData.budgetGlobal)}`, color: 'default' })
    if (totals.commissionTTC > 0)
      chips.push({ label: `Commission: ${formatCurrency(totals.commissionTTC)}`, color: 'success' })
    if (formData.lignesBudget.length > 0)
      chips.push({ label: `${formData.lignesBudget.length} ligne(s)`, color: 'default' })
    if (formData.partenaires.length > 0)
      chips.push({ label: `${formData.partenaires.length} partenaire(s)`, color: 'default' })
    return chips
  }, [formData.code, formData.type, formData.budgetGlobal, totals.commissionTTC, formData.lignesBudget.length, formData.partenaires.length])

  const wizardSummaryBar =
    summaryChips.length > 0 ? (
      <Box
        sx={{
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
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: colors.textSecondary,
            fontWeight: typography.weights.semibold,
            mr: 0.5,
          }}
        >
          Resume :
        </Typography>
        {summaryChips.map((chip, idx) => (
          <Chip
            key={idx}
            label={chip.label}
            size="small"
            color={chip.color}
            variant="outlined"
          />
        ))}
        {/* Autosave indicator */}
        {isAutosaving && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <CircularProgress size={12} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              Sauvegarde...
            </Typography>
          </Box>
        )}
        {!isAutosaving && lastSaved && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <SavedIcon sx={{ fontSize: 14, color: colors.success[500] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              Brouillon sauvegarde
            </Typography>
          </Box>
        )}
      </Box>
    ) : null

  if (isLoadingConvention) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            gap: 2,
          }}
        >
          <CircularProgress size={24} />
          <Typography>Chargement...</Typography>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Draft restoration banner */}
      {showDraftBanner && (
        <Box
          sx={{
            mx: { xs: 2, md: 4 },
            mt: 2,
            p: 2,
            bgcolor: colors.warning[25],
            border: `1px solid ${colors.warning[300]}`,
            borderRadius: borders.radius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DraftIcon sx={{ color: colors.warning[600] }} />
            <Box>
              <Typography
                sx={{
                  fontWeight: typography.weights.semibold,
                  color: colors.warning[700],
                  fontSize: typography.sizes.sm,
                }}
              >
                Brouillon trouve
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[600] }}>
                Vous avez un brouillon non termine. Voulez-vous le reprendre ?
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={handleDismissDraft}
              sx={{ textTransform: 'none', color: colors.textSecondary, borderColor: colors.border }}
            >
              Ignorer
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<RestoreIcon />}
              onClick={handleRestoreDraft}
              sx={{
                textTransform: 'none',
                bgcolor: colors.warning[600],
                '&:hover': { bgcolor: colors.warning[700] },
              }}
            >
              Reprendre
            </Button>
          </Box>
        </Box>
      )}

      {/* Main layout with sidebar */}
      <Box sx={{ display: 'flex', gap: 3, px: { xs: 0, lg: 2 }, py: { xs: 0, lg: 1 } }}>
        {/* Wizard (main content) */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <WizardView
            breadcrumbs={[
              { label: 'Conventions', path: '/conventions' },
              {
                label: isEditing
                  ? `Modifier ${formData.code || ''}`
                  : 'Nouvelle Convention',
              },
            ]}
            steps={WIZARD_STEPS.map((label) => ({ label }))}
            activeStep={activeStep}
            onStepClick={setActiveStep}
            onBack={handleBack}
            onNext={handleNext}
            onCancel={() =>
              isEditing
                ? navigate(`/conventions/${id}`)
                : navigate('/conventions')
            }
            isNextDisabled={!isStepValid()}
            isSubmitting={isSubmitting}
            submitLabel={
              isEditing ? 'Modifier la convention' : 'Creer la convention'
            }
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
        </Box>

        {/* Smart Sidebar (hidden on mobile) */}
        <ConventionSmartSidebar
          formData={formData}
          totals={totals}
          activeStep={activeStep}
          completionPercent={completionPercent}
        />
      </Box>

      {/* Autosave snackbar */}
      <Snackbar
        open={showSavedSnack}
        autoHideDuration={2000}
        onClose={() => setShowSavedSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SavedIcon sx={{ fontSize: 16, color: colors.success[400] }} />
            <span>Brouillon sauvegarde</span>
          </Box>
        }
      />
    </AppLayout>
  )
}

export default ConventionWizardComplete
