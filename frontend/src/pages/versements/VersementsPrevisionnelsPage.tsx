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
import { colors, componentStyles, borders, typography, spacing } from '@/lib/designSystem'

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
  montantPrevu?: number
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
    montantPrevu: 0,
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
        montantPrevu: versement.montantPrevu || 0,
        montant: versement.montant,
        remarques: versement.remarques || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        conventionId: 0,
        volet: '',
        dateVersement: new Date().toISOString().split('T')[0],
        montantPrevu: 0,
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
        montantPrevu: formData.montantPrevu || null,
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

  // Stat card configurations with semantic colors (Atlassian-style)
  const statCards = [
    {
      label: 'Total Versements',
      value: stats.totalVersements.toString(),
      icon: AccountBalanceWallet,
      bgColor: colors.primary[50],
      iconBgColor: colors.primary[100],
      iconColor: colors.primary[600],
      textColor: colors.primary[700],
    },
    {
      label: 'Montant Total',
      value: `${formatCurrency(stats.montantTotal)} DH`,
      icon: TrendingUp,
      bgColor: colors.success[50],
      iconBgColor: colors.success[100],
      iconColor: colors.success[600],
      textColor: colors.success[700],
    },
    {
      label: 'Conventions',
      value: stats.conventionsCount.toString(),
      icon: FilterList,
      bgColor: colors.warning[50],
      iconBgColor: colors.warning[100],
      iconColor: colors.warning[600],
      textColor: colors.warning[700],
    },
    {
      label: 'Proches (30j)',
      value: stats.versementsProches.toString(),
      icon: CalendarMonth,
      bgColor: colors.info[50],
      iconBgColor: colors.info[100],
      iconColor: colors.info[600],
      textColor: colors.info[700],
    },
  ]

  return (
    <AppLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: colors.background }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: 1,
            }}
          >
            Versements Prévisionnels
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: colors.textSecondary,
              fontSize: typography.sizes.base,
            }}
          >
            Planification et suivi des paiements prévisionnels pour les conventions
          </Typography>
        </Box>

        {/* Stats Cards - Atlassian Style */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
          {statCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <Box key={index} sx={{ flex: 1 }}>
                <Card
                  sx={{
                    ...componentStyles.statCard,
                    backgroundColor: card.bgColor,
                    border: 'none',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: borders.radius.lg,
                        bgcolor: card.iconBgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 24, color: card.iconColor }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.textSecondary,
                          fontSize: typography.sizes.xs,
                          fontWeight: typography.weights.medium,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 0.5,
                        }}
                      >
                        {card.label}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: typography.weights.bold,
                          color: card.textColor,
                          fontSize: typography.sizes.xl,
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Box>
            )
          })}
        </Stack>

        {/* Filters & Actions */}
        <Paper
          sx={{
            ...componentStyles.card,
            p: 3,
            mb: 3,
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1, ...componentStyles.inputField }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 250 }} size="small">
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
                ...componentStyles.buttonPrimary,
                minWidth: 200,
              }}
            >
              Nouveau Versement
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={componentStyles.table.container}>
          <Table>
            <TableHead>
              <TableRow sx={componentStyles.table.header}>
                <TableCell sx={componentStyles.table.headerCell}>Convention</TableCell>
                <TableCell sx={componentStyles.table.headerCell}>Volet</TableCell>
                <TableCell sx={componentStyles.table.headerCell}>Date Versement</TableCell>
                <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Montant Prevu</TableCell>
                <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Montant Reel</TableCell>
                <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Ecart</TableCell>
                <TableCell sx={componentStyles.table.headerCell}>Remarques</TableCell>
                <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">Chargement...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredVersements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={componentStyles.emptyState}>
                    <Typography color="textSecondary">Aucun versement trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVersements
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((versement) => (
                    <TableRow key={versement.id} sx={componentStyles.table.row}>
                      <TableCell sx={componentStyles.table.cell}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}
                        >
                          {versement.convention.code}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {versement.convention.objet}
                        </Typography>
                      </TableCell>
                      <TableCell sx={componentStyles.table.cell}>{versement.volet || '-'}</TableCell>
                      <TableCell sx={componentStyles.table.cell}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{formatDate(versement.dateVersement)}</Typography>
                          {isVersementProche(versement.dateVersement) && (
                            <Chip
                              label="Proche"
                              size="small"
                              sx={{
                                backgroundColor: colors.warning[50],
                                color: colors.warning[700],
                                fontWeight: typography.weights.medium,
                                fontSize: typography.sizes.xs,
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: typography.sizes.sm, color: versement.montantPrevu ? colors.textPrimary : colors.textSecondary }}
                        >
                          {versement.montantPrevu ? `${formatCurrency(versement.montantPrevu)} DH` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: typography.weights.semibold, color: colors.success[600] }}
                        >
                          {formatCurrency(versement.montant)} DH
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                        {versement.montantPrevu ? (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: typography.weights.medium,
                              fontSize: typography.sizes.sm,
                              color: versement.montant === versement.montantPrevu
                                ? colors.success[600]
                                : versement.montant > versement.montantPrevu
                                  ? colors.danger[600]
                                  : colors.info[600],
                            }}
                          >
                            {formatCurrency(versement.montant - versement.montantPrevu)} DH
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>-</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={componentStyles.table.cell}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {versement.remarques || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(versement)}
                          title="Modifier"
                          sx={{ color: colors.primary[600] }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(versement.id)}
                          title="Supprimer"
                          sx={{ color: colors.danger[600] }}
                        >
                          <Delete fontSize="small" />
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
            sx={{ borderTop: `1px solid ${colors.divider}` }}
          />
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: typography.weights.semibold }}>
            {editingId ? 'Modifier' : 'Ajouter'} un Versement Prévisionnel
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth required size="small">
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
                size="small"
                label="Volet / Composante"
                value={formData.volet}
                onChange={(e) => setFormData({ ...formData, volet: e.target.value })}
                placeholder="Ex: Volet 1 - Infrastructure"
              />

              <TextField
                fullWidth
                required
                size="small"
                type="date"
                label="Date de Versement"
                value={formData.dateVersement}
                onChange={(e) => setFormData({ ...formData, dateVersement: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                size="small"
                type="number"
                label="Montant Prevu (MAD)"
                value={formData.montantPrevu || ''}
                onChange={(e) => setFormData({ ...formData, montantPrevu: parseFloat(e.target.value) || 0 })}
                helperText="Montant initialement planifie pour ce versement"
                InputProps={{
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />

              <TextField
                fullWidth
                required
                size="small"
                type="number"
                label="Montant Reel (MAD)"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                helperText="Montant effectivement verse ou a verser"
                InputProps={{
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />

              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Remarques"
                value={formData.remarques}
                onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} sx={componentStyles.buttonSecondary}>
              Annuler
            </Button>
            <Button variant="contained" onClick={handleSave} sx={componentStyles.buttonPrimary}>
              {editingId ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default VersementsPrevisionnelsPage
