import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Button, Skeleton, Alert, Typography, CircularProgress } from '@mui/material'
import { Pencil, Lock, Printer, CheckCircle, XCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge, Chatter, useEntityHistory } from '@/components/core'
import type { StatusStep } from '@/components/core'
import { api } from '../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { formatCurrency } from '@/lib/utils'
import { DecompteInfoCard, DecompteCalculsCard, DecompteRetentionsCard } from '../../components/decomptes/detail'

interface Retenue {
  id: number
  typeRetenue: 'GARANTIE' | 'RAS' | 'PENALITES' | 'AVANCES'
  montant: number
  tauxPourcent?: number
  libelle?: string
}

interface Decompte {
  id: number
  numeroDecompte: string
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  statut: string
  montantBrutHT: number
  montantTVA: number
  montantTTC: number
  totalRetenues: number
  netAPayer: number
  cumulPrecedent: number
  cumulActuel: number
  observations?: string
  marcheId?: number
  marcheCode?: string
  marcheObjet?: string
  retenues: Retenue[]
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDE', label: 'Valide' },
  { value: 'PAYE_PARTIEL', label: 'Paye partiel' },
  { value: 'PAYE_TOTAL', label: 'Paye total' },
]


const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR')

const DecompteDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [decompte, setDecompte] = useState<Decompte | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const decompteId = id ? parseInt(id) : 0
  const { activities: chatterActivities, loading: chatterLoading, refresh: refreshChatter } = useEntityHistory('DECOMPTE', decompteId)

  useEffect(() => {
    if (id) loadDecompte(parseInt(id))
  }, [id])

  const loadDecompte = async (decompteId: number) => {
    try {
      setLoading(true)
      const res = await api.get(`/decomptes/${decompteId}`)
      setDecompte(res.data.data || res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement du decompte'
      setError(message)
      showToast('Erreur lors du chargement du decompte', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async () => {
    if (!decompte) return
    try {
      setWorkflowLoading(true)
      await api.post(`/decomptes/${decompte.id}/valider`)
      loadDecompte(decompte.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la validation'
      alert(message)
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleRejeter = async () => {
    if (!decompte) return
    const motif = prompt('Motif du rejet:')
    if (!motif) return
    try {
      setWorkflowLoading(true)
      await api.post(`/decomptes/${decompte.id}/rejeter`, { motif })
      loadDecompte(decompte.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du rejet'
      alert(message)
    } finally {
      setWorkflowLoading(false)
    }
  }

  if (!id) {
    return (
      <AppLayout>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">ID du decompte manquant</Alert>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Box>
          </Container>
        </Box>
      </AppLayout>
    )
  }

  if (error || !decompte) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Decompte non trouve'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const canEdit = decompte.statut === 'BROUILLON'

  const breadcrumbs = [
    { label: 'Decomptes', path: '/decomptes' },
    ...(decompte.marcheId ? [{ label: decompte.marcheCode || 'Marche', path: `/marches/${decompte.marcheId}` }] : []),
    { label: decompte.numeroDecompte },
  ]

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={breadcrumbs}
          actions={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {workflowLoading && <CircularProgress size={20} />}

              {decompte.statut === 'SOUMIS' && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={handleValider}
                    disabled={workflowLoading}
                    sx={{ textTransform: 'none' }}
                  >
                    <CheckCircle size={14} style={{ marginRight: 4 }} />
                    Valider
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleRejeter}
                    disabled={workflowLoading}
                    sx={{ textTransform: 'none' }}
                  >
                    <XCircle size={14} style={{ marginRight: 4 }} />
                    Rejeter
                  </Button>
                </>
              )}

              <Button
                variant="outlined"
                size="small"
                disabled={!canEdit}
                onClick={() => navigate(`/decomptes/${id}/modifier`)}
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
                onClick={() => window.print()}
                sx={{ fontSize: typography.sizes.sm, py: 0.5, textTransform: 'none' }}
              >
                <Printer size={14} style={{ marginRight: 4 }} />
                Imprimer
              </Button>
            </Box>
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView
            isEditing={false}
            statusSteps={STATUS_STEPS}
            currentStatus={decompte.statut}
          >
            <Typography sx={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: 0.5,
            }}>
              Decompte {decompte.numeroDecompte}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Marche: {decompte.marcheCode || 'N/A'} - {decompte.marcheObjet || ''}
            </Typography>

            {/* Fields - single flat block */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Numero" value={decompte.numeroDecompte} />
                <Field label="Statut" value={<StatusBadge status={decompte.statut} />} />
                <Field label="Date" value={formatDate(decompte.dateDecompte)} />
                <Field label="Periode" value={`${formatDate(decompte.periodeDebut)} - ${formatDate(decompte.periodeFin)}`} />
                <Field label="Montant Brut HT" value={formatCurrency(decompte.montantBrutHT)} isMoney />
                <Field label="TVA" value={formatCurrency(decompte.montantTVA)} isMoney />
                <Field label="Montant TTC" value={formatCurrency(decompte.montantTTC)} isMoney />
                <Field label="Retenues" value={formatCurrency(decompte.totalRetenues)} isMoney />
                <Field label="Net a payer" value={formatCurrency(decompte.netAPayer)} isMoney />
                {decompte.marcheId && (
                  <Field
                    label="Marche"
                    value={decompte.marcheCode || 'N/A'}
                    isLink
                    onLinkClick={() => navigate(`/marches/${decompte.marcheId}`)}
                  />
                )}
              </FieldGroup>
            </Box>

            {/* Notebook tabs */}
            <Box sx={{ mt: 3 }}>
              <Notebook
                tabs={[
                  {
                    label: 'Detail',
                    content: <DecompteInfoCard decompteId={decompte.id} />,
                  },
                  {
                    label: 'Retenues',
                    content: (
                      <DecompteRetentionsCard
                        retenues={decompte.retenues || []}
                        totalRetenues={decompte.totalRetenues}
                        formatCurrency={formatCurrency}
                      />
                    ),
                  },
                  {
                    label: 'Calculs',
                    content: (
                      <DecompteCalculsCard
                        montantBrutHT={decompte.montantBrutHT}
                        montantTVA={decompte.montantTVA}
                        montantTTC={decompte.montantTTC}
                        totalRetenues={decompte.totalRetenues}
                        netAPayer={decompte.netAPayer}
                        formatCurrency={formatCurrency}
                      />
                    ),
                  },
                ]}
              />
            </Box>

            <Chatter
              entityType="decompte" entityId={decompteId}
              activities={chatterActivities} loading={chatterLoading}
              onRefresh={refreshChatter}
            />
          </FormView>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default DecompteDetailPageModern
