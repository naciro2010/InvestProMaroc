import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Grid,
  InputAdornment,
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'

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

const SimpleConventionForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    numero: '',
    libelle: '',
    objet: '',
    dateConvention: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    budget: '',
    tauxCommission: '2.50',
    baseCalcul: 'DECAISSEMENTS_TTC',
    tauxTva: '20.00',
    typeConvention: 'CADRE',
  })

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
        typeConvention: formData.typeConvention,
      }

      await conventionsAPI.create(payload)
      navigate('/conventions')
    } catch (err: any) {
      console.error('Erreur création convention:', err)
      setError(err.response?.data?.message || 'Erreur lors de la création')
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
    <AppLayout>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/conventions')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Nouvelle Convention
          </Typography>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            {error}
          </Paper>
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CONV-2026-001"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Numéro"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="N°2026/001"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Libellé"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  placeholder="Convention de financement..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Objet"
                  value={formData.objet}
                  onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                  placeholder="Description détaillée de la convention..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Type"
                  value={formData.typeConvention}
                  onChange={(e) => setFormData({ ...formData, typeConvention: e.target.value })}
                >
                  <MenuItem value="CADRE">Convention Cadre</MenuItem>
                  <MenuItem value="NON_CADRE">Convention Non-Cadre</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Budget (MAD)"
                  value={formData.budget}
                  onChange={handleNumberChange('budget')}
                  onBlur={formatNumberOnBlur('budget')}
                  placeholder="1 000 000,00"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date Convention"
                  value={formData.dateConvention}
                  onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date Début"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Fin"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Taux Commission (%)"
                  value={formData.tauxCommission}
                  onChange={handleNumberChange('tauxCommission')}
                  onBlur={formatNumberOnBlur('tauxCommission')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Base de Calcul"
                  value={formData.baseCalcul}
                  onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
                >
                  <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
                  <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/conventions')}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </AppLayout>
  )
}

export default SimpleConventionForm
