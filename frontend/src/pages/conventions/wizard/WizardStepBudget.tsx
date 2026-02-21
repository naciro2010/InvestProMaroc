import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, TextField, Card, Chip, Divider, Alert,
  Button, Autocomplete, CircularProgress,
  MenuItem, ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import {
  Add as AddIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { categoriesDepensesAPI } from '@/lib/api'
import type { CategorieDepenseListDTO, ApiResponse } from '@/types/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type HandleChangeFunction,
  type WizardTotals,
  type BudgetLigne,
} from './types'
import BudgetLinesTable from './BudgetLinesTable'

interface WizardStepBudgetProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  handleChange: HandleChangeFunction
  totals: WizardTotals
}

const emptyLigne = (tauxCommission: number, tauxTVA: number): BudgetLigne => ({
  designation: '',
  montantHT: 0,
  tauxTVA,
  montantTTC: 0,
  plafond: 0,
  tauxCommissionLigne: tauxCommission || 2.5,
})

const WizardStepBudget = ({ formData, setFormData, handleChange, totals }: WizardStepBudgetProps) => {
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieDepenseListDTO | null>(null)
  const [newLigne, setNewLigne] = useState<BudgetLigne>(emptyLigne(formData.tauxCommission, formData.tauxTvaLignes))
  const categoryRef = useRef<HTMLInputElement>(null)

  const isParCategorie = formData.commissionMode === 'PAR_CATEGORIE'
  const hasLines = formData.lignesBudget.length > 0

  // Load categories on mount
  useEffect(() => {
    categoriesDepensesAPI.getList()
      .then((res: { data: ApiResponse<CategorieDepenseListDTO[]> }) => setCategories(res.data.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false))
  }, [])

  // Propagate global tauxCommission to all existing lines
  useEffect(() => {
    if (formData.commissionMode === 'GLOBAL' && hasLines) {
      setFormData((prev: ConventionWizardFormData) => ({
        ...prev,
        lignesBudget: prev.lignesBudget.map((l: BudgetLigne) => ({
          ...l,
          tauxCommissionLigne: prev.tauxCommission,
        })),
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tauxCommission])

  // Propagate global tauxTvaLignes to ALL existing lines + new line form
  useEffect(() => {
    const tva = formData.tauxTvaLignes
    // Update new line form
    setNewLigne((prev) => ({
      ...prev,
      tauxTVA: tva,
      montantTTC: prev.montantHT * (1 + tva / 100),
    }))
    // Update all existing lines
    if (hasLines) {
      setFormData((prev: ConventionWizardFormData) => ({
        ...prev,
        lignesBudget: prev.lignesBudget.map((l: BudgetLigne) => ({
          ...l,
          tauxTVA: tva,
          montantTTC: l.montantHT * (1 + tva / 100),
        })),
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tauxTvaLignes])

  const usedCategoryIds = formData.lignesBudget
    .map((l: BudgetLigne) => l.categorieDepenseId)
    .filter((id): id is number => id !== undefined)

  const availableCategories = categories.filter(
    (cat: CategorieDepenseListDTO) => !usedCategoryIds.includes(cat.id)
  )

  const handleAddLigne = () => {
    if (!newLigne.designation || newLigne.montantHT <= 0) return
    const tva = formData.tauxTvaLignes
    const montantTTC = newLigne.montantHT * (1 + tva / 100)
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      lignesBudget: [...prev.lignesBudget, { ...newLigne, tauxTVA: tva, montantTTC }],
    }))
    setNewLigne(emptyLigne(formData.tauxCommission, tva))
    setSelectedCategorie(null)
    setTimeout(() => categoryRef.current?.focus(), 100)
  }

  const handleDeleteLigne = (index: number) => {
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      lignesBudget: prev.lignesBudget.filter((_: BudgetLigne, i: number) => i !== index),
    }))
  }

  const handleUpdateLigne = (index: number, updated: BudgetLigne) => {
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      lignesBudget: prev.lignesBudget.map((l: BudgetLigne, i: number) =>
        i === index ? updated : l
      ),
    }))
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Title */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
          Budget & Commission
        </Typography>
        <Divider />
      </Box>

      {/* Budget Global + TVA */}
      <Card sx={{ ...componentStyles.card, p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold, mb: 2, color: colors.textPrimary }}>
          Budget Global
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <DecimalInput
            fullWidth
            label="Montant (MAD) *"
            value={formData.budgetGlobal}
            onChange={(value) => setFormData((prev: ConventionWizardFormData) => ({ ...prev, budgetGlobal: value }))}
            decimalPlaces={2}
            min={0}
            size="small"
            sx={{ bgcolor: colors.surface }}
          />
          <DecimalInput
            fullWidth
            label="Taux TVA lignes (%)"
            value={formData.tauxTvaLignes}
            onChange={(value) => setFormData((prev: ConventionWizardFormData) => ({ ...prev, tauxTvaLignes: value }))}
            decimalPlaces={2}
            min={0}
            max={100}
            size="small"
            helperText="Applique a toutes les lignes"
          />
        </Box>
      </Card>

      {/* Commission Configuration */}
      <Card sx={{ ...componentStyles.card, p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold, mb: 2 }}>
          Configuration de la Commission
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 1, display: 'block' }}>
            Mode de calcul
            {hasLines && <LockIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle', color: colors.warning[500] }} />}
          </Typography>
          <ToggleButtonGroup
            value={formData.commissionMode}
            exclusive
            onChange={(_e, val: 'GLOBAL' | 'PAR_CATEGORIE' | null) => {
              if (val && !hasLines) setFormData((prev: ConventionWizardFormData) => ({ ...prev, commissionMode: val }))
            }}
            size="small"
            disabled={hasLines}
            sx={{ opacity: hasLines ? 0.6 : 1 }}
          >
            <ToggleButton value="GLOBAL">Taux global (sans plafond)</ToggleButton>
            <ToggleButton value="PAR_CATEGORIE">Par categorie (avec plafond)</ToggleButton>
          </ToggleButtonGroup>
          {hasLines && (
            <Alert severity="info" icon={<InfoIcon fontSize="small" />} sx={{ mt: 1.5, fontSize: typography.sizes.xs }}>
              Pour changer le mode de calcul, veuillez d'abord supprimer toutes les lignes de depenses.
            </Alert>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {!isParCategorie && (
            <DecimalInput
              fullWidth
              label="Taux de commission (%)"
              value={formData.tauxCommission}
              onChange={(value) => setFormData((prev: ConventionWizardFormData) => ({ ...prev, tauxCommission: value }))}
              decimalPlaces={2} min={0} max={100} size="small"
              sx={{ minWidth: 80 }}
            />
          )}
          <TextField fullWidth select label="Base de calcul" value={formData.baseCalcul} onChange={handleChange('baseCalcul')} size="small">
            <MenuItem value="DECAISSEMENTS_HT">Decaissements HT</MenuItem>
            <MenuItem value="DECAISSEMENTS_TTC">Decaissements TTC</MenuItem>
          </TextField>
          <DecimalInput
            fullWidth
            label="Taux TVA commission (%)"
            value={formData.tauxTva}
            onChange={(value) => setFormData((prev: ConventionWizardFormData) => ({ ...prev, tauxTva: value }))}
            decimalPlaces={2} min={0} max={100} size="small"
            sx={{ minWidth: 80 }}
          />
        </Box>

        {isParCategorie && !hasLines && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Ajoutez des lignes de budget ci-dessous pour configurer le taux et plafond par categorie.
          </Alert>
        )}
      </Card>

      {/* Lines Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold }}>
            Repartition par Categories de Depenses {isParCategorie ? '*' : '(Optionnel)'}
          </Typography>
          <Chip label={`${formData.lignesBudget.length} ligne(s)`} color="primary" size="small" variant="outlined" />
        </Box>

        {/* Add line form: 2-line Odoo-style layout */}
        <Card sx={{ ...componentStyles.card, p: 2, mb: 2 }}>
          {/* Line 1: Category (full width) */}
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
                label="Categorie de depense"
                placeholder="Selectionner une categorie..."
                inputRef={categoryRef}
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
            noOptionsText="Aucune categorie disponible"
            loadingText="Chargement..."
            sx={{ mb: 2 }}
          />

          {/* Line 2: Amounts grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: isParCategorie ? '1fr 1fr 1fr 0.6fr' : '1fr 1fr',
            },
            gap: 1.5,
            alignItems: 'flex-start',
          }}>
            <DecimalInput size="small" label="Montant HT" value={newLigne.montantHT}
              onChange={(v) => setNewLigne({ ...newLigne, montantHT: v, montantTTC: v * (1 + formData.tauxTvaLignes / 100) })}
              decimalPlaces={2} min={0} sx={{ minWidth: 140 }}
            />
            <DecimalInput size="small" label={`Montant TTC (TVA ${formData.tauxTvaLignes}%)`} value={newLigne.montantTTC}
              onChange={() => {}} decimalPlaces={2} min={0}
              InputProps={{ readOnly: true }} sx={{ minWidth: 140, bgcolor: colors.neutral[50] }}
            />
            {isParCategorie && (
              <>
                <DecimalInput size="small" label="Plafond" value={newLigne.plafond}
                  onChange={(v) => setNewLigne({ ...newLigne, plafond: v })}
                  decimalPlaces={2} min={0} helperText="0 = sans plafond" sx={{ minWidth: 140 }}
                />
                <DecimalInput size="small" label="Taux (%)" value={newLigne.tauxCommissionLigne}
                  onChange={(v) => setNewLigne({ ...newLigne, tauxCommissionLigne: v })}
                  decimalPlaces={2} min={0} max={100} sx={{ minWidth: 80 }}
                />
              </>
            )}
          </Box>

          {/* Add button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained" size="small" startIcon={<AddIcon />}
              onClick={handleAddLigne}
              disabled={!newLigne.designation || newLigne.montantHT <= 0}
              sx={{ ...componentStyles.buttonPrimary, py: 0.75, px: 2 }}
            >
              Ajouter
            </Button>
          </Box>
        </Card>

        {/* Lines table (extracted micro-component) */}
        {hasLines && (
          <BudgetLinesTable
            lignes={formData.lignesBudget}
            categories={categories}
            isParCategorie={isParCategorie}
            baseCalcul={formData.baseCalcul}
            totals={totals}
            onUpdateLigne={handleUpdateLigne}
            onDeleteLigne={handleDeleteLigne}
          />
        )}
      </Box>

      {/* Summary Card */}
      <Card sx={{ ...componentStyles.card, p: 3, border: `2px solid ${colors.primary[200]}` }}>
        <Typography variant="h6" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700], mb: 2 }}>
          Resume Budget & Commission
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Budget Global</Typography>
            <Typography variant="h6" sx={{ color: colors.primary[700], mt: 0.5 }}>{formatCurrency(formData.budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Mode Commission</Typography>
            <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, mt: 0.5 }}>
              {isParCategorie ? 'Par categorie' : 'Taux global'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              {isParCategorie ? 'Taux par ligne' : 'Taux Commission'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, mt: 0.5 }}>
              {isParCategorie ? 'Variable' : `${formData.tauxCommission}%`}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Commission HT</Typography>
            <Typography variant="h6" sx={{ color: colors.info[600], mt: 0.5 }}>{formatCurrency(totals.commissionHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Commission TTC ({formData.tauxTva}% TVA)
            </Typography>
            <Typography variant="h6" sx={{ color: colors.success[600], mt: 0.5 }}>{formatCurrency(totals.commissionTTC)}</Typography>
          </Box>
        </Box>
        {hasLines && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
                Difference Budget Global vs Total Lignes
              </Typography>
              <Typography variant="h6" sx={{ color: totals.differenceGlobalVsLignes >= 0 ? colors.success[600] : colors.danger[600], mt: 0.5 }}>
                {formatCurrency(totals.differenceGlobalVsLignes)}
              </Typography>
              {totals.differenceGlobalVsLignes < 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Le total des lignes depasse le budget global !
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
