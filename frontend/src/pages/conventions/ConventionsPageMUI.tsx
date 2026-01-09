import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material'
import {
  Add,
  MoreVert,
  CheckCircle,
  Cancel,
  Pending,
  Lock,
  Edit,
  Delete,
  Send,
  Visibility,
  PlayArrow,
  Undo,
  Search,
  Person,
  CalendarToday,
  Warning,
} from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import AppLayout from '../../components/layout/AppLayout'

type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'REJETE' | 'EN_EXECUTION' | 'ACHEVE' | 'ANNULE'

interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: StatutConvention
  version?: string
  budget: number
  tauxCommission: number
  dateConvention: string
  dateDebut: string
  dateFin?: string
  isLocked: boolean
  createdAt?: string
  updatedAt?: string
  createdByNom?: string
  motifRejet?: string
  valideParNom?: string
}

const ConventionsPageMUI = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatutConvention | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

  useEffect(() => {
    fetchConventions()
  }, [])

  const fetchConventions = async () => {
    try {
      const response = await conventionsAPI.getAll()
      console.log('🔍 Response complète:', response)
      console.log('🔍 Response.data:', response.data)
      console.log('🔍 Type de response.data:', Array.isArray(response.data) ? 'Array' : typeof response.data)

      // Gérer le format de réponse API - peut être un tableau ou un objet avec data
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      console.log('🔍 Data finale:', data)
      console.log('🔍 Nombre de conventions:', data.length)

      // Trier par date de modification/création (les plus récentes en premier)
      const sortedData = [...data].sort((a: Convention, b: Convention) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.dateConvention).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || b.dateConvention).getTime()
        return dateB - dateA // Ordre décroissant (plus récent en premier)
      })

      setConventions(sortedData)
    } catch (error) {
      console.error('Erreur chargement conventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, convention: Convention) => {
    setAnchorEl(event.currentTarget)
    setSelectedConvention(convention)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSoumettre = async () => {
    if (!selectedConvention) return
    try {
      await conventionsAPI.soumettre(selectedConvention.id)
      fetchConventions()
      handleMenuClose()
    } catch (error) {
      console.error('Erreur soumission:', error)
    }
  }

  const handleValider = async () => {
    if (!selectedConvention || !user?.id) return
    try {
      await conventionsAPI.valider(selectedConvention.id, user.id)
      fetchConventions()
      handleMenuClose()
    } catch (error) {
      console.error('Erreur validation:', error)
    }
  }

  const handleRejeter = async () => {
    if (!selectedConvention) return
    try {
      await conventionsAPI.rejeter(selectedConvention.id, motifRejet)
      fetchConventions()
      setRejectDialogOpen(false)
      setMotifRejet('')
      handleMenuClose()
    } catch (error) {
      console.error('Erreur rejet:', error)
    }
  }

  const handleMettreEnCours = async () => {
    if (!selectedConvention) return
    try {
      await conventionsAPI.mettreEnCours(selectedConvention.id)
      fetchConventions()
      handleMenuClose()
    } catch (error: any) {
      console.error('Erreur mise en cours:', error)
      const message = error.response?.data?.message || 'La date de début n\'est pas encore atteinte'
      alert(message)
    }
  }

  const handleRemettreEnBrouillon = async () => {
    if (!selectedConvention) return
    try {
      await conventionsAPI.remettreEnBrouillon(selectedConvention.id)
      fetchConventions()
      handleMenuClose()
    } catch (error: any) {
      console.error('Erreur remise en brouillon:', error)
      alert(error.response?.data?.message || 'Erreur lors de la remise en brouillon')
    }
  }

  const handleDelete = async () => {
    if (!selectedConvention) return
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette convention ?')) return
    try {
      await conventionsAPI.delete(selectedConvention.id)
      fetchConventions()
      handleMenuClose()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const getStatutBadge = (statut: StatutConvention) => {
    const config: Record<StatutConvention, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: JSX.Element }> = {
      BROUILLON: { color: 'default', icon: <Edit fontSize="small" /> },
      SOUMIS: { color: 'warning', icon: <Send fontSize="small" /> },
      VALIDEE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      REJETE: { color: 'error', icon: <Cancel fontSize="small" /> },
      EN_EXECUTION: { color: 'info', icon: <Pending fontSize="small" /> },
      ACHEVE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      ANNULE: { color: 'error', icon: <Cancel fontSize="small" /> },
    }
    const { color, icon } = config[statut]
    return <Chip icon={icon} label={statut.replace('_', ' ')} color={color} size="small" />
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} M MAD`
    }
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredConventions = conventions
    .filter(c => filter === 'ALL' || c.statut === filter)
    .filter(c => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        c.libelle?.toLowerCase().includes(query) ||
        c.code?.toLowerCase().includes(query) ||
        c.numero?.toLowerCase().includes(query) ||
        c.createdByNom?.toLowerCase().includes(query)
      )
    })

  const stats = {
    total: conventions.length,
    brouillon: conventions.filter(c => c.statut === 'BROUILLON').length,
    soumis: conventions.filter(c => c.statut === 'SOUMIS').length,
    validees: conventions.filter(c => c.statut === 'VALIDEE').length,
    rejetees: conventions.filter(c => c.statut === 'REJETE').length,
    enExecution: conventions.filter(c => c.statut === 'EN_EXECUTION').length,
    annulees: conventions.filter(c => c.statut === 'ANNULE').length,
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Conventions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion complète des conventions avec workflow de validation
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/conventions/nouvelle')}
            sx={{ px: 3 }}
          >
            Nouvelle Convention
          </Button>
        </Stack>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(7, 1fr)' },
            gap: 2,
            mb: 4,
          }}
        >
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('ALL')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('BROUILLON')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Brouillon</Typography>
              <Typography variant="h4" fontWeight={700} color="text.secondary">{stats.brouillon}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('SOUMIS')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Soumis</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.soumis}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('VALIDEE')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Validées</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.validees}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('REJETE')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Rejetées</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.rejetees}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('EN_EXECUTION')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>En Exécution</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.enExecution}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }} onClick={() => setFilter('ANNULE')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Annulées</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.annulees}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filter */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher par nom, code, numéro ou créateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label="Toutes"
              onClick={() => setFilter('ALL')}
              color={filter === 'ALL' ? 'primary' : 'default'}
            />
            <Chip
              label="Brouillon"
              onClick={() => setFilter('BROUILLON')}
              color={filter === 'BROUILLON' ? 'primary' : 'default'}
            />
            <Chip
              label="Soumis"
              onClick={() => setFilter('SOUMIS')}
              color={filter === 'SOUMIS' ? 'primary' : 'default'}
            />
            <Chip
              label="Validées"
              onClick={() => setFilter('VALIDEE')}
              color={filter === 'VALIDEE' ? 'primary' : 'default'}
            />
            <Chip
              label="Rejetées"
              onClick={() => setFilter('REJETE')}
              color={filter === 'REJETE' ? 'primary' : 'default'}
            />
            <Chip
              label="En Exécution"
              onClick={() => setFilter('EN_EXECUTION')}
              color={filter === 'EN_EXECUTION' ? 'primary' : 'default'}
            />
          </Stack>
        </Box>

        {/* Conventions List */}
        <Stack spacing={2}>
          {filteredConventions.map((convention) => (
            <Card
              key={convention.id}
              sx={{
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 4 },
                border: convention.statut === 'REJETE' ? '2px solid' : 'none',
                borderColor: convention.statut === 'REJETE' ? 'error.main' : 'transparent',
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Box flex={1}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {convention.libelle}
                      </Typography>
                      {getStatutBadge(convention.statut)}
                      {convention.version && (
                        <Chip label={convention.version} size="small" variant="outlined" />
                      )}
                      {convention.isLocked && (
                        <Lock fontSize="small" color="disabled" />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {convention.numero} • Code: {convention.code}
                    </Typography>

                    {/* Motif de rejet */}
                    {convention.statut === 'REJETE' && convention.motifRejet && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: 'error.light',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'start',
                          gap: 1
                        }}
                      >
                        <Warning fontSize="small" sx={{ color: 'error.dark', mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" fontWeight={600} color="error.dark">
                            Motif du rejet:
                          </Typography>
                          <Typography variant="body2" color="error.dark">
                            {convention.motifRejet}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Stack direction="row" spacing={3} mt={2} flexWrap="wrap">
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          Budget
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatCurrency(convention.budget)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Commission</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {convention.tauxCommission}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Début</Typography>
                        <Typography variant="body1">
                          {new Date(convention.dateDebut).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                      {convention.dateFin && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Fin</Typography>
                          <Typography variant="body1">
                            {new Date(convention.dateFin).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Informations de création */}
                    <Stack direction="row" spacing={3} mt={2} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      {convention.createdByNom && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Créé par: <strong>{convention.createdByNom}</strong>
                          </Typography>
                        </Box>
                      )}
                      {convention.createdAt && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Le {new Date(convention.createdAt).toLocaleDateString('fr-FR')} à{' '}
                            {new Date(convention.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                  <IconButton onClick={(e) => handleMenuOpen(e, convention)}>
                    <MoreVert />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { navigate(`/conventions/${selectedConvention?.id}`); handleMenuClose(); }}>
            <Visibility fontSize="small" sx={{ mr: 1 }} /> Voir Détails
          </MenuItem>
          {selectedConvention?.statut === 'BROUILLON' && (
            <MenuItem onClick={handleSoumettre}>
              <Send fontSize="small" sx={{ mr: 1 }} /> Soumettre
            </MenuItem>
          )}
          {selectedConvention?.statut === 'SOUMIS' && (
            <>
              <MenuItem onClick={handleValider}>
                <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Valider
              </MenuItem>
              <MenuItem onClick={() => { setRejectDialogOpen(true); handleMenuClose(); }}>
                <Cancel fontSize="small" sx={{ mr: 1 }} /> Rejeter
              </MenuItem>
            </>
          )}
          {selectedConvention?.statut === 'REJETE' && (
            <MenuItem onClick={handleRemettreEnBrouillon}>
              <Undo fontSize="small" sx={{ mr: 1 }} /> Remettre en Brouillon
            </MenuItem>
          )}
          {selectedConvention?.statut === 'VALIDEE' && (
            <MenuItem onClick={handleMettreEnCours}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Mettre en Exécution
            </MenuItem>
          )}
          {selectedConvention?.statut === 'BROUILLON' && !selectedConvention?.isLocked && (
            <>
              <MenuItem onClick={() => navigate(`/conventions/${selectedConvention.id}/edit`)}>
                <Edit fontSize="small" sx={{ mr: 1 }} /> Modifier
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <Delete fontSize="small" sx={{ mr: 1 }} /> Supprimer
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Rejeter la Convention</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Motif du rejet"
              fullWidth
              multiline
              rows={4}
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleRejeter} variant="contained" color="error">
              Rejeter
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
    </AppLayout>
  )
}

export default ConventionsPageMUI
