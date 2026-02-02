import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'

interface VersementPrevisionnel {
  id: number
  axe?: string
  projet?: string
  volet?: string
  dateVersement: string
  montant: number
}

interface VersementFormDialogProps {
  open: boolean
  conventionId: number
  onClose: () => void
  onSuccess: () => void
  editingVersement: VersementPrevisionnel | null
}

const VersementFormDialog = ({
  open,
  conventionId,
  onClose,
  onSuccess,
  editingVersement,
}: VersementFormDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    axe: '',
    projet: '',
    volet: '',
    dateVersement: '',
    montant: 0,
  })

  useEffect(() => {
    if (open) {
      if (editingVersement) {
        setFormData({
          axe: editingVersement.axe || '',
          projet: editingVersement.projet || '',
          volet: editingVersement.volet || '',
          dateVersement: editingVersement.dateVersement?.split('T')[0] || '',
          montant: editingVersement.montant,
        })
      } else {
        setFormData({
          axe: '',
          projet: '',
          volet: '',
          dateVersement: '',
          montant: 0,
        })
      }
      setError(null)
    }
  }, [open, editingVersement])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.dateVersement || formData.montant <= 0) {
      setError('La date et le montant sont obligatoires')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload = {
        axe: formData.axe || null,
        projet: formData.projet || null,
        volet: formData.volet || null,
        dateVersement: formData.dateVersement,
        montant: formData.montant,
      }

      if (editingVersement) {
        await versementsPrevisionnelsAPI.update(editingVersement.id, payload)
      } else {
        await versementsPrevisionnelsAPI.create(conventionId, payload)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving versement:', err)
      setError('Erreur lors de l\'enregistrement du versement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.primary[700], fontWeight: typography.weights.semibold }}>
        {editingVersement ? 'Modifier le versement' : 'Ajouter un versement prévisionnel'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Axe"
            value={formData.axe}
            onChange={(e) => handleChange('axe', e.target.value)}
            placeholder="Ex: Infrastructure"
            size="small"
          />

          <TextField
            label="Projet"
            value={formData.projet}
            onChange={(e) => handleChange('projet', e.target.value)}
            placeholder="Ex: Projet Route Nord"
            size="small"
          />

          <TextField
            label="Volet"
            value={formData.volet}
            onChange={(e) => handleChange('volet', e.target.value)}
            placeholder="Ex: Phase 1"
            size="small"
          />

          <TextField
            label="Date de versement"
            type="date"
            value={formData.dateVersement}
            onChange={(e) => handleChange('dateVersement', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            size="small"
          />

          <TextField
            label="Montant"
            type="number"
            value={formData.montant}
            onChange={(e) => handleChange('montant', parseFloat(e.target.value) || 0)}
            InputProps={{
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
            required
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} startIcon={<Cancel />}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
        >
          {editingVersement ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VersementFormDialog
