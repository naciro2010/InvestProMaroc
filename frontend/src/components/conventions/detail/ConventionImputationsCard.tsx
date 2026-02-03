import { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { Add, Delete, TrendingUp, Schedule, Save, Cancel } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, componentStyles, typography } from '@/lib/designSystem'

interface ImputationPrevisionnelle {
  id: number
  conventionId: number
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue?: string
  remarques?: string
}

interface ConventionImputationsCardProps {
  conventionId: number
  imputations?: ImputationPrevisionnelle[]
  onRefresh?: () => void
}

interface ImputationFormData {
  volet: string
  dateDemarrage: string
  delaiMois: number
  remarques: string
}

const ConventionImputationsCard = ({
  conventionId,
  imputations: initialImputations,
  onRefresh
}: ConventionImputationsCardProps) => {
  const [imputations, setImputations] = useState<ImputationPrevisionnelle[]>(initialImputations || [])
  const [loading, setLoading] = useState(!initialImputations)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ImputationFormData>({
    volet: '',
    dateDemarrage: new Date().toISOString().split('T')[0],
    delaiMois: 12,
    remarques: '',
  })

  // Load imputations from API if not provided as props
  useEffect(() => {
    if (initialImputations) {
      setImputations(initialImputations)
      setLoading(false)
    } else {
      // Fetch from API
      const loadImputations = async () => {
        try {
          setLoading(true)
          const res = await conventionsAPI.getImputations(conventionId)
          setImputations(res.data.data || [])
          setError(null)
        } catch (err) {
          console.error('Error loading imputations:', err)
          setError('Erreur lors du chargement des imputations')
        } finally {
          setLoading(false)
        }
      }
      loadImputations()
    }
  }, [initialImputations, conventionId])

  const handleDelete = async (imputationId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette imputation ?')) return

    try {
      await conventionsAPI.supprimerImputation(conventionId, imputationId)
      setImputations(prev => prev.filter(i => i.id !== imputationId))
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error deleting imputation:', err)
      setError('Erreur lors de la suppression')
    }
  }

  const handleFormChange = (field: keyof ImputationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.dateDemarrage || formData.delaiMois <= 0) {
      setFormError('La date de démarrage et le délai sont obligatoires')
      return
    }

    try {
      setFormLoading(true)
      setFormError(null)

      const payload = {
        volet: formData.volet || null,
        dateDemarrage: formData.dateDemarrage,
        delaiMois: formData.delaiMois,
        remarques: formData.remarques || null,
      }

      const res = await conventionsAPI.ajouterImputation(conventionId, payload)
      const newImputation = res.data.data || res.data

      setImputations(prev => [...prev, newImputation])
      setDialogOpen(false)
      setFormData({
        volet: '',
        dateDemarrage: new Date().toISOString().split('T')[0],
        delaiMois: 12,
        remarques: '',
      })
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error adding imputation:', err)
      setFormError('Erreur lors de l\'ajout de l\'imputation')
    } finally {
      setFormLoading(false)
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const calculateEndDate = (startDate: string, delaiMois: number): string => {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + delaiMois)
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <Paper sx={{ ...componentStyles.card, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: colors.info[600] }} />
          <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
            Imputations prévisionnelles
          </Typography>
          {imputations.length > 0 && (
            <Chip
              label={imputations.length}
              size="small"
              sx={{
                bgcolor: colors.info[100],
                color: colors.info[700],
                fontWeight: typography.weights.medium,
              }}
            />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Add />}
          variant="outlined"
          onClick={() => setDialogOpen(true)}
          sx={{ borderColor: colors.primary[300], color: colors.primary[600] }}
        >
          Ajouter
        </Button>
      </Box>
      <Divider sx={{ mb: 2, borderColor: colors.border }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : imputations.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Volet</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Date démarrage</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Délai</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Date fin prévue</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Remarques</TableCell>
                <TableCell align="center" sx={{ fontWeight: typography.weights.semibold }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {imputations.map((imputation) => (
                <TableRow key={imputation.id} hover>
                  <TableCell>
                    {imputation.volet ? (
                      <Chip
                        label={imputation.volet}
                        size="small"
                        sx={{
                          bgcolor: colors.purple[50],
                          color: colors.purple[700],
                          fontSize: typography.sizes.xs,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(imputation.dateDemarrage)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: colors.textSecondary }} />
                      <Typography variant="body2" sx={{ fontWeight: typography.weights.medium }}>
                        {imputation.delaiMois} mois
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {imputation.dateFinPrevue
                        ? formatDate(imputation.dateFinPrevue)
                        : calculateEndDate(imputation.dateDemarrage, imputation.delaiMois)
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {imputation.remarques || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(imputation.id)}
                        sx={{ color: colors.danger[500] }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Aucune imputation prévisionnelle
          </Typography>
        </Box>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.primary[700], fontWeight: typography.weights.semibold }}>
          Ajouter une imputation prévisionnelle
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Volet / Composante"
              value={formData.volet}
              onChange={(e) => handleFormChange('volet', e.target.value)}
              placeholder="Ex: Volet 1 - Infrastructure"
              size="small"
            />

            <TextField
              label="Date de démarrage"
              type="date"
              value={formData.dateDemarrage}
              onChange={(e) => handleFormChange('dateDemarrage', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              size="small"
            />

            <TextField
              label="Délai (mois)"
              type="number"
              value={formData.delaiMois}
              onChange={(e) => handleFormChange('delaiMois', parseInt(e.target.value) || 0)}
              inputProps={{ min: 1 }}
              required
              size="small"
              helperText={
                formData.dateDemarrage && formData.delaiMois > 0
                  ? `Date fin prévue: ${calculateEndDate(formData.dateDemarrage, formData.delaiMois)}`
                  : ''
              }
            />

            <TextField
              label="Remarques"
              multiline
              rows={2}
              value={formData.remarques}
              onChange={(e) => handleFormChange('remarques', e.target.value)}
              placeholder="Notes et observations..."
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={formLoading}
            startIcon={<Cancel />}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={16} /> : <Save />}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default ConventionImputationsCard
