import { Box, Typography, Tooltip } from '@mui/material'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'

export interface CounterButtonProps {
  value: string; label: string; subtitle?: string
  hint?: string; isZero: boolean; onClick: () => void
}

/** Bouton compteur « Registre » : libellé (et montant) à gauche, chiffre Garamond à droite. */
const CounterButton = ({ value, label, subtitle, hint, isZero, onClick }: CounterButtonProps) => (
  <Tooltip title={hint || label} placement="top" arrow enterDelay={400}>
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={`${label} : ${value}`}
      sx={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1,
        textAlign: 'left', px: 1.75, py: 1.25, minWidth: 150, flex: '1 1 150px', cursor: 'pointer',
        border: 0, borderRadius: borders.radius.lg, bgcolor: colors.surface,
        boxShadow: shadows.sm, fontFamily: typography.fontFamily,
        transition: `box-shadow ${transitions.normal}`,
        '&:hover': { boxShadow: shadows.lg },
        '&:focus-visible': { boxShadow: `${shadows.sm}, ${shadows.focus}` },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography component="span" sx={{ display: 'block', fontSize: '13px', color: isZero ? colors.textDisabled : colors.textSecondary, lineHeight: 1.25 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography component="span" sx={{ display: 'block', fontSize: '11px', color: colors.textTertiary, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Typography component="span" sx={{
        fontFamily: typography.fontFamilySerif, fontSize: '22px', fontWeight: typography.weights.semibold,
        color: isZero ? colors.textDisabled : colors.textPrimary, lineHeight: 1, flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
)

export default CounterButton
