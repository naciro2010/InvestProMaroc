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
} from '@mui/material'
import { Save, Close } from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'

interface SousConventionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  parentConvention: {
    id: number
    numero: string
    libelle: string
    tauxCommission: number
    baseCalcul: string
    tauxTva: number
  }
  editingSousConvention?: any
}

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingSousConvention ? 'Modifier' : 'Créer'} une Sous-Convention
        <Box sx={{ mt: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
          Convention Parente: {parentConvention.numero} - {parentConvention.libelle}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

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
                label="Numéro"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
                fullWidth
                size="small"
              />
            </Stack>

            <TextField
              label="Libellé"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              required
              fullWidth
              size="small"
            />

            <TextField
              label="Objet"
              value={formData.objet}
              onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
              multiline
              rows={2}
              fullWidth
              size="small"
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
                label="Date Début"
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

            <TextField
              label="Budget Total"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              required
              fullWidth
              size="small"
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
              label="Hériter des paramètres de la convention parente"
            />

            {!heriteParametres && (
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Taux Commission (%)"
                    type="number"
                    value={formData.tauxCommission}
                    onChange={(e) => setFormData({ ...formData, tauxCommission: e.target.value })}
                    required
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                  <TextField
                    label="Taux TVA (%)"
                    type="number"
                    value={formData.tauxTva}
                    onChange={(e) => setFormData({ ...formData, tauxTva: e.target.value })}
                    required
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
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
                  <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
                  <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
                </TextField>
              </Stack>
            )}

            {heriteParametres && (
              <Alert severity="info">
                Héritage: Taux commission {parentConvention.tauxCommission}%, Base {parentConvention.baseCalcul}, TVA {parentConvention.tauxTva}%
              </Alert>
            )}
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

export default SousConventionFormSimple
