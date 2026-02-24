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
import { colors, typography, componentStyles } from '@/lib/designSystem'
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
      setNewPartenaire({ designation: '', budget: 0, pourcentage: 0 })
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
        <Typography variant="h6" gutterBottom sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
          Allocation aux partenaires
        </Typography>
        <Divider />
      </Box>

      <Alert severity="info">
        Ajouter les partenaires et allouer des budgets. Le total ne doit pas dépasser le budget global
        de {formatCurrency(budgetGlobal)}.
      </Alert>

      {/* Add partenaire form */}
      <Card sx={{ ...componentStyles.card, p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold, mb: 2, color: colors.textPrimary }}>
          Ajouter un partenaire
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' },
            gap: 1.5,
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
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddPartenaire}
            disabled={!newPartenaire.designation || newPartenaire.budget <= 0}
            sx={{ ...componentStyles.buttonPrimary, height: 40 }}
          >
            Ajouter
          </Button>
        </Box>
        {newPartenaire.budget > 0 && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: reliquatAvecNouveau >= 0 ? colors.textSecondary : colors.danger[600] }}>
            Reliquat après ajout : {formatCurrency(reliquatAvecNouveau)}
          </Typography>
        )}
      </Card>

      {/* Partenaires table */}
      {formData.partenaires.length > 0 && (
        <TableContainer component={Paper} sx={componentStyles.table.container}>
          <Table size="small">
            <TableHead>
              <TableRow sx={componentStyles.table.header}>
                <TableCell sx={componentStyles.table.headerCell}>Partenaire</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Budget</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>%</TableCell>
                <TableCell align="center" sx={{ ...componentStyles.table.headerCell, width: 80 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.partenaires.map((p, idx) => (
                <TableRow key={idx} sx={componentStyles.table.row}>
                  <TableCell sx={componentStyles.table.cell}>{p.designation}</TableCell>
                  <TableCell align="right" sx={componentStyles.table.cell}>{formatCurrency(p.budget)}</TableCell>
                  <TableCell align="right" sx={componentStyles.table.cell}>{p.pourcentage.toFixed(2)}%</TableCell>
                  <TableCell align="center" sx={componentStyles.table.cell}>
                    <IconButton size="small" onClick={() => handleDeletePartenaire(idx)} sx={{ color: colors.danger[500] }}>
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
      <Card sx={{ ...componentStyles.card, p: 2, bgcolor: colors.primary[25] }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Budget global
            </Typography>
            <Typography variant="h6" sx={{ color: colors.textPrimary }}>{formatCurrency(budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Total alloué
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary[700] }}>
              {formatCurrency(totals.totalPartenaires)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Reliquat
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: reliquat >= 0 ? colors.success[600] : colors.danger[600] }}
            >
              {formatCurrency(reliquat)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Allocation
            </Typography>
            <Typography variant="h6" sx={{ color: colors.textPrimary }}>{allocationPct.toFixed(1)}%</Typography>
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
