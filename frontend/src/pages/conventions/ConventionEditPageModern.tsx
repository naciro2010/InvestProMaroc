import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import {
  ConventionInfoSection,
  ConventionFinancesSection,
  ConventionDatesSection,
} from '../../components/conventions/edit'
import { conventionsAPI } from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

// Zod validation schema with cross-field validation
const conventionSchema = z.object({
  code: z.string()
    .min(1, 'Le code est requis')
    .regex(/^[A-Z0-9-]+$/, 'Le code doit contenir uniquement des majuscules, chiffres et tirets'),
  numero: z.string()
    .min(1, 'Le numéro est requis'),
  libelle: z.string()
    .min(3, 'Le libellé doit contenir au moins 3 caractères')
    .max(200, 'Le libellé ne peut pas dépasser 200 caractères'),
  objet: z.string()
    .min(10, 'L\'objet doit contenir au moins 10 caractères'),
  typeConvention: z.enum(['CADRE', 'SPECIFIQUE'], {
    errorMap: () => ({ message: 'Type de convention invalide' })
  }),
  tauxCommission: z.number()
    .min(0, 'Le taux de commission doit être positif')
    .max(100, 'Le taux de commission ne peut pas dépasser 100%'),
  baseCalcul: z.enum(['DECAISSEMENTS_HT', 'DECAISSEMENTS_TTC', 'MONTANT_HT', 'MONTANT_TTC', 'MONTANT_MARCHE'], {
    errorMap: () => ({ message: 'Base de calcul invalide' })
  }),
  montant: z.number()
    .min(0, 'Le montant doit être positif')
    .max(999999999, 'Le montant est trop élevé'),
  dateSignature: z.date({
    required_error: 'La date de signature est requise',
    invalid_type_error: 'Date de signature invalide',
  }),
  dateDebut: z.date({
    required_error: 'La date de début est requise',
    invalid_type_error: 'Date de début invalide',
  }),
  dateFin: z.date({
    invalid_type_error: 'Date de fin invalide',
  }).nullable(),
  tauxTva: z.number()
    .min(0, 'Le taux TVA doit être positif')
    .max(100, 'Le taux TVA ne peut pas dépasser 100%'),
}).refine((data) => {
  // Validation: dateDebut must be after or equal to dateSignature
  if (data.dateSignature && data.dateDebut) {
    return data.dateDebut >= data.dateSignature
  }
  return true
}, {
  message: 'La date de début doit être postérieure ou égale à la date de signature',
  path: ['dateDebut'],
}).refine((data) => {
  // Validation: dateFin must be after dateDebut if provided
  if (data.dateFin && data.dateDebut) {
    return data.dateFin > data.dateDebut
  }
  return true
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['dateFin'],
})

type ConventionFormData = z.infer<typeof conventionSchema>

interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  statut: string
  tauxCommission: number
  baseCalcul: string
  montant: number
  dateSignature: string
  dateDebut: string
  dateFin?: string
  tauxTva: number
}

const ConventionEditPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [convention, setConvention] = useState<Convention | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConventionFormData>({
    resolver: zodResolver(conventionSchema),
  })

  const loadConvention = useCallback(async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getById(Number(id))
      const data = response.data?.data || response.data
      setConvention(data)

      // Populate form with existing data
      reset({
        code: data.code,
        numero: data.numero,
        libelle: data.libelle,
        objet: data.objet,
        typeConvention: data.typeConvention,
        tauxCommission: data.tauxCommission,
        baseCalcul: data.baseCalcul,
        montant: data.montant,
        dateSignature: new Date(data.dateSignature),
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        tauxTva: data.tauxTva,
      })
    } catch (error) {
      showToast('Erreur lors du chargement de la convention', 'error')
      navigate('/conventions')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, showToast, reset])

  useEffect(() => {
    if (id) {
      loadConvention()
    }
  }, [id, loadConvention])

  const onSubmit = async (data: ConventionFormData) => {
    try {
      setSaving(true)

      const payload = {
        code: data.code,
        numero: data.numero,
        libelle: data.libelle,
        objet: data.objet,
        typeConvention: data.typeConvention,
        tauxCommission: data.tauxCommission,
        baseCalcul: data.baseCalcul,
        montant: data.montant,
        dateSignature: data.dateSignature.toISOString(),
        dateDebut: data.dateDebut.toISOString(),
        dateFin: data.dateFin ? data.dateFin.toISOString() : null,
        tauxTva: data.tauxTva,
      }

      await conventionsAPI.update(Number(id), payload)
      showToast('Convention modifiée avec succès', 'success')
      navigate(`/conventions/${id}`)
    } catch (error) {
      showToast('Erreur lors de la modification', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Voulez-vous abandonner les modifications ?')) {
        navigate(`/conventions/${id}`)
      }
    } else {
      navigate(`/conventions/${id}`)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    )
  }

  if (!convention) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">Convention non trouvée</Alert>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, minHeight: '100vh' }}>
        {/* Header with Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/conventions/${id}`)}
            sx={{ mb: 2, color: 'text.secondary' }}
          >
            Retour
          </Button>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 2
          }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Modifier la convention
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {convention.code} • {convention.libelle}
              </Typography>
            </Box>

            {/* Action Buttons - Sticky on desktop */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  minWidth: { sm: 120 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving || !isDirty}
                onClick={handleSubmit(onSubmit)}
                sx={{
                  minWidth: { sm: 120 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Stack>
          </Box>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={{ xs: 2, md: 3 }}>

            {/* Warning Alert */}
            {convention.statut !== 'BROUILLON' && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'warning.light',
                }}
              >
                <strong>Attention :</strong> Cette convention est en statut{' '}
                <strong>{convention.statut}</strong>. Les modifications peuvent nécessiter une
                nouvelle validation.
              </Alert>
            )}

            {/* Informations Générales - Micro-component */}
            <ConventionInfoSection control={control} errors={errors} />

            {/* Informations Financières - Micro-component */}
            <ConventionFinancesSection control={control} errors={errors} />

            {/* Dates - Micro-component */}
            <ConventionDatesSection control={control} errors={errors} />

          </Stack>
        </form>
      </Container>
    </AppLayout>
  )
}

export default ConventionEditPageModern
