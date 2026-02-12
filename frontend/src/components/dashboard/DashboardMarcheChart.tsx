import { useState, useEffect, useMemo } from 'react'
import { Box, Skeleton } from '@mui/material'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { paiementsAPI } from '@/lib/api'
import { colors, componentStyles, borders } from '@/lib/designSystem'
import {
  PaiementData,
  DashboardSectionProps,
  SectionHeader,
  formatLargeCurrency,
  extractApiData,
} from './types'

interface PaymentTrendPoint {
  month: string
  montant: number
}

const DashboardMarcheChart = ({ refreshKey }: DashboardSectionProps) => {
  const [paiements, setPaiements] = useState<PaiementData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await paiementsAPI.getAll()
        if (!cancelled) setPaiements(extractApiData<PaiementData>(res))
      } catch {
        // silently handle error
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  const paymentTrend: PaymentTrendPoint[] = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = 0
    }
    paiements.forEach(p => {
      if (p.datePaiement) {
        const key = p.datePaiement.substring(0, 7)
        if (key in months) {
          months[key] += (p.montant || 0)
        }
      }
    })
    const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    return Object.entries(months).map(([key, value]) => ({
      month: monthNames[parseInt(key.split('-')[1]) - 1],
      montant: value,
    }))
  }, [paiements])

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<TrendingUp size={16} />} title="Tendance paiements" />
      <Box sx={{ p: 2, height: 220 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: borders.radius.lg }} />
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={paymentTrend}>
              <defs>
                <linearGradient id="colorPaiement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.success[400]} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={colors.success[400]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: colors.textSecondary }}
                axisLine={{ stroke: colors.divider }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: colors.textDisabled }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatLargeCurrency(v)}
                width={70}
              />
              <Area
                type="monotone"
                dataKey="montant"
                stroke={colors.success[400]}
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorPaiement)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  )
}

export default DashboardMarcheChart
