import { ReactNode } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material'
import { Check, X, Pencil } from 'lucide-react'
import StatusCircuit, { type StatusStep } from './StatusCircuit'
import { componentStyles } from '@/lib/designSystem'

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

export type { StatusStep }

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
                sx={componentStyles.buttonSecondary}
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
                  sx={componentStyles.buttonPrimary}
                >
                  Enregistrer
                </Button>
                <Button
                  size="small"
                  startIcon={<X size={14} />}
                  onClick={onCancel}
                  disabled={isSaving}
                  sx={componentStyles.buttonGhost}
                >
                  Annuler
                </Button>
              </>
            )}
            {statusBarActions}
          </Box>

          {statusSteps && (
            <StatusCircuit steps={statusSteps} currentStatus={currentStatus} />
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
