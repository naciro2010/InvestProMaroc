import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Button,
  Paper,
  TextField,
  Chip,
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
import api from '../../lib/api'
import { Marche as MarcheType, Fournisseur } from '../../types/entities'

// Interface étendue avec champs calculés par le backend
interface Marche extends Omit<MarcheType, 'montantHT' | 'montantTTC'> {
  montantHt: number // Backend uses camelCase
  montantTtc: number // Backend uses camelCase
  fournisseur?: Partial<Fournisseur>
  convention?: {
    id: number
    code: string
    libelle: string
  }
  nbLignes?: number
  nbAvenants?: number
  nbDecomptes?: number
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
  const [marches, setMarches] = useState<Marche[]>([])
  const [filteredMarches, setFilteredMarches] = useState<Marche[]>([])
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
      filtered = filtered.filter(m =>
        m.numeroMarche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.objet?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (m.fournisseur?.raisonSociale?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (m.convention?.libelle?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
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
              color="#3b82f6"
              bgColor="#eff6ff"
            />
            <StatsCard
              title="En Cours"
              value={stats.enCours}
              icon={<Receipt />}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
            <StatsCard
              title="Validés"
              value={stats.valide}
              icon={<Description />}
              color="#10b981"
              bgColor="#d1fae5"
            />
            <StatsCard
              title="Terminés"
              value={stats.termine}
              icon={<Description />}
              color="#3b82f6"
              bgColor="#dbeafe"
            />
            <StatsCard
              title="Montant Total"
              value={formatCurrency(stats.montantTotal)}
              subtitle="DH"
              icon={<ShoppingCart />}
              color="#8b5cf6"
              bgColor="#f5f3ff"
            />
          </Box>

          {/* Main Content */}
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', boxShadow: 'none', borderRadius: '12px' }}>
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
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>N° Marché</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>N° AO</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Objet</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Fournisseur</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Montant TTC</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Lignes</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Statut</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarches.map((marche) => (
                      <tr
                        key={marche.id}
                        style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        onClick={() => navigate(`/marches/${marche.id}`)}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 500 }}>{marche.numeroMarche}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#6b7280' }}>{marche.numAO || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{marche.objet}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{marche.fournisseur?.raisonSociale || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(marche.montantTtc)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Chip label={marche.nbLignes || 0} size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Chip
                            label={marche.statut.replace('_', ' ')}
                            size="small"
                            color={
                              marche.statut === 'VALIDE' ? 'success' :
                              marche.statut === 'EN_COURS' ? 'warning' :
                              marche.statut === 'TERMINE' ? 'info' :
                              'default'
                            }
                          />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/marches/${marche.id}`); }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/marches/${marche.id}/modifier`); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(marche.id); }}>
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
                    <Typography variant="body1" color="text.secondary">Aucun marché trouvé</Typography>
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
