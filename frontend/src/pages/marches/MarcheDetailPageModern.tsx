import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Alert, Skeleton, Typography, Button, Container } from '@mui/material'
import { Pencil, Lock, ArrowLeft } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge, type StatusStep } from '@/components/core'
import { marchesAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import MarcheStatsCard from './components/MarcheStatsCard'
import MarcheConventionCard from './components/MarcheConventionCard'
import MarcheInfoCard from './components/MarcheInfoCard'
import MarcheOrdresServiceSection from './components/MarcheOrdresServiceSection'
import MarcheLignesSection from './components/MarcheLignesSection'
import MarcheSituationPaiementCard from './components/MarcheSituationPaiementCard'
import MarcheDecomptesSection from './components/MarcheDecomptesSection'
import MarchePaiementsSection from './components/MarchePaiementsSection'
import MarcheAvenantsSection from './components/MarcheAvenantsSection'

interface MarcheBasicInfo {
  id: number
  numeroMarche: string
  objet: string
  statut: string
  dateMarche: string
  conventionId?: number
  conventionCode?: string
  fournisseurNom?: string
  montantHt?: number
  montantTtc?: number
  typeMarche?: string
  natureMarche?: string
  delaiExecution?: number
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'VALIDE', label: 'Valide' },
  { value: 'TERMINE', label: 'Termine' },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const MarcheDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [marche, setMarche] = useState<MarcheBasicInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const marcheId = id ? parseInt(id) : 0

  const loadMarche = useCallback(async (mid: number) => {
    try {
      setLoading(true)
      setError(null)
      const res = await marchesAPI.getById(mid)
      const data = res.data?.data || res.data
      setMarche(data)
    } catch {
      setError('Erreur lors du chargement du marche')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (marcheId) loadMarche(marcheId)
  }, [marcheId, loadMarche])

  if (!id) {
    return (
      <AppLayout>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">ID du marche manquant</Alert>
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

  if (error || !marche) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error || 'Marche non trouve'}</Alert>
          <Button onClick={() => navigate('/marches')} sx={componentStyles.buttonSecondary}>
            Retour aux marches
          </Button>
        </Container>
      </AppLayout>
    )
  }

  const canEdit = marche.statut === 'BROUILLON' || marche.statut === 'EN_COURS'

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        {/* ControlPanel - breadcrumbs + actions */}
        <ControlPanel
          breadcrumbs={[
            { label: 'Marches', path: '/marches' },
            { label: marche.numeroMarche || `#${marche.id}` },
          ]}
          actions={
            <>
              <StatusBadge status={marche.statut} size="small" />
              <Button
                variant="outlined"
                size="small"
                disabled={!canEdit}
                onClick={() => navigate(`/marches/${id}/modifier`)}
                sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}
              >
                {canEdit
                  ? <Pencil size={14} style={{ marginRight: 4 }} />
                  : <Lock size={14} style={{ marginRight: 4 }} />
                }
                Modifier
              </Button>
              <Button
                size="small"
                startIcon={<ArrowLeft size={14} />}
                onClick={() => navigate('/marches')}
                sx={{ ...componentStyles.buttonGhost, textTransform: 'none', fontSize: typography.sizes.sm }}
              >
                Liste
              </Button>
            </>
          }
          hideBottomRow
        />

        {/* Main content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView
            isEditing={false}
            statusSteps={STATUS_STEPS}
            currentStatus={marche.statut}
          >
            {/* Title */}
            <Typography sx={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: 0.5,
            }}>
              {marche.objet || marche.numeroMarche}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              {marche.numeroMarche}
            </Typography>

            {/* Fields - single flat block */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Numero" value={marche.numeroMarche} />
                <Field label="Statut" value={<StatusBadge status={marche.statut} />} />
                <Field label="Type" value={marche.typeMarche || '-'} />
                <Field label="Nature" value={marche.natureMarche || '-'} />
                <Field label="Montant HT" value={marche.montantHt ? formatCurrency(marche.montantHt) : '-'} isMoney />
                <Field label="Montant TTC" value={marche.montantTtc ? formatCurrency(marche.montantTtc) : '-'} isMoney />
                <Field label="Fournisseur" value={marche.fournisseurNom || '-'} />
                <Field label="Delai execution" value={marche.delaiExecution ? `${marche.delaiExecution} jours` : '-'} />
                {marche.conventionId && marche.conventionCode && (
                  <Field
                    label="Convention"
                    value={marche.conventionCode}
                    isLink
                    onLinkClick={() => navigate(`/conventions/${marche.conventionId}`)}
                  />
                )}
              </FieldGroup>
            </Box>

            {/* Stats Card - micro-component with independent data loading */}
            <MarcheStatsCard marcheId={marcheId} />

            {/* Notebook tabs - each tab loads data independently */}
            <Box sx={{ mt: 3 }}>
              <Notebook
                tabs={[
                  {
                    label: 'Detail',
                    content: (
                      <Box>
                        <MarcheConventionCard marcheId={marcheId} />
                        <Box sx={{ mt: 3 }}>
                          <MarcheInfoCard marcheId={marcheId} />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <MarcheOrdresServiceSection marcheId={marcheId} />
                        </Box>
                      </Box>
                    ),
                  },
                  {
                    label: 'Lignes',
                    content: <MarcheLignesSection marcheId={marcheId} />,
                  },
                  {
                    label: 'Situation Paiement',
                    content: (
                      <Box>
                        <MarcheSituationPaiementCard marcheId={marcheId} />
                        <Box sx={{ mt: 3 }}>
                          <MarcheDecomptesSection marcheId={marcheId} />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <MarchePaiementsSection marcheId={marcheId} />
                        </Box>
                      </Box>
                    ),
                  },
                  {
                    label: 'Avenants',
                    content: <MarcheAvenantsSection marcheId={marcheId} />,
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

export default MarcheDetailPageModern
