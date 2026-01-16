import {
  Stack,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material'
import { ConventionFormData } from '../types'

interface Step1Props {
  formData: ConventionFormData
  setFormData: React.Dispatch<React.SetStateAction<ConventionFormData>>
}

const Step1Informations = ({ formData, setFormData }: Step1Props) => {
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
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="CONV-2026-001"
          helperText="Code unique de la convention"
        />
        <TextField
          fullWidth
          required
          label="Numéro"
          value={formData.numero}
          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
          placeholder="N°2026/001"
          helperText="Numéro administratif"
        />
      </Stack>

      <TextField
        fullWidth
        required
        label="Libellé"
        value={formData.libelle}
        onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
        placeholder="Convention de financement..."
        helperText="Titre court de la convention"
      />

      <TextField
        fullWidth
        required
        multiline
        rows={4}
        label="Objet"
        value={formData.objet}
        onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
        placeholder="Description détaillée de l'objet de la convention..."
        helperText="Description complète de la convention"
      />

      <TextField
        fullWidth
        required
        select
        label="Type de Convention"
        value={formData.typeConvention}
        onChange={(e) => setFormData({ ...formData, typeConvention: e.target.value })}
        helperText="Type de convention (CADRE permet d'avoir des sous-conventions)"
      >
        <MenuItem value="CADRE">Convention Cadre</MenuItem>
        <MenuItem value="NON_CADRE">Convention Non-Cadre</MenuItem>
      </TextField>
    </Stack>
  )
}

export default Step1Informations
