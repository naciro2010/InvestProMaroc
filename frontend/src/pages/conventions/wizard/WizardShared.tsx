import type { ReactNode } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { componentStyles, colors, typography, borders } from '@/lib/designSystem'

// ==================== SECTION CARD ====================

interface SectionCardProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  /** 'primary' uses primary[25] bg header, 'default' uses neutral[25] */
  variant?: 'default' | 'primary'
  /** Extra border color override (e.g. for summary cards) */
  borderColor?: string
  children: ReactNode
}

/**
 * SectionCard - Odoo-style card with header bar and body.
 * Replaces repeated Box+Box+Box pattern across wizard steps.
 */
const SectionCard = ({
  title,
  icon,
  action,
  variant = 'default',
  borderColor,
  children,
}: SectionCardProps) => (
  <Box
    sx={{
      ...componentStyles.sectionCard,
      ...(borderColor ? { border: `2px solid ${borderColor}` } : {}),
    }}
  >
    <Box
      sx={{
        ...componentStyles.sectionCardHeader,
        bgcolor: variant === 'primary' ? colors.primary[25] : colors.neutral[25],
        ...(borderColor ? { borderBottom: `1px solid ${borderColor}` } : {}),
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: typography.weights.semibold,
          color: variant === 'primary' ? colors.primary[700] : colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}
        {title}
      </Typography>
      {action}
    </Box>
    <Box sx={componentStyles.sectionCardBody}>{children}</Box>
  </Box>
)

// ==================== PRESET CHIPS ====================

interface PresetChipsProps<T extends string | number> {
  label?: string
  presets: ReadonlyArray<{ label: string; value: T }>
  activeValue: T
  onSelect: (value: T) => void
}

/**
 * PresetChips - Row of selectable chip presets (Odoo-style quick-pick).
 * Used for duration presets, budget amount presets, etc.
 */
function PresetChips<T extends string | number>({
  label,
  presets,
  activeValue,
  onSelect,
}: PresetChipsProps<T>) {
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography
          sx={{
            fontSize: typography.sizes.xs,
            color: colors.textSecondary,
            fontWeight: typography.weights.medium,
            mb: 1,
          }}
        >
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {presets.map((preset) => {
          const isActive = activeValue === preset.value
          return (
            <Chip
              key={String(preset.value)}
              label={preset.label}
              size="small"
              onClick={() => onSelect(preset.value)}
              sx={{
                bgcolor: isActive ? colors.primary[600] : 'transparent',
                color: isActive ? colors.surface : colors.textPrimary,
                border: `1px solid ${isActive ? colors.primary[600] : colors.border}`,
                fontWeight: isActive
                  ? typography.weights.semibold
                  : typography.weights.normal,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? colors.primary[700] : colors.primary[25],
                  borderColor: colors.primary[300],
                },
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}

export { SectionCard, PresetChips }
export type { SectionCardProps, PresetChipsProps }
