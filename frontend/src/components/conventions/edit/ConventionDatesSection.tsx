import { Controller, Control, FieldErrors } from 'react-hook-form'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  InputAdornment,
} from '@mui/material'
import { CalendarToday } from '@mui/icons-material'

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

interface ConventionDatesSectionProps {
  control: Control<ConventionFormData>
  errors: FieldErrors<ConventionFormData>
}

/**
 * Micro-component: Convention Dates Section
 *
 * Displays and edits convention dates:
 * - Date de signature
 * - Date de début
 * - Date de fin (optional)
 *
 * Uses native HTML5 date inputs for best compatibility
 */
const ConventionDatesSection = ({ control, errors }: ConventionDatesSectionProps) => {
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
          Dates
        </Typography>
        <Divider />
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: { xs: 2, md: 3 }
      }}>
        <Box>
          <Controller
            name="dateSignature"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(new Date(e.target.value))}
                fullWidth
                type="date"
                label="Date de signature"
                error={!!errors.dateSignature}
                helperText={errors.dateSignature?.message as string}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="dateDebut"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(new Date(e.target.value))}
                fullWidth
                type="date"
                label="Date de début"
                error={!!errors.dateDebut}
                helperText={errors.dateDebut?.message as string}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="dateFin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                fullWidth
                type="date"
                label="Date de fin (optionnel)"
                error={!!errors.dateFin}
                helperText={errors.dateFin?.message as string}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionDatesSection
