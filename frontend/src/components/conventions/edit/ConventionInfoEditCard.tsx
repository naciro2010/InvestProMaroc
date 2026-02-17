import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Skeleton,
  Alert,
} from '@mui/material'
import { Save, Edit, Cancel as CancelIcon } from '@mui/icons-material'
import { api } from '../../../lib/api'
import { useToast } from '../../../contexts/ToastContext'
import { FormTextField, FormSelectField } from '../../form'
import RichTextEditor from '../../common/RichTextEditor'
import { getEnabledConventionTypes } from '../../../lib/settings/conventionSettings'
import { useConventionConfiguration } from '../../../hooks/useConventionConfiguration'
import { getPlainTextLength } from '../../../utils/textUtils'

// Schema validation
const infoSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  numero: z.string().min(1, 'Le numéro est requis'),
  libelle: z.string()
    .min(3, 'Minimum 3 caractères')
    .refine((value) => getPlainTextLength(value) <= 200, 'Maximum 200 caractères'),
  objet: z.string()
    .min(10, 'Minimum 10 caractères')
    .refine((value) => getPlainTextLength(value) <= 2000, 'Maximum 2000 caractères'),
  typeConvention: z.enum(['CADRE', 'NON_CADRE', 'SPECIFIQUE', 'AVENANT']),
})

type InfoFormData = z.infer<typeof infoSchema>

interface Props {
  conventionId: number
}

/**
 * Micro-composant: Edition des informations générales
 *
 * - Charge ses données via micro-endpoint: GET /conventions/{id}/basic
 * - Sauvegarde via micro-endpoint: PATCH /conventions/{id}/basic
 * - Gère son propre état (loading, saving, editing)
 * - ~150 lignes (micro-frontend)
 */
const ConventionInfoEditCard = ({ conventionId }: Props) => {
  const { showToast } = useToast()
  const { configuration: settings } = useConventionConfiguration()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
  })

  // Lazy loading via micro-endpoint
  useEffect(() => {
    loadData()
  }, [conventionId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Micro-endpoint: only basic info (~5 KB)
      const response = await api.get(`/conventions/${conventionId}/basic`)
      const data = response.data.data || response.data

      reset({
        code: data.code,
        numero: data.numero,
        libelle: data.libelle,
        objet: data.objet,
        typeConvention: data.typeConvention,
      })
    } catch (err) {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: InfoFormData) => {
    try {
      setSaving(true)
      // Micro-endpoint: only update basic info (preserve rich text HTML)
      await api.patch(`/conventions/${conventionId}/basic`, data)
      showToast('Informations mises à jour', 'success')
      setEditing(false)
      reset(data) // Reset form to mark as not dirty
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    loadData() // Reload original data
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📋 Informations Générales
        </Typography>
        {!editing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
            size="small"
          >
            Modifier
          </Button>
        )}
      </Box>

      <form onSubmit={handleSubmit(handleSave)}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormTextField
              name="code"
              control={control}
              label="Code"
              placeholder={settings.codeMaskPlaceholder}
              required
              disabled={!editing}
              helperText={`Format attendu : ${settings.codeMaskPlaceholder}`}
              inputProps={{ pattern: settings.codeMaskPattern }}
            />
            <FormTextField
              name="numero"
              control={control}
              label="Numéro"
              placeholder={settings.numeroMaskPlaceholder}
              required
              disabled={!editing}
              helperText={`Format attendu : ${settings.numeroMaskPlaceholder}`}
              inputProps={{ pattern: settings.numeroMaskPattern }}
            />
          </Stack>

          <Controller
            name="libelle"
            control={control}
            render={({ field }) => (
              <Box>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Libellé"
                  placeholder="Convention de financement..."
                  minHeight={140}
                  required
                  readOnly={!editing}
                  error={errors.libelle?.message as string | undefined}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {getPlainTextLength(field.value || '')} / 200 caractères
                </Typography>
              </Box>
            )}
          />

          <Controller
            name="objet"
            control={control}
            render={({ field }) => (
              <Box>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Objet"
                  placeholder="Description de la convention..."
                  minHeight={200}
                  required
                  readOnly={!editing}
                  error={errors.objet?.message as string | undefined}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {getPlainTextLength(field.value || '')} / 2000 caractères
                </Typography>
              </Box>
            )}
          />

          <FormSelectField
            name="typeConvention"
            control={control}
            label="Type de convention"
            options={(() => {
              const enabled = getEnabledConventionTypes(settings)
              const currentValue = watch('typeConvention') || 'CADRE'
              return enabled.find((option) => option.value === currentValue)
                ? enabled
                : [
                    ...enabled,
                    { value: currentValue, label: currentValue, enabled: true },
                  ]
            })().map((option) => ({ label: option.label, value: option.value }))}
            required
            disabled={!editing}
          />

          {editing && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                disabled={saving || !isDirty}
                color="primary"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          )}
        </Stack>
      </form>
    </Paper>
  )
}

export default ConventionInfoEditCard
