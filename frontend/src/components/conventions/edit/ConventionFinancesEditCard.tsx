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
import { FormNumberField, FormSelectField } from '../../form'

// Schema validation
const financesSchema = z.object({
  tauxCommission: z.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%'),
  baseCalcul: z.enum(['DECAISSEMENTS_HT', 'DECAISSEMENTS_TTC', 'MONTANT_HT', 'MONTANT_TTC', 'MONTANT_MARCHE']),
  montant: z.number()
    .min(0, 'Doit être positif')
    .max(999999999, 'Montant trop élevé'),
  tauxTva: z.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%'),
})

type FinancesFormData = z.infer<typeof financesSchema>

interface Props {
  conventionId: number
}

/**
 * Micro-composant: Edition des paramètres financiers
 *
 * - Charge ses données via micro-endpoint: GET /conventions/{id}/finances
 * - Sauvegarde via micro-endpoint: PATCH /conventions/{id}/finances
 * - Gère son propre état (loading, saving, editing)
 * - ~140 lignes (micro-frontend)
 */
const ConventionFinancesEditCard = ({ conventionId }: Props) => {
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
  } = useForm<FinancesFormData>({
    resolver: zodResolver(financesSchema),
  })

  // Lazy loading via micro-endpoint
  useEffect(() => {
    loadData()
  }, [conventionId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Micro-endpoint: only finances info (~3 KB)
      const response = await api.get(`/conventions/${conventionId}/finances`)
      const data = response.data.data || response.data

      reset({
        tauxCommission: data.tauxCommission,
        baseCalcul: data.baseCalcul,
        montant: data.budget || data.montant,
        tauxTva: data.tauxTva,
      })
    } catch (err) {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: FinancesFormData) => {
    try {
      setSaving(true)
      // Map montant → budget for backend
      const payload = {
        ...data,
        budget: data.montant,
      }
      delete (payload as { montant?: number }).montant

      // Micro-endpoint: only update finances
      await api.patch(`/conventions/${conventionId}/finances`, payload)
      showToast('Paramètres financiers mis à jour', 'success')
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
          💰 Paramètres Financiers
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
            <FormNumberField
              name="tauxCommission"
              control={control}
              label="Taux Commission (%)"
              min={0}
              max={100}
              step={0.01}
              required
              disabled={!editing}
            />
            <FormSelectField
              name="baseCalcul"
              control={control}
              label="Base de Calcul"
              options={[
                { label: 'Décaissements HT', value: 'DECAISSEMENTS_HT' },
                { label: 'Décaissements TTC', value: 'DECAISSEMENTS_TTC' },
                { label: 'Montant HT', value: 'MONTANT_HT' },
                { label: 'Montant TTC', value: 'MONTANT_TTC' },
                { label: 'Montant Marché', value: 'MONTANT_MARCHE' },
              ]}
              required
              disabled={!editing}
            />
          </Stack>

          <FormNumberField
            name="montant"
            control={control}
            label="Montant (MAD)"
            min={0}
            required
            disabled={!editing}
          />

          <FormNumberField
            name="tauxTva"
            control={control}
            label="Taux TVA (%)"
            min={0}
            max={100}
            step={0.01}
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

export default ConventionFinancesEditCard
