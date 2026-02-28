import { Box, TextField } from '@mui/material'
import { FormPageSection, FormGroup, FormField } from '@/components/core'
import LocationPicker from '@/components/ui/LocationPicker'
import { componentStyles, spacing } from '@/lib/designSystem'

interface LocationData {
  latitude: number | undefined
  longitude: number | undefined
  adresse: string
}

interface MarcheFormLocationSectionProps {
  latitude: number | undefined
  longitude: number | undefined
  adresse: string
  zoneGeographique: string
  onLocationChange: (location: LocationData) => void
  onZoneGeographiqueChange: (value: string) => void
}

export default function MarcheFormLocationSection({
  latitude,
  longitude,
  adresse,
  zoneGeographique,
  onLocationChange,
  onZoneGeographiqueChange,
}: MarcheFormLocationSectionProps) {
  return (
    <FormPageSection title="Localisation">
      <Box sx={{ mb: spacing.mui.lg }}>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          adresse={adresse}
          onLocationChange={onLocationChange}
        />
      </Box>
      <FormGroup columns={1}>
        <FormField fullWidth>
          <TextField
            label="Zone Geographique"
            value={zoneGeographique}
            onChange={(e) => onZoneGeographiqueChange(e.target.value)}
            fullWidth
            size="small"
            placeholder="Ex: Casablanca, Rabat-Sale-Kenitra, Region du Nord..."
            helperText="Indiquez la region ou zone administrative du marche"
            sx={componentStyles.inputField}
          />
        </FormField>
      </FormGroup>
    </FormPageSection>
  )
}
