import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Card,
  Divider,
  Alert,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type WizardTotals,
  type Subvention,
} from './types'

interface WizardStepSubventionsProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  totals: WizardTotals
}

const WizardStepSubventions = ({
  formData,
  setFormData,
  totals,
}: WizardStepSubventionsProps) => {
  const [newSubvention, setNewSubvention] = useState<Subvention>({
    organisme: '',
    montant: 0,
    pourcentage: 0,
    dateObtention: new Date().toISOString().split('T')[0],
  })

  const handleAddSubvention = () => {
    if (newSubvention.organisme && newSubvention.montant > 0) {
      setFormData((prev) => ({
        ...prev,
        subventions: [...prev.subventions, newSubvention],
      }))
      setNewSubvention({
        organisme: '',
        montant: 0,
        pourcentage: 0,
        dateObtention: new Date().toISOString().split('T')[0],
      })
    }
  }

  const handleDeleteSubvention = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subventions: prev.subventions.filter((_, i) => i !== index),
    }))
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          💸 Subventions
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      <Alert severity="info">
        💡 Enregistrer les subventions obtenues ou prévues pour cette convention.
      </Alert>

      {/* Add subvention form */}
      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Ajouter une subvention
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            size="small"
            label="Organisme"
            value={newSubvention.organisme}
            onChange={(e) => setNewSubvention({ ...newSubvention, organisme: e.target.value })}
            placeholder="Nom de l'organisme"
          />
          <DecimalInput
            size="small"
            label="Montant"
            value={newSubvention.montant}
            onChange={(value) =>
              setNewSubvention({
                ...newSubvention,
                montant: value,
              })
            }
            decimalPlaces={2}
            min={0}
          />
          <DecimalInput
            size="small"
            label="%"
            value={newSubvention.pourcentage}
            onChange={(value) =>
              setNewSubvention({
                ...newSubvention,
                pourcentage: value,
              })
            }
            decimalPlaces={2}
            min={0}
            max={100}
          />
          <TextField
            size="small"
            type="date"
            label="Date obtention"
            value={newSubvention.dateObtention}
            onChange={(e) => setNewSubvention({ ...newSubvention, dateObtention: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddSubvention}
            sx={{ height: 40 }}
          >
            Ajouter
          </Button>
        </Box>
      </Card>

      {/* Subventions table */}
      {formData.subventions.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Organisme</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Montant
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  %
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Date obtention
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.subventions.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell>{s.organisme}</TableCell>
                  <TableCell align="right">{formatCurrency(s.montant)}</TableCell>
                  <TableCell align="right">{s.pourcentage.toFixed(2)}%</TableCell>
                  <TableCell align="right">
                    {new Date(s.dateObtention).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleDeleteSubvention(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary */}
      {formData.subventions.length > 0 && (
        <Card sx={{ p: 2, bgcolor: '#f0fdf4' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nombre de subventions
              </Typography>
              <Typography variant="h6">{formData.subventions.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total subventions
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(totals.totalSubventions)}
              </Typography>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  )
}

export default WizardStepSubventions
