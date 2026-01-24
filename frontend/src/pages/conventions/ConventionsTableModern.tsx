import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
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
  Tooltip,
  InputAdornment,
  Alert,
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
  TrendingUp,
  CheckCircleOutline,
  HourglassEmpty,
} from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import StatsCard from '../../components/common/StatsCard'

type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'REJETE' | 'EN_EXECUTION' | 'ACHEVE' | 'ANNULE'
type OrderDirection = 'asc' | 'desc'
type OrderByColumn = keyof Convention

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

const ConventionsTableModern = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatutConvention | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderBy, setOrderBy] = useState<OrderByColumn>('updatedAt')
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('desc')

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

  useEffect(() => {
    fetchConventions()
  }, [])

  const fetchConventions = async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      setConventions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des conventions:', error)
      showToast('Erreur lors du chargement des conventions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, convention: Convention) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedConvention(convention)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleActionClick = (action: string) => {
    if (!selectedConvention) return

    switch (action) {
      case 'view':
        navigate(`/conventions/${selectedConvention.id}`)
        break
      case 'edit':
        navigate(`/conventions/${selectedConvention.id}/edit`)
        break
      case 'submit':
        handleSubmit(selectedConvention.id)
        break
      case 'validate':
        handleValidate(selectedConvention.id)
        break
      case 'reject':
        setRejectDialogOpen(true)
        break
      case 'start':
        handleStart(selectedConvention.id)
        break
      case 'delete':
        handleDelete(selectedConvention.id)
        break
      default:
        break
    }
    handleMenuClose()
  }

  const handleSubmit = async (id: number) => {
    try {
      await conventionsAPI.soumettre(id)
      showToast('Convention soumise avec succès', 'success')
      fetchConventions()
    } catch (error) {
      showToast('Erreur lors de la soumission', 'error')
    }
  }

  const handleValidate = async (id: number) => {
    if (!user?.id) {
      showToast('Utilisateur non identifié', 'error')
      return
    }
    try {
      await conventionsAPI.valider(id, user.id)
      showToast('Convention validée avec succès', 'success')
      fetchConventions()
    } catch (error) {
      showToast('Erreur lors de la validation', 'error')
    }
  }

  const handleReject = async () => {
    if (!selectedConvention || !motifRejet.trim()) {
      showToast('Veuillez saisir un motif de rejet', 'warning')
      return
    }

    try {
      await conventionsAPI.rejeter(selectedConvention.id, motifRejet)
      showToast('Convention rejetée', 'success')
      setRejectDialogOpen(false)
      setMotifRejet('')
      fetchConventions()
    } catch (error) {
      showToast('Erreur lors du rejet', 'error')
    }
  }

  const handleStart = async (id: number) => {
    try {
      await conventionsAPI.mettreEnCours(id)
      showToast('Convention démarrée avec succès', 'success')
      fetchConventions()
    } catch (error) {
      showToast('Erreur lors du démarrage', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette convention ?')) return

    try {
      await conventionsAPI.delete(id)
      showToast('Convention supprimée', 'success')
      fetchConventions()
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error')
    }
  }

  const handleSort = (column: OrderByColumn) => {
    const isAsc = orderBy === column && orderDirection === 'asc'
    setOrderDirection(isAsc ? 'desc' : 'asc')
    setOrderBy(column)
  }

  const getStatutBadge = (statut: StatutConvention) => {
    const config: Record<StatutConvention, { color: 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary'; icon: JSX.Element; label: string }> = {
      BROUILLON: { color: 'default', icon: <Edit fontSize="small" />, label: 'Brouillon' },
      SOUMIS: { color: 'warning', icon: <Send fontSize="small" />, label: 'Soumis' },
      VALIDEE: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Validée' },
      REJETE: { color: 'error', icon: <Cancel fontSize="small" />, label: 'Rejeté' },
      EN_EXECUTION: { color: 'primary', icon: <PlayArrow fontSize="small" />, label: 'En exécution' },
      ACHEVE: { color: 'info', icon: <CheckCircleOutline fontSize="small" />, label: 'Achevé' },
      ANNULE: { color: 'error', icon: <Cancel fontSize="small" />, label: 'Annulé' },
    }
    const { color, icon, label } = config[statut]
    return <Chip icon={icon} label={label} color={color} size="small" sx={{ fontWeight: 600 }} />
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)} M MAD`
    }
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Sorting logic
  const sortedConventions = [...conventions].sort((a, b) => {
    const aValue = a[orderBy]
    const bValue = b[orderBy]

    if (aValue === undefined || aValue === null) return 1
    if (bValue === undefined || bValue === null) return -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return orderDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return orderDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  // Filter logic
  const filteredConventions = sortedConventions
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

  // Stats
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
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', py: 4, bgcolor: '#f9fafb' }}>
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
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(7, 1fr)' },
              gap: 2,
              mb: 3,
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
              icon={<HourglassEmpty />}
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
              onClick={() => setFilter('VALIDEE')}
            />
            <StatsCard
              title="Rejetées"
              value={stats.rejetees}
              icon={<Cancel />}
              color="#ef4444"
              bgColor="#fee2e2"
              onClick={() => setFilter('REJETE')}
            />
            <StatsCard
              title="En Exécution"
              value={stats.enExecution}
              icon={<TrendingUp />}
              color="#8b5cf6"
              bgColor="#ede9fe"
              onClick={() => setFilter('EN_EXECUTION')}
            />
            <StatsCard
              title="Annulées"
              value={stats.annulees}
              icon={<Cancel />}
              color="#9ca3af"
              bgColor="#f3f4f6"
              onClick={() => setFilter('ANNULE')}
            />
          </Box>

          {/* Search & Filters */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Rechercher par libellé, code, numéro ou créateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`Tous (${stats.total})`}
                  onClick={() => setFilter('ALL')}
                  color={filter === 'ALL' ? 'primary' : 'default'}
                  variant={filter === 'ALL' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Brouillon (${stats.brouillon})`}
                  onClick={() => setFilter('BROUILLON')}
                  color={filter === 'BROUILLON' ? 'primary' : 'default'}
                  variant={filter === 'BROUILLON' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Soumis (${stats.soumis})`}
                  onClick={() => setFilter('SOUMIS')}
                  color={filter === 'SOUMIS' ? 'primary' : 'default'}
                  variant={filter === 'SOUMIS' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Validées (${stats.validees})`}
                  onClick={() => setFilter('VALIDEE')}
                  color={filter === 'VALIDEE' ? 'primary' : 'default'}
                  variant={filter === 'VALIDEE' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Rejetées (${stats.rejetees})`}
                  onClick={() => setFilter('REJETE')}
                  color={filter === 'REJETE' ? 'primary' : 'default'}
                  variant={filter === 'REJETE' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`En Exécution (${stats.enExecution})`}
                  onClick={() => setFilter('EN_EXECUTION')}
                  color={filter === 'EN_EXECUTION' ? 'primary' : 'default'}
                  variant={filter === 'EN_EXECUTION' ? 'filled' : 'outlined'}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                    <TableSortLabel
                      active={orderBy === 'code'}
                      direction={orderBy === 'code' ? orderDirection : 'asc'}
                      onClick={() => handleSort('code')}
                    >
                      Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 250 }}>
                    <TableSortLabel
                      active={orderBy === 'libelle'}
                      direction={orderBy === 'libelle' ? orderDirection : 'asc'}
                      onClick={() => handleSort('libelle')}
                    >
                      Libellé
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 140 }}>
                    <TableSortLabel
                      active={orderBy === 'statut'}
                      direction={orderBy === 'statut' ? orderDirection : 'asc'}
                      onClick={() => handleSort('statut')}
                    >
                      Statut
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#374151', minWidth: 130 }}>
                    <TableSortLabel
                      active={orderBy === 'budget'}
                      direction={orderBy === 'budget' ? orderDirection : 'asc'}
                      onClick={() => handleSort('budget')}
                    >
                      Budget
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>
                    <TableSortLabel
                      active={orderBy === 'tauxCommission'}
                      direction={orderBy === 'tauxCommission' ? orderDirection : 'asc'}
                      onClick={() => handleSort('tauxCommission')}
                    >
                      Commission
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 110 }}>
                    <TableSortLabel
                      active={orderBy === 'dateDebut'}
                      direction={orderBy === 'dateDebut' ? orderDirection : 'asc'}
                      onClick={() => handleSort('dateDebut')}
                    >
                      Date Début
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 110 }}>
                    <TableSortLabel
                      active={orderBy === 'dateFin'}
                      direction={orderBy === 'dateFin' ? orderDirection : 'asc'}
                      onClick={() => handleSort('dateFin')}
                    >
                      Date Fin
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 130 }}>
                    <TableSortLabel
                      active={orderBy === 'createdByNom'}
                      direction={orderBy === 'createdByNom' ? orderDirection : 'asc'}
                      onClick={() => handleSort('createdByNom')}
                    >
                      Créé par
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 150 }}>
                    <TableSortLabel
                      active={orderBy === 'createdAt'}
                      direction={orderBy === 'createdAt' ? orderDirection : 'asc'}
                      onClick={() => handleSort('createdAt')}
                    >
                      Créé le
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConventions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Aucune convention trouvée
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConventions.map((convention, index) => (
                    <TableRow
                      key={convention.id}
                      onClick={() => navigate(`/conventions/${convention.id}`)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {convention.code}
                          </Typography>
                          {convention.isLocked && (
                            <Tooltip title="Verrouillée">
                              <Lock fontSize="small" sx={{ color: '#9ca3af' }} />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {convention.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {convention.numero}
                          </Typography>
                          {convention.statut === 'REJETE' && convention.motifRejet && (
                            <Alert severity="error" sx={{ mt: 0.5, py: 0 }}>
                              <Typography variant="caption">
                                <strong>Rejet:</strong> {convention.motifRejet}
                              </Typography>
                            </Alert>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(convention.statut)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(convention.budget)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${convention.tauxCommission}%`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(convention.dateDebut)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={convention.dateFin ? 'text.primary' : 'text.secondary'}>
                          {formatDate(convention.dateFin)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Person fontSize="small" sx={{ color: '#9ca3af' }} />
                          <Typography variant="body2">
                            {convention.createdByNom || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarToday fontSize="small" sx={{ color: '#9ca3af' }} />
                          <Typography variant="body2">
                            {formatDateTime(convention.createdAt)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, convention)}
                          sx={{
                            '&:hover': {
                              bgcolor: '#e5e7eb',
                            },
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredConventions.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredConventions.length} convention{filteredConventions.length > 1 ? 's' : ''} affichée{filteredConventions.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleActionClick('view')}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          Voir détails
        </MenuItem>

        {selectedConvention?.statut === 'BROUILLON' && (
          <>
            <MenuItem onClick={() => handleActionClick('edit')}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Éditer
            </MenuItem>
            <MenuItem onClick={() => handleActionClick('submit')}>
              <Send fontSize="small" sx={{ mr: 1 }} />
              Soumettre
            </MenuItem>
          </>
        )}

        {selectedConvention?.statut === 'SOUMIS' && user?.roles?.includes('ADMIN') && (
          <>
            <MenuItem onClick={() => handleActionClick('validate')}>
              <CheckCircle fontSize="small" sx={{ mr: 1 }} />
              Valider
            </MenuItem>
            <MenuItem onClick={() => handleActionClick('reject')}>
              <Cancel fontSize="small" sx={{ mr: 1 }} />
              Rejeter
            </MenuItem>
          </>
        )}

        {selectedConvention?.statut === 'VALIDEE' && (
          <MenuItem onClick={() => handleActionClick('start')}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} />
            Démarrer
          </MenuItem>
        )}

        {selectedConvention?.statut === 'BROUILLON' && (
          <MenuItem onClick={() => handleActionClick('delete')} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Supprimer
          </MenuItem>
        )}
      </Menu>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeter la convention</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motif du rejet"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            placeholder="Expliquez pourquoi cette convention est rejetée..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={!motifRejet.trim()}>
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}

export default ConventionsTableModern
