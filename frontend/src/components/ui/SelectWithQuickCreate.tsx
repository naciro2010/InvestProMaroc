import { useState } from 'react'
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Add, Close } from '@mui/icons-material'
import { Controller, Control, FieldError } from 'react-hook-form'

export interface SelectOption {
  id: number
  label: string
  [key: string]: unknown
}

interface SelectWithQuickCreateProps<T extends SelectOption> {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  label: string
  options: T[]
  loading?: boolean
  error?: FieldError
  placeholder?: string
  helperText?: string
  disabled?: boolean
  required?: boolean

  // Quick create modal
  createModalTitle: string
  createModalContent: React.ReactNode
  onCreateSubmit: () => Promise<void>
  createLoading?: boolean

  // Optional callbacks
  onOpen?: () => void
  onChange?: (value: T | null) => void
}

/**
 * Composant innovant : Select avec création rapide
 *
 * Permet de :
 * - Sélectionner un élément depuis une liste déroulante (Autocomplete)
 * - Créer un nouvel élément directement via un bouton "+"
 * - Modal de création rapide sans quitter le formulaire
 * - Auto-sélection de l'élément créé
 *
 * Utilisable pour tous les référentiels (Partenaires, Types de dépenses, etc.)
 */
function SelectWithQuickCreate<T extends SelectOption>({
  name,
  control,
  label,
  options,
  loading = false,
  error,
  placeholder,
  helperText,
  disabled = false,
  required = false,
  createModalTitle,
  createModalContent,
  onCreateSubmit,
  createLoading = false,
  onOpen,
  onChange,
}: SelectWithQuickCreateProps<T>) {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false)
  }

  const handleCreate = async () => {
    try {
      await onCreateSubmit()
      handleCloseCreateModal()
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
              {...field}
              fullWidth
              options={options}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loading}
              disabled={disabled}
              onOpen={onOpen}
              onChange={(_, value) => {
                field.onChange(value)
                onChange?.(value)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  placeholder={placeholder}
                  error={!!error}
                  helperText={error?.message || helperText}
                  required={required}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {/* Bouton de création rapide */}
            <Tooltip title={`Créer un nouveau ${label.toLowerCase()}`}>
              <span>
                <IconButton
                  color="primary"
                  onClick={handleOpenCreateModal}
                  disabled={disabled}
                  sx={{
                    mt: 0.5,
                    bgcolor: 'primary.lighter',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <Add />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
      />

      {/* Modal de création rapide */}
      <Dialog
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {createModalTitle}
          <IconButton onClick={handleCloseCreateModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {createModalContent}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCreateModal} disabled={createLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={createLoading}
            startIcon={createLoading ? <CircularProgress size={16} /> : <Add />}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SelectWithQuickCreate
