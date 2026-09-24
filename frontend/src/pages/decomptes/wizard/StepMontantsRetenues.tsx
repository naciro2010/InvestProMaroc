import { Box, TextField, MenuItem, IconButton, Button } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { Plus } from 'lucide-react'
import DecimalInput from '@/components/ui/DecimalInput'
import { AlertBanner } from '@/components/core'
import { colors, componentStyles, typography } from '@/lib/designSystem'
import { formatNumber } from '@/lib/utils'
import { RETENUE_LABELS, type DecompteFormData, type Retenue, type TypeRetenue } from './types'

interface StepMontantsRetenuesProps {
  formData: DecompteFormData
  onFormDataChange: (updates: Partial<DecompteFormData>) => void
  onAddRetenue: () => void
  onUpdateRetenue: (index: number, field: keyof Retenue, value: string | number) => void
  onRemoveRetenue: (index: number) => void
  /** Taux de retenue de garantie du marché (%) */
  tauxRetenueGarantie?: number | null
  /** Erreurs bloquantes de l'étape */
  errors: string[]
}

const sectionTitle = {
  m: 0, mb: 1.5, fontFamily: typography.fontFamilySerif, fontWeight: 500, fontSize: '18px', color: colors.textPrimary,
}

/** Étape 2 : brut HT, TVA, TTC calculé ; retenues en lignes ; validation bloquante. */
const StepMontantsRetenues = ({
  formData, onFormDataChange, onAddRetenue, onUpdateRetenue, onRemoveRetenue, tauxRetenueGarantie, errors,
}: StepMontantsRetenuesProps) => {
  const rgSuggeree = tauxRetenueGarantie ? Math.round(formData.montantBrutHT * tauxRetenueGarantie) / 100 : 0

  const appliquerRG = () => {
    const index = formData.retenues.findIndex(r => r.type === 'GARANTIE')
    if (index >= 0) onUpdateRetenue(index, 'montant', rgSuggeree)
    else onFormDataChange({ retenues: [...formData.retenues, { type: 'GARANTIE', montant: rgSuggeree, description: `RG ${tauxRetenueGarantie} %` }] })
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Box component="h2" sx={sectionTitle}>Montants</Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <DecimalInput fullWidth label="Montant brut HT (MAD)" required value={formData.montantBrutHT}
            onChange={(value) => onFormDataChange({ montantBrutHT: value })} min={0} decimalPlaces={2} />
          <DecimalInput fullWidth label="Taux de TVA (%)" required value={formData.tauxTVA}
            onChange={(value) => onFormDataChange({ tauxTVA: value })} min={0} max={100} decimalPlaces={2} />
          <DecimalInput fullWidth label="Montant TTC (calculé)" value={formData.montantTTC}
            onChange={() => {}} decimalPlaces={2} InputProps={{ readOnly: true }}
            sx={{ '& .MuiInputBase-root': { bgcolor: colors.surfaceAlt }, '& .MuiInputBase-input': { fontWeight: 600 } }} />
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Box component="h2" sx={{ ...sectionTitle, mb: 0 }}>Retenues</Box>
          {tauxRetenueGarantie ? (
            <Button variant="outlined" onClick={appliquerRG} disabled={formData.montantBrutHT <= 0} sx={componentStyles.buttonSecondary}>
              Calculer la RG ({tauxRetenueGarantie} %)
            </Button>
          ) : null}
        </Box>

        {formData.retenues.length === 0 && (
          <Box sx={{ fontSize: 13, color: colors.textTertiary, mb: 1.5 }}>Aucune retenue sur ce décompte.</Box>
        )}

        <Box sx={{ display: 'grid', gap: 1.25 }}>
          {formData.retenues.map((retenue, index) => (
            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 180px minmax(0, 1fr) 40px' }, gap: 1.5, alignItems: 'center' }}>
              <TextField fullWidth select label="Type" size="small" value={retenue.type}
                onChange={(e) => onUpdateRetenue(index, 'type', e.target.value as TypeRetenue)}>
                {(Object.keys(RETENUE_LABELS) as TypeRetenue[]).map(t => (
                  <MenuItem key={t} value={t}>{RETENUE_LABELS[t]}</MenuItem>
                ))}
              </TextField>
              <DecimalInput fullWidth label="Montant (MAD)" size="small" value={retenue.montant}
                onChange={(value) => onUpdateRetenue(index, 'montant', value)} min={0} decimalPlaces={2}
                helperText={retenue.type === 'GARANTIE' && rgSuggeree > 0 && retenue.montant !== rgSuggeree ? `Suggestion : ${formatNumber(rgSuggeree)}` : undefined} />
              <TextField fullWidth label="Description" size="small" value={retenue.description}
                onChange={(e) => onUpdateRetenue(index, 'description', e.target.value)} />
              <IconButton onClick={() => onRemoveRetenue(index)} aria-label={`Supprimer la retenue ${index + 1}`} sx={{ color: colors.danger[600] }}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Button onClick={onAddRetenue} startIcon={<Plus size={14} />} sx={{ ...componentStyles.buttonDashed, mt: 1.5 }}>
          Ajouter une retenue
        </Button>
      </Box>

      {errors.length > 0 && (
        <AlertBanner tone="e">
          {errors.map(e => <div key={e}>{e}</div>)}
        </AlertBanner>
      )}
    </Box>
  )
}

export default StepMontantsRetenues
