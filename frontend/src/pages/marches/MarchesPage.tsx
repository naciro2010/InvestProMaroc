import { useState, useEffect } from 'react'
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
  const [marches, setMarches] = useState<MarcheListItem[]>([])
  const [filteredMarches, setFilteredMarches] = useState<MarcheListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  useEffect(() => {
    fetchMarches()
  }, [])

  useEffect(() => {
    filterMarches()
  }, [searchTerm, selectedStatut, marches])

  const fetchMarches = async () => {
    try {
      setLoading(true)
      // Use optimized /list endpoint instead of full /marches endpoint
      // This follows micro-frontends pattern: each component loads only what it needs
      const response = await api.get('/marches/list')
      setMarches(response.data)
      setFilteredMarches(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des marchés:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMarches = () => {
    let filtered = marches

    // Filtre par recherche
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(m =>
        m.numeroMarche.toLowerCase().includes(query) ||
        m.objet.toLowerCase().includes(query) ||
        m.fournisseurNom.toLowerCase().includes(query) ||
        (m.conventionLibelle?.toLowerCase() ?? '').includes(query)
      )
    }

    // Filtre par statut
    if (selectedStatut !== 'ALL') {
      filtered = filtered.filter(m => m.statut === selectedStatut)
    }

    setFilteredMarches(filtered)
  }

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
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <PageHeader
            title="Marchés"
            subtitle="Gestion complète des contrats et marchés publics"
            actions={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/marches/nouveau')}
              >
                Nouveau Marché
              </Button>
            }
          />

          {/* Stats */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            <StatsCard
              title="Total Marchés"
              value={stats.total}
              icon={<ShoppingCart />}
              color={colors.primary[600]}
              bgColor={colors.primary[50]}
            />
            <StatsCard
              title="En Cours"
              value={stats.enCours}
              icon={<Receipt />}
              color={colors.warning[600]}
              bgColor={colors.warning[50]}
            />
            <StatsCard
              title="Validés"
              value={stats.valide}
              icon={<Description />}
              color={colors.success[600]}
              bgColor={colors.success[50]}
            />
            <StatsCard
              title="Terminés"
              value={stats.termine}
              icon={<Description />}
              color={colors.info[600]}
              bgColor={colors.info[50]}
            />
            <StatsCard
              title="Montant Total"
              value={formatCurrency(stats.montantTotal)}
              subtitle="DH"
              icon={<ShoppingCart />}
              color={colors.purple[600]}
              bgColor={colors.purple[50]}
            />
          </Box>

          {/* Main Content */}
          <Paper sx={{ p: 3, border: `1px solid ${colors.border}`, boxShadow: 'none', borderRadius: '12px' }}>
            {/* Filters and Search */}
            <Stack spacing={3} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par numéro, objet, fournisseur, convention..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                />
                <TextField
                  select
                  SelectProps={{ native: true }}
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                  sx={{ minWidth: 200 }}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Affichage de <strong>{filteredMarches.length}</strong> sur{' '}
                  <strong>{marches.length}</strong> marché(s)
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    startIcon={<ViewList />}
                    onClick={() => setViewMode('list')}
                    size="small"
                  >
                    Liste
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'contained' : 'outlined'}
                    startIcon={<MapIcon />}
                    onClick={() => setViewMode('map')}
                    size="small"
                  >
                    Carte
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

            {/* Table View */}
            {viewMode === 'list' && (
              <Box sx={{ mt: 2, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.border}` }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>N° Marché</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>N° AO</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>Objet</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>Fournisseur</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>Montant TTC</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>Lignes</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>Statut</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarches.map((marche) => (
                      <tr
                        key={marche.id}
                        style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.neutral[50])}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        onClick={() => navigate(`/marches/${marche.id}`)}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 500, color: colors.textPrimary }}>{marche.numeroMarche}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: colors.textSecondary }}>{marche.numAo || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.textPrimary }}>{marche.objet}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: colors.textPrimary }}>{marche.fournisseurNom}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right', color: colors.primary[700] }}>{formatCurrency(marche.montantTtc)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
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
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <StatusBadge status={marche.statut} size="small" />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/marches/${marche.id}`); }} sx={{ color: colors.neutral[500] }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/marches/${marche.id}/modifier`); }} sx={{ color: colors.neutral[500] }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(marche.id); }} sx={{ color: colors.danger[500] }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredMarches.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>Aucun marché trouvé</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}
