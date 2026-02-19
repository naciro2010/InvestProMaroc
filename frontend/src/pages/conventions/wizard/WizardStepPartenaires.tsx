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
  LinearProgress,
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

  const budgetGlobal = formData.budgetGlobal

  const handleBudgetChange = (value: number) => {
    const pourcentage = budgetGlobal > 0 ? (value / budgetGlobal) * 100 : 0
    setNewPartenaire({ ...newPartenaire, budget: value, pourcentage })
  }

  const handlePourcentageChange = (value: number) => {
    const budget = (value / 100) * budgetGlobal
    setNewPartenaire({ ...newPartenaire, pourcentage: value, budget })
  }

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

  const reliquat = budgetGlobal - totals.totalPartenaires
  const reliquatAvecNouveau = reliquat - newPartenaire.budget
  const allocationPct = budgetGlobal > 0 ? (totals.totalPartenaires / budgetGlobal) * 100 : 0

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          Allocation aux partenaires
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      <Alert severity="info">
        Ajouter les partenaires et allouer des budgets. Le total ne doit pas dépasser le budget global
        de {formatCurrency(budgetGlobal)}.
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
            label="Budget (MAD)"
            value={newPartenaire.budget}
            onChange={handleBudgetChange}
            decimalPlaces={2}
            min={0}
          />
          <DecimalInput
            size="small"
            label="% du budget"
            value={newPartenaire.pourcentage}
            onChange={handlePourcentageChange}
            decimalPlaces={2}
            min={0}
            max={100}
          />
          <DecimalInput
            size="small"
            label="CI (%)"
            value={newPartenaire.ci}
            onChange={(value) =>
              setNewPartenaire({ ...newPartenaire, ci: value })
            }
            decimalPlaces={2}
            min={0}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddPartenaire}
            disabled={!newPartenaire.designation || newPartenaire.budget <= 0}
            sx={{ height: 40 }}
          >
            Ajouter
          </Button>
        </Box>
        {newPartenaire.budget > 0 && (
          <Typography variant="caption" color={reliquatAvecNouveau >= 0 ? 'text.secondary' : 'error'} sx={{ mt: 1, display: 'block' }}>
            Reliquat après ajout : {formatCurrency(reliquatAvecNouveau)}
          </Typography>
        )}
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Budget global
            </Typography>
            <Typography variant="h6">{formatCurrency(budgetGlobal)}</Typography>
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
              Reliquat
            </Typography>
            <Typography
              variant="h6"
              color={reliquat >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(reliquat)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Allocation
            </Typography>
            <Typography variant="h6">{allocationPct.toFixed(1)}%</Typography>
          </Box>
        </Box>
        {budgetGlobal > 0 && (
          <LinearProgress
            variant="determinate"
            value={Math.min(allocationPct, 100)}
            color={reliquat >= 0 ? 'primary' : 'error'}
            sx={{ mt: 2, height: 8, borderRadius: 1 }}
          />
        )}
        {reliquat < 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Le total alloué dépasse le budget global de {formatCurrency(Math.abs(reliquat))} !
          </Alert>
        )}
      </Card>
    </Box>
  )
}

export default WizardStepPartenaires
