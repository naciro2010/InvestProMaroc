import { useState, useCallback } from 'react'
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
  Alert,
  type AutocompleteRenderInputParams,
  type FilterOptionsState,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { colors, typography, borders } from '@/lib/designSystem'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Minimal shape every option must satisfy. */
export interface AutocompleteOption {
  id: number
  label: string        // Primary display text (e.g. raisonSociale, libelle)
  secondaryLabel?: string  // Secondary line (e.g. code, ICE)
}

/** Configuration for the inline quick-create dialog. */
export interface QuickCreateConfig<T extends AutocompleteOption> {
  /** Dialog title, e.g. "Nouveau partenaire" */
  dialogTitle: string
  /** Fields rendered inside the dialog. Each field = one TextField. */
  fields: QuickCreateField[]
  /** Called when user confirms creation. Must return the new option. */
  onCreate: (values: Record<string, string>) => Promise<T>
  /** Optional icon displayed next to the dialog title */
  icon?: React.ReactNode
  /** Optional info message shown at the bottom of the dialog */
  infoMessage?: string
}

export interface QuickCreateField {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  helperText?: string
  autoFocus?: boolean
}

interface ApiAutocompleteProps<T extends AutocompleteOption> {
  /** Full label shown above the field */
  label: string
  /** Placeholder text inside the input */
  placeholder?: string
  /** Currently selected option (controlled) */
  value: T | null
  /** Callback when user picks (or clears) an option */
  onChange: (option: T | null) => void
  /** The list of available options (caller handles fetching) */
  options: T[]
  /** Whether options are still loading */
  loading?: boolean
  /** Custom icon rendered in each option row (before label) */
  optionIcon?: React.ReactNode
  /** Quick-create configuration. If omitted, no "+ Ajouter" row appears. */
  quickCreate?: QuickCreateConfig<T>
  /** Additional fields to match when filtering (besides label & secondaryLabel) */
  filterFields?: (keyof T)[]
  /** Whether a selection is required (shows asterisk) */
  required?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Validation error text (shows red border + helperText) */
  error?: string
  /** MUI size */
  size?: 'small' | 'medium'
  /** Extra sx applied to the Autocomplete root */
  sx?: Record<string, unknown>
  /** "Aucune option trouvée" replacement */
  noOptionsText?: React.ReactNode
}

// Internal marker for the "create new" row
interface QuickCreateMarker {
  __isQuickCreate: true
  id: number
  label: string
  secondaryLabel?: string
}

type InternalOption<T extends AutocompleteOption> = T | QuickCreateMarker

function isQuickCreateMarker<T extends AutocompleteOption>(
  opt: InternalOption<T>,
): opt is QuickCreateMarker {
  return '__isQuickCreate' in opt
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

/**
 * CORE COMPONENT: ApiAutocomplete
 *
 * Standardised autocomplete with search, duplicate prevention,
 * and optional inline quick-create dialog.
 *
 * Design-system-aligned: colours, typography, and spacing all
 * come from `designSystem.ts`.
 *
 * Usage:
 * ```tsx
 * <ApiAutocomplete
 *   label="Partenaire"
 *   placeholder="Rechercher un partenaire..."
 *   value={selected}
 *   onChange={setSelected}
 *   options={partenaires}
 *   loading={loadingPartenaires}
 *   optionIcon={<Business sx={{ fontSize: 16, color: colors.neutral[400] }} />}
 *   quickCreate={{
 *     dialogTitle: 'Nouveau partenaire',
 *     fields: [
 *       { name: 'raisonSociale', label: 'Raison sociale', required: true, autoFocus: true },
 *       { name: 'code', label: 'Code', placeholder: 'Auto-généré si vide' },
 *     ],
 *     onCreate: async (vals) => { ... return newOption },
 *   }}
 * />
 * ```
 */
export default function ApiAutocomplete<T extends AutocompleteOption>({
  label,
  placeholder = 'Rechercher...',
  value,
  onChange,
  options,
  loading = false,
  optionIcon,
  quickCreate,
  filterFields,
  required = false,
  disabled = false,
  error,
  size = 'small',
  sx,
  noOptionsText,
}: ApiAutocompleteProps<T>) {
  // ── Quick-create dialog state ──
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogValues, setDialogValues] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [inputValue, setInputValue] = useState('')

  const openCreateDialog = useCallback(
    (prefill: string) => {
      if (!quickCreate) return
      // Pre-fill the first field with whatever the user typed
      const initial: Record<string, string> = {}
      quickCreate.fields.forEach((f, i) => {
        initial[f.name] = i === 0 ? prefill : ''
      })
      setDialogValues(initial)
      setCreateError('')
      setDialogOpen(true)
    },
    [quickCreate],
  )

  const handleCreate = async () => {
    if (!quickCreate) return
    setCreating(true)
    setCreateError('')
    try {
      const created = await quickCreate.onCreate(dialogValues)
      onChange(created)
      setDialogOpen(false)
      setDialogValues({})
      setInputValue('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCreateError(err.message)
      } else {
        setCreateError('Erreur lors de la creation')
      }
    } finally {
      setCreating(false)
    }
  }

  // ── Filter logic ──
  const filterOptions = (
    opts: InternalOption<T>[],
    state: FilterOptionsState<InternalOption<T>>,
  ): InternalOption<T>[] => {
    const query = state.inputValue.toLowerCase().trim()

    const filtered = opts.filter((opt) => {
      if (isQuickCreateMarker(opt)) return false
      const baseMatch =
        opt.label.toLowerCase().includes(query) ||
        (opt.secondaryLabel?.toLowerCase().includes(query) ?? false)
      if (baseMatch) return true
      // Check additional filter fields
      if (filterFields) {
        return filterFields.some((key) => {
          const val = opt[key]
          return typeof val === 'string' && val.toLowerCase().includes(query)
        })
      }
      return false
    })

    // Append quick-create row when there is text and no exact match
    if (quickCreate && query !== '') {
      const hasExact = filtered.some(
        (opt) => opt.label.toLowerCase() === query,
      )
      if (!hasExact) {
        filtered.push({
          __isQuickCreate: true,
          id: -1,
          label: state.inputValue,
        } as QuickCreateMarker)
      }
    }

    return filtered
  }

  // ── Render helpers ──
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: InternalOption<T>,
  ) => {
    if (isQuickCreateMarker(option)) {
      return (
        <Box
          component="li"
          {...props}
          key="__quick_create__"
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
          {quickCreate?.icon ?? <AddIcon sx={{ fontSize: 18 }} />}
          <span>Ajouter &quot;{option.label}&quot;</span>
        </Box>
      )
    }

    return (
      <Box component="li" {...props} key={option.id}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {optionIcon}
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
            {option.secondaryLabel && (
              <Typography
                sx={{
                  fontSize: typography.sizes.xs,
                  color: colors.textSecondary,
                }}
              >
                {option.secondaryLabel}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  // ── Determine whether the first required quick-create field is filled ──
  const canSubmitDialog = quickCreate
    ? quickCreate.fields
        .filter((f) => f.required)
        .every((f) => (dialogValues[f.name] ?? '').trim() !== '')
    : false

  const defaultNoOptions = quickCreate ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: colors.textSecondary,
      }}
    >
      {quickCreate.icon ?? <AddIcon sx={{ fontSize: 16 }} />}
      Tapez un nom pour creer un nouvel element
    </Box>
  ) : (
    'Aucune option trouvee'
  )

  return (
    <>
      <Autocomplete<InternalOption<T>, false, false, true>
        size={size}
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={options as InternalOption<T>[]}
        loading={loading}
        disabled={disabled}
        value={value as InternalOption<T> | null}
        inputValue={inputValue}
        onInputChange={(_e, newVal) => setInputValue(newVal)}
        getOptionLabel={(opt) => {
          if (typeof opt === 'string') return opt
          return opt.label ?? ''
        }}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        filterOptions={filterOptions}
        onChange={(_e, newValue) => {
          if (typeof newValue === 'string') {
            openCreateDialog(newValue)
            return
          }
          if (newValue && isQuickCreateMarker(newValue)) {
            openCreateDialog(newValue.label)
            return
          }
          onChange((newValue as T) ?? null)
        }}
        renderOption={renderOption}
        renderInput={(params: AutocompleteRenderInputParams) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={Boolean(error)}
            helperText={error}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        noOptionsText={noOptionsText ?? defaultNoOptions}
        sx={sx}
      />

      {/* ── Quick-create dialog ── */}
      {quickCreate && (
        <Dialog
          open={dialogOpen}
          onClose={() => !creating && setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {quickCreate.icon ?? <AddIcon sx={{ color: colors.primary[600] }} />}
              <Typography
                sx={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                }}
              >
                {quickCreate.dialogTitle}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 1,
              }}
            >
              {createError && <Alert severity="error">{createError}</Alert>}

              {quickCreate.fields.map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  size="small"
                  label={field.required ? `${field.label} *` : field.label}
                  value={dialogValues[field.name] ?? ''}
                  onChange={(e) =>
                    setDialogValues((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  autoFocus={field.autoFocus}
                  disabled={creating}
                />
              ))}

              {quickCreate.infoMessage && (
                <Alert
                  severity="info"
                  sx={{
                    fontSize: typography.sizes.xs,
                    borderRadius: borders.radius.md,
                  }}
                >
                  {quickCreate.infoMessage}
                </Alert>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              size="small"
              disabled={creating}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleCreate}
              disabled={creating || !canSubmitDialog}
              startIcon={
                creating ? (
                  <CircularProgress size={14} />
                ) : (
                  quickCreate.icon ?? <AddIcon />
                )
              }
              sx={{ bgcolor: colors.primary[600] }}
            >
              {creating ? 'Creation...' : 'Creer et selectionner'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
