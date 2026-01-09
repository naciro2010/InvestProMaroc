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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Add,
  Edit,
  Visibility,
  Search,
  CheckCircle,
  Pending,
  Cancel,
  AttachMoney,
  Description,
  CalendarToday,
} from '@mui/icons-material'
import { decomptesAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'

type StatutDecompte = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE' | 'PAYE_PARTIEL' | 'PAYE_TOTAL'

interface Decompte {
  id: number
  numeroDecompte: string
  dateDecompte: string
  marcheId: number
  marcheNumero?: string
  statut: StatutDecompte
  montantBrutHT: number
  montantTVA: number
  montantTTC: number
  totalRetenues: number
  netAPayer: number
  montantPaye: number
  estSolde: boolean
  periodeDebut: string
  periodeFin: string
}

const DecomptesPage = () => {
  const navigate = useNavigate()
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchDecomptes()
  }, [])

  const fetchDecomptes = async () => {
    try {
      const response = await decomptesAPI.getAll()
      const data = response.data?.data || response.data || []
      setDecomptes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur chargement décomptes:', error)
      setDecomptes([])
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadge = (statut: StatutDecompte) => {
    const config: Record<StatutDecompte, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: JSX.Element }> = {
      BROUILLON: { color: 'default', icon: <Edit fontSize="small" /> },
      SOUMIS: { color: 'warning', icon: <Pending fontSize="small" /> },
      VALIDE: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      REJETE: { color: 'error', icon: <Cancel fontSize="small" /> },
      PAYE_PARTIEL: { color: 'info', icon: <AttachMoney fontSize="small" /> },
      PAYE_TOTAL: { color: 'success', icon: <CheckCircle fontSize="small" /> },
    }
    const { color, icon } = config[statut]
    return <Chip icon={icon} label={statut.replace('_', ' ')} color={color} size="small" />
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
      month: 'short',
      day: 'numeric'
    })
  }

  // Filtrage
  const filteredDecomptes = decomptes.filter(decompte => {
    const matchesSearch = decompte.numeroDecompte.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (decompte.marcheNumero?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatut = statutFilter === 'ALL' || decompte.statut === statutFilter
    return matchesSearch && matchesStatut
  })

  // Statistiques
  const stats = {
    total: decomptes.length,
    brouillon: decomptes.filter(d => d.statut === 'BROUILLON').length,
    valides: decomptes.filter(d => d.statut === 'VALIDE').length,
    payes: decomptes.filter(d => d.statut === 'PAYE_TOTAL').length,
    montantTotal: decomptes.reduce((sum, d) => sum + d.netAPayer, 0),
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
                Décomptes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestion des situations de travaux et prestations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/decomptes/nouveau')}
              sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
            >
              Nouveau Décompte
            </Button>
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
                    <Description />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Décomptes</Typography>
                    <Typography variant="h5" fontWeight={600}>{stats.total}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark' }}>
                    <Pending />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Brouillon</Typography>
                    <Typography variant="h5" fontWeight={600}>{stats.brouillon}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                    <CheckCircle />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Validés</Typography>
                    <Typography variant="h5" fontWeight={600}>{stats.valides}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.light', color: 'info.dark' }}>
                    <AttachMoney />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Montant Total</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {formatCurrency(stats.montantTotal)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  placeholder="Rechercher par numéro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statutFilter}
                    onChange={(e) => setStatutFilter(e.target.value)}
                    label="Statut"
                  >
                    <MenuItem value="ALL">Tous les statuts</MenuItem>
                    <MenuItem value="BROUILLON">Brouillon</MenuItem>
                    <MenuItem value="SOUMIS">Soumis</MenuItem>
                    <MenuItem value="VALIDE">Validé</MenuItem>
                    <MenuItem value="REJETE">Rejeté</MenuItem>
                    <MenuItem value="PAYE_PARTIEL">Payé Partiel</MenuItem>
                    <MenuItem value="PAYE_TOTAL">Payé Total</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Décompte</TableCell>
                    <TableCell>Marché</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Montant Brut HT</TableCell>
                    <TableCell align="right">Retenues</TableCell>
                    <TableCell align="right">Net à Payer</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDecomptes.map((decompte) => (
                    <TableRow key={decompte.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {decompte.numeroDecompte}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {decompte.marcheNumero || `#${decompte.marcheId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            {formatDate(decompte.periodeDebut)} - {formatDate(decompte.periodeFin)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(decompte.dateDecompte)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(decompte.montantBrutHT)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          {formatCurrency(decompte.totalRetenues)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(decompte.netAPayer)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatutBadge(decompte.statut)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/decomptes/${decompte.id}`)}
                            title="Voir détails"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          {decompte.statut === 'BROUILLON' && (
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => navigate(`/decomptes/${decompte.id}/modifier`)}
                              title="Modifier"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDecomptes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Box py={4}>
                          <Typography variant="body2" color="text.secondary">
                            Aucun décompte trouvé
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default DecomptesPage
