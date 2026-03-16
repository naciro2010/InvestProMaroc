import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
} from '@mui/material'
import type { AutocompleteRenderInputParams } from '@mui/material'
import {
  AddCircleOutline,
  Delete,
  Warning as WarningIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { conventionsAPI, categoriesDepensesAPI } from '@/lib/api'
import { colors, typography, borders } from '@/lib/designSystem'
import DecimalInput from '@/components/ui/DecimalInput'
import type { ConventionBudgetLigneDTO, CategorieDepenseListDTO } from '@/types/api'

/** Single allocation entry for a partner or imputation */
export interface CategoryAllocation {
  categorieDepenseId: number
  categorieDepenseCode: string
  categorieDepenseLibelle: string
  montant: number
}

interface ExpenseCategoryRepartitionProps {
  conventionId: number
  allocations: CategoryAllocation[]
  onChange: (allocations: CategoryAllocation[]) => void
  totalBudget?: number
  readOnly?: boolean
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const thStyle = {
  fontWeight: typography.weights.semibold,
  fontSize: typography.sizes.xs,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

/**
 * ExpenseCategoryRepartition - Micro-component for distributing budget
 * across convention expense categories.
 *
 * Shows the same category list as the convention's budget lines.
 * Allows creating new categories (auto-added to convention with warning).
 */
const ExpenseCategoryRepartition = ({
  conventionId,
  allocations,
  onChange,
  totalBudget = 0,
  readOnly = false,
}: ExpenseCategoryRepartitionProps) => {
  const [budgetLignes, setBudgetLignes] = useState<ConventionBudgetLigneDTO[]>([])
  const [allCategories, setAllCategories] = useState<CategorieDepenseListDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)

  // New category quick-create state
  const [createWarningOpen, setCreateWarningOpen] = useState(false)
  const [pendingCategoryName, setPendingCategoryName] = useState('')
  const [pendingCategoryCode, setPendingCategoryCode] = useState('')
  const [creating, setCreating] = useState(false)

  // Add row state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [newMontant, setNewMontant] = useState<number>(0)

  useEffect(() => {
    loadData()
  }, [conventionId])

  const loadData = async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const [budgetRes, catRes] = await Promise.all([
        conventionsAPI.getBudgetLignes(conventionId).catch(() => ({ data: { data: [] } })),
        categoriesDepensesAPI.getList().catch(() => ({ data: { data: [] } })),
      ])
      const lignes: ConventionBudgetLigneDTO[] = budgetRes.data.data ?? []
      const cats: CategorieDepenseListDTO[] = catRes.data.data ?? []
      setBudgetLignes(lignes)
      setAllCategories(cats)
    } catch {
      setLoadError('Erreur lors du chargement des categories')
    } finally {
      setLoading(false)
    }
  }

  // Categories from convention budget lines (the reference list)
  const conventionCategoryIds = new Set(budgetLignes.map((l: ConventionBudgetLigneDTO) => l.categorieDepenseId))

  // Categories already allocated
  const allocatedIds = new Set(allocations.map((a: CategoryAllocation) => a.categorieDepenseId))

  // Available for adding: convention categories not yet allocated
  const availableCategories = budgetLignes.filter((l: ConventionBudgetLigneDTO) => !allocatedIds.has(l.categorieDepenseId))

  // All categories not in convention (for "create new" flow)
  const _categoriesNotInConvention = allCategories.filter(
    (c: CategorieDepenseListDTO) => !conventionCategoryIds.has(c.id)
  )

  const totalAllocated = allocations.reduce((sum, a) => sum + a.montant, 0)

  const handleRemoveAllocation = (categoryId: number) => {
    onChange(allocations.filter(a => a.categorieDepenseId !== categoryId))
  }

  const handleMontantChange = (categoryId: number, montant: number) => {
    onChange(
      allocations.map(a =>
        a.categorieDepenseId === categoryId ? { ...a, montant } : a
      )
    )
  }

  const handleAddAllocation = () => {
    if (!selectedCategoryId || newMontant <= 0) return

    const budgetLigne = budgetLignes.find((l: ConventionBudgetLigneDTO) => l.categorieDepenseId === selectedCategoryId)
    if (!budgetLigne) return

    const newAllocation: CategoryAllocation = {
      categorieDepenseId: budgetLigne.categorieDepenseId,
      categorieDepenseCode: budgetLigne.categorieDepenseCode,
      categorieDepenseLibelle: budgetLigne.categorieDepenseLibelle,
      montant: newMontant,
    }

    onChange([...allocations, newAllocation])
    setSelectedCategoryId(null)
    setNewMontant(0)
    setShowAddRow(false)
  }

  // Quick-create: user wants a category that doesn't exist in convention
  const handleCreateCategoryConfirm = async () => {
    if (!pendingCategoryName) return
    setCreating(true)
    try {
      // 1. Create the category in the referential
      const code = pendingCategoryCode || `CAT-${Date.now().toString(36).toUpperCase()}`
      const catRes = await categoriesDepensesAPI.create({
        libelle: pendingCategoryName,
        code,
      })
      const newCat = catRes.data.data || catRes.data

      // 2. Add it as a budget line in the convention (default montant = 0)
      await conventionsAPI.addBudgetLigne(conventionId, {
        categorieDepenseId: newCat.id,
        montant: 0,
        designation: pendingCategoryName,
      })

      // 3. Reload data to include the new category
      await loadData()

      // 4. Auto-add to allocations
      const newAllocation: CategoryAllocation = {
        categorieDepenseId: newCat.id,
        categorieDepenseCode: code,
        categorieDepenseLibelle: pendingCategoryName,
        montant: 0,
      }
      onChange([...allocations, newAllocation])

      // Reset
      setCreateWarningOpen(false)
      setPendingCategoryName('')
      setPendingCategoryCode('')
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la creation')
        : 'Erreur lors de la creation'
      setLoadError(errMsg)
      setCreateWarningOpen(false)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    )
  }

  if (loadError) {
    return (
      <Box sx={{ py: 2, px: 1.5 }}>
        <Alert severity="error" onClose={() => setLoadError(null)} sx={{ fontSize: typography.sizes.xs }}>
          {loadError}
        </Alert>
      </Box>
    )
  }

  if (budgetLignes.length === 0 && allocations.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 1 }}>
          Aucune categorie de depenses dans la convention
        </Typography>
        {!readOnly && (
          <Box
            onClick={() => {
              setPendingCategoryName('')
              setPendingCategoryCode('')
              setCreateWarningOpen(true)
            }}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              cursor: 'pointer', py: 0.5, px: 1.5, borderRadius: 1,
              '&:hover': { bgcolor: colors.primary[25] },
            }}
          >
            <AddCircleOutline sx={{ fontSize: 14, color: colors.primary[500] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600], fontWeight: typography.weights.medium }}>
              Creer une categorie
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box>
      {/* Summary bar */}
      {totalBudget > 0 && allocations.length > 0 && (
        <Box sx={{ px: 1.5, py: 1, bgcolor: colors.neutral[25], borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontSize: '11px', color: colors.textSecondary }}>
              Reparti: {formatCurrency(totalAllocated)}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: totalAllocated > totalBudget ? colors.danger[600] : colors.textSecondary }}>
              {totalBudget > 0 ? `${((totalAllocated / totalBudget) * 100).toFixed(1)}%` : ''}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((totalAllocated / totalBudget) * 100, 100)}
            sx={{
              height: 3, borderRadius: borders.radius.full,
              bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': {
                borderRadius: borders.radius.full,
                bgcolor: totalAllocated > totalBudget ? colors.danger[500] : colors.success[500],
              },
            }}
          />
        </Box>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Categorie</TableCell>
              <TableCell align="right" sx={thStyle}>Montant (MAD)</TableCell>
              {!readOnly && <TableCell align="center" sx={{ ...thStyle, width: 50 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {allocations.map(alloc => (
              <TableRow key={alloc.categorieDepenseId} sx={{ '&:hover': { bgcolor: colors.primary[25] } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={alloc.categorieDepenseCode}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '10px', height: 20, color: colors.primary[600], borderColor: colors.primary[200] }}
                    />
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textPrimary }}>
                      {alloc.categorieDepenseLibelle}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ width: 160 }}>
                  {readOnly ? (
                    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                      {formatCurrency(alloc.montant)}
                    </Typography>
                  ) : (
                    <DecimalInput
                      size="small"
                      value={alloc.montant}
                      onChange={(val) => handleMontantChange(alloc.categorieDepenseId, val)}
                      decimalPlaces={2}
                      min={0}
                      sx={{ '& input': { textAlign: 'right', fontSize: typography.sizes.xs, py: 0.5, px: 1 } }}
                    />
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell align="center">
                    <Tooltip title="Retirer">
                      <IconButton size="small" onClick={() => handleRemoveAllocation(alloc.categorieDepenseId)}>
                        <Delete sx={{ fontSize: 14, color: colors.danger[400] }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {/* Add row */}
            {!readOnly && showAddRow && availableCategories.length > 0 && (
              <TableRow sx={{ bgcolor: colors.warning[25] }}>
                <TableCell>
                  <Autocomplete
                    size="small"
                    options={availableCategories}
                    getOptionLabel={(opt: ConventionBudgetLigneDTO) => `${opt.categorieDepenseCode} - ${opt.categorieDepenseLibelle}`}
                    value={availableCategories.find((c: ConventionBudgetLigneDTO) => c.categorieDepenseId === selectedCategoryId) || null}
                    onChange={(_e: React.SyntheticEvent, val: ConventionBudgetLigneDTO | null) => setSelectedCategoryId(val?.categorieDepenseId || null)}
                    renderInput={(params: AutocompleteRenderInputParams) => (
                      <TextField {...params} placeholder="Selectionner une categorie..." size="small"
                        sx={{ '& input': { fontSize: typography.sizes.xs } }} />
                    )}
                    noOptionsText="Toutes les categories sont deja ajoutees"
                    sx={{ minWidth: 200 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ width: 160 }}>
                  <DecimalInput
                    size="small"
                    value={newMontant}
                    onChange={setNewMontant}
                    decimalPlaces={2}
                    min={0}
                    sx={{ '& input': { textAlign: 'right', fontSize: typography.sizes.xs, py: 0.5, px: 1 } }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    <Tooltip title="Confirmer">
                      <IconButton size="small" onClick={handleAddAllocation}
                        disabled={!selectedCategoryId || newMontant <= 0}
                        sx={{ color: colors.success[500] }}>
                        <AddCircleOutline sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Annuler">
                      <IconButton size="small" onClick={() => { setShowAddRow(false); setSelectedCategoryId(null); setNewMontant(0) }}>
                        <Delete sx={{ fontSize: 14, color: colors.neutral[400] }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {/* Add lines */}
            {!readOnly && (
              <TableRow sx={{ '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                    {availableCategories.length > 0 && (
                      <Box
                        onClick={() => setShowAddRow(true)}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.75,
                          cursor: 'pointer', '&:hover': { color: colors.primary[700] },
                        }}
                      >
                        <AddCircleOutline sx={{ fontSize: 14, color: colors.primary[500] }} />
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600], fontWeight: typography.weights.medium }}>
                          Ajouter une categorie
                        </Typography>
                      </Box>
                    )}
                    <Box
                      onClick={() => {
                        setPendingCategoryName('')
                        setPendingCategoryCode('')
                        setCreateWarningOpen(true)
                      }}
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.75,
                        cursor: 'pointer', '&:hover': { color: colors.warning[700] },
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 14, color: colors.warning[500] }} />
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[700], fontWeight: typography.weights.medium }}>
                        Creer une nouvelle categorie
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Warning dialog for creating a new category */}
      <Dialog open={createWarningOpen} onClose={() => setCreateWarningOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: colors.warning[500] }} />
            Creer une nouvelle categorie
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, mt: 1 }}>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, mb: 0.5 }}>
              Attention
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.xs }}>
              Cette categorie sera automatiquement ajoutee a la convention.
              Elle apparaitra dans la repartition budgetaire de la convention.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth size="small"
              label="Libelle de la categorie *"
              value={pendingCategoryName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPendingCategoryName(e.target.value)}
              autoFocus
              placeholder="Ex: Travaux supplementaires"
            />
            <TextField
              fullWidth size="small"
              label="Code"
              value={pendingCategoryCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPendingCategoryCode(e.target.value.toUpperCase())}
              placeholder="Ex: TRAV-SUP"
              helperText="Auto-genere si vide"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateWarningOpen(false)} size="small" disabled={creating}>
            Annuler
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateCategoryConfirm}
            disabled={!pendingCategoryName || creating}
            startIcon={creating ? <CircularProgress size={14} /> : <CategoryIcon />}
            sx={{ bgcolor: colors.warning[600], '&:hover': { bgcolor: colors.warning[700] } }}
          >
            {creating ? 'Creation...' : 'Creer et ajouter a la convention'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExpenseCategoryRepartition
