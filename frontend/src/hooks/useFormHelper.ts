import { useCallback } from 'react'
import { useForm, UseFormProps, UseFormReturn, FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'

/**
 * Custom hook for form handling with Zod validation
 * Provides type-safe form management with validation
 *
 * @template T - Form data type
 * @param schema - Zod validation schema
 * @param defaultValues - Initial form values
 * @param onSubmit - Submit handler
 * @param options - Additional form options
 * @returns Form methods and helpers
 *
 * @example
 * const { control, handleSubmit, errors, isSubmitting } = useFormHelper(
 *   createConventionSchema,
 *   { code: 'CONV-001', designation: '' },
 *   (data) => console.log(data)
 * )
 */
export function useFormHelper<T extends FieldValues>(
  schema: ZodSchema,
  defaultValues: DefaultValues<T>,
  onSubmit: (data: T) => void | Promise<void>,
  options?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>
) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    ...options,
  })

  const isSubmitting = form.formState.isSubmitting
  const hasErrors = Object.keys(form.formState.errors).length > 0

  const getFieldError = useCallback(
    (fieldName: keyof T): string | undefined => {
      const error = form.formState.errors[fieldName]
      return error?.message?.toString()
    },
    [form.formState.errors]
  )

  const handleFormSubmit: SubmitHandler<T> = (data) => {
    return onSubmit(data)
  }

  const wrappedHandleSubmit = form.handleSubmit(handleFormSubmit, (errors) => {
    console.debug('Form validation errors:', errors)
  })

  return {
    ...form,
    isSubmitting,
    hasErrors,
    getFieldError,
    handleSubmit: wrappedHandleSubmit,
  }
}

/**
 * Type helper to extract form data type from schema
 * @example
 * type ConventionData = SchemaToType<typeof createConventionSchema>
 */
export type SchemaToType<T> = T extends ZodSchema ? ReturnType<T['parse']> : never
