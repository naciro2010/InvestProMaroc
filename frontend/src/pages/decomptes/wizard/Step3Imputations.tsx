import { useState, useEffect } from 'react'
import {
  Stack,
  TextField,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Alert,
  LinearProgress,
  Autocomplete,
} from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { DecompteFormData, DecompteImputation } from '../DecompteWizard'
import { projetsAPI } from '../../../lib/api'
import colors from '../../../theme/colors'

interface Step3Props {
  formData: DecompteFormData
  setFormData: React.Dispatch<React.SetStateAction<DecompteFormData>>
}

interface Projet {
  id: number
  code: string
  designation: string
}

const Step3Imputations = ({ formData, setFormData }: Step3Props) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImputation, setCurrentImputation] = useState<DecompteImputation>({
    projetId: undefined,
    axeId: undefined,
    budgetId: undefined,
    montant: 0,
    description: '',
  })

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    try {
      const { data } = await projetsAPI.getAll()
      const projetData = Array.isArray(data.data) ? data.data : data.data?.data || []
      setProjets(projetData)
    } catch (error) {
      console.error('Erreur chargement projets:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalImputations = formData.imputations.reduce((sum, imp) => sum + imp.montant, 0)
  const restantAImputer = formData.netAPayer - totalImputations
  const progressPourcent = formData.netAPayer > 0 ? (totalImputations / formData.netAPayer) * 100 : 0

  const handleAddImputation = () => {
    if (currentImputation.montant <= 0) {
      alert('Le montant doit être supérieur à 0')
      return
    }

    if (!currentImputation.projetId) {
      alert('Veuillez sélectionner un projet')
      return
    }

    if (editingIndex !== null) {
      // Modification
      const updatedImputations = [...formData.imputations]
      updatedImputations[editingIndex] = currentImputation
      setFormData({ ...formData, imputations: updatedImputations })
      setEditingIndex(null)
    } else {
      // Ajout
      setFormData({
        ...formData,
        imputations: [...formData.imputations, currentImputation],
      })
    }

    // Reset form
    setCurrentImputation({
      projetId: undefined,
      axeId: undefined,
      budgetId: undefined,
      montant: 0,
      description: '',
    })
  }

  const handleEditImputation = (index: number) => {
    setCurrentImputation(formData.imputations[index])
    setEditingIndex(index)
  }

  const handleDeleteImputation = (index: number) => {
    const updatedImputations = formData.imputations.filter((_, i) => i !== index)
    setFormData({ ...formData, imputations: updatedImputations })
  }

  const handleAutoComplete = () => {
    if (restantAImputer > 0 && currentImputation.projetId) {
      setCurrentImputation({ ...currentImputation, montant: restantAImputer })
    }
  }

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const getProgressColor = () => {
    if (progressPourcent < 50) return 'error'
    if (progressPourcent < 100) return 'warning'
    return 'success'
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h6" gutterBottom color="primary">
        Imputations Analytiques
      </Typography>

      {/* Résumé de progression */}
      <Paper
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${colors.info[50]} 0%, ${colors.info[100]} 100%)`,
          border: `2px solid ${colors.info[300]}`,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              Net à Payer
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(formData.netAPayer)} DH
            </Typography>
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Progression
              </Typography>
              <Typography variant="body2" fontWeight="bold" color={getProgressColor()}>
                {progressPourcent.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(progressPourcent, 100)}
              color={getProgressColor()}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              Total Imputé
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatCurrency(totalImputations)} DH
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              Restant à Imputer
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={Math.abs(restantAImputer) < 0.01 ? 'success' : 'error'}
            >
              {formatCurrency(restantAImputer)} DH
            </Typography>
          </Stack>

          {Math.abs(restantAImputer) > 0.01 && (
            <Alert severity={restantAImputer > 0 ? 'warning' : 'error'} sx={{ mt: 2 }}>
              {restantAImputer > 0
                ? `Il reste ${formatCurrency(restantAImputer)} DH à imputer`
                : `Vous avez dépassé de ${formatCurrency(Math.abs(restantAImputer))} DH`}
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Formulaire d'ajout d'imputation */}
      <Paper sx={{ p: 3, bgcolor: '#dbeafe', border: '2px dashed #3b82f6' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {editingIndex !== null ? 'Modifier l\'Imputation' : 'Ajouter une Imputation'}
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Autocomplete
            fullWidth
            options={projets}
            getOptionLabel={(option) => `${option.code} - ${option.designation}`}
            value={projets.find((p) => p.id === currentImputation.projetId) || null}
            onChange={(_, newValue) => {
              setCurrentImputation({ ...currentImputation, projetId: newValue?.id })
            }}
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} required label="Projet" placeholder="Sélectionnez un projet" />
            )}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              fullWidth
              required
              type="number"
              label="Montant"
              value={currentImputation.montant || ''}
              onChange={(e) =>
                setCurrentImputation({ ...currentImputation, montant: parseFloat(e.target.value) || 0 })
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                inputProps: { step: '0.01', min: '0' },
              }}
            />
            {restantAImputer > 0 && (
              <Button
                variant="outlined"
                onClick={handleAutoComplete}
                sx={{ whiteSpace: 'nowrap', minWidth: 150 }}
              >
                Compléter ({formatCurrency(restantAImputer)} DH)
              </Button>
            )}
          </Stack>

          <TextField
            fullWidth
            label="Description"
            value={currentImputation.description || ''}
            onChange={(e) => setCurrentImputation({ ...currentImputation, description: e.target.value })}
            placeholder="Description optionnelle de l'imputation"
          />

          <Button
            variant="contained"
            startIcon={editingIndex !== null ? <Edit /> : <Add />}
            onClick={handleAddImputation}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
            }}
          >
            {editingIndex !== null ? 'Modifier' : 'Ajouter'} l'Imputation
          </Button>
        </Stack>
      </Paper>

      {/* Liste des imputations */}
      {formData.imputations.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>
                  <strong>Projet</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Montant</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>% du Total</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.imputations.map((imputation, index) => {
                const projet = projets.find((p) => p.id === imputation.projetId)
                const pourcentage =
                  formData.netAPayer > 0 ? (imputation.montant / formData.netAPayer) * 100 : 0
                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {projet?.code || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {projet?.designation || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{imputation.description || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(imputation.montant)} DH
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{pourcentage.toFixed(1)}%</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleEditImputation(index)}
                        title="Modifier"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteImputation(index)}
                        title="Supprimer"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow sx={{ bgcolor: '#f9fafb', fontWeight: 'bold' }}>
                <TableCell colSpan={2} align="right">
                  <strong>Total Imputé:</strong>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(totalImputations)} DH
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {progressPourcent.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          Aucune imputation ajoutée. Vous devez imputer le net à payer ({formatCurrency(formData.netAPayer)} DH) sur un ou plusieurs projets.
        </Alert>
      )}

      {/* Validation finale */}
      {Math.abs(restantAImputer) < 0.01 && formData.imputations.length > 0 && (
        <Alert severity="success" icon={<span>✓</span>}>
          <strong>Imputations complètes !</strong> Le montant total imputé correspond au net à payer.
          Vous pouvez créer le décompte.
        </Alert>
      )}
    </Stack>
  )
}

export default Step3Imputations
