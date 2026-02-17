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
  type Partenaire,
} from './types'

interface WizardStepPartenairesProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  totals: WizardTotals
}

const WizardStepPartenaires = ({
  formData,
  setFormData,
  totals,
}: WizardStepPartenairesProps) => {
  const [newPartenaire, setNewPartenaire] = useState<Partenaire>({
    designation: '',
    budget: 0,
    pourcentage: 0,
    ci: 0,
  })

  const handleAddPartenaire = () => {
    if (newPartenaire.designation && newPartenaire.budget > 0) {
      setFormData((prev) => ({
        ...prev,
        partenaires: [...prev.partenaires, newPartenaire],
      }))
      setNewPartenaire({ designation: '', budget: 0, pourcentage: 0, ci: 0 })
    }
  }

  const handleDeletePartenaire = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      partenaires: prev.partenaires.filter((_, i) => i !== index),
    }))
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          🤝 Allocation aux partenaires
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      <Alert severity="info">
        💡 Ajouter les partenaires et allouer des budgets. Le total ne doit pas dépasser le budget global.
      </Alert>

      {/* Add partenaire form */}
      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Ajouter un partenaire
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
            label="Nom du partenaire"
            value={newPartenaire.designation}
            onChange={(e) => setNewPartenaire({ ...newPartenaire, designation: e.target.value })}
          />
          <DecimalInput
            size="small"
            label="Budget"
            value={newPartenaire.budget}
            onChange={(value) =>
              setNewPartenaire({
                ...newPartenaire,
                budget: value,
              })
            }
            decimalPlaces={2}
            min={0}
          />
          <DecimalInput
            size="small"
            label="%"
            value={newPartenaire.pourcentage}
            onChange={(value) =>
              setNewPartenaire({
                ...newPartenaire,
                pourcentage: value,
              })
            }
            decimalPlaces={2}
            min={0}
            max={100}
          />
          <DecimalInput
            size="small"
            label="CI (%)"
            value={newPartenaire.ci}
            onChange={(value) =>
              setNewPartenaire({
                ...newPartenaire,
                ci: value,
              })
            }
            decimalPlaces={2}
            min={0}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddPartenaire}
            sx={{ height: 40 }}
          >
            Ajouter
          </Button>
        </Box>
      </Card>

      {/* Partenaires table */}
      {formData.partenaires.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Partenaire</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Budget
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  %
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  CI (%)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.partenaires.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell>{p.designation}</TableCell>
                  <TableCell align="right">{formatCurrency(p.budget)}</TableCell>
                  <TableCell align="right">{p.pourcentage.toFixed(2)}%</TableCell>
                  <TableCell align="right">{p.ci}%</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleDeletePartenaire(idx)}>
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
      <Card sx={{ p: 2, bgcolor: '#f0f9ff' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Budget total
            </Typography>
            <Typography variant="h6">{formatCurrency(formData.budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total alloué
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(totals.totalPartenaires)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Restant
            </Typography>
            <Typography
              variant="h6"
              color={
                formData.budgetGlobal - totals.totalPartenaires >= 0 ? 'success.main' : 'error.main'
              }
            >
              {formatCurrency(formData.budgetGlobal - totals.totalPartenaires)}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default WizardStepPartenaires
