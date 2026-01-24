import { Controller, Control, FieldErrors } from 'react-hook-form'
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Divider,
  InputAdornment,
} from '@mui/material'
import { Euro, Percent, Business } from '@mui/icons-material'
import DecimalInput from '../../ui/DecimalInput'

interface ConventionFormData {
  code: string
  numero: string
  libelle: string
  objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  tauxCommission: number
  baseCalcul: 'DECAISSEMENTS_HT' | 'DECAISSEMENTS_TTC' | 'MONTANT_HT' | 'MONTANT_TTC' | 'MONTANT_MARCHE'
  montant: number
  dateSignature: Date
  dateDebut: Date
  dateFin: Date | null
  tauxTva: number
}

interface ConventionFinancesSectionProps {
  control: Control<ConventionFormData>
  errors: FieldErrors<ConventionFormData>
}

/**
 * Micro-component: Convention Financial Information Section
 *
 * Displays and edits financial information:
 * - Montant
 * - Base de calcul
 * - Taux de commission
 * - Taux TVA
 *
 * Uses DecimalInput for Odoo/Excel-like number editing
 */
const ConventionFinancesSection = ({ control, errors }: ConventionFinancesSectionProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
          Informations Financières
        </Typography>
        <Divider />
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: { xs: 2, md: 3 }
      }}>
        {/* Row 1: Montant & Base de Calcul */}
        <Box>
          <Controller
            name="montant"
            control={control}
            render={({ field }) => (
              <DecimalInput
                value={field.value}
                onChange={field.onChange}
                fullWidth
                label="Montant"
                error={!!errors.montant}
                helperText={errors.montant?.message}
                decimalPlaces={2}
                min={0}
                max={999999999}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Euro color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="baseCalcul"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Base de calcul"
                error={!!errors.baseCalcul}
                helperText={errors.baseCalcul?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
                <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
                <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
                <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
                <MenuItem value="MONTANT_MARCHE">Montant Marché</MenuItem>
              </TextField>
            )}
          />
        </Box>

        {/* Row 2: Taux Commission & Taux TVA */}
        <Box>
          <Controller
            name="tauxCommission"
            control={control}
            render={({ field }) => (
              <DecimalInput
                value={field.value}
                onChange={field.onChange}
                fullWidth
                label="Taux de commission"
                error={!!errors.tauxCommission}
                helperText={errors.tauxCommission?.message}
                decimalPlaces={2}
                min={0}
                max={100}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Percent color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="tauxTva"
            control={control}
            render={({ field }) => (
              <DecimalInput
                value={field.value}
                onChange={field.onChange}
                fullWidth
                label="Taux TVA"
                error={!!errors.tauxTva}
                helperText={errors.tauxTva?.message}
                decimalPlaces={2}
                min={0}
                max={100}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Percent color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            )}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionFinancesSection
