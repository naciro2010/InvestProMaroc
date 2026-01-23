import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  InputAdornment,
} from '@mui/material';

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
  const handleNumberChange = (field: keyof ConventionFormData, value: string): void => {
    const numericValue: number = parseFloat(value) || 0;
    onChange({ [field]: numericValue });
  };

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
          <TextField
            fullWidth
            required
            type="number"
            label="Budget"
            value={formData.budget}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNumberChange('budget', e.target.value)
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 1000,
            }}
            error={Boolean(errors.budget)}
            helperText={errors.budget || 'Budget total de la convention'}
          />

          <TextField
            fullWidth
            required
            type="number"
            label="Taux de commission"
            value={formData.tauxCommission}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNumberChange('tauxCommission', e.target.value)
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              max: 100,
              step: 0.01,
            }}
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

          <TextField
            fullWidth
            required
            type="number"
            label="Taux TVA"
            value={formData.tauxTva}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNumberChange('tauxTva', e.target.value)
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              max: 20,
              step: 0.1,
            }}
            error={Boolean(errors.tauxTva)}
            helperText={errors.tauxTva || 'Taux de TVA applicable'}
          />
        </Box>
      </Stack>
    </Box>
  );
}
