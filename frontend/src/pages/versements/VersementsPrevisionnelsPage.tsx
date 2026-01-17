import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Card,
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  Delete,
  FilterList,
  TrendingUp,
  CalendarMonth,
  AccountBalanceWallet,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { versementsPrevisionnelsAPI, conventionsAPI } from '../../lib/api'
import colors from '../../theme/colors'

interface VersementPrevisionnel {
  id: number
  convention: {
    id: number
    code: string
    objet: string
  }
  volet: string
  dateVersement: string
  montant: number
  partenaire: {
    id: number
    designation: string
  }
  maitreOeuvreDelegue?: {
    id: number
    designation: string
  }
  remarques?: string
}

interface Convention {
  id: number
  code: string
  objet: string
  budget: number
}

const VersementsPrevisionnelsPage = () => {
  const navigate = useNavigate()
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [filteredVersements, setFilteredVersements] = useState<VersementPrevisionnel[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterConventionId, setFilterConventionId] = useState<number | ''>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [conventions, setConventions] = useState<Convention[]>([])

  const [formData, setFormData] = useState({
    conventionId: 0,
    volet: '',
    dateVersement: new Date().toISOString().split('T')[0],
    montant: 0,
    remarques: '',
  })

  const [stats, setStats] = useState({
    totalVersements: 0,
    montantTotal: 0,
    conventionsCount: 0,
    versementsProches: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterVersements()
  }, [searchTerm, filterConventionId, versements])

  const loadData = async () => {
    try {
      setLoading(true)
      const [versementsRes, conventionsRes] = await Promise.all([
        versementsPrevisionnelsAPI.getAll(),
        conventionsAPI.getAll(),
      ])

      const versementsData = Array.isArray(versementsRes.data.data)
        ? versementsRes.data.data
        : versementsRes.data.data?.data || []

      const conventionsData = Array.isArray(conventionsRes.data.data)
        ? conventionsRes.data.data
        : conventionsRes.data.data?.data || []

      setVersements(versementsData)
      setConventions(conventionsData)

      // Calculate stats
      const totalMontant = versementsData.reduce(
        (sum: number, v: VersementPrevisionnel) => sum + v.montant,
        0
      )
      const uniqueConventions = new Set(versementsData.map((v: VersementPrevisionnel) => v.convention.id))
      const today = new Date()
      const thirtyDaysLater = new Date(today)
      thirtyDaysLater.setDate(today.getDate() + 30)

      const versementsProches = versementsData.filter((v: VersementPrevisionnel) => {
        const vDate = new Date(v.dateVersement)
        return vDate >= today && vDate <= thirtyDaysLater
      }).length

      setStats({
        totalVersements: versementsData.length,
        montantTotal: totalMontant,
        conventionsCount: uniqueConventions.size,
        versementsProches,
      })
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVersements = () => {
    let filtered = versements

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.convention.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.convention.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.partenaire.designation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterConventionId) {
      filtered = filtered.filter((v) => v.convention.id === filterConventionId)
    }

    setFilteredVersements(filtered)
    setPage(0)
  }

  const handleOpenDialog = (versement?: VersementPrevisionnel) => {
    if (versement) {
      setEditingId(versement.id)
      setFormData({
        conventionId: versement.convention.id,
        volet: versement.volet || '',
        dateVersement: versement.dateVersement,
        montant: versement.montant,
        remarques: versement.remarques || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        conventionId: 0,
        volet: '',
        dateVersement: new Date().toISOString().split('T')[0],
        montant: 0,
        remarques: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!formData.conventionId || formData.montant <= 0) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const payload = {
        volet: formData.volet,
        dateVersement: formData.dateVersement,
        montant: formData.montant,
        remarques: formData.remarques,
      }

      if (editingId) {
        await versementsPrevisionnelsAPI.update(editingId, payload)
      } else {
        await versementsPrevisionnelsAPI.create(formData.conventionId, payload)
      }

      handleCloseDialog()
      loadData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce versement ?')) return

    try {
      await versementsPrevisionnelsAPI.delete(id)
      loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const isVersementProche = (date: string): boolean => {
    const vDate = new Date(date)
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(today.getDate() + 30)
    return vDate >= today && vDate <= thirtyDaysLater
  }

  return (
    <AppLayout>
      <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f9fafb' }}>
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
            color: 'white',
            borderRadius: '16px',
            p: 4,
            mb: 4,
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Versements Prévisionnels
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Planification et suivi des paiements prévisionnels pour les conventions
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 3, background: colors.gradients.primary }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceWallet sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Total Versements
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                    {stats.totalVersements}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 3, background: colors.gradients.success }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Montant Total
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                    {formatCurrency(stats.montantTotal)} DH
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 3, background: colors.gradients.warning }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FilterList sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Conventions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                    {stats.conventionsCount}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 3, background: colors.gradients.error }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarMonth sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Proches (30j)
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                    {stats.versementsProches}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Stack>

        {/* Filters & Actions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Filtrer par Convention</InputLabel>
              <Select
                value={filterConventionId}
                onChange={(e) => setFilterConventionId(e.target.value as number | '')}
                label="Filtrer par Convention"
              >
                <MenuItem value="">
                  <em>Toutes les conventions</em>
                </MenuItem>
                {conventions.map((conv) => (
                  <MenuItem key={conv.id} value={conv.id}>
                    {conv.code} - {conv.objet}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: colors.gradients.primary,
                minWidth: 200,
              }}
            >
              Nouveau Versement
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>
                  <strong>Convention</strong>
                </TableCell>
                <TableCell>
                  <strong>Volet</strong>
                </TableCell>
                <TableCell>
                  <strong>Date Versement</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Montant</strong>
                </TableCell>
                <TableCell>
                  <strong>Remarques</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredVersements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">Aucun versement trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVersements
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((versement) => (
                    <TableRow key={versement.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {versement.convention.code}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {versement.convention.objet}
                        </Typography>
                      </TableCell>
                      <TableCell>{versement.volet || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{formatDate(versement.dateVersement)}</Typography>
                          {isVersementProche(versement.dateVersement) && (
                            <Chip label="Proche" size="small" color="warning" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(versement.montant)} DH
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {versement.remarques || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenDialog(versement)}
                          title="Modifier"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(versement.id)}
                          title="Supprimer"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredVersements.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Modifier' : 'Ajouter'} un Versement Prévisionnel</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Convention</InputLabel>
                <Select
                  value={formData.conventionId}
                  onChange={(e) => setFormData({ ...formData, conventionId: Number(e.target.value) })}
                  label="Convention"
                  disabled={!!editingId}
                >
                  {conventions.map((conv) => (
                    <MenuItem key={conv.id} value={conv.id}>
                      {conv.code} - {conv.objet}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Volet / Composante"
                value={formData.volet}
                onChange={(e) => setFormData({ ...formData, volet: e.target.value })}
                placeholder="Ex: Volet 1 - Infrastructure"
              />

              <TextField
                fullWidth
                required
                type="date"
                label="Date de Versement"
                value={formData.dateVersement}
                onChange={(e) => setFormData({ ...formData, dateVersement: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="Montant (DH)"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarques"
                value={formData.remarques}
                onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button variant="contained" onClick={handleSave} sx={{ background: colors.gradients.primary }}>
              {editingId ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default VersementsPrevisionnelsPage
