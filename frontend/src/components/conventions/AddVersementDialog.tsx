import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
} from '@mui/material'
import { Add, Business } from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { ApiAutocomplete, type AutocompleteOption } from '@/components/core'
import { colors, typography } from '@/lib/designSystem'

interface VersementPrevisionnelForm {
  volet?: string
  dateVersement: string
  montantPrevu?: number
  montant: number
  partenaireId?: number
  modId?: number
  remarques?: string
}

interface Partenaire {
  id: number
  nom: string
  estMaitreOeuvreDelegue?: boolean
}

interface AddVersementDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (versement: VersementPrevisionnelForm) => Promise<void>
  partenaires: Partenaire[]
}

/** Map a Partenaire to the generic AutocompleteOption shape. */
function toOption(p: Partenaire): AutocompleteOption {
  return { id: p.id, label: p.nom }
}

const AddVersementDialog = ({ open, onClose, onAdd, partenaires }: AddVersementDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<VersementPrevisionnelForm>({
    volet: '',
    dateVersement: new Date().toISOString().split('T')[0],
    montantPrevu: 0,
    montant: 0,
    partenaireId: undefined,
    modId: undefined,
    remarques: '',
  })

  const allOptions = partenaires.map(toOption)
  const modOptions = partenaires.filter((p) => p.estMaitreOeuvreDelegue).map(toOption)

  const selectedPartenaire = allOptions.find((o) => o.id === formData.partenaireId) ?? null
  const selectedMod = modOptions.find((o) => o.id === formData.modId) ?? null

  const handleChange = (field: keyof VersementPrevisionnelForm, value: string | number | undefined) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async () => {
    if (!formData.dateVersement || formData.montant <= 0) {
      setError('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onAdd(formData)
      setFormData({
        volet: '',
        dateVersement: new Date().toISOString().split('T')[0],
        montantPrevu: 0,
        montant: 0,
        partenaireId: undefined,
        modId: undefined,
        remarques: '',
      })
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || "Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold }}>
        Ajouter un Versement Previsionnel
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Volet / Composante"
              value={formData.volet}
              onChange={(e) => handleChange('volet', e.target.value)}
              placeholder="Ex: Volet 1 - Infrastructure"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="date"
              label="Date de Versement"
              value={formData.dateVersement}
              onChange={(e) => handleChange('dateVersement', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DecimalInput
              fullWidth
              label="Montant Prevu (MAD)"
              value={formData.montantPrevu || 0}
              onChange={(value) => handleChange('montantPrevu', value)}
              decimalPlaces={2}
              min={0}
              helperText="Montant initialement planifie pour ce versement"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DecimalInput
              fullWidth
              required
              label="Montant Reel (MAD)"
              value={formData.montant}
              onChange={(value) => handleChange('montant', value)}
              decimalPlaces={2}
              min={0}
              helperText="Montant effectivement verse ou a verser"
            />
          </Grid>

          {/* Partenaire - API-backed Autocomplete */}
          <Grid size={{ xs: 12 }}>
            <ApiAutocomplete
              label="Partenaire Beneficiaire"
              placeholder="Rechercher un partenaire..."
              value={selectedPartenaire}
              onChange={(opt) => handleChange('partenaireId', opt?.id ?? undefined)}
              options={allOptions}
              optionIcon={<Business sx={{ fontSize: 16, color: colors.neutral[400] }} />}
            />
          </Grid>

          {/* MOD Responsable - filtered Autocomplete */}
          <Grid size={{ xs: 12 }}>
            <ApiAutocomplete
              label="MOD Responsable"
              placeholder="Rechercher un MOD..."
              value={selectedMod}
              onChange={(opt) => handleChange('modId', opt?.id ?? undefined)}
              options={modOptions}
              optionIcon={<Business sx={{ fontSize: 16, color: colors.neutral[400] }} />}
              noOptionsText="Aucun Maitre d'oeuvre delegue disponible"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Remarques"
              value={formData.remarques}
              onChange={(e) => handleChange('remarques', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} size="small">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Add />}
          disabled={loading}
          size="small"
          sx={{ bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] } }}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddVersementDialog
