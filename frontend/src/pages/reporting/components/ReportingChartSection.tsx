import {
  Card, CardContent, Chip, Stack, Typography, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import {
  BarChart as BarChartIcon, PieChart as PieChartIcon, TableChart as TableIcon,
} from '@mui/icons-material'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { colors as dsColors } from '@/lib/designSystem'

const COLORS = [
  dsColors.primary[600], dsColors.success[600], dsColors.warning[600], dsColors.danger[500],
  dsColors.purple[600], dsColors.info[600], dsColors.primary[400], dsColors.danger[400],
]

interface ReportingChartSectionProps {
  dimensionName: string
  aggregation1D: Record<string, number>
  chartType: 'bar' | 'pie' | 'table'
  onChartTypeChange: (type: 'bar' | 'pie' | 'table') => void
  formatMontant: (montant: number) => string
}

const ReportingChartSection = ({
  dimensionName, aggregation1D, chartType, onChartTypeChange, formatMontant,
}: ReportingChartSectionProps) => {
  const total = Object.values(aggregation1D).reduce((sum, val) => sum + val, 0)
  const chartData = Object.entries(aggregation1D)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value, valueFormatted: formatMontant(value) }))

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Répartition par {dimensionName}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`Total: ${formatMontant(total)}`} color="primary" />
              <ToggleButtonGroup value={chartType} exclusive onChange={(_, val) => val && onChartTypeChange(val)} size="small">
                <ToggleButton value="bar"><BarChartIcon /></ToggleButton>
                <ToggleButton value="pie"><PieChartIcon /></ToggleButton>
                <ToggleButton value="table"><TableIcon /></ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {chartType === 'bar' && (
        <Card>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatMontant(Number(value) || 0)}
                  labelStyle={{ color: dsColors.textPrimary }} />
                <Legend />
                <Bar dataKey="value" fill={dsColors.primary[600]} name="Montant (MAD)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartType === 'pie' && (
        <Card>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                  outerRadius={120} fill={dsColors.purple[600]} dataKey="value">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMontant(Number(value) || 0)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartType === 'table' && (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{dimensionName}</strong></TableCell>
                    <TableCell align="right"><strong>Montant</strong></TableCell>
                    <TableCell align="right"><strong>% du Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(aggregation1D).sort(([, a], [, b]) => b - a).map(([valeur, montant]) => (
                    <TableRow key={valeur}>
                      <TableCell>{valeur}</TableCell>
                      <TableCell align="right">{formatMontant(montant)}</TableCell>
                      <TableCell align="right"><Chip label={`${((montant / total) * 100).toFixed(1)}%`} size="small" /></TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>TOTAL</strong></TableCell>
                    <TableCell align="right"><strong>{formatMontant(total)}</strong></TableCell>
                    <TableCell align="right"><strong>100%</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

export default ReportingChartSection
