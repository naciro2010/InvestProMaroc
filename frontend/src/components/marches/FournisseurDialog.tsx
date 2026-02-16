import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material'
import { Save, Close, Business } from '@mui/icons-material'
import { fournisseursAPI } from '@/lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import { AxiosError } from 'axios'

interface FournisseurFormData {
  code: string
  raisonSociale: string
  identifiantFiscal: string
  ice: string
  adresse: string
  ville: string
  telephone: string
  email: string
  contact: string
  nonResident: boolean
}

interface CreatedFournisseur {
  id: number
  code: string
  raisonSociale: string
  ice: string | null
}

interface FournisseurDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (fournisseur: CreatedFournisseur) => void
}

const initialFormData: FournisseurFormData = {
  code: '',
  raisonSociale: '',
  identifiantFiscal: '',
  ice: '',
  adresse: '',
  ville: '',
  telephone: '',
  email: '',
  contact: '',
  nonResident: false,
}

const FournisseurDialog = ({ open, onClose, onSuccess }: FournisseurDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FournisseurFormData>(initialFormData)

  const handleChange = (field: keyof FournisseurFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        code: formData.code,
        raisonSociale: formData.raisonSociale,
        identifiantFiscal: formData.identifiantFiscal || undefined,
        ice: formData.ice || undefined,
        adresse: formData.adresse || undefined,
        ville: formData.ville || undefined,
        telephone: formData.telephone || undefined,
        email: formData.email || undefined,
        contact: formData.contact || undefined,
        nonResident: formData.nonResident,
      }

      const response = await fournisseursAPI.create(payload)
      const created = response.data.data || response.data
      onSuccess({
        id: created.id,
        code: created.code,
        raisonSociale: created.raisonSociale,
        ice: created.ice || null,
      })
      setFormData(initialFormData)
      onClose()
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message as string)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Erreur lors de la création du fournisseur")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setError('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: componentStyles.dialog.paper }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business sx={{ fontSize: 20, color: colors.primary[600] }} />
          <Typography sx={componentStyles.dialog.title}>
            Nouveau Fournisseur
          </Typography>
        </Box>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mt: 0.5 }}>
          Le fournisseur sera automatiquement sélectionné après création
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={handleChange('code')}
                required
                fullWidth
                size="small"
                placeholder="FOURN-001"
                sx={componentStyles.inputField}
              />
              <TextField
                label="Raison Sociale"
                value={formData.raisonSociale}
                onChange={handleChange('raisonSociale')}
                required
                fullWidth
                size="small"
                sx={componentStyles.inputField}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="ICE (15 chiffres)"
                value={formData.ice}
                onChange={handleChange('ice')}
                fullWidth
                size="small"
                placeholder="000000000000000"
                inputProps={{ maxLength: 15, pattern: '[0-9]{15}' }}
                sx={componentStyles.inputField}
              />
              <TextField
                label="Identifiant Fiscal"
                value={formData.identifiantFiscal}
                onChange={handleChange('identifiantFiscal')}
                fullWidth
                size="small"
                sx={componentStyles.inputField}
              />
            </Stack>

            <Box sx={{
              p: 2,
              borderRadius: borders.radius.md,
              bgcolor: colors.neutral[25],
              border: `1px solid ${colors.neutral[200]}`,
            }}>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
                mb: 1.5,
              }}>
                Coordonnées
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Adresse"
                  value={formData.adresse}
                  onChange={handleChange('adresse')}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  sx={componentStyles.inputField}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Ville"
                    value={formData.ville}
                    onChange={handleChange('ville')}
                    fullWidth
                    size="small"
                    sx={componentStyles.inputField}
                  />
                  <TextField
                    label="Téléphone"
                    value={formData.telephone}
                    onChange={handleChange('telephone')}
                    fullWidth
                    size="small"
                    sx={componentStyles.inputField}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    fullWidth
                    size="small"
                    sx={componentStyles.inputField}
                  />
                  <TextField
                    label="Contact"
                    value={formData.contact}
                    onChange={handleChange('contact')}
                    fullWidth
                    size="small"
                    sx={componentStyles.inputField}
                  />
                </Stack>
              </Stack>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.nonResident}
                  onChange={(e) => setFormData(prev => ({ ...prev, nonResident: e.target.checked }))}
                  size="small"
                />
              }
              label={
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                  Fournisseur non-résident
                </Typography>
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            startIcon={<Close />}
            disabled={loading}
            sx={componentStyles.buttonSecondary}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
            sx={componentStyles.buttonPrimary}
          >
            {loading ? 'Création...' : 'Créer le fournisseur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default FournisseurDialog
