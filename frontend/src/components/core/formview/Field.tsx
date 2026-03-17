import { ReactNode } from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import { HelpCircle, Link2 } from 'lucide-react'
import { componentStyles, colors, typography } from '@/lib/designSystem'

interface FieldProps {
  label: string
  value?: ReactNode
  isEditing?: boolean
  editContent?: ReactNode
  isLink?: boolean
  onLinkClick?: () => void
  isMoney?: boolean
  fullWidth?: boolean
  required?: boolean
  /** Tooltip help text shown as info icon next to the label */
  help?: string
  /** Provenance indicator for inherited values (e.g., from parent convention) */
  provenance?: {
    source: string
    isInherited: boolean
  }
}

/**
 * Field - A single field row with label and value.
 * Supports view mode (static text) and edit mode (inline input).
 * Optional help tooltip and provenance indicator for data traceability.
 */
const Field = ({
  label,
  value,
  isEditing = false,
  editContent,
  isLink = false,
  onLinkClick,
  isMoney = false,
  fullWidth = false,
  required = false,
  help,
  provenance,
}: FieldProps) => {
  const styles = componentStyles.formView
  const displayValue = value || '-'

  return (
    <Box sx={{ ...styles.fieldRow, ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={styles.fieldLabel}>
          {label}
          {required && isEditing && (
            <Typography component="span" sx={{ color: colors.danger[500], ml: 0.5 }}>*</Typography>
          )}
        </Typography>
        {help && (
          <Tooltip
            title={help}
            placement="top"
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: colors.neutral[800],
                  fontSize: typography.sizes.xs,
                  maxWidth: 280,
                  lineHeight: 1.5,
                  p: 1,
                },
              },
            }}
          >
            <Box sx={{ display: 'inline-flex', cursor: 'help', color: colors.neutral[400], '&:hover': { color: colors.primary[500] } }}>
              <HelpCircle size={13} />
            </Box>
          </Tooltip>
        )}
        {provenance && (
          <Tooltip
            title={provenance.isInherited ? `Herite de : ${provenance.source}` : `Surcharge locale (parent: ${provenance.source})`}
            placement="top"
            arrow
          >
            <Box sx={{
              display: 'inline-flex',
              cursor: 'help',
              color: provenance.isInherited ? colors.purple[400] : colors.warning[500],
            }}>
              <Link2 size={13} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {isEditing && editContent ? (
        <Box sx={{ flex: 1 }}>{editContent}</Box>
      ) : isLink && onLinkClick ? (
        <Typography sx={styles.fieldValueLink} onClick={onLinkClick}>{displayValue}</Typography>
      ) : isMoney ? (
        <Typography sx={styles.fieldValueMoney}>{displayValue}</Typography>
      ) : (
        <Typography sx={{
          ...styles.fieldValue,
          ...(provenance?.isInherited ? { color: colors.purple[600], fontStyle: 'italic' } : {}),
        }}>{displayValue}</Typography>
      )}
    </Box>
  )
}

export default Field
