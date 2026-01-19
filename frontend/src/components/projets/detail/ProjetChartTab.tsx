import { Container, Paper, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
    <Container maxWidth="xl">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Courbe de Progression
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avancement" stroke="#2196f3" strokeWidth={2} name="Avancement réel" />
            <Line type="monotone" dataKey="planifie" stroke="#ff9800" strokeWidth={2} strokeDasharray="5 5" name="Planifié" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Container>
  )
}

export default ProjetChartTab
