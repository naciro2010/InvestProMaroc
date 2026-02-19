import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Button,
  Alert,
  Skeleton,
  Typography,
} from '@mui/material'
import { Eye, ArrowLeft } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { conventionsAPI } from '../../lib/api'
import {
  ConventionInfoEditCard,
  ConventionFinancesEditCard,
  ConventionDatesEditCard,
} from '../../components/conventions/edit'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import { ControlPanel, FormView, Notebook, StatusBadge } from '@/components/core'

const CONVENTION_STATUS_STEPS = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDEE', label: 'Validee' },
  { value: 'EN_EXECUTION', label: 'En execution' },
  { value: 'ACHEVE', label: 'Acheve' },
]

const ConventionEditPageComplete = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [convention, setConvention] = useState<{ code: string; statut: string; libelle?: string } | null>(null)

  useEffect(() => {
    if (id) loadConventionMetadata(parseInt(id))
  }, [id])

  const loadConventionMetadata = async (conventionId: number) => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getBasic(conventionId)
      const data = response.data.data || response.data
      setConvention({ code: data.code, statut: data.statut, libelle: data.libelle })
    } catch {
      setError('Convention non trouvee')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
          <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: { xs: 2, md: 3 }, py: 1.5 }}>
            <Skeleton variant="text" width={200} height={28} />
          </Box>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px' }} />
          </Container>
        </Box>
      </AppLayout>
    )
  }

  if (error || !convention || !id) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Convention non trouvee'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const conventionId = parseInt(id)

  const placeholderTab = (icon: string, title: string, description: string) => (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 48, mb: 2 }}>{icon}</Typography>
      <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3, maxWidth: 400, mx: 'auto' }}>
        {description}
      </Typography>
      <Button
        variant="contained"
        size="small"
        startIcon={<Eye size={16} />}
        onClick={() => navigate(`/conventions/${id}`)}
        sx={{ ...componentStyles.buttonPrimary, textTransform: 'none' }}
      >
        Aller a la page de visualisation
      </Button>
    </Box>
  )

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[
          { label: 'Conventions', path: '/conventions' },
          { label: convention.code, path: `/conventions/${id}` },
          { label: 'Modifier' },
        ]}
        actions={
          <>
            <StatusBadge status={convention.statut} size="small" />
            <Button
              size="small"
              startIcon={<Eye size={14} />}
              onClick={() => navigate(`/conventions/${id}`)}
              sx={{ ...componentStyles.buttonSecondary, textTransform: 'none', fontSize: typography.sizes.sm }}
            >
              Voir
            </Button>
            <Button
              size="small"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => navigate(`/conventions/${id}`)}
              sx={{ ...componentStyles.buttonGhost, textTransform: 'none', fontSize: typography.sizes.sm }}
            >
              Retour
            </Button>
          </>
        }
        hideBottomRow
      />

      <Box sx={{ bgcolor: colors.background, minHeight: 'calc(100vh - 48px)' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Alert
            severity="info"
            sx={{
              mb: 3,
              bgcolor: colors.primary[25],
              border: `1px solid ${colors.primary[100]}`,
              '& .MuiAlert-icon': { color: colors.primary[600] },
              '& .MuiAlert-message': { color: colors.textPrimary },
            }}
          >
            <strong>Edition granulaire</strong> - Chaque section se sauvegarde independamment. Cliquez sur "Modifier" dans une section, puis "Enregistrer" pour sauvegarder.
          </Alert>

          <FormView
            isEditing={false}
            statusSteps={CONVENTION_STATUS_STEPS}
            currentStatus={convention.statut}
          >
            <Notebook
              tabs={[
                {
                  label: 'Informations',
                  content: (
                    <Container maxWidth="md" disableGutters>
                      <ConventionInfoEditCard conventionId={conventionId} />
                    </Container>
                  ),
                },
                {
                  label: 'Finances',
                  content: (
                    <Container maxWidth="md" disableGutters>
                      <ConventionFinancesEditCard conventionId={conventionId} />
                    </Container>
                  ),
                },
                {
                  label: 'Dates',
                  content: (
                    <Container maxWidth="md" disableGutters>
                      <ConventionDatesEditCard conventionId={conventionId} />
                    </Container>
                  ),
                },
                {
                  label: 'Partenaires',
                  content: placeholderTab(
                    '\ud83e\udd1d',
                    'Gestion des partenaires',
                    'Les partenaires et imputations analytiques se gerent depuis la page de visualisation de la convention.'
                  ),
                },
                {
                  label: 'Versements',
                  content: placeholderTab(
                    '\ud83c\udfe6',
                    'Versements previsionnels',
                    'Le calendrier previsionnel des versements se gere depuis la page de visualisation de la convention.'
                  ),
                },
              ]}
            />
          </FormView>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionEditPageComplete
