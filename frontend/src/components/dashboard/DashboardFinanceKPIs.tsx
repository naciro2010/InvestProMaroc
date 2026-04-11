import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'
import {
  FileText, FolderOpen, Receipt, Banknote,
  AlertTriangle, TrendingUp, TrendingDown, Minus,
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
  rawValue: number
  maxValue: number
  subtitle: string
  icon: React.ReactElement
  color: string
  bgColor: string
  path: string
  trendValue: number
  trendLabel: string
  badge?: { text: string; color: string }
}

const TrendIndicator = ({ value, label }: { value: number; label: string }) => {
  const isPositive = value > 0
  const isNeutral = value === 0
  const trendColor = isNeutral
    ? colors.textDisabled
    : isPositive
      ? colors.success[600]
      : colors.danger[600]

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Icon size={11} color={trendColor} />
      <Typography sx={{
        fontSize: '10px',
        fontWeight: typography.weights.semibold,
        color: trendColor,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Typography>
      <Typography sx={{
        fontSize: '10px',
        color: colors.textDisabled,
      }}>
        {label}
      </Typography>
    </Stack>
  )
}

const DashboardFinanceKPIs = ({ kpis }: Props) => {
  const navigate = useNavigate()

  const totalBudget = Math.max(kpis.budgetConventions, 1)

  const mainKPIs: MiniKPI[] = [
    {
      label: 'Budget Conventions',
      value: formatLargeCurrency(kpis.budgetConventions),
      rawValue: kpis.budgetConventions,
      maxValue: totalBudget,
      subtitle: `${kpis.totalConventions} conventions`,
      icon: <FileText size={16} />,
      color: colors.primary[600],
      bgColor: colors.primary[50],
      path: '/conventions',
      trendValue: kpis.totalConventions > 0
        ? ((kpis.totalConventions - kpis.conventionsEnAttente) / kpis.totalConventions) * 100 - 50
        : 0,
      trendLabel: 'validees',
      badge: kpis.conventionsEnAttente > 0
        ? { text: `${kpis.conventionsEnAttente} en attente`, color: colors.warning[600] }
        : undefined,
    },
    {
      label: 'Engagements Marches',
      value: formatLargeCurrency(kpis.engagementMarches),
      rawValue: kpis.engagementMarches,
      maxValue: totalBudget,
      subtitle: `${kpis.totalMarches} marches`,
      icon: <Receipt size={16} />,
      color: colors.info[600],
      bgColor: colors.info[50],
      path: '/marches',
      trendValue: kpis.tauxEngagement > 50 ? kpis.tauxEngagement - 50 : -(50 - kpis.tauxEngagement),
      trendLabel: 'engagement',
      badge: kpis.marchesEnRetard > 0
        ? { text: `${kpis.marchesEnRetard} en retard`, color: colors.danger[600] }
        : undefined,
    },
    {
      label: 'Budget Projets',
      value: formatLargeCurrency(kpis.budgetProjets),
      rawValue: kpis.budgetProjets,
      maxValue: totalBudget,
      subtitle: `${kpis.totalProjets} projets (${kpis.projetsActifs} actifs)`,
      icon: <FolderOpen size={16} />,
      color: colors.purple[600],
      bgColor: colors.purple[50],
      path: '/projets',
      trendValue: kpis.totalProjets > 0
        ? (kpis.projetsActifs / kpis.totalProjets) * 100 - 50
        : 0,
      trendLabel: 'actifs',
    },
    {
      label: 'Total Paye',
      value: formatLargeCurrency(kpis.totalPaye),
      rawValue: kpis.totalPaye,
      maxValue: totalBudget,
      subtitle: `${kpis.totalPaiements} paiements`,
      icon: <Banknote size={16} />,
      color: colors.success[600],
      bgColor: colors.success[50],
      path: '/paiements',
      trendValue: kpis.tauxConsommation > 0 ? kpis.tauxConsommation - 30 : 0,
      trendLabel: 'consommation',
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
        {mainKPIs.map((kpi) => {
          const progressValue = Math.min((kpi.rawValue / kpi.maxValue) * 100, 100)

          return (
            <Box
              key={kpi.path}
              onClick={() => navigate(kpi.path)}
              sx={{
                ...componentStyles.card,
                cursor: 'pointer',
                p: 2,
                pl: 2.5,
                borderLeft: `3px solid ${kpi.color}`,
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: kpi.color, transform: 'translateY(-1px)' },
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: borders.radius.md,
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
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {kpi.value}
                </Typography>

                <TrendIndicator value={kpi.trendValue} label={kpi.trendLabel} />

                <Box sx={{ mt: 0.25 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{
                      height: 3,
                      borderRadius: borders.radius.full,
                      bgcolor: colors.neutral[100],
                      '& .MuiLinearProgress-bar': {
                        bgcolor: kpi.color,
                        borderRadius: borders.radius.full,
                      },
                    }}
                  />
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
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
          )
        })}
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

const getGaugeColor = (value: number): string => {
  if (value <= 60) return colors.success[500]
  if (value <= 80) return colors.warning[500]
  return colors.danger[500]
}

const GaugeBar = ({ label, value, detail, icon }: {
  label: string; value: number; detail: string; icon: React.ReactElement
}) => {
  const clampedValue = Math.min(value, 100)
  const barColor = getGaugeColor(clampedValue)

  return (
    <Box sx={{
      ...componentStyles.card,
      p: 2,
      borderLeft: `3px solid ${barColor}`,
      backgroundImage: `repeating-linear-gradient(
        135deg,
        transparent,
        transparent 10px,
        ${colors.neutral[50]} 10px,
        ${colors.neutral[50]} 11px
      )`,
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
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
          fontSize: typography.sizes.xl,
          fontWeight: typography.weights.bold,
          color: barColor,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value.toFixed(1)}%
        </Typography>
      </Stack>
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={clampedValue}
          sx={{
            height: 8,
            borderRadius: borders.radius.full,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': {
              borderRadius: borders.radius.full,
              bgcolor: barColor,
              transition: 'transform 0.6s ease',
            },
          }}
        />
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.75 }}>
        <Typography sx={{
          fontSize: typography.sizes.xs,
          color: colors.textDisabled,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {detail}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {[60, 80, 100].map((threshold) => (
            <Box
              key={threshold}
              sx={{
                width: 6, height: 6, borderRadius: '50%',
                bgcolor: clampedValue >= threshold
                  ? getGaugeColor(threshold)
                  : colors.neutral[200],
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default DashboardFinanceKPIs
