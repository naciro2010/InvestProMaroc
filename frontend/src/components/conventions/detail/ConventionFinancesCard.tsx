import React from 'react'
import { Box, Paper, Typography, Skeleton, Alert, Divider } from '@mui/material'
import { AccountBalance, TrendingUp, Calculate, Percent } from '@mui/icons-material'
import { useConventionFinances } from '@/hooks/useConventionData'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ConventionFinancesCardProps {
  conventionId: number
}

const ConventionFinancesCard = ({ conventionId }: ConventionFinancesCardProps) => {
  const { data: finances, loading, error } = useConventionFinances(conventionId)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

  const formatPercent = (value: number) => `${value.toFixed(2)}%`

  const getBaseCalculLabel = (baseCalcul: string) => {
    const labels: Record<string, string> = {
      DECAISSEMENTS_HT: 'Decaissements HT',
      DECAISSEMENTS_TTC: 'Decaissements TTC',
      MONTANT_HT: 'Montant HT',
      MONTANT_TTC: 'Montant TTC',
      MONTANT_MARCHE: 'Montant Marche',
    }
    return labels[baseCalcul] || baseCalcul
  }

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2, borderColor: colors.border }} />
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px' }} />
        </Box>
      </Paper>
    )
  }

  if (error || !finances) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Alert severity="error">Erreur lors du chargement des informations financieres</Alert>
      </Paper>
    )
  }

  const MetricCard = ({ icon, label, value, color, subtitle }: {
    icon: React.ReactNode
    label: string
    value: string
    color: string
    subtitle?: string
  }) => (
    <Box sx={{
      p: 2,
      bgcolor: `${color}08`,
      borderRadius: '10px',
      border: `1px solid ${color}20`,
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: `${color}40` },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          bgcolor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: color,
        lineHeight: 1.2,
      }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )

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
          bgcolor: colors.success[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AccountBalance sx={{ color: colors.success[600], fontSize: 20 }} />
        </Box>
        <Typography sx={{
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          fontSize: typography.sizes.md,
        }}>
          Informations financieres
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <MetricCard
            icon={<AccountBalance sx={{ fontSize: 16 }} />}
            label="Budget Total"
            value={formatCurrency(finances.budget)}
            color={colors.success[600]}
          />

          {finances.montantCommissionEstime !== null && (
            <MetricCard
              icon={<Calculate sx={{ fontSize: 16 }} />}
              label="Commission Estimee"
              value={formatCurrency(finances.montantCommissionEstime)}
              color={colors.info[600]}
            />
          )}

          <MetricCard
            icon={<TrendingUp sx={{ fontSize: 16 }} />}
            label="Taux de Commission"
            value={formatPercent(finances.tauxCommission)}
            color={colors.neutral[600]}
            subtitle={getBaseCalculLabel(finances.baseCalcul)}
          />

          <MetricCard
            icon={<Percent sx={{ fontSize: 16 }} />}
            label="Taux TVA"
            value={formatPercent(finances.tauxTva)}
            color={colors.neutral[600]}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionFinancesCard
