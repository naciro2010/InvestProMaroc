import { useState } from 'react'
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
} from '@mui/material'
import { Add, Delete, Edit, Save, Cancel } from '@mui/icons-material'
import { MarcheFormData, MarcheLigne } from '../MarcheWizard'
import colors from '../../../theme/colors'

interface Step2Props {
  formData: MarcheFormData
  setFormData: React.Dispatch<React.SetStateAction<MarcheFormData>>
}

const Step2LignesPrix = ({ formData, setFormData }: Step2Props) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentLigne, setCurrentLigne] = useState<MarcheLigne>({
    numeroPrix: '',
    designation: '',
    quantite: 0,
    puHT: 0,
    total: 0,
  })

  const handleAdd = () => {
    if (!currentLigne.numeroPrix || !currentLigne.designation || currentLigne.quantite <= 0 || currentLigne.puHT <= 0) {
      return
    }

    const total = currentLigne.quantite * currentLigne.puHT
    const newLigne = { ...currentLigne, total }

    setFormData((prev) => ({
      ...prev,
      lignes: [...prev.lignes, newLigne],
      montantHT: calculateTotalHT([...prev.lignes, newLigne]),
    }))

    setCurrentLigne({ numeroPrix: '', designation: '', quantite: 0, puHT: 0, total: 0 })
    setIsAdding(false)
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setCurrentLigne(formData.lignes[index])
    setIsAdding(true)
  }

  const handleUpdate = () => {
    if (editingIndex === null) return

    const total = currentLigne.quantite * currentLigne.puHT
    const updatedLigne = { ...currentLigne, total }

    const newLignes = [...formData.lignes]
    newLignes[editingIndex] = updatedLigne

    setFormData((prev) => ({
      ...prev,
      lignes: newLignes,
      montantHT: calculateTotalHT(newLignes),
    }))

    setCurrentLigne({ numeroPrix: '', designation: '', quantite: 0, puHT: 0, total: 0 })
    setIsAdding(false)
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    const newLignes = formData.lignes.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      lignes: newLignes,
      montantHT: calculateTotalHT(newLignes),
    }))
  }

  const handleCancel = () => {
    setCurrentLigne({ numeroPrix: '', designation: '', quantite: 0, puHT: 0, total: 0 })
    setIsAdding(false)
    setEditingIndex(null)
  }

  const calculateTotalHT = (lignes: MarcheLigne[]): number => {
    return lignes.reduce((sum, ligne) => sum + ligne.total, 0)
  }

  const totalHT = calculateTotalHT(formData.lignes)
  const totalTVA = (totalHT * formData.tauxTVA) / 100
  const totalTTC = totalHT + totalTVA

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom color="primary">
          Lignes de Prix et Détails
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ajoutez les différentes lignes de prix du marché (N°Prix, Désignation, Quantité, PU HT)
        </Typography>
      </Box>

      {/* Bouton Ajouter */}
      {!isAdding && (
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setIsAdding(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Ajouter une Ligne
        </Button>
      )}

      {/* Formulaire Ajout/Edition */}
      {isAdding && (
        <Paper sx={{ p: 3, bgcolor: colors.primary[50] }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            {editingIndex !== null ? 'Modifier la ligne' : 'Nouvelle ligne de prix'}
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 2 }}>
              <TextField
                label="N° Prix"
                value={currentLigne.numeroPrix}
                onChange={(e) => setCurrentLigne({ ...currentLigne, numeroPrix: e.target.value })}
                placeholder="P001"
                size="small"
              />
              <TextField
                label="Désignation"
                value={currentLigne.designation}
                onChange={(e) => setCurrentLigne({ ...currentLigne, designation: e.target.value })}
                placeholder="Description détaillée..."
                size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <TextField
                label="Quantité"
                type="number"
                value={currentLigne.quantite}
                onChange={(e) => setCurrentLigne({ ...currentLigne, quantite: parseFloat(e.target.value) || 0 })}
                size="small"
              />
              <TextField
                label="PU HT"
                type="number"
                value={currentLigne.puHT}
                onChange={(e) => setCurrentLigne({ ...currentLigne, puHT: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                }}
                size="small"
              />
              <TextField
                label="Total"
                value={(currentLigne.quantite * currentLigne.puHT).toFixed(2)}
                disabled
                InputProps={{
                  endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                }}
                size="small"
              />
            </Box>
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

      {/* Table des lignes */}
      {formData.lignes.length === 0 ? (
        <Alert severity="info">
          Aucune ligne de prix ajoutée. Cliquez sur "Ajouter une Ligne" pour commencer.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.primary[50] }}>
                <TableCell width="10%"><strong>N° Prix</strong></TableCell>
                <TableCell width="40%"><strong>Désignation</strong></TableCell>
                <TableCell width="12%" align="right"><strong>Quantité</strong></TableCell>
                <TableCell width="15%" align="right"><strong>PU HT (DH)</strong></TableCell>
                <TableCell width="15%" align="right"><strong>Total (DH)</strong></TableCell>
                <TableCell width="8%" align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.lignes.map((ligne, index) => (
                <TableRow key={index} hover>
                  <TableCell>{ligne.numeroPrix}</TableCell>
                  <TableCell>{ligne.designation}</TableCell>
                  <TableCell align="right">{ligne.quantite.toLocaleString('fr-FR')}</TableCell>
                  <TableCell align="right">{ligne.puHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {ligne.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Récapitulatif */}
      {formData.lignes.length > 0 && (
        <Paper sx={{ p: 3, bgcolor: colors.gray[50] }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Récapitulatif des Montants
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total HT</Typography>
              <Typography variant="h6" fontWeight={600}>
                {totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">TVA ({formData.tauxTVA}%)</Typography>
              <Typography variant="h6" fontWeight={600}>
                {totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total TTC</Typography>
              <Typography variant="h6" fontWeight={600} color={colors.success[600]}>
                {totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Stack>
  )
}

export default Step2LignesPrix
