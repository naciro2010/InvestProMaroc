import { useState, useEffect } from 'react'
import {
  Box, Typography, Stack, CircularProgress, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, LinearProgress, Tooltip,
} from '@mui/material'
import {
  Add, PlayArrow, Pause, Refresh, Flag, Warning, CheckCircle,
} from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'
import StatusBadge from '@/components/core/StatusBadge'

interface OrdreServiceDTO {
  id: number
  marcheId: number
  numeroOrdre: string
  typeOrdre: string
  dateOrdre: string
  dateEffet: string | null
  reference: string | null
  motif: string | null
  observations: string | null
  dureeArretJours: number | null
  actif: boolean
  createdAt: string | null
  updatedAt: string | null
}

interface DureeCalcul {
  marcheId: number
  delaiContractuelMois: number | null
  delaiContractuelJours: number
  dateDebutTravaux: string | null
  dateFinContractuelle: string | null
  joursCalendaireEcoules: number
  joursTravailles: number
  joursArret: number
  joursDepassement: number
  estEnRetard: boolean
  tauxPenaliteJour: number
  montantMarcheHT: number
  montantPenalites: number
  plafondPenalites: number
  penalitesPlafonnees: number
  ordresService: OrdreServiceDTO[]
}

interface MarcheOrdresServiceSectionProps {
  marcheId: number
}

const typeOrdreOptions = [
  { value: 'COMMENCEMENT', label: 'Commencement', icon: <PlayArrow fontSize="small" /> },
  { value: 'ARRET', label: 'Arrêt', icon: <Pause fontSize="small" /> },
  { value: 'REPRISE', label: 'Reprise', icon: <Refresh fontSize="small" /> },
  { value: 'RECEPTION_PROVISOIRE', label: 'Réception provisoire', icon: <Flag fontSize="small" /> },
  { value: 'RECEPTION_DEFINITIVE', label: 'Réception définitive', icon: <CheckCircle fontSize="small" /> },
]

const sectionHeaderSx = {
  fontSize: typography.sizes.xs,
  fontWeight: typography.weights.semibold,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

/**
 * MICRO-COMPONENT: MarcheOrdresServiceSection
 * Displays service orders timeline, duration calculations, and penalty info.
 * Loads data from /api/marches/{id}/ordres-service/duree-penalites
 */
const MarcheOrdresServiceSection = ({ marcheId }: MarcheOrdresServiceSectionProps) => {
  const [dureeCalc, setDureeCalc] = useState<DureeCalcul | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    numeroOrdre: '',
    typeOrdre: 'COMMENCEMENT',
    dateOrdre: new Date().toISOString().split('T')[0],
    dateEffet: '',
    reference: '',
    motif: '',
    observations: '',
    dureeArretJours: '',
  })

  useEffect(() => {
    loadData()
  }, [marcheId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await marchesAPI.getDureePenalites(marcheId)
      setDureeCalc(data.data || data)
    } catch (err) {
      console.error('Erreur chargement ordres de service:', err)
      setError('Erreur lors du chargement des ordres de service')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      await marchesAPI.createOrdreService(marcheId, {
        marcheId,
        numeroOrdre: formData.numeroOrdre,
        typeOrdre: formData.typeOrdre,
        dateOrdre: formData.dateOrdre,
        dateEffet: formData.dateEffet || null,
        reference: formData.reference || null,
        motif: formData.motif || null,
        observations: formData.observations || null,
        dureeArretJours: formData.dureeArretJours ? parseInt(formData.dureeArretJours) : null,
      })
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Erreur création ordre de service:', err)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      numeroOrdre: '',
      typeOrdre: 'COMMENCEMENT',
      dateOrdre: new Date().toISOString().split('T')[0],
      dateEffet: '',
      reference: '',
      motif: '',
      observations: '',
      dureeArretJours: '',
    })
  }

  const formatDate = (date: string | null): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <Box sx={{ ...componentStyles.card, p: 3, mb: 3, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ ...componentStyles.card, p: 3, mb: 3 }}>
        <Alert severity="info">{error}</Alert>
      </Box>
    )
  }

  const ordres = dureeCalc?.ordresService || []

  return (
    <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ bgcolor: colors.neutral[50], borderBottom: `1px solid ${colors.border}`, px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
          Ordres de Service & Pénalités
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={componentStyles.buttonPrimary}
        >
          Nouvel Ordre
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Duration Summary Cards */}
          {dureeCalc && (
            <DureeSummary dureeCalc={dureeCalc} formatCurrency={formatCurrency} formatDate={formatDate} />
          )}

          {/* Orders Table */}
          {ordres.length > 0 ? (
            <Box>
              <Typography sx={{ ...sectionHeaderSx, mb: 2 }}>Chronologie des ordres</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.textSecondary }}>N° Ordre</TableCell>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.textSecondary }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.textSecondary }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.textSecondary }}>Date Effet</TableCell>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.textSecondary }}>Référence</TableCell>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.textSecondary }}>Motif</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordres.map((ordre) => (
                      <TableRow key={ordre.id} hover>
                        <TableCell sx={{ fontWeight: typography.weights.medium }}>{ordre.numeroOrdre}</TableCell>
                        <TableCell><StatusBadge status={ordre.typeOrdre} size="small" /></TableCell>
                        <TableCell>{formatDate(ordre.dateOrdre)}</TableCell>
                        <TableCell>{formatDate(ordre.dateEffet)}</TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>{ordre.reference || '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Tooltip title={ordre.motif || ''}>
                            <span>{ordre.motif || '-'}</span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                Aucun ordre de service enregistré
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvel Ordre de Service</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth label="N° Ordre" required
              value={formData.numeroOrdre}
              onChange={(e) => setFormData({ ...formData, numeroOrdre: e.target.value })}
              placeholder="OS-001"
            />
            <TextField
              fullWidth select label="Type d'ordre" required
              value={formData.typeOrdre}
              onChange={(e) => setFormData({ ...formData, typeOrdre: e.target.value })}
            >
              {typeOrdreOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth label="Date de l'ordre" type="date" required
                value={formData.dateOrdre}
                onChange={(e) => setFormData({ ...formData, dateOrdre: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth label="Date d'effet" type="date"
                value={formData.dateEffet}
                onChange={(e) => setFormData({ ...formData, dateEffet: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Par défaut = date de l'ordre"
              />
            </Box>
            <TextField
              fullWidth label="Référence"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
            {formData.typeOrdre === 'ARRET' && (
              <TextField
                fullWidth label="Motif de l'arrêt" multiline rows={2}
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                placeholder="Intempéries, problème technique..."
              />
            )}
            <TextField
              fullWidth label="Observations" multiline rows={2}
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.numeroOrdre || !formData.dateOrdre}
            sx={componentStyles.buttonPrimary}
          >
            {saving ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Sub-component: Duration & Penalty Summary
interface DureeSummaryProps {
  dureeCalc: DureeCalcul
  formatCurrency: (n: number) => string
  formatDate: (d: string | null) => string
}

const DureeSummary = ({ dureeCalc, formatCurrency, formatDate }: DureeSummaryProps) => {
  const {
    delaiContractuelMois, delaiContractuelJours, dateDebutTravaux, dateFinContractuelle,
    joursCalendaireEcoules, joursTravailles, joursArret, joursDepassement,
    estEnRetard, montantMarcheHT, penalitesPlafonnees, plafondPenalites,
  } = dureeCalc

  const progressPct = delaiContractuelJours > 0
    ? Math.min(100, (joursTravailles / delaiContractuelJours) * 100)
    : 0

  const progressColor = estEnRetard ? colors.danger[500] : joursTravailles > delaiContractuelJours * 0.8 ? colors.warning[500] : colors.success[500]

  return (
    <Stack spacing={2}>
      {/* KPI Cards Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        <KPICard label="Délai contractuel" value={delaiContractuelMois ? `${delaiContractuelMois} mois` : '-'} sub={`${delaiContractuelJours} jours`} />
        <KPICard label="Jours travaillés" value={`${joursTravailles}`} sub={`/ ${delaiContractuelJours} jours`} />
        <KPICard label="Jours d'arrêt" value={`${joursArret}`} sub="jours suspendus" color={joursArret > 0 ? colors.warning[600] : undefined} />
        <KPICard
          label="Dépassement"
          value={`${joursDepassement}`}
          sub={estEnRetard ? 'jours de retard' : 'dans les délais'}
          color={estEnRetard ? colors.danger[600] : colors.success[600]}
          icon={estEnRetard ? <Warning fontSize="small" sx={{ color: colors.danger[500] }} /> : undefined}
        />
      </Box>

      {/* Progress Bar */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Avancement: {formatDate(dateDebutTravaux)} - {formatDate(dateFinContractuelle)}
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: progressColor }}>
            {Math.round(progressPct)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, progressPct)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 4 },
          }}
        />
      </Box>

      {/* Penalty Alert */}
      {estEnRetard && (
        <Alert severity="warning" icon={<Warning />}>
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm }}>
              Pénalités de retard: {formatCurrency(penalitesPlafonnees)} DH
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {joursDepassement} jours de retard x taux {dureeCalc.tauxPenaliteJour} x {formatCurrency(montantMarcheHT)} DH HT
              (plafond 10%: {formatCurrency(plafondPenalites)} DH)
            </Typography>
          </Stack>
        </Alert>
      )}

      {!estEnRetard && joursTravailles > 0 && (
        <Chip
          icon={<CheckCircle />}
          label="Marché dans les délais contractuels"
          color="success"
          variant="outlined"
          size="small"
        />
      )}
    </Stack>
  )
}

// Sub-component: KPI Card
interface KPICardProps {
  label: string
  value: string
  sub: string
  color?: string
  icon?: React.ReactNode
}

const KPICard = ({ label, value, sub, color, icon }: KPICardProps) => (
  <Box sx={{ ...componentStyles.card, p: 2, textAlign: 'center' }}>
    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </Typography>
    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
      {icon}
      <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: color || colors.textPrimary }}>
        {value}
      </Typography>
    </Stack>
    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mt: 0.25 }}>
      {sub}
    </Typography>
  </Box>
)

export default MarcheOrdresServiceSection
