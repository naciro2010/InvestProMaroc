import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { conventionsAPI, paiementsAPI, projetsAPI, marchesAPI } from '@/lib/api'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import {
  ConventionData,
  ProjetData,
  MarcheData,
  PaiementData,
  BudgetData,
  DashboardSectionProps,
  SectionHeader,
  formatLargeCurrency,
  extractApiData,
} from './types'

const DashboardBudgetOverview = ({ refreshKey }: DashboardSectionProps) => {
  const [conventions, setConventions] = useState<ConventionData[]>([])
  const [projets, setProjets] = useState<ProjetData[]>([])
  const [marches, setMarches] = useState<MarcheData[]>([])
  const [paiements, setPaiements] = useState<PaiementData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const [convRes, projRes, marchRes, paiRes] = await Promise.allSettled([
          conventionsAPI.getAll(),
          projetsAPI.getAll(),
          marchesAPI.getAll(),
          paiementsAPI.getAll(),
        ])
        if (cancelled) return
        if (convRes.status === 'fulfilled') setConventions(extractApiData<ConventionData>(convRes.value))
        if (projRes.status === 'fulfilled') setProjets(extractApiData<ProjetData>(projRes.value))
        if (marchRes.status === 'fulfilled') setMarches(extractApiData<MarcheData>(marchRes.value))
        if (paiRes.status === 'fulfilled') setPaiements(extractApiData<PaiementData>(paiRes.value))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  const budgetOverview: BudgetData[] = useMemo(() => {
    const budgetConventions = conventions.reduce((s, c) => s + (c.budget || c.montant || 0), 0)
    const budgetProjets = projets.reduce((s, p) => s + (p.budgetTotal || 0), 0)
    const totalPaiements = paiements.reduce((s, p) => s + (p.montant || 0), 0)
    const totalMarches = marches.reduce((s, m) => s + (m.montantTtc || 0), 0)

    return [
      { label: 'Conventions', budget: budgetConventions, consomme: totalPaiements },
      { label: 'Projets', budget: budgetProjets, consomme: totalMarches },
    ].filter(b => b.budget > 0)
  }, [conventions, projets, marches, paiements])

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<BarChart3 size={16} />} title="Budget vs Consomme" />
      <Box sx={{ p: 2, height: 220 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: borders.radius.lg }} />
        ) : budgetOverview.length > 0 ? (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={budgetOverview} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} vertical={false} />
              <XAxis
                dataKey="label"
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
              <Bar dataKey="budget" fill={colors.primary[100]} radius={[3, 3, 0, 0]} name="Budget" />
              <Bar dataKey="consomme" fill={colors.primary[400]} radius={[3, 3, 0, 0]} name="Consomme" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ color: colors.textDisabled, fontSize: typography.sizes.sm }}>
              Aucune donnee budgetaire
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default DashboardBudgetOverview
