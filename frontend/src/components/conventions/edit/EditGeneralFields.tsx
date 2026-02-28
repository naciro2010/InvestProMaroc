import { Box, TextField, MenuItem, Typography } from '@mui/material'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import RichTextEditor from '@/components/common/RichTextEditor'
import { getPlainTextLength } from '@/utils/textUtils'
import { getEnabledConventionTypes } from '@/lib/settings/conventionSettings'
import { useConventionConfiguration } from '@/hooks/useConventionConfiguration'
import { FieldGroup, Field } from '@/components/core'
import { colors, typography } from '@/lib/designSystem'
import { formatDateFR, type ConventionEditFormData } from './editTypes'

interface EditGeneralFieldsProps {
  control: Control<ConventionEditFormData>
  errors: FieldErrors<ConventionEditFormData>
  isEditing: boolean
  watchValues: ConventionEditFormData
  parentConventionCode?: string | null
}

const EditGeneralFields = ({
  control,
  errors,
  isEditing,
  watchValues,
  parentConventionCode,
}: EditGeneralFieldsProps) => {
  const { configuration: settings } = useConventionConfiguration()
  const typeOptions = getEnabledConventionTypes(settings)
  const currentType = watchValues.typeConvention || 'CADRE'
  const typeOptionsWithCurrent = typeOptions.find((o) => o.value === currentType)
    ? typeOptions
    : [...typeOptions, { value: currentType, label: currentType, enabled: true }]

  const typeLabel = typeOptionsWithCurrent.find((o) => o.value === currentType)?.label || currentType

  return (
    <>
      <FieldGroup title="Identification" columns={2}>
        <Field
          label="Code"
          value={watchValues.code}
          required
          isEditing={isEditing}
          help="Code interne unique de la convention. Genere automatiquement, modifiable avant soumission."
          editContent={
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder={settings.codeMaskPlaceholder}
                  inputProps={{ pattern: settings.codeMaskPattern }}
                  error={!!errors.code}
                  helperText={errors.code?.message || `Format : ${settings.codeMaskPlaceholder}`}
                />
              )}
            />
          }
        />
        <Field
          label="Numero officiel"
          value={watchValues.numero || '-'}
          isEditing={isEditing}
          help="Numero officiel du document (ex: CONV-2026-001). Doit etre unique dans le systeme."
          editContent={
            <Controller
              name="numero"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder={settings.numeroMaskPlaceholder}
                  inputProps={{ pattern: settings.numeroMaskPattern }}
                  helperText={`Format : ${settings.numeroMaskPlaceholder}`}
                />
              )}
            />
          }
        />
        <Field
          label="Type de convention"
          value={typeLabel}
          required
          isEditing={isEditing}
          help="CADRE: convention mere pouvant avoir des sous-conventions. NON_CADRE: convention autonome. SPECIFIQUE: sous-convention rattachee a un CADRE."
          provenance={parentConventionCode ? { source: parentConventionCode, isInherited: false } : undefined}
          editContent={
            <Controller
              name="typeConvention"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  fullWidth
                  error={!!errors.typeConvention}
                  helperText={errors.typeConvention?.message}
                >
                  {typeOptionsWithCurrent.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          }
        />
        <Field
          label="Date de signature"
          value={formatDateFR(watchValues.dateConvention)}
          required
          isEditing={isEditing}
          help="Date de signature officielle de la convention. Determine le point de depart administratif."
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
      </FieldGroup>

      <FieldGroup title="Description" columns={1}>
        <Field
          label="Libelle"
          required
          fullWidth
          isEditing={isEditing}
          help="Titre court de la convention (max 200 caracteres). Affiche dans les listes et les references."
          value={
            watchValues.libelle ? (
              <Box
                sx={{ '& p': { m: 0 }, '& *': { fontSize: typography.sizes.base, color: colors.textPrimary } }}
                dangerouslySetInnerHTML={{ __html: watchValues.libelle }}
              />
            ) : (
              '-'
            )
          }
          editContent={
            <Controller
              name="libelle"
              control={control}
              render={({ field }) => (
                <Box>
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Libelle de la convention..."
                    minHeight={120}
                    error={errors.libelle?.message}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: 'block', color: colors.textSecondary }}
                  >
                    {getPlainTextLength(field.value || '')} / 200 caracteres
                  </Typography>
                </Box>
              )}
            />
          }
        />
        <Field
          label="Objet"
          required
          fullWidth
          isEditing={isEditing}
          help="Description detaillee de l'objet de la convention. Inclut le perimetre, les objectifs et le cadre juridique."
          value={
            watchValues.objet ? (
              <Box
                sx={{ '& p': { m: 0 }, '& *': { fontSize: typography.sizes.base, color: colors.textPrimary } }}
                dangerouslySetInnerHTML={{ __html: watchValues.objet }}
              />
            ) : (
              '-'
            )
          }
          editContent={
            <Controller
              name="objet"
              control={control}
              render={({ field }) => (
                <Box>
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Decrivez l'objet de la convention en detail..."
                    minHeight={180}
                    error={errors.objet?.message}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: 'block', color: colors.textSecondary }}
                  >
                    {getPlainTextLength(field.value || '')} / 2000 caracteres
                  </Typography>
                </Box>
              )}
            />
          }
        />
      </FieldGroup>
    </>
  )
}

export default EditGeneralFields
