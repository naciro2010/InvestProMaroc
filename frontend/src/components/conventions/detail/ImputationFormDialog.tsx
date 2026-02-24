import React, { useState } from 'react'
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
import { Save, Cancel } from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'

interface ImputationPrevisionnelle {
  id: number
  conventionId: number
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue?: string
  montantPrevu?: number
  remarques?: string
}

interface ImputationFormDialogProps {
  open: boolean
  conventionId: number
  onClose: () => void
  onSuccess: (imputation: ImputationPrevisionnelle) => void
}

interface ImputationFormData {
  volet: string
  dateDemarrage: string
  delaiMois: number
  montantPrevu: string
  remarques: string
}

const calculateEndDate = (startDate: string, delaiMois: number): string => {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + delaiMois)
  return date.toLocaleDateString('fr-FR')
}

const ImputationFormDialog = ({ open, conventionId, onClose, onSuccess }: ImputationFormDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ImputationFormData>({
    volet: '',
    dateDemarrage: new Date().toISOString().split('T')[0],
    delaiMois: 12,
    montantPrevu: '',
    remarques: '',
  })

  const handleChange = (field: keyof ImputationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.dateDemarrage || formData.delaiMois <= 0) {
      setError('La date de demarrage et le delai sont obligatoires')
      return
    }
    try {
      setLoading(true); setError(null)
      const payload = {
        volet: formData.volet || null,
        dateDemarrage: formData.dateDemarrage,
        delaiMois: formData.delaiMois,
        montantPrevu: formData.montantPrevu ? parseFloat(formData.montantPrevu) : null,
        remarques: formData.remarques || null,
      }
      const res = await conventionsAPI.ajouterImputation(conventionId, payload)
      const newImputation = res.data.data || res.data
      onSuccess(newImputation)
      // Reset form
      setFormData({ volet: '', dateDemarrage: new Date().toISOString().split('T')[0], delaiMois: 12, montantPrevu: '', remarques: '' })
    } catch {
      setError("Erreur lors de l'ajout de l'imputation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.primary[700], fontWeight: typography.weights.semibold }}>
        Ajouter une imputation previsionnelle
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Volet / Composante" value={formData.volet}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('volet', e.target.value)}
            placeholder="Ex: Volet 1 - Infrastructure" size="small" />
          <TextField label="Date de demarrage" type="date" value={formData.dateDemarrage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('dateDemarrage', e.target.value)}
            InputLabelProps={{ shrink: true }} required size="small" />
          <DecimalInput label="Delai (mois)" value={formData.delaiMois}
            onChange={(value) => handleChange('delaiMois', value)} decimalPlaces={0} min={1} required size="small"
            helperText={formData.dateDemarrage && formData.delaiMois > 0 ? `Date fin prevue: ${calculateEndDate(formData.dateDemarrage, formData.delaiMois)}` : ''} />
          <DecimalInput label="Montant prevu (MAD)" value={parseFloat(formData.montantPrevu) || 0}
            onChange={(value) => handleChange('montantPrevu', value.toString())} decimalPlaces={2} min={0} size="small" />
          <TextField label="Remarques" multiline rows={2} value={formData.remarques}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('remarques', e.target.value)}
            placeholder="Notes et observations..." size="small" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} startIcon={<Cancel />}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImputationFormDialog
