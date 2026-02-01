import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Button,
  Paper,
  TextField,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Add,
  Search,
  ViewList,
  Map as MapIcon,
  Visibility,
  Edit,
  Delete,
  ShoppingCart,
  Receipt,
  Description,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import StatsCard from '../../components/common/StatsCard'
import MarchesMapView from '../../components/ui/MarchesMapView'
import StatusBadge from '../../components/core/StatusBadge'
import api from '../../lib/api'
import { colors } from '../../lib/designSystem'
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

const statutColors: Record<string, 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'> = {
  'VALIDE': 'VALIDEE',
  'EN_COURS': 'EN_COURS',
  'TERMINE': 'ACHEVE',
  'SUSPENDU': 'EN_RETARD',
  'ANNULE': 'ANNULE',
  'EN_ATTENTE': 'EN_COURS'
}

export default function MarchesPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [rawMarches, setRawMarches] = useState<MarcheListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Ref for scrolling to table when clicking stats
  const tableRef = useRef<HTMLDivElement>(null)

  // Handle stat card click - filter and scroll to table
  const handleStatClick = (statut: string) => {
    setSelectedStatut(statut)
    setViewMode('list')
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

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
      await api.delete(`/api/marches/${id}`)
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const calculateStats = () => {
    return {
      total: marches.length,
      enCours: marches.filter(m => m.statut === 'EN_COURS').length,
      valide: marches.filter(m => m.statut === 'VALIDE').length,
      termine: marches.filter(m => m.statut === 'TERMINE').length,
      montantTotal: marches.reduce((sum, m) => sum + m.montantTtc, 0)
    }
  }

  const stats = calculateStats()

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
      <Box sx={{ minHeight: '100vh', py: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <PageHeader
            title="Marchés"
            subtitle="Gestion complète des contrats et marchés publics"
            actions={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/marches/nouveau')}
                sx={{ px: { xs: 2, md: 3 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Nouveau Marché</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Nouveau</Box>
              </Button>
            }
          />

          {/* Stats - Clickable to filter and scroll */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: { xs: 2, md: 3 },
              mb: { xs: 3, md: 4 },
            }}
          >
            <StatsCard
              title="Total"
              value={stats.total}
              icon={<ShoppingCart />}
              color={colors.primary[600]}
              bgColor={colors.primary[50]}
              onClick={() => handleStatClick('ALL')}
            />
            <StatsCard
              title="En Cours"
              value={stats.enCours}
              icon={<Receipt />}
              color={colors.warning[600]}
              bgColor={colors.warning[50]}
              onClick={() => handleStatClick('EN_COURS')}
            />
            <StatsCard
              title="Validés"
              value={stats.valide}
              icon={<Description />}
              color={colors.success[600]}
              bgColor={colors.success[50]}
              onClick={() => handleStatClick('VALIDE')}
            />
            <StatsCard
              title="Terminés"
              value={stats.termine}
              icon={<Description />}
              color={colors.info[600]}
              bgColor={colors.info[50]}
              onClick={() => handleStatClick('TERMINE')}
            />
            <StatsCard
              title={isMobile ? "Total" : "Montant Total"}
              value={isMobile ? `${(stats.montantTotal / 1000000).toFixed(1)}M` : formatCurrency(stats.montantTotal)}
              icon={<ShoppingCart />}
              color={colors.purple[600]}
              bgColor={colors.purple[50]}
            />
          </Box>

          {/* Main Content */}
          <Paper sx={{ p: { xs: 2, md: 3 }, border: `1px solid ${colors.border}`, boxShadow: 'none', borderRadius: '12px' }}>
            {/* Filters and Search */}
            <Stack spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  placeholder={isMobile ? "Rechercher..." : "Rechercher par numéro, objet, fournisseur, convention..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                />
                <TextField
                  select
                  SelectProps={{ native: true }}
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  sx={{ minWidth: { xs: '100%', md: 200 } }}
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="VALIDE">Validé</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="SUSPENDU">Suspendu</option>
                  <option value="ANNULE">Annulé</option>
                  <option value="EN_ATTENTE">En attente</option>
                </TextField>
              </Box>

              {/* Results count and view toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{filteredMarches.length}</strong> / <strong>{marches.length}</strong> marché(s)
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    startIcon={!isMobile && <ViewList />}
                    onClick={() => setViewMode('list')}
                    size="small"
                  >
                    {isMobile ? <ViewList /> : 'Liste'}
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'contained' : 'outlined'}
                    startIcon={!isMobile && <MapIcon />}
                    onClick={() => setViewMode('map')}
                    size="small"
                  >
                    {isMobile ? <MapIcon /> : 'Carte'}
                  </Button>
                </Stack>
              </Box>
            </Stack>

            {/* Map View */}
            {viewMode === 'map' && (
              <Box sx={{ mt: 2 }}>
                <MarchesMapView marches={filteredMarches} />
              </Box>
            )}

            {/* Table View avec Drag & Drop */}
            {viewMode === 'list' && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
              <Box ref={tableRef} sx={{ mt: 2, overflowX: 'auto' }}>
                <TableContainer>
                  <SortableContext
                    items={filteredMarches.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                  <Table sx={{ minWidth: { xs: 500, md: 900 } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                        <TableCell sx={{ width: 40, p: 1, display: { xs: 'none', md: 'table-cell' } }} />
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase' }}>N° Marché</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', display: { xs: 'none', lg: 'table-cell' } }}>N° AO</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Objet</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', display: { xs: 'none', md: 'table-cell' } }}>Fournisseur</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', display: { xs: 'none', sm: 'table-cell' } }}>Montant</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', display: { xs: 'none', lg: 'table-cell' } }}>Lignes</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Statut</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMarches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                            <Typography variant="body1" sx={{ color: colors.textSecondary }}>Aucun marché trouvé</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMarches.map((marche, index) => (
                          <SortableTableRow
                            key={marche.id}
                            id={marche.id}
                            hideDragHandle={{ xs: true, md: false }}
                            sx={{
                              bgcolor: index % 2 === 0 ? '#ffffff' : colors.neutral[50],
                              '&:hover': { bgcolor: colors.neutral[100] },
                            }}
                          >
                            <TableCell
                              onClick={() => navigate(`/marches/${marche.id}`)}
                              sx={{ cursor: 'pointer', fontWeight: 500, color: colors.textPrimary }}
                            >
                              {marche.numeroMarche}
                            </TableCell>
                            <TableCell sx={{ color: colors.textSecondary, display: { xs: 'none', lg: 'table-cell' } }}>{marche.numAo || '-'}</TableCell>
                            <TableCell
                              onClick={() => navigate(`/marches/${marche.id}`)}
                              sx={{ cursor: 'pointer', maxWidth: { xs: 150, md: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {marche.objet}
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{marche.fournisseurNom}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: colors.primary[700], display: { xs: 'none', sm: 'table-cell' } }}>
                              {isMobile ? `${(marche.montantTtc / 1000).toFixed(0)}K` : formatCurrency(marche.montantTtc)}
                            </TableCell>
                            <TableCell align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
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
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  px: 1,
                                }}
                              >
                                {marche.nbLignes}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <StatusBadge status={marche.statut} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/marches/${marche.id}`); }} sx={{ color: colors.neutral[500] }}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/marches/${marche.id}/modifier`); }} sx={{ color: colors.neutral[500], display: { xs: 'none', sm: 'inline-flex' } }}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(marche.id); }} sx={{ color: colors.danger[500], display: { xs: 'none', md: 'inline-flex' } }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </SortableTableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  </SortableContext>
                </TableContainer>
              </Box>
              </DndContext>
            )}
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}
