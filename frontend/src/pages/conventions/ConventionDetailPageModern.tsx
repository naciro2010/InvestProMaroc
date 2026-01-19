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
  CircularProgress,
  Alert,
  IconButton,
  Skeleton,
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
  Delete,
  Visibility,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { api, conventionsAPI, avenantConventionsAPI } from '../../lib/api'

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
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [avenants, setAvenants] = useState<Avenant[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [error, setError] = useState<string | null>(null)

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

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title={`Convention ${convention.code}`}
            subtitle={convention.libelle}
            actions={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                >
                  Ajout Avenant
                </Button>
                {convention.typeConvention === 'CADRE' && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate(`/conventions/${id}/sous-conventions/nouveau`)}
                  >
                    Ajout Conv. Spécifique
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/conventions/${id}/edit`)}
                >
                  Modifier
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/conventions')}
                >
                  Retour
                </Button>
              </Box>
            }
          />

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
                    Libellé de la convention
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {convention.libelle}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Objet de la convention
                  </Typography>
                  <Box
                    sx={{
                      '& p': { margin: '0.5em 0' },
                      '& ul, & ol': { marginLeft: '1.5em' },
                      '& strong': { fontWeight: 600 },
                      '& em': { fontStyle: 'italic' },
                    }}
                    dangerouslySetInnerHTML={{ __html: convention.objet || '' }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Taux de la commission d'intervention
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {convention.tauxCommission}% {convention.baseCalcul === 'MONTANT_TTC' ? 'TTC' : 'HT'} sur les décaissements
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Chip label={convention.typeConvention} size="small" color="info" />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip label={convention.statut} size="small" color={getStatusColor(convention.statut)} />
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Right Card - Avenants/Versions Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Avenants & Versions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Num</TableCell>
                      <TableCell>Date signature</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell align="center">PJ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Initial Convention */}
                    <TableRow>
                      <TableCell>
                        <Chip label="I" size="small" color="secondary" sx={{ mr: 1 }} />
                        {convention.numero}
                      </TableCell>
                      <TableCell>{formatDate(convention.dateSignature)}</TableCell>
                      <TableCell>{formatCurrency(convention.montant)}</TableCell>
                      <TableCell align="center">
                        <Description fontSize="small" color="action" />
                      </TableCell>
                    </TableRow>

                    {/* Avenants */}
                    {avenants.map((avenant) => (
                      <TableRow key={avenant.id}>
                        <TableCell>
                          <Chip label="A" size="small" color="warning" sx={{ mr: 1 }} />
                          {avenant.numeroAvenant}
                        </TableCell>
                        <TableCell>{formatDate(avenant.dateAvenant)}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell align="center">
                          <Description fontSize="small" color="action" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {avenants.length === 0 && (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun avenant pour le moment
                  </Typography>
                </Box>
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
              <Tab label="Projets liés" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="Marchés liés" icon={<Business />} iconPosition="start" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {/* Partenaires Card */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        <People fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Partenaires
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          // TODO: Ouvrir modal d'ajout de partenaire
                          alert('Fonctionnalité en développement : Ajouter un partenaire')
                        }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Partenaire</TableCell>
                            <TableCell align="right">Budget (M)</TableCell>
                            <TableCell align="right">%</TableCell>
                            <TableCell align="right">CI (M)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                Aucun partenaire défini
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>

                  {/* Maître d'œuvre Card */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        <Business fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Maître d'œuvre
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          // TODO: Ouvrir modal d'ajout de maître d'œuvre
                          alert('Fonctionnalité en développement : Ajouter un maître d\'œuvre')
                        }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Aucun maître d'œuvre défini
                    </Typography>
                  </Paper>

                  {/* Imputations prévisionnelles Card */}
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb', gridColumn: { xs: '1', md: 'span 2' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        <TrendingUp fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Imputations prévisionnelles
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          // TODO: Ouvrir modal d'ajout d'imputation
                          alert('Fonctionnalité en développement : Ajouter une imputation')
                        }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
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
                  <Paper sx={{ p: 3, bgcolor: '#f9fafb', gridColumn: { xs: '1', md: 'span 2' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        <AccountBalance fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Versements prévisionnels
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={() => {
                          // TODO: Ouvrir modal d'ajout de versement
                          alert('Fonctionnalité en développement : Ajouter un versement')
                        }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
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
                              <Chip label={sc.statut} size="small" color={getStatusColor(sc.statut)} />
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

            {/* Projets Tab */}
            <TabPanel value={activeTab} index={convention.typeConvention === 'CADRE' ? 2 : 1}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      // TODO: Ouvrir modal pour lier un projet existant ou en créer un nouveau
                      alert('Fonctionnalité en développement : Lier/Créer un projet')
                    }}
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
                            <Chip label={projet.statut} size="small" color={getStatusColor(projet.statut)} />
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
            <TabPanel value={activeTab} index={convention.typeConvention === 'CADRE' ? 3 : 2}>
              <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      // TODO: Ouvrir modal pour lier un marché existant ou en créer un nouveau
                      alert('Fonctionnalité en développement : Lier/Créer un marché')
                    }}
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
                      Aucun marché lié à cette convention
                    </Typography>
                  </Box>
                )}
              </Container>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionDetailPageModern
