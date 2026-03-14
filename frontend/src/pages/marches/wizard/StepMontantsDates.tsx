import { Box, Typography, TextField, Divider } from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'
import { colors } from '@/lib/designSystem'
import type { MarcheFormData } from './types'

interface StepMontantsDatesProps {
  formData: MarcheFormData
  onChange: (field: keyof MarcheFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (updates: Partial<MarcheFormData>) => void
}

const StepMontantsDates = ({ formData, onChange, onFormDataChange }: StepMontantsDatesProps) => (
  <Box sx={{ display: 'grid', gap: 3 }}>
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Montants et dates</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
      <DecimalInput fullWidth label="Montant HT (DH)" required value={formData.montantHT}
        onChange={(value) => onFormDataChange({ montantHT: value })} min={0} decimalPlaces={2} />
      <DecimalInput fullWidth label="Taux TVA (%)" required value={formData.tauxTVA}
        onChange={(value) => onFormDataChange({ tauxTVA: value })} min={0} max={100} decimalPlaces={2} />
      <DecimalInput fullWidth label="Montant TTC (DH)" required value={formData.montantTTC}
        onChange={() => {}} decimalPlaces={2} InputProps={{ readOnly: true }}
        sx={{ '& .MuiInputBase-input': { bgcolor: colors.neutral[50], fontWeight: 600, color: colors.primary[600] } }} />
    </Box>

    <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>Dates</Typography>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <TextField fullWidth label="Date de signature" type="date" required value={formData.dateSignature}
        onChange={onChange('dateSignature')} InputLabelProps={{ shrink: true }} />
      <TextField fullWidth label="Date de notification" type="date" required value={formData.dateNotification}
        onChange={onChange('dateNotification')} InputLabelProps={{ shrink: true }} />
      <TextField fullWidth label="Date d'ordre de service" type="date" value={formData.dateOrdreService}
        onChange={onChange('dateOrdreService')} InputLabelProps={{ shrink: true }} />
      <DecimalInput fullWidth label="Délai d'exécution (mois)" required value={formData.delaiExecution}
        onChange={(value) => onFormDataChange({ delaiExecution: value })} min={0} decimalPlaces={0} />
      <DecimalInput fullWidth label="Taux pénalité / jour (ex: 1/2000 = 0.0005)" value={formData.tauxPenalite}
        onChange={(value) => onFormDataChange({ tauxPenalite: value })} min={0} max={1} decimalPlaces={4}
        helperText="Standard marchés publics: 1/2000 par jour = 0.0005" />
    </Box>
  </Box>
)

export default StepMontantsDates
