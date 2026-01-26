import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { FormDateField } from '../../form'

// Schema validation avec cross-field validation
const datesSchema = z.object({
  dateSignature: z.date({
    required_error: 'Date de signature requise',
    invalid_type_error: 'Date invalide',
  }),
  dateDebut: z.date({
    required_error: 'Date de début requise',
    invalid_type_error: 'Date invalide',
  }),
  dateFin: z.date({
    invalid_type_error: 'Date invalide',
  }).nullable(),
}).refine((data) => {
  if (data.dateSignature && data.dateDebut) {
    return data.dateDebut >= data.dateSignature
  }
  return true
}, {
  message: 'La date de début doit être ≥ date de signature',
  path: ['dateDebut'],
}).refine((data) => {
  if (data.dateFin && data.dateDebut) {
    return data.dateFin > data.dateDebut
  }
  return true
}, {
  message: 'La date de fin doit être > date de début',
  path: ['dateFin'],
})

type DatesFormData = z.infer<typeof datesSchema>

interface Props {
  conventionId: number
}

/**
 * Micro-composant: Edition des dates
 *
 * - Charge ses données via micro-endpoint: GET /conventions/{id}/dates
 * - Sauvegarde via micro-endpoint: PATCH /conventions/{id}/dates
 * - Gère son propre état (loading, saving, editing)
 * - ~130 lignes (micro-frontend)
 */
const ConventionDatesEditCard = ({ conventionId }: Props) => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DatesFormData>({
    resolver: zodResolver(datesSchema),
  })

  // Lazy loading via micro-endpoint
  useEffect(() => {
    loadData()
  }, [conventionId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Micro-endpoint: only dates info (~2 KB)
      const response = await api.get(`/conventions/${conventionId}/dates`)
      const data = response.data.data || response.data

      reset({
        dateSignature: new Date(data.dateConvention || data.dateSignature),
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
      })
    } catch (err) {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: DatesFormData) => {
    try {
      setSaving(true)
      // Map to backend field names
      const payload = {
        dateConvention: data.dateSignature.toISOString(),
        dateDebut: data.dateDebut.toISOString(),
        dateFin: data.dateFin ? data.dateFin.toISOString() : null,
      }

      // Micro-endpoint: only update dates
      await api.patch(`/conventions/${conventionId}/dates`, payload)
      showToast('Dates mises à jour', 'success')
      setEditing(false)
      reset(data)
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    loadData()
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} />
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
          📅 Dates
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
          <FormDateField
            name="dateSignature"
            control={control}
            label="Date de Signature"
            required
            disabled={!editing}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormDateField
              name="dateDebut"
              control={control}
              label="Date de Début"
              required
              disabled={!editing}
            />
            <FormDateField
              name="dateFin"
              control={control}
              label="Date de Fin (optionnel)"
              disabled={!editing}
            />
          </Stack>

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
                sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
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

export default ConventionDatesEditCard
