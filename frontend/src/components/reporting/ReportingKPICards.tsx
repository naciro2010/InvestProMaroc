import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Stack } from '@mui/material'
import { TrendingUp, TrendingDown, Receipt, DollarSign, CreditCard, Percent } from 'lucide-react'
import { colors, typography, componentStyles, spacing, borders } from '@/lib/designSystem'
import { reportingAPI, DashboardStatsDTO } from '@/lib/api'

const formatMontant = (montant: number): string => {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M`
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`
  return montant.toFixed(2)
}

interface KPICardProps {
  label: string
  value: string
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  trend?: { value: number; label: string }
}

const KPICard = ({ label, value, subtitle, icon, iconBg, trend }: KPICardProps) => (
  <Box sx={componentStyles.statCard}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{
          fontSize: typography.sizes.sm,
          color: colors.textSecondary,
          fontWeight: typography.weights.medium,
          mb: 0.5,
        }}>
          {label}
        </Typography>
        <Typography sx={{
          fontSize: typography.sizes['2xl'],
          fontWeight: typography.weights.bold,
          color: colors.textPrimary,
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          {subtitle}
        </Typography>
      </Box>
      <Box sx={{
        ...componentStyles.statCardIcon,
        backgroundColor: iconBg,
      }}>
        {icon}
      </Box>
    </Stack>
    {trend && (
      <Box sx={{
        mt: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: borders.radius.full,
        backgroundColor: trend.value >= 0 ? colors.success[50] : colors.danger[50],
        color: trend.value >= 0 ? colors.success[700] : colors.danger[700],
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
      }}>
        {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend.label}
      </Box>
    )}
  </Box>
)

interface ReportingKPICardsProps {
  refreshKey: number
}

const ReportingKPICards = ({ refreshKey }: ReportingKPICardsProps) => {
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const { data } = await reportingAPI.getDashboard()
        if (data.data) setStats(data.data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement stats reporting:', msg)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [refreshKey])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing.mui['3xl'] }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (!stats) return null

  const kpis: KPICardProps[] = [
    {
      label: 'Total Depenses TTC',
      value: `${formatMontant(stats.depenses.totalTtc)} MAD`,
      subtitle: `${stats.depenses.total} depenses enregistrees`,
      icon: <Receipt size={20} color={colors.primary[600]} />,
      iconBg: colors.primary[50],
      trend: stats.depenses.moisEnCours > 0
        ? { value: 1, label: `${formatMontant(stats.depenses.moisEnCours)} MAD ce mois` }
        : undefined,
    },
    {
      label: 'Total Commissions TTC',
      value: `${formatMontant(stats.commissions.totalTtc)} MAD`,
      subtitle: `${stats.commissions.total} commissions calculees`,
      icon: <DollarSign size={20} color={colors.success[600]} />,
      iconBg: colors.success[50],
      trend: stats.commissions.moisEnCours > 0
        ? { value: 1, label: `${formatMontant(stats.commissions.moisEnCours)} MAD ce mois` }
        : undefined,
    },
    {
      label: 'Paiements Effectues',
      value: `${formatMontant(stats.paiements.totalPaye)} MAD`,
      subtitle: `${stats.paiements.nombrePaiements} paiements traites`,
      icon: <CreditCard size={20} color={colors.info[600]} />,
      iconBg: colors.info[50],
    },
    {
      label: 'Taux de Paiement',
      value: `${stats.paiements.tauxPaiement.toFixed(1)}%`,
      subtitle: `${stats.paiements.nombreEnAttente} en attente`,
      icon: <Percent size={20} color={colors.warning[600]} />,
      iconBg: colors.warning[50],
      trend: stats.paiements.totalEnAttente > 0
        ? { value: -1, label: `${formatMontant(stats.paiements.totalEnAttente)} MAD en attente` }
        : undefined,
    },
  ]

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
      gap: 2.5,
      mb: 3,
    }}>
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </Box>
  )
}

export default ReportingKPICards
