import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { colors, typography, componentStyles, chartColors, spacing } from '@/lib/designSystem'
import { reportingAPI, DepenseStatsDTO } from '@/lib/api'

const formatMontant = (montant: number): string => {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M MAD`
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K MAD`
  return `${montant.toFixed(2)} MAD`
}

type ViewMode = 'periode' | 'fournisseur'

interface ChartDataItem {
  name: string
  ht: number
  tva: number
  ttc: number
}

interface ReportingDepensesChartProps {
  refreshKey: number
}

const ReportingDepensesChart = ({ refreshKey }: ReportingDepensesChartProps) => {
  const [data, setData] = useState<DepenseStatsDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('periode')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = viewMode === 'periode'
          ? await reportingAPI.getDepenseStatsByPeriod()
          : await reportingAPI.getDepenseStatsByFournisseur()
        if (response.data.data) setData(response.data.data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement depenses:', msg)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey, viewMode])

  const chartData: ChartDataItem[] = data.map((item) => ({
    name: viewMode === 'periode'
      ? (item.periode ?? 'N/A')
      : (item.fournisseurNom ?? 'N/A'),
    ht: item.totalMontantHt,
    tva: item.totalMontantTva,
    ttc: item.totalMontantTtc,
  })).slice(0, 12)

  const totalTtc = data.reduce((sum, item) => sum + item.totalMontantTtc, 0)
  const totalCount = data.reduce((sum, item) => sum + item.nombreDepenses, 0)

  return (
    <Box sx={componentStyles.sectionCard}>
      <Box sx={componentStyles.sectionCardHeader}>
        <Box>
          <Typography sx={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}>
            Analyse des Depenses
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mt: 0.25 }}>
            {totalCount} depenses - Total: {formatMontant(totalTtc)}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Vue par</InputLabel>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            label="Vue par"
          >
            <MenuItem value="periode">Periode</MenuItem>
            <MenuItem value="fournisseur">Fournisseur</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ ...componentStyles.sectionCardBody, pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing.mui['3xl'] }}>
            <CircularProgress size={28} />
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={componentStyles.emptyState}>
            <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
              Aucune donnee de depenses disponible
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: colors.textSecondary }}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: colors.textSecondary }}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)}
              />
              <Tooltip
                formatter={(value) => formatMontant(Number(value) || 0)}
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: typography.sizes.sm,
                }}
              />
              <Legend wrapperStyle={{ fontSize: typography.sizes.xs }} />
              <Bar dataKey="ht" name="HT" fill={chartColors.primary} radius={[3, 3, 0, 0]} />
              <Bar dataKey="tva" name="TVA" fill={chartColors.warning} radius={[3, 3, 0, 0]} />
              <Bar dataKey="ttc" name="TTC" fill={chartColors.success} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  )
}

export default ReportingDepensesChart
