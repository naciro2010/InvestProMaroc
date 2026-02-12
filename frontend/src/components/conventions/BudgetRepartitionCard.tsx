import { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from '@mui/material'
import { PieChart, AccountBalance, Warning } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'

interface PartenaireAllocation {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface BudgetRepartitionCardProps {
  conventionId: number
  conventionBudget: number
}

const ALLOCATION_COLORS = [
  colors.primary[600],
  colors.success[600],
  colors.info[600],
  colors.purple[600],
  colors.warning[600],
  colors.danger[500],
  colors.primary[400],
  colors.success[400],
] as const

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)

const formatPercent = (value: number): string => `${value.toFixed(1)}%`

/**
 * MICRO-COMPONENT: BudgetRepartitionCard
 * Displays budget allocation across partenaires with visual progress bars.
 * Loads data independently via GET /conventions/{id}/partenaires
 */
const BudgetRepartitionCard = ({
  conventionId,
  conventionBudget,
}: BudgetRepartitionCardProps) => {
  const [partenaires, setPartenaires] = useState<PartenaireAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPartenaires = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await conventionsAPI.getPartenaires(conventionId)
        const data = response.data.data || response.data || []
        setPartenaires(Array.isArray(data) ? data : [])
      } catch {
        setError('Erreur lors du chargement')
        setPartenaires([])
      } finally {
        setLoading(false)
      }
    }

    loadPartenaires()
  }, [conventionId])

  const totalAlloue = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
  const restant = conventionBudget - totalAlloue
  const pourcentageAlloue = conventionBudget > 0
    ? (totalAlloue / conventionBudget) * 100
    : 0
  const isOverAllocated = totalAlloue > conventionBudget

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>{error}</Typography>
      </Paper>
    )
  }

  if (partenaires.length === 0) {
    return null
  }

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 3, py: 2, borderBottom: `1px solid ${colors.border}`,
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: borders.radius.lg,
          bgcolor: colors.primary[50],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PieChart sx={{ color: colors.primary[600], fontSize: 20 }} />
        </Box>
        <Typography sx={{
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          fontSize: typography.sizes.md,
        }}>
          Repartition du Budget
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2.5 }}>
        {/* Total budget summary */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance sx={{ fontSize: 16, color: colors.textSecondary }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
              Budget total
            </Typography>
          </Box>
          <Typography sx={{
            fontSize: typography.sizes.lg, fontWeight: typography.weights.bold,
            color: colors.textPrimary,
          }}>
            {formatCurrency(conventionBudget)}
          </Typography>
        </Box>

        {/* Overall allocation bar */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              Alloue: {formatCurrency(totalAlloue)} ({formatPercent(pourcentageAlloue)})
            </Typography>
            <Typography sx={{
              fontSize: typography.sizes.xs,
              color: isOverAllocated ? colors.danger[600] : colors.success[600],
              fontWeight: typography.weights.medium,
            }}>
              {isOverAllocated ? 'Depassement' : 'Restant'}: {formatCurrency(Math.abs(restant))}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(pourcentageAlloue, 100)}
            sx={{
              height: 8, borderRadius: borders.radius.full,
              bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': {
                borderRadius: borders.radius.full,
                bgcolor: isOverAllocated ? colors.danger[500] : colors.primary[600],
              },
            }}
          />
          {isOverAllocated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Warning sx={{ fontSize: 14, color: colors.danger[500] }} />
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.danger[600] }}>
                Le budget alloue depasse le budget total de {formatCurrency(totalAlloue - conventionBudget)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Partenaire allocations */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {partenaires.map((p, index) => {
            const barColor = ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]
            const partPct = conventionBudget > 0
              ? (p.budgetAlloue / conventionBudget) * 100
              : 0

            return (
              <Box key={p.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Tooltip title={p.partenaireNom} placement="top">
                    <Typography sx={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.textPrimary,
                      maxWidth: '60%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.partenaireSigle || p.partenaireCode}
                    </Typography>
                  </Tooltip>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{
                      fontSize: typography.sizes.xs,
                      color: colors.textSecondary,
                    }}>
                      {formatPercent(partPct)}
                    </Typography>
                    <Typography sx={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.semibold,
                      color: barColor,
                    }}>
                      {formatCurrency(p.budgetAlloue)}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(partPct, 100)}
                  sx={{
                    height: 6, borderRadius: borders.radius.full,
                    bgcolor: colors.neutral[100],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: borders.radius.full,
                      bgcolor: barColor,
                    },
                  }}
                />
              </Box>
            )
          })}
        </Box>
      </Box>
    </Paper>
  )
}

export default BudgetRepartitionCard
