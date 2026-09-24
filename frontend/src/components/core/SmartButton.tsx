import { ReactNode } from 'react'
import { Box, Typography, ButtonBase } from '@mui/material'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'

interface SmartButtonProps {
  icon: ReactNode
  count: number
  label: string
  onClick?: () => void
  color?: string
}

/**
 * SmartButton - Bouton compteur « Registre » : libellé à gauche, chiffre
 * Garamond à droite. Un clic ouvre la liste liée (onglet, page).
 *
 * @example
 * <SmartButton icon={<FileText size={16} />} count={5} label="Décomptes" onClick={() => setTab('decomptes')} />
 */
const SmartButton = ({ icon, count, label, onClick, color = colors.textSecondary }: SmartButtonProps) => (
  <ButtonBase
    onClick={onClick}
    aria-label={`${label} : ${count}`}
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 1,
      textAlign: 'left',
      px: 1.75,
      py: 1.25,
      borderRadius: borders.radius.lg,
      bgcolor: colors.surface,
      boxShadow: shadows.sm,
      transition: `box-shadow ${transitions.normal}`,
      minWidth: 132,
      flex: '1 1 132px',
      '&:hover': { boxShadow: shadows.lg },
      '&:focus-visible': { boxShadow: `${shadows.sm}, ${shadows.focus}` },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Box component="span" aria-hidden="true" sx={{ color, display: 'inline-flex', '& svg': { width: 16, height: 16, strokeWidth: 1.75 } }}>{icon}</Box>
      <Typography component="span" sx={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.25 }}>
        {label}
      </Typography>
    </Box>
    <Typography component="span" sx={{ fontFamily: typography.fontFamilySerif, fontSize: '22px', fontWeight: 600, color: colors.textPrimary, lineHeight: 1 }}>
      {count}
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
  <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', py: 1.5 }}>
    {children}
  </Box>
)

export { SmartButton, SmartButtonsRow }
export default SmartButton
