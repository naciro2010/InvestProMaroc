import { ReactNode } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material'
import { Check, X, Pencil } from 'lucide-react'
import { componentStyles, typography } from '@/lib/designSystem'

// ==================== TYPES ====================

interface FormViewProps {
  isEditing: boolean
  onToggleEdit?: () => void
  onSave?: () => void | Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  statusSteps?: StatusStep[]
  currentStatus?: string
  statusBarActions?: ReactNode
  children: ReactNode
}

export interface StatusStep {
  value: string
  label: string
  /** Use 'danger' for rejected/cancelled states */
  variant?: 'danger'
}

/**
 * FormView - Main form container with status bar and edit/view toggle.
 * Provides a status pipeline bar at the top, Edit/Save/Discard buttons,
 * and toggles between view mode (static fields) and edit mode (inputs).
 */
const FormView = ({
  isEditing,
  onToggleEdit,
  onSave,
  onCancel,
  isSaving = false,
  statusSteps,
  currentStatus,
  statusBarActions,
  children,
}: FormViewProps) => {
  const styles = componentStyles.formView

  const getStepInfo = (step: StatusStep): { style: Record<string, unknown>; state: 'done' | 'active' | 'future' | 'danger' } => {
    if (!currentStatus) return { style: styles.statusPipelineStep, state: 'future' }
    const currentIdx = statusSteps?.findIndex(s => s.value === currentStatus) ?? -1
    const stepIdx = statusSteps?.findIndex(s => s.value === step.value) ?? -1

    if (stepIdx === currentIdx) {
      if (step.variant === 'danger') return { style: styles.statusPipelineStepDanger, state: 'danger' }
      return { style: styles.statusPipelineStepActive, state: 'active' }
    }
    if (stepIdx < currentIdx) return { style: styles.statusPipelineStepDone, state: 'done' }
    return { style: styles.statusPipelineStep, state: 'future' }
  }

  return (
    <Box sx={styles.container}>
      {(statusSteps || statusBarActions || onToggleEdit) && (
        <Box sx={styles.statusBar}>
          <Box sx={styles.statusBarButtons}>
            {!isEditing && onToggleEdit && (
              <Button
                size="small"
                startIcon={<Pencil size={14} />}
                onClick={onToggleEdit}
                sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5, px: 1.5 }}
              >
                Modifier
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  size="small"
                  startIcon={isSaving ? <CircularProgress size={14} /> : <Check size={14} />}
                  onClick={onSave}
                  disabled={isSaving}
                  sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.5, px: 1.5 }}
                >
                  Enregistrer
                </Button>
                <Button
                  size="small"
                  startIcon={<X size={14} />}
                  onClick={onCancel}
                  disabled={isSaving}
                  sx={{ ...componentStyles.buttonGhost, fontSize: typography.sizes.sm, py: 0.5, px: 1.5 }}
                >
                  Annuler
                </Button>
              </>
            )}
            {statusBarActions}
          </Box>

          {statusSteps && (
            <Box sx={styles.statusPipeline}>
              {statusSteps.map((step) => {
                const { style, state } = getStepInfo(step)
                return (
                  <Box key={step.value} sx={{ ...style, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {state === 'done' && <Check size={12} />}
                    {step.label}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      )}

      <Box sx={styles.sheet}>
        {children}
      </Box>
    </Box>
  )
}

export default FormView
