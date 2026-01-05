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
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Lock,
  CheckCircle,
  Pending,
  Cancel,
  AccountBalance,
  CalendarToday,
  TrendingUp,
  Description,
  People,
  AttachMoney,
} from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'

type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'

interface ConventionPartenaire {
  id: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle?: string
  budgetAlloue: number
  pourcentage: number
  commissionIntervention?: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
}

interface ImputationPrevisionnelle {
  id: number
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue?: string
  remarques?: string
}

interface VersementPrevisionnel {
  id: number
  volet?: string
  dateVersement: string
  montant: number
  partenaireNom?: string
  maitreOeuvreDelegueNom?: string
  remarques?: string
}

interface SousConvention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
  dateDebut: string
  dateFin?: string
}

interface Convention {
  id: number
  code: string
  numero: string
  dateConvention: string
  typeConvention: string
  statut: StatutConvention
  libelle: string
  objet?: string
  tauxCommission: number
  budget: number
  baseCalcul: string
  tauxTva: number
  dateDebut: string
  dateFin?: string
  description?: string
  dateSoumission?: string
  dateValidation?: string
  valideParId?: number
  version?: string
  isLocked: boolean
  motifVerrouillage?: string
  parentConventionId?: number
  parentConventionNumero?: string
  heriteParametres: boolean
  surchargeTauxCommission?: number
  surchargeBaseCalcul?: string
  partenaires: ConventionPartenaire[]
  sousConventions: SousConvention[]
  imputationsPrevisionnelles: ImputationPrevisionnelle[]
  versementsPrevisionnels: VersementPrevisionnel[]
}

const ConventionDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [convention, setConvention] = useState<Convention | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (id) {
      fetchConvention(parseInt(id))
    }
  }, [id])

  const fetchConvention = async (conventionId: number) => {
    try {
      const response = await conventionsAPI.getById(conventionId)
      const data = response.data?.data || response.data
      setConvention(data)
    } catch (error) {
      console.error('Erreur chargement convention:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadge = (statut: StatutConvention) => {
    const config: Record<StatutConvention, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: JSX.Element }> = {
      BROUILLON: { color: 'default', icon: <Edit fontSize="small" /> },
      SOUMIS: { color: 'warning', icon: <Pending fontSize="small" /> },
      VALIDEE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      EN_COURS: { color: 'info', icon: <Pending fontSize="small" /> },
      ACHEVE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      EN_RETARD: { color: 'error', icon: <Cancel fontSize="small" /> },
      ANNULE: { color: 'error', icon: <Cancel fontSize="small" /> },
    }
    const { color, icon } = config[statut]
    return <Chip icon={icon} label={statut} color={color} size="medium" />
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

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>
      </AppLayout>
    )
  }

  if (!convention) {
    return (
      <AppLayout>
        <Container maxWidth="xl">
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5">Convention non trouvée</Typography>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/conventions')}
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
            <IconButton onClick={() => navigate('/conventions')}>
              <ArrowBack />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={600}>
                {convention.libelle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {convention.numero} • Code: {convention.code}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {getStatutBadge(convention.statut)}
              {convention.version && (
                <Chip label={convention.version} variant="outlined" />
              )}
              {convention.isLocked && (
                <Chip icon={<Lock fontSize="small" />} label="Verrouillée" size="small" />
              )}
              {convention.statut === 'BROUILLON' && !convention.isLocked && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/conventions/${convention.id}/edit`)}
                >
                  Modifier
                </Button>
              )}
            </Stack>
          </Stack>

          {/* KPI Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
                    <AccountBalance />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Budget Total</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {formatCurrency(convention.budget)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                    <TrendingUp />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Taux Commission</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {convention.tauxCommission}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.light', color: 'info.dark' }}>
                    <People />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Partenaires</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {convention.partenaires.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark' }}>
                    <Description />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Sous-Conventions</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {convention.sousConventions.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs */}
          <Card>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Informations Générales" />
              <Tab label={`Partenaires (${convention.partenaires.length})`} />
              <Tab label={`Sous-Conventions (${convention.sousConventions.length})`} />
              <Tab label="Imputations & Versements" />
            </Tabs>

            <CardContent sx={{ p: 3 }}>
              {/* Tab 0: Informations Générales */}
              {activeTab === 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Informations Principales
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Type de Convention</Typography>
                          <Typography variant="body1" fontWeight={500}>{convention.typeConvention}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date de Convention</Typography>
                          <Typography variant="body1">{formatDate(convention.dateConvention)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date de Début</Typography>
                          <Typography variant="body1">{formatDate(convention.dateDebut)}</Typography>
                        </Box>
                        {convention.dateFin && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Date de Fin</Typography>
                            <Typography variant="body1">{formatDate(convention.dateFin)}</Typography>
                          </Box>
                        )}
                        {convention.objet && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Objet</Typography>
                            <Typography variant="body1">{convention.objet}</Typography>
                          </Box>
                        )}
                        {convention.description && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body1">{convention.description}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Paramètres Financiers
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Budget Global</Typography>
                          <Typography variant="h6" color="primary.main" fontWeight={600}>
                            {formatCurrency(convention.budget)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Base de Calcul</Typography>
                          <Typography variant="body1">{convention.baseCalcul}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Taux de Commission</Typography>
                          <Typography variant="body1" fontWeight={500}>{convention.tauxCommission}%</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Taux TVA</Typography>
                          <Typography variant="body1">{convention.tauxTva}%</Typography>
                        </Box>
                        {convention.surchargeTauxCommission && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Surcharge Taux Commission</Typography>
                            <Typography variant="body1">{convention.surchargeTauxCommission}%</Typography>
                          </Box>
                        )}
                      </Stack>
                    </Paper>

                    {convention.parentConventionNumero && (
                      <Paper sx={{ p: 3, mt: 2 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Convention Parente
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1">
                          {convention.parentConventionNumero}
                        </Typography>
                        <Chip
                          label={convention.heriteParametres ? "Hérite des paramètres" : "Paramètres propres"}
                          size="small"
                          color={convention.heriteParametres ? "info" : "default"}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    )}
                  </Box>

                  {convention.dateValidation && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <CheckCircle color="success" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Validée le</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDate(convention.dateValidation)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tab 1: Partenaires */}
              {activeTab === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell>Sigle</TableCell>
                        <TableCell align="right">Budget Alloué</TableCell>
                        <TableCell align="right">Pourcentage</TableCell>
                        <TableCell align="right">Commission</TableCell>
                        <TableCell>Rôle</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {convention.partenaires.map((partenaire) => (
                        <TableRow key={partenaire.id}>
                          <TableCell>{partenaire.partenaireCode}</TableCell>
                          <TableCell>{partenaire.partenaireNom}</TableCell>
                          <TableCell>{partenaire.partenaireSigle || '-'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(partenaire.budgetAlloue)}
                          </TableCell>
                          <TableCell align="right">{partenaire.pourcentage}%</TableCell>
                          <TableCell align="right">
                            {partenaire.commissionIntervention ? `${partenaire.commissionIntervention}%` : '-'}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              {partenaire.estMaitreOeuvre && (
                                <Chip label="MOA" size="small" color="primary" />
                              )}
                              {partenaire.estMaitreOeuvreDelegue && (
                                <Chip label="MOD" size="small" color="secondary" />
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab 2: Sous-Conventions */}
              {activeTab === 2 && (
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
                      {convention.sousConventions.map((sc) => (
                        <TableRow key={sc.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/conventions/${sc.id}`)}>
                          <TableCell>{sc.code}</TableCell>
                          <TableCell>{sc.numero}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{sc.libelle}</TableCell>
                          <TableCell>
                            <Chip label={sc.statut} size="small" color="info" />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(sc.budget)}</TableCell>
                          <TableCell>{formatDate(sc.dateDebut)}</TableCell>
                          <TableCell>{sc.dateFin ? formatDate(sc.dateFin) : '-'}</TableCell>
                        </TableRow>
                      ))}
                      {convention.sousConventions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary">
                              Aucune sous-convention
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab 3: Imputations & Versements */}
              {activeTab === 3 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Imputations Prévisionnelles
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Volet</TableCell>
                            <TableCell>Date Démarrage</TableCell>
                            <TableCell>Délai (mois)</TableCell>
                            <TableCell>Date Fin Prévue</TableCell>
                            <TableCell>Remarques</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {convention.imputationsPrevisionnelles.map((imp) => (
                            <TableRow key={imp.id}>
                              <TableCell>{imp.volet || '-'}</TableCell>
                              <TableCell>{formatDate(imp.dateDemarrage)}</TableCell>
                              <TableCell>{imp.delaiMois}</TableCell>
                              <TableCell>{imp.dateFinPrevue ? formatDate(imp.dateFinPrevue) : '-'}</TableCell>
                              <TableCell>{imp.remarques || '-'}</TableCell>
                            </TableRow>
                          ))}
                          {convention.imputationsPrevisionnelles.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  Aucune imputation prévisionnelle
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Versements Prévisionnels
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Volet</TableCell>
                            <TableCell>Date Versement</TableCell>
                            <TableCell align="right">Montant</TableCell>
                            <TableCell>Partenaire</TableCell>
                            <TableCell>MOD</TableCell>
                            <TableCell>Remarques</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {convention.versementsPrevisionnels.map((vers) => (
                            <TableRow key={vers.id}>
                              <TableCell>{vers.volet || '-'}</TableCell>
                              <TableCell>{formatDate(vers.dateVersement)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {formatCurrency(vers.montant)}
                              </TableCell>
                              <TableCell>{vers.partenaireNom || '-'}</TableCell>
                              <TableCell>{vers.maitreOeuvreDelegueNom || '-'}</TableCell>
                              <TableCell>{vers.remarques || '-'}</TableCell>
                            </TableRow>
                          ))}
                          {convention.versementsPrevisionnels.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  Aucun versement prévisionnel
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionDetailPage
