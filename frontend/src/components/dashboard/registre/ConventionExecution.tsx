import { Box, ButtonBase } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ConventionBudgetDTO } from '@/lib/api'
import { Panel, DualProgress } from '@/components/core'
import { colors } from '@/lib/designSystem'
import { formatMillions, formatPercent } from '@/lib/utils'

interface ConventionExecutionProps {
  rows: ConventionBudgetDTO[]
}

const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0)

/** Exécution par convention : lignes cliquables, barre engagé/payé, % engagé. */
const ConventionExecution = ({ rows }: ConventionExecutionProps) => {
  const navigate = useNavigate()

  return (
    <Panel title="Exécution par convention" aside="engagé · payé" flush>
      {rows.length === 0 ? (
        <Box sx={{ px: 3, py: 2, fontSize: 13, color: colors.textTertiary }}>Aucune convention budgétée.</Box>
      ) : rows.map(r => (
        <ButtonBase
          key={r.id}
          onClick={() => navigate(`/conventions/${r.id}`)}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            columnGap: 3,
            rowGap: 0.75,
            width: '100%',
            textAlign: 'left',
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${colors.borderSubtle}`,
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': { bgcolor: 'rgba(247,243,234,.7)' },
          }}
        >
          <Box sx={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, minWidth: 0 }}>{r.code}</Box>
          <Box sx={{ fontSize: 12.5, color: colors.textSecondary, textAlign: 'right', whiteSpace: 'nowrap' }}>
            {formatMillions(r.budget)}
          </Box>
          <DualProgress engaged={pct(r.engage, r.budget)} paid={pct(r.paye, r.budget)} />
          <Box sx={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, textAlign: 'right', whiteSpace: 'nowrap' }}>
            {formatPercent(r.tauxEngagement)}
          </Box>
        </ButtonBase>
      ))}
    </Panel>
  )
}

export default ConventionExecution
