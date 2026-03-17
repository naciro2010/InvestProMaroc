import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, TextField, Card, Chip, Divider, Alert,
  Button, Autocomplete, CircularProgress, LinearProgress,
  MenuItem, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material'
import {
  Add as AddIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  AutoAwesome as SmartIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { categoriesDepensesAPI } from '@/lib/api'
import type { CategorieDepenseListDTO, ApiResponse } from '@/types/api'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type HandleChangeFunction,
  type WizardTotals,
  type BudgetLigne,
} from './types'
import BudgetLinesTable from './BudgetLinesTable'

// Quick budget presets (Odoo-style)
const BUDGET_PRESETS = [
  { label: '1M', value: 1_000_000 },
  { label: '5M', value: 5_000_000 },
  { label: '10M', value: 10_000_000 },
  { label: '50M', value: 50_000_000 },
  { label: '100M', value: 100_000_000 },
  { label: '500M', value: 500_000_000 },
]

interface CategorieOption extends CategorieDepenseListDTO {
  inputValue?: string
  isNew?: boolean
}

const filterCategories = createFilterOptions<CategorieOption>()

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
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieOption | null>(null)
  const [newLigne, setNewLigne] = useState<BudgetLigne>(emptyLigne(formData.tauxCommission, formData.tauxTvaLignes))
  const categoryRef = useRef<HTMLInputElement>(null)

  // Quick-create category dialog state
  const [createCatDialogOpen, setCreateCatDialogOpen] = useState(false)
  const [newCatLibelle, setNewCatLibelle] = useState('')
  const [newCatCode, setNewCatCode] = useState('')
  const [newCatGroupe, setNewCatGroupe] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const isParCategorie = formData.commissionMode === 'PAR_CATEGORIE'
  const hasLines = formData.lignesBudget.length > 0

  // Load categories on mount
  useEffect(() => {
    categoriesDepensesAPI.getList()
      .then((res: { data: ApiResponse<CategorieDepenseListDTO[]> }) => setCategories(res.data.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false))
  }, [])

  // Handler: propagate TVA change to ALL existing lines + new line form + commission (no stale closures)
  const handleTvaLignesChange = (value: number) => {
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      tauxTvaLignes: value,
      tauxTva: value,
      lignesBudget: prev.lignesBudget.map((l: BudgetLigne) => ({
        ...l,
        tauxTVA: value,
        montantTTC: l.montantHT * (1 + value / 100),
      })),
    }))
    setNewLigne((prev) => ({
      ...prev,
      tauxTVA: value,
      montantTTC: prev.montantHT * (1 + value / 100),
    }))
  }

  // Handler: propagate global tauxCommission to all lines (GLOBAL mode only)
  const handleTauxCommissionChange = (value: number) => {
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      tauxCommission: value,
      lignesBudget: prev.commissionMode === 'GLOBAL'
        ? prev.lignesBudget.map((l: BudgetLigne) => ({ ...l, tauxCommissionLigne: value }))
        : prev.lignesBudget,
    }))
    setNewLigne((prev) => ({ ...prev, tauxCommissionLigne: value }))
  }

  const usedCategoryIds = formData.lignesBudget
    .map((l: BudgetLigne) => l.categorieDepenseId)
    .filter((id): id is number => id !== undefined)

  const availableCategories = categories.filter(
    (cat: CategorieDepenseListDTO) => !usedCategoryIds.includes(cat.id)
  )

  // Quick-create a new category (CAYT)
  const handleCreateCategorie = async () => {
    if (!newCatLibelle) return
    setCreatingCategory(true)
    try {
      const res = await categoriesDepensesAPI.create({
        libelle: newCatLibelle,
        code: newCatCode || `CAT-${Date.now().toString(36).toUpperCase()}`,
        categorie: newCatGroupe || undefined,
        actif: true,
      })
      const created = (res.data as { data?: CategorieDepenseListDTO }).data ?? (res.data as CategorieDepenseListDTO)
      setCategories((prev) => [...prev, created])
      const newOption: CategorieOption = { ...created }
      setSelectedCategorie(newOption)
      setNewLigne((prev) => ({
        ...prev,
        categorieDepenseId: created.id,
        designation: created.libelle,
      }))
      setCreateCatDialogOpen(false)
      setNewCatLibelle('')
      setNewCatCode('')
      setNewCatGroupe('')
    } catch {
      // silently handle - user can try again
    } finally {
      setCreatingCategory(false)
    }
  }

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

  // Budget allocation progress
  const budgetAllocated = totals.totalLignesTTC
  const budgetAllocPct = formData.budgetGlobal > 0 ? (budgetAllocated / formData.budgetGlobal) * 100 : 0

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Budget Global + TVA */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: colors.neutral[25],
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}
          >
            Budget Global
          </Typography>
          {formData.budgetGlobal > 0 && (
            <Chip
              label={formatCurrency(formData.budgetGlobal)}
              size="small"
              sx={{
                bgcolor: colors.primary[600],
                color: colors.surface,
                fontWeight: typography.weights.bold,
              }}
            />
          )}
        </Box>
        <Box sx={{ p: 2.5 }}>
          {/* Quick budget presets */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                mb: 1,
              }}
            >
              Montant rapide (MAD)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {BUDGET_PRESETS.map((preset) => {
                const isActive = formData.budgetGlobal === preset.value
                return (
                  <Chip
                    key={preset.value}
                    label={preset.label}
                    size="small"
                    onClick={() =>
                      setFormData((prev: ConventionWizardFormData) => ({
                        ...prev,
                        budgetGlobal: preset.value,
                      }))
                    }
                    sx={{
                      bgcolor: isActive ? colors.primary[600] : 'transparent',
                      color: isActive ? colors.surface : colors.textPrimary,
                      border: `1px solid ${isActive ? colors.primary[600] : colors.border}`,
                      fontWeight: isActive ? typography.weights.bold : typography.weights.medium,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? colors.primary[700] : colors.primary[25],
                        borderColor: colors.primary[300],
                      },
                    }}
                  />
                )
              })}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

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
              label="Taux TVA (%)"
              value={formData.tauxTvaLignes}
              onChange={handleTvaLignesChange}
              decimalPlaces={2}
              min={0}
              max={100}
              size="small"
              helperText="Applique aux lignes et a la commission"
            />
          </Box>

          {/* Budget allocation progress (shows when lines exist) */}
          {hasLines && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                  Repartition des lignes
                </Typography>
                <Typography
                  sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.semibold,
                    color: budgetAllocPct > 100 ? colors.danger[600] : colors.success[600],
                  }}
                >
                  {budgetAllocPct.toFixed(1)}% alloue
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(budgetAllocPct, 100)}
                color={budgetAllocPct > 100 ? 'error' : 'primary'}
                sx={{ height: 6, borderRadius: 3, bgcolor: colors.neutral[100] }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Commission Configuration */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: colors.neutral[25],
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}
          >
            Configuration de la Commission
          </Typography>
          {totals.commissionTTC > 0 && (
            <Chip
              icon={<SmartIcon sx={{ fontSize: 14 }} />}
              label={`Commission: ${formatCurrency(totals.commissionTTC)}`}
              size="small"
              sx={{
                bgcolor: colors.success[50],
                color: colors.success[700],
                fontWeight: typography.weights.semibold,
                '& .MuiChip-icon': { color: colors.success[500] },
              }}
            />
          )}
        </Box>
        <Box sx={{ p: 2.5 }}>

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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {!isParCategorie && (
            <DecimalInput
              fullWidth
              label="Taux de commission (%)"
              value={formData.tauxCommission}
              onChange={handleTauxCommissionChange}
              decimalPlaces={2} min={0} max={100} size="small"
              sx={{ minWidth: 80 }}
            />
          )}
          <TextField fullWidth select label="Base de calcul" value={formData.baseCalcul} onChange={handleChange('baseCalcul')} size="small">
            <MenuItem value="DECAISSEMENTS_HT">Decaissements HT</MenuItem>
            <MenuItem value="DECAISSEMENTS_TTC">Decaissements TTC</MenuItem>
          </TextField>
        </Box>

        {isParCategorie && !hasLines && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Ajoutez des lignes de budget ci-dessous pour configurer le taux et plafond par categorie.
          </Alert>
        )}
        </Box>
      </Box>

      {/* Lines Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold }}>
            Repartition par Categories de Depenses {isParCategorie ? '*' : '(Optionnel)'}
          </Typography>
          <Chip label={`${formData.lignesBudget.length} ligne(s)`} color="primary" size="small" variant="outlined" />
        </Box>

        {/* Add line form + table in unified Card */}
        <Card sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          {/* Line 1: Category with CAYT (full width) */}
          <Autocomplete<CategorieOption, false, false, true>
            size="small"
            options={availableCategories as CategorieOption[]}
            loading={loadingCategories}
            value={selectedCategorie}
            getOptionLabel={(option: string | CategorieOption) => {
              if (typeof option === 'string') return option
              if (option.inputValue) return option.inputValue
              return `${option.code} - ${option.libelle}`
            }}
            groupBy={(option) => option.isNew ? '' : (option.categorie ?? 'Autre')}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options: CategorieOption[], params: FilterOptionsState<CategorieOption>) => {
              const filtered = filterCategories(options, params)
              const { inputValue } = params
              const isExisting = options.some(
                (opt) => opt.libelle.toLowerCase() === inputValue.toLowerCase()
              )
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  id: -1,
                  code: '',
                  libelle: `Creer "${inputValue}"`,
                  inputValue,
                  isNew: true,
                })
              }
              return filtered
            }}
            onChange={(_event: React.SyntheticEvent, newValue: string | CategorieOption | null) => {
              if (typeof newValue === 'string') {
                setNewCatLibelle(newValue)
                setCreateCatDialogOpen(true)
              } else if (newValue && newValue.isNew) {
                setNewCatLibelle(newValue.inputValue || '')
                setCreateCatDialogOpen(true)
              } else {
                setSelectedCategorie(newValue)
                setNewLigne((prev) => ({
                  ...prev,
                  categorieDepenseId: newValue?.id,
                  designation: newValue ? newValue.libelle : '',
                }))
              }
            }}
            renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: CategorieOption) => {
              if (option.isNew) {
                return (
                  <li {...props} key="create-new-cat">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.primary[600] }}>
                      <AddIcon sx={{ fontSize: 18 }} />
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>
                        {option.libelle}
                      </Typography>
                    </Box>
                  </li>
                )
              }
              return (
                <li {...props} key={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />
                    <Box>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                        {option.code} - {option.libelle}
                      </Typography>
                      {option.categorie && (
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                          {option.categorie}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </li>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categorie de depense"
                placeholder="Rechercher ou creer une categorie..."
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
            noOptionsText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.textSecondary }}>
                <AddIcon sx={{ fontSize: 16 }} />
                Tapez un nom pour creer une nouvelle categorie
              </Box>
            }
            loadingText="Chargement..."
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
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
              onChange={(v) => setNewLigne((prev) => ({ ...prev, montantHT: v, montantTTC: v * (1 + prev.tauxTVA / 100) }))}
              decimalPlaces={2} min={0} sx={{ minWidth: 140 }}
            />
            <DecimalInput size="small" label={`Montant TTC (TVA ${formData.tauxTvaLignes}%)`} value={newLigne.montantHT * (1 + formData.tauxTvaLignes / 100)}
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
        </Box>

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
        </Card>
      </Box>

      {/* Quick-create category dialog (CAYT) */}
      <Dialog open={createCatDialogOpen} onClose={() => setCreateCatDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: colors.primary[600] }} />
            Creer une nouvelle categorie de depense
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Libelle *"
              value={newCatLibelle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatLibelle(e.target.value)}
              autoFocus
              placeholder="Nom de la categorie"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Code"
                value={newCatCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatCode(e.target.value)}
                placeholder="Ex: CAT-001"
                helperText="Auto-genere si vide"
              />
              <TextField
                fullWidth
                size="small"
                label="Groupe/Famille"
                value={newCatGroupe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatGroupe(e.target.value)}
                placeholder="Ex: Travaux"
                helperText="Optionnel"
              />
            </Box>
            <Alert severity="info" sx={{ fontSize: typography.sizes.xs }}>
              La categorie sera creee et immediatement disponible pour selection. Vous pourrez completer ses informations plus tard depuis le parametrage.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateCatDialogOpen(false)} size="small" disabled={creatingCategory}>
            Annuler
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateCategorie}
            disabled={!newCatLibelle || creatingCategory}
            startIcon={creatingCategory ? <CircularProgress size={14} /> : <AddIcon />}
            sx={componentStyles.buttonPrimary}
          >
            {creatingCategory ? 'Creation...' : 'Creer et selectionner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary Card */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `2px solid ${colors.primary[200]}`,
          borderRadius: borders.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: colors.primary[25],
            borderBottom: `1px solid ${colors.primary[200]}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <SmartIcon sx={{ fontSize: 18, color: colors.primary[600] }} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}
          >
            Resume Budget & Commission
          </Typography>
        </Box>
        <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Budget Global</Typography>
            <Typography variant="h6" sx={{ color: colors.primary[700], mt: 0.5 }}>{formatCurrency(formData.budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Mode Commission</Typography>
            <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, mt: 0.5 }}>
              {isParCategorie ? 'Par catégorie' : 'Taux global'} — Base : {formData.baseCalcul === 'DECAISSEMENTS_HT' ? 'Décaissements HT' : 'Décaissements TTC'}
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
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Taux TVA</Typography>
            <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, mt: 0.5 }}>{formData.tauxTvaLignes}%</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>Commission HT</Typography>
            <Typography variant="h6" sx={{ color: colors.info[600], mt: 0.5 }}>{formatCurrency(totals.commissionHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Commission TTC ({formData.tauxTvaLignes}% TVA)
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
        </Box>
      </Box>
    </Box>
  )
}

export default WizardStepBudget
