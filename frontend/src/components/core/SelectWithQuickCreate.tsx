import { useState } from 'react'
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'

export interface SelectOption {
  id: number
  code: string
  label: string
}

interface SelectWithQuickCreateProps {
  label: string
  options: SelectOption[]
  value: number | null
  onChange: (id: number | null) => void
  onQuickCreate: (label: string) => Promise<SelectOption>
  placeholder?: string
  loading?: boolean
  required?: boolean
  disabled?: boolean
}

/**
 * CORE COMPONENT: SelectWithQuickCreate
 *
 * A reusable MUI Autocomplete with inline quick-add capability.
 * When user types a value not found in options, a "+ Ajouter ..." option appears.
 * Clicking it opens a small dialog to create the new item.
 * New item is immediately selected after creation.
 */
const SelectWithQuickCreate = ({
  label,
  options,
  value,
  onChange,
  onQuickCreate,
  placeholder = 'Rechercher...',
  loading = false,
  required = false,
  disabled = false,
}: SelectWithQuickCreateProps) => {
  const [inputValue, setInputValue] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [creating, setCreating] = useState(false)

  const selectedOption = options.find((opt) => opt.id === value) ?? null

  const handleQuickCreate = async () => {
    if (!newLabel.trim()) return
    setCreating(true)
    try {
      const created = await onQuickCreate(newLabel.trim())
      onChange(created.id)
      setDialogOpen(false)
      setNewLabel('')
    } catch {
      // Error handled by caller (toast)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Autocomplete
        value={selectedOption}
        onChange={(_event, newValue) => {
          if (newValue && 'isQuickCreate' in newValue) {
            setNewLabel(inputValue)
            setDialogOpen(true)
            return
          }
          onChange(newValue ? newValue.id : null)
        }}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => {
          setInputValue(newInputValue)
        }}
        options={options}
        loading={loading}
        disabled={disabled}
        getOptionLabel={(option) => option.label || ''}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        filterOptions={(opts, state) => {
          const filtered = opts.filter(
            (opt) =>
              opt.label.toLowerCase().includes(state.inputValue.toLowerCase()) ||
              opt.code.toLowerCase().includes(state.inputValue.toLowerCase())
          )

          // Add quick-create option if input has text and no exact match
          if (state.inputValue.trim() !== '') {
            const hasExactMatch = filtered.some(
              (opt) => opt.label.toLowerCase() === state.inputValue.toLowerCase()
            )
            if (!hasExactMatch) {
              filtered.push({
                id: -1,
                code: '__quick_create__',
                label: state.inputValue,
                isQuickCreate: true,
              } as SelectOption & { isQuickCreate: boolean })
            }
          }

          return filtered
        }}
        renderOption={(props, option) => {
          if ('isQuickCreate' in option) {
            return (
              <Box
                component="li"
                {...props}
                key="quick-create"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: colors.primary[600],
                  fontWeight: typography.weights.semibold,
                  borderTop: `1px solid ${colors.neutral[200]}`,
                  mt: 0.5,
                  pt: 1,
                }}
              >
                <Add sx={{ fontSize: 18 }} />
                <span>Ajouter &quot;{option.label}&quot;</span>
              </Box>
            )
          }

          return (
            <Box component="li" {...props} key={option.id}>
              <Box>
                <Typography
                  sx={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.textPrimary,
                  }}
                >
                  {option.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                  }}
                >
                  {option.code}
                </Typography>
              </Box>
            </Box>
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            size="small"
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
        noOptionsText="Aucune option trouvée"
        size="small"
      />

      {/* Quick Create Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !creating && setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.semibold }}>
          Nouvelle categorie de depense
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Libelle"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            size="small"
            sx={{ mt: 1 }}
            disabled={creating}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={creating} size="small">
            Annuler
          </Button>
          <Button
            onClick={handleQuickCreate}
            variant="contained"
            disabled={creating || !newLabel.trim()}
            size="small"
            sx={{ bgcolor: colors.primary[600] }}
          >
            {creating ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Creer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SelectWithQuickCreate
