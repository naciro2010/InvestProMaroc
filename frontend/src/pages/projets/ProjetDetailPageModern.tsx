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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Skeleton,
  Alert,
  IconButton,
  Stack,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  PlayArrow,
  Pause,
  Done,
  AccountBalance,
  TrendingUp,
  AttachMoney,
  CalendarToday,
  Timeline,
  Visibility,
  Cancel,
  Business,
  Description,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { projetsAPI, Projet as ProjetAPI } from '../../lib/projetsAPI'
import { api, conventionsAPI, marchesAPI } from '../../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

type StatutProjet = 'EN_PREPARATION' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ANNULE'

type Projet = Omit<ProjetAPI, 'dateDebut'> & {
  dateDebut: string
  dateFin?: string
  motifSuspension?: string
  motifAnnulation?: string
  observations?: string
  dateModification?: string
  dateCreation: string
  dateDebutReel?: string
  dateFinReelle?: string
  budgetConsomme: number
  responsableId?: number
  responsableNom?: string
  conventionNumero?: string
}

interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
  dateDebut: string
  dateFin?: string
}

interface Marche {
  id: number
  code: string
  objet: string
  montantTTC: number
  statut: string
  fournisseurNom?: string
}

const ProjetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<Projet | null>(null)
  const [conventions, setConventions] = useState<Convention[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadProjet(parseInt(id))
    }
  }, [id])

  const loadProjet = async (projetId: number) => {
    try {
      setLoading(true)
      const response = await projetsAPI.getById(projetId)
      const data = response.data as Projet
      setProjet(data)

      // Load related data in parallel
      Promise.all([
        loadConventions(data.conventionId),
        loadMarches(projetId),
      ])
    } catch (err) {
      setError('Erreur lors du chargement du projet')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadConventions = async (conventionId?: number) => {
    try {
      if (conventionId) {
        const convResponse = await conventionsAPI.getById(conventionId)
        setConventions([convResponse.data?.data || convResponse.data])
      }
    } catch (err) {
      console.error('Error loading conventions:', err)
    }
  }

  const loadMarches = async (projetId: number) => {
    try {
      const res = await api.get(`/marches/projet/${projetId}`)
      setMarches(res.data.data || res.data || [])
    } catch (err) {
      console.error('Error loading marchés:', err)
      setMarches([])
    }
  }

  const handleDemarrer = async () => {
    if (!projet?.id) return
    if (!window.confirm('Êtes-vous sûr de vouloir démarrer ce projet ?')) return
    try {
      await projetsAPI.demarrer(projet.id)
      loadProjet(projet.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du démarrage'
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suspension'
      alert(message)
    }
  }

  const handleReprendre = async () => {
    if (!projet?.id) return
    if (!window.confirm('Êtes-vous sûr de vouloir reprendre ce projet ?')) return
    try {
      await projetsAPI.reprendre(projet.id)
      loadProjet(projet.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la reprise'
      alert(message)
    }
  }

  const handleTerminer = async () => {
    if (!projet?.id) return
    if (!window.confirm('Êtes-vous sûr de vouloir terminer ce projet ?')) return
    try {
      await projetsAPI.terminer(projet.id)
      loadProjet(projet.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la finalisation'
      alert(message)
    }
  }

  const getStatusColor = (statut: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (statut.toUpperCase()) {
      case 'EN_PREPARATION':
        return 'default'
      case 'EN_COURS':
        return 'info'
      case 'SUSPENDU':
        return 'warning'
      case 'TERMINE':
        return 'success'
      case 'ANNULE':
        return 'error'
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const generateProgressData = () => {
    if (!projet) return []

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
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
          <Alert severity="error">{error || 'Projet non trouvé'}</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projets')}
            sx={{ mt: 2 }}
          >
            Retour à la liste
          </Button>
        </Container>
      </AppLayout>
    )
  }

  const getWorkflowActions = () => {
    const actions = []

    if (projet.statut === 'EN_PREPARATION') {
      actions.push(
        <Button
          key="demarrer"
          variant="contained"
          color="success"
          startIcon={<PlayArrow />}
          onClick={handleDemarrer}
        >
          Démarrer
        </Button>,
        <Button
          key="modifier"
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate(`/projets/${projet.id}/modifier`)}
        >
          Modifier
        </Button>
      )
    }

    if (projet.statut === 'EN_COURS') {
      actions.push(
        <Button
          key="suspendre"
          variant="outlined"
          color="warning"
          startIcon={<Pause />}
          onClick={handleSuspendre}
        >
          Suspendre
        </Button>,
        <Button
          key="terminer"
          variant="contained"
          color="success"
          startIcon={<Done />}
          onClick={handleTerminer}
        >
          Terminer
        </Button>
      )
    }

    if (projet.statut === 'SUSPENDU') {
      actions.push(
        <Button
          key="reprendre"
          variant="contained"
          color="info"
          startIcon={<PlayArrow />}
          onClick={handleReprendre}
        >
          Reprendre
        </Button>
      )
    }

    actions.push(
      <Button
        key="retour"
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/projets')}
      >
        Retour
      </Button>
    )

    return actions
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title={projet.nom}
            subtitle={`Code: ${projet.code}${projet.conventionNumero ? ` • Convention: ${projet.conventionNumero}` : ''}`}
            actions={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={projet.statut.replace('_', ' ')}
                  color={getStatusColor(projet.statut)}
                  size="medium"
                />
                {projet.estEnRetard && (
                  <Chip label="En retard" color="error" size="small" />
                )}
                {getWorkflowActions()}
              </Box>
            }
          />

          {/* KPI Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
                  <AccountBalance />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Budget Total
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(projet.budgetTotal)}
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
                    Avancement
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {projet.pourcentageAvancement.toFixed(2)}%
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark' }}>
                  <AttachMoney />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Budget Consommé
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(projet.budgetConsomme)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: projet.estEnRetard ? 'error.light' : 'info.light',
                  color: projet.estEnRetard ? 'error.dark' : 'info.dark'
                }}>
                  <CalendarToday />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Statut
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {projet.estEnRetard ? 'En retard' : 'Dans les temps'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Progress Bar */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Progression Globale
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                {projet.pourcentageAvancement.toFixed(2)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={projet.pourcentageAvancement}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>

          {/* Tabs Section */}
          <Paper>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Informations Générales" icon={<Description />} iconPosition="start" />
              <Tab label={`Conventions (${conventions.length})`} icon={<AccountBalance />} iconPosition="start" />
              <Tab label="Marchés liés" icon={<Business />} iconPosition="start" />
              <Tab label="Graphique d'Avancement" icon={<TrendingUp />} iconPosition="start" />
              <Tab label="Historique" icon={<Timeline />} iconPosition="start" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {/* Informations Principales */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Informations Principales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Code Projet</Typography>
                        <Typography variant="body1" fontWeight={500}>{projet.code}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Nom</Typography>
                        <Typography variant="body1" fontWeight={500}>{projet.nom}</Typography>
                      </Box>
                      {projet.description && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Description</Typography>
                          <Typography variant="body1">{projet.description}</Typography>
                        </Box>
                      )}
                      {projet.responsableNom && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Responsable</Typography>
                          <Typography variant="body1">{projet.responsableNom}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  {/* Dates */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Dates
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Date de Création</Typography>
                        <Typography variant="body1">{formatDate(projet.dateCreation)}</Typography>
                      </Box>
                      {projet.dateDebut && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date de Début Prévue</Typography>
                          <Typography variant="body1">{formatDate(projet.dateDebut)}</Typography>
                        </Box>
                      )}
                      {projet.dateFin && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date de Fin Prévue</Typography>
                          <Typography variant="body1">{formatDate(projet.dateFin)}</Typography>
                        </Box>
                      )}
                      {projet.dateDebutReel && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date de Début Réelle</Typography>
                          <Typography variant="body1">{formatDate(projet.dateDebutReel)}</Typography>
                        </Box>
                      )}
                      {projet.dateFinReelle && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date de Fin Réelle</Typography>
                          <Typography variant="body1">{formatDate(projet.dateFinReelle)}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  {/* Budget */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb', gridColumn: { xs: '1', md: 'span 2' } }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Budget
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Budget Total</Typography>
                        <Typography variant="h6" color="primary.main" fontWeight={600}>
                          {formatCurrency(projet.budgetTotal)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Budget Consommé</Typography>
                        <Typography variant="h6" color="warning.main" fontWeight={600}>
                          {formatCurrency(projet.budgetConsomme)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Budget Restant</Typography>
                        <Typography variant="h6" color="success.main" fontWeight={600}>
                          {formatCurrency(projet.budgetTotal - (projet.budgetConsomme || 0))}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Observations */}
                  {(projet.motifSuspension || projet.motifAnnulation || projet.observations) && (
                    <Paper sx={{ p: 3, bgcolor: '#fff3cd', gridColumn: { xs: '1', md: 'span 2' } }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Observations
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {projet.motifSuspension && (
                        <Box mb={2}>
                          <Typography variant="caption" color="text.secondary">Motif de Suspension</Typography>
                          <Typography variant="body1">{projet.motifSuspension}</Typography>
                        </Box>
                      )}
                      {projet.motifAnnulation && (
                        <Box mb={2}>
                          <Typography variant="caption" color="text.secondary">Motif d'Annulation</Typography>
                          <Typography variant="body1">{projet.motifAnnulation}</Typography>
                        </Box>
                      )}
                      {projet.observations && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Observations</Typography>
                          <Typography variant="body1">{projet.observations}</Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
              </Container>
            </TabPanel>

            {/* Conventions Tab */}
            <TabPanel value={activeTab} index={1}>
              <Container maxWidth="xl">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Numéro</TableCell>
                        <TableCell>Libellé</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="right">Budget</TableCell>
                        <TableCell>Date Début</TableCell>
                        <TableCell>Date Fin</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {conventions.map((conv) => (
                        <TableRow key={conv.id} hover>
                          <TableCell>{conv.code}</TableCell>
                          <TableCell>{conv.numero}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{conv.libelle}</TableCell>
                          <TableCell>
                            <Chip label={conv.statut} size="small" color="info" />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(conv.budget)}</TableCell>
                          <TableCell>{formatDate(conv.dateDebut)}</TableCell>
                          <TableCell>{conv.dateFin ? formatDate(conv.dateFin) : '-'}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => navigate(`/conventions/${conv.id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {conventions.length === 0 && (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune convention liée à ce projet
                    </Typography>
                  </Box>
                )}
              </Container>
            </TabPanel>

            {/* Marchés Tab */}
            <TabPanel value={activeTab} index={2}>
              <Container maxWidth="xl">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Objet</TableCell>
                        <TableCell>Fournisseur</TableCell>
                        <TableCell align="right">Montant TTC</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marches.map((marche) => (
                        <TableRow key={marche.id} hover>
                          <TableCell>{marche.code}</TableCell>
                          <TableCell>{marche.objet}</TableCell>
                          <TableCell>{marche.fournisseurNom || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(marche.montantTTC)}</TableCell>
                          <TableCell>
                            <Chip label={marche.statut} size="small" color={getStatusColor(marche.statut)} />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => navigate(`/marches/${marche.id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {marches.length === 0 && (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun marché lié à ce projet
                    </Typography>
                  </Box>
                )}
              </Container>
            </TabPanel>

            {/* Graphique d'Avancement Tab */}
            <TabPanel value={activeTab} index={3}>
              <Container maxWidth="xl">
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Courbe d'Avancement du Projet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Comparaison entre l'avancement réel et l'avancement planifié
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={generateProgressData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis label={{ value: 'Avancement (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planifie" stroke="#94a3b8" name="Planifié" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="avancement" stroke="#1e40af" name="Réel" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Container>
            </TabPanel>

            {/* Historique Tab */}
            <TabPanel value={activeTab} index={4}>
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
                        <Timeline />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight={600}>
                          Projet créé
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {projet.dateCreation ? formatDate(projet.dateCreation) : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Statut initial: EN_PREPARATION
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {projet.dateDebutReel && (
                    <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: 'success.light',
                          color: 'success.dark',
                          height: 40,
                          width: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <PlayArrow />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight={600}>
                            Projet démarré
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(projet.dateDebutReel)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Passage au statut: EN_COURS
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {projet.motifSuspension && (
                    <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: 'warning.light',
                          color: 'warning.dark',
                          height: 40,
                          width: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Pause />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight={600}>
                            Projet suspendu
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Motif: {projet.motifSuspension}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {projet.dateFinReelle && (
                    <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: 'success.light',
                          color: 'success.dark',
                          height: 40,
                          width: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Done />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight={600}>
                            Projet terminé
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(projet.dateFinReelle)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Passage au statut: TERMINE
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {projet.motifAnnulation && (
                    <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: 'error.light',
                          color: 'error.dark',
                          height: 40,
                          width: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Cancel />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight={600}>
                            Projet annulé
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Motif: {projet.motifAnnulation}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {projet.dateModification && (
                    <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: 'info.light',
                          color: 'info.dark',
                          height: 40,
                          width: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Edit />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight={600}>
                            Dernière modification
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(projet.dateModification)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Container>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ProjetDetailPageModern
