import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Stack, LinearProgress } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { colors, typography, componentStyles, chartColors, spacing, borders } from '@/lib/designSystem'
import { reportingAPI, PaiementStatsDTO } from '@/lib/api'

const formatMontant = (montant: number): string => {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M MAD`
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K MAD`
  return `${montant.toFixed(2)} MAD`
}

interface ReportingPaiementsCardProps {
  refreshKey: number
}

const ReportingPaiementsCard = ({ refreshKey }: ReportingPaiementsCardProps) => {
  const [stats, setStats] = useState<PaiementStatsDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data } = await reportingAPI.getPaiementStats()
        if (data.data) setStats(data.data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement paiements:', msg)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey])

  if (loading) {
    return (
      <Box sx={{ ...componentStyles.sectionCard, display: 'flex', justifyContent: 'center', py: spacing.mui['3xl'] }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!stats) return null

  const pieData = [
    { name: 'Paye', value: stats.totalPaye, color: chartColors.success },
    { name: 'En attente', value: stats.totalEnAttente, color: chartColors.warning },
  ]

  const total = stats.totalPaye + stats.totalEnAttente

  return (
    <Box sx={componentStyles.sectionCard}>
      <Box sx={componentStyles.sectionCardHeader}>
        <Typography sx={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
        }}>
          Situation des Paiements
        </Typography>
      </Box>
      <Box sx={componentStyles.sectionCardBody}>
        {/* Progress bar */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
              Taux de paiement
            </Typography>
            <Typography sx={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.bold,
              color: stats.tauxPaiement >= 75 ? colors.success[600] : stats.tauxPaiement >= 50 ? colors.warning[600] : colors.danger[600],
            }}>
              {stats.tauxPaiement.toFixed(1)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(stats.tauxPaiement, 100)}
            sx={{
              height: 8,
              borderRadius: borders.radius.full,
              backgroundColor: colors.neutral[100],
              '& .MuiLinearProgress-bar': {
                borderRadius: borders.radius.full,
                backgroundColor: stats.tauxPaiement >= 75 ? colors.success[500] : stats.tauxPaiement >= 50 ? colors.warning[500] : colors.danger[500],
              },
            }}
          />
        </Box>

        {/* Pie Chart */}
        {total > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={2}
                stroke={colors.surface}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMontant(Number(value) || 0)}
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: typography.sizes.sm,
                }}
              />
              <Legend wrapperStyle={{ fontSize: typography.sizes.xs }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Stats summary */}
        <Stack spacing={1.5} mt={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"
            sx={{ py: 1, borderBottom: `1px solid ${colors.divider}` }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: borders.radius.full, bgcolor: colors.success[500] }} />
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Payes ({stats.nombrePaiements})
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
              {formatMontant(stats.totalPaye)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center"
            sx={{ py: 1 }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: borders.radius.full, bgcolor: colors.warning[500] }} />
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                En attente ({stats.nombreEnAttente})
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
              {formatMontant(stats.totalEnAttente)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default ReportingPaiementsCard
