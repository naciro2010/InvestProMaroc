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
  Payment,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { paiementsAPI } from '../../lib/api'
import FileUpload from '../../components/ui/FileUpload'

const PaiementsPage = () => {
  const navigate = useNavigate()
  const [paiements, setPaiements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPaiement, setSelectedPaiement] = useState<any>(null)
  const [formData, setFormData] = useState({
    numeroPaiement: '',
    datePaiement: new Date().toISOString().split('T')[0],
    montant: '',
    modeReglement: 'VIREMENT',
    referenceBancaire: '',
    beneficiaire: '',
    observation: '',
    ordrePaiementId: '',
  })

  useEffect(() => {
    loadPaiements()
  }, [])

  const loadPaiements = async () => {
    setLoading(true)
    try {
      const { data } = await paiementsAPI.getAll()
      setPaiements(data.data || [])
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (paiement: any = null) => {
    if (paiement) {
      setSelectedPaiement(paiement)
      setFormData({
        numeroPaiement: paiement.numeroPaiement,
        datePaiement: paiement.datePaiement,
        montant: paiement.montant,
        modeReglement: paiement.modeReglement || 'VIREMENT',
        referenceBancaire: paiement.referenceBancaire || '',
        beneficiaire: paiement.beneficiaire || '',
        observation: paiement.observation || '',
        ordrePaiementId: paiement.ordrePaiementId,
      })
    } else {
      setSelectedPaiement(null)
      setFormData({
        numeroPaiement: '',
        datePaiement: new Date().toISOString().split('T')[0],
        montant: '',
        modeReglement: 'VIREMENT',
        referenceBancaire: '',
        beneficiaire: '',
        observation: '',
        ordrePaiementId: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedPaiement(null)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        montant: parseFloat(formData.montant),
        ordrePaiementId: parseInt(formData.ordrePaiementId),
      }

      if (selectedPaiement) {
        await paiementsAPI.update(selectedPaiement.id, payload)
      } else {
        await paiementsAPI.create(payload)
      }

      handleCloseDialog()
      loadPaiements()
    } catch (error) {
      console.error('Erreur sauvegarde paiement:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return

    try {
      await paiementsAPI.delete(id)
      loadPaiements()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }


  const filteredPaiements = paiements.filter(p =>
    p.numeroPaiement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase())
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
      'EFFECTUE': 'success',
      'ANNULE': 'error',
    }
    return colors[statut] || 'default'
  }

  const getModeReglementLabel = (mode: string) => {
    const labels: any = {
      'VIREMENT': 'Virement',
      'CHEQUE': 'Chèque',
      'ESPECES': 'Espèces',
      'CARTE': 'Carte Bancaire',
      'PRELEVEMENT': 'Prélèvement',
    }
    return labels[mode] || mode
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Gestion des Paiements
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
          >
            Nouveau Paiement
          </Button>
        </Stack>

        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un paiement..."
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
                <TableCell><strong>Bénéficiaire</strong></TableCell>
                <TableCell><strong>Mode Règlement</strong></TableCell>
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
              ) : filteredPaiements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredPaiements.map((paiement) => (
                  <TableRow key={paiement.id} hover>
                    <TableCell>{paiement.numeroPaiement}</TableCell>
                    <TableCell>
                      {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{paiement.beneficiaire || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<Payment />}
                        label={getModeReglementLabel(paiement.modeReglement)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(paiement.montant)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={paiement.statut || 'EN_ATTENTE'}
                        color={getStatusColor(paiement.statut)}
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
                        onClick={() => handleOpenDialog(paiement)}
                        title="Modifier"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(paiement.id)}
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
            {selectedPaiement ? 'Modifier le Paiement' : 'Nouveau Paiement'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Numéro Paiement"
                  value={formData.numeroPaiement}
                  onChange={(e) => setFormData({ ...formData, numeroPaiement: e.target.value })}
                  placeholder="PAI-001"
                />
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date de Paiement"
                  value={formData.datePaiement}
                  onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
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
                <TextField
                  fullWidth
                  required
                  select
                  label="Mode de Règlement"
                  value={formData.modeReglement}
                  onChange={(e) => setFormData({ ...formData, modeReglement: e.target.value })}
                >
                  <MenuItem value="VIREMENT">Virement</MenuItem>
                  <MenuItem value="CHEQUE">Chèque</MenuItem>
                  <MenuItem value="ESPECES">Espèces</MenuItem>
                  <MenuItem value="CARTE">Carte Bancaire</MenuItem>
                  <MenuItem value="PRELEVEMENT">Prélèvement</MenuItem>
                </TextField>
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
                label="Référence Bancaire"
                value={formData.referenceBancaire}
                onChange={(e) => setFormData({ ...formData, referenceBancaire: e.target.value })}
                placeholder="Numéro de transaction, chèque, etc."
              />

              <TextField
                fullWidth
                type="number"
                required
                label="Ordre de Paiement (ID)"
                value={formData.ordrePaiementId}
                onChange={(e) => setFormData({ ...formData, ordrePaiementId: e.target.value })}
                helperText="ID de l'ordre de paiement associé"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              />

              {selectedPaiement && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Pièces jointes
                  </Typography>
                  <FileUpload
                    typeEntite="PAIEMENT"
                    entiteId={selectedPaiement.id}
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
              {selectedPaiement ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default PaiementsPage
