import {
  Stack,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material'
import { ConventionFormData } from '../types'
import { useRealtimeValidation } from '@/hooks/useRealtimeValidation'
import { z } from 'zod'

const step1Schema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  numero: z.string().min(1, 'Le numéro est requis'),
  libelle: z.string().min(2, 'Le libellé doit contenir au moins 2 caractères'),
  objet: z.string().min(5, 'L\'objet doit contenir au moins 5 caractères'),
  typeConvention: z.string().min(1, 'Le type est requis'),
})

interface Step1Props {
  formData: ConventionFormData
  setFormData: React.Dispatch<React.SetStateAction<ConventionFormData>>
}

const Step1Informations = ({ formData, setFormData }: Step1Props) => {
  const { validateField, getFieldError, markTouched } = useRealtimeValidation(step1Schema)

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    validateField(field, value, formData)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Informations générales
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          label="Code"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          onBlur={() => markTouched('code')}
          placeholder="CONV-2026-001"
          helperText={getFieldError('code') || 'Code unique de la convention'}
          error={!!getFieldError('code')}
        />
        <TextField
          fullWidth
          required
          label="Numéro"
          value={formData.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          onBlur={() => markTouched('numero')}
          placeholder="N°2026/001"
          helperText={getFieldError('numero') || 'Numéro administratif'}
          error={!!getFieldError('numero')}
        />
      </Stack>

      <TextField
        fullWidth
        required
        label="Libellé"
        value={formData.libelle}
        onChange={(e) => handleChange('libelle', e.target.value)}
        onBlur={() => markTouched('libelle')}
        placeholder="Convention de financement..."
        helperText={getFieldError('libelle') || 'Titre court de la convention'}
        error={!!getFieldError('libelle')}
      />

      <TextField
        fullWidth
        required
        multiline
        rows={4}
        label="Objet"
        value={formData.objet}
        onChange={(e) => handleChange('objet', e.target.value)}
        onBlur={() => markTouched('objet')}
        placeholder="Description détaillée de l'objet de la convention..."
        helperText={getFieldError('objet') || 'Description complète de la convention'}
        error={!!getFieldError('objet')}
      />

      <TextField
        fullWidth
        required
        select
        label="Type de Convention"
        value={formData.typeConvention}
        onChange={(e) => handleChange('typeConvention', e.target.value)}
        helperText="Type de convention (CADRE permet d'avoir des sous-conventions)"
      >
        <MenuItem value="CADRE">Convention Cadre</MenuItem>
        <MenuItem value="NON_CADRE">Convention Non-Cadre</MenuItem>
      </TextField>
    </Stack>
  )
}

export default Step1Informations
