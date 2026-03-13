import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Target } from 'lucide-react'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import { BudgetExecutionDTO } from '@/lib/api'
import { SectionHeader, formatLargeCurrency } from './types'

interface Props {
  budget: BudgetExecutionDTO
}

const DashboardBudgetExecution = ({ budget }: Props) => {
  const navigate = useNavigate()

  const pieData = [
    { name: 'Paye', value: budget.paye, color: colors.success[400] },
    { name: 'Reste a payer', value: budget.resteAPayer, color: colors.warning[300] },
    { name: 'Non engage', value: budget.resteBudget, color: colors.neutral[200] },
  ].filter(d => d.value > 0)

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<Target size={16} />} title="Execution budgetaire" />
      <Box sx={{ p: 2.5 }}>
        {/* Donut + Summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
          <Box sx={{ width: 130, height: 130, flexShrink: 0, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%"
                  innerRadius={38} outerRadius={58}
                  paddingAngle={2} dataKey="value" stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', textAlign: 'center',
            }}>
              <Typography sx={{
                fontSize: typography.sizes.lg, fontWeight: typography.weights.bold,
                color: colors.textPrimary, lineHeight: 1.1,
              }}>
                {budget.tauxPaiement.toFixed(0)}%
              </Typography>
              <Typography sx={{ fontSize: 9, color: colors.textDisabled }}>
                paye
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1} sx={{ flex: 1 }}>
            <SummaryRow label="Budget total" value={budget.budgetTotal} color={colors.textPrimary} bold />
            <SummaryRow label="Engage" value={budget.engage} color={colors.primary[600]} />
            <SummaryRow label="Paye" value={budget.paye} color={colors.success[600]} />
            <SummaryRow label="Reste budget" value={budget.resteBudget} color={colors.neutral[500]} />
            <SummaryRow label="Reste a payer" value={budget.resteAPayer} color={colors.warning[600]} />
          </Stack>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
          {pieData.map(d => (
            <Stack key={d.name} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
              <Typography sx={{ fontSize: typography.sizes['2xs'], color: colors.textSecondary }}>
                {d.name}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Per-convention breakdown */}
        {budget.byConvention.length > 0 && (
          <>
            <Typography sx={{
              fontSize: typography.sizes.xs, color: colors.textDisabled,
              fontWeight: typography.weights.medium, mb: 1.5,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Par convention
            </Typography>
            <Stack spacing={1.5}>
              {budget.byConvention.map((conv) => (
                <Box
                  key={conv.id}
                  onClick={() => navigate(`/conventions/${conv.id}`)}
                  sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.25 }}>
                    <Typography sx={{
                      fontSize: typography.sizes.xs, fontWeight: typography.weights.medium,
                      color: colors.textPrimary,
                    }}>
                      {conv.code}
                    </Typography>
                    <Typography sx={{
                      fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
                      color: conv.tauxEngagement > 80 ? colors.danger[600]
                        : conv.tauxEngagement > 50 ? colors.warning[600]
                        : colors.primary[600],
                    }}>
                      {conv.tauxEngagement.toFixed(0)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(conv.tauxEngagement, 100)}
                    sx={{
                      height: 4, borderRadius: borders.radius.full, bgcolor: colors.neutral[100],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: borders.radius.full,
                        bgcolor: conv.tauxEngagement > 80 ? colors.danger[400]
                          : conv.tauxEngagement > 50 ? colors.warning[400]
                          : colors.primary[400],
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.25 }}>
                    <Typography sx={{ fontSize: 9, color: colors.textDisabled }}>
                      {formatLargeCurrency(conv.engage)} / {formatLargeCurrency(conv.budget)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  )
}

const SummaryRow = ({ label, value, color, bold }: {
  label: string; value: number; color: string; bold?: boolean
}) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
      {label}
    </Typography>
    <Typography sx={{
      fontSize: typography.sizes.xs,
      fontWeight: bold ? typography.weights.bold : typography.weights.semibold,
      color,
    }}>
      {formatLargeCurrency(value)}
    </Typography>
  </Stack>
)

export default DashboardBudgetExecution
