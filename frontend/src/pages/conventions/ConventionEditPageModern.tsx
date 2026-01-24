import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Cancel as CancelIcon,
  Description,
  CalendarToday,
  Percent,
  Euro,
  Business,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
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
  baseCalcul: z.enum(['MONTANT_HT', 'MONTANT_TTC', 'MONTANT_MARCHE'], {
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

  useEffect(() => {
    if (id) {
      loadConvention()
    }
  }, [id])

  const loadConvention = async () => {
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
  }

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

            {/* Informations Générales */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                  Informations Générales
                </Typography>
                <Divider />
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: { xs: 2, md: 3 }
              }}>
                {/* Row 1: Type & Code */}
                <Box>
                  <Controller
                    name="typeConvention"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Type de convention"
                        error={!!errors.typeConvention}
                        helperText={errors.typeConvention?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Description color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="CADRE">CADRE</MenuItem>
                        <MenuItem value="SPECIFIQUE">SPECIFIQUE</MenuItem>
                      </TextField>
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Code"
                        error={!!errors.code}
                        helperText={errors.code?.message}
                        placeholder="CONV-XXX"
                      />
                    )}
                  />
                </Box>

                {/* Row 2: Numéro & Libellé */}
                <Box>
                  <Controller
                    name="numero"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Numéro"
                        error={!!errors.numero}
                        helperText={errors.numero?.message}
                        placeholder="XXX/YYYY"
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="libelle"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Libellé"
                        error={!!errors.libelle}
                        helperText={errors.libelle?.message}
                        placeholder="Convention de..."
                      />
                    )}
                  />
                </Box>

                {/* Row 3: Objet (full width) - Rich Text Editor */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                    gutterBottom
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Objet de la convention *
                  </Typography>
                  <Controller
                    name="objet"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Box
                          sx={{
                            '& .quill': {
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              border: errors.objet ? '1px solid' : '1px solid',
                              borderColor: errors.objet ? 'error.main' : 'divider',
                              transition: 'border-color 0.2s',
                              '&:hover': {
                                borderColor: errors.objet ? 'error.main' : 'text.primary',
                              },
                            },
                            '& .ql-toolbar': {
                              borderRadius: '4px 4px 0 0',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'grey.50',
                            },
                            '& .ql-container': {
                              borderRadius: '0 0 4px 4px',
                              minHeight: 120,
                              fontSize: '0.875rem',
                            },
                            '& .ql-editor': {
                              minHeight: 120,
                            },
                            '& .ql-editor.ql-blank::before': {
                              color: 'text.disabled',
                              fontStyle: 'normal',
                            },
                          }}
                        >
                          <ReactQuill
                            value={field.value}
                            onChange={field.onChange}
                            theme="snow"
                            placeholder="Décrivez l'objet de la convention..."
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline'],
                                [{ list: 'ordered' }, { list: 'bullet' }],
                                ['clean']
                              ]
                            }}
                          />
                        </Box>
                        {errors.objet && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.75, ml: 1.75, display: 'block' }}
                          >
                            {errors.objet.message}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Informations Financières */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                  Informations Financières
                </Typography>
                <Divider />
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: { xs: 2, md: 3 }
              }}>
                {/* Row 1: Montant & Base de Calcul */}
                <Box>
                  <Controller
                    name="montant"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Montant"
                        error={!!errors.montant}
                        helperText={errors.montant?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Euro color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                        }}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="baseCalcul"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Base de calcul"
                        error={!!errors.baseCalcul}
                        helperText={errors.baseCalcul?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
                        <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
                        <MenuItem value="MONTANT_MARCHE">Montant Marché</MenuItem>
                      </TextField>
                    )}
                  />
                </Box>

                {/* Row 2: Taux Commission & Taux TVA */}
                <Box>
                  <Controller
                    name="tauxCommission"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Taux de commission"
                        error={!!errors.tauxCommission}
                        helperText={errors.tauxCommission?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        inputProps={{ step: '0.01', min: 0, max: 100 }}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="tauxTva"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Taux TVA"
                        error={!!errors.tauxTva}
                        helperText={errors.tauxTva?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        inputProps={{ step: '0.01', min: 0, max: 100 }}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Dates */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                  Dates
                </Typography>
                <Divider />
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: { xs: 2, md: 3 }
              }}>
                <Box>
                  <Controller
                    name="dateSignature"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        fullWidth
                        type="date"
                        label="Date de signature"
                        error={!!errors.dateSignature}
                        helperText={errors.dateSignature?.message as string}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="dateDebut"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        fullWidth
                        type="date"
                        label="Date de début"
                        error={!!errors.dateDebut}
                        helperText={errors.dateDebut?.message as string}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="dateFin"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        fullWidth
                        type="date"
                        label="Date de fin (optionnel)"
                        error={!!errors.dateFin}
                        helperText={errors.dateFin?.message as string}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Paper>

          </Stack>
        </form>
      </Container>
    </AppLayout>
  )
}

export default ConventionEditPageModern
