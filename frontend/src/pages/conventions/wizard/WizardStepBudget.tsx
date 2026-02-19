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
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
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
  type HandleChangeFunction,
  type WizardTotals,
  type BudgetLigne,
} from './types'

interface WizardStepBudgetProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  handleChange: HandleChangeFunction
  totals: WizardTotals
}

const WizardStepBudget = ({
  formData,
  setFormData,
  handleChange,
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
    plafond: 0,
    tauxCommissionLigne: formData.tauxCommission || 2.5,
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
      setNewLigne({
        designation: '',
        montantHT: 0,
        tauxTVA: 20,
        montantTTC: 0,
        plafond: 0,
        tauxCommissionLigne: formData.tauxCommission || 2.5,
      })
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

  const isParCategorie = formData.commissionMode === 'PAR_CATEGORIE'

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          Budget & Commission
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
            setFormData((prev) => ({ ...prev, budgetGlobal: value }))
          }}
          decimalPlaces={2}
          min={0}
          size="medium"
          sx={{ bgcolor: 'white' }}
        />
      </Card>

      {/* Commission Configuration */}
      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Configuration de la Commission
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Mode de calcul
          </Typography>
          <ToggleButtonGroup
            value={formData.commissionMode}
            exclusive
            onChange={(_e, val) => {
              if (val) setFormData((prev) => ({ ...prev, commissionMode: val }))
            }}
            size="small"
          >
            <ToggleButton value="GLOBAL">Taux global (sans plafond)</ToggleButton>
            <ToggleButton value="PAR_CATEGORIE">Par catégorie (avec plafond)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {!isParCategorie && (
            <DecimalInput
              fullWidth
              label="Taux de commission (%)"
              value={formData.tauxCommission}
              onChange={(value) => setFormData((prev) => ({ ...prev, tauxCommission: value }))}
              decimalPlaces={2}
              min={0}
              max={100}
              size="small"
            />
          )}
          <TextField
            fullWidth
            select
            label="Base de calcul"
            value={formData.baseCalcul}
            onChange={handleChange('baseCalcul')}
            size="small"
          >
            <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
            <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
          </TextField>
          <DecimalInput
            fullWidth
            label="Taux TVA commission (%)"
            value={formData.tauxTva}
            onChange={(value) => setFormData((prev) => ({ ...prev, tauxTva: value }))}
            decimalPlaces={2}
            min={0}
            max={100}
            size="small"
          />
        </Box>

        {isParCategorie && formData.lignesBudget.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Ajoutez des lignes de budget ci-dessous pour configurer le taux et plafond par catégorie.
          </Alert>
        )}
      </Card>

      {/* Détail par lignes */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Répartition par Catégories de Dépenses {isParCategorie ? '*' : '(Optionnel)'}
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
              gridTemplateColumns: {
                xs: '1fr',
                md: isParCategorie
                  ? '2fr 1fr 0.7fr 1fr 0.8fr 0.8fr auto'
                  : '2fr 1fr 1fr 1fr auto',
              },
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
                  placeholder="Sélectionner"
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
            <DecimalInput
              size="small"
              label="Montant TTC"
              value={newLigne.montantTTC}
              onChange={() => {}}
              decimalPlaces={2}
              min={0}
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: '#f5f5f5' }}
            />
            {isParCategorie && (
              <>
                <DecimalInput
                  size="small"
                  label="Plafond"
                  value={newLigne.plafond}
                  onChange={(plafond) => setNewLigne({ ...newLigne, plafond })}
                  decimalPlaces={2}
                  min={0}
                  helperText="0 = sans plafond"
                />
                <DecimalInput
                  size="small"
                  label="Taux (%)"
                  value={newLigne.tauxCommissionLigne}
                  onChange={(tauxCommissionLigne) => setNewLigne({ ...newLigne, tauxCommissionLigne })}
                  decimalPlaces={2}
                  min={0}
                  max={100}
                />
              </>
            )}
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
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Montant HT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>TVA (%)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Montant TTC</TableCell>
                  {isParCategorie && (
                    <>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Plafond</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Taux (%)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Commission</TableCell>
                    </>
                  )}
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.lignesBudget.map((ligne, idx) => {
                  const cat = categories.find((c) => c.id === ligne.categorieDepenseId)
                  const base = formData.baseCalcul === 'DECAISSEMENTS_HT' ? ligne.montantHT : ligne.montantTTC
                  const assiette = ligne.plafond > 0 ? Math.min(base, ligne.plafond) : base
                  const lineCommission = (assiette * ligne.tauxCommissionLigne) / 100
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
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(ligne.montantTTC)}</TableCell>
                      {isParCategorie && (
                        <>
                          <TableCell align="right">
                            {ligne.plafond > 0 ? formatCurrency(ligne.plafond) : 'Illimité'}
                          </TableCell>
                          <TableCell align="right">{ligne.tauxCommissionLigne}%</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatCurrency(lineCommission)}
                          </TableCell>
                        </>
                      )}
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

      {/* Barre d'info / Résumé */}
      <Card sx={{ p: 3, bgcolor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
        <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          Résumé Budget & Commission
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Budget Global</Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>{formatCurrency(formData.budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Mode Commission</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {isParCategorie ? 'Par catégorie' : 'Taux global'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {isParCategorie ? 'Taux par ligne' : 'Taux Commission'}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {isParCategorie ? 'Variable' : `${formData.tauxCommission}%`}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Commission HT</Typography>
            <Typography variant="h6" color="info.main" sx={{ mt: 0.5 }}>{formatCurrency(totals.commissionHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Commission TTC ({formData.tauxTva}% TVA)
            </Typography>
            <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>{formatCurrency(totals.commissionTTC)}</Typography>
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
          </>
        )}
      </Card>
    </Box>
  )
}

export default WizardStepBudget
