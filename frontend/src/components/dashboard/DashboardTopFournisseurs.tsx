import { Box, Typography, Stack } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Users } from 'lucide-react'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import { TopFournisseurExecDTO } from '@/lib/api'
import { SectionHeader, formatLargeCurrency } from './types'

interface Props {
  fournisseurs: TopFournisseurExecDTO[]
}

const BAR_COLORS = [
  colors.primary[500],
  colors.primary[400],
  colors.primary[300],
  colors.info[400],
  colors.info[300],
]

const DashboardTopFournisseurs = ({ fournisseurs }: Props) => {
  const chartData = fournisseurs.map(f => ({
    ...f,
    shortNom: f.nom.length > 18 ? f.nom.substring(0, 16) + '...' : f.nom,
  }))

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<Users size={16} />} title="Top 5 Fournisseurs" />
      <Box sx={{ p: 2 }}>
        {chartData.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textDisabled }}>
              Aucun fournisseur
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: colors.textDisabled }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => formatLargeCurrency(v)}
                />
                <YAxis
                  type="category" dataKey="shortNom"
                  tick={{ fontSize: 10, fill: colors.textSecondary }}
                  axisLine={false} tickLine={false}
                  width={100}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [formatLargeCurrency(Number(value) || 0), 'Montant']}
                  labelFormatter={(label: string) => {
                    const f = fournisseurs.find(fn => fn.nom.startsWith(label.replace('...', '')))
                    return f ? f.nom : label
                  }}
                  contentStyle={{
                    fontSize: 11, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="montantTotal" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i] || colors.neutral[300]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Table details */}
        {fournisseurs.length > 0 && (
          <Stack spacing={0} sx={{ mt: 1, pt: 1, borderTop: `1px solid ${colors.divider}` }}>
            {fournisseurs.map((f) => (
              <Stack key={f.id} direction="row" alignItems="center" justifyContent="space-between"
                sx={{ py: 0.5, px: 0.5 }}
              >
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, flex: 1 }}>
                  {f.nom}
                </Typography>
                <Typography sx={{
                  fontSize: typography.sizes.xs, color: colors.textDisabled,
                  minWidth: 50, textAlign: 'center',
                }}>
                  {f.totalMarches} marche{f.totalMarches > 1 ? 's' : ''}
                </Typography>
                <Typography sx={{
                  fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
                  color: colors.textPrimary, minWidth: 70, textAlign: 'right',
                }}>
                  {formatLargeCurrency(f.montantTotal)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default DashboardTopFournisseurs
