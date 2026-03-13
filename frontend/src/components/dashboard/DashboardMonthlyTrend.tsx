import { Box, Typography, Stack } from '@mui/material'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  BarChart, Bar, Legend,
} from 'recharts'
import { Activity } from 'lucide-react'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import { MonthlyTrendDTO } from '@/lib/api'
import { SectionHeader, formatLargeCurrency } from './types'

interface Props {
  trends: MonthlyTrendDTO[]
}

const DashboardMonthlyTrend = ({ trends }: Props) => {
  const hasAmount = trends.some(t => t.montantEngage > 0 || t.montantPaye > 0)

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<Activity size={16} />} title="Tendance sur 12 mois" />
      <Box sx={{ px: 2, pt: 2 }}>
        {/* Amount trend */}
        {hasAmount && (
          <Box sx={{ height: 200, mb: 2 }}>
            <Typography sx={{
              fontSize: typography.sizes.xs, color: colors.textDisabled,
              fontWeight: typography.weights.medium, mb: 1, textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Montants (DH)
            </Typography>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="gradEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary[400]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={colors.primary[400]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPaye" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.success[400]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={colors.success[400]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: colors.textDisabled }}
                  axisLine={{ stroke: colors.divider }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: colors.textDisabled }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => formatLargeCurrency(v)}
                  width={60}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => [
                    formatLargeCurrency(Number(value) || 0),
                    name === 'montantEngage' ? 'Engage' : 'Paye',
                  ]}
                  contentStyle={{
                    fontSize: 11, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone" dataKey="montantEngage" name="montantEngage"
                  stroke={colors.primary[400]} strokeWidth={1.5}
                  fillOpacity={1} fill="url(#gradEngage)"
                />
                <Area
                  type="monotone" dataKey="montantPaye" name="montantPaye"
                  stroke={colors.success[400]} strokeWidth={1.5}
                  fillOpacity={1} fill="url(#gradPaye)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Volume bar chart */}
        <Box sx={{ height: 180, pb: 2 }}>
          <Typography sx={{
            fontSize: typography.sizes.xs, color: colors.textDisabled,
            fontWeight: typography.weights.medium, mb: 1, textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Volumes (nombre)
          </Typography>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={trends} barGap={1} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: colors.textDisabled }}
                axisLine={{ stroke: colors.divider }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: colors.textDisabled }}
                axisLine={false} tickLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11, borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="marchesCreated" name="Marches" fill={colors.info[300]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="decomptesEmis" name="Decomptes" fill={colors.warning[300]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="paiementsEffectues" name="Paiements" fill={colors.success[300]} radius={[2, 2, 0, 0]} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: colors.textSecondary }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardMonthlyTrend
