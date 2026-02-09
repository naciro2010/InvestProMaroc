import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stack,
  Skeleton,
  LinearProgress,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import {
  FileText,
  FolderOpen,
  Receipt,
  Banknote,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Eye,
  Plus,
  BarChart3,
  PieChart as PieChartIcon,
  Wallet,
  RefreshCw,
} from 'lucide-react'
import { conventionsAPI, decomptesAPI, paiementsAPI, projetsAPI, marchesAPI } from '../lib/api'
import AppLayout from '../components/layout/AppLayout'
import { colors, typography, componentStyles, borders, transitions, getStatusConfig } from '../lib/designSystem'
import StatsCard from '../components/common/StatsCard'
import { useAuth } from '../contexts/AuthContext'

// ─── Types ──────────────────────────────────────────────────────────────

interface ConventionData {
  id: number
  code?: string
  objet?: string
  budget?: number
  montant?: number
  statut?: string
  typeConvention?: string
  createdAt?: string
  updatedAt?: string
}

interface ProjetData {
  id: number
  code?: string
  designation?: string
  budgetTotal?: number
  status?: string
  pourcentageAvancement?: number
}

interface MarcheData {
  id: number
  code?: string
  objet?: string
  montantTtc?: number
  statut?: string
  createdAt?: string
}

interface PaiementData {
  id: number
  montant?: number
  datePaiement?: string
  statut?: string
}

interface DecompteData {
  id: number
  numero?: string
  montant?: number
  statut?: string
  createdAt?: string
}

interface KPI {
  title: string
  value: number
  subtitle: string
  details?: string
  icon: JSX.Element
  color: string
  bgColor: string
  loading: boolean
  path: string
}

interface StatusBreakdown {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface BudgetData {
  label: string
  budget: number
  consomme: number
}

interface RecentItem {
  id: number
  code: string
  label: string
  status: string
  date: string
  type: 'convention' | 'marche' | 'projet' | 'decompte'
  path: string
}

// ─── Helpers ────────────────────────────────────────────────────────────

const formatLargeCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md DH`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M DH`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K DH`
  return `${amount.toFixed(0)} DH`
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return '-'
  }
}

const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon apres-midi'
  return 'Bonsoir'
}

// ─── Section Header Component ───────────────────────────────────────────

const SectionHeader = ({ icon, title, action }: { icon: JSX.Element; title: string; action?: JSX.Element }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2.5,
    py: 1.5,
    borderBottom: `1px solid ${colors.divider}`,
  }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ color: colors.textDisabled, display: 'flex' }}>
        {icon}
      </Box>
      <Typography sx={{
        fontWeight: typography.weights.medium,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
      }}>
        {title}
      </Typography>
    </Stack>
    {action}
  </Box>
)

// ─── Main Component ─────────────────────────────────────────────────────

const DashboardModern = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Data state
  const [conventions, setConventions] = useState<ConventionData[]>([])
  const [projets, setProjets] = useState<ProjetData[]>([])
  const [marches, setMarches] = useState<MarcheData[]>([])
  const [decomptes, setDecomptes] = useState<DecompteData[]>([])
  const [paiements, setPaiements] = useState<PaiementData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ─── Data Fetching ──────────────────────────────────────────────────

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [convRes, projRes, marchRes, decRes, paiRes] = await Promise.allSettled([
        conventionsAPI.getAll(),
        projetsAPI.getAll(),
        marchesAPI.getAll(),
        decomptesAPI.getAll(),
        paiementsAPI.getAll(),
      ])

      if (convRes.status === 'fulfilled') {
        const data = Array.isArray(convRes.value.data) ? convRes.value.data : (convRes.value.data?.data ?? [])
        setConventions(data)
      }
      if (projRes.status === 'fulfilled') {
        const data = Array.isArray(projRes.value.data) ? projRes.value.data : (projRes.value.data?.data ?? [])
        setProjets(data)
      }
      if (marchRes.status === 'fulfilled') {
        const data = Array.isArray(marchRes.value.data) ? marchRes.value.data : (marchRes.value.data?.data ?? [])
        setMarches(data)
      }
      if (decRes.status === 'fulfilled') {
        const data = Array.isArray(decRes.value.data) ? decRes.value.data : (decRes.value.data?.data ?? [])
        setDecomptes(data)
      }
      if (paiRes.status === 'fulfilled') {
        const data = Array.isArray(paiRes.value.data) ? paiRes.value.data : (paiRes.value.data?.data ?? [])
        setPaiements(data)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ─── Computed KPIs ──────────────────────────────────────────────────

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
        loading: loading,
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
        loading: loading,
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
        loading: loading,
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
        loading: loading,
        path: '/paiements',
      },
    ]
  }, [conventions, projets, marches, decomptes, paiements, budgetConventions, budgetProjets, totalPaiements, totalMarches, loading])

  // ─── Convention Status Breakdown ────────────────────────────────────

  const statusBreakdown: StatusBreakdown[] = useMemo(() => {
    const counts: Record<string, number> = {}
    conventions.forEach(c => {
      const s = c.statut || 'INCONNU'
      counts[s] = (counts[s] || 0) + 1
    })
    const colorMap: Record<string, string> = {
      BROUILLON: colors.neutral[300],
      SOUMIS: colors.warning[300],
      VALIDEE: colors.success[400],
      EN_EXECUTION: colors.info[400],
      ACHEVE: colors.success[600],
      REJETE: colors.danger[400],
      ANNULE: colors.danger[200],
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: getStatusConfig(name).label,
      value,
      color: colorMap[name] || colors.neutral[300],
    }))
  }, [conventions])

  // ─── Budget Overview ────────────────────────────────────────────────

  const budgetOverview: BudgetData[] = useMemo(() => {
    return [
      { label: 'Conventions', budget: budgetConventions, consomme: totalPaiements },
      { label: 'Projets', budget: budgetProjets, consomme: totalMarches },
    ].filter(b => b.budget > 0)
  }, [budgetConventions, budgetProjets, totalPaiements, totalMarches])

  // ─── Monthly Payment Trend (from paiements dates) ──────────────────

  const paymentTrend = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    // Initialize last 6 months
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

  // ─── Recent Activity ────────────────────────────────────────────────

  const recentItems: RecentItem[] = useMemo(() => {
    const items: RecentItem[] = []

    conventions.slice(0, 5).forEach(c => {
      items.push({
        id: c.id,
        code: c.code || `CONV-${c.id}`,
        label: c.objet || 'Convention',
        status: c.statut || 'BROUILLON',
        date: c.updatedAt || c.createdAt || '',
        type: 'convention',
        path: `/conventions/${c.id}`,
      })
    })

    marches.slice(0, 3).forEach(m => {
      items.push({
        id: m.id,
        code: m.code || `M-${m.id}`,
        label: m.objet || 'Marche',
        status: m.statut || 'BROUILLON',
        date: m.createdAt || '',
        type: 'marche',
        path: `/marches/${m.id}`,
      })
    })

    return items
      .sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      .slice(0, 6)
  }, [conventions, marches])

  // ─── Dynamic Alerts ─────────────────────────────────────────────────

  const alerts = useMemo(() => {
    const items: { text: string; type: 'success' | 'warning' | 'info' }[] = []

    const pendingSoumis = conventions.filter(c => c.statut === 'SOUMIS').length
    if (pendingSoumis > 0) {
      items.push({ text: `${pendingSoumis} convention${pendingSoumis > 1 ? 's' : ''} en attente de validation`, type: 'warning' })
    }

    const brouillons = conventions.filter(c => c.statut === 'BROUILLON').length
    if (brouillons > 0) {
      items.push({ text: `${brouillons} brouillon${brouillons > 1 ? 's' : ''} a finaliser`, type: 'info' })
    }

    const enExecution = conventions.filter(c => c.statut === 'EN_EXECUTION').length
    if (enExecution > 0) {
      items.push({ text: `${enExecution} convention${enExecution > 1 ? 's' : ''} en cours d'execution`, type: 'success' })
    }

    if (items.length === 0) {
      items.push({ text: 'Toutes les conventions sont a jour', type: 'success' })
    }

    return items
  }, [conventions])

  // ─── Budget Utilization ─────────────────────────────────────────────

  const budgetUtilization = useMemo(() => {
    if (budgetConventions <= 0) return 0
    return Math.min((totalPaiements / budgetConventions) * 100, 100)
  }, [totalPaiements, budgetConventions])

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Welcome Header */}
        <Box sx={{
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          px: { xs: 2, md: 3 },
          py: 3,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography sx={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
                letterSpacing: '-0.01em',
                mb: 0.5,
              }}>
                {getGreeting()}, {user?.fullName || 'Utilisateur'}
              </Typography>
              <Typography sx={{
                fontSize: typography.sizes.base,
                color: colors.textSecondary,
              }}>
                Vue d'ensemble de vos investissements et operations
              </Typography>
            </Box>
            <Tooltip title="Actualiser les donnees">
              <IconButton
                onClick={() => fetchAll(true)}
                disabled={refreshing}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': { bgcolor: colors.neutral[100] },
                }}
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* ─── KPI Cards ──────────────────────────────────────────────── */}
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

          {/* ─── Budget Utilization Bar ─────────────────────────────────── */}
          {!loading && budgetConventions > 0 && (
            <Box sx={{
              ...componentStyles.card,
              p: 2.5,
              mb: 3,
            }}>
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

          {/* ─── Charts Row ─────────────────────────────────────────────── */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
            gap: 2.5,
            mb: 3,
          }}>
            {/* Status Breakdown Pie */}
            <Box sx={componentStyles.card}>
              <SectionHeader icon={<PieChartIcon size={16} />} title="Repartition par statut" />
              <Box sx={{ p: 2, height: 220, display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto' }} />
                ) : statusBreakdown.length > 0 ? (
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '55%', height: 200 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={statusBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {statusBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Stack spacing={0.75} sx={{ width: '45%' }}>
                      {statusBreakdown.map((item, i) => (
                        <Stack key={i} direction="row" alignItems="center" spacing={1}>
                          <Box sx={{
                            width: 8, height: 8,
                            borderRadius: '50%',
                            bgcolor: item.color,
                            flexShrink: 0,
                          }} />
                          <Typography sx={{
                            fontSize: typography.sizes.xs,
                            color: colors.textSecondary,
                            flex: 1,
                            lineHeight: 1.3,
                          }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{
                            fontSize: typography.sizes.xs,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                          }}>
                            {item.value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography sx={{ mx: 'auto', color: colors.textDisabled, fontSize: typography.sizes.sm }}>
                    Aucune donnee
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Budget Overview Bar Chart */}
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

            {/* Payment Trend Area */}
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
          </Box>

          {/* ─── Bottom Row: Activity + Alerts + Actions ────────────────── */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
            gap: 2.5,
          }}>
            {/* Recent Activity */}
            <Box sx={componentStyles.card}>
              <SectionHeader
                icon={<Clock size={16} />}
                title="Activite recente"
                action={
                  <Typography
                    onClick={() => navigate('/conventions')}
                    sx={{
                      fontSize: typography.sizes.xs,
                      color: colors.link,
                      cursor: 'pointer',
                      fontWeight: typography.weights.medium,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Voir tout
                  </Typography>
                }
              />
              {loading ? (
                <Stack spacing={0} sx={{ p: 0 }}>
                  {[1, 2, 3, 4].map(i => (
                    <Box key={i} sx={{ px: 3, py: 1.5 }}>
                      <Skeleton height={40} />
                    </Box>
                  ))}
                </Stack>
              ) : recentItems.length > 0 ? (
                <Stack spacing={0}>
                  {recentItems.map((item) => {
                    const statusCfg = getStatusConfig(item.status)
                    return (
                      <Box
                        key={`${item.type}-${item.id}`}
                        onClick={() => navigate(item.path)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          px: 3,
                          py: 1.5,
                          cursor: 'pointer',
                          transition: `background-color ${transitions.fast}`,
                          borderBottom: `1px solid ${colors.divider}`,
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: colors.neutral[25] },
                        }}
                      >
                        <Box sx={{
                          width: 34, height: 34,
                          borderRadius: borders.radius.md,
                          bgcolor: colors.neutral[50],
                          color: colors.neutral[500],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {item.type === 'convention' ? <FileText size={16} />
                            : item.type === 'marche' ? <Receipt size={16} />
                            : <FolderOpen size={16} />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{
                              fontSize: typography.sizes.sm,
                              fontWeight: typography.weights.semibold,
                              color: colors.textPrimary,
                            }}>
                              {item.code}
                            </Typography>
                            <Chip
                              label={statusCfg.label}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: typography.sizes['2xs'],
                                fontWeight: typography.weights.semibold,
                                bgcolor: statusCfg.bgColor,
                                color: statusCfg.textColor,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                          </Stack>
                          <Typography sx={{
                            fontSize: typography.sizes.xs,
                            color: colors.textSecondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: typography.sizes['2xs'],
                          color: colors.textDisabled,
                          flexShrink: 0,
                        }}>
                          {formatDate(item.date)}
                        </Typography>
                        <Eye size={14} color={colors.textDisabled} />
                      </Box>
                    )
                  })}
                </Stack>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Clock size={32} color={colors.textDisabled} style={{ marginBottom: 8 }} />
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                    Les activites recentes apparaitront ici
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Right Column: Alerts + Quick Actions */}
            <Stack spacing={2.5}>
              {/* Alerts */}
              <Box sx={componentStyles.card}>
                <SectionHeader icon={<AlertTriangle size={16} />} title="Alertes" />
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {alerts.map((alert, idx) => {
                      const alertColors = {
                        success: { bg: colors.success[25], dot: colors.success[400], text: colors.success[700], icon: <CheckCircle2 size={14} /> },
                        warning: { bg: colors.warning[25], dot: colors.warning[400], text: colors.warning[700], icon: <AlertTriangle size={14} /> },
                        info: { bg: colors.neutral[50], dot: colors.info[400], text: colors.info[700], icon: <Clock size={14} /> },
                      }
                      const ac = alertColors[alert.type]
                      return (
                        <Box key={idx} sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 2, py: 1.5,
                          borderRadius: borders.radius.lg,
                          bgcolor: ac.bg,
                        }}>
                          <Box sx={{ color: ac.dot, flexShrink: 0 }}>{ac.icon}</Box>
                          <Typography sx={{
                            fontSize: typography.sizes.sm,
                            color: ac.text,
                            fontWeight: typography.weights.medium,
                          }}>
                            {alert.text}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Stack>
                </Box>
              </Box>

              {/* Quick Actions */}
              <Box sx={componentStyles.card}>
                <SectionHeader icon={<Plus size={16} />} title="Actions rapides" />
                <Box sx={{ p: 1.5 }}>
                  <Stack spacing={0.5}>
                    {[
                      { label: 'Nouvelle convention', path: '/conventions/new', icon: <FileText size={16} /> },
                      { label: 'Nouveau projet', path: '/projets/new', icon: <FolderOpen size={16} /> },
                      { label: 'Nouveau marche', path: '/marches/new', icon: <BarChart3 size={16} /> },
                      { label: 'Reporting', path: '/reporting', icon: <TrendingUp size={16} /> },
                    ].map((action) => (
                      <Box
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          px: 2, py: 1.5,
                          borderRadius: borders.radius.lg,
                          cursor: 'pointer',
                          transition: `all ${transitions.fast}`,
                          '&:hover': { bgcolor: colors.neutral[50] },
                        }}
                      >
                        <Box sx={{
                          width: 32, height: 32,
                          borderRadius: borders.radius.md,
                          bgcolor: colors.neutral[100],
                          color: colors.neutral[500],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {action.icon}
                        </Box>
                        <Typography sx={{
                          flex: 1,
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.medium,
                          color: colors.textPrimary,
                        }}>
                          {action.label}
                        </Typography>
                        <ArrowRight size={14} color={colors.textDisabled} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default DashboardModern
