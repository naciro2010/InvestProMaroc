import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  AccountBalance,
  TrendingUp,
  CalendarToday,
  Description,
  Timeline,
  Visibility,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader } from '@/components/core'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import type { Budget, StatutBudget } from '../../types/entities'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface Convention {
  id: number
  code: string
  objet: string
  statut: string
}

const BudgetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadBudget(parseInt(id))
    }
  }, [id])

  const loadBudget = async (budgetId: number) => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getById(budgetId)
      const budgetData = response.data.data || response.data
      setBudget(budgetData)

      // Load convention if exists
      if (budgetData.convention?.id) {
        loadConvention(budgetData.convention.id)
      }
    } catch (err) {
      setError('Erreur lors du chargement du budget')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadConvention = async (conventionId: number) => {
    try {
      const res = await conventionsAPI.getById(conventionId)
      setConvention(res.data.data || res.data)
    } catch (err) {
      console.error('Error loading convention:', err)
    }
  }

  const handleDelete = async () => {
    if (!budget || !id) return
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) return

    try {
      await budgetsAPI.delete(parseInt(id))
      navigate('/budgets')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
      alert(message)
    }
  }

  const getStatusColor = (statut: StatutBudget): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return 'default'
      case 'SOUMIS':
        return 'warning'
      case 'VALIDE':
        return 'success'
      case 'REJETE':
        return 'error'
      case 'ARCHIVE':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={400} />
        </Container>
      </AppLayout>
    )
  }

  if (error || !budget) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Budget non trouvé'}</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/budgets')}
            sx={{ mt: 2 }}
          >
            Retour à la liste
          </Button>
        </Container>
      </AppLayout>
    )
  }

  const deltaMontant = budget.deltaMontant || (budget.totalBudget - budget.plafondConvention)

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title={`Budget ${budget.version}`}
            subtitle={`Date: ${formatDate(budget.dateBudget)}`}
            actions={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={budget.statut}
                  color={getStatusColor(budget.statut)}
                  size="medium"
                />
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/budgets/${id}/modifier`)}
                >
                  Modifier
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                >
                  Supprimer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/budgets')}
                >
                  Retour
                </Button>
              </Box>
            }
          />

          {/* Montants Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.light', color: 'info.dark' }}>
                  <AccountBalance />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Plafond Convention
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(budget.plafondConvention)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                  <TrendingUp />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Budget
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(budget.totalBudget)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: deltaMontant < 0 ? 'error.light' : 'success.light',
                  color: deltaMontant < 0 ? 'error.dark' : 'success.dark'
                }}>
                  <TrendingUp />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Delta
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={deltaMontant < 0 ? 'error.main' : 'success.main'}
                  >
                    {deltaMontant > 0 ? '+' : ''}{formatCurrency(deltaMontant)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Info Section - 2 Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            {/* Left Card - General Info */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Informations Générales
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {budget.version}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date du budget
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(budget.dateBudget)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip label={budget.statut} size="small" color={getStatusColor(budget.statut)} />
                </Box>
              </Box>
            </Paper>

            {/* Right Card - Convention */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Convention Associée
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {convention ? (
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Code
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {convention.code}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Objet
                    </Typography>
                    <Typography variant="body1">
                      {convention.objet}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip label={convention.statut} size="small" color="info" />
                  </Box>

                  <Box sx={{ pt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/conventions/${convention.id}`)}
                    >
                      Voir la convention
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucune convention associée
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Tabs Section */}
          <Paper>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Détails" icon={<Description />} iconPosition="start" />
              <Tab label="Lignes budgétaires" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="Historique" icon={<Timeline />} iconPosition="start" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {/* Montants détaillés */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Montants Détaillés
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Plafond Convention</Typography>
                        <Typography variant="h6" color="info.main" fontWeight={600}>
                          {formatCurrency(budget.plafondConvention)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Budget</Typography>
                        <Typography variant="h6" color="success.main" fontWeight={600}>
                          {formatCurrency(budget.totalBudget)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Delta</Typography>
                        <Typography
                          variant="h6"
                          color={deltaMontant < 0 ? 'error.main' : 'success.main'}
                          fontWeight={600}
                        >
                          {deltaMontant > 0 ? '+' : ''}{formatCurrency(deltaMontant)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Observations */}
                  {budget.observations && (
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb', gridColumn: { xs: '1', md: 'span 2' } }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Observations
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {budget.observations}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Container>
            </TabPanel>

            {/* Lignes budgétaires Tab */}
            <TabPanel value={activeTab} index={1}>
              <Container maxWidth="xl">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Désignation</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                            Aucune ligne budgétaire définie
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Container>
            </TabPanel>

            {/* Historique Tab */}
            <TabPanel value={activeTab} index={2}>
              <Container maxWidth="xl">
                <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>
                  Historique des Modifications
                </Typography>
                <Stack spacing={2}>
                  <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                    <Stack direction="row" spacing={2}>
                      <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        height: 40,
                        width: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CalendarToday />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight={600}>
                          Budget créé
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(budget.dateBudget)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Version: {budget.version} • Statut initial: {budget.statut}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>
              </Container>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default BudgetDetailPageModern
