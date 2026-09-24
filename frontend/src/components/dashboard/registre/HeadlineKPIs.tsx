import { Box } from '@mui/material'
import { BudgetExecutionDTO, ExecutiveKPIs } from '@/lib/api'
import { colors, componentStyles } from '@/lib/designSystem'
import { formatMillions, formatPercent } from '@/lib/utils'

interface HeadlineKPIsProps {
  kpis: ExecutiveKPIs
  budget: BudgetExecutionDTO
}

interface Kpi {
  label: string
  value: string
  hint: string
}

/** 4 KPI de l'accueil : budget, engagé, décomptes, payé. */
const HeadlineKPIs = ({ kpis, budget }: HeadlineKPIsProps) => {
  const items: Kpi[] = [
    {
      label: 'Budget des conventions',
      value: formatMillions(kpis.budgetConventions),
      hint: `${kpis.totalConventions} convention${kpis.totalConventions > 1 ? 's' : ''} cadre et spécifiques`,
    },
    {
      label: 'Engagé sur marchés',
      value: formatMillions(kpis.engagementMarches),
      hint: `${formatPercent(kpis.tauxEngagement)} du budget`,
    },
    {
      label: 'Décomptes émis',
      value: String(kpis.totalDecomptes),
      hint: `${kpis.decomptesEnAttente} en attente de traitement`,
    },
    {
      label: 'Payé',
      value: formatMillions(kpis.totalPaye),
      hint: `${formatMillions(budget.resteAPayer)} restant à payer`,
    },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 2, mb: 2.5 }}>
      {items.map(k => (
        <Box key={k.label} sx={componentStyles.statCard}>
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>{k.label}</Box>
          <Box sx={{ ...componentStyles.kpiValue, my: 0.5 }}>{k.value}</Box>
          <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>{k.hint}</Box>
        </Box>
      ))}
    </Box>
  )
}

export default HeadlineKPIs
