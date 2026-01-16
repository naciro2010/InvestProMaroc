import { useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Typography, Stack, InputAdornment, CircularProgress } from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { AxiosError } from 'axios'
import { useFormHelper } from '../../hooks/useFormHelper'
import { createConventionSchema, type CreateConventionFormData } from '../../schemas/forms'
import {
  FormTextField,
  FormNumberField,
  FormDateField,
  FormSelectField,
  FormErrors,
} from '../../components/form'
import { conventionsAPI } from '../../lib/api'
import AppLayout from '../../components/layout/AppLayout'
import RichTextEditor from '../../components/ui/RichTextEditor'

const SimpleConventionForm = () => {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useFormHelper(
    createConventionSchema,
    {
      code: '',
      designation: '',
      objet: '',
      type: 'CADRE',
      tauxCommission: 2.5,
      montant: 0,
      dateDebut: new Date(),
      dateFin: undefined,
      description: '',
      baseCalcul: 'HT',
      tauxTva: 20,
    },
    async (data: CreateConventionFormData) => {
      try {
        await conventionsAPI.create(data)
        navigate('/conventions')
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data?.message || 'Erreur lors de la création')
        }
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Erreur inconnue lors de la création')
      }
    }
  )

  const objetValue = watch('objet')

  const handleObjetChange = (content: string) => {
    setValue('objet', content)
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, #ffffff)', py: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header Section with Gradient Background */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              p: 4,
              mb: 0,
            }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/conventions')}
              sx={{
                color: 'white',
                mb: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Retour
            </Button>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Nouvelle Convention
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Créez une nouvelle convention avec les détails complets et descriptif formaté
            </Typography>
          </Box>

          {Object.keys(errors).length > 0 && (
            <FormErrors errors={errors} />
          )}

          <Paper
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: '0 0 16px 16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <form onSubmit={handleFormSubmit}>
              <Stack spacing={4}>
                {/* Section 1: Informations Générales */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                    📋 Informations Générales
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <FormTextField
                        name="code"
                        control={control}
                        label="Code"
                        placeholder="CONV-2026-001"
                        required
                      />
                      <FormTextField
                        name="designation"
                        control={control}
                        label="Désignation"
                        placeholder="Convention de financement..."
                        required
                      />
                    </Stack>
                  </Stack>
                </Box>

                {/* Section 2: Description */}
                <Box sx={{ background: '#f0f9ff', borderLeft: '4px solid #2563eb', p: 3, borderRadius: '8px' }}>
                  <RichTextEditor
                    label="📝 Objet de la Convention"
                    value={objetValue || ''}
                    onChange={handleObjetChange}
                    placeholder="Description détaillée de la convention avec options de formatage..."
                    minHeight="250px"
                  />
                </Box>

                {/* Section 3: Type et Budget */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                    💰 Type et Budget
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <FormSelectField
                        name="type"
                        control={control}
                        label="Type"
                        options={[
                          { label: 'Convention Cadre', value: 'CADRE' },
                          { label: 'Convention Spécifique', value: 'SPECIFIQUE' },
                        ]}
                        required
                      />
                      <FormNumberField
                        name="montant"
                        control={control}
                        label="Montant (MAD)"
                        placeholder="1000000.00"
                        min={0}
                        required
                      />
                    </Stack>
                  </Stack>
                </Box>

                {/* Section 4: Dates */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                    📅 Dates
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <FormDateField
                        name="dateDebut"
                        control={control}
                        label="Date Début"
                        required
                      />
                      <FormDateField
                        name="dateFin"
                        control={control}
                        label="Date Fin (optionnel)"
                      />
                    </Stack>
                  </Stack>
                </Box>

                {/* Section 5: Commission */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
                    ⚙️ Configuration Commission
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <FormNumberField
                        name="tauxCommission"
                        control={control}
                        label="Taux Commission (%)"
                        min={0}
                        max={100}
                        step={0.01}
                        required
                      />
                      <FormSelectField
                        name="baseCalcul"
                        control={control}
                        label="Base de Calcul"
                        options={[
                          { label: 'HT', value: 'HT' },
                          { label: 'TTC', value: 'TTC' },
                        ]}
                        required
                      />
                    </Stack>
                    <FormNumberField
                      name="tauxTva"
                      control={control}
                      label="Taux TVA (%)"
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/conventions')}
                    disabled={isSubmitting}
                    sx={{
                      borderColor: '#d1d5db',
                      color: '#4b5563',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                        borderColor: '#9ca3af',
                      },
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
                      },
                      '&:disabled': {
                        background: '#d1d5db',
                      },
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    {isSubmitting && <CircularProgress size={20} sx={{ color: 'white' }} />}
                    {isSubmitting ? 'Enregistrement...' : '✓ Enregistrer'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default SimpleConventionForm
