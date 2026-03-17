import { Box, Typography } from '@mui/material'
import { AccountBalance } from '@mui/icons-material'
import { colors, typography, borders } from '@/lib/designSystem'
import type { ParentConventionInfo } from './types'
import { formatCurrency } from './types'

interface ParentBudgetInfoProps {
  parentConvention: ParentConventionInfo
}

const ParentBudgetInfo = ({ parentConvention }: ParentBudgetInfoProps) => {
  const parentBudget = parentConvention.budget || 0
  if (parentBudget <= 0) return null

  return (
    <Box sx={{
      p: 2, borderRadius: borders.radius.md,
      bgcolor: colors.success[25],
      border: `1px solid ${colors.success[100]}`,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AccountBalance sx={{ fontSize: 18, color: colors.success[600] }} />
        <Typography sx={{
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.semibold,
          color: colors.success[700],
        }}>
          Budget Convention Principale
        </Typography>
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        gap: 1.5,
      }}>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Budget Total
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.bold,
            color: colors.success[700],
          }}>
            {formatCurrency(parentBudget)}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Taux Commission
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}>
            {parentConvention.tauxCommission}%
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Base de Calcul
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}>
            {parentConvention.baseCalcul === 'DECAISSEMENTS_TTC' ? 'TTC' : 'HT'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ParentBudgetInfo
