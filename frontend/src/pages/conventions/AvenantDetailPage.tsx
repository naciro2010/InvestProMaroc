import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { Send, CheckCircle, Cancel, Edit } from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import {
  ControlPanel,
  FormView,
  FieldGroup,
  Field,
  Notebook,
  InlineTable,
  StatusBadge,
} from '@/components/core'
import type { StatusStep } from '@/components/core'
import type { BreadcrumbSegment } from '@/components/core/ModernBreadcrumb'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { avenantConventionsAPI, conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { colors, typography } from '../../lib/designSystem'
import { AvenantConventionResponse } from '../../types/avenantConvention'

interface ConventionPartenaireAllocation {
  id: number
  partenaireNom: string
  partenaireSigle?: string | null
  budgetAlloue: number
  pourcentage: number
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDE', label: 'Valide' },
]

const AvenantDetailPage = () => {
  const { conventionId, avenantId } = useParams<{ conventionId: string; avenantId: string }>()
  const navigate = useNavigate()
  const { isAdmin, isManager } = useAuth()

  const [avenant, setAvenant] = useState<AvenantConventionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [partenaires, setPartenaires] = useState<ConventionPartenaireAllocation[]>([])

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectMotif, setRejectMotif] = useState('')

  useEffect(() => {
    if (avenantId) {
      loadAvenant(parseInt(avenantId))
    }
  }, [avenantId])

  const loadAvenant = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await avenantConventionsAPI.getById(id)
      const avenantData = response.data.data || response.data
      setAvenant(avenantData)

      try {
        const partRes = await conventionsAPI.getPartenaires(avenantData.conventionId)
        const partData = partRes.data.data || partRes.data || []
        setPartenaires(Array.isArray(partData) ? partData : [])
      } catch (partErr) {
        console.warn('Impossible de charger la repartition des partenaires:', partErr)
        setPartenaires([])
      }
    } catch (err) {
      console.error('Error loading avenant:', err)
      setError("Erreur lors du chargement de l'avenant")
    } finally {
      setLoading(false)
    }
  }

  const handleSoumettre = async () => {
    if (!avenant) return
    try {
      setWorkflowLoading(true)
      await avenantConventionsAPI.soumettre(avenant.id)
      setSuccessMessage('Avenant soumis avec succes')
      loadAvenant(avenant.id)
    } catch (err) {
      setError('Erreur lors de la soumission')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleValider = async () => {
    if (!avenant) return
    try {
      setWorkflowLoading(true)
      await avenantConventionsAPI.valider({ avenantId: avenant.id, remarques: '' })
      setSuccessMessage('Avenant valide avec succes')
      loadAvenant(avenant.id)
    } catch (err) {
      setError('Erreur lors de la validation')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleRejeter = async () => {
    if (!avenant || !rejectMotif.trim()) return
    try {
      setWorkflowLoading(true)
      await avenantConventionsAPI.rejeter({ avenantId: avenant.id, motifRejet: rejectMotif })
      setSuccessMessage('Avenant rejete')
      setRejectDialogOpen(false)
      setRejectMotif('')
      loadAvenant(avenant.id)
    } catch (err) {
      setError('Erreur lors du rejet')
      console.error(err)
    } finally {
      setWorkflowLoading(false)
    }
  }

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return '-'
    return `${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    )
  }

  if (error && !avenant) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate(`/conventions/${conventionId}`)} sx={{ mt: 2 }}>
            Retour a la convention
          </Button>
        </Container>
      </AppLayout>
    )
  }

  if (!avenant) return null

  const budgetChangeRequested = Boolean(
    avenant.nouveauBudget !== undefined ||
    avenant.deltaBudget !== undefined ||
    (avenant.modifications && Object.prototype.hasOwnProperty.call(avenant.modifications, 'budget'))
  )
  const totalBudgetAlloue = partenaires.reduce((sum, p) => sum + (p.budgetAlloue || 0), 0)
  const totalPourcentage = partenaires.reduce((sum, p) => sum + (p.pourcentage || 0), 0)

  const canEdit = avenant.isEditable
  const canSoumettre = avenant.canSoumettre
  const canValider = avenant.canValider && (isAdmin || isManager)

  const breadcrumbs: BreadcrumbSegment[] = [
    { label: 'Conventions', path: '/conventions' },
    { label: avenant.conventionNumero, path: `/conventions/${conventionId}` },
    { label: `Avenant ${avenant.numeroAvenant}` },
  ]

  const workflowActions = (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {workflowLoading && <CircularProgress size={20} />}
      {canSoumettre && (
        <Button variant="contained" color="primary" size="small" startIcon={<Send />} onClick={handleSoumettre} disabled={workflowLoading}>
          Soumettre
        </Button>
      )}
      {canValider && (
        <>
          <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />} onClick={handleValider} disabled={workflowLoading}>
            Valider
          </Button>
          <Button variant="outlined" color="error" size="small" startIcon={<Cancel />} onClick={() => setRejectDialogOpen(true)} disabled={workflowLoading}>
            Rejeter
          </Button>
        </>
      )}
      {canEdit && (
        <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => navigate(`/conventions/${conventionId}/avenants/${avenantId}/edit`)}>
          Modifier
        </Button>
      )}
    </Box>
  )

  const notebookTabs: Array<{ label: string; content: React.ReactNode }> = [
    {
      label: 'Historique',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.neutral[400] }} />
              <Box sx={{ width: 2, height: 40, bgcolor: colors.border }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>Cree</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                {formatDate(avenant.createdAt)} par {avenant.createdByName || 'Systeme'}
              </Typography>
            </Box>
          </Box>
          {avenant.dateSoumission && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.info[500] }} />
                <Box sx={{ width: 2, height: 40, bgcolor: colors.border }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>Soumis pour validation</Typography>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                  {formatDate(avenant.dateSoumission)} par {avenant.soumisParName || 'Utilisateur'}
                </Typography>
              </Box>
            </Box>
          )}
          {avenant.dateValidation && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.success[500] }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>Valide</Typography>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                  {formatDate(avenant.dateValidation)} par {avenant.valideParName || 'Administrateur'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ),
    },
    {
      label: 'Details',
      content: (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {avenant.dateEffet && (
            <Box>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Date d'effet</Typography>
              <Typography sx={{ fontSize: typography.sizes.base }}>{formatDate(avenant.dateEffet)}</Typography>
            </Box>
          )}
          {avenant.ordreApplication !== undefined && (
            <Box>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Ordre d'application</Typography>
              <Typography sx={{ fontSize: typography.sizes.base }}>{avenant.ordreApplication}</Typography>
            </Box>
          )}
          {avenant.detailsModifications && (
            <Box>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Details des modifications</Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, mt: 0.5, whiteSpace: 'pre-wrap' }}>{avenant.detailsModifications}</Typography>
            </Box>
          )}
          {avenant.remarques && (
            <Box>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Remarques</Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, mt: 0.5 }}>{avenant.remarques}</Typography>
            </Box>
          )}
          {!avenant.dateEffet && !avenant.ordreApplication && !avenant.detailsModifications && !avenant.remarques && (
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucun detail complementaire.</Typography>
          )}
        </Box>
      ),
    },
  ]

  if (budgetChangeRequested) {
    notebookTabs.push({
      label: 'Repartition Partenaires',
      content: partenaires.length === 0 ? (
        <Alert severity="info">Aucune repartition partenaire n'est disponible pour cette convention.</Alert>
      ) : (
        <Box>
          <InlineTable
            headers={[
              { label: 'Partenaire' },
              { label: 'Budget alloue', align: 'right' },
              { label: '%', align: 'right' },
            ]}
            rows={partenaires.map((p) => [
              <Typography key="name" sx={{ fontSize: typography.sizes.sm }}>{p.partenaireSigle || p.partenaireNom}</Typography>,
              <Typography key="budget" sx={{ fontSize: typography.sizes.sm }}>{formatCurrency(p.budgetAlloue)}</Typography>,
              <Typography key="pct" sx={{ fontSize: typography.sizes.sm }}>{formatPercentage(p.pourcentage)}</Typography>,
            ])}
            footerCells={[
              <strong key="label">Total alloue</strong>,
              <strong key="budget">{formatCurrency(totalBudgetAlloue)}</strong>,
              <strong key="pct">{formatPercentage(totalPourcentage)}</strong>,
            ]}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Cette section aide a verifier la coherence de la repartition lors des avenants qui modifient le budget.
          </Alert>
        </Box>
      ),
    })
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={breadcrumbs}
          actions={workflowActions}
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
          )}

          <FormView isEditing={false} statusSteps={STATUS_STEPS} currentStatus={avenant.statut}>
            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, mb: 0.5 }}>
              Avenant {avenant.numeroAvenant}
            </Typography>
            <Box sx={{ mb: 3 }}>
              <RichTextDisplay html={avenant.objet || ''} variant="compact" collapseLength={200} />
            </Box>

            {avenant.motifRejet && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm }}>Motif de rejet</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm }}>{avenant.motifRejet}</Typography>
              </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <FieldGroup title="Informations generales">
                <Field label="Numero" value={avenant.numeroAvenant} />
                <Field label="Statut" value={<StatusBadge status={avenant.statut} />} />
                <Field
                  label="Convention"
                  value={`${avenant.conventionNumero} - ${avenant.conventionLibelle}`}
                  isLink
                  onLinkClick={() => navigate(`/conventions/${conventionId}`)}
                />
                <Field label="Date" value={formatDate(avenant.dateAvenant)} />
                <Field label="Objet" value={avenant.objet} fullWidth />
                {avenant.motif && <Field label="Motif" value={avenant.motif} fullWidth />}
              </FieldGroup>

              <FieldGroup title="Impact financier">
                <Field label="Budget avant" value={formatCurrency(avenant.ancienBudget)} isMoney />
                <Field label="Budget apres" value={formatCurrency(avenant.nouveauBudget)} isMoney />
                <Field
                  label="Variation"
                  value={`${(avenant.deltaBudget || 0) >= 0 ? '+' : ''}${formatCurrency(avenant.deltaBudget)}`}
                  isMoney
                  fullWidth
                />
                {(avenant.ancienTauxCommission !== undefined || avenant.nouveauTauxCommission !== undefined) && (
                  <Field
                    label="Taux commission"
                    value={`${formatPercentage(avenant.ancienTauxCommission)} \u2192 ${formatPercentage(avenant.nouveauTauxCommission)}`}
                    fullWidth
                  />
                )}
              </FieldGroup>
            </Box>

            <Notebook tabs={notebookTabs} />
          </FormView>
        </Container>
      </Box>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.danger[700] }}>Rejeter l'avenant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
            Veuillez indiquer le motif du rejet.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motif du rejet"
            value={rejectMotif}
            onChange={(e) => setRejectMotif(e.target.value)}
            placeholder="Decrivez les raisons du rejet..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={workflowLoading}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejeter}
            disabled={workflowLoading || !rejectMotif.trim()}
            startIcon={workflowLoading ? <CircularProgress size={16} /> : <Cancel />}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}

export default AvenantDetailPage
