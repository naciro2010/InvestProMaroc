import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Button,
  Skeleton,
  Alert,
} from '@mui/material'
import {
  Edit,
  PlayArrow,
  Pause,
  Done,
} from '@mui/icons-material'
import { Pencil } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge } from '../../components/core'
import type { StatusStep } from '../../components/core'
import { projetsAPI } from '../../lib/projetsAPI'
import { ProjetStatsCards, ProjetProgressBar, ProjetChartTab } from '../../components/projets/detail'
import {
  ProjetInfoCard,
  ProjetConventionsTab,
  ProjetMarchesTab,
  ProjetBudgetSection,
  ProjetHistoriqueTab,
  Projet,
  formatCurrency,
  getStatusColor,
} from './components'
import { colors, typography, componentStyles } from '../../lib/designSystem'

const STATUS_STEPS: StatusStep[] = [
  { value: 'EN_PREPARATION', label: 'Preparation' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TERMINE', label: 'Termine' },
]

const ProjetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement du projet'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemarrer = async () => {
    if (!projet?.id) return
    if (!window.confirm('Etes-vous sur de vouloir demarrer ce projet ?')) return
    try {
      await projetsAPI.demarrer(projet.id)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du demarrage'
      alert(message)
    }
  }

  const handleSuspendre = async () => {
    if (!projet?.id) return
    const motif = window.prompt('Motif de suspension :')
    if (!motif) return
    try {
      await projetsAPI.suspendre(projet.id, motif)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suspension'
      alert(message)
    }
  }

  const handleReprendre = async () => {
    if (!projet?.id) return
    if (!window.confirm('Etes-vous sur de vouloir reprendre ce projet ?')) return
    try {
      await projetsAPI.reprendre(projet.id)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la reprise'
      alert(message)
    }
  }

  const handleTerminer = async () => {
    if (!projet?.id) return
    if (!window.confirm('Etes-vous sur de vouloir terminer ce projet ?')) return
    try {
      await projetsAPI.terminer(projet.id)
      loadProjet(projet.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la finalisation'
      alert(message)
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

  const getWorkflowActions = () => {
    if (!projet) return null
    return (
      <>
        {projet.statut === 'EN_PREPARATION' && (
          <>
            <Button key="demarrer" variant="contained" size="small" color="success" startIcon={<PlayArrow />} onClick={handleDemarrer}
              sx={{ fontSize: typography.sizes.sm, py: 0.5 }}>
              Demarrer
            </Button>
            <Button key="modifier" variant="outlined" size="small" startIcon={<Pencil size={14} />} onClick={() => navigate(`/projets/${projet.id}/modifier`)}
              sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
              Modifier
            </Button>
          </>
        )}
        {projet.statut === 'EN_COURS' && (
          <>
            <Button key="suspendre" variant="outlined" size="small" color="warning" startIcon={<Pause />} onClick={handleSuspendre}
              sx={{ fontSize: typography.sizes.sm, py: 0.5 }}>
              Suspendre
            </Button>
            <Button key="terminer" variant="contained" size="small" color="success" startIcon={<Done />} onClick={handleTerminer}
              sx={{ fontSize: typography.sizes.sm, py: 0.5 }}>
              Terminer
            </Button>
          </>
        )}
        {projet.statut === 'SUSPENDU' && (
          <Button key="reprendre" variant="contained" size="small" color="info" startIcon={<PlayArrow />} onClick={handleReprendre}
            sx={{ fontSize: typography.sizes.sm, py: 0.5 }}>
            Reprendre
          </Button>
        )}
      </>
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

  const breadcrumbs = [
    { label: 'Projets', path: '/projets' },
    { label: projet.code || `#${projet.id}` },
  ]

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        {/* Control Panel - breadcrumbs + workflow actions */}
        <ControlPanel
          breadcrumbs={breadcrumbs}
          actions={getWorkflowActions()}
          hideBottomRow
        />

        {/* Main content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView
            isEditing={false}
            statusSteps={STATUS_STEPS}
            currentStatus={projet.statut}
          >
            {/* Title */}
            <Box sx={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: 0.5,
            }}>
              {projet.nom}
            </Box>
            <Box sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Code: {projet.code}{projet.conventionNumero ? ` · Convention: ${projet.conventionNumero}` : ''}
            </Box>

            {/* Field Groups */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <FieldGroup title="Informations generales">
                <Field label="Code" value={projet.code} />
                <Field label="Statut" value={<StatusBadge status={projet.statut} />} />
                <Field label="Avancement" value={`${projet.pourcentageAvancement}%`} />
                {projet.estEnRetard && (
                  <Field label="Retard" value={<StatusBadge status="REJETE" />} />
                )}
              </FieldGroup>

              <FieldGroup title="Budget">
                <Field label="Budget total" value={formatCurrency(projet.budgetTotal)} isMoney />
                <Field label="Budget consomme" value={formatCurrency(projet.budgetConsomme)} isMoney />
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
