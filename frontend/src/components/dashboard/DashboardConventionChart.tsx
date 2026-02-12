import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Stack, Skeleton } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'
import {
  ConventionData,
  StatusBreakdown,
  DashboardSectionProps,
  SectionHeader,
  extractApiData,
} from './types'

const DashboardConventionChart = ({ refreshKey }: DashboardSectionProps) => {
  const [conventions, setConventions] = useState<ConventionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await conventionsAPI.getAll()
        if (!cancelled) setConventions(extractApiData<ConventionData>(res))
      } catch {
        // silently handle error
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  const statusBreakdown: StatusBreakdown[] = useMemo(() => {
    const counts: Record<string, number> = {}
    conventions.forEach(c => {
      const s = c.statut || 'INCONNU'
      counts[s] = (counts[s] || 0) + 1
    })
    const colorMap: Record<string, string> = {
      BROUILLON: colors.neutral[300],
      SOUMIS: colors.warning[300],
      VALIDEE: colors.success[400],
      EN_EXECUTION: colors.info[400],
      ACHEVE: colors.success[600],
      REJETE: colors.danger[400],
      ANNULE: colors.danger[200],
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: getStatusConfig(name).label,
      value,
      color: colorMap[name] || colors.neutral[300],
    }))
  }, [conventions])

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<PieChartIcon size={16} />} title="Repartition par statut" />
      <Box sx={{ p: 2, height: 220, display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto' }} />
        ) : statusBreakdown.length > 0 ? (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '55%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={0.75} sx={{ width: '45%' }}>
              {statusBreakdown.map((item, i) => (
                <Stack key={i} direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }} />
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    flex: 1,
                    lineHeight: 1.3,
                  }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.bold,
                    color: colors.textPrimary,
                  }}>
                    {item.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : (
          <Typography sx={{ mx: 'auto', color: colors.textDisabled, fontSize: typography.sizes.sm }}>
            Aucune donnee
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default DashboardConventionChart
