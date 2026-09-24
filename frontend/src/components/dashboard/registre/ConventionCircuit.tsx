import { Box } from '@mui/material'
import { Panel } from '@/components/core'
import { colors, getStatusConfig } from '@/lib/designSystem'

interface ConventionCircuitProps {
  counts: Record<string, number>
}

const CIRCUIT = ['BROUILLON', 'SOUMIS', 'VALIDE', 'EN_EXECUTION', 'ACHEVE']
const EXCEPTIONS = ['REJETE', 'ANNULE']

/** L'API renvoie VALIDE ; VALIDEE est un alias historique côté front. */
const countOf = (counts: Record<string, number>, s: string) =>
  (counts[s] ?? 0) + (s === 'VALIDE' ? counts.VALIDEE ?? 0 : 0)

/** Circuit des conventions : barres horizontales par statut, de Brouillon à Achevé. */
const ConventionCircuit = ({ counts }: ConventionCircuitProps) => {
  const statuses = [...CIRCUIT, ...EXCEPTIONS.filter(s => countOf(counts, s) > 0)]
  const max = Math.max(1, ...statuses.map(s => countOf(counts, s)))

  return (
    <Panel title="Circuit des conventions">
      <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr) 32px', alignItems: 'center', rowGap: 1.25, columnGap: 2 }}>
        {statuses.map(s => {
          const n = countOf(counts, s)
          const danger = EXCEPTIONS.includes(s)
          return (
            <Box key={s} sx={{ display: 'contents' }}>
              <Box component="dt" sx={{ fontSize: 13.5, color: colors.textSecondary }}>{getStatusConfig(s).label}</Box>
              <Box component="dd" sx={{ m: 0, height: 18, borderRadius: '4px', bgcolor: colors.surfaceAlt, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${(n / max) * 100}%`,
                    minWidth: n > 0 ? 6 : 0,
                    borderRadius: '4px',
                    bgcolor: danger ? colors.danger[600] : colors.ink.main,
                    boxShadow: `inset 0 -2px 0 ${danger ? colors.danger[300] : colors.brass.main}`,
                  }}
                />
              </Box>
              <Box component="dd" sx={{ m: 0, fontSize: 13.5, fontWeight: 700, textAlign: 'right', color: colors.textPrimary }}>{n}</Box>
            </Box>
          )
        })}
      </Box>
    </Panel>
  )
}

export default ConventionCircuit
