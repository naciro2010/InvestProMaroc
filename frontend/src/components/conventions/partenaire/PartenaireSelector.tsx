import React from 'react'
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  CircularProgress,
  createFilterOptions,
} from '@mui/material'
import type { AutocompleteRenderInputParams, FilterOptionsState } from '@mui/material'
import { PersonAdd as PersonAddIcon, Business as BusinessIcon } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'

interface PartenaireSimple {
  id: number
  code: string
  raisonSociale: string
  sigle: string | null
  actif: boolean
}

interface PartenaireOption extends PartenaireSimple {
  inputValue?: string
  isNew?: boolean
}

interface PartenaireSelectorProps {
  partenaires: PartenaireSimple[]
  selectedPartenaire: PartenaireOption | null
  loading: boolean
  error?: string
  onSelect: (partenaire: PartenaireOption | null) => void
  onCreateNew: (name: string) => void
}

const filter = createFilterOptions<PartenaireOption>()

const PartenaireSelector = ({
  partenaires,
  selectedPartenaire,
  loading,
  error,
  onSelect,
  onCreateNew,
}: PartenaireSelectorProps) => (
  <Autocomplete<PartenaireOption, false, false, true>
    size="small"
    options={partenaires as PartenaireOption[]}
    loading={loading}
    value={selectedPartenaire}
    getOptionLabel={(option: string | PartenaireOption) => {
      if (typeof option === 'string') return option
      if (option.inputValue) return option.inputValue
      return option.sigle
        ? `${option.code} - ${option.sigle} (${option.raisonSociale})`
        : `${option.code} - ${option.raisonSociale}`
    }}
    isOptionEqualToValue={(option: PartenaireOption, value: PartenaireOption) => option.id === value.id}
    filterOptions={(options: PartenaireOption[], params: FilterOptionsState<PartenaireOption>) => {
      const filtered = filter(options, params)
      const { inputValue } = params
      const isExisting = options.some(
        (o: PartenaireOption) => o.raisonSociale.toLowerCase() === inputValue.toLowerCase()
      )
      if (inputValue !== '' && !isExisting) {
        filtered.push({
          inputValue,
          raisonSociale: `Creer "${inputValue}"`,
          isNew: true,
          id: -1, code: '', sigle: null, actif: true,
        })
      }
      return filtered
    }}
    onChange={(_event: React.SyntheticEvent, newValue: string | PartenaireOption | null) => {
      if (typeof newValue === 'string') {
        onCreateNew(newValue)
      } else if (newValue && newValue.isNew) {
        onCreateNew(newValue.inputValue || '')
      } else {
        onSelect(newValue)
      }
    }}
    renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: PartenaireOption) => {
      if (option.isNew) {
        return (
          <li {...props} key="create-new">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.primary[600] }}>
              <PersonAddIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>
                {option.raisonSociale}
              </Typography>
            </Box>
          </li>
        )
      }
      return (
        <li {...props} key={option.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />
            <Box>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                {option.sigle || option.code}
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                {option.raisonSociale}
              </Typography>
            </Box>
          </Box>
        </li>
      )
    }}
    renderInput={(params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        label="Partenaire *"
        placeholder="Rechercher ou creer un partenaire..."
        error={Boolean(error)}
        helperText={error}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress size={18} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
    noOptionsText={
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.textSecondary }}>
        <PersonAddIcon sx={{ fontSize: 16 }} />
        Tapez un nom pour creer un nouveau partenaire
      </Box>
    }
    freeSolo selectOnFocus clearOnBlur handleHomeEndKeys
  />
)

export default PartenaireSelector
export type { PartenaireSimple, PartenaireOption }
