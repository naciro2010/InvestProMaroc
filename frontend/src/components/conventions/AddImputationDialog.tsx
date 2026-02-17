import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material'
import { Add, Cancel } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'
import DecimalInput from '@/components/ui/DecimalInput'

interface ImputationPrevisionnelleForm {
  volet?: string
  dateDemarrage: string
  delaiMois: number
  remarques?: string
}

interface AddImputationDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (imputation: ImputationPrevisionnelleForm) => Promise<void>
}

const AddImputationDialog = ({ open, onClose, onAdd }: AddImputationDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ImputationPrevisionnelleForm>({
    volet: '',
    dateDemarrage: new Date().toISOString().split('T')[0],
    delaiMois: 12,
    remarques: '',
  })

  const handleChange = (field: keyof ImputationPrevisionnelleForm, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async () => {
    if (!formData.dateDemarrage || formData.delaiMois <= 0) {
      setError('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onAdd(formData)
      setFormData({
        volet: '',
        dateDemarrage: new Date().toISOString().split('T')[0],
        delaiMois: 12,
        remarques: '',
      })
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erreur lors de l\'ajout')
      } else {
        setError('Erreur lors de l\'ajout')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.primary[700], fontWeight: typography.weights.semibold }}>
        Ajouter une Imputation Prévisionnelle
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            fullWidth
            label="Volet / Composante"
            value={formData.volet}
            onChange={(e) => handleChange('volet', e.target.value)}
            placeholder="Ex: Volet 1 - Infrastructure"
            size="small"
          />
          <TextField
            fullWidth
            required
            type="date"
            label="Date de Démarrage"
            value={formData.dateDemarrage}
            onChange={(e) => handleChange('dateDemarrage', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <DecimalInput
            fullWidth
            required
            label="Délai (mois)"
            value={formData.delaiMois}
            onChange={(value) => handleChange('delaiMois', value)}
            decimalPlaces={0}
            min={1}
            size="small"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarques"
            value={formData.remarques}
            onChange={(e) => handleChange('remarques', e.target.value)}
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} startIcon={<Cancel />}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Add />}
          disabled={loading}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddImputationDialog
