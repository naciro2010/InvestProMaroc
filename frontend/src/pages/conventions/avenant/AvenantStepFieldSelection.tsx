import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import { Convention } from '@/types/entities'

interface SelectedFields {
  montant: boolean
  budget: boolean
  tauxCommission: boolean
  baseCalcul: boolean
  tauxTva: boolean
  dateFin: boolean
  objet: boolean
}

interface AvenantStepFieldSelectionProps {
  convention: Convention | null
  selectedFields: SelectedFields
  onFieldChange: (fields: SelectedFields) => void
}

const FIELD_OPTIONS: Array<{
  key: keyof SelectedFields
  label: string
  getDetail: (c: Convention | null) => string
}> = [
  { key: 'budget', label: 'Budget', getDetail: (c) => `Valeur actuelle: ${c?.budget?.toLocaleString('fr-FR')} MAD` },
  { key: 'tauxCommission', label: 'Taux de Commission', getDetail: (c) => `Valeur actuelle: ${c?.tauxCommission} %` },
  { key: 'baseCalcul', label: 'Base de Calcul', getDetail: (c) => `Valeur actuelle: ${c?.baseCalcul}` },
  { key: 'tauxTva', label: 'Taux de TVA', getDetail: (c) => `Valeur actuelle: ${c?.tauxTva} %` },
  { key: 'dateFin', label: 'Date de Fin', getDetail: (c) => `Valeur actuelle: ${c?.dateFin || 'Non definie'}` },
  { key: 'objet', label: 'Objet de la Convention', getDetail: () => 'Modifier la description' },
]

const AvenantStepFieldSelection = ({
  convention,
  selectedFields,
  onFieldChange,
}: AvenantStepFieldSelectionProps) => (
  <Stack spacing={3}>
    <Typography variant="h6">Selectionnez les articles a modifier</Typography>

    {convention && (
      <Alert severity="info">
        <strong>Convention:</strong> {convention.code} - {convention.libelle}
      </Alert>
    )}

    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Stack spacing={2}>
        {FIELD_OPTIONS.map(({ key, label, getDetail }) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={selectedFields[key]}
                onChange={(e) => onFieldChange({ ...selectedFields, [key]: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">{label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {getDetail(convention)}
                </Typography>
              </Box>
            }
          />
        ))}
      </Stack>
    </Box>
  </Stack>
)

export default AvenantStepFieldSelection
export type { SelectedFields }
