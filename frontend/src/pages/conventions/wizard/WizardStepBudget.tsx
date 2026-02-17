import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Card,
  Chip,
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
  Autocomplete,
  CircularProgress,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { categoriesDepensesAPI } from '@/lib/api'
import type { CategorieDepenseListDTO, ApiResponse } from '@/types/api'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type WizardTotals,
  type BudgetLigne,
} from './types'

interface WizardStepBudgetProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  totals: WizardTotals
}

const WizardStepBudget = ({
  formData,
  setFormData,
  totals,
}: WizardStepBudgetProps) => {
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieDepenseListDTO | null>(null)
  const [newLigne, setNewLigne] = useState<BudgetLigne>({
    designation: '',
    montantHT: 0,
    tauxTVA: 20,
    montantTTC: 0,
  })

  useEffect(() => {
    categoriesDepensesAPI.getList()
      .then((res: { data: ApiResponse<CategorieDepenseListDTO[]> }) => {
        setCategories(res.data.data ?? [])
      })
      .catch(() => {
        setCategories([])
      })
      .finally(() => {
        setLoadingCategories(false)
      })
  }, [])

  const handleAddLigne = () => {
    if (newLigne.designation && newLigne.montantHT > 0) {
      const montantTTC = newLigne.montantHT * (1 + newLigne.tauxTVA / 100)
      const ligneToAdd: BudgetLigne = { ...newLigne, montantTTC }
      setFormData((prev) => ({
        ...prev,
        lignesBudget: [...prev.lignesBudget, ligneToAdd],
      }))
      setNewLigne({ designation: '', montantHT: 0, tauxTVA: 20, montantTTC: 0 })
      setSelectedCategorie(null)
    }
  }

  const handleDeleteLigne = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lignesBudget: prev.lignesBudget.filter((_, i) => i !== index),
    }))
  }

  const usedCategoryIds = formData.lignesBudget
    .map((l) => l.categorieDepenseId)
    .filter((id): id is number => id !== undefined)

  const availableCategories = categories.filter(
    (cat) => !usedCategoryIds.includes(cat.id)
  )

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          Budget & Montants
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Budget Global */}
      <Card sx={{ p: 2, bgcolor: '#f0f9ff' }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Budget Global (MAD) *
        </Typography>
        <DecimalInput
          fullWidth
          value={formData.budgetGlobal}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              budgetGlobal: value,
            }))
          }}
          decimalPlaces={2}
          min={0}
          size="medium"
          sx={{ bgcolor: 'white' }}
        />
      </Card>

      {/* Détail par lignes (Optionnel) */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Répartition par Catégories de Dépenses (Optionnel)
          </Typography>
          <Chip
            label={`${formData.lignesBudget.length} ligne(s)`}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Add ligne form */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
              gap: 1,
              alignItems: 'flex-end',
            }}
          >
            <Autocomplete
              size="small"
              options={availableCategories}
              loading={loadingCategories}
              value={selectedCategorie}
              getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
              groupBy={(option) => option.categorie ?? 'Autre'}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_event, value) => {
                setSelectedCategorie(value)
                setNewLigne((prev) => ({
                  ...prev,
                  categorieDepenseId: value?.id,
                  designation: value ? value.libelle : '',
                }))
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Catégorie de dépense"
                  placeholder="Sélectionner une catégorie"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCategories ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText="Aucune catégorie disponible"
              loadingText="Chargement..."
            />
            <DecimalInput
              size="small"
              label="Montant HT"
              value={newLigne.montantHT}
              onChange={(montantHT) => {
                const montantTTC = montantHT * (1 + newLigne.tauxTVA / 100)
                setNewLigne({ ...newLigne, montantHT, montantTTC })
              }}
              decimalPlaces={2}
              min={0}
            />
            <DecimalInput
              size="small"
              label="TVA (%)"
              value={newLigne.tauxTVA}
              onChange={(tauxTVA) => {
                const montantTTC = newLigne.montantHT * (1 + tauxTVA / 100)
                setNewLigne({ ...newLigne, tauxTVA, montantTTC })
              }}
              decimalPlaces={2}
              min={0}
              max={100}
            />
            <TextField
              size="small"
              type="number"
              label="Montant TTC"
              value={newLigne.montantTTC.toFixed(2)}
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: '#f5f5f5' }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddLigne}
              disabled={!newLigne.designation || newLigne.montantHT <= 0}
              sx={{ height: 40 }}
            >
              Ajouter
            </Button>
          </Box>
        </Card>

        {/* Lignes table */}
        {formData.lignesBudget.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Montant HT
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    TVA (%)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Montant TTC
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.lignesBudget.map((ligne, idx) => {
                  const cat = categories.find((c) => c.id === ligne.categorieDepenseId)
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        {cat ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={cat.code} size="small" variant="outlined" color="primary" />
                            <span>{cat.libelle}</span>
                          </Box>
                        ) : (
                          ligne.designation
                        )}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(ligne.montantHT)}</TableCell>
                      <TableCell align="right">{ligne.tauxTVA}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(ligne.montantTTC)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleDeleteLigne(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Total des lignes */}
        {formData.lignesBudget.length > 0 && (
          <Card sx={{ p: 2, bgcolor: '#e0f2fe' }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary">
              Total des lignes : {formatCurrency(totals.totalLignesTTC)}
            </Typography>
          </Card>
        )}
      </Box>

      {/* Résumé de la Convention */}
      <Card sx={{ p: 3, bgcolor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
        <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          Résumé de la Convention
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Budget Global</Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>{formatCurrency(formData.budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Taux Commission</Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>{formData.tauxCommission}%</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Commission Estimée</Typography>
            <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>{formatCurrency(totals.commissionEstimee)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Partenaires</Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {formData.partenaires.length} ({((totals.totalPartenaires / formData.budgetGlobal) * 100 || 0).toFixed(1)}%)
            </Typography>
          </Box>
        </Box>
        {formData.lignesBudget.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Différence Budget Global vs Total Lignes
              </Typography>
              <Typography variant="h6" color={totals.differenceGlobalVsLignes >= 0 ? 'success.main' : 'error.main'} sx={{ mt: 0.5 }}>
                {formatCurrency(totals.differenceGlobalVsLignes)}
              </Typography>
              {totals.differenceGlobalVsLignes < 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Le total des lignes dépasse le budget global !
                </Alert>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              Lignes de budget : {formData.lignesBudget.length} ligne(s) | Total : {formatCurrency(totals.totalLignesTTC)}
            </Typography>
          </>
        )}
      </Card>
    </Box>
  )
}

export default WizardStepBudget
