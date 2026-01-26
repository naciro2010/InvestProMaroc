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
  Description,
  AccountBalance,
  People,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { conventionsAPI } from '../../lib/api'
import {
  ConventionInfoEditCard,
  ConventionFinancesEditCard,
  ConventionDatesEditCard,
} from '../../components/conventions/edit'

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

/**
 * Page d'édition complète avec architecture micro-frontend
 *
 * Pattern:
 * - Page orchestratrice (~100 lignes)
 * - Micro-composants éditables chargent leurs données indépendamment
 * - Chaque micro-composant sauvegarde ses données via son propre micro-endpoint
 * - Lazy loading par onglet
 *
 * Micro-composants:
 * - ConventionInfoEditCard: GET/PATCH /conventions/{id}/basic
 * - ConventionFinancesEditCard: GET/PATCH /conventions/{id}/finances
 * - ConventionDatesEditCard: GET/PATCH /conventions/{id}/dates
 *
 * Benefits:
 * - Chargement progressif (pas tout d'un coup)
 * - Sauvegarde granulaire (section par section)
 * - Chaque composant < 150 lignes
 * - Scalable et maintenable
 */
const ConventionEditPageComplete = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [convention, setConvention] = useState<{ code: string; statut: string } | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (id) {
      loadConventionMetadata(parseInt(id))
    }
  }, [id])

  // Load only metadata for header (not all data)
  const loadConventionMetadata = async (conventionId: number) => {
    try {
      setLoading(true)
      // Micro-endpoint: only metadata (~1 KB)
      const response = await conventionsAPI.getBasic(conventionId)
      const data = response.data.data || response.data
      setConvention({ code: data.code, statut: data.statut })
    } catch (err) {
      setError('Convention non trouvée')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={400} />
        </Container>
      </AppLayout>
    )
  }

  if (error || !convention || !id) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Convention non trouvée'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const conventionId = parseInt(id)

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title={`Modifier Convention ${convention.code}`}
            subtitle="Modification avec sauvegarde granulaire par section"
            actions={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/conventions/${id}`)}
                >
                  Retour à la vue
                </Button>
              </Box>
            }
          />

          {/* Info box */}
          <Alert severity="info" sx={{ mb: 3 }}>
            💡 <strong>Édition granulaire</strong> : Chaque section se sauvegarde indépendamment.
            Cliquez sur "Modifier" dans la section à modifier, puis "Enregistrer" pour sauvegarder.
          </Alert>

          {/* Tabs */}
          <Paper>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Informations générales" icon={<Description />} iconPosition="start" />
              <Tab label="Paramètres financiers" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="Dates" icon={<CalendarToday />} iconPosition="start" />
              <Tab label="Partenaires & Imputations" icon={<People />} iconPosition="start" />
              <Tab label="Versements prévisionnels" icon={<TrendingUp />} iconPosition="start" />
            </Tabs>

            {/* Tab 1: Informations générales */}
            <TabPanel value={activeTab} index={0}>
              <Container maxWidth="lg">
                <ConventionInfoEditCard conventionId={conventionId} />
              </Container>
            </TabPanel>

            {/* Tab 2: Paramètres financiers */}
            <TabPanel value={activeTab} index={1}>
              <Container maxWidth="lg">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 3 }}>
                  <ConventionFinancesEditCard conventionId={conventionId} />
                </Box>
              </Container>
            </TabPanel>

            {/* Tab 3: Dates */}
            <TabPanel value={activeTab} index={2}>
              <Container maxWidth="lg">
                <ConventionDatesEditCard conventionId={conventionId} />
              </Container>
            </TabPanel>

            {/* Tab 4: Partenaires & Imputations */}
            <TabPanel value={activeTab} index={3}>
              <Container maxWidth="lg">
                <Alert severity="info" sx={{ mb: 3 }}>
                  La gestion des partenaires et imputations se fait depuis la page de visualisation de la convention.
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • <strong>Partenaires</strong> : Ajoutez les organismes financeurs de la convention
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Imputations prévisionnelles</strong> : Définissez les allocations budgétaires par axe analytique
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/conventions/${id}`)}
                  >
                    Aller à la page de visualisation
                  </Button>
                </Box>
              </Container>
            </TabPanel>

            {/* Tab 5: Versements prévisionnels */}
            <TabPanel value={activeTab} index={4}>
              <Container maxWidth="lg">
                <Alert severity="info" sx={{ mb: 3 }}>
                  Les versements prévisionnels se gèrent depuis la page de visualisation de la convention.
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Définissez le calendrier prévisionnel des versements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Associez chaque versement à un axe analytique et un projet
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/conventions/${id}`)}
                  >
                    Aller à la page de visualisation
                  </Button>
                </Box>
              </Container>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionEditPageComplete
