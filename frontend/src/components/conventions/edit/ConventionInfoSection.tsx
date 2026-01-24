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
import { Description } from '@mui/icons-material'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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

interface ConventionInfoSectionProps {
  control: Control<ConventionFormData>
  errors: FieldErrors<ConventionFormData>
}

/**
 * Micro-component: Convention Information Section
 *
 * Displays and edits general convention information:
 * - Type de convention
 * - Code
 * - Numéro
 * - Libellé
 * - Objet (Rich text editor)
 */
const ConventionInfoSection = ({ control, errors }: ConventionInfoSectionProps) => {
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
          Informations Générales
        </Typography>
        <Divider />
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: { xs: 2, md: 3 }
      }}>
        {/* Row 1: Type & Code */}
        <Box>
          <Controller
            name="typeConvention"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Type de convention"
                error={!!errors.typeConvention}
                helperText={errors.typeConvention?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="CADRE">CADRE</MenuItem>
                <MenuItem value="SPECIFIQUE">SPECIFIQUE</MenuItem>
              </TextField>
            )}
          />
        </Box>

        <Box>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Code"
                error={!!errors.code}
                helperText={errors.code?.message}
                placeholder="CONV-XXX"
              />
            )}
          />
        </Box>

        {/* Row 2: Numéro & Libellé */}
        <Box>
          <Controller
            name="numero"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Numéro"
                error={!!errors.numero}
                helperText={errors.numero?.message}
                placeholder="XXX/YYYY"
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="libelle"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Libellé"
                error={!!errors.libelle}
                helperText={errors.libelle?.message}
                placeholder="Convention de..."
              />
            )}
          />
        </Box>

        {/* Row 3: Objet (full width) - Rich Text Editor */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            gutterBottom
            display="block"
            sx={{ mb: 1 }}
          >
            Objet de la convention *
          </Typography>
          <Controller
            name="objet"
            control={control}
            render={({ field }) => (
              <Box>
                <Box
                  sx={{
                    '& .quill': {
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: errors.objet ? '1px solid' : '1px solid',
                      borderColor: errors.objet ? 'error.main' : 'divider',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: errors.objet ? 'error.main' : 'text.primary',
                      },
                    },
                    '& .ql-toolbar': {
                      borderRadius: '4px 4px 0 0',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'grey.50',
                    },
                    '& .ql-container': {
                      borderRadius: '0 0 4px 4px',
                      minHeight: 120,
                      fontSize: '0.875rem',
                    },
                    '& .ql-editor': {
                      minHeight: 120,
                    },
                    '& .ql-editor.ql-blank::before': {
                      color: 'text.disabled',
                      fontStyle: 'normal',
                    },
                  }}
                >
                  <ReactQuill
                    value={field.value}
                    onChange={field.onChange}
                    theme="snow"
                    placeholder="Décrivez l'objet de la convention..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean']
                      ]
                    }}
                  />
                </Box>
                {errors.objet && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.75, ml: 1.75, display: 'block' }}
                  >
                    {errors.objet.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionInfoSection
