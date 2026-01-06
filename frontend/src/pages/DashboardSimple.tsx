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
  Grid,
} from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  Description,
  Payment,
  FolderOpen,
} from '@mui/icons-material'
import { conventionsAPI, budgetsAPI, decomptesAPI, paiementsAPI, projetsAPI } from '../lib/api'
import AppLayout from '../components/layout/AppLayout'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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

const DashboardSimple = () => {
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

        // Gérer le format de réponse API - peut être un tableau ou un objet avec data
        const conventions = Array.isArray(conventionsRes.data) ? conventionsRes.data : (conventionsRes.data?.data || [])
        const budgets = Array.isArray(budgetsRes.data) ? budgetsRes.data : (budgetsRes.data?.data || [])
        const decomptes = Array.isArray(decomptesRes.data) ? decomptesRes.data : (decomptesRes.data?.data || [])
        const paiements = Array.isArray(paiementsRes.data) ? paiementsRes.data : (paiementsRes.data?.data || [])
        const projets = Array.isArray(projetsRes.data) ? projetsRes.data : (projetsRes.data?.data || [])

        const montantTotalConventions = Array.isArray(conventions) ? conventions.reduce(
          (sum: number, c: any) => sum + (c.montantGlobal || 0),
          0
        ) : 0

        const montantTotalBudgets = Array.isArray(budgets) ? budgets.reduce(
          (sum: number, b: any) => sum + (b.totalBudget || 0),
          0
        ) : 0

        const montantTotalPaiements = Array.isArray(paiements) ? paiements.reduce(
          (sum: number, p: any) => sum + (p.montantPaye || 0),
          0
        ) : 0

        const montantTotalProjets = Array.isArray(projets) ? projets.reduce(
          (sum: number, p: any) => sum + (p.budgetTotal || 0),
          0
        ) : 0

        // Calculate conventions by status
        const conventionsParStatut = Array.isArray(conventions) ? {
          brouillon: conventions.filter((c: any) => c.statut === 'BROUILLON').length,
          soumis: conventions.filter((c: any) => c.statut === 'SOUMIS').length,
          validees: conventions.filter((c: any) => c.statut === 'VALIDEE').length,
          enCours: conventions.filter((c: any) => c.statut === 'EN_COURS').length,
          achevees: conventions.filter((c: any) => c.statut === 'ACHEVE').length,
        } : {
          brouillon: 0,
          soumis: 0,
          validees: 0,
          enCours: 0,
          achevees: 0,
        }

        // Calculate projets by status
        const projetsParStatut = Array.isArray(projets) ? {
          enPreparation: projets.filter((p: any) => p.statut === 'EN_PREPARATION').length,
          enCours: projets.filter((p: any) => p.statut === 'EN_COURS').length,
          suspendu: projets.filter((p: any) => p.statut === 'SUSPENDU').length,
          termine: projets.filter((p: any) => p.statut === 'TERMINE').length,
          annule: projets.filter((p: any) => p.statut === 'ANNULE').length,
        } : {
          enPreparation: 0,
          enCours: 0,
          suspendu: 0,
          termine: 0,
          annule: 0,
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
      details: `${stats.conventionsParStatut.validees} validées • ${stats.conventionsParStatut.enCours} en cours`,
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      trend: '+12%',
      onClick: () => navigate('/conventions'),
    },
    {
      title: 'Projets',
      value: stats.projets,
      subtitle: formatLargeCurrency(stats.montantTotalProjets),
      details: `${stats.projetsParStatut.enCours} en cours • ${stats.projetsParStatut.termine} terminés`,
      icon: <FolderOpen sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      trend: '+10%',
      onClick: () => navigate('/projets'),
    },
    {
      title: 'Budgets',
      value: stats.budgets,
      subtitle: formatLargeCurrency(stats.montantTotalBudgets),
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      trend: '+8%',
      onClick: () => navigate('/budgets'),
    },
    {
      title: 'Décomptes',
      value: stats.decomptes,
      subtitle: `${stats.decomptes} situations`,
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      trend: '+15%',
      onClick: () => navigate('/decomptes'),
    },
    {
      title: 'Paiements',
      value: stats.paiements,
      subtitle: formatLargeCurrency(stats.montantTotalPaiements),
      icon: <Payment sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
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
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          {kpis.map((kpi, index) => (
            <Card
              key={index}
              onClick={kpi.onClick}
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
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
                    {kpi.details && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {kpi.details}
                      </Typography>
                    )}
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

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Conventions by Status Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Conventions par Statut
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Brouillon', value: stats.conventionsParStatut.brouillon, color: '#94a3b8' },
                        { name: 'Soumis', value: stats.conventionsParStatut.soumis, color: '#f59e0b' },
                        { name: 'Validées', value: stats.conventionsParStatut.validees, color: '#10b981' },
                        { name: 'En cours', value: stats.conventionsParStatut.enCours, color: '#3b82f6' },
                        { name: 'Achevées', value: stats.conventionsParStatut.achevees, color: '#22c55e' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Brouillon', value: stats.conventionsParStatut.brouillon, color: '#94a3b8' },
                        { name: 'Soumis', value: stats.conventionsParStatut.soumis, color: '#f59e0b' },
                        { name: 'Validées', value: stats.conventionsParStatut.validees, color: '#10b981' },
                        { name: 'En cours', value: stats.conventionsParStatut.enCours, color: '#3b82f6' },
                        { name: 'Achevées', value: stats.conventionsParStatut.achevees, color: '#22c55e' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Projets by Status Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Projets par Statut
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'En Préparation', value: stats.projetsParStatut.enPreparation },
                      { name: 'En Cours', value: stats.projetsParStatut.enCours },
                      { name: 'Suspendu', value: stats.projetsParStatut.suspendu },
                      { name: 'Terminé', value: stats.projetsParStatut.termine },
                      { name: 'Annulé', value: stats.projetsParStatut.annule },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Nombre de Projets" fill="#1e40af" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Actions Rapides
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
              <Paper
                onClick={() => navigate('/conventions/nouvelle')}
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
                onClick={() => navigate('/conventions')}
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
                  Voir Conventions
                </Typography>
                <Typography variant="caption">Liste des conventions</Typography>
              </Paper>

              <Paper
                onClick={() => navigate('/reporting/analytique')}
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
    </AppLayout>
  )
}

export default DashboardSimple
