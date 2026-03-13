import { Box, Typography, Stack, Tooltip } from '@mui/material'
import { GitBranch } from 'lucide-react'
import { colors, typography, componentStyles, borders, getStatusConfig } from '@/lib/designSystem'
import { WorkflowFunnelDTO } from '@/lib/api'
import { SectionHeader } from './types'

interface Props {
  funnel: WorkflowFunnelDTO
}

const STATUS_ORDER = ['BROUILLON', 'SOUMIS', 'VALIDEE', 'EN_EXECUTION', 'EN_COURS', 'ACHEVE', 'TERMINE', 'REJETE', 'ANNULE']

const STATUS_COLORS: Record<string, string> = {
  BROUILLON: colors.neutral[300],
  SOUMIS: colors.warning[400],
  VALIDE: colors.success[400],
  VALIDEE: colors.success[400],
  EN_EXECUTION: colors.info[400],
  EN_COURS: colors.info[400],
  EN_PREPARATION: colors.warning[300],
  ACHEVE: colors.success[600],
  TERMINE: colors.success[600],
  ACTIF: colors.info[400],
  REJETE: colors.danger[400],
  ANNULE: colors.danger[200],
}

const DashboardWorkflowFunnel = ({ funnel }: Props) => {
  const entities = [
    { label: 'Conventions', data: funnel.conventions },
    { label: 'Marches', data: funnel.marches },
    { label: 'Projets', data: funnel.projets },
    { label: 'Decomptes', data: funnel.decomptes },
  ]

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<GitBranch size={16} />} title="Flux de travail" />
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {entities.map(({ label, data }) => (
            <Box key={label}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography sx={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.textPrimary,
                }}>
                  {label}
                </Typography>
                <Typography sx={{
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                  color: colors.textSecondary,
                }}>
                  {data.total}
                </Typography>
              </Stack>
              <StackedBar counts={data.counts} total={data.total} />
            </Box>
          ))}
        </Stack>

        {/* Legend */}
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2.5, pt: 2,
          borderTop: `1px solid ${colors.divider}`,
        }}>
          {getUniqueStatuses(funnel).map(status => {
            const cfg = getStatusConfig(status)
            return (
              <Stack key={status} direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: STATUS_COLORS[status] || colors.neutral[300],
                }} />
                <Typography sx={{ fontSize: typography.sizes['2xs'], color: colors.textSecondary }}>
                  {cfg.label}
                </Typography>
              </Stack>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

const StackedBar = ({ counts, total }: { counts: Record<string, number>; total: number }) => {
  if (total === 0) {
    return (
      <Box sx={{
        height: 20, borderRadius: borders.radius.md, bgcolor: colors.neutral[100],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: typography.sizes['2xs'], color: colors.textDisabled }}>
          Aucune donnee
        </Typography>
      </Box>
    )
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => {
      const iA = STATUS_ORDER.indexOf(a[0])
      const iB = STATUS_ORDER.indexOf(b[0])
      return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB)
    })

  return (
    <Box sx={{
      display: 'flex', height: 20, borderRadius: borders.radius.md,
      overflow: 'hidden', bgcolor: colors.neutral[100],
    }}>
      {sorted.map(([status, count]) => {
        const pct = (count / total) * 100
        if (pct < 1) return null
        const cfg = getStatusConfig(status)
        return (
          <Tooltip key={status} title={`${cfg.label}: ${count} (${pct.toFixed(0)}%)`} arrow>
            <Box sx={{
              width: `${pct}%`, bgcolor: STATUS_COLORS[status] || colors.neutral[300],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: count > 0 ? 20 : 0, transition: 'width 0.3s ease',
            }}>
              {pct > 10 && (
                <Typography sx={{
                  fontSize: 9, fontWeight: typography.weights.bold,
                  color: '#fff', lineHeight: 1,
                }}>
                  {count}
                </Typography>
              )}
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}

function getUniqueStatuses(funnel: WorkflowFunnelDTO): string[] {
  const set = new Set<string>()
  for (const entity of [funnel.conventions, funnel.marches, funnel.projets, funnel.decomptes]) {
    for (const status of Object.keys(entity.counts)) {
      set.add(status)
    }
  }
  return Array.from(set).sort((a, b) => {
    const iA = STATUS_ORDER.indexOf(a)
    const iB = STATUS_ORDER.indexOf(b)
    return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB)
  })
}

export default DashboardWorkflowFunnel
