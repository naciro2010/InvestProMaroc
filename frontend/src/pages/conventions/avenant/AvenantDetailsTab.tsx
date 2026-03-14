import { Box, Typography } from '@mui/material'
import { colors, typography } from '@/lib/designSystem'
import type { AvenantConventionResponse } from '@/types/avenantConvention'

interface AvenantDetailsTabProps {
  avenant: AvenantConventionResponse
  formatDate: (dateStr: string | undefined) => string
}

const AvenantDetailsTab = ({ avenant, formatDate }: AvenantDetailsTabProps) => (
  <Box sx={{ display: 'grid', gap: 2 }}>
    {avenant.dateEffet && (
      <Box>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Date d'effet</Typography>
        <Typography sx={{ fontSize: typography.sizes.base }}>{formatDate(avenant.dateEffet)}</Typography>
      </Box>
    )}
    {avenant.ordreApplication !== undefined && (
      <Box>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Ordre d'application</Typography>
        <Typography sx={{ fontSize: typography.sizes.base }}>{avenant.ordreApplication}</Typography>
      </Box>
    )}
    {avenant.detailsModifications && (
      <Box>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Details des modifications</Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, mt: 0.5, whiteSpace: 'pre-wrap' }}>{avenant.detailsModifications}</Typography>
      </Box>
    )}
    {avenant.remarques && (
      <Box>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Remarques</Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, mt: 0.5 }}>{avenant.remarques}</Typography>
      </Box>
    )}
    {!avenant.dateEffet && !avenant.ordreApplication && !avenant.detailsModifications && !avenant.remarques && (
      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucun detail complementaire.</Typography>
    )}
  </Box>
)

export default AvenantDetailsTab
