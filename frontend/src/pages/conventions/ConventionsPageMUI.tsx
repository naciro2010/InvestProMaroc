import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
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
  Description,
} from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import StatsCard from '../../components/common/StatsCard'

type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDE'

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
    const config: Record<StatutConvention, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: JSX.Element; label: string }> = {
      BROUILLON: { color: 'default', icon: <Edit fontSize="small" />, label: 'Brouillon' },
      SOUMIS: { color: 'warning', icon: <Send fontSize="small" />, label: 'Soumis' },
      VALIDE: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Validé' },
    }
    const statusConfig = config[statut] || { color: 'default' as const, icon: <Edit fontSize="small" />, label: statut }
    return <Chip icon={statusConfig.icon} label={statusConfig.label} color={statusConfig.color} size="small" />
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
    validees: conventions.filter(c => c.statut === 'VALIDE').length,
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
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <PageHeader
            title="Conventions"
            subtitle="Gestion complète des conventions avec workflow de validation"
            actions={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/conventions/nouvelle')}
                sx={{ px: 3 }}
              >
                Nouvelle Convention
              </Button>
            }
          />

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <StatsCard
            title="Total"
            value={stats.total}
            icon={<Description />}
            color="#3b82f6"
            bgColor="#eff6ff"
            onClick={() => setFilter('ALL')}
          />
          <StatsCard
            title="Brouillon"
            value={stats.brouillon}
            icon={<Edit />}
            color="#6b7280"
            bgColor="#f3f4f6"
            onClick={() => setFilter('BROUILLON')}
          />
          <StatsCard
            title="Soumis"
            value={stats.soumis}
            icon={<Send />}
            color="#f59e0b"
            bgColor="#fef3c7"
            onClick={() => setFilter('SOUMIS')}
          />
          <StatsCard
            title="Validées"
            value={stats.validees}
            icon={<CheckCircle />}
            color="#10b981"
            bgColor="#d1fae5"
            onClick={() => setFilter('VALIDE')}
          />
        </Box>

        {/* Search and Filter */}
        <Paper sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb', boxShadow: 'none', borderRadius: '12px' }}>
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
              onClick={() => setFilter('VALIDE')}
              color={filter === 'VALIDE' ? 'primary' : 'default'}
            />
          </Stack>
        </Paper>

        {/* Conventions List */}
        <Stack spacing={2}>
          {filteredConventions.map((convention) => (
            <Paper
              key={convention.id}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#d1d5db',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => navigate(`/conventions/${convention.id}`)}
            >
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
                  <IconButton onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, convention); }}>
                    <MoreVert />
                  </IconButton>
                </Stack>
              </Paper>
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
