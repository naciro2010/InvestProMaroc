/**
 * DynamicChart - Polished chart rendering with Recharts.
 *
 * Inspired by Claude artifact visualizations: clean, readable, well-labeled
 * charts with summary statistics.
 */

import { Box, Typography, Paper } from '@mui/material'
import {
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Area, AreaChart,
  type PieLabelRenderProps,
} from 'recharts'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { VisualizationType } from './instructionParser'
import type { FetchedData, DataRow } from './dataFetcher'

interface DynamicChartProps {
  data: FetchedData
  type: VisualizationType
  title: string
}

// Richer, more distinct palette - better contrast for charts
const CHART_COLORS = [
  '#714B67', // primary purple
  '#3d7f52', // success green
  '#366b84', // info blue
  '#8f7218', // warning amber
  '#93403a', // danger red
  '#5b5187', // purple accent
  '#5695b0', // light blue
  '#5aab6d', // light green
  '#d4af4d', // gold
  '#bb5f57', // coral
  '#42809d', // teal
  '#af8db8', // lavender
]

// ============================================================================
// Helpers
// ============================================================================

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} M`
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)} K`
  }
  return new Intl.NumberFormat('fr-FR').format(value)
}

function formatFullNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Extract chart-ready data from rows */
function toChartData(data: FetchedData): Array<{ name: string; value: number }> {
  return data.rows.map((row: DataRow) => ({
    name: String(row.group ?? row[data.columns[0]?.key] ?? ''),
    value: typeof row.value === 'number' ? row.value : 0,
  }))
}

/** Truncate long labels */
function truncateLabel(label: string, max: number = 18): string {
  return label.length > max ? `${label.slice(0, max)}...` : label
}

// ============================================================================
// Summary Stats
// ============================================================================

interface SummaryStatsProps {
  data: Array<{ name: string; value: number }>
  entityLabel: string
}

const SummaryStats = ({ data, entityLabel }: SummaryStatsProps) => {
  if (data.length === 0) return null

  const total = data.reduce((s, d) => s + d.value, 0)
  const max = data.reduce((m, d) => d.value > m.value ? d : m, data[0])
  const avg = total / data.length

  return (
    <Box sx={{
      display: 'flex',
      gap: 3,
      mb: 2.5,
      flexWrap: 'wrap',
    }}>
      {[
        { label: 'Total', value: formatFullNumber(total) },
        { label: 'Moyenne', value: formatFullNumber(avg) },
        { label: 'Maximum', value: `${truncateLabel(max.name, 14)} (${formatFullNumber(max.value)})` },
        { label: `${entityLabel === 'Nombre' ? 'Catégories' : 'Catégories'}`, value: `${data.length}` },
      ].map((stat) => (
        <Box key={stat.label} sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
        }}>
          <Typography sx={{
            fontSize: typography.sizes['2xs'],
            fontWeight: typography.weights.semibold,
            color: colors.neutral[400],
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {stat.label}
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}>
            {stat.value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface ChartTooltipPayloadItem {
  name: string
  value: number
  color: string
  payload?: { name?: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  const displayLabel = label || payload[0]?.payload?.name || ''

  return (
    <Paper sx={{
      px: 2,
      py: 1.5,
      border: `1px solid ${colors.border}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      borderRadius: '8px',
      backgroundColor: colors.surface,
      maxWidth: 280,
    }}>
      {displayLabel && (
        <Typography sx={{
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.bold,
          color: colors.textPrimary,
          mb: 0.75,
          borderBottom: `1px solid ${colors.neutral[100]}`,
          pb: 0.75,
        }}>
          {displayLabel}
        </Typography>
      )}
      {payload.map((entry, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: entry.color || colors.primary[600],
            flexShrink: 0,
          }} />
          <Typography sx={{
            fontSize: typography.sizes.xs,
            color: colors.textSecondary,
            flex: 1,
          }}>
            {entry.name}
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
          }}>
            {formatFullNumber(entry.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  )
}

// ============================================================================
// Bar Chart
// ============================================================================

const BarChartView = ({ data }: { data: FetchedData }) => {
  const chartData = toChartData(data)
  const hasMany = chartData.length > 6

  return (
    <>
      <SummaryStats data={chartData} entityLabel={data.entityLabel} />
      <ResponsiveContainer width="100%" height={Math.max(350, chartData.length * 28)}>
        {hasMany ? (
          // Horizontal bar chart for many items - more readable
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: colors.neutral[400] }} tickFormatter={formatNumber} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: colors.neutral[500] }}
              width={150}
              tickFormatter={(v: string) => truncateLabel(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.neutral[50] }} />
            <Bar dataKey="value" name="Valeur" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          // Vertical bar chart for fewer items
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: hasMany ? 80 : 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: colors.neutral[500] }}
              angle={chartData.some(d => d.name.length > 10) ? -30 : 0}
              textAnchor={chartData.some(d => d.name.length > 10) ? 'end' : 'middle'}
              height={chartData.some(d => d.name.length > 10) ? 80 : 40}
              tickFormatter={(v: string) => truncateLabel(v)}
            />
            <YAxis tick={{ fontSize: 11, fill: colors.neutral[400] }} tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.neutral[50] }} />
            <Bar dataKey="value" name="Valeur" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </>
  )
}

// ============================================================================
// Pie Chart
// ============================================================================

const RADIAN = Math.PI / 180

const renderCustomPieLabel = (props: PieLabelRenderProps) => {
  const {
    cx = 0, cy = 0, midAngle = 0, innerRadius = 0,
    outerRadius = 0, percent = 0, name = '',
  } = props

  const cxNum = Number(cx)
  const cyNum = Number(cy)
  const outerR = Number(outerRadius)
  const innerR = Number(innerRadius)
  const radius = innerR + (outerR - innerR) * 1.4
  const x = cxNum + radius * Math.cos(-Number(midAngle) * RADIAN)
  const y = cyNum + radius * Math.sin(-Number(midAngle) * RADIAN)
  const pct = Number(percent)

  if (pct < 0.03) return null // Hide labels for tiny slices

  return (
    <text
      x={x}
      y={y}
      fill={colors.neutral[600]}
      textAnchor={x > cxNum ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {truncateLabel(String(name), 14)} ({(pct * 100).toFixed(0)}%)
    </text>
  )
}

const PieChartView = ({ data }: { data: FetchedData }) => {
  const chartData = toChartData(data)

  // Compute total for legend
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <>
      <SummaryStats data={chartData} entityLabel={data.entityLabel} />
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 360px', minWidth: 300 }}>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={140}
                label={renderCustomPieLabel}
                labelLine={{ stroke: colors.neutral[300], strokeWidth: 1 }}
                dataKey="value"
                strokeWidth={2}
                stroke={colors.surface}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Custom legend with values */}
        <Box sx={{ flex: '0 0 auto', minWidth: 180, pt: 2 }}>
          {chartData.map((entry, idx) => {
            const pct = total > 0 ? (entry.value / total * 100) : 0
            return (
              <Box key={idx} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.25,
              }}>
                <Box sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '3px',
                  backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                  flexShrink: 0,
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    color: colors.textPrimary,
                    fontWeight: typography.weights.medium,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {entry.name}
                  </Typography>
                  <Typography sx={{
                    fontSize: typography.sizes['2xs'],
                    color: colors.neutral[400],
                  }}>
                    {formatFullNumber(entry.value)} ({pct.toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </>
  )
}

// ============================================================================
// Line / Area Chart
// ============================================================================

const LineChartView = ({ data }: { data: FetchedData }) => {
  const chartData = toChartData(data)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <SummaryStats data={chartData} entityLabel={data.entityLabel} />
      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary[600]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={colors.primary[600]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: colors.neutral[500] }}
            axisLine={{ stroke: colors.neutral[200] }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.neutral[400] }}
            tickFormatter={formatNumber}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name="Valeur"
            stroke={colors.primary[600]}
            strokeWidth={2.5}
            fill="url(#colorValue)"
            dot={{ fill: colors.primary[600], r: 4, strokeWidth: 2, stroke: colors.surface }}
            activeDot={{ r: 6, fill: colors.primary[600], stroke: colors.surface, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

// ============================================================================
// KPI View
// ============================================================================

const KPIView = ({ data, title }: { data: FetchedData; title: string }) => {
  const total = data.rows.reduce((sum, row: DataRow) => {
    const val = typeof row.value === 'number' ? row.value : (typeof row.count === 'number' ? row.count : 0)
    return sum + val
  }, 0)

  const displayValue = total || data.totalCount

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 5,
    }}>
      <Typography sx={{
        fontSize: '3.5rem',
        fontWeight: typography.weights.bold,
        color: colors.primary[700],
        lineHeight: 1,
        mb: 1.5,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatFullNumber(displayValue)}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
        mb: 0.5,
      }}>
        {title}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.sm,
        color: colors.neutral[400],
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
        <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
          Aucune donnée à afficher
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      {title && (
        <Typography sx={{
          fontSize: typography.sizes.base,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          mb: 2,
        }}>
          {title}
        </Typography>
      )}

      {type === 'bar' && <BarChartView data={data} />}
      {type === 'pie' && <PieChartView data={data} />}
      {type === 'line' && <LineChartView data={data} />}
      {type === 'kpi' && <KPIView data={data} title={title || 'Total'} />}
    </Box>
  )
}

export default DynamicChart
