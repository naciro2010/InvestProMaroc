import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'
import RichTextEditor from '@/components/common/RichTextEditor'
import { getPlainTextLength, stripHtml } from '@/utils/textUtils'
import type { ConventionSettings } from '@/lib/settings/conventionSettings'
import type {
  ConventionWizardFormData,
  ConventionTypeOptionDisplay,
  HandleChangeFunction,
  SetFormDataFunction,
} from './types'

interface WizardStepInformationsProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  handleChange: HandleChangeFunction
  settings: ConventionSettings
  autoDateFin: boolean
  typeOptionsWithCurrent: ConventionTypeOptionDisplay[]
}

const WizardStepInformations = ({
  formData,
  setFormData,
  handleChange,
  settings,
  autoDateFin,
  typeOptionsWithCurrent,
}: WizardStepInformationsProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          📋 Informations générales
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Code, Numéro, Type */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          label="Code *"
          value={formData.code}
          onChange={handleChange('code')}
          placeholder={settings.codeMaskPlaceholder}
          inputProps={{ pattern: settings.codeMaskPattern }}
          helperText={`Format attendu : ${settings.codeMaskPlaceholder}`}
          size="small"
        />
        <TextField
          fullWidth
          label="Numéro de convention"
          value={formData.numeroConvention}
          onChange={handleChange('numeroConvention')}
          placeholder={settings.numeroMaskPlaceholder}
          inputProps={{ pattern: settings.numeroMaskPattern }}
          helperText={`Format attendu : ${settings.numeroMaskPlaceholder}`}
          size="small"
        />
        <TextField
          fullWidth
          select
          label="Type *"
          value={formData.type}
          onChange={handleChange('type')}
          size="small"
        >
          {typeOptionsWithCurrent.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Info alert */}
      <Alert severity="info">
        {formData.type === 'CADRE'
          ? '📌 Convention CADRE - Permet de créer des sous-conventions après validation.'
          : '📋 Convention NON_CADRE - Convention simple et directe.'}
      </Alert>

      {/* Libellé */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Libellé de la convention *
        </Typography>
        <RichTextEditor
          value={formData.libelleRich}
          onChange={(value) => {
            const plain = stripHtml(value).substring(0, 200)
            setFormData((prev) => ({
              ...prev,
              libelleRich: value,
              libelle: plain,
            }))
          }}
          placeholder="Libellé de la convention..."
          minHeight={120}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {getPlainTextLength(formData.libelleRich)} / 200 caractères
        </Typography>
      </Box>

      {/* Objet (Rich Text) */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Objet de la convention *
        </Typography>
        <RichTextEditor
          value={formData.objetRich}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              objetRich: value,
              objet: stripHtml(value).substring(0, 500),
            }))
          }}
          placeholder="Décrivez l'objet de la convention en détail..."
          minHeight={200}
        />
      </Box>

      {/* Dates */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          📅 Dates
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            fullWidth
            label="Date de signature"
            type="date"
            value={formData.dateSignature}
            onChange={handleChange('dateSignature')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            fullWidth
            label="Date de début *"
            type="date"
            value={formData.dateDebut}
            onChange={handleChange('dateDebut')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            fullWidth
            label="Date de fin"
            type="date"
            value={formData.dateFin}
            onChange={handleChange('dateFin')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <Box sx={{ mt: 2, maxWidth: 260 }}>
          <DecimalInput
            fullWidth
            label="Durée (mois)"
            value={Number(formData.dureeMois) || 0}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                dureeMois: value,
              }))
            }}
            decimalPlaces={0}
            min={0}
            helperText={
              autoDateFin
                ? 'La date de fin est calculée automatiquement.'
                : 'Modifiez la durée pour recalculer la date de fin.'
            }
            size="small"
          />
        </Box>
      </Box>
    </Box>
  )
}

export default WizardStepInformations
