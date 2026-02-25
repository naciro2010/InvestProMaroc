import React, { useState, useEffect, useRef } from 'react'
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
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  createFilterOptions,
} from '@mui/material'
import type { AutocompleteRenderInputParams, FilterOptionsState } from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { partenairesAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type WizardTotals,
  type Partenaire,
} from './types'

interface PartenaireOption {
  id?: number
  code?: string
  raisonSociale: string
  sigle?: string | null
  inputValue?: string
  isNew?: boolean
}

interface WizardStepPartenairesProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  totals: WizardTotals
}

const filter = createFilterOptions<PartenaireOption>()

const WizardStepPartenaires = ({
  formData,
  setFormData,
  totals,
}: WizardStepPartenairesProps) => {
  const [existingPartenaires, setExistingPartenaires] = useState<PartenaireOption[]>([])
  const [loadingPartenaires, setLoadingPartenaires] = useState(true)
  const [selectedPartenaire, setSelectedPartenaire] = useState<PartenaireOption | null>(null)
  const [newBudget, setNewBudget] = useState(0)
  const [newPourcentage, setNewPourcentage] = useState(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editBudget, setEditBudget] = useState(0)
  const [editPourcentage, setEditPourcentage] = useState(0)

  // Quick-create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newPartenaireNom, setNewPartenaireNom] = useState('')
  const [newPartenaireCode, setNewPartenaireCode] = useState('')
  const [newPartenaireSigle, setNewPartenaireSigle] = useState('')
  const [creatingPartenaire, setCreatingPartenaire] = useState(false)

  const autocompleteRef = useRef<HTMLInputElement>(null)
  const budgetGlobal = formData.budgetGlobal

  // Load existing partenaires from API
  useEffect(() => {
    partenairesAPI.getAllActive()
      .then((res: { data: { data?: unknown[]; [key: string]: unknown } }) => {
        const raw = res.data.data || res.data || []
        const data = Array.isArray(raw) ? raw as Array<{ id: number; code: string; raisonSociale: string; sigle?: string | null }> : []
        setExistingPartenaires(
          data.map((p) => ({
            id: p.id,
            code: p.code,
            raisonSociale: p.raisonSociale,
            sigle: p.sigle,
          }))
        )
      })
      .catch(() => setExistingPartenaires([]))
      .finally(() => setLoadingPartenaires(false))
  }, [])

  // Already used partenaire IDs (prevent duplicates)
  const usedPartenaireIds = formData.partenaires
    .map((p: Partenaire) => p.partenaireId)
    .filter((id): id is number => id !== undefined)

  const availablePartenaires = existingPartenaires.filter(
    (p: PartenaireOption) => !usedPartenaireIds.includes(p.id ?? -1)
  )

  const handleBudgetChange = (value: number) => {
    const pourcentage = budgetGlobal > 0 ? (value / budgetGlobal) * 100 : 0
    setNewBudget(value)
    setNewPourcentage(pourcentage)
  }

  const handlePourcentageChange = (value: number) => {
    const budget = (value / 100) * budgetGlobal
    setNewPourcentage(value)
    setNewBudget(budget)
  }

  const handleAddPartenaire = () => {
    if (!selectedPartenaire || newBudget <= 0) return
    const newP: Partenaire = {
      partenaireId: selectedPartenaire.id,
      designation: selectedPartenaire.sigle
        ? `${selectedPartenaire.sigle} - ${selectedPartenaire.raisonSociale}`
        : selectedPartenaire.raisonSociale,
      budget: newBudget,
      pourcentage: newPourcentage,
    }
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      partenaires: [...prev.partenaires, newP],
    }))
    setSelectedPartenaire(null)
    setNewBudget(0)
    setNewPourcentage(0)
    setTimeout(() => autocompleteRef.current?.focus(), 100)
  }

  const handleDeletePartenaire = (index: number) => {
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      partenaires: prev.partenaires.filter((_: Partenaire, i: number) => i !== index),
    }))
    if (editingIndex === index) setEditingIndex(null)
  }

  const startEdit = (index: number) => {
    const p = formData.partenaires[index]
    setEditingIndex(index)
    setEditBudget(p.budget)
    setEditPourcentage(p.pourcentage)
  }

  const saveEdit = () => {
    if (editingIndex === null) return
    setFormData((prev: ConventionWizardFormData) => ({
      ...prev,
      partenaires: prev.partenaires.map((p: Partenaire, i: number) =>
        i === editingIndex ? { ...p, budget: editBudget, pourcentage: editPourcentage } : p
      ),
    }))
    setEditingIndex(null)
  }

  const handleEditBudgetChange = (value: number) => {
    setEditBudget(value)
    setEditPourcentage(budgetGlobal > 0 ? (value / budgetGlobal) * 100 : 0)
  }

  const handleEditPourcentageChange = (value: number) => {
    setEditPourcentage(value)
    setEditBudget((value / 100) * budgetGlobal)
  }

  // Quick-create a new partenaire
  const handleCreatePartenaire = async () => {
    if (!newPartenaireNom) return
    setCreatingPartenaire(true)
    try {
      const res = await partenairesAPI.create({
        raisonSociale: newPartenaireNom,
        code: newPartenaireCode || `P-${Date.now().toString(36).toUpperCase()}`,
        sigle: newPartenaireSigle || null,
        actif: true,
      })
      const created = res.data.data || res.data
      const newOption: PartenaireOption = {
        id: created.id,
        code: created.code,
        raisonSociale: created.raisonSociale,
        sigle: created.sigle,
      }
      setExistingPartenaires((prev: PartenaireOption[]) => [...prev, newOption])
      setSelectedPartenaire(newOption)
      setCreateDialogOpen(false)
      setNewPartenaireNom('')
      setNewPartenaireCode('')
      setNewPartenaireSigle('')
    } catch {
      // silently handle - user can try again
    } finally {
      setCreatingPartenaire(false)
    }
  }

  const reliquat = budgetGlobal - totals.totalPartenaires
  const allocationPct = budgetGlobal > 0 ? (totals.totalPartenaires / budgetGlobal) * 100 : 0

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
          Allocation aux partenaires
        </Typography>
        <Divider />
      </Box>

      {/* Budget overview bar */}
      <Card sx={{ ...componentStyles.card, p: 2, bgcolor: colors.primary[25], border: `1px solid ${colors.primary[100]}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
            Budget global : {formatCurrency(budgetGlobal)}
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.bold,
            color: reliquat >= 0 ? colors.success[600] : colors.danger[600],
          }}>
            Reliquat : {formatCurrency(reliquat)}
          </Typography>
        </Box>
        {budgetGlobal > 0 && (
          <LinearProgress
            variant="determinate"
            value={Math.min(allocationPct, 100)}
            color={reliquat >= 0 ? 'primary' : 'error'}
            sx={{ height: 6, borderRadius: 1 }}
          />
        )}
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mt: 0.5 }}>
          {allocationPct.toFixed(1)}% alloue ({formData.partenaires.length} partenaire{formData.partenaires.length !== 1 ? 's' : ''})
        </Typography>
      </Card>

      {/* Odoo-style add partenaire form */}
      <Card sx={{ ...componentStyles.card, p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.semibold, mb: 2, color: colors.textPrimary }}>
          Ajouter un partenaire
        </Typography>

        {/* Row 1: Autocomplete with create new option */}
        <Autocomplete<PartenaireOption, false, false, true>
          size="small"
          options={availablePartenaires}
          loading={loadingPartenaires}
          value={selectedPartenaire}
          getOptionLabel={(option: string | PartenaireOption) => {
            if (typeof option === 'string') return option
            if (option.inputValue) return option.inputValue
            return option.sigle
              ? `${option.code} - ${option.sigle} (${option.raisonSociale})`
              : `${option.code} - ${option.raisonSociale}`
          }}
          isOptionEqualToValue={(option: PartenaireOption, value: PartenaireOption) => option.id === value.id}
          filterOptions={(options: PartenaireOption[], params: FilterOptionsState<PartenaireOption>) => {
            const filtered = filter(options, params)
            const { inputValue } = params
            const isExisting = options.some(
              (option: PartenaireOption) =>
                option.raisonSociale.toLowerCase() === inputValue.toLowerCase()
            )
            if (inputValue !== '' && !isExisting) {
              filtered.push({
                inputValue,
                raisonSociale: `Creer "${inputValue}"`,
                isNew: true,
              })
            }
            return filtered
          }}
          onChange={(_event: React.SyntheticEvent, newValue: string | PartenaireOption | null) => {
            if (typeof newValue === 'string') {
              setNewPartenaireNom(newValue)
              setCreateDialogOpen(true)
            } else if (newValue && newValue.isNew) {
              setNewPartenaireNom(newValue.inputValue || '')
              setCreateDialogOpen(true)
            } else {
              setSelectedPartenaire(newValue)
            }
          }}
          renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: PartenaireOption) => {
            if (option.isNew) {
              return (
                <li {...props} key="create-new">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.primary[600] }}>
                    <PersonAddIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>
                      {option.raisonSociale}
                    </Typography>
                  </Box>
                </li>
              )
            }
            return (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />
                  <Box>
                    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                      {option.sigle || option.code}
                    </Typography>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      {option.raisonSociale}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )
          }}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField
              {...params}
              label="Partenaire"
              placeholder="Rechercher un partenaire ou taper un nom pour en creer un..."
              inputRef={autocompleteRef}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingPartenaires ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.textSecondary }}>
              <PersonAddIcon sx={{ fontSize: 16 }} />
              Tapez un nom pour creer un nouveau partenaire
            </Box>
          }
          loadingText="Chargement des partenaires..."
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          sx={{ mb: 2 }}
        />

        {/* Row 2: Budget & percentage */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
          gap: 1.5,
          alignItems: 'flex-start',
        }}>
          <DecimalInput
            size="small"
            label="Budget alloue (MAD)"
            value={newBudget}
            onChange={handleBudgetChange}
            decimalPlaces={2}
            min={0}
            helperText={budgetGlobal > 0 ? 'Auto-calcul du %' : ''}
          />
          <DecimalInput
            size="small"
            label="% du budget"
            value={newPourcentage}
            onChange={handlePourcentageChange}
            decimalPlaces={2}
            min={0}
            max={100}
            helperText={budgetGlobal > 0 ? 'Auto-calcul du budget' : ''}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddPartenaire}
            disabled={!selectedPartenaire || newBudget <= 0}
            sx={{ ...componentStyles.buttonPrimary, height: 40, mt: { xs: 0, md: 0 } }}
          >
            Ajouter
          </Button>
        </Box>
      </Card>

      {/* Partenaires table with inline editing */}
      {formData.partenaires.length > 0 && (
        <TableContainer component={Paper} sx={componentStyles.table.container}>
          <Table size="small">
            <TableHead>
              <TableRow sx={componentStyles.table.header}>
                <TableCell sx={componentStyles.table.headerCell}>Partenaire</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Budget</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>%</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Part relative</TableCell>
                <TableCell align="center" sx={{ ...componentStyles.table.headerCell, width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.partenaires.map((p: Partenaire, idx: number) => {
                const isEditing = editingIndex === idx
                const partRelative = totals.totalPartenaires > 0
                  ? (p.budget / totals.totalPartenaires) * 100
                  : 0

                if (isEditing) {
                  return (
                    <TableRow key={idx} sx={{ bgcolor: colors.warning[25], '&:hover': { bgcolor: colors.warning[25] } }}>
                      <TableCell sx={componentStyles.table.cell}>
                        <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>
                          {p.designation}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <DecimalInput
                          size="small"
                          value={editBudget}
                          onChange={handleEditBudgetChange}
                          decimalPlaces={2}
                          min={0}
                          sx={{ minWidth: 130 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <DecimalInput
                          size="small"
                          value={editPourcentage}
                          onChange={handleEditPourcentageChange}
                          decimalPlaces={2}
                          min={0}
                          max={100}
                          sx={{ minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell />
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={saveEdit} sx={{ color: colors.success[600] }}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditingIndex(null)} sx={{ color: colors.danger[500] }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                }

                return (
                  <TableRow key={idx} sx={componentStyles.table.row}>
                    <TableCell sx={componentStyles.table.cell}>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>
                        {p.designation}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={componentStyles.table.cell}>
                      <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm }}>
                        {formatCurrency(p.budget)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={componentStyles.table.cell}>
                      <Typography sx={{ fontSize: typography.sizes.sm }}>
                        {p.pourcentage.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={componentStyles.table.cell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(partRelative, 100)}
                          sx={{
                            width: 50, height: 4, borderRadius: 2,
                            bgcolor: colors.neutral[100],
                            '& .MuiLinearProgress-bar': { bgcolor: colors.primary[400], borderRadius: 2 },
                          }}
                        />
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, minWidth: 36 }}>
                          {partRelative.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={componentStyles.table.cell}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => startEdit(idx)}>
                          <EditIcon sx={{ fontSize: 16, color: colors.primary[400] }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeletePartenaire(idx)} sx={{ color: colors.danger[500] }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
              {/* Total row */}
              <TableRow sx={{ bgcolor: colors.primary[25], '&:hover': { bgcolor: colors.primary[25] } }}>
                <TableCell sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>
                  {formatCurrency(totals.totalPartenaires)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>
                  {allocationPct.toFixed(2)}%
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>
                  100%
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty state */}
      {formData.partenaires.length === 0 && (
        <Alert severity="info" icon={<BusinessIcon />}>
          Aucun partenaire ajoute. Utilisez le champ de recherche ci-dessus pour selectionner un partenaire existant ou en creer un nouveau.
        </Alert>
      )}

      {/* Summary footer */}
      {formData.partenaires.length > 0 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 1,
          bgcolor: reliquat >= 0 ? colors.success[25] : colors.danger[25],
          border: `1px solid ${reliquat >= 0 ? colors.success[200] : colors.danger[200]}`,
        }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Total alloue
            </Typography>
            <Typography variant="h6" sx={{ color: colors.primary[700] }}>
              {formatCurrency(totals.totalPartenaires)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Reliquat
            </Typography>
            <Typography variant="h6" sx={{ color: reliquat >= 0 ? colors.success[600] : colors.danger[600] }}>
              {formatCurrency(reliquat)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
              Allocation
            </Typography>
            <Typography variant="h6">{allocationPct.toFixed(1)}%</Typography>
          </Box>
        </Box>
      )}

      {reliquat < 0 && (
        <Alert severity="error">
          Le total alloue depasse le budget global de {formatCurrency(Math.abs(reliquat))} !
        </Alert>
      )}

      {/* Quick-create partenaire dialog (Odoo-style) */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon sx={{ color: colors.primary[600] }} />
            Creer un nouveau partenaire
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Raison sociale *"
              value={newPartenaireNom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartenaireNom(e.target.value)}
              autoFocus
              placeholder="Nom complet du partenaire"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Code"
                value={newPartenaireCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartenaireCode(e.target.value)}
                placeholder="Ex: PART-001"
                helperText="Auto-genere si vide"
              />
              <TextField
                fullWidth
                size="small"
                label="Sigle"
                value={newPartenaireSigle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartenaireSigle(e.target.value)}
                placeholder="Ex: MO"
                helperText="Abreviation (optionnel)"
              />
            </Box>
            <Alert severity="info" sx={{ fontSize: typography.sizes.xs }}>
              Le partenaire sera cree et immediatement disponible pour selection. Vous pourrez completer ses informations plus tard depuis la gestion des partenaires.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} size="small" disabled={creatingPartenaire}>
            Annuler
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreatePartenaire}
            disabled={!newPartenaireNom || creatingPartenaire}
            startIcon={creatingPartenaire ? <CircularProgress size={14} /> : <AddIcon />}
            sx={componentStyles.buttonPrimary}
          >
            {creatingPartenaire ? 'Creation...' : 'Creer et selectionner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WizardStepPartenaires
