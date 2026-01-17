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
  MenuItem,
  InputAdornment,
  Alert,
  Chip,
} from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { DecompteFormData, DecompteRetenue } from '../DecompteWizard'
import { TypeRetenue } from '../../../types/entities'
import colors from '../../../theme/colors'

interface Step2Props {
  formData: DecompteFormData
  setFormData: React.Dispatch<React.SetStateAction<DecompteFormData>>
}

const TYPES_RETENUE: { value: TypeRetenue; label: string; description: string }[] = [
  { value: 'GARANTIE', label: 'Retenue de Garantie (RG)', description: 'Garantie contractuelle' },
  { value: 'RAS', label: 'Retenue à la Source (RAS)', description: 'Impôt à la source' },
  { value: 'PENALITES', label: 'Pénalités', description: 'Pénalités de retard' },
  { value: 'AVANCES', label: 'Avances', description: 'Remboursement d\'avances' },
]

const Step2Retenues = ({ formData, setFormData }: Step2Props) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentRetenue, setCurrentRetenue] = useState<DecompteRetenue>({
    typeRetenue: 'GARANTIE',
    montant: 0,
    tauxPourcent: 0,
    libelle: '',
  })

  useEffect(() => {
    // Auto-calcul total retenues et net à payer
    const totalRetenues = formData.retenues.reduce((sum, ret) => sum + ret.montant, 0)
    const netAPayer = formData.montantTTC - totalRetenues

    setFormData((prev) => ({
      ...prev,
      totalRetenues,
      netAPayer,
    }))
  }, [formData.retenues, formData.montantTTC])

  const handleAddRetenue = () => {
    if (currentRetenue.montant <= 0) {
      alert('Le montant doit être supérieur à 0')
      return
    }

    if (editingIndex !== null) {
      // Modification
      const updatedRetenues = [...formData.retenues]
      updatedRetenues[editingIndex] = currentRetenue
      setFormData({ ...formData, retenues: updatedRetenues })
      setEditingIndex(null)
    } else {
      // Ajout
      setFormData({
        ...formData,
        retenues: [...formData.retenues, currentRetenue],
      })
    }

    // Reset form
    setCurrentRetenue({
      typeRetenue: 'GARANTIE',
      montant: 0,
      tauxPourcent: 0,
      libelle: '',
    })
  }

  const handleEditRetenue = (index: number) => {
    setCurrentRetenue(formData.retenues[index])
    setEditingIndex(index)
  }

  const handleDeleteRetenue = (index: number) => {
    const updatedRetenues = formData.retenues.filter((_, i) => i !== index)
    setFormData({ ...formData, retenues: updatedRetenues })
  }

  const handleCalculerMontantFromTaux = () => {
    if (currentRetenue.tauxPourcent && currentRetenue.tauxPourcent > 0) {
      const montant = (formData.montantTTC * currentRetenue.tauxPourcent) / 100
      setCurrentRetenue({ ...currentRetenue, montant })
    }
  }

  const getTypeRetenueInfo = (type: TypeRetenue) => {
    return TYPES_RETENUE.find((t) => t.value === type) || TYPES_RETENUE[0]
  }

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h6" gutterBottom color="primary">
        Retenues Détaillées
      </Typography>

      {/* Résumé des montants */}
      <Paper sx={{ p: 3, bgcolor: '#f0f9ff', border: `2px solid ${colors.info[200]}` }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              Montant TTC
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(formData.montantTTC)} DH
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={500} color="error">
              Total Retenues
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="error">
              - {formatCurrency(formData.totalRetenues)} DH
            </Typography>
          </Stack>
          <Box sx={{ borderTop: '2px solid', borderColor: colors.info[300], pt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={700} color="primary">
                Net à Payer
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatCurrency(formData.netAPayer)} DH
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Formulaire d'ajout de retenue */}
      <Paper sx={{ p: 3, bgcolor: '#fef3c7', border: '2px dashed #f59e0b' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {editingIndex !== null ? 'Modifier la Retenue' : 'Ajouter une Retenue'}
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            select
            label="Type de Retenue"
            value={currentRetenue.typeRetenue}
            onChange={(e) =>
              setCurrentRetenue({ ...currentRetenue, typeRetenue: e.target.value as TypeRetenue })
            }
          >
            {TYPES_RETENUE.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {type.label}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {type.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="number"
              label="Taux %"
              value={currentRetenue.tauxPourcent || ''}
              onChange={(e) =>
                setCurrentRetenue({ ...currentRetenue, tauxPourcent: parseFloat(e.target.value) || 0 })
              }
              onBlur={handleCalculerMontantFromTaux}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { step: '0.01', min: '0', max: '100' },
              }}
              helperText="Optionnel - Permet de calculer le montant"
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Montant"
              value={currentRetenue.montant || ''}
              onChange={(e) =>
                setCurrentRetenue({ ...currentRetenue, montant: parseFloat(e.target.value) || 0 })
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                inputProps: { step: '0.01', min: '0' },
              }}
            />
          </Stack>

          <TextField
            fullWidth
            label="Libellé / Description"
            value={currentRetenue.libelle || ''}
            onChange={(e) => setCurrentRetenue({ ...currentRetenue, libelle: e.target.value })}
            placeholder="Description optionnelle de la retenue"
          />

          <Button
            variant="contained"
            startIcon={editingIndex !== null ? <Edit /> : <Add />}
            onClick={handleAddRetenue}
            sx={{
              background: `linear-gradient(135deg, ${colors.success[600]} 0%, ${colors.success[700]} 100%)`,
            }}
          >
            {editingIndex !== null ? 'Modifier' : 'Ajouter'} la Retenue
          </Button>
        </Stack>
      </Paper>

      {/* Liste des retenues */}
      {formData.retenues.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Libellé</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Taux %</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Montant</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.retenues.map((retenue, index) => {
                const typeInfo = getTypeRetenueInfo(retenue.typeRetenue)
                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip label={typeInfo.label} size="small" color="warning" />
                    </TableCell>
                    <TableCell>{retenue.libelle || '-'}</TableCell>
                    <TableCell align="right">
                      {retenue.tauxPourcent ? `${retenue.tauxPourcent}%` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="error">
                        {formatCurrency(retenue.montant)} DH
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleEditRetenue(index)}
                        title="Modifier"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRetenue(index)}
                        title="Supprimer"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow sx={{ bgcolor: '#f9fafb', fontWeight: 'bold' }}>
                <TableCell colSpan={3} align="right">
                  <strong>Total Retenues:</strong>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold" color="error">
                    {formatCurrency(formData.totalRetenues)} DH
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          Aucune retenue ajoutée. Les retenues courantes sont: Retenue de Garantie, RAS, Pénalités,
          Avances.
        </Alert>
      )}
    </Stack>
  )
}

export default Step2Retenues
