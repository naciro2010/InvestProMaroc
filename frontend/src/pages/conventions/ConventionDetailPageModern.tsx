import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Skeleton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Add,
  Description,
  People,
  AccountBalance,
  Assignment,
  Business,
  TrendingUp,
  Visibility,
  History,
  Lock,
  Send,
  CheckCircle,
  Cancel,
  PlayArrow,
  Stop,
  Flag,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { api, conventionsAPI, avenantConventionsAPI } from '../../lib/api'
import {
  ConventionInfoCard,
  ConventionSousConventionsCard,
  ConventionAvenantsTab,
  ConventionHistoryCard,
  ConventionInfoCardLazy,
  ConventionFinancesCard,
  ConventionStatsCard,
  ConventionPartenairesCard,
} from '../../components/conventions/detail'
import { colors, componentStyles, typography } from '../../lib/designSystem'
import StatusBadge from '../../components/core/StatusBadge'
import AddPartenaireDialog from '../../components/conventions/AddPartenaireDialog'
import LinkProjetDialog from '../../components/conventions/LinkProjetDialog'
import LinkMarcheDialog from '../../components/conventions/LinkMarcheDialog'

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
  numero: string
  libelle: string
  objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  statut: string
  tauxCommission: number
  baseCalcul: string
  montant: number
  dateSignature: string
  dateDebut: string
  dateFin?: string
  tauxTva: number
}

interface Avenant {
  id: number
  numeroAvenant: string
  dateAvenant: string
  statut: string
  objet: string
  type: string
}

interface SousConvention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  montant: number
  dateDebut: string
}

interface Projet {
  id: number
  code: string
  designation: string
  budgetTotal: number
  statut: string
}

interface Marche {
  id: number
  code: string
  objet: string
  montantTTC: number
  statut: string
  fournisseurNom?: string
}

const ConventionDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin, isManager } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [avenants, setAvenants] = useState<Avenant[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal states
  const [addPartenaireDialogOpen, setAddPartenaireDialogOpen] = useState(false)
  const [editPartenaireData, setEditPartenaireData] = useState<{
    id: number
    partenaireId: number
    partenaireNom: string
    budgetAlloue: number
    pourcentage: number
    estMaitreOeuvre: boolean
    estMaitreOeuvreDelegue: boolean
    remarques?: string
  } | null>(null)
  const [linkProjetDialogOpen, setLinkProjetDialogOpen] = useState(false)
  const [linkMarcheDialogOpen, setLinkMarcheDialogOpen] = useState(false)
  const [partenairesRefreshKey, setPartenairesRefreshKey] = useState(0)

  // Workflow states
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectMotif, setRejectMotif] = useState('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelMotif, setCancelMotif] = useState('')

  useEffect(() => {
    if (id) {
      loadConvention(parseInt(id))
    }
  }, [id])

  const loadConvention = async (conventionId: number) => {
    try {
      setLoading(true)
      const res = await conventionsAPI.getById(conventionId)
      setConvention(res.data.data || res.data)

      // Load related data in parallel
      Promise.all([
        loadAvenants(conventionId),
        loadSousConventions(conventionId),
        loadProjets(conventionId),
        loadMarches(conventionId),
      ])
    } catch (err) {
      setError('Erreur lors du chargement de la convention')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadAvenants = async (conventionId: number) => {
    try {
      const res = await avenantConventionsAPI.getByConvention(conventionId)
      setAvenants(res.data.data || res.data || [])
    } catch (err) {
      console.error('Error loading avenants:', err)
      setAvenants([])
    }
  }

  const loadSousConventions = async (conventionId: number) => {
    try {
      const res = await conventionsAPI.getSousConventions(conventionId)
      setSousConventions(res.data.data || [])
    } catch (err) {
      console.error('Error loading sous-conventions:', err)
    }
  }

  const loadProjets = async (conventionId: number) => {
    try {
      const res = await api.get(`/projets/convention/${conventionId}`)
      setProjets(res.data.data || res.data || [])
    } catch (err) {
      console.error('Error loading projets:', err)
      setProjets([])
    }
  }

  const loadMarches = async (conventionId: number) => {
    try {
      const res = await api.get(`/marches/convention/${conventionId}`)
      setMarches(res.data.data || res.data || [])
    } catch (err) {
      console.error('Error loading marchés:', err)
      setMarches([])
    }
  }

  // Workflow action handlers
  const handleSoumettre = async () => {
    if (!convention) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.soumettre(convention.id)
      setSuccessMessage('Convention soumise avec succès')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors de la soumission de la convention')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleValider = async () => {
    if (!convention || !user?.id) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.valider(convention.id, user.id)
      setSuccessMessage('Convention validée avec succès')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors de la validation de la convention')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleRejeter = async () => {
    if (!convention || !rejectMotif.trim()) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.rejeter(convention.id, rejectMotif)
      setSuccessMessage('Convention rejetée')
      setRejectDialogOpen(false)
      setRejectMotif('')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors du rejet de la convention')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleMettreEnCours = async () => {
    if (!convention) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.mettreEnCours(convention.id)
      setSuccessMessage('Convention mise en exécution')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors de la mise en exécution')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleAchever = async () => {
    if (!convention) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.achever(convention.id)
      setSuccessMessage('Convention achevée avec succès')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors de l\'achèvement de la convention')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleAnnuler = async () => {
    if (!convention || !cancelMotif.trim()) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.annuler(convention.id, cancelMotif)
      setSuccessMessage('Convention annulée')
      setCancelDialogOpen(false)
      setCancelMotif('')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors de l\'annulation de la convention')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleRemettreEnBrouillon = async () => {
    if (!convention) return
    try {
      setWorkflowLoading(true)
      setError(null)
      await conventionsAPI.remettreEnBrouillon(convention.id)
      setSuccessMessage('Convention remise en brouillon')
      loadConvention(convention.id)
    } catch (err) {
      setError('Erreur lors de la remise en brouillon')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const getStatusColor = (statut: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!statut) return 'default'
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return 'default'
      case 'SOUMIS':
        return 'info'
      case 'VALIDEE':
      case 'VALIDE':
        return 'success'
      case 'EN_COURS':
      case 'EN_EXECUTION':
        return 'primary'
      case 'ACHEVE':
      case 'TERMINE':
        return 'secondary'
      case 'REJETE':
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

  if (error || !convention) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Convention non trouvée'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const canEdit = convention?.statut === 'BROUILLON'

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Messages */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Header */}
          <PageHeader
            title={`Convention ${convention.code}`}
            subtitle={convention.libelle}
            actions={
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Workflow Actions */}
                {workflowLoading && <CircularProgress size={24} />}

                {/* BROUILLON → SOUMIS */}
                {convention.statut === 'BROUILLON' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleSoumettre}
                    disabled={workflowLoading}
                  >
                    Soumettre
                  </Button>
                )}

                {/* SOUMIS → VALIDEE (Admin/Manager only) */}
                {convention.statut === 'SOUMIS' && (isAdmin || isManager) && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleValider}
                      disabled={workflowLoading}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={workflowLoading}
                    >
                      Rejeter
                    </Button>
                  </>
                )}

                {/* REJETE → BROUILLON */}
                {convention.statut === 'REJETE' && (
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<Edit />}
                    onClick={handleRemettreEnBrouillon}
                    disabled={workflowLoading}
                  >
                    Corriger
                  </Button>
                )}

                {/* VALIDEE → EN_EXECUTION */}
                {convention.statut === 'VALIDEE' && (
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<PlayArrow />}
                    onClick={handleMettreEnCours}
                    disabled={workflowLoading}
                  >
                    Démarrer
                  </Button>
                )}

                {/* EN_EXECUTION → ACHEVE */}
                {convention.statut === 'EN_EXECUTION' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Flag />}
                    onClick={handleAchever}
                    disabled={workflowLoading}
                  >
                    Achever
                  </Button>
                )}

                {/* Annuler (sauf ACHEVE et ANNULE) */}
                {!['ACHEVE', 'ANNULE'].includes(convention.statut) && (isAdmin || isManager) && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Stop />}
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={workflowLoading}
                    size="small"
                  >
                    Annuler
                  </Button>
                )}

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                {/* Other Actions */}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                  size="small"
                >
                  Avenant
                </Button>
                {convention.typeConvention === 'CADRE' && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate(`/conventions/${id}/sous-conventions/nouveau`)}
                    size="small"
                  >
                    Conv. Spécifique
                  </Button>
                )}
                <Tooltip
                  title={
                    !canEdit
                      ? 'La modification n\'est possible qu\'en statut BROUILLON'
                      : 'Modifier la convention'
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      startIcon={canEdit ? <Edit /> : <Lock />}
                      onClick={() => navigate(`/conventions/${id}/edit`)}
                      disabled={!canEdit}
                      size="small"
                    >
                      Modifier
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/conventions')}
                  size="small"
                >
                  Retour
                </Button>
              </Box>
            }
          />

          {/* Info Section - Micro-Components with Lazy Loading */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            {/* Basic Info - Lazy loaded via micro-endpoint (~5-10 KB) */}
            <ConventionInfoCardLazy
              conventionId={convention.id}
              canEdit={canEdit}
              getStatusColor={getStatusColor}
            />

            {/* Finances - Lazy loaded via micro-endpoint (~3-5 KB) */}
            <ConventionFinancesCard conventionId={convention.id} />
          </Box>

          {/* Stats Section - Lazy loaded via micro-endpoint (~5 KB) */}
          <Box sx={{ mb: 3 }}>
            <ConventionStatsCard conventionId={convention.id} />
          </Box>

          {/* Sous-Conventions Summary Card */}
          {convention.typeConvention === 'CADRE' && sousConventions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <ConventionSousConventionsCard
                typeConvention={convention.typeConvention}
                sousConventions={sousConventions}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                setActiveTab={setActiveTab}
              />
            </Box>
          )}

          {/* Tabs Section */}
          <Paper>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Détail de la convention" icon={<Description />} iconPosition="start" />
              {convention.typeConvention === 'CADRE' && (
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Conventions spécifiques
                      {sousConventions.length > 0 && (
                        <Chip label={sousConventions.length} size="small" color="primary" />
                      )}
                    </Box>
                  }
                  icon={<Assignment />}
                  iconPosition="start"
                />
              )}
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Avenants & Historique
                    {avenants.length > 0 && (
                      <Chip label={avenants.length} size="small" color="warning" />
                    )}
                  </Box>
                }
                icon={<History />}
                iconPosition="start"
              />
              <Tab label="Projets liés" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="Marchés liés" icon={<Business />} iconPosition="start" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {/* Partenaires Card - Micro-Component */}
                  <ConventionPartenairesCard
                    key={partenairesRefreshKey}
                    conventionId={convention.id}
                    onAddClick={() => setAddPartenaireDialogOpen(true)}
                    onEditClick={(partenaire) => {
                      setEditPartenaireData({
                        id: partenaire.id,
                        partenaireId: partenaire.partenaireId,
                        partenaireNom: partenaire.partenaireNom,
                        budgetAlloue: partenaire.budgetAlloue,
                        pourcentage: partenaire.pourcentage,
                        estMaitreOeuvre: partenaire.estMaitreOeuvre,
                        estMaitreOeuvreDelegue: partenaire.estMaitreOeuvreDelegue,
                        remarques: partenaire.remarques || undefined,
                      })
                      setAddPartenaireDialogOpen(true)
                    }}
                  />

                  {/* Maître d'œuvre Card */}
                  <Paper sx={{ ...componentStyles.card, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: colors.info[600] }} />
                        <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                          Maître d'œuvre
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          alert('Fonctionnalité en développement : Ajouter un maître d\'œuvre')
                        }}
                        sx={{ borderColor: colors.primary[300], color: colors.primary[600] }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: colors.border }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Aucun maître d'œuvre défini
                    </Typography>
                  </Paper>

                  {/* Imputations prévisionnelles Card */}
                  <Paper sx={{ ...componentStyles.card, p: 3, gridColumn: { xs: '1', md: 'span 2' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ color: colors.success[600] }} />
                        <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                          Imputations prévisionnelles
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          alert('Fonctionnalité en développement : Ajouter une imputation')
                        }}
                        sx={{ borderColor: colors.primary[300], color: colors.primary[600] }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: colors.border }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Axe</TableCell>
                            <TableCell>Projet</TableCell>
                            <TableCell>Volet</TableCell>
                            <TableCell>Date démarrage</TableCell>
                            <TableCell>Délai</TableCell>
                            <TableCell>Date fin prévue</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                Aucune imputation prévisionnelle
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>

                  {/* Versements prévisionnels Card */}
                  <Paper sx={{ ...componentStyles.card, p: 3, gridColumn: { xs: '1', md: 'span 2' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance sx={{ color: colors.warning[600] }} />
                        <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                          Versements prévisionnels
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          alert('Fonctionnalité en développement : Ajouter un versement')
                        }}
                        sx={{ borderColor: colors.primary[300], color: colors.primary[600] }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: colors.border }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Axe</TableCell>
                            <TableCell>Projet</TableCell>
                            <TableCell>Volet</TableCell>
                            <TableCell>Date versement</TableCell>
                            <TableCell align="right">Montant</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                Aucun versement prévisionnel
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              </Container>
            </TabPanel>

            {/* Sous-conventions Tab */}
            {convention.typeConvention === 'CADRE' && (
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
                          <TableCell align="right">Montant</TableCell>
                          <TableCell>Date début</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sousConventions.map((sc) => (
                          <TableRow key={sc.id} hover>
                            <TableCell>{sc.code}</TableCell>
                            <TableCell>{sc.numero}</TableCell>
                            <TableCell>{sc.libelle}</TableCell>
                            <TableCell>
                              <StatusBadge status={sc.statut} size="small" />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(sc.montant)}</TableCell>
                            <TableCell>{formatDate(sc.dateDebut)}</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" onClick={() => navigate(`/conventions/${sc.id}`)}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {sousConventions.length === 0 && (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune convention spécifique
                      </Typography>
                    </Box>
                  )}
                </Container>
              </TabPanel>
            )}

            {/* Avenants & Historique Tab - Micro-Component */}
            <TabPanel value={activeTab} index={convention.typeConvention === 'CADRE' ? 2 : 1}>
              <ConventionAvenantsTab
                convention={convention}
                avenants={avenants}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
              />

              {/* Historique des modifications */}
              <Container maxWidth="xl" sx={{ mt: 4 }}>
                <ConventionHistoryCard conventionId={convention.id} />
              </Container>
            </TabPanel>

            {/* Projets Tab */}
            <TabPanel value={activeTab} index={convention.typeConvention === 'CADRE' ? 3 : 2}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setLinkProjetDialogOpen(true)}
                  >
                    Lier un projet
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Désignation</TableCell>
                        <TableCell align="right">Budget Total</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projets.map((projet) => (
                        <TableRow key={projet.id} hover>
                          <TableCell>{projet.code}</TableCell>
                          <TableCell>{projet.designation}</TableCell>
                          <TableCell align="right">{formatCurrency(projet.budgetTotal)}</TableCell>
                          <TableCell>
                            <StatusBadge status={projet.statut} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => navigate(`/projets/${projet.id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {projets.length === 0 && (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun projet lié à cette convention
                    </Typography>
                  </Box>
                )}
              </Container>
            </TabPanel>

            {/* Marchés Tab */}
            <TabPanel value={activeTab} index={convention.typeConvention === 'CADRE' ? 4 : 3}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setLinkMarcheDialogOpen(true)}
                  >
                    Lier un marché
                  </Button>
                </Box>
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
                            <StatusBadge status={marche.statut} size="small" />
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
                      Aucun marché lié à cette convention
                    </Typography>
                  </Box>
                )}
              </Container>
            </TabPanel>
          </Paper>
        </Container>
      </Box>

      {/* Modals */}
      {convention && (
        <>
          <AddPartenaireDialog
            open={addPartenaireDialogOpen}
            conventionId={convention.id}
            onClose={() => {
              setAddPartenaireDialogOpen(false)
              setEditPartenaireData(null)
            }}
            onSuccess={() => {
              // Refresh partenaires list
              setPartenairesRefreshKey((k) => k + 1)
              setEditPartenaireData(null)
            }}
            editData={editPartenaireData}
          />

          <LinkProjetDialog
            open={linkProjetDialogOpen}
            conventionId={convention.id}
            onClose={() => setLinkProjetDialogOpen(false)}
            onSuccess={() => {
              // Reload projets
              loadProjets(convention.id)
            }}
          />

          <LinkMarcheDialog
            open={linkMarcheDialogOpen}
            conventionId={convention.id}
            onClose={() => setLinkMarcheDialogOpen(false)}
            onSuccess={() => {
              // Reload marchés
              loadMarches(convention.id)
            }}
          />
        </>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: colors.danger[700] }}>
          Rejeter la convention
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
            Veuillez indiquer le motif du rejet. La convention sera remise en brouillon pour correction.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motif du rejet"
            value={rejectMotif}
            onChange={(e) => setRejectMotif(e.target.value)}
            placeholder="Décrivez les raisons du rejet..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false)
              setRejectMotif('')
            }}
            disabled={workflowLoading}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejeter}
            disabled={workflowLoading || !rejectMotif.trim()}
            startIcon={workflowLoading ? <CircularProgress size={16} /> : <Cancel />}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: colors.danger[700] }}>
          Annuler la convention
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible. La convention sera définitivement annulée.
          </Alert>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motif de l'annulation"
            value={cancelMotif}
            onChange={(e) => setCancelMotif(e.target.value)}
            placeholder="Décrivez les raisons de l'annulation..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setCancelDialogOpen(false)
              setCancelMotif('')
            }}
            disabled={workflowLoading}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleAnnuler}
            disabled={workflowLoading || !cancelMotif.trim()}
            startIcon={workflowLoading ? <CircularProgress size={16} /> : <Stop />}
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}

export default ConventionDetailPageModern
