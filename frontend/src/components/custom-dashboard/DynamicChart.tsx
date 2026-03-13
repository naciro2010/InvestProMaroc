/**
 * DynamicChart - Premium chart rendering with Recharts.
 *
 * Features:
 * - Multi-card KPI dashboard with trend-style visuals
 * - Animated bar charts with gradient fills
 * - Donut pie charts with custom center label
 * - Area charts with gradient fill and dots
 * - Summary statistics panel
 * - Responsive and accessible
 */

import { Box, Typography, Paper } from '@mui/material'
import {
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Area, AreaChart,
  type PieLabelRenderProps,
} from 'recharts'
import {
  TrendingUp, Hash, Layers, Target, Award, BarChart3,
} from 'lucide-react'
import { colors, typography } from '@/lib/designSystem'
import type { VisualizationType } from './instructionParser'
import type { FetchedData, DataRow } from './dataFetcher'

interface DynamicChartProps {
  data: FetchedData
  type: VisualizationType
  title: string
}

// Premium color palette - vibrant yet professional
const CHART_COLORS = [
  '#4F46E5', // indigo
  '#0891B2', // cyan
  '#059669', // emerald
  '#D97706', // amber
  '#DC2626', // red
  '#7C3AED', // violet
  '#2563EB', // blue
  '#0D9488', // teal
  '#CA8A04', // yellow
  '#E11D48', // rose
  '#6366F1', // indigo lighter
  '#06B6D4', // cyan lighter
]

// Gradient pairs for bar charts
const CHART_GRADIENTS = CHART_COLORS.map((color, i) => ({
  id: `gradient-${i}`,
  start: color,
  end: `${color}CC`, // slightly transparent
}))

// ============================================================================
// Helpers
// ============================================================================

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} Md`
  }
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

function toChartData(data: FetchedData): Array<{ name: string; value: number }> {
  return data.rows.map((row: DataRow) => ({
    name: String(row.group ?? row[data.columns[0]?.key] ?? ''),
    value: typeof row.value === 'number' ? row.value : 0,
  }))
}

function truncateLabel(label: string, max: number = 18): string {
  return label.length > max ? `${label.slice(0, max)}…` : label
}

// ============================================================================
// Summary Stats - Enhanced with icons
// ============================================================================

interface SummaryStatsProps {
  data: Array<{ name: string; value: number }>
  entityLabel: string
}

const STAT_ICONS = [
  <Layers className="w-3.5 h-3.5" key="total" />,
  <Target className="w-3.5 h-3.5" key="avg" />,
  <Award className="w-3.5 h-3.5" key="max" />,
  <Hash className="w-3.5 h-3.5" key="cat" />,
]

const STAT_COLORS = [
  colors.primary[600],
  colors.info[600],
  colors.success[600],
  colors.warning[600],
]

const SummaryStats = ({ data }: SummaryStatsProps) => {
  if (data.length === 0) return null

  const total = data.reduce((s, d) => s + d.value, 0)
  const max = data.reduce((m, d) => d.value > m.value ? d : m, data[0])
  const avg = total / data.length

  const stats = [
    { label: 'Total', value: formatFullNumber(total) },
    { label: 'Moyenne', value: formatFullNumber(avg) },
    { label: 'Maximum', value: `${truncateLabel(max.name, 12)}` },
    { label: 'Catégories', value: `${data.length}` },
  ]

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 1.5,
      mb: 3,
    }}>
      {stats.map((stat, i) => (
        <Box key={stat.label} sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.5,
          py: 1.25,
          borderRadius: '10px',
          backgroundColor: `${STAT_COLORS[i]}08`,
          border: `1px solid ${STAT_COLORS[i]}18`,
        }}>
          <Box sx={{
            width: 30,
            height: 30,
            borderRadius: '8px',
            backgroundColor: `${STAT_COLORS[i]}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: STAT_COLORS[i],
            flexShrink: 0,
          }}>
            {STAT_ICONS[i]}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: '10px',
              fontWeight: typography.weights.semibold,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.2,
            }}>
              {stat.label}
            </Typography>
            <Typography sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {stat.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// ============================================================================
// Custom Tooltip - Premium style
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
      border: `1px solid ${colors.neutral[100]}`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      borderRadius: '12px',
      backgroundColor: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(10px)',
      maxWidth: 300,
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
            width: 10,
            height: 10,
            borderRadius: '3px',
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
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatFullNumber(entry.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  )
}

// ============================================================================
// Bar Chart - with gradient fills
// ============================================================================

const BarChartView = ({ data }: { data: FetchedData }) => {
  const chartData = toChartData(data)
  const hasMany = chartData.length > 6

  return (
    <>
      <SummaryStats data={chartData} entityLabel={data.entityLabel} />
      <ResponsiveContainer width="100%" height={Math.max(380, hasMany ? chartData.length * 32 : 380)}>
        {hasMany ? (
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
            <defs>
              {CHART_GRADIENTS.map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={g.start} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={g.end} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: colors.neutral[400] }} tickFormatter={formatNumber} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: colors.neutral[500] }}
              width={160}
              tickFormatter={(v: string) => truncateLabel(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${colors.primary[50]}80` }} />
            <Bar dataKey="value" name="Valeur" radius={[0, 6, 6, 0]} maxBarSize={26} animationDuration={800} animationEasing="ease-out">
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#${CHART_GRADIENTS[index % CHART_GRADIENTS.length].id})`} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: chartData.some(d => d.name.length > 10) ? 80 : 40 }}>
            <defs>
              {CHART_GRADIENTS.map((g) => (
                <linearGradient key={`v-${g.id}`} id={`v-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.start} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={g.end} stopOpacity={0.65} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: colors.neutral[500] }}
              angle={chartData.some(d => d.name.length > 10) ? -30 : 0}
              textAnchor={chartData.some(d => d.name.length > 10) ? 'end' : 'middle'}
              height={chartData.some(d => d.name.length > 10) ? 80 : 40}
              tickFormatter={(v: string) => truncateLabel(v)}
            />
            <YAxis tick={{ fontSize: 11, fill: colors.neutral[400] }} tickFormatter={formatNumber} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${colors.primary[50]}60` }} />
            <Bar dataKey="value" name="Valeur" radius={[8, 8, 0, 0]} maxBarSize={60} animationDuration={800} animationEasing="ease-out">
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#v-${CHART_GRADIENTS[index % CHART_GRADIENTS.length].id})`} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </>
  )
}

// ============================================================================
// Pie Chart - Donut with center text
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
  const radius = innerR + (outerR - innerR) * 1.45
  const x = cxNum + radius * Math.cos(-Number(midAngle) * RADIAN)
  const y = cyNum + radius * Math.sin(-Number(midAngle) * RADIAN)
  const pct = Number(percent)

  if (pct < 0.04) return null

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
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <>
      <SummaryStats data={chartData} entityLabel={data.entityLabel} />
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 360px', minWidth: 300, position: 'relative' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                label={renderCustomPieLabel}
                labelLine={{ stroke: colors.neutral[300], strokeWidth: 1 }}
                dataKey="value"
                strokeWidth={3}
                stroke="white"
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {/* Center text */}
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.textPrimary}
                fontSize={22}
                fontWeight={700}
              >
                {formatNumber(total)}
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.neutral[400]}
                fontSize={11}
                fontWeight={500}
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Custom legend */}
        <Box sx={{ flex: '0 0 auto', minWidth: 200, pt: 2 }}>
          {chartData.map((entry, idx) => {
            const pct = total > 0 ? (entry.value / total * 100) : 0
            return (
              <Box key={idx} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                mb: 1.5,
                px: 1,
                py: 0.5,
                borderRadius: '8px',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: colors.neutral[50],
                },
              }}>
                <Box sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '4px',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{
                      fontSize: typography.sizes['2xs'],
                      fontWeight: typography.weights.semibold,
                      color: colors.textPrimary,
                    }}>
                      {formatFullNumber(entry.value)}
                    </Typography>
                    <Box sx={{
                      px: 0.75,
                      py: 0.125,
                      borderRadius: '4px',
                      backgroundColor: `${CHART_COLORS[idx % CHART_COLORS.length]}18`,
                    }}>
                      <Typography sx={{
                        fontSize: '9px',
                        fontWeight: typography.weights.bold,
                        color: CHART_COLORS[idx % CHART_COLORS.length],
                      }}>
                        {pct.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
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
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.2} />
              <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
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
            stroke={CHART_COLORS[0]}
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            dot={{ fill: CHART_COLORS[0], r: 4, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 7, fill: CHART_COLORS[0], stroke: 'white', strokeWidth: 3 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

// ============================================================================
// KPI View - Multi-card dashboard
// ============================================================================

interface KPIMetric {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  bgColor: string
  size: 'large' | 'small'
}

const KPIView = ({ data, title }: { data: FetchedData; title: string }) => {
  const total = data.rows.reduce((sum, row: DataRow) => {
    const val = typeof row.value === 'number' ? row.value : (typeof row.count === 'number' ? row.count : 0)
    return sum + val
  }, 0)

  const displayValue = total || data.totalCount

  // Build rich KPI metrics
  const metrics: KPIMetric[] = []

  // Primary metric - the main number
  metrics.push({
    label: title || `Total ${data.entityLabel}`,
    value: formatFullNumber(displayValue),
    icon: <BarChart3 className="w-6 h-6" />,
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    size: 'large',
  })

  // Secondary metrics from grouped data
  if (data.rows.length > 1) {
    const values = data.rows.map((r: DataRow) => typeof r.value === 'number' ? r.value : 0)
    const maxRow = data.rows.reduce((max, row: DataRow) => {
      const v = typeof row.value === 'number' ? row.value : 0
      const mv = typeof max.value === 'number' ? max.value : 0
      return v > mv ? row : max
    }, data.rows[0])
    const avg = total / data.rows.length
    const min = Math.min(...values.filter(v => v > 0))

    metrics.push({
      label: 'Moyenne',
      value: formatFullNumber(avg),
      icon: <Target className="w-5 h-5" />,
      color: '#0891B2',
      bgColor: '#ECFEFF',
      size: 'small',
    })

    metrics.push({
      label: `Maximum (${truncateLabel(String(maxRow.group ?? ''), 12)})`,
      value: formatFullNumber(typeof maxRow.value === 'number' ? maxRow.value : 0),
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#059669',
      bgColor: '#ECFDF5',
      size: 'small',
    })

    if (min !== Infinity && min !== total) {
      metrics.push({
        label: 'Minimum',
        value: formatFullNumber(min),
        icon: <Hash className="w-5 h-5" />,
        color: '#D97706',
        bgColor: '#FFFBEB',
        size: 'small',
      })
    }
  } else {
    // Simple KPI - add count
    metrics.push({
      label: 'Éléments',
      value: `${data.totalCount}`,
      icon: <Layers className="w-5 h-5" />,
      color: '#0891B2',
      bgColor: '#ECFEFF',
      size: 'small',
    })
  }

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: metrics.length > 2 ? { xs: '1fr', sm: '1fr 1fr' } : '1fr',
      gap: 2,
      py: 2,
    }}>
      {metrics.map((metric, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: metric.size === 'large' ? 3 : 2,
            borderRadius: '14px',
            backgroundColor: metric.bgColor,
            border: `1px solid ${metric.color}20`,
            gridColumn: metric.size === 'large' && metrics.length > 2 ? '1 / -1' : undefined,
            transition: 'transform 0.15s, box-shadow 0.15s',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 20px ${metric.color}18`,
            },
          }}
        >
          <Box sx={{
            width: metric.size === 'large' ? 56 : 44,
            height: metric.size === 'large' ? 56 : 44,
            borderRadius: '12px',
            backgroundColor: `${metric.color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: metric.color,
            flexShrink: 0,
          }}>
            {metric.icon}
          </Box>
          <Box>
            <Typography sx={{
              fontSize: metric.size === 'large' ? '10px' : '9px',
              fontWeight: typography.weights.semibold,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              mb: 0.25,
            }}>
              {metric.label}
            </Typography>
            <Typography sx={{
              fontSize: metric.size === 'large' ? '2rem' : typography.sizes.xl,
              fontWeight: typography.weights.bold,
              color: metric.color,
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {metric.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

const DynamicChart = ({ data, type, title }: DynamicChartProps) => {
  if (data.rows.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
        gap: 1.5,
      }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          backgroundColor: colors.neutral[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <BarChart3 className="w-5 h-5" style={{ color: colors.neutral[400] }} />
        </Box>
        <Typography sx={{ color: colors.neutral[400], fontSize: typography.sizes.sm }}>
          Aucune donnée à afficher
        </Typography>
      </Box>
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
