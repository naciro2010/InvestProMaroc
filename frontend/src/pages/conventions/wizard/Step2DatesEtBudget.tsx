import { Stack, TextField, MenuItem, Typography } from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'
import { ConventionFormData } from '../types'

interface Step2Props {
  formData: ConventionFormData
  setFormData: React.Dispatch<React.SetStateAction<ConventionFormData>>
}

const Step2DatesEtBudget = ({ formData, setFormData }: Step2Props) => {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Dates et Budget
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          type="date"
          label="Date de la Convention"
          value={formData.dateConvention}
          onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText="Date de signature de la convention"
        />

        <TextField
          fullWidth
          required
          type="date"
          label="Date de Début"
          value={formData.dateDebut}
          onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText="Date de début d'exécution"
        />

        <TextField
          fullWidth
          type="date"
          label="Date de Fin"
          value={formData.dateFin}
          onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText="Date de fin (optionnel)"
        />
      </Stack>

      <DecimalInput
        fullWidth
        required
        label="Budget Total (MAD)"
        value={Number(formData.budget) || 0}
        onChange={(value) => setFormData({ ...formData, budget: String(value) })}
        decimalPlaces={2}
        min={0}
        helperText="Budget total de la convention en dirhams"
      />

      <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
        Paramètres de Commission
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <DecimalInput
          fullWidth
          required
          label="Taux de Commission (%)"
          value={Number(formData.tauxCommission) || 0}
          onChange={(value) => setFormData({ ...formData, tauxCommission: String(value) })}
          decimalPlaces={2}
          min={0}
          max={100}
          helperText="Taux de commission en pourcentage"
        />

        <TextField
          fullWidth
          required
          select
          label="Base de Calcul"
          value={formData.baseCalcul}
          onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
          helperText="Base de calcul de la commission"
        >
          <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
          <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
        </TextField>
      </Stack>

      <DecimalInput
        fullWidth
        label="Taux de TVA (%)"
        value={Number(formData.tauxTva) || 0}
        onChange={(value) => setFormData({ ...formData, tauxTva: String(value) })}
        decimalPlaces={2}
        min={0}
        max={100}
        helperText="Taux de TVA applicable"
      />
    </Stack>
  )
}

export default Step2DatesEtBudget
