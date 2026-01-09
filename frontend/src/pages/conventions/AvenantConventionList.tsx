import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Tooltip,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Send,
  Check,
  Close,
  Visibility,
  History,
} from '@mui/icons-material'
import { avenantConventionsAPI } from '../../lib/api'
import { AvenantConventionResponse, StatutAvenantConvention } from '../../types/avenantConvention'
import AvenantConventionForm from './AvenantConventionForm'

interface AvenantConventionListProps {
  conventionId: number
  conventionData?: any
  canEdit?: boolean // Peut créer/modifier des avenants
  canValidate?: boolean // Peut valider des avenants
}

const AvenantConventionList = ({
  conventionId,
  conventionData,
  canEdit = true,
  canValidate = true,
}: AvenantConventionListProps) => {
  const [avenants, setAvenants] = useState<AvenantConventionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Formulaire
  const [showForm, setShowForm] = useState(false)
  const [avenantToEdit, setAvenantToEdit] = useState<AvenantConventionResponse | undefined>()

  // Modales de workflow
  const [validerDialog, setValiderDialog] = useState<{ open: boolean; avenant?: AvenantConventionResponse }>({ open: false })
  const [rejeterDialog, setRejeterDialog] = useState<{ open: boolean; avenant?: AvenantConventionResponse }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; avenant?: AvenantConventionResponse }>({ open: false })

  // Détails avenant
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; avenant?: AvenantConventionResponse }>({ open: false })

  const [remarquesValidation, setRemarquesValidation] = useState('')
  const [motifRejet, setMotifRejet] = useState('')

  useEffect(() => {
    loadAvenants()
  }, [conventionId])

  const loadAvenants = async () => {
    try {
      setLoading(true)
      const response = await avenantConventionsAPI.getByConvention(conventionId)
      setAvenants(response.data.data || [])
    } catch (err: any) {
      console.error('Erreur chargement avenants:', err)
      setError('Erreur lors du chargement des avenants')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setAvenantToEdit(undefined)
    setShowForm(true)
  }

  const handleEdit = (avenant: AvenantConventionResponse) => {
    setAvenantToEdit(avenant)
    setShowForm(true)
  }

  const handleSave = () => {
    setShowForm(false)
    setAvenantToEdit(undefined)
    loadAvenants()
  }

  const handleCancel = () => {
    setShowForm(false)
    setAvenantToEdit(undefined)
  }

  const handleSoumettre = async (avenant: AvenantConventionResponse) => {
    try {
      await avenantConventionsAPI.soumettre(avenant.id)
      loadAvenants()
    } catch (err: any) {
      console.error('Erreur soumission:', err)
      alert('Erreur lors de la soumission')
    }
  }

  const handleValider = async () => {
    if (!validerDialog.avenant) return

    try {
      await avenantConventionsAPI.valider({
        avenantId: validerDialog.avenant.id,
        remarques: remarquesValidation || undefined,
      })
      setValiderDialog({ open: false })
      setRemarquesValidation('')
      loadAvenants()
    } catch (err: any) {
      console.error('Erreur validation:', err)
      alert('Erreur lors de la validation')
    }
  }

  const handleRejeter = async () => {
    if (!rejeterDialog.avenant || !motifRejet.trim()) {
      alert('Le motif de rejet est obligatoire')
      return
    }

    try {
      await avenantConventionsAPI.rejeter({
        avenantId: rejeterDialog.avenant.id,
        motifRejet,
      })
      setRejeterDialog({ open: false })
      setMotifRejet('')
      loadAvenants()
    } catch (err: any) {
      console.error('Erreur rejet:', err)
      alert('Erreur lors du rejet')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.avenant) return

    try {
      await avenantConventionsAPI.delete(deleteDialog.avenant.id)
      setDeleteDialog({ open: false })
      loadAvenants()
    } catch (err: any) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut: StatutAvenantConvention) => {
    switch (statut) {
      case StatutAvenantConvention.BROUILLON:
        return 'default'
      case StatutAvenantConvention.SOUMIS:
        return 'warning'
      case StatutAvenantConvention.VALIDE:
        return 'success'
      default:
        return 'default'
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  if (showForm) {
    return (
      <AvenantConventionForm
        conventionId={conventionId}
        conventionData={conventionData}
        avenantToEdit={avenantToEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History /> Historique des avenants
        </Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Nouvel avenant
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : avenants.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Aucun avenant pour cette convention
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Avenant</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Objet</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Δ Budget</TableCell>
                <TableCell>Créé par</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avenants.map((avenant) => (
                <TableRow key={avenant.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {avenant.numeroAvenant}
                    </Typography>
                    {avenant.ordreApplication && (
                      <Typography variant="caption" color="text.secondary">
                        Ordre: {avenant.ordreApplication}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>{formatDate(avenant.dateAvenant)}</TableCell>

                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {avenant.objet}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={avenant.statut}
                      color={getStatutColor(avenant.statut)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        avenant.deltaBudget && avenant.deltaBudget > 0 ? 'success.main' :
                        avenant.deltaBudget && avenant.deltaBudget < 0 ? 'error.main' : 'text.primary'
                      }
                    >
                      {formatCurrency(avenant.deltaBudget)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption">
                      {avenant.createdByName || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Détails">
                        <IconButton
                          size="small"
                          onClick={() => setDetailsDialog({ open: true, avenant })}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canEdit && avenant.isEditable && (
                        <>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(avenant)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, avenant })}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {canEdit && avenant.canSoumettre && (
                        <Tooltip title="Soumettre">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSoumettre(avenant)}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canValidate && avenant.canValider && (
                        <>
                          <Tooltip title="Valider">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setValiderDialog({ open: true, avenant })}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Rejeter">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setRejeterDialog({ open: true, avenant })}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Détails */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails de l'avenant</DialogTitle>
        <DialogContent>
          {detailsDialog.avenant && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Numéro
                </Typography>
                <Typography>{detailsDialog.avenant.numeroAvenant}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Objet
                </Typography>
                <Typography>{detailsDialog.avenant.objet}</Typography>
              </Box>

              {detailsDialog.avenant.motif && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Motif
                  </Typography>
                  <Typography>{detailsDialog.avenant.motif}</Typography>
                </Box>
              )}

              {detailsDialog.avenant.detailsModifications && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Détails des modifications
                  </Typography>
                  <Typography>{detailsDialog.avenant.detailsModifications}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Budget avant
                  </Typography>
                  <Typography>{formatCurrency(detailsDialog.avenant.ancienBudget)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Budget après
                  </Typography>
                  <Typography>{formatCurrency(detailsDialog.avenant.nouveauBudget)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Variation
                  </Typography>
                  <Typography
                    color={
                      detailsDialog.avenant.deltaBudget && detailsDialog.avenant.deltaBudget > 0
                        ? 'success.main'
                        : detailsDialog.avenant.deltaBudget && detailsDialog.avenant.deltaBudget < 0
                        ? 'error.main'
                        : 'text.primary'
                    }
                  >
                    {formatCurrency(detailsDialog.avenant.deltaBudget)}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Dates
                </Typography>
                <Typography variant="body2">
                  Créé le: {formatDate(detailsDialog.avenant.createdAt)}
                </Typography>
                {detailsDialog.avenant.dateSoumission && (
                  <Typography variant="body2">
                    Soumis le: {formatDate(detailsDialog.avenant.dateSoumission)}
                  </Typography>
                )}
                {detailsDialog.avenant.dateValidation && (
                  <Typography variant="body2">
                    Validé le: {formatDate(detailsDialog.avenant.dateValidation)}
                  </Typography>
                )}
              </Box>

              {detailsDialog.avenant.remarques && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Remarques
                  </Typography>
                  <Typography>{detailsDialog.avenant.remarques}</Typography>
                </Box>
              )}

              {detailsDialog.avenant.motifRejet && (
                <Alert severity="warning">
                  <Typography variant="subtitle2">Motif de rejet:</Typography>
                  <Typography>{detailsDialog.avenant.motifRejet}</Typography>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false })}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Validation */}
      <Dialog open={validerDialog.open} onClose={() => setValiderDialog({ open: false })}>
        <DialogTitle>Valider l'avenant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir valider l'avenant <strong>{validerDialog.avenant?.numeroAvenant}</strong> ?
            <br />
            Les modifications seront appliquées à la convention.
          </Typography>
          <TextField
            label="Remarques (optionnel)"
            value={remarquesValidation}
            onChange={(e) => setRemarquesValidation(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValiderDialog({ open: false })}>Annuler</Button>
          <Button variant="contained" color="success" onClick={handleValider}>
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={rejeterDialog.open} onClose={() => setRejeterDialog({ open: false })}>
        <DialogTitle>Rejeter l'avenant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Motif du rejet de l'avenant <strong>{rejeterDialog.avenant?.numeroAvenant}</strong>
          </Typography>
          <TextField
            label="Motif de rejet"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            helperText="Le motif est obligatoire"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejeterDialog({ open: false })}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleRejeter} disabled={!motifRejet.trim()}>
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Suppression */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Supprimer l'avenant</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'avenant <strong>{deleteDialog.avenant?.numeroAvenant}</strong> ?
            <br />
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AvenantConventionList
