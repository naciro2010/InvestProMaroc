import { Box, Typography, LinearProgress } from '@mui/material'
import { colors, typography, borders } from '@/lib/designSystem'

interface BudgetAllocationBannerProps {
  conventionBudget: number
  allocatedBudget: number
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const BudgetAllocationBanner = ({ conventionBudget, allocatedBudget }: BudgetAllocationBannerProps) => {
  const remaining = conventionBudget - allocatedBudget
  const allocationPct = conventionBudget > 0 ? (allocatedBudget / conventionBudget) * 100 : 0

  return (
    <Box sx={{
      p: 1.5, borderRadius: borders.radius.md,
      bgcolor: colors.primary[25],
      border: `1px solid ${colors.primary[100]}`,
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          Budget convention
        </Typography>
        <Typography sx={{
          fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
          color: colors.primary[700],
        }}>
          {formatCurrency(conventionBudget)}
        </Typography>
      </Box>
      {allocatedBudget > 0 && (
        <>
          <LinearProgress
            variant="determinate"
            value={Math.min(allocationPct, 100)}
            sx={{
              height: 3, borderRadius: borders.radius.full, mb: 0.5,
              bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': {
                borderRadius: borders.radius.full,
                bgcolor: remaining < 0 ? colors.danger[500] : colors.primary[500],
              },
            }}
          />
          <Typography sx={{
            fontSize: '11px',
            color: remaining < 0 ? colors.danger[600] : colors.textSecondary,
          }}>
            {remaining >= 0
              ? `Restant: ${formatCurrency(remaining)}`
              : `Depassement: ${formatCurrency(Math.abs(remaining))}`
            }
          </Typography>
        </>
      )}
    </Box>
  )
}

export default BudgetAllocationBanner
