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
} from '@mui/material';

interface ConventionFormData {
  libelle: string;
  numero: string;
  objet: string;
  typeConvention: string;
}

interface ValidationErrors {
  libelle?: string;
  numero?: string;
  objet?: string;
  typeConvention?: string;
}

interface EditStep1InfoProps {
  formData: ConventionFormData;
  onChange: (updates: Partial<ConventionFormData>) => void;
  errors?: ValidationErrors;
}

/**
 * Étape 1: Informations générales de la convention
 * Composant micro-frontend pour l'édition
 */
export default function EditStep1Info({ formData, onChange, errors = {} }: EditStep1InfoProps): JSX.Element {
  const handleChange = (field: keyof ConventionFormData, value: string): void => {
    onChange({ [field]: value });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
        Informations générales
      </Typography>

      <Stack spacing={3}>
        {/* Libellé */}
        <TextField
          fullWidth
          required
          label="Libellé de la convention"
          value={formData.libelle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange('libelle', e.target.value)
          }
          error={Boolean(errors.libelle)}
          helperText={errors.libelle || 'Nom court de la convention'}
        />

        {/* Numéro et Type */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            fullWidth
            required
            label="Numéro de convention"
            value={formData.numero}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('numero', e.target.value)
            }
            error={Boolean(errors.numero)}
            helperText={errors.numero || 'Ex: CONV-2026-001'}
          />

          <FormControl fullWidth required error={Boolean(errors.typeConvention)}>
            <InputLabel>Type de convention</InputLabel>
            <Select
              value={formData.typeConvention}
              label="Type de convention"
              onChange={(e) => handleChange('typeConvention', e.target.value as string)}
            >
              <MenuItem value="CADRE">Convention CADRE</MenuItem>
              <MenuItem value="NON_CADRE">Convention NON CADRE</MenuItem>
            </Select>
            {errors.typeConvention && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.typeConvention}
              </Typography>
            )}
          </FormControl>
        </Box>

        {/* Objet */}
        <TextField
          fullWidth
          required
          multiline
          rows={4}
          label="Objet de la convention"
          value={formData.objet}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange('objet', e.target.value)
          }
          error={Boolean(errors.objet)}
          helperText={errors.objet || "Description de l'objet de la convention"}
        />
      </Stack>
    </Box>
  );
}
