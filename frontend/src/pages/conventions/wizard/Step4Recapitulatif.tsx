import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Stack,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { ConventionFormData } from '../ConventionWizard'

interface Step4Props {
  formData: ConventionFormData
}

const Step4Recapitulatif = ({ formData }: Step4Props) => {
  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/\s/g, '').replace(/,/g, '.'))
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const formatDate = (date: string): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Convention créée avec succès !
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Voici un récapitulatif de la convention que vous venez de créer
        </Typography>
      </Box>

      <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Informations générales
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Code</Typography>
              <Typography variant="body1" fontWeight="bold">{formData.code}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Numéro</Typography>
              <Typography variant="body1" fontWeight="bold">{formData.numero}</Typography>
            </Box>
          </Stack>
          <Box>
            <Typography variant="caption" color="text.secondary">Libellé</Typography>
            <Typography variant="body1" fontWeight="bold">{formData.libelle}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Objet</Typography>
            <Typography variant="body2">{formData.objet}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={formData.typeConvention === 'CADRE' ? 'Convention Cadre' : 'Convention Non-Cadre'}
                color="primary"
                size="small"
              />
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Dates et Budget
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Date de Convention</Typography>
              <Typography variant="body1">{formatDate(formData.dateConvention)}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Date de Début</Typography>
              <Typography variant="body1">{formatDate(formData.dateDebut)}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Date de Fin</Typography>
              <Typography variant="body1">{formData.dateFin ? formatDate(formData.dateFin) : 'Non définie'}</Typography>
            </Box>
          </Stack>
          <Box>
            <Typography variant="caption" color="text.secondary">Budget Total</Typography>
            <Typography variant="h6" color="primary.main">
              {formatNumber(formData.budget)} MAD
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Paramètres de Commission
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Taux de Commission</Typography>
            <Typography variant="body1" fontWeight="bold">{formData.tauxCommission} %</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Base de Calcul</Typography>
            <Typography variant="body1">
              {formData.baseCalcul === 'DECAISSEMENTS_TTC' ? 'Décaissements TTC' : 'Décaissements HT'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Taux de TVA</Typography>
            <Typography variant="body1">{formData.tauxTva} %</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Step4Recapitulatif
