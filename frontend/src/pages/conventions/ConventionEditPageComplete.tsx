import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  Skeleton,
} from '@mui/material'
import {
  ArrowBack,
  Info,
  AttachMoney,
  CalendarToday,
  People,
  AccountBalance,
  Visibility,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { conventionsAPI } from '../../lib/api'
import {
  ConventionInfoEditCard,
  ConventionFinancesEditCard,
  ConventionDatesEditCard,
} from '../../components/conventions/edit'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import StatusBadge from '../../components/core/StatusBadge'

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

const ConventionEditPageComplete = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [convention, setConvention] = useState<{ code: string; statut: string; libelle?: string } | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (id) loadConventionMetadata(parseInt(id))
  }, [id])

  const loadConventionMetadata = async (conventionId: number) => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getBasic(conventionId)
      const data = response.data.data || response.data
      setConvention({ code: data.code, statut: data.statut, libelle: data.libelle })
    } catch {
      setError('Convention non trouvee')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
          <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
            <Container maxWidth="xl" disableGutters>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={300} height={20} sx={{ mt: 0.5 }} />
            </Container>
          </Box>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: '8px' }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px' }} />
          </Container>
        </Box>
      </AppLayout>
    )
  }

  if (error || !convention || !id) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Convention non trouvee'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const conventionId = parseInt(id)

  const tabs = [
    { label: 'Informations', icon: <Info sx={{ fontSize: 18 }} /> },
    { label: 'Finances', icon: <AttachMoney sx={{ fontSize: 18 }} /> },
    { label: 'Dates', icon: <CalendarToday sx={{ fontSize: 18 }} /> },
    { label: 'Partenaires', icon: <People sx={{ fontSize: 18 }} /> },
    { label: 'Versements', icon: <AccountBalance sx={{ fontSize: 18 }} /> },
  ]

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        {/* Top bar */}
        <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: { xs: 2, md: 4 }, py: 2 }}>
          <Container maxWidth="xl" disableGutters>
            {/* Breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.link, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/dashboard')}>
                Accueil
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>/</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.link, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/conventions')}>
                Conventions
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>/</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.link, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate(`/conventions/${id}`)}>
                {convention.code}
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>/</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Modifier</Typography>
            </Box>

            {/* Title row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary }}>
                    Modifier {convention.code}
                  </Typography>
                  <StatusBadge status={convention.statut} size="small" />
                </Box>
                {convention.libelle && (
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mt: 0.5 }}>
                    {convention.libelle}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/conventions/${id}`)}
                  sx={{
                    textTransform: 'none',
                    borderColor: colors.neutral[200],
                    color: colors.textSecondary,
                    '&:hover': { borderColor: colors.primary[300], color: colors.primary[600] },
                  }}
                >
                  Voir
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/conventions/${id}`)}
                  sx={{
                    textTransform: 'none',
                    borderColor: colors.neutral[200],
                    color: colors.textSecondary,
                  }}
                >
                  Retour
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Info banner */}
          <Alert
            severity="info"
            sx={{
              mb: 3,
              bgcolor: colors.primary[25],
              border: `1px solid ${colors.primary[100]}`,
              '& .MuiAlert-icon': { color: colors.primary[600] },
              '& .MuiAlert-message': { color: colors.textPrimary },
            }}
          >
            <strong>Edition granulaire</strong> - Chaque section se sauvegarde independamment. Cliquez sur "Modifier" dans une section, puis "Enregistrer" pour sauvegarder.
          </Alert>

          {/* Tabs */}
          <Paper sx={{ ...componentStyles.card, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${colors.border}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: typography.weights.medium,
                  fontSize: typography.sizes.sm,
                  color: colors.textSecondary,
                  minHeight: 48,
                },
                '& .Mui-selected': { color: colors.primary[600], fontWeight: typography.weights.semibold },
                '& .MuiTabs-indicator': { bgcolor: colors.primary[600], height: 2 },
              }}
            >
              {tabs.map((tab, i) => (
                <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>

            {/* Tab 1: Informations */}
            <TabPanel value={activeTab} index={0}>
              <Container maxWidth="md">
                <ConventionInfoEditCard conventionId={conventionId} />
              </Container>
            </TabPanel>

            {/* Tab 2: Finances */}
            <TabPanel value={activeTab} index={1}>
              <Container maxWidth="md">
                <ConventionFinancesEditCard conventionId={conventionId} />
              </Container>
            </TabPanel>

            {/* Tab 3: Dates */}
            <TabPanel value={activeTab} index={2}>
              <Container maxWidth="md">
                <ConventionDatesEditCard conventionId={conventionId} />
              </Container>
            </TabPanel>

            {/* Tab 4: Partenaires */}
            <TabPanel value={activeTab} index={3}>
              <Container maxWidth="md">
                <Paper sx={{ ...componentStyles.card, p: 4, textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, color: colors.neutral[300], mb: 2 }} />
                  <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1 }}>
                    Gestion des partenaires
                  </Typography>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Les partenaires et imputations analytiques se gerent depuis la page de visualisation de la convention.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/conventions/${id}`)}
                    sx={{
                      bgcolor: colors.primary[600],
                      '&:hover': { bgcolor: colors.primary[700] },
                      textTransform: 'none',
                      fontWeight: typography.weights.medium,
                    }}
                  >
                    Aller a la page de visualisation
                  </Button>
                </Paper>
              </Container>
            </TabPanel>

            {/* Tab 5: Versements */}
            <TabPanel value={activeTab} index={4}>
              <Container maxWidth="md">
                <Paper sx={{ ...componentStyles.card, p: 4, textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: 48, color: colors.neutral[300], mb: 2 }} />
                  <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1 }}>
                    Versements previsionnels
                  </Typography>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Le calendrier previsionnel des versements se gere depuis la page de visualisation de la convention.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/conventions/${id}`)}
                    sx={{
                      bgcolor: colors.primary[600],
                      '&:hover': { bgcolor: colors.primary[700] },
                      textTransform: 'none',
                      fontWeight: typography.weights.medium,
                    }}
                  >
                    Aller a la page de visualisation
                  </Button>
                </Paper>
              </Container>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionEditPageComplete
