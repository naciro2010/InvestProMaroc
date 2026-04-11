import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material'
import { conventionsAPI, partenairesAPI, versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography, borders } from '@/lib/designSystem'
import DecimalInput from '@/components/ui/DecimalInput'
import ExpenseCategoryRepartition, { type CategoryAllocation } from './ExpenseCategoryRepartition'
import {
  PartenaireSelector,
  QuickCreatePartenaireDialog,
  BudgetAllocationBanner,
  type PartenaireSimple,
  type PartenaireOption,
} from './partenaire'

// ==================== TYPES ====================

interface ConventionPartenaireEdit {
  id: number
  partenaireId: number
  partenaireNom: string
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques?: string
}

interface AddPartenaireDialogProps {
  open: boolean
  conventionId: number
  conventionBudget?: number
  onClose: () => void
  onSuccess: () => void
  editData?: ConventionPartenaireEdit | null
}

interface FormData {
  partenaireId: number
  budgetAlloue: string
  pourcentage: string
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string
  versementDate: string
  versementMontant: string
  versementVolet: string
  imputationPoste: string
  imputationMontant: string
}

interface ExistingVersement {
  id: number
  partenaireId?: number
  dateVersement: string
  montant: number
  montantPrevu?: number
  volet?: string
  remarques?: string
}

interface ValidationErrors {
  partenaireId?: string
  budgetAlloue?: string
  pourcentage?: string
}

type SyncSource = 'budget' | 'pourcentage' | 'none'

const DEFAULT_FORM: FormData = {
  partenaireId: 0, budgetAlloue: '', pourcentage: '',
  estMaitreOeuvre: false, estMaitreOeuvreDelegue: false, remarques: '',
  versementDate: '', versementMontant: '', versementVolet: '',
  imputationPoste: '', imputationMontant: '',
}

// ==================== MAIN COMPONENT ====================

export default function AddPartenaireDialog({
  open, conventionId, conventionBudget, onClose, onSuccess, editData,
}: AddPartenaireDialogProps): React.ReactElement {
  const isEditMode = Boolean(editData)
  const [partenaires, setPartenaires] = useState<PartenaireSimple[]>([])
  const [selectedPartenaire, setSelectedPartenaire] = useState<PartenaireOption | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPartenaires, setLoadingPartenaires] = useState(true)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM)
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryAllocation[]>([])
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [quickCreateName, setQuickCreateName] = useState('')
  const [existingVersements, setExistingVersements] = useState<ExistingVersement[]>([])
  const syncSourceRef = useRef<SyncSource>('none')

  // Load edit data
  useEffect(() => {
    if (open && editData) {
      setFormData({
        ...DEFAULT_FORM,
        partenaireId: editData.partenaireId,
        budgetAlloue: editData.budgetAlloue.toString(),
        pourcentage: editData.pourcentage.toString(),
        estMaitreOeuvre: editData.estMaitreOeuvre,
        estMaitreOeuvreDelegue: editData.estMaitreOeuvreDelegue,
        remarques: editData.remarques || '',
      })
      // Load existing versements for this partenaire
      loadExistingVersements(editData.partenaireId)
    }
  }, [open, editData])

  useEffect(() => {
    if (open) fetchPartenaires()
  }, [open])

  const loadExistingVersements = async (partenaireId: number) => {
    try {
      const res = await versementsPrevisionnelsAPI.getByConvention(conventionId)
      const allVersements: ExistingVersement[] = res.data.data || res.data || []
      const filtered = allVersements.filter(v => v.partenaireId === partenaireId)
      setExistingVersements(filtered)
      // Pre-fill first versement if exists
      if (filtered.length > 0) {
        const first = filtered[0]
        setFormData((prev: FormData) => ({
          ...prev,
          versementDate: first.dateVersement?.split('T')[0] || '',
          versementMontant: (first.montantPrevu || first.montant || 0).toString(),
          versementVolet: first.volet || '',
        }))
      }
    } catch {
      setExistingVersements([])
    }
  }

  const fetchPartenaires = async () => {
    try {
      setLoadingPartenaires(true)
      const response = await partenairesAPI.getAllActive()
      setPartenaires(response.data.data as PartenaireSimple[])
    } catch { setError('Erreur lors du chargement des partenaires') }
    finally { setLoadingPartenaires(false) }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    if (formData.partenaireId === 0 && !isEditMode) errors.partenaireId = 'Veuillez selectionner un partenaire'
    const budget = parseFloat(formData.budgetAlloue)
    if (!formData.budgetAlloue || isNaN(budget)) errors.budgetAlloue = 'Le budget est obligatoire'
    else if (budget < 0) errors.budgetAlloue = 'Le budget doit etre positif'
    const pct = parseFloat(formData.pourcentage)
    if (!formData.pourcentage || isNaN(pct)) errors.pourcentage = 'Le pourcentage est obligatoire'
    else if (pct < 0 || pct > 100) errors.pourcentage = 'Le pourcentage doit etre entre 0 et 100'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        budgetAlloue: parseFloat(formData.budgetAlloue),
        pourcentage: parseFloat(formData.pourcentage),
        estMaitreOeuvre: formData.estMaitreOeuvre,
        estMaitreOeuvreDelegue: formData.estMaitreOeuvreDelegue,
        remarques: formData.remarques || undefined,
      }

      if (isEditMode && editData) {
        // Update partenaire
        await conventionsAPI.updatePartenaire(conventionId, editData.id, payload)

        // Handle versement update/create
        const versementMontant = parseFloat(formData.versementMontant)
        if (formData.versementDate && !isNaN(versementMontant) && versementMontant > 0) {
          if (existingVersements.length > 0) {
            // Update existing versement
            await versementsPrevisionnelsAPI.update(existingVersements[0].id, {
              partenaireId: editData.partenaireId,
              dateVersement: formData.versementDate,
              montant: versementMontant,
              montantPrevu: versementMontant,
              volet: formData.versementVolet || null,
            })
          } else {
            // Create new versement
            await versementsPrevisionnelsAPI.create(conventionId, {
              partenaireId: editData.partenaireId,
              dateVersement: formData.versementDate,
              montant: versementMontant,
              montantPrevu: versementMontant,
              volet: formData.versementVolet || null,
            })
          }
        }
      } else {
        // Create new partenaire
        const response = await conventionsAPI.addPartenaire(conventionId, { partenaireId: formData.partenaireId, ...payload })
        const newPartenaireId = formData.partenaireId

        // Create versement if provided
        const versementMontant = parseFloat(formData.versementMontant)
        if (formData.versementDate && !isNaN(versementMontant) && versementMontant > 0) {
          try {
            await versementsPrevisionnelsAPI.create(conventionId, {
              partenaireId: newPartenaireId,
              dateVersement: formData.versementDate,
              montant: versementMontant,
              montantPrevu: versementMontant,
              volet: formData.versementVolet || null,
            })
          } catch { /* versement optional - silently handle */ }
        }

        // Create imputation if provided
        const imputationMontant = parseFloat(formData.imputationMontant)
        if (formData.imputationPoste && !isNaN(imputationMontant) && imputationMontant > 0) {
          try {
            await conventionsAPI.ajouterImputation(conventionId, {
              volet: formData.imputationPoste,
              montantPrevu: imputationMontant,
              dateDemarrage: new Date().toISOString().split('T')[0],
              delaiMois: 12,
              remarques: formData.remarques || undefined,
            })
          } catch { /* imputation optional */ }
        }

        void response // Avoid unused variable warning
      }
      onSuccess()
      handleClose()
    } catch (err: unknown) {
      // Extract meaningful error message from API response
      let errorMessage = 'Erreur lors de l\'operation'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } }
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message
        } else if (axiosErr.response?.status === 400) {
          errorMessage = 'Donnees invalides. Verifiez les champs obligatoires.'
        } else if (axiosErr.response?.status === 409) {
          errorMessage = 'Ce partenaire est deja associe a cette convention.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally { setLoading(false) }
  }

  const handleClose = () => {
    setFormData(DEFAULT_FORM)
    setSelectedPartenaire(null)
    setValidationErrors({})
    setError('')
    setCategoryAllocations([])
    setExistingVersements([])
    syncSourceRef.current = 'none'
    onClose()
  }

  const handleBudgetChange = (value: string) => {
    syncSourceRef.current = 'budget'
    const newForm: FormData = { ...formData, budgetAlloue: value }
    if (conventionBudget && conventionBudget > 0) {
      const budgetNum = parseFloat(value)
      if (!isNaN(budgetNum) && budgetNum >= 0) newForm.pourcentage = ((budgetNum / conventionBudget) * 100).toFixed(2)
    }
    setFormData(newForm)
    setValidationErrors((prev: ValidationErrors) => { const next = { ...prev }; delete next.budgetAlloue; return next })
  }

  const handlePourcentageChange = (value: string) => {
    syncSourceRef.current = 'pourcentage'
    const newForm: FormData = { ...formData, pourcentage: value }
    if (conventionBudget && conventionBudget > 0) {
      const pctNum = parseFloat(value)
      if (!isNaN(pctNum) && pctNum >= 0) newForm.budgetAlloue = ((pctNum / 100) * conventionBudget).toFixed(2)
    }
    setFormData(newForm)
    setValidationErrors((prev: ValidationErrors) => { const next = { ...prev }; delete next.pourcentage; return next })
  }

  const handleFieldChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }))
  }

  const budgetNum = parseFloat(formData.budgetAlloue) || 0
  const hasBudgetInfo = conventionBudget !== undefined && conventionBudget > 0

  const sectionTitleSx = {
    fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
    color: colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em',
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { m: { xs: 1, sm: 2 }, maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' } } }}>
        <DialogTitle sx={{ pb: 1, fontSize: typography.sizes.lg }}>
          {isEditMode ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
        </DialogTitle>

        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {loadingPartenaires && !isEditMode ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5 }}>
              {hasBudgetInfo && <BudgetAllocationBanner conventionBudget={conventionBudget} allocatedBudget={budgetNum} />}

              <Typography sx={sectionTitleSx}>Partenaire</Typography>
              {isEditMode ? (
                <TextField fullWidth size="small" label="Partenaire" value={editData?.partenaireNom || ''} disabled helperText="Le partenaire ne peut pas etre modifie" />
              ) : (
                <PartenaireSelector
                  partenaires={partenaires} selectedPartenaire={selectedPartenaire}
                  loading={loadingPartenaires} error={validationErrors.partenaireId}
                  onSelect={(p) => { setSelectedPartenaire(p); handleFieldChange('partenaireId', p?.id || 0) }}
                  onCreateNew={(name) => { setQuickCreateName(name); setQuickCreateOpen(true) }}
                />
              )}

              {/* Budget & % */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <DecimalInput fullWidth size="small" required label="Budget alloue (MAD)"
                  value={parseFloat(formData.budgetAlloue) || 0}
                  onChange={(value) => handleBudgetChange(value.toString())}
                  decimalPlaces={2} min={0}
                  error={Boolean(validationErrors.budgetAlloue)}
                  helperText={validationErrors.budgetAlloue || (hasBudgetInfo ? 'Auto-calcul du %' : '')} />
                <DecimalInput fullWidth size="small" required label="Pourcentage (%)"
                  value={parseFloat(formData.pourcentage) || 0}
                  onChange={(value) => handlePourcentageChange(value.toString())}
                  decimalPlaces={2} min={0} max={100}
                  error={Boolean(validationErrors.pourcentage)}
                  helperText={validationErrors.pourcentage || (hasBudgetInfo ? 'Auto-calcul du budget' : '')} />
              </Box>

              {/* Roles */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={formData.estMaitreOeuvre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('estMaitreOeuvre', e.target.checked)} />}
                  label={<Typography sx={{ fontSize: typography.sizes.sm }}>Maitre d'oeuvre (MO)</Typography>} />
                <FormControlLabel
                  control={<Checkbox size="small" checked={formData.estMaitreOeuvreDelegue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('estMaitreOeuvreDelegue', e.target.checked)} />}
                  label={<Typography sx={{ fontSize: typography.sizes.sm }}>Maitre d'oeuvre delegue (MOD)</Typography>} />
              </Box>

              <Divider sx={{ borderColor: colors.borderSubtle }} />

              {/* Categories */}
              <Typography sx={sectionTitleSx}>Repartition par categories de depenses</Typography>
              <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.md, overflow: 'hidden' }}>
                <ExpenseCategoryRepartition conventionId={conventionId} allocations={categoryAllocations} onChange={setCategoryAllocations} totalBudget={budgetNum} />
              </Box>

              <Divider sx={{ borderColor: colors.borderSubtle }} />

              {/* Versement */}
              <Typography sx={sectionTitleSx}>
                Versement previsionnel {isEditMode && existingVersements.length > 0 ? `(${existingVersements.length} existant${existingVersements.length > 1 ? 's' : ''})` : '(optionnel)'}
              </Typography>
              {/* Show all existing versements in edit mode */}
              {isEditMode && existingVersements.length > 1 && (
                <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.md, overflow: 'hidden', mb: 1 }}>
                  <Box sx={{ bgcolor: colors.neutral[50], px: 1.5, py: 0.75 }}>
                    <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary }}>
                      Versements existants
                    </Typography>
                  </Box>
                  {existingVersements.map((v, idx) => (
                    <Box
                      key={v.id}
                      onClick={() => {
                        setFormData((prev: FormData) => ({
                          ...prev,
                          versementDate: v.dateVersement?.split('T')[0] || '',
                          versementMontant: (v.montantPrevu || v.montant || 0).toString(),
                          versementVolet: v.volet || '',
                        }))
                      }}
                      sx={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5,
                        px: 1.5, py: 1, cursor: 'pointer',
                        borderTop: idx > 0 ? `1px solid ${colors.borderSubtle}` : 'none',
                        bgcolor: formData.versementDate === (v.dateVersement?.split('T')[0] || '') && formData.versementVolet === (v.volet || '') ? colors.primary[25] : 'transparent',
                        '&:hover': { bgcolor: colors.primary[25] },
                      }}
                    >
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textPrimary }}>
                        {v.dateVersement ? new Date(v.dateVersement).toLocaleDateString('fr-FR') : '-'}
                      </Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, textAlign: 'right' }}>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(v.montantPrevu || v.montant || 0)}
                      </Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {v.volet || '-'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField fullWidth size="small" label="Date versement" type="date" value={formData.versementDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('versementDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                <DecimalInput fullWidth size="small" label="Montant (MAD)" value={parseFloat(formData.versementMontant) || 0}
                  onChange={(value) => handleFieldChange('versementMontant', value.toString())} decimalPlaces={2} min={0} />
                <TextField fullWidth size="small" label="Volet" value={formData.versementVolet}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('versementVolet', e.target.value)} placeholder="Ex: Tranche 1" />
              </Box>

              <Divider sx={{ borderColor: colors.borderSubtle }} />

              {/* Imputation */}
              <Typography sx={sectionTitleSx}>Imputation previsionnelle (optionnel)</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField fullWidth size="small" label="Poste / Compte" value={formData.imputationPoste}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('imputationPoste', e.target.value)} placeholder="Ex: 6141 - Fournitures" />
                <DecimalInput fullWidth size="small" label="Montant (MAD)" value={parseFloat(formData.imputationMontant) || 0}
                  onChange={(value) => handleFieldChange('imputationMontant', value.toString())} decimalPlaces={2} min={0} />
              </Box>

              {/* Remarques */}
              <TextField fullWidth size="small" multiline rows={2} label="Remarques" value={formData.remarques}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('remarques', e.target.value)} placeholder="Notes complementaires (optionnel)" />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading} size="small">Annuler</Button>
          <Button onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); requestAnimationFrame(() => handleSubmit()) }} variant="contained" disabled={loading || (loadingPartenaires && !isEditMode)} size="small">
            {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            {loading ? (isEditMode ? 'Enregistrement...' : 'Ajout en cours...') : (isEditMode ? 'Enregistrer' : 'Ajouter')}
          </Button>
        </DialogActions>
      </Dialog>

      <QuickCreatePartenaireDialog
        open={quickCreateOpen}
        initialName={quickCreateName}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={(newP) => {
          setPartenaires((prev: PartenaireSimple[]) => [...prev, newP])
          setSelectedPartenaire({ ...newP })
          setFormData((prev: FormData) => ({ ...prev, partenaireId: newP.id }))
          setValidationErrors((prev: ValidationErrors) => { const next = { ...prev }; delete next.partenaireId; return next })
        }}
      />
    </>
  )
}
