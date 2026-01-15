import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Stack,
  InputAdornment,
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'
import RichTextEditor from '../../components/ui/RichTextEditor'

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
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, #ffffff)', py: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header Section with Gradient Background */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              p: 4,
              mb: 0,
            }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/conventions')}
              sx={{
                color: 'white',
                mb: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Retour
            </Button>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Nouvelle Convention
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Créez une nouvelle convention avec les détails complets et descriptif formaté
            </Typography>
          </Box>

          {error && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                bgcolor: '#fee2e2',
                borderLeft: '4px solid #dc2626',
                color: '#991b1b',
                fontWeight: 500,
              }}
            >
              {error}
            </Paper>
          )}

          <Paper
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: '0 0 16px 16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Section 1: Informations Générales */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                  📋 Informations Générales
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      label="Code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="CONV-2026-001"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Numéro"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="N°2026/001"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    required
                    label="Libellé"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    placeholder="Convention de financement..."
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Stack>
              </Box>

              {/* Section 2: Description */}
              <Box sx={{ background: '#f0f9ff', borderLeft: '4px solid #2563eb', p: 3, borderRadius: '8px' }}>
                <RichTextEditor
                  label="📝 Objet de la Convention"
                  value={formData.objet}
                  onChange={(content) => setFormData({ ...formData, objet: content })}
                  placeholder="Description détaillée de la convention avec options de formatage..."
                  minHeight="250px"
                />
              </Box>

              {/* Section 3: Type et Budget */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                  💰 Type et Budget
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      select
                      label="Type"
                      value={formData.typeConvention}
                      onChange={(e) => setFormData({ ...formData, typeConvention: e.target.value })}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    >
                      <MenuItem value="CADRE">Convention Cadre</MenuItem>
                      <MenuItem value="NON_CADRE">Convention Non-Cadre</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      required
                      label="Budget (MAD)"
                      value={formData.budget}
                      onChange={handleNumberChange('budget')}
                      onBlur={formatNumberOnBlur('budget')}
                      placeholder="1 000 000,00"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Section 4: Dates */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                  📅 Dates
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Date Convention"
                      value={formData.dateConvention}
                      onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />

                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Date Début"
                      value={formData.dateDebut}
                      onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />

                    <TextField
                      fullWidth
                      type="date"
                      label="Date Fin (optionnel)"
                      value={formData.dateFin}
                      onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Section 5: Commission */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                  ⚙️ Configuration Commission
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      label="Taux Commission (%)"
                      value={formData.tauxCommission}
                      onChange={handleNumberChange('tauxCommission')}
                      onBlur={formatNumberOnBlur('tauxCommission')}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />

                    <TextField
                      fullWidth
                      required
                      select
                      label="Base de Calcul"
                      value={formData.baseCalcul}
                      onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    >
                      <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
                      <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
                    </TextField>
                  </Stack>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/conventions')}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      borderColor: '#9ca3af',
                    },
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
                    },
                    '&:disabled': {
                      background: '#d1d5db',
                    },
                  }}
                >
                  {loading ? '⏳ Enregistrement...' : '✓ Enregistrer'}
                </Button>
              </Box>
            </Stack>
            </form>
          </Paper>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default SimpleConventionForm
