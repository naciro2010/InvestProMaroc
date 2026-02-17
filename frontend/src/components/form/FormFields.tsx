import React from 'react'
import {
  Controller,
  FieldValues,
  FieldPath,
  Control,
} from 'react-hook-form'
import {
  TextField,
  Select,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Box,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import DecimalInput from '@/components/ui/DecimalInput'

/**
 * Reusable form components integrated with react-hook-form
 * All components use Material-UI for consistency
 */

// ============================================================================
// FormTextField Component
// ============================================================================

interface FormTextFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  multiline?: boolean
  rows?: number
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 1,
  fullWidth = true,
  required = false,
  disabled = false,
  error,
  helperText,
  inputProps,
}: FormTextFieldProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          placeholder={placeholder}
          type={type}
          multiline={multiline}
          rows={multiline ? rows : undefined}
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message || error || helperText}
          variant="outlined"
          size="small"
          inputProps={inputProps}
        />
      )}
    />
  )
}

// ============================================================================
// FormNumberField Component
// ============================================================================

interface FormNumberFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  min?: number
  max?: number
  decimalPlaces?: number
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  error?: string
}

export function FormNumberField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  min,
  max,
  decimalPlaces = 2,
  fullWidth = true,
  required = false,
  disabled = false,
  error,
}: FormNumberFieldProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DecimalInput
          value={typeof field.value === 'number' ? field.value : 0}
          onChange={(val) => field.onChange(val)}
          label={label}
          placeholder={placeholder}
          decimalPlaces={decimalPlaces}
          min={min}
          max={max}
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message || error}
          variant="outlined"
          size="small"
        />
      )}
    />
  )
}

// ============================================================================
// FormDateField Component
// ============================================================================

interface FormDateFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  type?: 'date' | 'datetime-local' | 'month'
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  error?: string
}

export function FormDateField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'date',
  fullWidth = true,
  required = false,
  disabled = false,
  error,
}: FormDateFieldProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const formatDate = (value: unknown): string => {
          if (!value) return ''
          if (value instanceof Date) {
            return value.toISOString().split('T')[0]
          }
          if (typeof value === 'string') {
            return value.split('T')[0]
          }
          return ''
        }

        return (
          <TextField
            {...field}
            label={label}
            type={type}
            fullWidth={fullWidth}
            required={required}
            disabled={disabled}
            error={!!fieldState.error}
            helperText={fieldState.error?.message || error}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => {
              field.onChange(e.target.value ? new Date(e.target.value) : '')
            }}
            value={formatDate(field.value)}
          />
        )
      }}
    />
  )
}

// ============================================================================
// FormSelectField Component
// ============================================================================

interface SelectOption {
  label: string
  value: string | number
}

interface FormSelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  multiple?: boolean
  error?: string
}

export function FormSelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  fullWidth = true,
  required = false,
  disabled = false,
  multiple = false,
  error,
}: FormSelectFieldProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth={fullWidth} error={!!fieldState.error} required={required}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            label={label}
            disabled={disabled}
            multiple={multiple}
            value={field.value || (multiple ? [] : '')}
          >
            {placeholder && <MenuItem value="">{placeholder}</MenuItem>}
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          {error && !fieldState.error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

// ============================================================================
// FormRadioGroup Component
// ============================================================================

interface FormRadioGroupProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: SelectOption[]
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  row?: boolean
  error?: string
}

export function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  label,
  options,
  fullWidth = true,
  required = false,
  disabled = false,
  row = false,
  error,
}: FormRadioGroupProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth={fullWidth} error={!!fieldState.error} required={required}>
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            {...field}
            row={row}
            sx={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio disabled={disabled} />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          {error && !fieldState.error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

// ============================================================================
// FormCheckbox Component
// ============================================================================

interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  disabled?: boolean
  error?: string
}

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  disabled = false,
  error,
}: FormCheckboxProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box>
          <FormControlLabel
            control={<Checkbox {...field} checked={!!field.value} disabled={disabled} />}
            label={label}
          />
          {fieldState.error && (
            <FormHelperText error>{fieldState.error.message}</FormHelperText>
          )}
          {error && !fieldState.error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      )}
    />
  )
}

// ============================================================================
// FormErrors Component - Display all form errors
// ============================================================================

interface FormErrorsProps {
  errors: Record<string, unknown>
  className?: string
}

export function FormErrors({ errors, className }: FormErrorsProps): React.ReactElement | null {
  const errorList = Object.entries(errors).filter(([, error]) => error)

  if (errorList.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        bgcolor: '#ffebee',
        border: '1px solid #ef5350',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
      className={className}
    >
      {errorList.map(([field, error]) => (
        <div key={field} style={{ color: '#c62828', fontSize: '0.875rem' }}>
          <strong>{field}:</strong> {String((error as { message?: string })?.message || error)}
        </div>
      ))}
    </Box>
  )
}

// ============================================================================
// FormSection Component - Organize form fields
// ============================================================================

interface FormSectionProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  icon?: React.ReactNode
  columns?: 1 | 2 | 3
}

export function FormSection({
  title,
  subtitle,
  children,
  icon,
  columns = 1,
}: FormSectionProps): React.ReactElement {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
      }}
    >
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          {icon && <Box sx={{ fontSize: '1.5rem' }}>{icon}</Box>}
          <div>
            <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#1976d2' }}>{title}</Box>
            {subtitle && <Box sx={{ fontSize: '0.875rem', color: '#666' }}>{subtitle}</Box>}
          </div>
        </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
