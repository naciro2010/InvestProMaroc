/**
 * DynamicChart - Renders fetched data as Recharts bar/pie/line charts.
 */

import { Box, Typography, Paper } from '@mui/material'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell,
  type PieLabelRenderProps,
} from 'recharts'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { VisualizationType } from './instructionParser'
import type { FetchedData } from './dataFetcher'

interface DynamicChartProps {
  data: FetchedData
  type: VisualizationType
  title: string
}

const CHART_COLORS = [
  colors.primary[600],
  colors.success[600],
  colors.warning[600],
  colors.danger[600],
  colors.info[600],
  colors.purple[600],
  colors.primary[400],
  colors.success[400],
  colors.warning[400],
  colors.danger[400],
]

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('fr-FR').format(value)
}

interface ChartTooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  return (
    <Paper sx={{
      ...componentStyles.card,
      p: 1.5,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {label && (
        <Typography sx={{
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          mb: 0.5,
        }}>
          {label}
        </Typography>
      )}
      {payload.map((entry, idx) => (
        <Typography key={idx} sx={{
          fontSize: typography.sizes.xs,
          color: entry.color || colors.textSecondary,
        }}>
          {entry.name}: {new Intl.NumberFormat('fr-FR').format(entry.value)}
        </Typography>
      ))}
    </Paper>
  )
}

// ============================================================================
// Bar Chart
// ============================================================================

const BarChartView = ({ data }: { data: FetchedData }) => {
  const chartData = data.rows.map((row) => ({
    name: String(row.group || row[data.columns[0]?.key] || ''),
    value: typeof row.value === 'number' ? row.value : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: colors.textSecondary }}
          angle={-35}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 11, fill: colors.textSecondary }} tickFormatter={formatNumber} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="value" name="Valeur" fill={colors.primary[600]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ============================================================================
// Pie Chart
// ============================================================================

const PieChartView = ({ data }: { data: FetchedData }) => {
  const chartData = data.rows.map((row) => ({
    name: String(row.group || row[data.columns[0]?.key] || ''),
    value: typeof row.value === 'number' ? row.value : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={130}
          label={(props: PieLabelRenderProps) => {
            const name = String(props.name ?? '')
            const percent = typeof props.percent === 'number' ? props.percent : 0
            return `${name} (${(percent * 100).toFixed(0)}%)`
          }}
          labelLine
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ============================================================================
// Line Chart
// ============================================================================

const LineChartView = ({ data }: { data: FetchedData }) => {
  const chartData = data.rows
    .map((row) => ({
      name: String(row.group || row[data.columns[0]?.key] || ''),
      value: typeof row.value === 'number' ? row.value : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.textSecondary }} />
        <YAxis tick={{ fontSize: 11, fill: colors.textSecondary }} tickFormatter={formatNumber} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          name="Valeur"
          stroke={colors.primary[600]}
          strokeWidth={2}
          dot={{ fill: colors.primary[600], r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============================================================================
// KPI View
// ============================================================================

const KPIView = ({ data, title }: { data: FetchedData; title: string }) => {
  const total = data.rows.reduce((sum, row) => {
    const val = typeof row.value === 'number' ? row.value : (typeof row.count === 'number' ? row.count : 0)
    return sum + val
  }, 0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Typography sx={{
        fontSize: typography.sizes['4xl'],
        fontWeight: typography.weights.bold,
        color: colors.primary[700],
        mb: 1,
      }}>
        {new Intl.NumberFormat('fr-FR').format(total || data.totalCount)}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
      }}>
        {title}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        mt: 0.5,
      }}>
        {data.totalCount} élément{data.totalCount > 1 ? 's' : ''} au total
      </Typography>
    </Box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

const DynamicChart = ({ data, type, title }: DynamicChartProps) => {
  if (data.rows.length === 0) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 4, textAlign: 'center' }}>
        <Typography sx={{ color: colors.textSecondary }}>
          Aucune donnée à afficher
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography sx={{
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        mb: 2,
      }}>
        {title}
      </Typography>

      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        {type === 'bar' && <BarChartView data={data} />}
        {type === 'pie' && <PieChartView data={data} />}
        {type === 'line' && <LineChartView data={data} />}
        {type === 'kpi' && <KPIView data={data} title={title} />}
      </Paper>
    </Box>
  )
}

export default DynamicChart
