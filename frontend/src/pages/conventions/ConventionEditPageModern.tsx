import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

// Zod validation schema
const conventionSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  numero: z.string().min(1, 'Le numéro est requis'),
  libelle: z.string().min(3, 'Le libellé doit contenir au moins 3 caractères'),
  objet: z.string().min(10, 'L\'objet doit contenir au moins 10 caractères'),
  typeConvention: z.enum(['CADRE', 'SPECIFIQUE']),
  tauxCommission: z.number().min(0).max(100, 'Le taux doit être entre 0 et 100'),
  baseCalcul: z.enum(['MONTANT_HT', 'MONTANT_TTC', 'MONTANT_MARCHE']),
  montant: z.number().min(0, 'Le montant doit être positif'),
  dateSignature: z.date(),
  dateDebut: z.date(),
  dateFin: z.date().nullable(),
  tauxTva: z.number().min(0).max(100),
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
      <Container maxWidth="xl" sx={{ py: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/conventions/${id}`)}
          sx={{ mb: 2 }}
        >
          Retour
        </Button>

        <PageHeader
          title={`Modifier la convention ${convention.code}`}
          subtitle={convention.libelle}
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Action Buttons (top) */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
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
                  startIcon={<Save />}
                  disabled={saving || !isDirty}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Stack>
            </Paper>

            {/* Warning Alert */}
            {convention.statut !== 'BROUILLON' && (
              <Alert severity="warning">
                <strong>Attention :</strong> Cette convention est en statut{' '}
                <strong>{convention.statut}</strong>. Les modifications peuvent nécessiter une
                nouvelle validation.
              </Alert>
            )}

            {/* Informations Générales - Same layout as detail page */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Informations Générales
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
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

                {/* Row 3: Objet (full width) */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Controller
                    name="objet"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Objet de la convention"
                        error={!!errors.objet}
                        helperText={errors.objet?.message}
                        placeholder="Décrivez l'objet de la convention..."
                      />
                    )}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Informations Financières - Same layout */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Informations Financières
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
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

            {/* Dates - Same layout */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Dates
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
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

            {/* Action Buttons (bottom) */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
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
                  startIcon={<Save />}
                  disabled={saving || !isDirty}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </form>
      </Container>
    </AppLayout>
  )
}

export default ConventionEditPageModern
