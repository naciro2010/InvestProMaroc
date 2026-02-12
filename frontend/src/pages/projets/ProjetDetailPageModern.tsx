import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Button,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  Alert,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  PlayArrow,
  Pause,
  Done,
  AccountBalance,
  TrendingUp,
  Timeline,
  Business,
  Description,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader } from '@/components/core'
import { projetsAPI } from '../../lib/projetsAPI'
import { ProjetStatsCards, ProjetProgressBar, ProjetChartTab } from '../../components/projets/detail'
import {
  ProjetInfoCard,
  ProjetConventionsTab,
  ProjetMarchesTab,
  ProjetBudgetSection,
  ProjetHistoriqueTab,
  Projet,
  formatCurrency,
  getStatusColor,
} from './components'

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

const ProjetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<Projet | null>(null)
  const [error, setError] = useState<string | null>(null)

  const projetId = id ? parseInt(id) : 0

  useEffect(() => {
    if (projetId) {
      loadProjet(projetId)
    }
  }, [projetId])

  const loadProjet = async (pid: number) => {
    try {
      setLoading(true)
      const response = await projetsAPI.getById(pid)
      setProjet(response.data as Projet)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement du projet'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemarrer = async () => {
    if (!projet?.id) return
    if (!window.confirm('\u00cates-vous s\u00fbr de vouloir d\u00e9marrer ce projet ?')) return
    try {
      await projetsAPI.demarrer(projet.id)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du d\u00e9marrage'
      alert(message)
    }
  }

  const handleSuspendre = async () => {
    if (!projet?.id) return
    const motif = window.prompt('Motif de suspension :')
    if (!motif) return
    try {
      await projetsAPI.suspendre(projet.id, motif)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suspension'
      alert(message)
    }
  }

  const handleReprendre = async () => {
    if (!projet?.id) return
    if (!window.confirm('\u00cates-vous s\u00fbr de vouloir reprendre ce projet ?')) return
    try {
      await projetsAPI.reprendre(projet.id)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la reprise'
      alert(message)
    }
  }

  const handleTerminer = async () => {
    if (!projet?.id) return
    if (!window.confirm('\u00cates-vous s\u00fbr de vouloir terminer ce projet ?')) return
    try {
      await projetsAPI.terminer(projet.id)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la finalisation'
      alert(message)
    }
  }

  const generateProgressData = () => {
    if (!projet) return []
    const months = ['Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Ao\u00fb', 'Sep', 'Oct', 'Nov', 'D\u00e9c']
    const data = []
    const currentMonth = new Date().getMonth()
    for (let i = 0; i <= currentMonth; i++) {
      data.push({
        mois: months[i],
        avancement: Math.min((i + 1) * (projet.pourcentageAvancement / (currentMonth + 1)), projet.pourcentageAvancement),
        planifie: (i + 1) * (100 / 12),
      })
    }
    return data
  }

  const getWorkflowActions = () => {
    if (!projet) return []
    const actions: React.ReactNode[] = []

    if (projet.statut === 'EN_PREPARATION') {
      actions.push(
        <Button key="demarrer" variant="contained" color="success" startIcon={<PlayArrow />} onClick={handleDemarrer}>
          D\u00e9marrer
        </Button>,
        <Button key="modifier" variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/projets/${projet.id}/modifier`)}>
          Modifier
        </Button>,
      )
    }
    if (projet.statut === 'EN_COURS') {
      actions.push(
        <Button key="suspendre" variant="outlined" color="warning" startIcon={<Pause />} onClick={handleSuspendre}>
          Suspendre
        </Button>,
        <Button key="terminer" variant="contained" color="success" startIcon={<Done />} onClick={handleTerminer}>
          Terminer
        </Button>,
      )
    }
    if (projet.statut === 'SUSPENDU') {
      actions.push(
        <Button key="reprendre" variant="contained" color="info" startIcon={<PlayArrow />} onClick={handleReprendre}>
          Reprendre
        </Button>,
      )
    }
    actions.push(
      <Button key="retour" variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/projets')}>
        Retour
      </Button>,
    )
    return actions
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

  if (error || !projet) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Projet non trouv\u00e9'}</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/projets')} sx={{ mt: 2 }}>
            Retour \u00e0 la liste
          </Button>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <PageHeader
            title={projet.nom}
            subtitle={`Code: ${projet.code}${projet.conventionNumero ? ` \u2022 Convention: ${projet.conventionNumero}` : ''}`}
            actions={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip label={projet.statut.replace('_', ' ')} color={getStatusColor(projet.statut)} size="medium" />
                {projet.estEnRetard && <Chip label="En retard" color="error" size="small" />}
                {getWorkflowActions()}
              </Box>
            }
          />

          <ProjetStatsCards
            budgetTotal={projet.budgetTotal}
            pourcentageAvancement={projet.pourcentageAvancement}
            budgetConsomme={projet.budgetConsomme}
            estEnRetard={projet.estEnRetard}
            formatCurrency={formatCurrency}
          />

          <ProjetProgressBar pourcentageAvancement={projet.pourcentageAvancement} />

          <Paper>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tab label="Informations G\u00e9n\u00e9rales" icon={<Description />} iconPosition="start" />
              <Tab label="Conventions" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="March\u00e9s li\u00e9s" icon={<Business />} iconPosition="start" />
              <Tab label="Graphique d'Avancement" icon={<TrendingUp />} iconPosition="start" />
              <Tab label="Historique" icon={<Timeline />} iconPosition="start" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <ProjetInfoCard projetId={projetId} />
              <Box sx={{ px: 3, mt: 3 }}>
                <ProjetBudgetSection projetId={projetId} />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <ProjetConventionsTab projetId={projetId} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <ProjetMarchesTab projetId={projetId} />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <ProjetChartTab chartData={generateProgressData()} />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <ProjetHistoriqueTab projetId={projetId} />
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ProjetDetailPageModern
