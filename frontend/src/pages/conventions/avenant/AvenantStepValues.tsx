import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Stack,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material'
import { CompareArrows } from '@mui/icons-material'
import { Convention } from '@/types/entities'
import RichTextEditor from '@/components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { colors, typography } from '@/lib/designSystem'
import type { SelectedFields } from './AvenantStepFieldSelection'

interface PartenaireAllocation {
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
}

interface AvenantFormData {
  numeroAvenant: string
  dateAvenant: string
  objet: string
  budget: string
  tauxCommission: string
  baseCalcul: string
  tauxTva: string
  dateFin: string
  objetModifie: string
  justification: string
}

interface AvenantStepValuesProps {
  convention: Convention | null
  selectedFields: SelectedFields
  formData: AvenantFormData
  partenaires: PartenaireAllocation[]
  onFormChange: (data: AvenantFormData) => void
}

const AvenantStepValues = ({
  convention,
  selectedFields,
  formData,
  partenaires,
  onFormChange,
}: AvenantStepValuesProps) => {
  const update = (field: keyof AvenantFormData, value: string) => {
    onFormChange({ ...formData, [field]: value })
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Nouvelles valeurs</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField fullWidth required label="Numero de l'Avenant" value={formData.numeroAvenant}
          onChange={(e) => update('numeroAvenant', e.target.value)} placeholder="AV-001" />
        <TextField fullWidth required type="date" label="Date de l'Avenant" value={formData.dateAvenant}
          onChange={(e) => update('dateAvenant', e.target.value)} InputLabelProps={{ shrink: true }} />
      </Stack>

      <RichTextEditor label="Objet de l'Avenant" value={formData.objet}
        onChange={(value) => update('objet', value)} placeholder="Description de l'avenant..." required minHeight={100} />

      <Divider />

      {selectedFields.budget && (
        <ComparisonField label="Budget" currentValue={convention?.budget?.toLocaleString('fr-FR')} unit="MAD">
          <DecimalInput required label="Nouvelle valeur" value={Number(formData.budget) || 0}
            onChange={(value) => update('budget', String(value))} decimalPlaces={2} min={0} size="small" sx={{ flex: 1 }}
            InputProps={{ endAdornment: <InputAdornment position="end">MAD</InputAdornment> }} />
          {partenaires.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: colors.neutral[25], border: `1px solid ${colors.neutral[200]}`, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: typography.weights.semibold }}>
                Repartition actuelle du budget par partenaire
              </Typography>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { px: 1.5, py: 0.75, fontSize: typography.sizes.sm, borderBottom: `1px solid ${colors.neutral[100]}` } }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontWeight: 600, color: colors.textSecondary }}>Partenaire</th>
                    <th style={{ textAlign: 'right', fontWeight: 600, color: colors.textSecondary }}>Budget alloue</th>
                    <th style={{ textAlign: 'right', fontWeight: 600, color: colors.textSecondary }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {partenaires.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.partenaireSigle || p.partenaireNom}</td>
                      <td style={{ textAlign: 'right' }}>{p.budgetAlloue?.toLocaleString('fr-FR')} MAD</td>
                      <td style={{ textAlign: 'right' }}>{p.pourcentage?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Box>
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Apres validation de l'avenant, pensez a mettre a jour la repartition du budget.
              </Alert>
            </Box>
          )}
        </ComparisonField>
      )}

      {selectedFields.tauxCommission && (
        <ComparisonField label="Taux de Commission" currentValue={String(convention?.tauxCommission)} unit="%">
          <DecimalInput required label="Nouvelle valeur" value={Number(formData.tauxCommission) || 0}
            onChange={(value) => update('tauxCommission', String(value))} decimalPlaces={2} min={0} max={100} size="small" sx={{ flex: 1 }}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
        </ComparisonField>
      )}

      {selectedFields.baseCalcul && (
        <ComparisonField label="Base de Calcul" currentValue={convention?.baseCalcul}>
          <TextField required select label="Nouvelle valeur" value={formData.baseCalcul}
            onChange={(e) => update('baseCalcul', e.target.value)} size="small" sx={{ flex: 1 }}>
            <MenuItem value="DECAISSEMENTS_TTC">Decaissements TTC</MenuItem>
            <MenuItem value="DECAISSEMENTS_HT">Decaissements HT</MenuItem>
          </TextField>
        </ComparisonField>
      )}

      {selectedFields.tauxTva && (
        <ComparisonField label="Taux de TVA" currentValue={String(convention?.tauxTva)} unit="%">
          <DecimalInput required label="Nouvelle valeur" value={Number(formData.tauxTva) || 0}
            onChange={(value) => update('tauxTva', String(value))} decimalPlaces={2} min={0} max={100} size="small" sx={{ flex: 1 }}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
        </ComparisonField>
      )}

      {selectedFields.dateFin && (
        <ComparisonField label="Date de Fin" currentValue={convention?.dateFin || 'Non definie'}>
          <TextField required type="date" label="Nouvelle valeur" value={formData.dateFin}
            onChange={(e) => update('dateFin', e.target.value)} size="small" sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
        </ComparisonField>
      )}

      {selectedFields.objet && (
        <RichTextEditor label="Nouvel Objet de la Convention" value={formData.objetModifie}
          onChange={(value) => update('objetModifie', value)} placeholder="Nouvel objet de la convention..." minHeight={120} />
      )}

      <RichTextEditor label="Justification" value={formData.justification}
        onChange={(value) => update('justification', value)} placeholder="Justification des modifications..." minHeight={120} />
    </Stack>
  )
}

// Helper sub-component for before/after comparison fields
interface ComparisonFieldProps {
  label: string
  currentValue?: string
  unit?: string
  children: React.ReactNode
}

const ComparisonField = ({ label, currentValue, unit, children }: ComparisonFieldProps) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>
      <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
      {label}
    </Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField label="Valeur actuelle" value={currentValue} disabled size="small" sx={{ flex: 1 }}
        InputProps={unit ? { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> } : undefined} />
      <Typography>→</Typography>
      {children}
    </Stack>
  </Box>
)

export default AvenantStepValues
export type { AvenantFormData, PartenaireAllocation }
