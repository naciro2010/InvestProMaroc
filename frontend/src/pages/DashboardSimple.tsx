import { useState, useEffect } from 'react'
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
} from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  Description,
  Payment,
} from '@mui/icons-material'
import { conventionsAPI, budgetsAPI, decomptesAPI, paiementsAPI } from '../lib/api'

interface Stats {
  conventions: number
  budgets: number
  decomptes: number
  paiements: number
  montantTotalConventions: number
  montantTotalBudgets: number
  montantTotalPaiements: number
}

const DashboardSimple = () => {
  const [stats, setStats] = useState<Stats>({
    conventions: 0,
    budgets: 0,
    decomptes: 0,
    paiements: 0,
    montantTotalConventions: 0,
    montantTotalBudgets: 0,
    montantTotalPaiements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [conventionsRes, budgetsRes, decomptesRes, paiementsRes] = await Promise.all([
          conventionsAPI.getAll(),
          budgetsAPI.getAll(),
          decomptesAPI.getAll(),
          paiementsAPI.getAll(),
        ])

        const conventions = conventionsRes.data
        const budgets = budgetsRes.data
        const decomptes = decomptesRes.data
        const paiements = paiementsRes.data

        const montantTotalConventions = conventions.reduce(
          (sum: number, c: any) => sum + (c.montantGlobal || 0),
          0
        )

        const montantTotalBudgets = budgets.reduce(
          (sum: number, b: any) => sum + (b.totalBudget || 0),
          0
        )

        const montantTotalPaiements = paiements.reduce(
          (sum: number, p: any) => sum + (p.montantPaye || 0),
          0
        )

        setStats({
          conventions: conventions.length,
          budgets: budgets.length,
          decomptes: decomptes.length,
          paiements: paiements.length,
          montantTotalConventions,
          montantTotalBudgets,
          montantTotalPaiements,
        })
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} M MAD`
    }
    return formatCurrency(amount)
  }

  const kpis = [
    {
      title: 'Conventions',
      value: stats.conventions,
      subtitle: formatLargeCurrency(stats.montantTotalConventions),
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      trend: '+12%',
    },
    {
      title: 'Budgets',
      value: stats.budgets,
      subtitle: formatLargeCurrency(stats.montantTotalBudgets),
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      trend: '+8%',
    },
    {
      title: 'Décomptes',
      value: stats.decomptes,
      subtitle: `${stats.decomptes} situations`,
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      trend: '+15%',
    },
    {
      title: 'Paiements',
      value: stats.paiements,
      subtitle: formatLargeCurrency(stats.montantTotalPaiements),
      icon: <Payment sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      trend: '+20%',
    },
  ]

  const tauxExecution =
    stats.montantTotalBudgets > 0
      ? (stats.montantTotalPaiements / stats.montantTotalBudgets) * 100
      : 0

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Tableau de Bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble de vos investissements
          </Typography>
        </Box>

        {/* KPIs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 3,
            mb: 4,
          }}
        >
          {kpis.map((kpi, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${kpi.color}15`,
                        color: kpi.color,
                        display: 'flex',
                      }}
                    >
                      {kpi.icon}
                    </Box>
                    <Chip
                      label={kpi.trend}
                      size="small"
                      sx={{
                        bgcolor: '#4caf5015',
                        color: '#4caf50',
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {kpi.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Execution Rate & Activity */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
            mb: 4,
          }}
        >
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Taux d'Exécution Budgétaire
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Paiements réalisés / Budgets alloués
              </Typography>

              <Box mb={2}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progression
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {tauxExecution.toFixed(1)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(tauxExecution, 100)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: tauxExecution > 90 ? '#4caf50' : '#1976d2',
                    },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={4} mt={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Budget Total
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatLargeCurrency(stats.montantTotalBudgets)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Payé
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {formatLargeCurrency(stats.montantTotalPaiements)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Reste
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="warning.main">
                    {formatLargeCurrency(
                      stats.montantTotalBudgets - stats.montantTotalPaiements
                    )}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Activité Récente
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Dernières opérations
              </Typography>

              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Convention validée
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Il y a 2 heures
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Budget créé (V0)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Il y a 5 heures
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Paiement exécuté
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hier à 14:30
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Actions Rapides
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
              <Paper
                sx={{
                  p: 2,
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Nouvelle Convention
                </Typography>
                <Typography variant="caption">Créer une convention</Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Nouveau Budget
                </Typography>
                <Typography variant="caption">Créer un budget</Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Rapport Analytique
                </Typography>
                <Typography variant="caption">Voir les analyses</Typography>
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default DashboardSimple
