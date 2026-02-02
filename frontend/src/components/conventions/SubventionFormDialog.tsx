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
  MenuItem,
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { subventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'

interface Subvention {
  id: number
  conventionId: number
  organismeBailleur: string
  typeSubvention?: string
  montantTotal: number
  devise: string
  tauxChange?: number
  dateSignature?: string
  dateDebutValidite?: string
  dateFinValidite?: string
  conditions?: string
  observations?: string
}

interface SubventionFormDialogProps {
  open: boolean
  conventionId: number
  onClose: () => void
  onSuccess: () => void
  editingSubvention: Subvention | null
}

const TYPES_SUBVENTION = [
  { value: 'ETAT', label: 'Subvention de l\'État' },
  { value: 'REGION', label: 'Subvention régionale' },
  { value: 'COMMUNE', label: 'Subvention communale' },
  { value: 'FONDS_SPECIAL', label: 'Fonds spécial' },
  { value: 'BAILLEUR_INTERNATIONAL', label: 'Bailleur international' },
  { value: 'AUTRE', label: 'Autre' },
]

const DEVISES = [
  { value: 'MAD', label: 'MAD - Dirham marocain' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'USD', label: 'USD - Dollar américain' },
]

const SubventionFormDialog = ({
  open,
  conventionId,
  onClose,
  onSuccess,
  editingSubvention,
}: SubventionFormDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    organismeBailleur: '',
    typeSubvention: '',
    montantTotal: 0,
    devise: 'MAD',
    tauxChange: 1,
    dateSignature: '',
    dateDebutValidite: '',
    dateFinValidite: '',
    conditions: '',
    observations: '',
  })

  useEffect(() => {
    if (open) {
      if (editingSubvention) {
        setFormData({
          organismeBailleur: editingSubvention.organismeBailleur || '',
          typeSubvention: editingSubvention.typeSubvention || '',
          montantTotal: editingSubvention.montantTotal,
          devise: editingSubvention.devise || 'MAD',
          tauxChange: editingSubvention.tauxChange || 1,
          dateSignature: editingSubvention.dateSignature?.split('T')[0] || '',
          dateDebutValidite: editingSubvention.dateDebutValidite?.split('T')[0] || '',
          dateFinValidite: editingSubvention.dateFinValidite?.split('T')[0] || '',
          conditions: editingSubvention.conditions || '',
          observations: editingSubvention.observations || '',
        })
      } else {
        setFormData({
          organismeBailleur: '',
          typeSubvention: '',
          montantTotal: 0,
          devise: 'MAD',
          tauxChange: 1,
          dateSignature: '',
          dateDebutValidite: '',
          dateFinValidite: '',
          conditions: '',
          observations: '',
        })
      }
      setError(null)
    }
  }, [open, editingSubvention])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.organismeBailleur.trim() || formData.montantTotal <= 0) {
      setError('L\'organisme bailleur et le montant sont obligatoires')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload = {
        conventionId,
        organismeBailleur: formData.organismeBailleur.trim(),
        typeSubvention: formData.typeSubvention || null,
        montantTotal: formData.montantTotal,
        devise: formData.devise,
        tauxChange: formData.devise !== 'MAD' ? formData.tauxChange : null,
        dateSignature: formData.dateSignature || null,
        dateDebutValidite: formData.dateDebutValidite || null,
        dateFinValidite: formData.dateFinValidite || null,
        conditions: formData.conditions || null,
        observations: formData.observations || null,
      }

      if (editingSubvention) {
        await subventionsAPI.update(editingSubvention.id, payload)
      } else {
        await subventionsAPI.create(payload)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving subvention:', err)
      setError('Erreur lors de l\'enregistrement de la subvention')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.primary[700], fontWeight: typography.weights.semibold }}>
        {editingSubvention ? 'Modifier la subvention' : 'Ajouter une subvention'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Organisme bailleur"
            value={formData.organismeBailleur}
            onChange={(e) => handleChange('organismeBailleur', e.target.value)}
            placeholder="Ex: Ministère de l'Équipement"
            required
            size="small"
          />

          <TextField
            label="Type de subvention"
            select
            value={formData.typeSubvention}
            onChange={(e) => handleChange('typeSubvention', e.target.value)}
            size="small"
          >
            <MenuItem value="">-- Sélectionner --</MenuItem>
            {TYPES_SUBVENTION.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Montant"
              type="number"
              value={formData.montantTotal}
              onChange={(e) => handleChange('montantTotal', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
              required
              size="small"
              sx={{ flex: 2 }}
            />
            <TextField
              label="Devise"
              select
              value={formData.devise}
              onChange={(e) => handleChange('devise', e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            >
              {DEVISES.map((devise) => (
                <MenuItem key={devise.value} value={devise.value}>
                  {devise.value}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {formData.devise !== 'MAD' && (
            <TextField
              label="Taux de change"
              type="number"
              value={formData.tauxChange}
              onChange={(e) => handleChange('tauxChange', parseFloat(e.target.value) || 1)}
              InputProps={{
                endAdornment: <InputAdornment position="end">= 1 MAD</InputAdornment>,
              }}
              inputProps={{ min: 0.0001, step: 0.0001 }}
              size="small"
              helperText={`Équivalent: ${(formData.montantTotal * formData.tauxChange).toLocaleString('fr-FR')} MAD`}
            />
          )}

          <TextField
            label="Date de signature"
            type="date"
            value={formData.dateSignature}
            onChange={(e) => handleChange('dateSignature', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Date début validité"
              type="date"
              value={formData.dateDebutValidite}
              onChange={(e) => handleChange('dateDebutValidite', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Date fin validité"
              type="date"
              value={formData.dateFinValidite}
              onChange={(e) => handleChange('dateFinValidite', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Conditions"
            multiline
            rows={2}
            value={formData.conditions}
            onChange={(e) => handleChange('conditions', e.target.value)}
            placeholder="Conditions d'attribution de la subvention..."
            size="small"
          />

          <TextField
            label="Observations"
            multiline
            rows={2}
            value={formData.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            placeholder="Notes et observations..."
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
          {editingSubvention ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubventionFormDialog
