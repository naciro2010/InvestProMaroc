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
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  Box,
} from '@mui/material'
import { Save, Close } from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'

interface Convention {
  id: number
  numero: string
  libelle: string
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
}

interface SousConventionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  parentConvention: Convention
  editingSousConvention?: any
}

// Helper pour formater les nombres en affichage
const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// Helper pour parser les nombres depuis l'affichage
const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\s/g, '').replace(/,/g, '.')
  return parseFloat(cleaned) || 0
}

const SousConventionForm = ({
  open,
  onClose,
  onSuccess,
  parentConvention,
  editingSousConvention,
}: SousConventionFormProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [heriteParametres, setHeriteParametres] = useState(true)

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
    surchargeTauxCommission: '',
    surchargeBaseCalcul: '',
  })

  // Initialiser le formulaire si édition
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
        budget: formatNumber(editingSousConvention.budget || 0),
        tauxCommission: String(editingSousConvention.tauxCommission || parentConvention.tauxCommission),
        baseCalcul: editingSousConvention.baseCalcul || parentConvention.baseCalcul,
        tauxTva: String(editingSousConvention.tauxTva || parentConvention.tauxTva),
        surchargeTauxCommission: editingSousConvention.surchargeTauxCommission
          ? String(editingSousConvention.surchargeTauxCommission)
          : '',
        surchargeBaseCalcul: editingSousConvention.surchargeBaseCalcul || '',
      })
      setHeriteParametres(editingSousConvention.heriteParametres ?? true)
    } else {
      // Nouveau: réinitialiser avec les valeurs par défaut
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
        surchargeTauxCommission: '',
        surchargeBaseCalcul: '',
      })
      setHeriteParametres(true)
    }
  }, [editingSousConvention, parentConvention])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        code: formData.code,
        numero: formData.numero,
        libelle: formData.libelle,
        objet: formData.objet,
        dateConvention: formData.dateConvention,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || null,
        budget: parseFormattedNumber(formData.budget),
        tauxCommission: parseFloat(formData.tauxCommission),
        baseCalcul: formData.baseCalcul,
        tauxTva: parseFloat(formData.tauxTva),
        typeConvention: 'SPECIFIQUE', // Les sous-conventions sont de type SPECIFIQUE
        heriteParametres,
        surchargeTauxCommission: formData.surchargeTauxCommission
          ? parseFloat(formData.surchargeTauxCommission)
          : null,
        surchargeBaseCalcul: formData.surchargeBaseCalcul || null,
      }

      if (editingSousConvention) {
        await conventionsAPI.updateSousConvention(editingSousConvention.id, payload)
      } else {
        await conventionsAPI.createSousConvention(parentConvention.id, payload)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Erreur sous-convention:', err)
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleNumberChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Accepter seulement les chiffres, espaces, virgules et points
    if (/^[\d\s,.]*$/.test(value) || value === '') {
      setFormData({ ...formData, [field]: value })
    }
  }

  const formatNumberOnBlur = (field: string) => () => {
    const num = parseFormattedNumber(formData[field as keyof typeof formData] as string)
    setFormData({ ...formData, [field]: formatNumber(num) })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          {editingSousConvention ? 'Modifier' : 'Créer'} une Sous-Convention
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Convention Parente: {parentConvention.numero} - {parentConvention.libelle}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Informations de base */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Informations de Base
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Code"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Numéro"
                    name="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                    fullWidth
                    size="small"
                    helperText="Ex: SC-2024-001"
                  />
                </Stack>

                <TextField
                  label="Libellé"
                  name="libelle"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  required
                  fullWidth
                  size="small"
                />

                <TextField
                  label="Objet / Description"
                  name="objet"
                  value={formData.objet}
                  onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                />
              </Stack>
            </Box>

            {/* Dates */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Dates
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Date Convention"
                  name="dateConvention"
                  type="date"
                  value={formData.dateConvention}
                  onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Date Début"
                  name="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Date Fin (optionnel)"
                  name="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Box>

            {/* Informations financières */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Informations Financières
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Budget Total"
                  name="budget"
                  value={formData.budget}
                  onChange={handleNumberChange('budget')}
                  onBlur={formatNumberOnBlur('budget')}
                  required
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                  }}
                  helperText="Format: 1 000 000,00"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={heriteParametres}
                      onChange={(e) => setHeriteParametres(e.target.checked)}
                    />
                  }
                  label="Hériter des paramètres de la convention parente"
                />

                {!heriteParametres && (
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Taux Commission (%)"
                        name="tauxCommission"
                        value={formData.tauxCommission}
                        onChange={(e) => setFormData({ ...formData, tauxCommission: e.target.value })}
                        required
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ step: '0.01', min: '0', max: '100' }}
                      />
                      <TextField
                        label="Taux TVA (%)"
                        name="tauxTva"
                        value={formData.tauxTva}
                        onChange={(e) => setFormData({ ...formData, tauxTva: e.target.value })}
                        required
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ step: '0.01', min: '0', max: '100' }}
                      />
                    </Stack>

                    <TextField
                      label="Base de Calcul"
                      name="baseCalcul"
                      select
                      value={formData.baseCalcul}
                      onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
                      required
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
                      <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
                    </TextField>
                  </Stack>
                )}

                {heriteParametres && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Cette sous-convention hérite des paramètres suivants de la convention parente:
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Taux de commission: {parentConvention.tauxCommission}%</li>
                      <li>Base de calcul: {parentConvention.baseCalcul}</li>
                      <li>Taux TVA: {parentConvention.tauxTva}%</li>
                    </ul>
                  </Alert>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<Close />} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading}>
            {loading ? 'Enregistrement...' : editingSousConvention ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SousConventionForm
