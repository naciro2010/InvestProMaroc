import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Visibility,
  Edit,
  Delete,
  AttachMoney,
} from '@mui/icons-material'
import { Plus, RefreshCw } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, StatusBadge, ExportButton } from '@/components/core'
import { ordresPaiementAPI } from '@/lib/api'
import FileUpload from '@/components/ui/FileUpload'
import DecimalInput from '@/components/ui/DecimalInput'

interface OrdrePaiementItem {
  id: number
  numeroOrdre: string
  dateEmission: string
  dateExecution?: string
  montant: number
  beneficiaire?: string
  compteBancaire?: string
  reference?: string
  observation?: string
  decompteId: number
  statut?: string
}

const OrdresPaiementPage = () => {
  const [ordres, setOrdres] = useState<OrdrePaiementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrdre, setSelectedOrdre] = useState<OrdrePaiementItem | null>(null)
  const [formData, setFormData] = useState({
    numeroOrdre: '',
    dateEmission: new Date().toISOString().split('T')[0],
    dateExecution: '',
    montant: 0,
    beneficiaire: '',
    compteBancaire: '',
    reference: '',
    observation: '',
    decompteId: 0,
  })

  // Pagination
  const [page, setPage] = useState(0)
  const rowsPerPage = 25

  useEffect(() => {
    loadOrdres()
  }, [])

  const loadOrdres = async () => {
    setLoading(true)
    try {
      const { data } = await ordresPaiementAPI.getAll()
      setOrdres(data.data || [])
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur chargement ordres de paiement:', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (ordre: OrdrePaiementItem | null = null) => {
    if (ordre) {
      setSelectedOrdre(ordre)
      setFormData({
        numeroOrdre: ordre.numeroOrdre,
        dateEmission: ordre.dateEmission,
        dateExecution: ordre.dateExecution || '',
        montant: ordre.montant,
        beneficiaire: ordre.beneficiaire || '',
        compteBancaire: ordre.compteBancaire || '',
        reference: ordre.reference || '',
        observation: ordre.observation || '',
        decompteId: ordre.decompteId,
      })
    } else {
      setSelectedOrdre(null)
      setFormData({
        numeroOrdre: '',
        dateEmission: new Date().toISOString().split('T')[0],
        dateExecution: '',
        montant: 0,
        beneficiaire: '',
        compteBancaire: '',
        reference: '',
        observation: '',
        decompteId: 0,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedOrdre(null)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        montant: formData.montant,
        decompteId: formData.decompteId,
      }

      if (selectedOrdre) {
        await ordresPaiementAPI.update(selectedOrdre.id, payload)
      } else {
        await ordresPaiementAPI.create(payload)
      }

      handleCloseDialog()
      loadOrdres()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur sauvegarde ordre de paiement:', msg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return

    try {
      await ordresPaiementAPI.delete(id)
      loadOrdres()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur suppression:', msg)
    }
  }


  const filteredOrdres = useMemo(() => {
    return ordres.filter(o =>
      o.numeroOrdre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [ordres, searchTerm])

  const paginatedOrdres = useMemo(() => {
    const start = page * rowsPerPage
    return filteredOrdres.slice(start, start + rowsPerPage)
  }, [filteredOrdres, page, rowsPerPage])

  const paginationInfo = useMemo(() => {
    const total = filteredOrdres.length
    if (total === 0) return undefined
    const currentStart = page * rowsPerPage + 1
    const currentEnd = Math.min((page + 1) * rowsPerPage, total)
    return { currentStart, currentEnd, total }
  }, [filteredOrdres.length, page, rowsPerPage])

  const handleExport = () => {
    // TODO: Implement export logic for ordres de paiement
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MAD'
  }

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[{ label: 'Ordres de paiement' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshCw size={16} />}
              onClick={loadOrdres}
              sx={{ textTransform: 'none' }}
            >
              Actualiser
            </Button>
            <ExportButton onClick={handleExport} />
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => handleOpenDialog()}
              sx={{ textTransform: 'none' }}
            >
              Nouveau
            </Button>
          </Box>
        }
        searchValue={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); setPage(0) }}
        searchPlaceholder="Rechercher..."
        paginationInfo={paginationInfo}
        onPreviousPage={() => setPage((p) => Math.max(0, p - 1))}
        onNextPage={() => setPage((p) => p + 1)}
      />

      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Numéro OP</strong></TableCell>
                <TableCell><strong>Date Émission</strong></TableCell>
                <TableCell><strong>Date Exécution</strong></TableCell>
                <TableCell><strong>Bénéficiaire</strong></TableCell>
                <TableCell align="right"><strong>Montant</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Chargement...</TableCell>
                </TableRow>
              ) : paginatedOrdres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun ordre de paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrdres.map((ordre) => (
                  <TableRow key={ordre.id} hover>
                    <TableCell>{ordre.numeroOrdre}</TableCell>
                    <TableCell>
                      {new Date(ordre.dateEmission).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {ordre.dateExecution ? new Date(ordre.dateExecution).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>{ordre.beneficiaire || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(ordre.montant)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={ordre.statut || 'EN_ATTENTE'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" title="Voir">
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleOpenDialog(ordre)}
                        title="Modifier"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(ordre.id)}
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
        </TableContainer>

        {/* Dialog Formulaire */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedOrdre ? 'Modifier l\'Ordre de Paiement' : 'Nouvel Ordre de Paiement'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Numéro OP"
                  value={formData.numeroOrdre}
                  onChange={(e) => setFormData({ ...formData, numeroOrdre: e.target.value })}
                  placeholder="OP-001"
                />
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date d'Émission"
                  value={formData.dateEmission}
                  onChange={(e) => setFormData({ ...formData, dateEmission: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date d'Exécution Prévue"
                  value={formData.dateExecution}
                  onChange={(e) => setFormData({ ...formData, dateExecution: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <DecimalInput
                  fullWidth
                  required
                  label="Montant"
                  value={formData.montant}
                  onChange={(value) => setFormData({ ...formData, montant: value })}
                  decimalPlaces={2}
                  min={0}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  }}
                />
              </Stack>

              <TextField
                fullWidth
                required
                label="Bénéficiaire"
                value={formData.beneficiaire}
                onChange={(e) => setFormData({ ...formData, beneficiaire: e.target.value })}
                placeholder="Nom du bénéficiaire"
              />

              <TextField
                fullWidth
                label="Compte Bancaire"
                value={formData.compteBancaire}
                onChange={(e) => setFormData({ ...formData, compteBancaire: e.target.value })}
                placeholder="RIB du bénéficiaire"
              />

              <TextField
                fullWidth
                label="Référence"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Référence interne"
              />

              <DecimalInput
                fullWidth
                required
                label="Décompte (ID)"
                value={formData.decompteId}
                onChange={(value) => setFormData({ ...formData, decompteId: value })}
                decimalPlaces={0}
                min={0}
                helperText="ID du décompte associé"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              />

              {selectedOrdre && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Pièces jointes
                  </Typography>
                  <FileUpload
                    typeEntite="ORDRE_PAIEMENT"
                    entiteId={selectedOrdre.id}
                    maxFiles={10}
                    maxFileSize={10}
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {selectedOrdre ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default OrdresPaiementPage
