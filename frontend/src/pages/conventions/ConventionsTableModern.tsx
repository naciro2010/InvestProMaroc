import React, { useState, useEffect, useRef } from 'react'
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
  Lock,
  Edit,
  Delete,
  Send,
  Visibility,
  PlayArrow,
  Search,
  Person,
  CalendarToday,
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
import {
  SortableTableRow,
  useSortableTable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '../../components/core/SortableTable'

type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDE'
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

  const [rawConventions, setRawConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatutConvention | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderBy, setOrderBy] = useState<OrderByColumn>('updatedAt')
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('desc')

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

  // Ref for scrolling to table when clicking stats
  const tableRef = useRef<HTMLDivElement>(null)

  // Handle stat card click - filter and scroll to table
  const handleStatClick = (filterValue: StatutConvention | 'ALL') => {
    setFilter(filterValue)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Drag & drop avec persistance localStorage
  const {
    items: conventions,
    sensors,
    handleDragEnd,
  } = useSortableTable({
    initialItems: rawConventions,
    idKey: 'id',
    storageKey: 'conventions-order',
  })

  useEffect(() => {
    fetchConventions()
  }, [])

  const fetchConventions = async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      setRawConventions(data)
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
      VALIDE: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Validé' },
    }
    const statusConfig = config[statut] || { color: 'default' as const, icon: <Edit fontSize="small" />, label: statut }
    return <Chip icon={statusConfig.icon} label={statusConfig.label} color={statusConfig.color} size="small" sx={{ fontWeight: 600 }} />
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
    validees: conventions.filter(c => c.statut === 'VALIDE').length,
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
      <Box sx={{ minHeight: '100vh', py: { xs: 2, md: 4 }, bgcolor: '#f9fafb' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <PageHeader
            title="Conventions"
            subtitle="Gestion complète des conventions avec workflow de validation"
            actions={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/conventions/nouvelle')}
                sx={{ px: { xs: 2, md: 3 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Nouvelle Convention</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Nouveau</Box>
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
              onClick={() => handleStatClick('ALL')}
            />
            <StatsCard
              title="Brouillon"
              value={stats.brouillon}
              icon={<Edit />}
              color="#6b7280"
              bgColor="#f3f4f6"
              onClick={() => handleStatClick('BROUILLON')}
            />
            <StatsCard
              title="Soumis"
              value={stats.soumis}
              icon={<HourglassEmpty />}
              color="#f59e0b"
              bgColor="#fef3c7"
              onClick={() => handleStatClick('SOUMIS')}
            />
            <StatsCard
              title="Validées"
              value={stats.validees}
              icon={<CheckCircle />}
              color="#10b981"
              bgColor="#d1fae5"
              onClick={() => handleStatClick('VALIDE')}
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
                  onClick={() => setFilter('VALIDE')}
                  color={filter === 'VALIDE' ? 'primary' : 'default'}
                  variant={filter === 'VALIDE' ? 'filled' : 'outlined'}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Table avec Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
          <TableContainer
            ref={tableRef}
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflowX: 'auto' }}
          >
            <SortableContext
              items={filteredConventions.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
            <Table sx={{ minWidth: { xs: 600, md: 1200 } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ width: 40, p: 1, display: { xs: 'none', md: 'table-cell' } }} />
                  <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                    <TableSortLabel
                      active={orderBy === 'code'}
                      direction={orderBy === 'code' ? orderDirection : 'asc'}
                      onClick={() => handleSort('code')}
                    >
                      Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: { xs: 150, md: 250 } }}>
                    <TableSortLabel
                      active={orderBy === 'libelle'}
                      direction={orderBy === 'libelle' ? orderDirection : 'asc'}
                      onClick={() => handleSort('libelle')}
                    >
                      Libellé
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', minWidth: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'statut'}
                      direction={orderBy === 'statut' ? orderDirection : 'asc'}
                      onClick={() => handleSort('statut')}
                    >
                      Statut
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#374151', minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>
                    <TableSortLabel
                      active={orderBy === 'budget'}
                      direction={orderBy === 'budget' ? orderDirection : 'asc'}
                      onClick={() => handleSort('budget')}
                    >
                      Budget
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#374151', display: { xs: 'none', lg: 'table-cell' } }}>
                    <TableSortLabel
                      active={orderBy === 'tauxCommission'}
                      direction={orderBy === 'tauxCommission' ? orderDirection : 'asc'}
                      onClick={() => handleSort('tauxCommission')}
                    >
                      Commission
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', display: { xs: 'none', lg: 'table-cell' } }}>
                    <TableSortLabel
                      active={orderBy === 'dateDebut'}
                      direction={orderBy === 'dateDebut' ? orderDirection : 'asc'}
                      onClick={() => handleSort('dateDebut')}
                    >
                      Début
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', display: { xs: 'none', xl: 'table-cell' } }}>
                    <TableSortLabel
                      active={orderBy === 'dateFin'}
                      direction={orderBy === 'dateFin' ? orderDirection : 'asc'}
                      onClick={() => handleSort('dateFin')}
                    >
                      Fin
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', display: { xs: 'none', xl: 'table-cell' } }}>
                    <TableSortLabel
                      active={orderBy === 'createdByNom'}
                      direction={orderBy === 'createdByNom' ? orderDirection : 'asc'}
                      onClick={() => handleSort('createdByNom')}
                    >
                      Créé par
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', display: { xs: 'none', lg: 'table-cell' } }}>
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
                    <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Aucune convention trouvée
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConventions.map((convention, index) => (
                    <SortableTableRow
                      key={convention.id}
                      id={convention.id}
                      hideDragHandle={{ xs: true, md: false }}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell
                        onClick={() => navigate(`/conventions/${convention.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
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
                          <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                            {convention.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {convention.numero}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(convention.statut)}
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(convention.budget)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        <Chip
                          label={`${convention.tauxCommission}%`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        <Typography variant="body2">
                          {formatDate(convention.dateDebut)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>
                        <Typography variant="body2" color={convention.dateFin ? 'text.primary' : 'text.secondary'}>
                          {formatDate(convention.dateFin)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Person fontSize="small" sx={{ color: '#9ca3af' }} />
                          <Typography variant="body2">
                            {convention.createdByNom || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
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
                    </SortableTableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </SortableContext>
          </TableContainer>
          </DndContext>

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
