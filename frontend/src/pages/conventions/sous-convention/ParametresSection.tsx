import { Stack, TextField, MenuItem, Alert, Switch, FormControlLabel, InputAdornment } from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'
import type { ParentConventionInfo, SousConventionFormData } from './types'

interface ParametresSectionProps {
  heriteParametres: boolean
  onHeriteChange: (value: boolean) => void
  formData: SousConventionFormData
  onFormDataChange: (data: SousConventionFormData) => void
  parentConvention: ParentConventionInfo
}

const ParametresSection = ({
  heriteParametres,
  onHeriteChange,
  formData,
  onFormDataChange,
  parentConvention,
}: ParametresSectionProps) => (
  <>
    <DecimalInput
      label="Budget Total"
      value={parseFloat(formData.budget) || 0}
      onChange={(value) => onFormDataChange({ ...formData, budget: value.toString() })}
      required
      fullWidth
      size="small"
      decimalPlaces={2}
      min={0}
      InputProps={{
        endAdornment: <InputAdornment position="end">DH</InputAdornment>,
      }}
    />

    <FormControlLabel
      control={
        <Switch
          checked={heriteParametres}
          onChange={(e) => onHeriteChange(e.target.checked)}
        />
      }
      label="Heriter des parametres de la convention parente"
    />

    {!heriteParametres && (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <DecimalInput
            label="Taux Commission (%)"
            value={parseFloat(formData.tauxCommission) || 0}
            onChange={(value) => onFormDataChange({ ...formData, tauxCommission: value.toString() })}
            required
            fullWidth
            size="small"
            decimalPlaces={2}
            min={0}
            max={100}
          />
          <DecimalInput
            label="Taux TVA (%)"
            value={parseFloat(formData.tauxTva) || 0}
            onChange={(value) => onFormDataChange({ ...formData, tauxTva: value.toString() })}
            required
            fullWidth
            size="small"
            decimalPlaces={2}
            min={0}
            max={100}
          />
        </Stack>
        <TextField
          label="Base de Calcul"
          select
          value={formData.baseCalcul}
          onChange={(e) => onFormDataChange({ ...formData, baseCalcul: e.target.value })}
          required
          fullWidth
          size="small"
        >
          <MenuItem value="DECAISSEMENTS_TTC">Decaissements TTC</MenuItem>
          <MenuItem value="DECAISSEMENTS_HT">Decaissements HT</MenuItem>
        </TextField>
      </Stack>
    )}

    {heriteParametres && (
      <Alert severity="info">
        Heritage: Taux commission {parentConvention.tauxCommission}%, Base {parentConvention.baseCalcul}, TVA {parentConvention.tauxTva}%
      </Alert>
    )}
  </>
)

export default ParametresSection
