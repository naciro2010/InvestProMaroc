import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react'
import { Box, TextField, MenuItem, Typography, CircularProgress, ClickAwayListener } from '@mui/material'
import { Check, X, Pencil } from 'lucide-react'
import { componentStyles, colors, typography, borders } from '@/lib/designSystem'

// ==================== TYPES ====================

interface BaseFieldConfig {
  /** Field key used to identify which field to save */
  fieldKey: string
  /** Label shown to the left */
  label: string
  /** Current display value (ReactNode for badges, etc.) */
  displayValue?: ReactNode
  /** Whether the field is editable at all */
  editable?: boolean
  /** Whether this is a monetary value */
  isMoney?: boolean
  /** Whether this is a link */
  isLink?: boolean
  /** Link click handler */
  onLinkClick?: () => void
  /** Full width (spans all columns in a grid) */
  fullWidth?: boolean
  /** Help tooltip */
  help?: string
  /** Provenance indicator */
  provenance?: { source: string; isInherited: boolean }
}

interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'number' | 'date'
  value: string | number
  multiline?: boolean
  placeholder?: string
  disabled?: boolean
  inputProps?: Record<string, unknown>
}

interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select'
  value: string | number | null
  options: Array<{ value: string | number; label: string }>
  emptyLabel?: string
}

interface RichTextFieldConfig extends BaseFieldConfig {
  type: 'richtext'
  value: string
}

type InlineEditFieldConfig = TextFieldConfig | SelectFieldConfig | RichTextFieldConfig

interface InlineEditFieldProps {
  config: InlineEditFieldConfig
  /** Called when user confirms the new value. Should return a promise that resolves on success. */
  onSave: (fieldKey: string, value: string | number | null) => Promise<void>
  /** Optional: open a dialog for complex editing (richtext, long text) */
  onOpenDialog?: (fieldKey: string, value: string) => void
}

// ==================== COMPONENT ====================

/**
 * InlineEditField - Odoo-style click-to-edit field.
 *
 * In view mode, displays the value. When clicked, switches to an inline
 * input. Saves on Enter/blur, cancels on Escape.
 */
const InlineEditField = ({ config, onSave, onOpenDialog }: InlineEditFieldProps) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localValue, setLocalValue] = useState<string | number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const styles = componentStyles.formView

  const editable = config.editable !== false

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      // For text inputs, select all text
      if (config.type === 'text' && inputRef.current.select) {
        inputRef.current.select()
      }
    }
  }, [editing, config.type])

  const startEdit = () => {
    if (!editable || saving) return

    // For rich text, open dialog instead
    if (config.type === 'richtext') {
      onOpenDialog?.(config.fieldKey, config.value)
      return
    }

    setLocalValue(config.value)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setLocalValue(null)
  }

  const confirmEdit = async () => {
    if (saving) return
    // Don't save if value hasn't changed
    const originalValue = config.type === 'select' ? config.value : config.value
    if (localValue === originalValue) {
      cancelEdit()
      return
    }
    setSaving(true)
    try {
      await onSave(config.fieldKey, localValue)
      setEditing(false)
      setLocalValue(null)
    } catch {
      // Stay in edit mode on error
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
    if (e.key === 'Enter' && config.type !== 'text') {
      e.preventDefault()
      confirmEdit()
    }
    // For text (non-multiline), Enter saves
    if (e.key === 'Enter' && config.type === 'text' && !('multiline' in config && config.multiline)) {
      e.preventDefault()
      confirmEdit()
    }
  }

  // ---- Display Value ----
  const renderDisplayValue = () => {
    const { displayValue } = config

    // If displayValue is provided (e.g. StatusBadge), use it
    if (displayValue !== undefined) {
      return displayValue
    }

    // Default formatting
    if (config.type === 'select') {
      const opt = config.options.find(o => o.value === config.value)
      return opt?.label || config.value || '-'
    }

    if (config.type === 'date') {
      const val = config.value as string
      return val ? new Date(val).toLocaleDateString('fr-FR') : '-'
    }

    if (config.isMoney && typeof config.value === 'number') {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(config.value)
    }

    if (config.type === 'number') {
      const val = config.value
      return val !== null && val !== undefined && val !== 0 ? String(val) : '-'
    }

    return config.value || '-'
  }

  // ---- Render Modes ----

  if (editing) {
    return (
      <Box sx={{ ...styles.fieldRow, ...(config.fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
        <Typography sx={styles.fieldLabel}>{config.label}</Typography>
        <ClickAwayListener onClickAway={confirmEdit}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {config.type === 'select' ? (
              <TextField
                select
                size="small"
                fullWidth
                value={localValue ?? ''}
                onChange={(e) => {
                  setLocalValue(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                sx={styles.inlineInput}
                autoFocus
              >
                {config.emptyLabel && <MenuItem value="">{config.emptyLabel}</MenuItem>}
                {config.options.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                size="small"
                fullWidth
                type={config.type === 'date' ? 'date' : config.type}
                value={localValue ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  if (config.type === 'number') {
                    setLocalValue(v === '' ? 0 : Number(v))
                  } else {
                    setLocalValue(v)
                  }
                }}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                multiline={'multiline' in config ? config.multiline : false}
                rows={'multiline' in config && config.multiline ? 3 : undefined}
                placeholder={'placeholder' in config ? config.placeholder : undefined}
                disabled={'disabled' in config ? config.disabled : false}
                inputProps={'inputProps' in config ? (config.inputProps as Record<string, unknown>) : undefined}
                sx={styles.inlineInput}
                autoFocus
                InputLabelProps={config.type === 'date' ? { shrink: true } : undefined}
              />
            )}
            {/* Inline confirm/cancel buttons */}
            <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
              {saving ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <Box
                    onClick={(e) => { e.stopPropagation(); confirmEdit() }}
                    sx={{
                      width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: borders.radius.sm, cursor: 'pointer',
                      color: colors.success[600], '&:hover': { bgcolor: colors.success[50] },
                    }}
                  >
                    <Check size={14} />
                  </Box>
                  <Box
                    onClick={(e) => { e.stopPropagation(); cancelEdit() }}
                    sx={{
                      width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: borders.radius.sm, cursor: 'pointer',
                      color: colors.danger[600], '&:hover': { bgcolor: colors.danger[50] },
                    }}
                  >
                    <X size={14} />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </ClickAwayListener>
      </Box>
    )
  }

  // ---- View Mode ----
  const valueContent = renderDisplayValue()

  return (
    <Box sx={{ ...styles.fieldRow, ...(config.fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <Typography sx={styles.fieldLabel}>{config.label}</Typography>

      {config.isLink && config.onLinkClick && !editable ? (
        <Typography sx={styles.fieldValueLink} onClick={config.onLinkClick}>
          {valueContent}
        </Typography>
      ) : editable ? (
        <Box
          onClick={startEdit}
          sx={{
            ...styles.fieldValueEditable,
            ...(config.isMoney ? {
              fontWeight: typography.weights.semibold,
              fontVariantNumeric: 'tabular-nums',
              textAlign: 'right' as const,
            } : {}),
            position: 'relative',
            '& .edit-icon': { opacity: 0, transition: 'opacity 0.15s' },
            '&:hover .edit-icon': { opacity: 1 },
          }}
        >
          {valueContent}
          <Box
            className="edit-icon"
            sx={{
              position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
              color: colors.primary[400], display: 'flex', alignItems: 'center',
            }}
          >
            <Pencil size={12} />
          </Box>
        </Box>
      ) : config.isMoney ? (
        <Typography sx={styles.fieldValueMoney}>{valueContent}</Typography>
      ) : (
        <Typography sx={{
          ...styles.fieldValue,
          ...(config.provenance?.isInherited ? { color: colors.purple[600], fontStyle: 'italic' } : {}),
        }}>{valueContent}</Typography>
      )}
    </Box>
  )
}

export default InlineEditField
export type { InlineEditFieldConfig, TextFieldConfig, SelectFieldConfig, RichTextFieldConfig }
