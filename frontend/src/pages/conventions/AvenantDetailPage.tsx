import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material'
import { Cancel } from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import {
  ControlPanel, FormView, FieldGroup, Field, Notebook, InlineTable, StatusBadge,
  Chatter, useEntityHistory,
} from '@/components/core'
import type { StatusStep } from '@/components/core'
import type { BreadcrumbSegment } from '@/components/core/ModernBreadcrumb'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { avenantConventionsAPI, conventionsAPI } from '../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { colors, typography } from '../../lib/designSystem'
import { formatCurrency } from '@/lib/utils'
import { AvenantConventionResponse } from '../../types/avenantConvention'
import { AvenantHistoryTab, AvenantDetailsTab, AvenantWorkflowActions } from './avenant'

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


const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatPercentage = (value: number | undefined) => {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}%`
}

const AvenantDetailPage = () => {
  const { conventionId, avenantId } = useParams<{ conventionId: string; avenantId: string }>()
  const navigate = useNavigate()
  const { isAdmin, isManager } = useAuth()
  const { showToast } = useToast()

  const [avenant, setAvenant] = useState<AvenantConventionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [partenaires, setPartenaires] = useState<ConventionPartenaireAllocation[]>([])
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectMotif, setRejectMotif] = useState('')
  const avenantIdNum = avenantId ? parseInt(avenantId) : 0
  const { activities: chatterActivities, loading: chatterLoading, refresh: refreshChatter } = useEntityHistory('AVENANT_CONVENTION', avenantIdNum)

  useEffect(() => {
    if (avenantId) loadAvenant(parseInt(avenantId))
  }, [avenantId]) // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch {
      showToast("Erreur lors du chargement de l'avenant", 'error')
      setError("Erreur lors du chargement de l'avenant")
    } finally {
      setLoading(false)
    }
  }

  const handleWorkflow = async (action: 'soumettre' | 'valider' | 'rejeter') => {
    if (!avenant) return
    try {
      setWorkflowLoading(true)
      if (action === 'soumettre') {
        await avenantConventionsAPI.soumettre(avenant.id)
        setSuccessMessage('Avenant soumis avec succes')
      } else if (action === 'valider') {
        await avenantConventionsAPI.valider({ avenantId: avenant.id, remarques: '' })
        setSuccessMessage('Avenant valide avec succes')
      } else if (action === 'rejeter' && rejectMotif.trim()) {
        await avenantConventionsAPI.rejeter({ avenantId: avenant.id, motifRejet: rejectMotif })
        setSuccessMessage('Avenant rejete')
        setRejectDialogOpen(false)
        setRejectMotif('')
      }
      loadAvenant(avenant.id)
    } catch {
      setError(`Erreur lors de l'action`)
      showToast("Erreur lors de l'action sur l'avenant", 'error')
    } finally {
      setWorkflowLoading(false)
    }
  }

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(t) }
  }, [successMessage])

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t) }
  }, [error])

  if (loading) return <AppLayout><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box></AppLayout>
  if (error && !avenant) return <AppLayout><Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="error">{error}</Alert><Button onClick={() => navigate(`/conventions/${conventionId}`)} sx={{ mt: 2 }}>Retour a la convention</Button></Container></AppLayout>
  if (!avenant) return null

  const budgetChangeRequested = Boolean(avenant.nouveauBudget !== undefined || avenant.deltaBudget !== undefined || (avenant.modifications && Object.prototype.hasOwnProperty.call(avenant.modifications, 'budget')))
  const totalBudgetAlloue = partenaires.reduce((sum, p) => sum + (p.budgetAlloue || 0), 0)
  const totalPourcentage = partenaires.reduce((sum, p) => sum + (p.pourcentage || 0), 0)

  const breadcrumbs: BreadcrumbSegment[] = [
    { label: 'Conventions', path: '/conventions' },
    { label: avenant.conventionNumero, path: `/conventions/${conventionId}` },
    { label: `Avenant ${avenant.numeroAvenant}` },
  ]

  const notebookTabs: Array<{ label: string; content: React.ReactNode }> = [
    { label: 'Historique', content: <AvenantHistoryTab avenant={avenant} formatDate={formatDate} /> },
    { label: 'Details', content: <AvenantDetailsTab avenant={avenant} formatDate={formatDate} /> },
  ]

  if (budgetChangeRequested) {
    notebookTabs.push({
      label: 'Repartition Partenaires',
      content: partenaires.length === 0 ? (
        <Alert severity="info">Aucune repartition partenaire n'est disponible pour cette convention.</Alert>
      ) : (
        <Box>
          <InlineTable
            headers={[{ label: 'Partenaire' }, { label: 'Budget alloue', align: 'right' }, { label: '%', align: 'right' }]}
            rows={partenaires.map((p) => [
              <Typography key="name" sx={{ fontSize: typography.sizes.sm }}>{p.partenaireSigle || p.partenaireNom}</Typography>,
              <Typography key="budget" sx={{ fontSize: typography.sizes.sm }}>{formatCurrency(p.budgetAlloue ?? 0)}</Typography>,
              <Typography key="pct" sx={{ fontSize: typography.sizes.sm }}>{formatPercentage(p.pourcentage)}</Typography>,
            ])}
            footerCells={[
              <strong key="label">Total alloue</strong>,
              <strong key="budget">{formatCurrency(totalBudgetAlloue ?? 0)}</strong>,
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
          actions={
            <AvenantWorkflowActions
              canSoumettre={avenant.canSoumettre}
              canValider={avenant.canValider && (isAdmin || isManager)}
              canEdit={avenant.isEditable}
              workflowLoading={workflowLoading}
              onSoumettre={() => handleWorkflow('soumettre')}
              onValider={() => handleWorkflow('valider')}
              onReject={() => setRejectDialogOpen(true)}
              onEdit={() => navigate(`/conventions/${conventionId}/avenants/${avenantId}/edit`)}
            />
          }
          hideBottomRow
        />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

          <FormView isEditing={false} statusSteps={STATUS_STEPS} currentStatus={avenant.statut}>
            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, mb: 0.5 }}>
              Avenant {avenant.numeroAvenant}
            </Typography>
            <Box sx={{ mb: 3 }}><RichTextDisplay html={avenant.objet || ''} variant="compact" collapseLength={200} /></Box>
            {avenant.motifRejet && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm }}>Motif de rejet</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm }}>{avenant.motifRejet}</Typography>
              </Alert>
            )}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Numero" value={avenant.numeroAvenant} />
                <Field label="Statut" value={<StatusBadge status={avenant.statut} />} />
                <Field label="Date" value={formatDate(avenant.dateAvenant)} />
                <Field label="Convention" value={`${avenant.conventionNumero} - ${avenant.conventionLibelle}`} isLink onLinkClick={() => navigate(`/conventions/${conventionId}`)} />
                <Field label="Budget avant" value={formatCurrency(avenant.ancienBudget ?? 0)} isMoney />
                <Field label="Budget apres" value={formatCurrency(avenant.nouveauBudget ?? 0)} isMoney />
                <Field label="Variation" value={`${(avenant.deltaBudget || 0) >= 0 ? '+' : ''}${formatCurrency(avenant.deltaBudget ?? 0)}`} isMoney />
                {(avenant.ancienTauxCommission !== undefined || avenant.nouveauTauxCommission !== undefined) && (
                  <Field label="Taux commission" value={`${formatPercentage(avenant.ancienTauxCommission)} \u2192 ${formatPercentage(avenant.nouveauTauxCommission)}`} />
                )}
                <Field label="Objet" value={avenant.objet} fullWidth />
                {avenant.motif && <Field label="Motif" value={avenant.motif} fullWidth />}
              </FieldGroup>
            </Box>
            <Notebook tabs={notebookTabs} />

            <Chatter
              entityType="avenant_convention" entityId={avenantIdNum}
              activities={chatterActivities} loading={chatterLoading}
              onRefresh={refreshChatter}
            />
          </FormView>
        </Container>
      </Box>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.danger[700] }}>Rejeter l'avenant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>Veuillez indiquer le motif du rejet.</Typography>
          <TextField autoFocus fullWidth multiline rows={3} label="Motif du rejet" value={rejectMotif} onChange={(e) => setRejectMotif(e.target.value)} placeholder="Decrivez les raisons du rejet..." required />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={workflowLoading}>Annuler</Button>
          <Button variant="contained" color="error" onClick={() => handleWorkflow('rejeter')} disabled={workflowLoading || !rejectMotif.trim()} startIcon={workflowLoading ? <CircularProgress size={16} /> : <Cancel />}>
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}

export default AvenantDetailPage
