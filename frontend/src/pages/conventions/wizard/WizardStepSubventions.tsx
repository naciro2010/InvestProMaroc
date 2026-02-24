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
import { colors, typography, componentStyles } from '@/lib/designSystem'
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
        <Typography variant="h6" gutterBottom sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
          Subventions
        </Typography>
        <Divider />
      </Box>

      <Alert severity="info">
        Enregistrer les subventions obtenues ou prévues pour cette convention.
      </Alert>

      {/* Add subvention form */}
      <Card sx={{ ...componentStyles.card, p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold, mb: 2, color: colors.textPrimary }}>
          Ajouter une subvention
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
            gap: 1.5,
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
            sx={{ ...componentStyles.buttonPrimary, height: 40 }}
          >
            Ajouter
          </Button>
        </Box>
      </Card>

      {/* Subventions table */}
      {formData.subventions.length > 0 && (
        <TableContainer component={Paper} sx={componentStyles.table.container}>
          <Table size="small">
            <TableHead>
              <TableRow sx={componentStyles.table.header}>
                <TableCell sx={componentStyles.table.headerCell}>Organisme</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Montant</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>%</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Date obtention</TableCell>
                <TableCell align="center" sx={{ ...componentStyles.table.headerCell, width: 80 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.subventions.map((s, idx) => (
                <TableRow key={idx} sx={componentStyles.table.row}>
                  <TableCell sx={componentStyles.table.cell}>{s.organisme}</TableCell>
                  <TableCell align="right" sx={componentStyles.table.cell}>{formatCurrency(s.montant)}</TableCell>
                  <TableCell align="right" sx={componentStyles.table.cell}>{s.pourcentage.toFixed(2)}%</TableCell>
                  <TableCell align="right" sx={componentStyles.table.cell}>
                    {new Date(s.dateObtention).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="center" sx={componentStyles.table.cell}>
                    <IconButton size="small" onClick={() => handleDeleteSubvention(idx)} sx={{ color: colors.danger[500] }}>
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
        <Card sx={{ ...componentStyles.card, p: 2, bgcolor: colors.success[25] }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
                Nombre de subventions
              </Typography>
              <Typography variant="h6" sx={{ color: colors.textPrimary }}>{formData.subventions.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
                Total subventions
              </Typography>
              <Typography variant="h6" sx={{ color: colors.success[600] }}>
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
