import { useState, useEffect } from 'react'
import {
  Stack,
  TextField,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Autocomplete,
  LinearProgress,
} from '@mui/material'
import { Add, Delete, Edit, Save, Cancel, CheckCircle, Warning } from '@mui/icons-material'
import { MarcheFormData, MarcheImputation } from '../MarcheWizard'
import { conventionsAPI } from '../../../lib/api'
import colors from '../../../theme/colors'

interface Step3Props {
  formData: MarcheFormData
  setFormData: React.Dispatch<React.SetStateAction<MarcheFormData>>
}

interface Convention {
  id: number
  code: string
  libelle: string
}

const Step3Imputations = ({ formData, setFormData }: Step3Props) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)

  const [currentImputation, setCurrentImputation] = useState<MarcheImputation>({
    conventionId: 0,
    axeCode: '',
    projetCode: '',
    voletCode: '',
    montant: 0,
  })

  useEffect(() => {
    loadConventions()
  }, [])

  const loadConventions = async () => {
    try {
      const response = await conventionsAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : response.data?.data || []
      setConventions(data)
    } catch (error) {
      console.error('Erreur chargement conventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    if (currentImputation.conventionId === 0 || currentImputation.montant <= 0) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      imputations: [...prev.imputations, currentImputation],
    }))

    setCurrentImputation({
      conventionId: 0,
      axeCode: '',
      projetCode: '',
      voletCode: '',
      montant: 0,
    })
    setIsAdding(false)
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setCurrentImputation(formData.imputations[index])
    setIsAdding(true)
  }

  const handleUpdate = () => {
    if (editingIndex === null) return

    const newImputations = [...formData.imputations]
    newImputations[editingIndex] = currentImputation

    setFormData((prev) => ({
      ...prev,
      imputations: newImputations,
    }))

    setCurrentImputation({
      conventionId: 0,
      axeCode: '',
      projetCode: '',
      voletCode: '',
      montant: 0,
    })
    setIsAdding(false)
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    const newImputations = formData.imputations.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      imputations: newImputations,
    }))
  }

  const handleCancel = () => {
    setCurrentImputation({
      conventionId: 0,
      axeCode: '',
      projetCode: '',
      voletCode: '',
      montant: 0,
    })
    setIsAdding(false)
    setEditingIndex(null)
  }

  const totalImputations = formData.imputations.reduce((sum, imp) => sum + imp.montant, 0)
  const montantRestant = formData.montantTTC - totalImputations
  const pourcentageImpute = formData.montantTTC > 0 ? (totalImputations / formData.montantTTC) * 100 : 0
  const isComplete = Math.abs(montantRestant) < 0.01

  // Suggestion de montant = montant restant
  const suggestedAmount = montantRestant > 0 ? montantRestant : 0

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom color="primary">
          Imputations Analytiques
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ventilation du montant du marché selon les dimensions analytiques (Convention, Axe, Projet, Volet)
        </Typography>
      </Box>

      {/* Statut Imputation */}
      <Paper sx={{ p: 3, bgcolor: isComplete ? colors.success[50] : colors.warning[50] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {isComplete ? (
            <CheckCircle sx={{ color: colors.success[600], fontSize: 32 }} />
          ) : (
            <Warning sx={{ color: colors.warning[600], fontSize: 32 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Progression de l'Imputation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isComplete
                ? 'Imputation complète ✓'
                : `Montant restant à imputer: ${montantRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`}
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(pourcentageImpute, 100)}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: colors.gray[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              bgcolor: isComplete ? colors.success[600] : colors.warning[600],
            },
          }}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Montant Marché TTC</Typography>
            <Typography variant="h6" fontWeight={600}>
              {formData.montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Total Imputé</Typography>
            <Typography variant="h6" fontWeight={600} color={colors.primary[600]}>
              {totalImputations.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Reste à Imputer</Typography>
            <Typography variant="h6" fontWeight={600} color={isComplete ? colors.success[600] : colors.warning[600]}>
              {montantRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bouton Ajouter */}
      {!isAdding && (
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => {
            setIsAdding(true)
            // Suggestion de montant = montant restant
            if (suggestedAmount > 0) {
              setCurrentImputation((prev) => ({ ...prev, montant: suggestedAmount }))
            }
          }}
          sx={{ alignSelf: 'flex-start' }}
        >
          Ajouter une Imputation
        </Button>
      )}

      {/* Formulaire Ajout/Edition */}
      {isAdding && (
        <Paper sx={{ p: 3, bgcolor: colors.primary[50] }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            {editingIndex !== null ? 'Modifier l\'imputation' : 'Nouvelle imputation analytique'}
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Autocomplete
              options={conventions}
              getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
              value={conventions.find((c) => c.id === currentImputation.conventionId) || null}
              onChange={(_, newValue) => {
                setCurrentImputation({ ...currentImputation, conventionId: newValue?.id || 0 })
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Convention"
                  placeholder="Sélectionnez une convention"
                  required
                  size="small"
                />
              )}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <TextField
                label="Axe"
                value={currentImputation.axeCode}
                onChange={(e) => setCurrentImputation({ ...currentImputation, axeCode: e.target.value })}
                placeholder="AXE-001"
                size="small"
                helperText="Optionnel"
              />
              <TextField
                label="Projet"
                value={currentImputation.projetCode}
                onChange={(e) => setCurrentImputation({ ...currentImputation, projetCode: e.target.value })}
                placeholder="PROJ-001"
                size="small"
                helperText="Optionnel"
              />
              <TextField
                label="Volet"
                value={currentImputation.voletCode}
                onChange={(e) => setCurrentImputation({ ...currentImputation, voletCode: e.target.value })}
                placeholder="VOL-001"
                size="small"
                helperText="Optionnel"
              />
            </Box>
            <TextField
              label="Montant"
              type="number"
              value={currentImputation.montant}
              onChange={(e) => setCurrentImputation({ ...currentImputation, montant: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
              helperText={suggestedAmount > 0 && editingIndex === null ? `Suggestion: ${suggestedAmount.toFixed(2)} DH (montant restant)` : ''}
              size="small"
              required
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={editingIndex !== null ? handleUpdate : handleAdd}
              >
                {editingIndex !== null ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Table des imputations */}
      {formData.imputations.length === 0 ? (
        <Alert severity="info">
          Aucune imputation ajoutée. Cliquez sur "Ajouter une Imputation" pour commencer.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.primary[50] }}>
                <TableCell width="30%"><strong>Convention</strong></TableCell>
                <TableCell width="15%"><strong>Axe</strong></TableCell>
                <TableCell width="15%"><strong>Projet</strong></TableCell>
                <TableCell width="15%"><strong>Volet</strong></TableCell>
                <TableCell width="15%" align="right"><strong>Montant (DH)</strong></TableCell>
                <TableCell width="10%" align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.imputations.map((imp, index) => {
                const convention = conventions.find((c) => c.id === imp.conventionId)
                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      {convention ? `${convention.code} - ${convention.libelle}` : `ID: ${imp.conventionId}`}
                    </TableCell>
                    <TableCell>{imp.axeCode || '-'}</TableCell>
                    <TableCell>{imp.projetCode || '-'}</TableCell>
                    <TableCell>{imp.voletCode || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {imp.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(index)}
                        disabled={isAdding}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(index)}
                        disabled={isAdding}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Validation finale */}
      {formData.imputations.length > 0 && !isComplete && (
        <Alert severity="warning">
          <strong>Attention:</strong> Le montant total des imputations ({totalImputations.toFixed(2)} DH) ne correspond pas au montant TTC du marché ({formData.montantTTC.toFixed(2)} DH).
          <br />
          Vous devez imputer exactement le montant du marché avant de pouvoir continuer.
        </Alert>
      )}
    </Stack>
  )
}

export default Step3Imputations
