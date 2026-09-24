import { ReactNode } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { colors, componentStyles, typography } from '@/lib/designSystem'

interface PanelProps {
  /** Titre Garamond 18px (optionnel) */
  title?: ReactNode
  /** Élément aligné à droite du titre (compteur, lien, légende) */
  aside?: ReactNode
  children: ReactNode
  /** Supprime le padding du corps (tableaux pleine largeur) */
  flush?: boolean
  sx?: SxProps<Theme>
  id?: string
}

/**
 * Panel - Panneau « Registre » : fond #fffdf8, rayon 10px, ombre douce,
 * titre Garamond avec filet bas.
 */
const Panel = ({ title, aside, children, flush = false, sx, id }: PanelProps) => (
  <Box component="section" id={id} sx={{ ...componentStyles.card, overflow: 'hidden', minWidth: 0, ...sx } as SxProps<Theme>}>
    {title && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 3,
          pt: 1.75,
          pb: 1.5,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box
          component="h2"
          sx={{ m: 0, fontFamily: typography.fontFamilySerif, fontWeight: 500, fontSize: '18px', lineHeight: 1.3, color: colors.textPrimary }}
        >
          {title}
        </Box>
        {aside && <Box sx={{ fontSize: '12px', color: colors.textTertiary, flexShrink: 0 }}>{aside}</Box>}
      </Box>
    )}
    {flush ? children : <Box sx={{ px: 3, py: 2 }}>{children}</Box>}
  </Box>
)

export default Panel
