import React from 'react'
import {
  Controller,
  FieldValues,
  FieldPath,
  Control,
} from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'

/**
 * FormRichTextField - Design system form component for rich text fields
 *
 * Integrates RichTextEditor with react-hook-form for consistent rich text editing
 * across all forms. Use this for any description, objet, libelle, observations,
 * or remarks field that requires formatting.
 *
 * Usage:
 *   <FormRichTextField name="objet" control={control} label="Objet" />
 */

interface FormRichTextFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  minHeight?: number
  error?: string
}

export function FormRichTextField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required = false,
  disabled = false,
  minHeight = 150,
  error,
}: FormRichTextFieldProps<T>): React.ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <RichTextEditor
          value={field.value || ''}
          onChange={field.onChange}
          label={label}
          placeholder={placeholder}
          minHeight={minHeight}
          required={required}
          readOnly={disabled}
          error={fieldState.error?.message || error}
        />
      )}
    />
  )
}
