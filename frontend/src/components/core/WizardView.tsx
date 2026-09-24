import { ReactNode } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { componentStyles } from '@/lib/designSystem'
import type { BreadcrumbSegment } from './ModernBreadcrumb'

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
  /** Optional persistent summary bar rendered between step indicator and content */
  summaryBar?: ReactNode
  /** Colonne droite collante (récapitulatif en direct), 300px au-dessus de 1240px */
  aside?: ReactNode
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
  summaryBar,
  aside,
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
      {/* En-tête : fil d'Ariane (surtitre) + titre Garamond */}
      <Box sx={styles.header}>
        <Box sx={{ minWidth: 0 }}>
          <nav className="page-eyebrow" aria-label="Fil d'Ariane">
            {breadcrumbs.slice(0, -1).map((item, index) => (
              <Box component="span" key={`${item.label}-${index}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                {index > 0 && <span className="page-eyebrow-sep" aria-hidden="true">›</span>}
                {item.path ? <RouterLink to={item.path}>{item.label}</RouterLink> : <span>{item.label}</span>}
              </Box>
            ))}
          </nav>
          <h1 className="page-title">{breadcrumbs[breadcrumbs.length - 1]?.label}</h1>
        </Box>
        {onCancel && (
          <Button size="small" onClick={onCancel} sx={componentStyles.buttonGhost}>
            {cancelLabel}
          </Button>
        )}
      </Box>

      {/* Step indicator bar */}
      <Box component="ol" sx={{ ...styles.stepBar, listStyle: 'none', p: 0, mt: 0 }} aria-label="Étapes">
        {steps.map((step, index) => (
          <Box
            component="li"
            key={index}
            sx={getStepStyle(index)}
            onClick={() => handleStepClick(index)}
            aria-current={index === activeStep ? 'step' : undefined}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{ ...styles.stepNumber, ...getNumberStyle(index) }}
            >
              {index < activeStep ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </Box>
            <Typography component="span" noWrap sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
              {step.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Optional summary bar */}
      {summaryBar}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: aside ? { xs: '1fr', lg: 'minmax(0, 1fr) 300px' } : '1fr',
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
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
                  sx={componentStyles.buttonSecondary}
                >
                  {backLabel}
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
                sx={componentStyles.buttonPrimary}
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

        {aside && (
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 'calc(var(--app-header-h, 0px) + 20px)' }, minWidth: 0 }}>
            {aside}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export { WizardView }
export type { WizardStep, WizardViewProps }
export default WizardView
