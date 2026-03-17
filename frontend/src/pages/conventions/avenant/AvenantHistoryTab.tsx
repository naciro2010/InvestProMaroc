import { Box, Typography } from '@mui/material'
import { colors, typography } from '@/lib/designSystem'
import type { AvenantConventionResponse } from '@/types/avenantConvention'

interface AvenantHistoryTabProps {
  avenant: AvenantConventionResponse
  formatDate: (dateStr: string | undefined) => string
}

const AvenantHistoryTab = ({ avenant, formatDate }: AvenantHistoryTabProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.neutral[400] }} />
        <Box sx={{ width: 2, height: 40, bgcolor: colors.border }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>Cree</Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          {formatDate(avenant.createdAt)} par {avenant.createdByName || 'Systeme'}
        </Typography>
      </Box>
    </Box>
    {avenant.dateSoumission && (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.info[500] }} />
          <Box sx={{ width: 2, height: 40, bgcolor: colors.border }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>Soumis pour validation</Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            {formatDate(avenant.dateSoumission)} par {avenant.soumisParName || 'Utilisateur'}
          </Typography>
        </Box>
      </Box>
    )}
    {avenant.dateValidation && (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.success[500] }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>Valide</Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            {formatDate(avenant.dateValidation)} par {avenant.valideParName || 'Administrateur'}
          </Typography>
        </Box>
      </Box>
    )}
  </Box>
)

export default AvenantHistoryTab
