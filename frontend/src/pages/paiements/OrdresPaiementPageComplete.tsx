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
  MenuItem,
} from '@mui/material'
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  AttachMoney,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { ordresPaiementAPI } from '../../lib/api'
import FileUpload from '../../components/ui/FileUpload'

const OrdresPaiementPage = () => {
  const navigate = useNavigate()
  const [ordres, setOrdres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrdre, setSelectedOrdre] = useState<any>(null)
  const [formData, setFormData] = useState({
    numeroOrdre: '',
    dateEmission: new Date().toISOString().split('T')[0],
    dateExecution: '',
    montant: '',
    beneficiaire: '',
    compteBancaire: '',
    reference: '',
    observation: '',
    decompteId: '',
  })

  useEffect(() => {
    loadOrdres()
  }, [])

  const loadOrdres = async () => {
    setLoading(true)
    try {
      const { data } = await ordresPaiementAPI.getAll()
      setOrdres(data.data || [])
    } catch (error) {
      console.error('Erreur chargement ordres de paiement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (ordre: any = null) => {
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
        montant: '',
        beneficiaire: '',
        compteBancaire: '',
        reference: '',
        observation: '',
        decompteId: '',
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
        montant: parseFloat(formData.montant),
        decompteId: parseInt(formData.decompteId),
      }

      if (selectedOrdre) {
        await ordresPaiementAPI.update(selectedOrdre.id, payload)
      } else {
        await ordresPaiementAPI.create(payload)
      }

      handleCloseDialog()
      loadOrdres()
    } catch (error) {
      console.error('Erreur sauvegarde ordre de paiement:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return

    try {
      await ordresPaiementAPI.delete(id)
      loadOrdres()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }


  const filteredOrdres = ordres.filter(o =>
    o.numeroOrdre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase())
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
      'VALIDE': 'info',
      'EXECUTE': 'success',
      'ANNULE': 'error',
    }
    return colors[statut] || 'default'
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Gestion des Ordres de Paiement
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
          >
            Nouvel Ordre de Paiement
          </Button>
        </Stack>

        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un ordre de paiement..."
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
              ) : filteredOrdres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun ordre de paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrdres.map((ordre) => (
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
                      <Chip
                        label={ordre.statut || 'EN_ATTENTE'}
                        color={getStatusColor(ordre.statut)}
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
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Montant"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                    inputProps: { step: '0.01', min: '0' }
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

              <TextField
                fullWidth
                type="number"
                required
                label="Décompte (ID)"
                value={formData.decompteId}
                onChange={(e) => setFormData({ ...formData, decompteId: e.target.value })}
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
