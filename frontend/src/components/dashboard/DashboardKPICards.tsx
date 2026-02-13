import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Skeleton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import {
  FileText,
  FolderOpen,
  Receipt,
  Banknote,
  Wallet,
} from 'lucide-react'
import { conventionsAPI, decomptesAPI, paiementsAPI, projetsAPI, marchesAPI } from '@/lib/api'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import StatsCard from '@/components/common/StatsCard'
import {
  ConventionData,
  ProjetData,
  MarcheData,
  PaiementData,
  DecompteData,
  KPI,
  DashboardSectionProps,
  formatLargeCurrency,
  extractApiData,
} from './types'

const DashboardKPICards = ({ refreshKey }: DashboardSectionProps) => {
  const navigate = useNavigate()

  const [conventions, setConventions] = useState<ConventionData[]>([])
  const [projets, setProjets] = useState<ProjetData[]>([])
  const [marches, setMarches] = useState<MarcheData[]>([])
  const [decomptes, setDecomptes] = useState<DecompteData[]>([])
  const [paiements, setPaiements] = useState<PaiementData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const [convRes, projRes, marchRes, decRes, paiRes] = await Promise.allSettled([
          conventionsAPI.getAll(),
          projetsAPI.getAll(),
          marchesAPI.getAll(),
          decomptesAPI.getAll(),
          paiementsAPI.getAll(),
        ])
        if (cancelled) return
        if (convRes.status === 'fulfilled') setConventions(extractApiData<ConventionData>(convRes.value))
        if (projRes.status === 'fulfilled') setProjets(extractApiData<ProjetData>(projRes.value))
        if (marchRes.status === 'fulfilled') setMarches(extractApiData<MarcheData>(marchRes.value))
        if (decRes.status === 'fulfilled') setDecomptes(extractApiData<DecompteData>(decRes.value))
        if (paiRes.status === 'fulfilled') setPaiements(extractApiData<PaiementData>(paiRes.value))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  const budgetConventions = useMemo(() =>
    conventions.reduce((s, c) => s + (c.budget || c.montant || 0), 0),
  [conventions])

  const budgetProjets = useMemo(() =>
    projets.reduce((s, p) => s + (p.budgetTotal || 0), 0),
  [projets])

  const totalPaiements = useMemo(() =>
    paiements.reduce((s, p) => s + (p.montant || 0), 0),
  [paiements])

  const totalMarches = useMemo(() =>
    marches.reduce((s, m) => s + (m.montantTtc || 0), 0),
  [marches])

  const kpis: KPI[] = useMemo(() => {
    const convValidees = conventions.filter(c => c.statut === 'VALIDEE').length
    const convEnCours = conventions.filter(c => c.statut === 'EN_EXECUTION').length
    const projActifs = projets.filter(p => p.status === 'ACTIF' || p.status === 'EN_COURS').length
    const projTermines = projets.filter(p => p.status === 'ACHEVE' || p.status === 'TERMINE').length

    return [
      {
        title: 'Conventions',
        value: conventions.length,
        subtitle: formatLargeCurrency(budgetConventions),
        details: `${convValidees} validees \u2022 ${convEnCours} en execution`,
        icon: <FileText size={20} />,
        color: colors.primary[500],
        bgColor: colors.primary[50],
        loading,
        path: '/conventions',
      },
      {
        title: 'Projets',
        value: projets.length,
        subtitle: formatLargeCurrency(budgetProjets),
        details: `${projActifs} actifs \u2022 ${projTermines} termines`,
        icon: <FolderOpen size={20} />,
        color: colors.purple[500],
        bgColor: colors.purple[50],
        loading,
        path: '/projets',
      },
      {
        title: 'Marches',
        value: marches.length,
        subtitle: formatLargeCurrency(totalMarches),
        details: `${decomptes.length} decomptes`,
        icon: <Receipt size={20} />,
        color: colors.info[500],
        bgColor: colors.info[50],
        loading,
        path: '/marches',
      },
      {
        title: 'Paiements',
        value: paiements.length,
        subtitle: formatLargeCurrency(totalPaiements),
        details: budgetConventions > 0
          ? `${((totalPaiements / budgetConventions) * 100).toFixed(1)}% du budget consomme`
          : '0% du budget consomme',
        icon: <Banknote size={20} />,
        color: colors.success[500],
        bgColor: colors.success[50],
        loading,
        path: '/paiements',
      },
    ]
  }, [conventions, projets, marches, decomptes, paiements, budgetConventions, budgetProjets, totalPaiements, totalMarches, loading])

  const budgetUtilization = useMemo(() => {
    if (budgetConventions <= 0) return 0
    return Math.min((totalPaiements / budgetConventions) * 100, 100)
  }, [totalPaiements, budgetConventions])

  return (
    <>
      {/* KPI Cards Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 2.5,
        mb: 3,
      }}>
        {kpis.map((kpi, index) => (
          kpi.loading ? (
            <Skeleton key={index} variant="rectangular" height={180} sx={{ borderRadius: borders.radius.xl }} />
          ) : (
            <StatsCard key={index} {...kpi} onClick={() => navigate(kpi.path)} />
          )
        ))}
      </Box>

      {/* Budget Utilization Bar */}
      {!loading && budgetConventions > 0 && (
        <Box sx={{ ...componentStyles.card, p: 2.5, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Wallet size={16} color={colors.primary[600]} />
              <Typography sx={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
              }}>
                Taux de consommation budgetaire
              </Typography>
            </Stack>
            <Typography sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              color: budgetUtilization > 80 ? colors.danger[600] : budgetUtilization > 50 ? colors.warning[600] : colors.primary[700],
            }}>
              {budgetUtilization.toFixed(1)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={budgetUtilization}
            sx={{
              height: 8,
              borderRadius: borders.radius.full,
              bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': {
                borderRadius: borders.radius.full,
                bgcolor: budgetUtilization > 80 ? colors.danger[400] : budgetUtilization > 50 ? colors.warning[400] : colors.primary[400],
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              Paye: {formatLargeCurrency(totalPaiements)}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              Budget total: {formatLargeCurrency(budgetConventions)}
            </Typography>
          </Stack>
        </Box>
      )}
    </>
  )
}

export default DashboardKPICards
