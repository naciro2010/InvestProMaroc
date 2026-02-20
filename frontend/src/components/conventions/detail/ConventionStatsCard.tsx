import React from 'react'
import { Box, Paper, Typography, Skeleton, Alert, LinearProgress } from '@mui/material'
import { Assessment, FolderOpen, Business, AccountTree, TrendingUp } from '@mui/icons-material'
import { useConventionStats } from '@/hooks/useConventionData'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ConventionStatsCardProps {
  conventionId: number
  onStatClick?: (statType: 'projets' | 'marches' | 'sousConventions') => void
}

const ConventionStatsCard = ({ conventionId, onStatClick }: ConventionStatsCardProps) => {
  const { data: stats, loading, error } = useConventionStats(conventionId)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', notation: 'compact', maximumFractionDigits: 1 }).format(amount)

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: '10px' }} />
          ))}
        </Box>
      </Paper>
    )
  }

  if (error || !stats) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Alert severity="error">Erreur lors du chargement des statistiques</Alert>
      </Paper>
    )
  }

  const StatBox = ({ icon, value, label, color, onClick }: {
    icon: React.ReactNode
    value: string | number
    label: string
    color: string
    onClick?: () => void
  }) => (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        textAlign: 'center',
        bgcolor: `${color}08`,
        borderRadius: '10px',
        border: `1px solid ${color}20`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${color}20`,
          borderColor: `${color}40`,
        } : {},
      }}
    >
      <Box sx={{
        width: 40,
        height: 40,
        borderRadius: '10px',
        bgcolor: `${color}15`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1.5,
        color: color,
      }}>
        {icon}
      </Box>
      <Typography sx={{
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: color,
        lineHeight: 1,
        mb: 0.5,
      }}>
        {value}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
      }}>
        {label}
      </Typography>
    </Box>
  )

  const budget = stats.montantTotalProjets + stats.montantTotalMarches
  const maxBudget = Math.max(budget, 1)

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 2,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Box sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          bgcolor: colors.primary[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Assessment sx={{ color: colors.primary[600], fontSize: 20 }} />
        </Box>
        <Typography sx={{
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          fontSize: typography.sizes.md,
        }}>
          Statistiques
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2.5 }}>
        {/* KPI Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <StatBox
            icon={<FolderOpen sx={{ fontSize: 22 }} />}
            value={stats.nombreProjets}
            label="Projets lies"
            color={colors.primary[600]}
            onClick={() => onStatClick?.('projets')}
          />
          <StatBox
            icon={<Business sx={{ fontSize: 22 }} />}
            value={stats.nombreMarches}
            label="Marches lies"
            color={colors.purple[600]}
            onClick={() => onStatClick?.('marches')}
          />
          <StatBox
            icon={<AccountTree sx={{ fontSize: 22 }} />}
            value={stats.nombreSousConventions}
            label="Sous-conventions"
            color={colors.info[600]}
            onClick={() => onStatClick?.('sousConventions')}
          />
          <StatBox
            icon={<TrendingUp sx={{ fontSize: 22 }} />}
            value={`${stats.tauxRealisation.toFixed(1)}%`}
            label="Taux realisation"
            color={colors.success[600]}
          />
        </Box>

        {/* Financial Summary */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: colors.neutral[25], borderRadius: '8px', border: `1px solid ${colors.borderSubtle}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium, mb: 0.5 }}>
              Montant Total Projets
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              {formatCurrency(stats.montantTotalProjets)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={maxBudget > 0 ? Math.min((stats.montantTotalProjets / maxBudget) * 100, 100) : 0}
              sx={{
                mt: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: colors.neutral[100],
                '& .MuiLinearProgress-bar': { bgcolor: colors.primary[500], borderRadius: 2 },
              }}
            />
          </Box>
          <Box sx={{ p: 2, bgcolor: colors.neutral[25], borderRadius: '8px', border: `1px solid ${colors.borderSubtle}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium, mb: 0.5 }}>
              Montant Total Marches
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              {formatCurrency(stats.montantTotalMarches)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={maxBudget > 0 ? Math.min((stats.montantTotalMarches / maxBudget) * 100, 100) : 0}
              sx={{
                mt: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: colors.neutral[100],
                '& .MuiLinearProgress-bar': { bgcolor: colors.purple[500], borderRadius: 2 },
              }}
            />
          </Box>
          <Box sx={{
            p: 2,
            bgcolor: colors.warning[25],
            borderRadius: '8px',
            border: `1px solid ${colors.warning[100]}`,
            textAlign: 'center',
          }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium, mb: 0.5 }}>
              Commission Totale
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.warning[700] }}>
              {formatCurrency(stats.commissionTotale)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionStatsCard
