import { Box, Typography, TextField, MenuItem, Divider, IconButton, Button } from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { colors } from '@/lib/designSystem'
import type { DecompteFormData, Retenue } from './types'

interface StepMontantsRetenuesProps {
  formData: DecompteFormData
  onFormDataChange: (updates: Partial<DecompteFormData>) => void
  onAddRetenue: () => void
  onUpdateRetenue: (index: number, field: keyof Retenue, value: string | number) => void
  onRemoveRetenue: (index: number) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value)

const StepMontantsRetenues = ({
  formData, onFormDataChange, onAddRetenue, onUpdateRetenue, onRemoveRetenue,
}: StepMontantsRetenuesProps) => (
  <Box sx={{ display: 'grid', gap: 3 }}>
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Montants</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
      <DecimalInput fullWidth label="Montant brut HT (DH)" required value={formData.montantBrutHT}
        onChange={(value) => onFormDataChange({ montantBrutHT: value })} min={0} decimalPlaces={2} />
      <DecimalInput fullWidth label="Taux TVA (%)" required value={formData.tauxTVA}
        onChange={(value) => onFormDataChange({ tauxTVA: value })} min={0} max={100} decimalPlaces={2} />
      <DecimalInput fullWidth label="Montant TTC (DH)" value={formData.montantTTC}
        onChange={() => {}} decimalPlaces={2} InputProps={{ readOnly: true }}
        sx={{ '& .MuiInputBase-input': { bgcolor: colors.neutral[50], fontWeight: 600, color: colors.primary[600] } }} />
    </Box>

    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Retenues</Typography>
        <Button variant="outlined" size="small" startIcon={<Add />} onClick={onAddRetenue}>Ajouter une retenue</Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
    </Box>

    {formData.retenues.map((retenue, index) => (
      <Box key={index} sx={{ p: 2, bgcolor: colors.neutral[50], borderRadius: 1, border: `1px solid ${colors.neutral[200]}` }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600}>Retenue {index + 1}</Typography>
            <IconButton size="small" color="error" onClick={() => onRemoveRetenue(index)}><Delete /></IconButton>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 2fr' }, gap: 2 }}>
            <TextField fullWidth select label="Type" size="small" value={retenue.type}
              onChange={(e) => onUpdateRetenue(index, 'type', e.target.value)}>
              <MenuItem value="RG">Retenue de garantie</MenuItem>
              <MenuItem value="PENALITE">Penalite</MenuItem>
              <MenuItem value="AVANCE">Avance</MenuItem>
              <MenuItem value="AUTRE">Autre</MenuItem>
            </TextField>
            <DecimalInput fullWidth label="Montant (DH)" size="small" value={retenue.montant}
              onChange={(value) => onUpdateRetenue(index, 'montant', value)} min={0} decimalPlaces={2} />
            <TextField fullWidth label="Description" size="small" value={retenue.description}
              onChange={(e) => onUpdateRetenue(index, 'description', e.target.value)} />
          </Box>
        </Box>
      </Box>
    ))}

    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>Resume financier</Typography>
      <Divider sx={{ mb: 2 }} />
    </Box>

    <Box sx={{ p: 3, bgcolor: colors.neutral[50], borderRadius: 1, border: `1px solid ${colors.neutral[200]}` }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" color="text.secondary">Montant brut HT</Typography>
          <Typography variant="body1" fontWeight={600}>{formatCurrency(formData.montantBrutHT)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" color="text.secondary">TVA ({formData.tauxTVA}%)</Typography>
          <Typography variant="body1" fontWeight={600}>{formatCurrency(formData.montantTVA)}</Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" color="text.secondary">Montant TTC</Typography>
          <Typography variant="h6" color="primary">{formatCurrency(formData.montantTTC)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" color="error">Total retenues</Typography>
          <Typography variant="body1" fontWeight={600} color="error">{formatCurrency(formData.totalRetenues)}</Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Net a payer</Typography>
          <Typography variant="h5" color="success.main" fontWeight={700}>{formatCurrency(formData.netAPayer)}</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
)

export default StepMontantsRetenues
