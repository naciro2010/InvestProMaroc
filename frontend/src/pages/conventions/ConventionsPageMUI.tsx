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
} from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'

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
}

const ConventionsPageMUI = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatutConvention | 'ALL'>('ALL')
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
      // Gérer le format de réponse API - peut être un tableau ou un objet avec data
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      setConventions(data)
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
      EN_COURS: { color: 'info', icon: <Pending fontSize="small" /> },
      ACHEVE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      EN_RETARD: { color: 'error', icon: <Cancel fontSize="small" /> },
      ANNULE: { color: 'error', icon: <Cancel fontSize="small" /> },
    }
    const { color, icon } = config[statut]
    return <Chip icon={icon} label={statut} color={color} size="small" />
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

  const filteredConventions = filter === 'ALL'
    ? conventions
    : conventions.filter(c => c.statut === filter)

  const stats = {
    total: conventions.length,
    brouillon: conventions.filter(c => c.statut === 'BROUILLON').length,
    soumis: conventions.filter(c => c.statut === 'SOUMIS').length,
    validees: conventions.filter(c => c.statut === 'VALIDEE').length,
    enCours: conventions.filter(c => c.statut === 'EN_COURS').length,
  }

  if (loading) {
    return <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>
  }

  return (
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
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' },
            gap: 2,
            mb: 4,
          }}
        >
          <Card sx={{ cursor: 'pointer' }} onClick={() => setFilter('ALL')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setFilter('BROUILLON')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Brouillon</Typography>
              <Typography variant="h4" fontWeight={700} color="text.secondary">{stats.brouillon}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setFilter('SOUMIS')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Soumis</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.soumis}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setFilter('VALIDEE')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Validées</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.validees}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ cursor: 'pointer' }} onClick={() => setFilter('EN_COURS')}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">En Cours</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.enCours}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filter Chips */}
        <Stack direction="row" spacing={1} mb={3}>
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
        </Stack>

        {/* Conventions List */}
        <Stack spacing={2}>
          {filteredConventions.map((convention) => (
            <Card key={convention.id}>
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
                    <Stack direction="row" spacing={3} mt={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Budget</Typography>
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
  )
}

export default ConventionsPageMUI
