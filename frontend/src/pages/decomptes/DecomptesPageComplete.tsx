import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Chip,
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
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  AttachMoney,
  Description,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { SimplePageLayout } from '../../components/layout/PageLayout'
import { decomptesAPI } from '../../lib/api'
import FileUpload from '../../components/ui/FileUpload'

const DecomptesPage = () => {
  const navigate = useNavigate()
  const [decomptes, setDecomptes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDecompte, setSelectedDecompte] = useState<any>(null)
  const [formData, setFormData] = useState({
    numero: '',
    dateDecompte: new Date().toISOString().split('T')[0],
    montant: '',
    montantRetenue: '',
    netAPayer: '',
    observation: '',
    marcheId: '',
  })

  useEffect(() => {
    loadDecomptes()
  }, [])

  const loadDecomptes = async () => {
    setLoading(true)
    try {
      const { data } = await decomptesAPI.getAll()
      setDecomptes(data.data || [])
    } catch (error) {
      console.error('Erreur chargement décomptes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (decompte: any = null) => {
    if (decompte) {
      setSelectedDecompte(decompte)
      setFormData({
        numero: decompte.numero,
        dateDecompte: decompte.dateDecompte,
        montant: decompte.montant,
        montantRetenue: decompte.montantRetenue,
        netAPayer: decompte.netAPayer,
        observation: decompte.observation || '',
        marcheId: decompte.marcheId,
      })
    } else {
      setSelectedDecompte(null)
      setFormData({
        numero: '',
        dateDecompte: new Date().toISOString().split('T')[0],
        montant: '',
        montantRetenue: '0',
        netAPayer: '',
        observation: '',
        marcheId: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedDecompte(null)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        montant: parseFloat(formData.montant),
        montantRetenue: parseFloat(formData.montantRetenue),
        netAPayer: parseFloat(formData.netAPayer),
        marcheId: parseInt(formData.marcheId),
      }

      if (selectedDecompte) {
        await decomptesAPI.update(selectedDecompte.id, payload)
      } else {
        await decomptesAPI.create(payload)
      }

      handleCloseDialog()
      loadDecomptes()
    } catch (error) {
      console.error('Erreur sauvegarde décompte:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return

    try {
      await decomptesAPI.delete(id)
      loadDecomptes()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const calculateNetAPayer = () => {
    const montant = parseFloat(formData.montant) || 0
    const retenue = parseFloat(formData.montantRetenue) || 0
    const net = montant - retenue
    setFormData({ ...formData, netAPayer: net.toFixed(2) })
  }

  const filteredDecomptes = decomptes.filter(d =>
    d.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MAD'
  }

  const getStatusColor = (statut: string) => {
    const colors: any = {
      'EN_ATTENTE': 'warning',
      'VALIDE': 'success',
      'REJETE': 'error',
      'PAYE': 'info',
    }
    return colors[statut] || 'default'
  }

  return (
    <AppLayout>
      <SimplePageLayout
        title="Décomptes"
        subtitle="Gestion des décomptes et facturations"
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouveau Décompte
          </Button>
        }
      >
        <Box sx={{ p: 3 }}>

        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un décompte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Numéro</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Montant</strong></TableCell>
                <TableCell><strong>Retenue</strong></TableCell>
                <TableCell align="right"><strong>Net à Payer</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Chargement...</TableCell>
                </TableRow>
              ) : filteredDecomptes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun décompte trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredDecomptes.map((decompte) => (
                  <TableRow key={decompte.id} hover>
                    <TableCell>{decompte.numero}</TableCell>
                    <TableCell>
                      {new Date(decompte.dateDecompte).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{formatCurrency(decompte.montant)}</TableCell>
                    <TableCell>{formatCurrency(decompte.montantRetenue)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(decompte.netAPayer)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={decompte.statut || 'EN_ATTENTE'}
                        color={getStatusColor(decompte.statut)}
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
                        onClick={() => handleOpenDialog(decompte)}
                        title="Modifier"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(decompte.id)}
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
            {selectedDecompte ? 'Modifier le Décompte' : 'Nouveau Décompte'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Numéro"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="DEC-001"
                />
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date"
                  value={formData.dateDecompte}
                  onChange={(e) => setFormData({ ...formData, dateDecompte: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TextField
                fullWidth
                required
                type="number"
                label="Montant"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                onBlur={calculateNetAPayer}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  inputProps: { step: '0.01', min: '0' }
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Montant Retenue"
                value={formData.montantRetenue}
                onChange={(e) => setFormData({ ...formData, montantRetenue: e.target.value })}
                onBlur={calculateNetAPayer}
                InputProps={{
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  inputProps: { step: '0.01', min: '0' }
                }}
                helperText="Retenues: garantie, pénalités, RAS..."
              />

              <TextField
                fullWidth
                label="Net à Payer"
                value={formData.netAPayer}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                }}
                sx={{ bgcolor: 'grey.50' }}
              />

              <TextField
                fullWidth
                type="number"
                required
                label="Marché (ID)"
                value={formData.marcheId}
                onChange={(e) => setFormData({ ...formData, marcheId: e.target.value })}
                helperText="ID du marché associé"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              />

              {selectedDecompte && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Pièces jointes
                  </Typography>
                  <FileUpload
                    typeEntite="DECOMPTE"
                    entiteId={selectedDecompte.id}
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
              {selectedDecompte ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </SimplePageLayout>
    </AppLayout>
  )
}

export default DecomptesPage
