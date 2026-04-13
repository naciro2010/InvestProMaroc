import { useState, useCallback, useRef } from 'react'
import { type ZodSchema, type ZodError } from 'zod'

type FieldErrors = Record<string, string>

export function useRealtimeValidation<T extends Record<string, unknown>>(schema: ZodSchema<T>) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const validateField = useCallback(
    (fieldName: string, value: unknown, formData: Partial<T>) => {
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName])
      }

      debounceTimers.current[fieldName] = setTimeout(() => {
        try {
          schema.parse({ ...formData, [fieldName]: value })
          setFieldErrors((prev) => {
            const next = { ...prev }
            delete next[fieldName]
            return next
          })
        } catch (error) {
          const zodError = error as ZodError
          const fieldIssue = zodError.issues.find(
            (issue) => issue.path[0] === fieldName
          )
          if (fieldIssue) {
            setFieldErrors((prev) => ({
              ...prev,
              [fieldName]: fieldIssue.message,
            }))
          } else {
            setFieldErrors((prev) => {
              const next = { ...prev }
              delete next[fieldName]
              return next
            })
          }
        }
      }, 300)
    },
    [schema]
  )

  const markTouched = useCallback((fieldName: string) => {
    setTouched((prev) => new Set(prev).add(fieldName))
  }, [])

  const validateAll = useCallback(
    (formData: Partial<T>): boolean => {
      try {
        schema.parse(formData)
        setFieldErrors({})
        return true
      } catch (error) {
        const zodError = error as ZodError
        const errors: FieldErrors = {}
        zodError.issues.forEach((issue) => {
          const field = issue.path[0]?.toString()
          if (field && !errors[field]) {
            errors[field] = issue.message
          }
        })
        setFieldErrors(errors)
        setTouched(new Set(Object.keys(errors)))
        return false
      }
    },
    [schema]
  )

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      if (!touched.has(fieldName)) return undefined
      return fieldErrors[fieldName]
    },
    [fieldErrors, touched]
  )

  const hasErrors = Object.keys(fieldErrors).length > 0
  const errorCount = Object.keys(fieldErrors).length

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setTouched(new Set())
  }, [])

  return {
    fieldErrors,
    validateField,
    validateAll,
    getFieldError,
    markTouched,
    hasErrors,
    errorCount,
    clearErrors,
  }
}
