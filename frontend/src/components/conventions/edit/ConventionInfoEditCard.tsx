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
import { FormTextField, FormSelectField } from '../../form'

// Schema validation
const infoSchema = z.object({
  code: z.string()
    .min(1, 'Le code est requis')
    .regex(/^[A-Z0-9-]+$/, 'Majuscules, chiffres et tirets uniquement'),
  numero: z.string().min(1, 'Le numéro est requis'),
  libelle: z.string()
    .min(3, 'Minimum 3 caractères')
    .max(200, 'Maximum 200 caractères'),
  objet: z.string().min(10, 'Minimum 10 caractères'),
  typeConvention: z.enum(['CADRE', 'SPECIFIQUE']),
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
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
      // Micro-endpoint: only update basic info
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
              placeholder="CONV-2026-001"
              required
              disabled={!editing}
            />
            <FormTextField
              name="numero"
              control={control}
              label="Numéro"
              placeholder="001/2026"
              required
              disabled={!editing}
            />
          </Stack>

          <FormTextField
            name="libelle"
            control={control}
            label="Libellé"
            placeholder="Convention de financement..."
            required
            disabled={!editing}
          />

          <FormTextField
            name="objet"
            control={control}
            label="Objet"
            placeholder="Description de la convention..."
            multiline
            rows={4}
            required
            disabled={!editing}
          />

          <FormSelectField
            name="typeConvention"
            control={control}
            label="Type de convention"
            options={[
              { label: 'Convention Cadre', value: 'CADRE' },
              { label: 'Convention Spécifique', value: 'SPECIFIQUE' },
            ]}
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

export default ConventionInfoEditCard
