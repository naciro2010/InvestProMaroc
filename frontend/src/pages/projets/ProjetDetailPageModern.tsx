import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Button, Skeleton, Alert } from '@mui/material'
import { Pencil } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge, type StatusStep } from '@/components/core'
import { useToast } from '@/contexts/ToastContext'
import { projetsAPI } from '@/lib/projetsAPI'
import { ProjetStatsCards, ProjetProgressBar, ProjetChartTab, ProjetWorkflowActions } from '@/components/projets/detail'
import {
  ProjetInfoCard,
  ProjetConventionsTab,
  ProjetMarchesTab,
  ProjetBudgetSection,
  ProjetHistoriqueTab,
  Projet,
  formatCurrency,
} from './components'
import { colors, typography, componentStyles } from '@/lib/designSystem'

const STATUS_STEPS: StatusStep[] = [
  { value: 'EN_PREPARATION', label: 'Preparation' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TERMINE', label: 'Termine' },
]

const ProjetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<Projet | null>(null)
  const [error, setError] = useState<string | null>(null)

  const projetId = id ? parseInt(id) : 0

  useEffect(() => {
    if (projetId) loadProjet(projetId)
  }, [projetId])

  const loadProjet = async (pid: number) => {
    try {
      setLoading(true)
      const response = await projetsAPI.getById(pid)
      setProjet(response.data as Projet)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }

  const generateProgressData = () => {
    if (!projet) return []
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const data = []
    const currentMonth = new Date().getMonth()
    for (let i = 0; i <= currentMonth; i++) {
      data.push({
        mois: months[i],
        avancement: Math.min((i + 1) * (projet.pourcentageAvancement / (currentMonth + 1)), projet.pourcentageAvancement),
        planifie: (i + 1) * (100 / 12),
      })
    }
    return data
  }

  // Build effective steps: insert ANNULE into the pipeline when active
  const effectiveSteps: StatusStep[] = (() => {
    if (!projet) return STATUS_STEPS
    if (projet.statut === 'ANNULE') return [
      ...STATUS_STEPS.slice(0, 3),
      { value: 'ANNULE', label: 'Annule', variant: 'danger' as const },
    ]
    return STATUS_STEPS
  })()

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
          <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
            <Skeleton variant="text" width={300} height={32} />
          </Box>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Container>
        </Box>
      </AppLayout>
    )
  }

  if (error || !projet) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Projet non trouve'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const canEdit = projet.statut === 'EN_PREPARATION'

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Projets', path: '/projets' },
            { label: projet.code || `#${projet.id}` },
          ]}
          actions={
            <>
              <ProjetWorkflowActions
                projetId={projetId}
                statut={projet.statut}
                onSuccess={(msg) => showToast(msg, 'success')}
                onError={(msg) => showToast(msg, 'error')}
                onReload={() => loadProjet(projetId)}
              />
              {canEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Pencil size={14} />}
                  onClick={() => navigate(`/projets/${projet.id}/modifier`)}
                  sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}
                >
                  Modifier
                </Button>
              )}
            </>
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView
            isEditing={false}
            onToggleEdit={canEdit ? () => navigate(`/projets/${projet.id}/modifier`) : undefined}
            statusSteps={effectiveSteps}
            currentStatus={projet.statut}
          >
            {/* Title */}
            <Box sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
              {projet.nom}
            </Box>
            <Box sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Code: {projet.code}{projet.conventionNumero ? ` · Convention: ${projet.conventionNumero}` : ''}
            </Box>

            {/* Fields summary */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Code" value={projet.code} />
                <Field label="Statut" value={<StatusBadge status={projet.statut} />} />
                <Field label="Avancement" value={`${projet.pourcentageAvancement}%`} />
                <Field label="Budget total" value={formatCurrency(projet.budgetTotal)} isMoney />
                <Field label="Budget consomme" value={formatCurrency(projet.budgetConsomme)} isMoney />
                {projet.estEnRetard && (
                  <Field label="Retard" value={<StatusBadge status="REJETE" />} />
                )}
              </FieldGroup>
            </Box>

            {/* Stats and Progress */}
            <ProjetStatsCards
              budgetTotal={projet.budgetTotal}
              pourcentageAvancement={projet.pourcentageAvancement}
              budgetConsomme={projet.budgetConsomme}
              estEnRetard={projet.estEnRetard}
              formatCurrency={formatCurrency}
            />
            <ProjetProgressBar pourcentageAvancement={projet.pourcentageAvancement} />

            {/* Notebook tabs */}
            <Box sx={{ mt: 3 }}>
              <Notebook
                tabs={[
                  {
                    label: 'Informations',
                    content: (
                      <Box>
                        <ProjetInfoCard projetId={projetId} />
                        <Box sx={{ mt: 3 }}>
                          <ProjetBudgetSection projetId={projetId} />
                        </Box>
                      </Box>
                    ),
                  },
                  {
                    label: 'Conventions',
                    content: <ProjetConventionsTab projetId={projetId} />,
                  },
                  {
                    label: 'Marches lies',
                    content: <ProjetMarchesTab projetId={projetId} />,
                  },
                  {
                    label: 'Avancement',
                    content: <ProjetChartTab chartData={generateProgressData()} />,
                  },
                  {
                    label: 'Historique',
                    content: <ProjetHistoriqueTab projetId={projetId} />,
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

export default ProjetDetailPageModern
