import { ReactNode } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { componentStyles, colors, typography } from '@/lib/designSystem'
import ModernBreadcrumb, { BreadcrumbSegment } from './ModernBreadcrumb'

// ==================== TYPES ====================

interface WizardStep {
  label: string
}

interface WizardViewProps {
  breadcrumbs: BreadcrumbSegment[]
  steps: WizardStep[]
  activeStep: number
  onStepClick?: (step: number) => void
  onBack: () => void
  onNext: () => void
  onCancel?: () => void
  isNextDisabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
  backLabel?: string
  nextLabel?: string
  cancelLabel?: string
  /** Extra actions displayed after the Next/Submit button */
  extraActions?: ReactNode
  children: ReactNode
}

/**
 * WizardView – Multi-step form creation layout.
 *
 * Provides breadcrumb navigation, a step pipeline indicator,
 * a content sheet, and Back/Next/Submit navigation.
 *
 * @example
 * <WizardView
 *   breadcrumbs={[{ label: 'Conventions', path: '/conventions' }, { label: 'Nouveau' }]}
 *   steps={[{ label: 'Infos' }, { label: 'Budget' }, { label: 'Récap' }]}
 *   activeStep={step}
 *   onBack={() => setStep(s => s - 1)}
 *   onNext={() => step === 2 ? handleSubmit() : setStep(s => s + 1)}
 *   isNextDisabled={!isValid}
 *   isSubmitting={saving}
 * >
 *   {renderStepContent()}
 * </WizardView>
 */
const WizardView = ({
  breadcrumbs,
  steps,
  activeStep,
  onStepClick,
  onBack,
  onNext,
  onCancel,
  isNextDisabled = false,
  isSubmitting = false,
  submitLabel = 'Créer',
  backLabel = 'Précédent',
  nextLabel = 'Suivant',
  cancelLabel = 'Annuler',
  extraActions,
  children,
}: WizardViewProps) => {
  const styles = componentStyles.wizardView
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === steps.length - 1

  const getStepStyle = (index: number) => {
    if (index === activeStep) return styles.stepActive
    if (index < activeStep) return styles.stepDone
    return styles.step
  }

  const getNumberStyle = (index: number) => {
    if (index === activeStep) return styles.stepNumberActive
    if (index < activeStep) return styles.stepNumberDone
    return styles.stepNumberDefault
  }

  const handleStepClick = (index: number) => {
    if (index < activeStep && onStepClick) {
      onStepClick(index)
    }
  }

  return (
    <Box sx={styles.container}>
      {/* Header: breadcrumbs + cancel */}
      <Box sx={styles.header}>
        <ModernBreadcrumb items={breadcrumbs} />
        {onCancel && (
          <Button
            size="small"
            onClick={onCancel}
            sx={{
              ...componentStyles.buttonGhost,
              fontSize: typography.sizes.sm,
              textTransform: 'none',
            }}
          >
            {cancelLabel}
          </Button>
        )}
      </Box>

      {/* Step indicator bar */}
      <Box sx={styles.stepBar}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={getStepStyle(index)}
            onClick={() => handleStepClick(index)}
          >
            <Box
              component="span"
              sx={{ ...styles.stepNumber, ...getNumberStyle(index) }}
            >
              {index < activeStep ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </Box>
            <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
              {step.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Content sheet */}
      <Box sx={styles.sheet}>
        <Box sx={styles.card}>
          {children}
        </Box>
      </Box>

      {/* Bottom navigation */}
      <Box sx={styles.navBar}>
        <Box>
          {!isFirstStep && (
            <Button
              onClick={onBack}
              disabled={isSubmitting}
              startIcon={<ArrowLeft size={16} />}
              sx={{
                ...componentStyles.buttonSecondary,
                textTransform: 'none',
              }}
            >
              {backLabel}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {extraActions}
          <Button
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            variant="contained"
            endIcon={
              isSubmitting ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : isLastStep ? (
                <Check size={16} />
              ) : (
                <ArrowRight size={16} />
              )
            }
            sx={{
              ...componentStyles.buttonPrimary,
              textTransform: 'none',
            }}
          >
            {isSubmitting
              ? 'Enregistrement...'
              : isLastStep
                ? submitLabel
                : nextLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export { WizardView }
export type { WizardStep, WizardViewProps }
export default WizardView
