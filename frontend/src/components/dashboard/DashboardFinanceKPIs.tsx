import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'
import {
  FileText, FolderOpen, Receipt, Banknote,
  Users, AlertTriangle, TrendingUp, TrendingDown,
} from 'lucide-react'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import { ExecutiveKPIs } from '@/lib/api'
import { formatLargeCurrency } from './types'

interface Props {
  kpis: ExecutiveKPIs
}

interface MiniKPI {
  label: string
  value: string | number
  subtitle: string
  icon: React.ReactElement
  color: string
  bgColor: string
  path: string
  badge?: { text: string; color: string }
}

const DashboardFinanceKPIs = ({ kpis }: Props) => {
  const navigate = useNavigate()

  const mainKPIs: MiniKPI[] = [
    {
      label: 'Budget Conventions',
      value: formatLargeCurrency(kpis.budgetConventions),
      subtitle: `${kpis.totalConventions} conventions`,
      icon: <FileText size={18} />,
      color: colors.primary[600],
      bgColor: colors.primary[50],
      path: '/conventions',
      badge: kpis.conventionsEnAttente > 0
        ? { text: `${kpis.conventionsEnAttente} en attente`, color: colors.warning[600] }
        : undefined,
    },
    {
      label: 'Engagements Marches',
      value: formatLargeCurrency(kpis.engagementMarches),
      subtitle: `${kpis.totalMarches} marches`,
      icon: <Receipt size={18} />,
      color: colors.info[600],
      bgColor: colors.info[50],
      path: '/marches',
      badge: kpis.marchesEnRetard > 0
        ? { text: `${kpis.marchesEnRetard} en retard`, color: colors.danger[600] }
        : undefined,
    },
    {
      label: 'Budget Projets',
      value: formatLargeCurrency(kpis.budgetProjets),
      subtitle: `${kpis.totalProjets} projets (${kpis.projetsActifs} actifs)`,
      icon: <FolderOpen size={18} />,
      color: colors.purple[600],
      bgColor: colors.purple[50],
      path: '/projets',
    },
    {
      label: 'Total Paye',
      value: formatLargeCurrency(kpis.totalPaye),
      subtitle: `${kpis.totalPaiements} paiements`,
      icon: <Banknote size={18} />,
      color: colors.success[600],
      bgColor: colors.success[50],
      path: '/paiements',
    },
  ]

  return (
    <Box sx={{ mb: 3 }}>
      {/* Main KPIs Row */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 2.5,
      }}>
        {mainKPIs.map((kpi) => (
          <Box
            key={kpi.path}
            onClick={() => navigate(kpi.path)}
            sx={{
              ...componentStyles.card,
              cursor: 'pointer',
              p: 2.5,
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: kpi.color, transform: 'translateY(-1px)' },
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 34, height: 34, borderRadius: borders.radius.lg,
                    bgcolor: kpi.bgColor, color: kpi.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {kpi.icon}
                  </Box>
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {kpi.label}
                  </Typography>
                </Stack>
              </Stack>
              <Typography sx={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
                lineHeight: 1.1,
              }}>
                {kpi.value}
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                  {kpi.subtitle}
                </Typography>
                {kpi.badge && (
                  <Box sx={{
                    px: 1, py: 0.25, borderRadius: borders.radius.md,
                    bgcolor: `${kpi.badge.color}10`, display: 'flex', alignItems: 'center', gap: 0.5,
                  }}>
                    <AlertTriangle size={10} color={kpi.badge.color} />
                    <Typography sx={{
                      fontSize: typography.sizes['2xs'], color: kpi.badge.color,
                      fontWeight: typography.weights.semibold,
                    }}>
                      {kpi.badge.text}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Engagement & Consumption Gauges */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
      }}>
        <GaugeBar
          label="Taux d'engagement"
          value={kpis.tauxEngagement}
          detail={`${formatLargeCurrency(kpis.engagementMarches)} / ${formatLargeCurrency(kpis.budgetConventions)}`}
          icon={<TrendingUp size={14} />}
        />
        <GaugeBar
          label="Taux de consommation"
          value={kpis.tauxConsommation}
          detail={`${formatLargeCurrency(kpis.totalPaye)} / ${formatLargeCurrency(kpis.budgetConventions)}`}
          icon={<TrendingDown size={14} />}
        />
      </Box>
    </Box>
  )
}

const GaugeBar = ({ label, value, detail, icon }: {
  label: string; value: number; detail: string; icon: React.ReactElement
}) => {
  const clampedValue = Math.min(value, 100)
  const barColor = clampedValue > 90 ? colors.danger[500]
    : clampedValue > 70 ? colors.warning[500]
    : colors.primary[500]

  return (
    <Box sx={{ ...componentStyles.card, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{ color: colors.textDisabled, display: 'flex' }}>{icon}</Box>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.textSecondary,
          }}>
            {label}
          </Typography>
        </Stack>
        <Typography sx={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.bold,
          color: barColor,
        }}>
          {value.toFixed(1)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={clampedValue}
        sx={{
          height: 6, borderRadius: borders.radius.full, bgcolor: colors.neutral[100],
          '& .MuiLinearProgress-bar': { borderRadius: borders.radius.full, bgcolor: barColor },
        }}
      />
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textDisabled, mt: 0.75 }}>
        {detail}
      </Typography>
    </Box>
  )
}

export default DashboardFinanceKPIs
