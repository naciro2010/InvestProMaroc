import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Skeleton, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import {
  ControlPanel, FormView, FieldGroup, Notebook, StatusBadge,
  InlineEditField, EditFieldDialog, Chatter, useEntityHistory,
  type StatusStep, type InlineEditFieldConfig,
} from '@/components/core'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { useToast } from '@/contexts/ToastContext'
import type { Budget } from '../../types/entities'

interface ConventionOption { id: number; code: string; objet: string }

interface DialogFieldState {
  key: string; label: string; value: string; mode: 'richtext' | 'textarea'
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDE', label: 'Valide' },
  { value: 'REJETE', label: 'Rejete', variant: 'danger' },
  { value: 'ARCHIVE', label: 'Archive' },
]

const STATUT_OPTIONS = STATUS_STEPS.map(s => ({ value: s.value, label: s.label }))

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

const BudgetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [conventions, setConventions] = useState<ConventionOption[]>([])
  const [dialogField, setDialogField] = useState<DialogFieldState | null>(null)
  const budgetId = id ? parseInt(id) : 0
  const { activities: chatterActivities, loading: chatterLoading, refresh: refreshChatter } = useEntityHistory('BUDGET', budgetId)

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

  const canEdit = budget?.statut === 'BROUILLON'

  // Load conventions when canEdit
  const loadConventions = useCallback(async () => {
    try {
      const res = await conventionsAPI.getAll()
      const list = extractList<ConventionOption>(res.data)
      setConventions(list.map(c => ({ id: c.id, code: c.code, objet: c.objet })))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { if (canEdit) loadConventions() }, [canEdit, loadConventions])

  const handleFieldSave = async (fieldKey: string, value: string | number | null) => {
    if (!budget || !id) return
    const payload: Record<string, unknown> = {
      version: budget.version,
      conventionId: budget.convention?.id,
      dateBudget: budget.dateBudget,
      statut: budget.statut,
      plafondConvention: budget.plafondConvention,
      totalBudget: budget.totalBudget,
      observations: budget.observations || '',
      [fieldKey]: value,
    }
    await budgetsAPI.update(parseInt(id), payload)
    await loadBudget(parseInt(id))
    showSuccess('Budget mis a jour')
  }

  const openFieldDialog = (fieldKey: string, value: string) => {
    setDialogField({ key: fieldKey, label: 'Observations', value, mode: 'textarea' })
  }

  const handleDialogSave = async (fieldKey: string, value: string) => {
    await handleFieldSave(fieldKey, value)
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

  const field = (config: InlineEditFieldConfig) => (
    <InlineEditField config={config} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
  )

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

  const deltaMontant = budget.deltaMontant ?? (budget.totalBudget - budget.plafondConvention)
  const conventionLabel = budget.convention ? `${budget.convention.code} - ${budget.convention.objet}` : '-'
  const convOptions = conventions.map(c => ({ value: c.id, label: `${c.code} - ${c.objet}` }))

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
          <FormView isEditing={false} statusSteps={STATUS_STEPS} currentStatus={budget.statut}>
            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
              Budget {budget.version}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Date: {formatDate(budget.dateBudget)}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                {field({ fieldKey: 'version', label: 'Version', type: 'text', value: budget.version, editable: canEdit, placeholder: 'V0, V1...' })}
                {field({ fieldKey: 'statut', label: 'Statut', type: 'select', value: budget.statut, options: STATUT_OPTIONS, displayValue: <StatusBadge status={budget.statut} />, editable: canEdit })}
                {field({ fieldKey: 'dateBudget', label: 'Date du budget', type: 'date', value: budget.dateBudget || '', editable: canEdit })}
                {field({ fieldKey: 'plafondConvention', label: 'Plafond Convention', type: 'number', value: budget.plafondConvention, isMoney: true, displayValue: formatCurrency(budget.plafondConvention), editable: canEdit, inputProps: { min: 0, step: '0.01' } })}
                {field({ fieldKey: 'totalBudget', label: 'Total Budget', type: 'number', value: budget.totalBudget, isMoney: true, displayValue: formatCurrency(budget.totalBudget), editable: canEdit, inputProps: { min: 0, step: '0.01' } })}
                {field({ fieldKey: 'deltaMontant', label: 'Delta', type: 'number', value: deltaMontant, isMoney: true, displayValue: `${deltaMontant > 0 ? '+' : ''}${formatCurrency(deltaMontant)}`, editable: false })}
                {field({
                  fieldKey: 'conventionId', label: 'Convention', type: 'select',
                  value: budget.convention?.id ?? null, options: convOptions, emptyLabel: '-- Aucune --',
                  displayValue: conventionLabel,
                  isLink: !!budget.convention, onLinkClick: budget.convention ? () => navigate(`/conventions/${budget.convention!.id}`) : undefined,
                  editable: canEdit,
                })}
                {field({ fieldKey: 'observations', label: 'Observations', type: 'richtext', value: budget.observations || '', displayValue: budget.observations || '-', editable: canEdit, fullWidth: true })}
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
              ]} />
            </Box>

            <Chatter
              entityType="budget" entityId={budgetId}
              activities={chatterActivities} loading={chatterLoading}
              onRefresh={refreshChatter}
            />
          </FormView>
        </Container>
      </Box>
      {dialogField && (
        <EditFieldDialog
          open onClose={() => setDialogField(null)} onSave={handleDialogSave}
          fieldKey={dialogField.key} fieldLabel={dialogField.label}
          currentValue={dialogField.value} mode={dialogField.mode}
        />
      )}
    </AppLayout>
  )
}

export default BudgetDetailPageModern
