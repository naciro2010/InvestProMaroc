import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Pencil, Lock, Trash2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge } from '@/components/core'
import type { StatusStep } from '@/components/core'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { Budget, StatutBudget } from '../../types/entities'

interface Convention {
  id: number
  code: string
  objet: string
  statut: string
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDE', label: 'Valide' },
  { value: 'REJETE', label: 'Rejete' },
  { value: 'ARCHIVE', label: 'Archive' },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

const BudgetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadBudget(parseInt(id))
  }, [id])

  const loadBudget = async (budgetId: number) => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getById(budgetId)
      const budgetData = response.data.data || response.data
      setBudget(budgetData)
      if (budgetData.convention?.id) {
        loadConvention(budgetData.convention.id)
      }
    } catch (err) {
      setError('Erreur lors du chargement du budget')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadConvention = async (conventionId: number) => {
    try {
      const res = await conventionsAPI.getById(conventionId)
      setConvention(res.data.data || res.data)
    } catch (err) {
      console.error('Error loading convention:', err)
    }
  }

  const handleDelete = async () => {
    if (!budget || !id) return
    if (!window.confirm('Supprimer ce budget ?')) return
    try {
      await budgetsAPI.delete(parseInt(id))
      navigate('/budgets')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      alert(message)
    }
  }

  if (!id) {
    return (
      <AppLayout>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">ID du budget manquant</Alert>
        </Box>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
          <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
            <Skeleton variant="text" width={300} height={32} />
          </Box>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Box>
          </Container>
        </Box>
      </AppLayout>
    )
  }

  if (error || !budget) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Budget non trouve'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const canEdit = budget.statut === 'BROUILLON'
  const deltaMontant = budget.deltaMontant || (budget.totalBudget - budget.plafondConvention)

  const breadcrumbs = [
    { label: 'Budgets', path: '/budgets' },
    { label: `Budget ${budget.version}` },
  ]

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={breadcrumbs}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={!canEdit}
                onClick={() => navigate(`/budgets/${id}/modifier`)}
                sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}
              >
                {canEdit
                  ? <Pencil size={14} style={{ marginRight: 4 }} />
                  : <Lock size={14} style={{ marginRight: 4 }} />
                }
                Modifier
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleDelete}
                sx={{ fontSize: typography.sizes.sm, py: 0.5, textTransform: 'none' }}
              >
                <Trash2 size={14} style={{ marginRight: 4 }} />
                Supprimer
              </Button>
            </Box>
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView
            isEditing={false}
            statusSteps={STATUS_STEPS}
            currentStatus={budget.statut}
          >
            <Typography sx={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: 0.5,
            }}>
              Budget {budget.version}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Date: {formatDate(budget.dateBudget)}
            </Typography>

            {/* Fields - single flat block */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Version" value={budget.version} />
                <Field label="Statut" value={<StatusBadge status={budget.statut} />} />
                <Field label="Date du budget" value={formatDate(budget.dateBudget)} />
                <Field label="Plafond Convention" value={formatCurrency(budget.plafondConvention)} isMoney />
                <Field label="Total Budget" value={formatCurrency(budget.totalBudget)} isMoney />
                <Field
                  label="Delta"
                  value={`${deltaMontant > 0 ? '+' : ''}${formatCurrency(deltaMontant)}`}
                  isMoney
                />
                {convention && (
                  <Field
                    label="Convention"
                    value={`${convention.code} - ${convention.objet}`}
                    isLink
                    onLinkClick={() => navigate(`/conventions/${convention.id}`)}
                  />
                )}
              </FieldGroup>
            </Box>

            {/* Notebook tabs */}
            <Box sx={{ mt: 3 }}>
              <Notebook
                tabs={[
                  {
                    label: 'Details',
                    content: (
                      <Box>
                        {budget.observations && (
                          <Box sx={{ p: 2, bgcolor: colors.neutral[50], borderRadius: 1 }}>
                            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 1 }}>
                              Observations
                            </Typography>
                            <Typography sx={{ fontSize: typography.sizes.sm, whiteSpace: 'pre-wrap' }}>
                              {budget.observations}
                            </Typography>
                          </Box>
                        )}
                        {!budget.observations && (
                          <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm, py: 4, textAlign: 'center' }}>
                            Aucune observation
                          </Typography>
                        )}
                      </Box>
                    ),
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
                          <Box sx={{
                            width: 10, height: 10, borderRadius: '50%',
                            bgcolor: colors.primary[500], mt: 0.5, flexShrink: 0,
                          }} />
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
                ]}
              />
            </Box>
          </FormView>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default BudgetDetailPageModern
