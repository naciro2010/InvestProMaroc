import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  InputAdornment,
} from '@mui/material'
import {
  Add,
  Search,
  ViewList,
  Map as MapIcon,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import MarchesMapView from '../../components/ui/MarchesMapView'
import StatusBadge from '../../components/core/StatusBadge'
import api from '../../lib/api'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'
import {
  SortableTableRow,
  useSortableTable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '../../components/core/SortableTable'

// Interface correspondant exactement au MarcheListDTO du backend
interface MarcheListItem {
  id: number
  numeroMarche: string
  numAo: string | null
  dateMarche: string
  fournisseurId: number
  fournisseurCode: string
  fournisseurNom: string
  fournisseurIce: string | null
  conventionId: number | null
  conventionNumero: string | null
  conventionLibelle: string | null
  objet: string
  montantHt: number
  tauxTva: number
  montantTva: number
  montantTtc: number
  statut: string
  dateDebut: string | null
  dateFinPrevue: string | null
  delaiExecutionMois: number | null
  adresse: string | null
  latitude: number | null
  longitude: number | null
  zoneGeographique: string | null
  nbLignes: number
  nbAvenants: number
  nbDecomptes: number
  actif: boolean
}

// Styles from design system
const styles = componentStyles.listPage

export default function MarchesPage() {
  const navigate = useNavigate()
  const [rawMarches, setRawMarches] = useState<MarcheListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Drag & drop avec persistance localStorage
  const {
    items: marches,
    sensors,
    handleDragEnd,
  } = useSortableTable({
    initialItems: rawMarches,
    idKey: 'id',
    storageKey: 'marches-order',
  })

  useEffect(() => {
    fetchMarches()
  }, [])

  const fetchMarches = async () => {
    try {
      setLoading(true)
      // Use optimized /list endpoint instead of full /marches endpoint
      // This follows micro-frontends pattern: each component loads only what it needs
      const response = await api.get('/marches/list')
      setRawMarches(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des marchés:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtre les marchés (calcul dérivé, pas de state)
  const filteredMarches = marches.filter(m => {
    // Filtre par recherche
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      if (!(
        m.numeroMarche.toLowerCase().includes(query) ||
        m.objet.toLowerCase().includes(query) ||
        m.fournisseurNom.toLowerCase().includes(query) ||
        (m.conventionLibelle?.toLowerCase() ?? '').includes(query)
      )) {
        return false
      }
    }

    // Filtre par statut
    if (selectedStatut !== 'ALL' && m.statut !== selectedStatut) {
      return false
    }

    return true
  })

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce marché ?')) return

    try {
      await api.delete(`/marches/${id}`)
      fetchMarches()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  // Pagination des marchés filtrés
  const paginatedMarches = useMemo(() => {
    const start = page * rowsPerPage
    return filteredMarches.slice(start, start + rowsPerPage)
  }, [filteredMarches, page, rowsPerPage])

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={styles.container}>
        {/* Header */}
        <Box sx={styles.header}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={styles.title}>Marchés</Typography>
              <Typography sx={styles.subtitle}>
                {marches.length} marche{marches.length > 1 ? 's' : ''} • {formatCurrency(marches.reduce((s, m) => s + m.montantTtc, 0))} TTC
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/marches/nouveau')}
              sx={componentStyles.buttonPrimary}
            >
              Nouveau Marché
            </Button>
          </Box>
        </Box>

        {/* Toolbar avec filtres */}
        <Box sx={styles.toolbar}>
          <TextField
            placeholder="Rechercher par numéro, objet, fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'EN_COURS', 'VALIDE', 'TERMINE', 'SUSPENDU', 'ANNULE'].map((statut) => {
              const count = statut === 'ALL' ? marches.length : marches.filter(m => m.statut === statut).length
              const isActive = selectedStatut === statut
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
                    </Box>
                  }
                  onClick={() => { setSelectedStatut(statut); setPage(0); }}
                  sx={isActive ? styles.filterPillActive : styles.filterPill}
                />
              )
            })}
          </Box>
          <Box sx={{
            ml: 'auto',
            display: 'flex',
            bgcolor: colors.neutral[100],
            borderRadius: '8px',
            p: '3px',
          }}>
            <Button
              startIcon={<ViewList sx={{ fontSize: '16px !important' }} />}
              onClick={() => setViewMode('list')}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: typography.weights.medium,
                fontSize: typography.sizes.sm,
                borderRadius: '6px',
                px: 1.5,
                minWidth: 0,
                ...(viewMode === 'list' ? {
                  bgcolor: colors.surface,
                  color: colors.textPrimary,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                } : {
                  bgcolor: 'transparent',
                  color: colors.textSecondary,
                }),
                '&:hover': {
                  bgcolor: viewMode === 'list' ? colors.surface : colors.neutral[200],
                },
              }}
            >
              Liste
            </Button>
            <Button
              startIcon={<MapIcon sx={{ fontSize: '16px !important' }} />}
              onClick={() => setViewMode('map')}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: typography.weights.medium,
                fontSize: typography.sizes.sm,
                borderRadius: '6px',
                px: 1.5,
                minWidth: 0,
                ...(viewMode === 'map' ? {
                  bgcolor: colors.surface,
                  color: colors.textPrimary,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                } : {
                  bgcolor: 'transparent',
                  color: colors.textSecondary,
                }),
                '&:hover': {
                  bgcolor: viewMode === 'map' ? colors.surface : colors.neutral[200],
                },
              }}
            >
              Carte
            </Button>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
          {/* Map View */}
          {viewMode === 'map' && (
            <Box sx={{ mt: 2 }}>
              <MarchesMapView marches={filteredMarches} />
            </Box>
          )}

          {/* Table View */}
          {viewMode === 'list' && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Box sx={styles.tableContainer}>
                <TableContainer>
                  <SortableContext items={paginatedMarches.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={styles.tableHeader}>
                          <TableCell sx={{ width: 40 }} />
                          <TableCell>N° Marché</TableCell>
                          <TableCell>N° AO</TableCell>
                          <TableCell>Objet</TableCell>
                          <TableCell>Fournisseur</TableCell>
                          <TableCell align="right">Montant TTC</TableCell>
                          <TableCell align="center">Lignes</TableCell>
                          <TableCell align="center">Statut</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedMarches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                              <Typography sx={{ color: colors.textSecondary }}>Aucun marché trouvé</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedMarches.map((marche) => (
                            <SortableTableRow
                              key={marche.id}
                              id={marche.id}
                              sx={styles.tableRowClickable}
                            >
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer', fontWeight: typography.weights.medium, color: colors.primary[700] }}
                              >
                                {marche.numeroMarche}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer', color: colors.textSecondary }}
                              >
                                {marche.numAo || '-'}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {marche.objet}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer' }}
                              >
                                {marche.fournisseurNom}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                align="right"
                                sx={{ cursor: 'pointer', fontWeight: typography.weights.semibold, color: colors.primary[700] }}
                              >
                                {formatCurrency(marche.montantTtc)}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                align="center"
                                sx={{ cursor: 'pointer' }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 24,
                                    height: 24,
                                    borderRadius: '6px',
                                    bgcolor: colors.primary[100],
                                    color: colors.primary[700],
                                    fontWeight: typography.weights.semibold,
                                    fontSize: typography.sizes.xs,
                                    px: 1,
                                  }}
                                >
                                  {marche.nbLignes}
                                </Box>
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                align="center"
                                sx={{ cursor: 'pointer' }}
                              >
                                <StatusBadge status={marche.statut} />
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/marches/${marche.id}`)}
                                    sx={{ color: colors.neutral[500] }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/marches/${marche.id}/modifier`)}
                                    sx={{ color: colors.neutral[500] }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(marche.id)}
                                    sx={{ color: colors.danger[500] }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </SortableTableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredMarches.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                  }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Lignes par page"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
              </Box>
            </DndContext>
          )}
        </Box>
      </Box>
    </AppLayout>
  )
}
