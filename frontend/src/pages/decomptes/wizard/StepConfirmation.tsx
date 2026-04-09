import { Box, Typography, Divider, Chip, Alert } from '@mui/material'
import FileUploadZone from '../../../components/common/FileUploadZone'
import { colors } from '@/lib/designSystem'
import { formatCurrency } from '@/lib/utils'
import type { DecompteFormData, Marche } from './types'

interface StepConfirmationProps {
  formData: DecompteFormData
  marches: Marche[]
  onFormDataChange: (updates: Partial<DecompteFormData>) => void
  error: Error | null
}


const StepConfirmation = ({ formData, marches, onFormDataChange, error }: StepConfirmationProps) => (
  <Box sx={{ display: 'grid', gap: 3 }}>
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Pieces jointes</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <FileUploadZone files={formData.files} onFilesChange={(files) => onFormDataChange({ files })}
      maxFiles={10} maxSizeMB={10} label="Documents du decompte" />

    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Recapitulatif</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <Box sx={{ p: 3, bgcolor: colors.neutral[50], borderRadius: 1, border: `1px solid ${colors.neutral[200]}` }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Numero de decompte</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.numeroDecompte}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Date</Typography>
            <Typography variant="body1">{new Date(formData.dateDecompte).toLocaleDateString('fr-FR')}</Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">Marche</Typography>
          <Typography variant="body1">{marches.find(m => m.id === formData.marcheId)?.code || '-'}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">Periode</Typography>
          <Typography variant="body1">
            Du {new Date(formData.periodeDebut).toLocaleDateString('fr-FR')}
            {' au '}
            {new Date(formData.periodeFin).toLocaleDateString('fr-FR')}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Montant TTC</Typography>
            <Typography variant="h6" color="primary">{formatCurrency(formData.montantTTC)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Net a payer</Typography>
            <Typography variant="h6" color="success.main">{formatCurrency(formData.netAPayer)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Nombre de retenues</Typography>
            <Typography variant="body1">{formData.retenues.length} retenue(s)</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Statut</Typography>
            <Chip label={formData.statut} size="small" color={formData.statut === 'VALIDE' ? 'success' : 'default'} />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">Pieces jointes</Typography>
          <Typography variant="body1">{formData.files.length} fichier(s)</Typography>
        </Box>
      </Box>
    </Box>

    {error && (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Erreur lors de la creation du decompte'}
      </Alert>
    )}
  </Box>
)

export default StepConfirmation
