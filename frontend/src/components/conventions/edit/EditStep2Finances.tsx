import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  InputAdornment,
} from '@mui/material';
import DecimalInput from '../../ui/DecimalInput';

interface ConventionFormData {
  tauxCommission: number;
  budget: number;
  baseCalcul: string | null;
  tauxTva: number;
}

interface ValidationErrors {
  tauxCommission?: string;
  budget?: string;
  baseCalcul?: string;
  tauxTva?: string;
}

interface EditStep2FinancesProps {
  formData: ConventionFormData;
  onChange: (updates: Partial<ConventionFormData>) => void;
  errors?: ValidationErrors;
}

/**
 * Étape 2: Paramètres financiers
 * Composant micro-frontend pour l'édition
 */
export default function EditStep2Finances({ formData, onChange, errors = {} }: EditStep2FinancesProps): JSX.Element {
  const handleSelectChange = (field: keyof ConventionFormData, value: string | null): void => {
    onChange({ [field]: value });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
        Paramètres financiers
      </Typography>

      <Stack spacing={3}>
        {/* Budget et Taux de commission */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <DecimalInput
            fullWidth
            required
            label="Budget"
            value={formData.budget}
            onChange={(value) => onChange({ budget: value })}
            InputProps={{
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            decimalPlaces={2}
            min={0}
            error={Boolean(errors.budget)}
            helperText={errors.budget || 'Budget total de la convention'}
          />

          <DecimalInput
            fullWidth
            required
            label="Taux de commission"
            value={formData.tauxCommission}
            onChange={(value) => onChange({ tauxCommission: value })}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            decimalPlaces={2}
            min={0}
            max={100}
            error={Boolean(errors.tauxCommission)}
            helperText={errors.tauxCommission || 'Taux de commission (0-100%)'}
          />
        </Box>

        {/* Base de calcul et Taux TVA */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <FormControl fullWidth error={Boolean(errors.baseCalcul)}>
            <InputLabel>Base de calcul</InputLabel>
            <Select
              value={formData.baseCalcul || ''}
              label="Base de calcul"
              onChange={(e) =>
                handleSelectChange('baseCalcul', e.target.value || null)
              }
            >
              <MenuItem value="">
                <em>Aucune</em>
              </MenuItem>
              <MenuItem value="HT">Hors Taxes (HT)</MenuItem>
              <MenuItem value="TTC">Toutes Taxes Comprises (TTC)</MenuItem>
              <MenuItem value="TVA">TVA uniquement</MenuItem>
            </Select>
            {errors.baseCalcul && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.baseCalcul}
              </Typography>
            )}
          </FormControl>

          <DecimalInput
            fullWidth
            required
            label="Taux TVA"
            value={formData.tauxTva}
            onChange={(value) => onChange({ tauxTva: value })}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            decimalPlaces={2}
            min={0}
            max={20}
            error={Boolean(errors.tauxTva)}
            helperText={errors.tauxTva || 'Taux de TVA applicable'}
          />
        </Box>
      </Stack>
    </Box>
  );
}
