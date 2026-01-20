import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
} from '@mui/material';

interface ConventionFormData {
  dateDebut: string;
  dateFin: string | null;
  description: string | null;
}

interface EditStep3DatesProps {
  formData: ConventionFormData;
  onChange: (updates: Partial<ConventionFormData>) => void;
}

/**
 * Étape 3: Dates et description
 * Composant micro-frontend pour l'édition
 */
export default function EditStep3Dates({ formData, onChange }: EditStep3DatesProps): JSX.Element {
  const handleChange = (field: keyof ConventionFormData, value: string | null): void => {
    onChange({ [field]: value });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
        Dates et description
      </Typography>

      <Stack spacing={3}>
        {/* Dates */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            fullWidth
            required
            type="date"
            label="Date de début"
            value={formData.dateDebut}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('dateDebut', e.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Date de début de la convention"
          />

          <TextField
            fullWidth
            type="date"
            label="Date de fin"
            value={formData.dateFin || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('dateFin', e.target.value || null)
            }
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Date de fin prévue (optionnel)"
          />
        </Box>

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Description détaillée"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange('description', e.target.value || null)
          }
          helperText="Description détaillée de la convention (optionnel)"
          placeholder="Décrivez en détail l'objet, les objectifs et les modalités de la convention..."
        />
      </Stack>
    </Box>
  );
}
