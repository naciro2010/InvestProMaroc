import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, Box,
} from '@mui/material'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import RichTextEditor from '@/components/ui/RichTextEditor'

// ==================== TYPES ====================

interface EditFieldDialogProps {
  open: boolean
  onClose: () => void
  onSave: (fieldKey: string, value: string) => Promise<void>
  fieldKey: string
  fieldLabel: string
  currentValue: string
  /** 'richtext' for full WYSIWYG editor, 'textarea' for plain multiline text */
  mode: 'richtext' | 'textarea'
}

// ==================== COMPONENT ====================

/**
 * EditFieldDialog - Dialog for editing rich text or long text fields.
 * Opens as a modal when the user clicks on a rich text field in view mode.
 */
const EditFieldDialog = ({
  open,
  onClose,
  onSave,
  fieldKey,
  fieldLabel,
  currentValue,
  mode,
}: EditFieldDialogProps) => {
  const [value, setValue] = useState(currentValue)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(fieldKey, value)
      onClose()
    } catch {
      // Stay open on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          borderBottom: `1px solid ${colors.border}`,
          py: 1.5,
          px: 3,
        }}
      >
        {fieldLabel}
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        {mode === 'richtext' ? (
          <Box sx={{ mt: 1 }}>
            <RichTextEditor
              value={value}
              onChange={setValue}
              minHeight="250px"
            />
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={16}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                fontSize: typography.sizes.base,
              },
            }}
          />
        )}
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${colors.border}`,
          px: 3,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ ...componentStyles.buttonGhost, textTransform: 'none' }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} /> : null}
          sx={{ ...componentStyles.buttonPrimary, textTransform: 'none' }}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditFieldDialog
export type { EditFieldDialogProps }
