import { Box, Typography, TextField, Divider } from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'
import FileUploadZone from '../../../components/common/FileUploadZone'
import { colors } from '@/lib/designSystem'
import type { MarcheFormData, Fournisseur } from './types'

interface StepLocalisationProps {
  formData: MarcheFormData
  fournisseurs: Fournisseur[]
  onChange: (field: keyof MarcheFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (updates: Partial<MarcheFormData>) => void
}

const StepLocalisation = ({ formData, fournisseurs, onChange, onFormDataChange }: StepLocalisationProps) => (
  <Box sx={{ display: 'grid', gap: 3 }}>
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Localisation</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <TextField fullWidth label="Adresse" value={formData.adresse} onChange={onChange('adresse')}
      placeholder="Adresse complète du chantier..." multiline rows={2} />

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
      <DecimalInput fullWidth label="Latitude" value={formData.latitude || 0}
        onChange={(value) => onFormDataChange({ latitude: value || null })} placeholder="33.5731" decimalPlaces={6} />
      <DecimalInput fullWidth label="Longitude" value={formData.longitude || 0}
        onChange={(value) => onFormDataChange({ longitude: value || null })} placeholder="-7.5898" decimalPlaces={6} />
      <TextField fullWidth label="Zone géographique" value={formData.zoneGeographique}
        onChange={onChange('zoneGeographique')} placeholder="Casablanca, Rabat..." />
    </Box>

    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Pièces jointes</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <FileUploadZone files={formData.files} onFilesChange={(files) => onFormDataChange({ files })}
      maxFiles={10} maxSizeMB={10} label="Documents du marché" />

    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Récapitulatif</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <Box sx={{ p: 3, bgcolor: colors.neutral[50], borderRadius: 2 }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Code</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.code}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Numéro de marché</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.numeroMarche}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Typography variant="body1">{formData.typeMarche} - {formData.naturePrestation}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Fournisseur</Typography>
            <Typography variant="body1">{fournisseurs.find(f => f.id === formData.fournisseurId)?.raisonSociale || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Montant HT</Typography>
            <Typography variant="h6" color="text.secondary">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(formData.montantHT)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Montant TTC</Typography>
            <Typography variant="h6" color="primary">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(formData.montantTTC)}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Date de signature</Typography>
          <Typography variant="body1">{new Date(formData.dateSignature).toLocaleDateString('fr-FR')}</Typography>
        </Box>
        {formData.adresse && (
          <Box>
            <Typography variant="caption" color="text.secondary">Localisation</Typography>
            <Typography variant="body1">{formData.adresse}{formData.zoneGeographique && ` - ${formData.zoneGeographique}`}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="caption" color="text.secondary">Pièces jointes</Typography>
          <Typography variant="body1">{formData.files.length} fichier(s)</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
)

export default StepLocalisation
