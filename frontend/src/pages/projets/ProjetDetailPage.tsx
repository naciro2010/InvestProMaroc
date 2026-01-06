import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Grid,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  CheckCircle,
  Pending,
  Cancel,
  AccountBalance,
  CalendarToday,
  TrendingUp,
  Description,
  Timeline,
  Warning,
  PlayArrow,
  Pause,
  Done,
  AttachMoney,
} from '@mui/icons-material'
import { projetsAPI, Projet as ProjetAPI } from '../../lib/projetsAPI'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type StatutProjet = 'EN_PREPARATION' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ANNULE'

// Extend Projet from projetsAPI with additional fields
// Making required fields non-optional for this component
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

const ProjetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [projet, setProjet] = useState<Projet | null>(null)
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (id) {
      fetchProjet(parseInt(id))
    }
  }, [id])

  const fetchProjet = async (projetId: number) => {
    try {
      const response = await projetsAPI.getById(projetId)
      const data = response.data as Projet
      setProjet(data)

      // Fetch conventions related to this project
      if (data.conventionId) {
        const convResponse = await conventionsAPI.getById(data.conventionId)
        setConventions([convResponse.data?.data || convResponse.data])
      }
    } catch (error) {
      console.error('Erreur chargement projet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDemarrer = async () => {
    if (!projet?.id) return
    if (!window.confirm('Êtes-vous sûr de vouloir démarrer ce projet ?')) return
    try {
      await projetsAPI.demarrer(projet.id)
      fetchProjet(projet.id)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du démarrage')
    }
  }

  const handleSuspendre = async () => {
    if (!projet?.id) return
    const motif = window.prompt('Motif de suspension :')
    if (!motif) return
    try {
      await projetsAPI.suspendre(projet.id, motif)
      fetchProjet(projet.id)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suspension')
    }
  }

  const handleReprendre = async () => {
    if (!projet?.id) return
    if (!window.confirm('Êtes-vous sûr de vouloir reprendre ce projet ?')) return
    try {
      await projetsAPI.reprendre(projet.id)
      fetchProjet(projet.id)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la reprise')
    }
  }

  const handleTerminer = async () => {
    if (!projet?.id) return
    if (!window.confirm('Êtes-vous sûr de vouloir terminer ce projet ?')) return
    try {
      await projetsAPI.terminer(projet.id)
      fetchProjet(projet.id)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la finalisation')
    }
  }

  const getStatutBadge = (statut: StatutProjet) => {
    const config: Record<StatutProjet, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: JSX.Element }> = {
      EN_PREPARATION: { color: 'default', icon: <Edit fontSize="small" /> },
      EN_COURS: { color: 'info', icon: <Pending fontSize="small" /> },
      SUSPENDU: { color: 'warning', icon: <Pause fontSize="small" /> },
      TERMINE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      ANNULE: { color: 'error', icon: <Cancel fontSize="small" /> },
    }
    const { color, icon } = config[statut]
    return <Chip icon={icon} label={statut.replace('_', ' ')} color={color} size="medium" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Generate mock data for progress chart
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
        <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>
      </AppLayout>
    )
  }

  if (!projet) {
    return (
      <AppLayout>
        <Container maxWidth="xl">
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5">Projet non trouvé</Typography>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/projets')}
              sx={{ mt: 2 }}
            >
              Retour à la liste
            </Button>
          </Box>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <IconButton onClick={() => navigate('/projets')}>
              <ArrowBack />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={600}>
                {projet.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Code: {projet.code}
                {projet.conventionNumero && ` • Convention: ${projet.conventionNumero}`}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {getStatutBadge(projet.statut as StatutProjet)}
              {projet.estEnRetard && (
                <Chip icon={<Warning fontSize="small" />} label="En retard" color="error" size="small" />
              )}

              {/* Action buttons based on status */}
              {projet.statut === 'EN_PREPARATION' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={handleDemarrer}
                >
                  Démarrer
                </Button>
              )}
              {projet.statut === 'EN_COURS' && (
                <>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Pause />}
                    onClick={handleSuspendre}
                  >
                    Suspendre
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Done />}
                    onClick={handleTerminer}
                  >
                    Terminer
                  </Button>
                </>
              )}
              {projet.statut === 'SUSPENDU' && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<PlayArrow />}
                  onClick={handleReprendre}
                >
                  Reprendre
                </Button>
              )}
              {projet.statut === 'EN_PREPARATION' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/projets/${projet.id}/modifier`)}
                >
                  Modifier
                </Button>
              )}
            </Stack>
          </Stack>

          {/* KPI Cards */}
          <Grid container spacing={2}>
            <Grid container spacing={2}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
                      <AccountBalance />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Budget Total</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {formatCurrency(projet.budgetTotal)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid container spacing={2}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                      <TrendingUp />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Avancement</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {projet.pourcentageAvancement.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid container spacing={2}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark' }}>
                      <AttachMoney />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Budget Consommé</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {formatCurrency(projet.budgetConsomme)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid container spacing={2}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: projet.estEnRetard ? 'error.light' : 'info.light', color: projet.estEnRetard ? 'error.dark' : 'info.dark' }}>
                      <CalendarToday />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Statut</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {projet.estEnRetard ? 'En retard' : 'Dans les temps'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Informations Générales" />
              <Tab label={`Conventions (${conventions.length})`} />
              <Tab label="Graphique d'Avancement" />
              <Tab label="Historique" />
            </Tabs>

            <CardContent sx={{ p: 3 }}>
              {/* Tab 0: Informations Générales */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid container spacing={2}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Informations Principales
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
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
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid container spacing={2}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Dates
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
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
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid container spacing={2}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Budget
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid container spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Budget Total</Typography>
                            <Typography variant="h6" color="primary.main" fontWeight={600}>
                              {formatCurrency(projet.budgetTotal)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid container spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Budget Consommé</Typography>
                            <Typography variant="h6" color="warning.main" fontWeight={600}>
                              {formatCurrency(projet.budgetConsomme)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid container spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Budget Restant</Typography>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {formatCurrency(projet.budgetTotal - (projet.budgetConsomme || 0))}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {(projet.motifSuspension || projet.motifAnnulation || projet.observations) && (
                    <Grid container spacing={2}>
                      <Paper sx={{ p: 3, bgcolor: 'warning.lighter' }}>
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
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Tab 1: Conventions */}
              {activeTab === 1 && (
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {conventions.map((conv) => (
                        <TableRow
                          key={conv.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/conventions/${conv.id}`)}
                        >
                          <TableCell>{conv.code}</TableCell>
                          <TableCell>{conv.numero}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{conv.libelle}</TableCell>
                          <TableCell>
                            <Chip label={conv.statut} size="small" color="info" />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(conv.budget)}</TableCell>
                          <TableCell>{formatDate(conv.dateDebut)}</TableCell>
                          <TableCell>{conv.dateFin ? formatDate(conv.dateFin) : '-'}</TableCell>
                        </TableRow>
                      ))}
                      {conventions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary">
                              Aucune convention liée à ce projet
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab 2: Graphique d'Avancement */}
              {activeTab === 2 && (
                <Box>
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
                </Box>
              )}

              {/* Tab 3: Historique */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>
                    Historique des Modifications
                  </Typography>
                  <Stack spacing={2}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.dark', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'success.light', color: 'success.dark', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'warning.light', color: 'warning.dark', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'success.light', color: 'success.dark', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'error.light', color: 'error.dark', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'info.light', color: 'info.dark', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ProjetDetailPage
