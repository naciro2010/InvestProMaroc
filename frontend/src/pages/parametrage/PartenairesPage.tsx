import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Close,
  Refresh,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import { partenairesAPI } from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

interface Partenaire {
  id: number
  code: string
  raisonSociale: string
  sigle?: string
  typePartenaire?: string
  email?: string
  telephone?: string
  adresse?: string
  description?: string
  actif: boolean
  createdAt?: string
  updatedAt?: string
}

const PartenairesPage = () => {
  const { showToast } = useToast()
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPartenaire, setEditingPartenaire] = useState<Partenaire | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    raisonSociale: '',
    sigle: '',
    typePartenaire: '',
    email: '',
    telephone: '',
    adresse: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPartenaires = partenaires.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.code.toLowerCase().includes(q) ||
      p.raisonSociale.toLowerCase().includes(q) ||
      (p.sigle && p.sigle.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.typePartenaire && p.typePartenaire.toLowerCase().includes(q))
    )
  })

  useEffect(() => {
    loadPartenaires()
  }, [])

  const loadPartenaires = async () => {
    try {
      setLoading(true)
      const response = await partenairesAPI.getAll()
      setPartenaires(response.data.data || response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des partenaires', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (partenaire?: Partenaire) => {
    if (partenaire) {
      setEditingPartenaire(partenaire)
      setFormData({
        code: partenaire.code,
        raisonSociale: partenaire.raisonSociale,
        sigle: partenaire.sigle || '',
        typePartenaire: partenaire.typePartenaire || '',
        email: partenaire.email || '',
        telephone: partenaire.telephone || '',
        adresse: partenaire.adresse || '',
        description: partenaire.description || '',
      })
    } else {
      setEditingPartenaire(null)
      setFormData({
        code: '',
        raisonSociale: '',
        sigle: '',
        typePartenaire: '',
        email: '',
        telephone: '',
        adresse: '',
        description: '',
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingPartenaire(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingPartenaire) {
        await partenairesAPI.update(editingPartenaire.id, formData)
        showToast('Partenaire modifié avec succès', 'success')
      } else {
        await partenairesAPI.create(formData)
        showToast('Partenaire créé avec succès', 'success')
      }
      handleCloseModal()
      loadPartenaires()
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment désactiver ce partenaire ?')) {
      try {
        await partenairesAPI.delete(id)
        showToast('Partenaire désactivé avec succès', 'success')
        loadPartenaires()
      } catch (error) {
        showToast('Erreur lors de la suppression', 'error')
      }
    }
  }

  return (
    <AppLayout>
      <Box>
        <ControlPanel
          breadcrumbs={[
            { label: 'Configuration', path: '/parametrage/conventions' },
            { label: 'Partenaires' },
          ]}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Rechercher par code, raison sociale, sigle..."
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<Refresh />}
                onClick={loadPartenaires} sx={{ textTransform: 'none' }}>
                Actualiser
              </Button>
              <Button variant="contained" size="small" startIcon={<Add />}
                onClick={() => handleOpenModal()} sx={{ textTransform: 'none' }}>
                Nouveau partenaire
              </Button>
            </Box>
          }
        />

        <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredPartenaires.length === 0 ? (
          <Alert severity="info">
            Aucun partenaire. Cliquez sur "Nouveau partenaire" pour en créer un.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Raison sociale</TableCell>
                  <TableCell>Sigle</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPartenaires.map((partenaire) => (
                  <TableRow key={partenaire.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {partenaire.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{partenaire.raisonSociale}</Typography>
                      {partenaire.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {partenaire.description.substring(0, 50)}
                          {partenaire.description.length > 50 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {partenaire.sigle && (
                        <Chip label={partenaire.sigle} size="small" color="secondary" />
                      )}
                    </TableCell>
                    <TableCell>{partenaire.typePartenaire || '-'}</TableCell>
                    <TableCell>
                      <Box>
                        {partenaire.email && (
                          <Typography variant="caption" display="block">
                            📧 {partenaire.email}
                          </Typography>
                        )}
                        {partenaire.telephone && (
                          <Typography variant="caption" display="block">
                            📞 {partenaire.telephone}
                          </Typography>
                        )}
                        {!partenaire.email && !partenaire.telephone && '-'}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={partenaire.actif ? 'Actif' : 'Inactif'}
                        size="small"
                        color={partenaire.actif ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(partenaire)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(partenaire.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal Création/Edition */}
        <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            <IconButton onClick={handleCloseModal} size="small">
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PART-001"
                  required
                  fullWidth
                  helperText="Code unique du partenaire"
                />
                <TextField
                  label="Sigle"
                  value={formData.sigle}
                  onChange={(e) => setFormData({ ...formData, sigle: e.target.value.toUpperCase() })}
                  placeholder="AFD"
                  fullWidth
                  helperText="Acronyme (ex: AFD, BM, MASEN)"
                />
              </Stack>

              <TextField
                label="Raison sociale"
                value={formData.raisonSociale}
                onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                placeholder="Agence Française de Développement"
                required
                fullWidth
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Type de partenaire"
                  value={formData.typePartenaire}
                  onChange={(e) => setFormData({ ...formData, typePartenaire: e.target.value })}
                  placeholder="Ministère"
                  fullWidth
                  helperText="Ex: Ministère, Agence, Bailleur"
                />
                <TextField
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="+212 5XX XX XX XX"
                  fullWidth
                />
              </Stack>

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@partenaire.ma"
                fullWidth
              />

              <TextField
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète..."
                multiline
                rows={2}
                fullWidth
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du partenaire..."
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || !formData.code || !formData.raisonSociale}
              startIcon={saving ? <CircularProgress size={16} /> : null}
            >
              {editingPartenaire ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default PartenairesPage
