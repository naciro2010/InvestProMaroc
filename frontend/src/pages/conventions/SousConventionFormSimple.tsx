import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
  Alert,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Save, Close, AccountBalance, People } from '@mui/icons-material'
import DecimalInput from '../../components/ui/DecimalInput'
import RichTextEditor from '../../components/ui/RichTextEditor'
import { conventionsAPI } from '../../lib/api'
import { colors, typography, borders } from '../../lib/designSystem'
import { AxiosError } from 'axios'

interface ParentConventionInfo {
  id: number
  numero: string
  libelle: string
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  budget?: number
}

interface EditingSousConventionData {
  id: number
  code: string
  numero: string
  libelle: string
  objet?: string
  dateConvention?: string
  dateDebut?: string
  dateFin?: string | null
  budget?: number
  tauxCommission?: number
  baseCalcul?: string
  tauxTva?: number
  heriteParametres?: boolean
  statut?: string
  montant?: number
}

interface SousConventionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  parentConvention: ParentConventionInfo
  editingSousConvention?: EditingSousConventionData | null
}

interface ParentPartenaireData {
  id: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const SousConventionFormSimple = ({
  open,
  onClose,
  onSuccess,
  parentConvention,
  editingSousConvention,
}: SousConventionFormProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [heriteParametres, setHeriteParametres] = useState(true)
  const [parentPartenaires, setParentPartenaires] = useState<ParentPartenaireData[]>([])
  const [loadingPartenaires, setLoadingPartenaires] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    numero: '',
    libelle: '',
    objet: '',
    dateConvention: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    budget: '',
    tauxCommission: String(parentConvention.tauxCommission),
    baseCalcul: parentConvention.baseCalcul,
    tauxTva: String(parentConvention.tauxTva),
  })

  useEffect(() => {
    if (editingSousConvention) {
      setFormData({
        code: editingSousConvention.code || '',
        numero: editingSousConvention.numero || '',
        libelle: editingSousConvention.libelle || '',
        objet: editingSousConvention.objet || '',
        dateConvention: editingSousConvention.dateConvention || new Date().toISOString().split('T')[0],
        dateDebut: editingSousConvention.dateDebut || new Date().toISOString().split('T')[0],
        dateFin: editingSousConvention.dateFin || '',
        budget: String(editingSousConvention.budget || ''),
        tauxCommission: String(editingSousConvention.tauxCommission || parentConvention.tauxCommission),
        baseCalcul: editingSousConvention.baseCalcul || parentConvention.baseCalcul,
        tauxTva: String(editingSousConvention.tauxTva || parentConvention.tauxTva),
      })
      setHeriteParametres(editingSousConvention.heriteParametres ?? true)
    } else {
      setFormData({
        code: '',
        numero: '',
        libelle: '',
        objet: '',
        dateConvention: new Date().toISOString().split('T')[0],
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: '',
        budget: '',
        tauxCommission: String(parentConvention.tauxCommission),
        baseCalcul: parentConvention.baseCalcul,
        tauxTva: String(parentConvention.tauxTva),
      })
      setHeriteParametres(true)
    }
  }, [editingSousConvention, parentConvention, open])

  // Load parent partenaires when dialog opens
  useEffect(() => {
    if (open && parentConvention.id) {
      loadParentPartenaires()
    }
  }, [open, parentConvention.id])

  const loadParentPartenaires = async () => {
    try {
      setLoadingPartenaires(true)
      const response = await conventionsAPI.getPartenaires(parentConvention.id)
      const data = response.data.data || response.data || []
      setParentPartenaires(Array.isArray(data) ? data : [])
    } catch {
      setParentPartenaires([])
    } finally {
      setLoadingPartenaires(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget),
        tauxCommission: parseFloat(formData.tauxCommission),
        tauxTva: parseFloat(formData.tauxTva),
        typeConvention: 'SPECIFIQUE',
        heriteParametres,
        dateFin: formData.dateFin || null,
      }

      if (editingSousConvention) {
        await conventionsAPI.updateSousConvention(editingSousConvention.id, payload)
      } else {
        await conventionsAPI.createSousConvention(parentConvention.id, payload)
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message as string)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur lors de l\'enregistrement')
      }
    } finally {
      setLoading(false)
    }
  }

  const parentBudget = parentConvention.budget || 0
  const hasBudgetInfo = parentBudget > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingSousConvention ? 'Modifier' : 'Creer'} une Sous-Convention
        <Box sx={{ mt: 0.5, fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Convention Parente: {parentConvention.numero} - {parentConvention.libelle}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Parent Convention Budget Info Box */}
            {hasBudgetInfo && (
              <Box sx={{
                p: 2, borderRadius: borders.radius.md,
                bgcolor: colors.success[25],
                border: `1px solid ${colors.success[100]}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AccountBalance sx={{ fontSize: 18, color: colors.success[600] }} />
                  <Typography sx={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.semibold,
                    color: colors.success[700],
                  }}>
                    Budget Convention Principale
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                  gap: 1.5,
                }}>
                  <Box>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      Budget Total
                    </Typography>
                    <Typography sx={{
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.bold,
                      color: colors.success[700],
                    }}>
                      {formatCurrency(parentBudget)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      Taux Commission
                    </Typography>
                    <Typography sx={{
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.semibold,
                      color: colors.textPrimary,
                    }}>
                      {parentConvention.tauxCommission}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      Base de Calcul
                    </Typography>
                    <Typography sx={{
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.semibold,
                      color: colors.textPrimary,
                    }}>
                      {parentConvention.baseCalcul === 'DECAISSEMENTS_TTC' ? 'TTC' : 'HT'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Parent's Partenaires - read-only reference */}
            {parentPartenaires.length > 0 && (
              <Box sx={{
                p: 2, borderRadius: borders.radius.md,
                bgcolor: colors.neutral[25],
                border: `1px solid ${colors.neutral[200]}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <People sx={{ fontSize: 18, color: colors.primary[600] }} />
                  <Typography sx={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  }}>
                    Partenaires de la convention parente
                  </Typography>
                  <Chip
                    label={parentPartenaires.length}
                    size="small"
                    sx={{
                      height: 20, fontSize: typography.sizes.xs,
                      bgcolor: colors.primary[100], color: colors.primary[700],
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {parentPartenaires.map((p) => (
                    <Chip
                      key={p.id}
                      label={`${p.partenaireSigle || p.partenaireCode} - ${formatCurrency(p.budgetAlloue)} (${p.pourcentage.toFixed(1)}%)`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: typography.sizes.xs,
                        borderColor: colors.neutral[300],
                        color: colors.textPrimary,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {loadingPartenaires && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
                fullWidth
                size="small"
              />
            </Stack>

            <TextField
              label="Libelle"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              required
              fullWidth
              size="small"
            />

            <RichTextEditor
              label="Objet / Description"
              value={formData.objet}
              onChange={(content) => setFormData({ ...formData, objet: content })}
              placeholder="Description detaillee de la sous-convention..."
              minHeight="100px"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Date Convention"
                type="date"
                value={formData.dateConvention}
                onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date Debut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date Fin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <DecimalInput
              label="Budget Total"
              value={parseFloat(formData.budget) || 0}
              onChange={(value) => setFormData({ ...formData, budget: value.toString() })}
              required
              fullWidth
              size="small"
              decimalPlaces={2}
              min={0}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={heriteParametres}
                  onChange={(e) => setHeriteParametres(e.target.checked)}
                />
              }
              label="Heriter des parametres de la convention parente"
            />

            {!heriteParametres && (
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <DecimalInput
                    label="Taux Commission (%)"
                    value={parseFloat(formData.tauxCommission) || 0}
                    onChange={(value) => setFormData({ ...formData, tauxCommission: value.toString() })}
                    required
                    fullWidth
                    size="small"
                    decimalPlaces={2}
                    min={0}
                    max={100}
                  />
                  <DecimalInput
                    label="Taux TVA (%)"
                    value={parseFloat(formData.tauxTva) || 0}
                    onChange={(value) => setFormData({ ...formData, tauxTva: value.toString() })}
                    required
                    fullWidth
                    size="small"
                    decimalPlaces={2}
                    min={0}
                    max={100}
                  />
                </Stack>
                <TextField
                  label="Base de Calcul"
                  select
                  value={formData.baseCalcul}
                  onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
                  required
                  fullWidth
                  size="small"
                >
                  <MenuItem value="DECAISSEMENTS_TTC">Decaissements TTC</MenuItem>
                  <MenuItem value="DECAISSEMENTS_HT">Decaissements HT</MenuItem>
                </TextField>
              </Stack>
            )}

            {heriteParametres && (
              <Alert severity="info">
                Heritage: Taux commission {parentConvention.tauxCommission}%, Base {parentConvention.baseCalcul}, TVA {parentConvention.tauxTva}%
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<Close />} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading}>
            {loading ? 'Enregistrement...' : editingSousConvention ? 'Modifier' : 'Creer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SousConventionFormSimple
