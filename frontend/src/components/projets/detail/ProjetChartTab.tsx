import { Box, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { colors, typography, componentStyles, chartColors } from '@/lib/designSystem'

interface ChartData {
  mois: string
  avancement: number
  planifie: number
}

interface ProjetChartTabProps {
  chartData: ChartData[]
}

const ProjetChartTab = ({ chartData }: ProjetChartTabProps) => {
  return (
    <Box sx={{ ...componentStyles.card, p: 2.5 }}>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 2 }}>
        Courbe de Progression
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
          <XAxis dataKey="mois" tick={{ fontSize: 12, fill: colors.textSecondary }} />
          <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avancement" stroke={chartColors.primary} strokeWidth={2} name="Avancement reel" />
          <Line type="monotone" dataKey="planifie" stroke={chartColors.warning} strokeWidth={2} strokeDasharray="5 5" name="Planifie" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default ProjetChartTab
