import {
  Stack,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material'
import { ConventionFormData } from '../ConventionWizard'

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

      <TextField
        fullWidth
        required
        type="number"
        label="Budget Total"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        placeholder="1000000"
        InputProps={{
          endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
          inputProps: { step: '0.01', min: '0' }
        }}
        helperText="Budget total de la convention en dirhams"
      />

      <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
        Paramètres de Commission
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          type="number"
          label="Taux de Commission"
          value={formData.tauxCommission}
          onChange={(e) => setFormData({ ...formData, tauxCommission: e.target.value })}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
            inputProps: { step: '0.01', min: '0', max: '100' }
          }}
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

      <TextField
        fullWidth
        type="number"
        label="Taux de TVA"
        value={formData.tauxTva}
        onChange={(e) => setFormData({ ...formData, tauxTva: e.target.value })}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
          inputProps: { step: '0.01', min: '0', max: '100' }
        }}
        helperText="Taux de TVA applicable"
      />
    </Stack>
  )
}

export default Step2DatesEtBudget
