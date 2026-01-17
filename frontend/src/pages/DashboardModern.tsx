import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp,
  ArrowUpward,
  FolderOpen,
  Receipt,
  Payments,
  Description,
  MoreVert,
} from '@mui/icons-material'
import { conventionsAPI, budgetsAPI, decomptesAPI, paiementsAPI, projetsAPI } from '../lib/api'
import AppLayout from '../components/layout/AppLayout'

interface Stats {
  conventions: number
  budgets: number
  decomptes: number
  paiements: number
  projets: number
  montantTotalConventions: number
  montantTotalBudgets: number
  montantTotalPaiements: number
  montantTotalProjets: number
  conventionsParStatut: {
    brouillon: number
    soumis: number
    validees: number
    enCours: number
    achevees: number
  }
  projetsParStatut: {
    enPreparation: number
    enCours: number
    suspendu: number
    termine: number
    annule: number
  }
}

const DashboardModern = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    conventions: 0,
    budgets: 0,
    decomptes: 0,
    paiements: 0,
    projets: 0,
    montantTotalConventions: 0,
    montantTotalBudgets: 0,
    montantTotalPaiements: 0,
    montantTotalProjets: 0,
    conventionsParStatut: {
      brouillon: 0,
      soumis: 0,
      validees: 0,
      enCours: 0,
      achevees: 0,
    },
    projetsParStatut: {
      enPreparation: 0,
      enCours: 0,
      suspendu: 0,
      termine: 0,
      annule: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [conventionsRes, budgetsRes, decomptesRes, paiementsRes, projetsRes] = await Promise.all([
          conventionsAPI.getAll(),
          budgetsAPI.getAll(),
          decomptesAPI.getAll(),
          paiementsAPI.getAll(),
          projetsAPI.getAll(),
        ])

        const conventions = Array.isArray(conventionsRes.data.data)
          ? conventionsRes.data.data
          : conventionsRes.data.data?.data || []
        const budgets = Array.isArray(budgetsRes.data.data)
          ? budgetsRes.data.data
          : budgetsRes.data.data?.data || []
        const decomptes = Array.isArray(decomptesRes.data.data)
          ? decomptesRes.data.data
          : decomptesRes.data.data?.data || []
        const paiements = Array.isArray(paiementsRes.data.data)
          ? paiementsRes.data.data
          : paiementsRes.data.data?.data || []
        const projets = Array.isArray(projetsRes.data.data)
          ? projetsRes.data.data
          : projetsRes.data.data?.data || []

        const montantTotalConventions = conventions.reduce((sum: number, c: any) => sum + (c.montant || 0), 0)
        const montantTotalBudgets = budgets.reduce((sum: number, b: any) => sum + (b.montant || 0), 0)
        const montantTotalPaiements = paiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0)
        const montantTotalProjets = projets.reduce((sum: number, p: any) => sum + (p.budgetTotal || 0), 0)

        const conventionsParStatut = {
          brouillon: conventions.filter((c: any) => c.statut === 'BROUILLON').length,
          soumis: conventions.filter((c: any) => c.statut === 'SOUMIS').length,
          validees: conventions.filter((c: any) => c.statut === 'VALIDEE').length,
          enCours: conventions.filter((c: any) => c.statut === 'EN_EXECUTION').length,
          achevees: conventions.filter((c: any) => c.statut === 'ACHEVE').length,
        }

        const projetsParStatut = {
          enPreparation: projets.filter((p: any) => p.statut === 'EN_PREPARATION').length,
          enCours: projets.filter((p: any) => p.statut === 'EN_COURS').length,
          suspendu: projets.filter((p: any) => p.statut === 'SUSPENDU').length,
          termine: projets.filter((p: any) => p.statut === 'TERMINE').length,
          annule: projets.filter((p: any) => p.statut === 'ANNULE').length,
        }

        setStats({
          conventions: conventions.length,
          budgets: budgets.length,
          decomptes: decomptes.length,
          paiements: paiements.length,
          projets: projets.length,
          montantTotalConventions,
          montantTotalBudgets,
          montantTotalPaiements,
          montantTotalProjets,
          conventionsParStatut,
          projetsParStatut,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} M DH`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} K DH`
    }
    return `${amount.toFixed(0)} DH`
  }

  const kpis = [
    {
      title: 'Conventions',
      value: stats.conventions,
      subtitle: formatLargeCurrency(stats.montantTotalConventions),
      details: `${stats.conventionsParStatut.validees} validées • ${stats.conventionsParStatut.enCours} en cours`,
      icon: <Description />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      trend: '+12%',
      onClick: () => navigate('/conventions'),
    },
    {
      title: 'Projets',
      value: stats.projets,
      subtitle: formatLargeCurrency(stats.montantTotalProjets),
      details: `${stats.projetsParStatut.enCours} en cours • ${stats.projetsParStatut.termine} terminés`,
      icon: <FolderOpen />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      trend: '+10%',
      onClick: () => navigate('/projets'),
    },
    {
      title: 'Décomptes',
      value: stats.decomptes,
      subtitle: `${stats.decomptes} situations`,
      icon: <Receipt />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      trend: '+15%',
      onClick: () => navigate('/decomptes'),
    },
    {
      title: 'Paiements',
      value: stats.paiements,
      subtitle: formatLargeCurrency(stats.montantTotalPaiements),
      icon: <Payments />,
      color: '#10b981',
      bgColor: '#d1fae5',
      trend: '+20%',
      onClick: () => navigate('/paiements'),
    },
  ]

  const tauxExecution =
    stats.montantTotalBudgets > 0
      ? (stats.montantTotalPaiements / stats.montantTotalBudgets) * 100
      : 0

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header - Clean & Minimal */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#1f2937',
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              Tableau de Bord
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Vue d'ensemble de vos investissements et conventions
            </Typography>
          </Box>

          {/* KPIs Grid - Modern & Spacious */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {kpis.map((kpi, index) => (
              <Card
                key={index}
                onClick={kpi.onClick}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: '#e5e7eb',
                  boxShadow: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#d1d5db',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    {/* Icon & Trend */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: kpi.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: kpi.color,
                        }}
                      >
                        {kpi.icon}
                      </Box>
                      <Chip
                        icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                        label={kpi.trend}
                        size="small"
                        sx={{
                          bgcolor: '#dcfce7',
                          color: '#166534',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-icon': {
                            color: '#166534',
                            fontSize: 14,
                          },
                        }}
                      />
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {kpi.title}
                    </Typography>

                    {/* Value */}
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: '2rem',
                        lineHeight: 1,
                      }}
                    >
                      {kpi.value}
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                      }}
                    >
                      {kpi.subtitle}
                    </Typography>

                    {/* Details */}
                    {kpi.details && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6b7280',
                          fontSize: '0.75rem',
                          pt: 1,
                          borderTop: '1px solid #f3f4f6',
                        }}
                      >
                        {kpi.details}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Secondary Cards Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: 3,
            }}
          >
            {/* Taux d'Exécution */}
            <Paper
              sx={{
                p: 4,
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
                borderRadius: '12px',
              }}
            >
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1f2937',
                        mb: 0.5,
                      }}
                    >
                      Taux d'Exécution
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Paiements / Budget total
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Stack>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                      {tauxExecution.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {formatLargeCurrency(stats.montantTotalPaiements)} /{' '}
                      {formatLargeCurrency(stats.montantTotalBudgets)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(tauxExecution, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#f3f4f6',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#3b82f6',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Quick Stats */}
            <Paper
              sx={{
                p: 4,
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
                borderRadius: '12px',
              }}
            >
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Statistiques Rapides
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Budgets
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {stats.budgets}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Conventions validées
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {stats.conventionsParStatut.validees}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Projets actifs
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {stats.projetsParStatut.enCours}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default DashboardModern
