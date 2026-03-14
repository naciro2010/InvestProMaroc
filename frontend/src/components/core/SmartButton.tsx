import { ReactNode } from 'react'
import { Box, Typography, ButtonBase } from '@mui/material'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

interface SmartButtonProps {
  icon: ReactNode
  count: number
  label: string
  onClick?: () => void
  color?: string
}

/**
 * SmartButton - Odoo-style stat button showing a count + label with icon.
 * Used in detail pages to navigate to related records.
 *
 * @example
 * <SmartButton icon={<FileText size={18} />} count={5} label="Decomptes" onClick={() => navigate('/decomptes')} />
 */
const SmartButton = ({ icon, count, label, onClick, color = colors.neutral[700] }: SmartButtonProps) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.25,
      px: 2.5,
      py: 1.5,
      borderRadius: borders.radius.md,
      border: `1px solid ${colors.border}`,
      bgcolor: colors.surface,
      transition: transitions.normal,
      minWidth: 90,
      '&:hover': {
        bgcolor: colors.primary[25],
        borderColor: colors.primary[200],
      },
    }}
  >
    <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, lineHeight: 1.2 }}>
      {count}
    </Typography>
    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, lineHeight: 1.2 }}>
      {label}
    </Typography>
  </ButtonBase>
)

interface SmartButtonsRowProps {
  children: ReactNode
}

/**
 * SmartButtonsRow - Container for a row of SmartButtons.
 */
const SmartButtonsRow = ({ children }: SmartButtonsRowProps) => (
  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', py: 1.5 }}>
    {children}
  </Box>
)

export { SmartButton, SmartButtonsRow }
export default SmartButton
