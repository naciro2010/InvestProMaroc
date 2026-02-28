import { Box, TextField, MenuItem, Typography, Divider } from '@mui/material'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import DecimalInput from '@/components/ui/DecimalInput'
import { FieldGroup, Field } from '@/components/core'
import { colors, typography } from '@/lib/designSystem'
import { formatCurrencyMAD, type ConventionEditFormData } from './editTypes'

interface EditBudgetFieldsProps {
  control: Control<ConventionEditFormData>
  errors: FieldErrors<ConventionEditFormData>
  isEditing: boolean
  watchValues: ConventionEditFormData
  setValue: (name: keyof ConventionEditFormData, value: number | string) => void
  parentConventionCode?: string | null
  heriteParametres?: boolean
}

const BASE_CALCUL_OPTIONS = [
  { label: 'Decaissements HT', value: 'DECAISSEMENTS_HT' },
  { label: 'Decaissements TTC', value: 'DECAISSEMENTS_TTC' },
  { label: 'Montant HT', value: 'MONTANT_HT' },
  { label: 'Montant TTC', value: 'MONTANT_TTC' },
  { label: 'Montant Marche', value: 'MONTANT_MARCHE' },
]

const EditBudgetFields = ({
  control,
  errors,
  isEditing,
  watchValues,
  setValue,
  parentConventionCode,
  heriteParametres,
}: EditBudgetFieldsProps) => {
  const baseCalculLabel =
    BASE_CALCUL_OPTIONS.find((o) => o.value === watchValues.baseCalcul)?.label ||
    watchValues.baseCalcul

  const commissionHT = (watchValues.budget * watchValues.tauxCommission) / 100
  const commissionTTC = commissionHT * (1 + watchValues.tauxTva / 100)

  // Build provenance for inherited fields
  const inheritedProvenance = heriteParametres && parentConventionCode
    ? { source: parentConventionCode, isInherited: true }
    : undefined

  return (
    <>
      <FieldGroup title="Budget" columns={2}>
        <Field
          label="Budget Global (MAD)"
          value={formatCurrencyMAD(watchValues.budget)}
          isMoney
          required
          isEditing={isEditing}
          help="Budget total de la convention en MAD. Sert de base au calcul de la commission si le mode est global."
          editContent={
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <DecimalInput
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val)
                    setValue('budget', val)
                  }}
                  fullWidth
                  size="small"
                  decimalPlaces={2}
                  min={0}
                  error={!!errors.budget}
                  helperText={errors.budget?.message}
                />
              )}
            />
          }
        />
        <Field
          label="Taux TVA Lignes (%)"
          value={`${watchValues.tauxTvaLignes}%`}
          isEditing={isEditing}
          help="Taux de TVA applique automatiquement a toutes les lignes de budget de la convention."
          editContent={
            <Controller
              name="tauxTvaLignes"
              control={control}
              render={({ field }) => (
                <DecimalInput
                  value={field.value}
                  onChange={field.onChange}
                  fullWidth
                  size="small"
                  decimalPlaces={2}
                  min={0}
                  max={100}
                  error={!!errors.tauxTvaLignes}
                  helperText={errors.tauxTvaLignes?.message || 'Applique a toutes les lignes'}
                />
              )}
            />
          }
        />
      </FieldGroup>

      <FieldGroup title="Configuration Commission" columns={2}>
        <Field
          label="Taux de Commission (%)"
          value={`${watchValues.tauxCommission}%`}
          required
          isEditing={isEditing}
          help="Pourcentage applique sur la base de calcul pour determiner le montant de la commission. Ex: 2.5% du montant des decaissements."
          provenance={inheritedProvenance}
          editContent={
            <Controller
              name="tauxCommission"
              control={control}
              render={({ field }) => (
                <DecimalInput
                  value={field.value}
                  onChange={field.onChange}
                  fullWidth
                  size="small"
                  decimalPlaces={2}
                  min={0}
                  max={100}
                  error={!!errors.tauxCommission}
                  helperText={errors.tauxCommission?.message}
                />
              )}
            />
          }
        />
        <Field
          label="Base de Calcul"
          value={baseCalculLabel}
          required
          isEditing={isEditing}
          help="Determine sur quoi le taux de commission est applique. DECAISSEMENTS_TTC: sur les montants TTC. DECAISSEMENTS_HT: hors taxes."
          provenance={inheritedProvenance}
          editContent={
            <Controller
              name="baseCalcul"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  fullWidth
                  error={!!errors.baseCalcul}
                  helperText={errors.baseCalcul?.message}
                >
                  {BASE_CALCUL_OPTIONS.map((option) => (
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
          label="Taux TVA Commission (%)"
          value={`${watchValues.tauxTva}%`}
          isEditing={isEditing}
          help="Taux de TVA applique sur la commission elle-meme (pas sur les lignes budgetaires). Generalement 20% au Maroc."
          provenance={inheritedProvenance}
          editContent={
            <Controller
              name="tauxTva"
              control={control}
              render={({ field }) => (
                <DecimalInput
                  value={field.value}
                  onChange={field.onChange}
                  fullWidth
                  size="small"
                  decimalPlaces={2}
                  min={0}
                  max={100}
                  error={!!errors.tauxTva}
                  helperText={errors.tauxTva?.message}
                />
              )}
            />
          }
        />
      </FieldGroup>

      {/* Commission Summary Card */}
      <Box
        sx={{
          mt: 2, p: 2,
          bgcolor: colors.primary[25],
          border: `1px solid ${colors.primary[100]}`,
          borderRadius: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            color: colors.primary[700],
            mb: 1.5,
          }}
        >
          Estimation Commission
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor: colors.primary[100] }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
              Commission HT
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.info[600], mt: 0.25 }}>
              {formatCurrencyMAD(commissionHT)}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
              TVA ({watchValues.tauxTva}%)
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, mt: 0.25 }}>
              {formatCurrencyMAD(commissionTTC - commissionHT)}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
              Commission TTC
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.success[600], mt: 0.25 }}>
              {formatCurrencyMAD(commissionTTC)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default EditBudgetFields
