import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Skeleton, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Button,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge, type StatusStep } from '@/components/core'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { useToast } from '@/contexts/ToastContext'
import type { Budget, StatutBudget } from '../../types/entities'

interface ConventionOption { id: number; code: string; objet: string }

interface BudgetFormData {
  version: string
  conventionId: number | undefined
  dateBudget: string
  statut: StatutBudget
  plafondConvention: number
  totalBudget: number
  observations: string
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDE', label: 'Valide' },
  { value: 'REJETE', label: 'Rejete', variant: 'danger' },
  { value: 'ARCHIVE', label: 'Archive' },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString('fr-FR') : '-'

const extractList = <T,>(responseData: unknown): T[] => {
  if (Array.isArray(responseData)) return responseData as T[]
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    const nested = (responseData as { data?: unknown }).data
    if (Array.isArray(nested)) return nested as T[]
  }
  return []
}

const INITIAL_FORM: BudgetFormData = {
  version: '', conventionId: undefined, dateBudget: '',
  statut: 'BROUILLON', plafondConvention: 0, totalBudget: 0, observations: '',
}

const BudgetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<BudgetFormData>(INITIAL_FORM)
  const [conventions, setConventions] = useState<ConventionOption[]>([])

  const loadBudget = useCallback(async (budgetId: number) => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getById(budgetId)
      setBudget(response.data.data || response.data)
    } catch {
      setError('Erreur lors du chargement du budget')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) loadBudget(parseInt(id))
  }, [id, loadBudget])

  const handleToggleEdit = async () => {
    if (!budget) return
    setFormData({
      version: budget.version, conventionId: budget.convention?.id,
      dateBudget: budget.dateBudget, statut: budget.statut,
      plafondConvention: budget.plafondConvention, totalBudget: budget.totalBudget,
      observations: budget.observations || '',
    })
    if (conventions.length === 0) {
      try {
        const res = await conventionsAPI.getAll()
        const list = extractList<ConventionOption>(res.data)
        setConventions(list.map(c => ({ id: c.id, code: c.code, objet: c.objet })))
      } catch { /* conventions stay empty */ }
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await budgetsAPI.update(parseInt(id), { ...formData })
      showSuccess('Budget mis a jour avec succes')
      setIsEditing(false)
      await loadBudget(parseInt(id))
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!budget || !id) return
    if (!window.confirm('Supprimer ce budget ?')) return
    try {
      await budgetsAPI.delete(parseInt(id))
      navigate('/budgets')
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const updateField = (field: keyof BudgetFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!id) return <AppLayout><Box sx={{ p: 4 }}><Alert severity="error">ID du budget manquant</Alert></Box></AppLayout>

  if (loading) return (
    <AppLayout><Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
        <Skeleton variant="text" width={300} height={32} />
      </Box>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      </Container>
    </Box></AppLayout>
  )

  if (error || !budget) return (
    <AppLayout><Container maxWidth="xl" sx={{ py: 4 }}>
      <Alert severity="error">{error || 'Budget non trouve'}</Alert>
    </Container></AppLayout>
  )

  const canEdit = budget.statut === 'BROUILLON'
  const deltaMontant = budget.deltaMontant ?? (budget.totalBudget - budget.plafondConvention)
  const conventionLabel = budget.convention ? `${budget.convention.code} - ${budget.convention.objet}` : '-'

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Budgets', path: '/budgets' }, { label: `Budget ${budget.version}` }]}
          actions={
            <Button variant="outlined" size="small" color="error" onClick={handleDelete}
              sx={{ fontSize: typography.sizes.sm, py: 0.5, textTransform: 'none' }}>
              <Trash2 size={14} style={{ marginRight: 4 }} /> Supprimer
            </Button>
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView isEditing={isEditing} onToggleEdit={canEdit ? handleToggleEdit : undefined}
            onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving}
            statusSteps={STATUS_STEPS} currentStatus={budget.statut}>

            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
              Budget {budget.version}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Date: {formatDate(budget.dateBudget)}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Version" value={budget.version} isEditing={isEditing} editContent={
                  <TextField size="small" fullWidth value={formData.version}
                    onChange={e => updateField('version', e.target.value)} placeholder="V0, V1..." />
                } />
                <Field label="Statut" value={<StatusBadge status={budget.statut} />} isEditing={isEditing} editContent={
                  <TextField size="small" fullWidth select value={formData.statut}
                    onChange={e => updateField('statut', e.target.value)}>
                    {STATUS_STEPS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                  </TextField>
                } />
                <Field label="Date du budget" value={formatDate(budget.dateBudget)} isEditing={isEditing} editContent={
                  <TextField size="small" fullWidth type="date" value={formData.dateBudget}
                    onChange={e => updateField('dateBudget', e.target.value)} InputLabelProps={{ shrink: true }} />
                } />
                <Field label="Plafond Convention" value={formatCurrency(budget.plafondConvention)} isMoney isEditing={isEditing} editContent={
                  <TextField size="small" fullWidth type="number" value={formData.plafondConvention}
                    onChange={e => updateField('plafondConvention', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: '0.01' }} />
                } />
                <Field label="Total Budget" value={formatCurrency(budget.totalBudget)} isMoney isEditing={isEditing} editContent={
                  <TextField size="small" fullWidth type="number" value={formData.totalBudget}
                    onChange={e => updateField('totalBudget', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: '0.01' }} />
                } />
                <Field label="Delta" isMoney
                  value={`${deltaMontant > 0 ? '+' : ''}${formatCurrency(deltaMontant)}`} />
                <Field label="Convention" value={conventionLabel}
                  isLink={!isEditing && !!budget.convention}
                  onLinkClick={budget.convention ? () => navigate(`/conventions/${budget.convention!.id}`) : undefined}
                  isEditing={isEditing} editContent={
                    <TextField size="small" fullWidth select value={formData.conventionId ?? ''}
                      onChange={e => updateField('conventionId', e.target.value ? Number(e.target.value) : undefined)}>
                      <MenuItem value="">-- Aucune --</MenuItem>
                      {conventions.map(c => <MenuItem key={c.id} value={c.id}>{c.code} - {c.objet}</MenuItem>)}
                    </TextField>
                  } />
                <Field label="Observations" value={budget.observations || '-'} fullWidth isEditing={isEditing} editContent={
                  <TextField size="small" fullWidth multiline minRows={2} value={formData.observations}
                    onChange={e => updateField('observations', e.target.value)} />
                } />
              </FieldGroup>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Notebook tabs={[
                {
                  label: 'Details',
                  content: budget.observations
                    ? <Box sx={{ p: 2, bgcolor: colors.neutral[50], borderRadius: 1 }}>
                        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 1 }}>Observations</Typography>
                        <Typography sx={{ fontSize: typography.sizes.sm, whiteSpace: 'pre-wrap' }}>{budget.observations}</Typography>
                      </Box>
                    : <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm, py: 4, textAlign: 'center' }}>Aucune observation</Typography>,
                },
                {
                  label: 'Lignes budgetaires',
                  content: (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={componentStyles.listPage.tableHeader}>
                            <TableCell>Code</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell align="right">Montant</TableCell>
                            <TableCell>Type</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm, py: 4 }}>
                                Aucune ligne budgetaire definie
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ),
                },
                {
                  label: 'Historique',
                  content: (
                    <Box sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: colors.neutral[50], borderRadius: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.primary[500], mt: 0.5, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                            Budget cree
                          </Typography>
                          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                            {formatDate(budget.dateBudget)} - Version: {budget.version} - Statut: {budget.statut}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ),
                },
              ]} />
            </Box>
          </FormView>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default BudgetDetailPageModern
