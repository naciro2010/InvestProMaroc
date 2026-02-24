import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Card,
  Divider,
  Alert,
} from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type HandleChangeFunction,
  type WizardTotals,
} from './types'

interface WizardStepCommissionProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  handleChange: HandleChangeFunction
  totals: WizardTotals
}

const WizardStepCommission = ({
  formData,
  setFormData,
  handleChange,
  totals,
}: WizardStepCommissionProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          ⚙️ Configuration de la Commission
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      <Alert severity="info">
        💡 La commission sera calculée sur la base choisie (HT ou TTC) en appliquant le taux défini.
      </Alert>

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gap: 3 }}>
          <DecimalInput
            fullWidth
            label="Taux de commission (%)"
            value={formData.tauxCommission}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                tauxCommission: value,
              }))
            }}
            decimalPlaces={2}
            min={0}
            max={100}
            helperText="Taux appliqué pour calculer la commission"
          />

          <TextField
            fullWidth
            select
            label="Base de calcul"
            value={formData.baseCalcul}
            onChange={handleChange('baseCalcul')}
          >
            <MenuItem value="DECAISSEMENTS_HT">Décaissements HT - Hors taxes</MenuItem>
            <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC - Toutes taxes comprises</MenuItem>
          </TextField>

          <DecimalInput
            fullWidth
            label="Taux TVA (%)"
            value={formData.tauxTva}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                tauxTva: value,
              }))
            }}
            decimalPlaces={2}
            min={0}
            max={100}
            helperText="Taux de TVA applicable"
          />
        </Box>
      </Card>

      {/* Preview calcul */}
      <Card sx={{ p: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          📊 Aperçu du calcul de commission
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Base de calcul
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {formData.baseCalcul === 'DECAISSEMENTS_HT' ? 'Décaissements HT' : 'Décaissements TTC'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Taux appliqué
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {formData.tauxCommission}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Commission estimée
            </Typography>
            <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>
              {formatCurrency(totals.commissionEstimee)}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default WizardStepCommission
