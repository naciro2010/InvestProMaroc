import { useEffect, useCallback } from 'react'
import { TextField } from '@mui/material'
import { Controller, type Control, type FieldErrors, type UseFormSetValue } from 'react-hook-form'
import DecimalInput from '@/components/ui/DecimalInput'
import { FieldGroup, Field } from '@/components/core'
import { addMonths, calculateDurationMonths, formatDateInput } from '@/utils/dateUtils'
import { formatDateFR, type ConventionEditFormData } from './editTypes'

interface EditDatesFieldsProps {
  control: Control<ConventionEditFormData>
  errors: FieldErrors<ConventionEditFormData>
  isEditing: boolean
  watchValues: ConventionEditFormData
  setValue: UseFormSetValue<ConventionEditFormData>
  autoDateFin: boolean
  onAutoDateFinChange: (value: boolean) => void
}

const EditDatesFields = ({
  control,
  errors,
  isEditing,
  watchValues,
  setValue,
  autoDateFin,
  onAutoDateFinChange,
}: EditDatesFieldsProps) => {
  // Auto-calculate dateFin when dureeMois or dateDebut change
  useEffect(() => {
    if (!isEditing || !autoDateFin || !watchValues.dateDebut) return
    const computed = formatDateInput(addMonths(new Date(watchValues.dateDebut), watchValues.dureeMois || 0))
    if (computed && computed !== watchValues.dateFin) {
      setValue('dateFin', computed, { shouldDirty: true })
    }
  }, [isEditing, autoDateFin, watchValues.dateDebut, watchValues.dureeMois, watchValues.dateFin, setValue])

  // Recalculate dureeMois when dateFin is manually changed
  useEffect(() => {
    if (!isEditing || autoDateFin || !watchValues.dateDebut || !watchValues.dateFin) return
    const months = calculateDurationMonths(new Date(watchValues.dateDebut), new Date(watchValues.dateFin))
    if (months !== watchValues.dureeMois) {
      setValue('dureeMois', months, { shouldDirty: true })
    }
  }, [isEditing, autoDateFin, watchValues.dateDebut, watchValues.dateFin, watchValues.dureeMois, setValue])

  const handleDateFinChange = useCallback(
    (onChange: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onAutoDateFinChange(false)
      onChange(e.target.value)
    },
    [onAutoDateFinChange]
  )

  const handleDureeMoisChange = useCallback(
    (onChange: (val: number) => void) => (val: number) => {
      onAutoDateFinChange(true)
      onChange(val)
    },
    [onAutoDateFinChange]
  )

  return (
    <FieldGroup title="Dates & Duree" columns={2}>
      <Field
        label="Date de Signature"
        value={formatDateFR(watchValues.dateConvention)}
        required
        isEditing={isEditing}
        editContent={
          <Controller
            name="dateConvention"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateConvention}
                helperText={errors.dateConvention?.message}
              />
            )}
          />
        }
      />
      <Field
        label="Date de Debut"
        value={formatDateFR(watchValues.dateDebut)}
        required
        isEditing={isEditing}
        editContent={
          <Controller
            name="dateDebut"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateDebut}
                helperText={errors.dateDebut?.message}
              />
            )}
          />
        }
      />
      <Field
        label="Date de Fin"
        value={formatDateFR(watchValues.dateFin)}
        isEditing={isEditing}
        editContent={
          <Controller
            name="dateFin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateFin}
                helperText={
                  (errors.dateFin?.message as string) ||
                  (autoDateFin ? 'Calculee automatiquement depuis la duree' : '')
                }
                onChange={handleDateFinChange(field.onChange)}
              />
            )}
          />
        }
      />
      <Field
        label="Duree (mois)"
        value={`${watchValues.dureeMois} mois`}
        isEditing={isEditing}
        editContent={
          <Controller
            name="dureeMois"
            control={control}
            render={({ field }) => (
              <DecimalInput
                value={field.value ?? 0}
                onChange={handleDureeMoisChange(field.onChange)}
                fullWidth
                size="small"
                decimalPlaces={0}
                min={0}
                error={!!errors.dureeMois}
                helperText={
                  (errors.dureeMois?.message as string) ||
                  (autoDateFin
                    ? 'La date de fin est calculee automatiquement.'
                    : 'Modifiez la duree pour recalculer la date de fin.')
                }
              />
            )}
          />
        }
      />
    </FieldGroup>
  )
}

export default EditDatesFields
