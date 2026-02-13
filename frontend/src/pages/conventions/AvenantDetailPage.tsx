import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Send,
  CheckCircle,
  Cancel,
  Description,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  Person,
  History,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader, StatusBadge } from '@/components/core'
import { avenantConventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { colors, componentStyles, typography, spacing } from '../../lib/designSystem'
import { AvenantConventionResponse } from '../../types/avenantConvention'

const AvenantDetailPage = () => {
  const { conventionId, avenantId } = useParams<{ conventionId: string; avenantId: string }>()
  const navigate = useNavigate()
  const { user, isAdmin, isManager } = useAuth()

  const [avenant, setAvenant] = useState<AvenantConventionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [workflowLoading, setWorkflowLoading] = useState(false)

  // Reject dialog
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
      setAvenant(response.data.data || response.data)
    } catch (err) {
      console.error('Error loading avenant:', err)
      setError('Erreur lors du chargement de l\'avenant')
    } finally {
      setLoading(false)
    }
  }

  const handleSoumettre = async () => {
    if (!avenant) return
    try {
      setWorkflowLoading(true)
      await avenantConventionsAPI.soumettre(avenant.id)
      setSuccessMessage('Avenant soumis avec succès')
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
      await avenantConventionsAPI.valider({
        avenantId: avenant.id,
        remarques: '',
      })
      setSuccessMessage('Avenant validé avec succès')
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
      await avenantConventionsAPI.rejeter({
        avenantId: avenant.id,
        motifRejet: rejectMotif,
      })
      setSuccessMessage('Avenant rejeté')
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

  // Clear messages after 5 seconds
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
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return '-'
    return `${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    )
  }

  if (error && !avenant) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/conventions/${conventionId}`)}
            sx={{ mt: 2 }}
          >
            Retour à la convention
          </Button>
        </Container>
      </AppLayout>
    )
  }

  if (!avenant) return null

  const canEdit = avenant.isEditable
  const canSoumettre = avenant.canSoumettre
  const canValider = avenant.canValider && (isAdmin || isManager)

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Messages */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Header */}
          <PageHeader
            title={`Avenant ${avenant.numeroAvenant}`}
            subtitle={avenant.objet}
            actions={
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {workflowLoading && <CircularProgress size={24} />}

                {/* BROUILLON → SOUMIS */}
                {canSoumettre && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleSoumettre}
                    disabled={workflowLoading}
                  >
                    Soumettre
                  </Button>
                )}

                {/* SOUMIS → VALIDE */}
                {canValider && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleValider}
                      disabled={workflowLoading}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={workflowLoading}
                    >
                      Rejeter
                    </Button>
                  </>
                )}

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                {canEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/conventions/${conventionId}/avenants/${avenantId}/edit`)}
                    size="small"
                  >
                    Modifier
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/conventions/${conventionId}`)}
                  size="small"
                >
                  Retour
                </Button>
              </Box>
            }
          />

          {/* Info Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            {/* General Info */}
            <Box>
              <Paper sx={{ ...componentStyles.card, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Description sx={{ color: colors.primary[600] }} />
                  <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold }}>
                    Informations générales
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Numéro d'avenant
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: typography.weights.medium }}>
                      {avenant.numeroAvenant}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Statut
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <StatusBadge status={avenant.statut} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Convention
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: typography.weights.medium,
                        color: colors.primary[600],
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => navigate(`/conventions/${conventionId}`)}
                    >
                      {avenant.conventionNumero} - {avenant.conventionLibelle}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Date de l'avenant
                    </Typography>
                    <Typography variant="body1">{formatDate(avenant.dateAvenant)}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Objet de l'avenant
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {avenant.objet}
                  </Typography>
                </Box>

                {avenant.motif && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Motif
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {avenant.motif}
                    </Typography>
                  </Box>
                )}

                {avenant.motifRejet && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Motif de rejet :</Typography>
                    <Typography variant="body2">{avenant.motifRejet}</Typography>
                  </Alert>
                )}
              </Paper>
            </Box>

            {/* Financial Impact */}
            <Box>
              <Paper sx={{ ...componentStyles.card, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {(avenant.deltaBudget || 0) >= 0 ? (
                    <TrendingUp sx={{ color: colors.success[600] }} />
                  ) : (
                    <TrendingDown sx={{ color: colors.danger[600] }} />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold }}>
                    Impact financier
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Box sx={{ p: 2, bgcolor: colors.neutral[50], borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Budget avant
                      </Typography>
                      <Typography variant="h6" sx={{ color: colors.textPrimary }}>
                        {formatCurrency(avenant.ancienBudget)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ p: 2, bgcolor: colors.primary[50], borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Budget après
                      </Typography>
                      <Typography variant="h6" sx={{ color: colors.primary[700] }}>
                        {formatCurrency(avenant.nouveauBudget)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: (avenant.deltaBudget || 0) >= 0 ? colors.success[50] : colors.danger[50],
                        borderRadius: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Variation du budget
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: (avenant.deltaBudget || 0) >= 0 ? colors.success[700] : colors.danger[700],
                          fontWeight: typography.weights.bold,
                        }}
                      >
                        {(avenant.deltaBudget || 0) >= 0 ? '+' : ''}{formatCurrency(avenant.deltaBudget)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {(avenant.ancienTauxCommission !== undefined || avenant.nouveauTauxCommission !== undefined) && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      Taux de commission
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2">
                        {formatPercentage(avenant.ancienTauxCommission)}
                      </Typography>
                      <Typography sx={{ color: colors.textSecondary }}>→</Typography>
                      <Typography variant="body2" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                        {formatPercentage(avenant.nouveauTauxCommission)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Timeline & Details */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Workflow Timeline */}
            <Box>
              <Paper sx={{ ...componentStyles.card, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <History sx={{ color: colors.info[600] }} />
                  <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold }}>
                    Historique du workflow
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Created */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.neutral[400] }} />
                      <Box sx={{ width: 2, height: 40, bgcolor: colors.border }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: typography.weights.medium }}>
                        Créé
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {formatDate(avenant.createdAt)} par {avenant.createdByName || 'Système'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Submitted */}
                  {avenant.dateSoumission && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.info[500] }} />
                        <Box sx={{ width: 2, height: 40, bgcolor: colors.border }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: typography.weights.medium }}>
                          Soumis pour validation
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {formatDate(avenant.dateSoumission)} par {avenant.soumisParName || 'Utilisateur'}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Validated */}
                  {avenant.dateValidation && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.success[500] }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: typography.weights.medium }}>
                          Validé
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {formatDate(avenant.dateValidation)} par {avenant.valideParName || 'Administrateur'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* Additional Details */}
            <Box>
              <Paper sx={{ ...componentStyles.card, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarToday sx={{ color: colors.warning[600] }} />
                  <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold }}>
                    Détails complémentaires
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'grid', gap: 2 }}>
                  {avenant.dateEffet && (
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Date d'effet
                      </Typography>
                      <Typography variant="body1">{formatDate(avenant.dateEffet)}</Typography>
                    </Box>
                  )}

                  {avenant.ordreApplication !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Ordre d'application
                      </Typography>
                      <Typography variant="body1">{avenant.ordreApplication}</Typography>
                    </Box>
                  )}

                  {avenant.detailsModifications && (
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Détails des modifications
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {avenant.detailsModifications}
                      </Typography>
                    </Box>
                  )}

                  {avenant.remarques && (
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Remarques
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {avenant.remarques}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
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
            placeholder="Décrivez les raisons du rejet..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={workflowLoading}>
            Annuler
          </Button>
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
