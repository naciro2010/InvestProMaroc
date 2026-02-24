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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { versementsPrevisionnelsAPI, conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import DecimalInput from '@/components/ui/DecimalInput'

interface VersementPrevisionnel {
  id: number
  partenaireId?: number
  partenaireNom?: string
  volet?: string
  dateVersement: string
  montant: number
  montantPrevu?: number
  remarques?: string
}

interface Partenaire {
  id: number
  code: string
  raisonSociale: string
  sigle?: string
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
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [loadingPartenaires, setLoadingPartenaires] = useState(false)
  const [formData, setFormData] = useState({
    partenaireId: 0,
    volet: '',
    dateVersement: '',
    montant: 0,
    montantPrevu: 0,
    remarques: '',
  })

  // Load partenaires on open
  useEffect(() => {
    if (open) {
      loadPartenaires()
    }
  }, [open])

  const loadPartenaires = async () => {
    try {
      setLoadingPartenaires(true)
      const res = await conventionsAPI.getPartenaires(conventionId)
      const conventionPartenaires = res.data.data || res.data || []
      // Map convention partenaires to the Partenaire interface used by the dropdown
      const mapped: Partenaire[] = (conventionPartenaires as Array<{
        partenaireId: number
        partenaireCode: string
        partenaireNom: string
        partenaireSigle: string | null
      }>).map((cp) => ({
        id: cp.partenaireId,
        code: cp.partenaireCode,
        raisonSociale: cp.partenaireNom,
        sigle: cp.partenaireSigle || undefined,
      }))
      setPartenaires(mapped)
    } catch (err) {
      console.error('Error loading partenaires:', err)
    } finally {
      setLoadingPartenaires(false)
    }
  }

  useEffect(() => {
    if (open) {
      if (editingVersement) {
        setFormData({
          partenaireId: editingVersement.partenaireId || 0,
          volet: editingVersement.volet || '',
          dateVersement: editingVersement.dateVersement?.split('T')[0] || '',
          montant: editingVersement.montant,
          montantPrevu: editingVersement.montantPrevu || 0,
          remarques: editingVersement.remarques || '',
        })
      } else {
        setFormData({
          partenaireId: 0,
          volet: '',
          dateVersement: new Date().toISOString().split('T')[0],
          montant: 0,
          montantPrevu: 0,
          remarques: '',
        })
      }
      setError(null)
    }
  }, [open, editingVersement])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.partenaireId || formData.partenaireId === 0) {
      setError('Le partenaire est obligatoire')
      return
    }
    if (!formData.dateVersement) {
      setError('La date de versement est obligatoire')
      return
    }
    if (formData.montant <= 0) {
      setError('Le montant doit être supérieur à 0')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload = {
        partenaireId: formData.partenaireId,
        volet: formData.volet || null,
        dateVersement: formData.dateVersement,
        montant: formData.montant,
        montantPrevu: formData.montantPrevu || null,
        remarques: formData.remarques || null,
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
          <FormControl fullWidth size="small" required error={!formData.partenaireId}>
            <InputLabel>Partenaire</InputLabel>
            <Select
              value={formData.partenaireId || ''}
              label="Partenaire"
              onChange={(e) => handleChange('partenaireId', e.target.value as number)}
              disabled={loadingPartenaires}
            >
              {loadingPartenaires ? (
                <MenuItem disabled>Chargement...</MenuItem>
              ) : (
                partenaires.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.sigle ? `${p.sigle} - ${p.raisonSociale}` : p.raisonSociale}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>Organisme destinataire du versement</FormHelperText>
          </FormControl>

          <TextField
            label="Volet / Tranche"
            value={formData.volet}
            onChange={(e) => handleChange('volet', e.target.value)}
            placeholder="Ex: Tranche 1 - Démarrage"
            size="small"
            helperText="Description du volet ou de la tranche de versement"
          />

          <TextField
            label="Date de versement prévue"
            type="date"
            value={formData.dateVersement}
            onChange={(e) => handleChange('dateVersement', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            size="small"
          />

          <DecimalInput
            label="Montant Prevu"
            value={formData.montantPrevu || 0}
            onChange={(value) => handleChange('montantPrevu', value)}
            decimalPlaces={2}
            min={0}
            InputProps={{
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            size="small"
            helperText="Montant initialement planifie pour ce versement"
          />

          <DecimalInput
            label="Montant Reel"
            value={formData.montant}
            onChange={(value) => handleChange('montant', value)}
            decimalPlaces={2}
            min={0}
            InputProps={{
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            required
            size="small"
            helperText="Montant effectivement verse ou a verser"
          />

          {formData.montantPrevu > 0 && formData.montant > 0 && (
            <Alert
              severity={formData.montant === formData.montantPrevu ? 'success' : formData.montant > formData.montantPrevu ? 'warning' : 'info'}
              sx={{ py: 0.5 }}
            >
              Ecart : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(formData.montant - formData.montantPrevu)}
              {formData.montant > formData.montantPrevu ? ' (depassement)' : formData.montant < formData.montantPrevu ? ' (economie)' : ' (conforme)'}
            </Alert>
          )}

          <TextField
            label="Remarques"
            value={formData.remarques}
            onChange={(e) => handleChange('remarques', e.target.value)}
            placeholder="Notes et observations..."
            multiline
            rows={2}
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
