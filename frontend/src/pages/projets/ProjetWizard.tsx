import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { projetsAPI } from '../../lib/api'

const steps = ['Informations générales', 'Budget & Planning', 'Pièces jointes & Confirmation']

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface ProjetFormData {
  code: string
  designation: string
  description: string
  descriptionRich: string
  budgetTotal: number
  dateDebut: string
  dateFin: string
  dureeMois: number
  statut: 'EN_PREPARATION' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU' | 'ANNULE'
  pourcentageAvancement: number
  files: UploadedFile[]
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

const ProjetWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState<ProjetFormData>({
    code: '',
    designation: '',
    description: '',
    descriptionRich: '',
    budgetTotal: 0,
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    dureeMois: 12,
    statut: 'EN_PREPARATION',
    pourcentageAvancement: 0,
    files: [],
  })

  // React Query mutation pour la création
  const createMutation = useMutation({
    mutationFn: async (data: ProjetFormData) => {
      const payload = {
        code: data.code,
        designation: data.designation,
        description: data.description,
        descriptionRich: data.descriptionRich,
        budgetTotal: data.budgetTotal,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin || undefined,
        dureeMois: data.dureeMois,
        statut: data.statut,
        pourcentageAvancement: data.pourcentageAvancement,
      }
      return await projetsAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/projets')
    },
  })

  const handleChange = (field: keyof ProjetFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'budgetTotal' || field === 'dureeMois' || field === 'pourcentageAvancement'
        ? parseFloat(value) || 0
        : value
    })
  }

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      createMutation.mutate(formData)
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          formData.code &&
          formData.designation &&
          formData.descriptionRich
        )
      case 1:
        return formData.budgetTotal > 0 && formData.dureeMois > 0
      case 2:
        return true
      default:
        return false
    }
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const apiError = error as unknown as ApiErrorResponse
      return apiError.response?.data?.message || 'Erreur lors de la création du projet'
    }
    return 'Erreur lors de la création du projet'
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Informations de base
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Code"
                required
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="PRJ-001"
              />

              <TextField
                fullWidth
                select
                label="Statut"
                required
                value={formData.statut}
                onChange={handleChange('statut')}
              >
                <MenuItem value="EN_PREPARATION">En préparation</MenuItem>
                <MenuItem value="EN_COURS">En cours</MenuItem>
                <MenuItem value="TERMINE">Terminé</MenuItem>
                <MenuItem value="SUSPENDU">Suspendu</MenuItem>
                <MenuItem value="ANNULE">Annulé</MenuItem>
              </TextField>
            </Box>

            <TextField
              fullWidth
              label="Désignation"
              required
              value={formData.designation}
              onChange={handleChange('designation')}
              placeholder="Nom du projet..."
            />

            <RichTextEditor
              label="Description du projet"
              value={formData.descriptionRich}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  descriptionRich: value,
                  description: value.replace(/<[^>]*>/g, '').substring(0, 500),
                })
              }}
              placeholder="Décrivez le projet en détail..."
              required
              minHeight={200}
            />
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Budget et planning
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <DecimalInput
                fullWidth
                label="Budget total (DH)"
                required
                value={formData.budgetTotal}
                onChange={(value) => setFormData({ ...formData, budgetTotal: value })}
                min={0}
                decimalPlaces={2}
              />

              <DecimalInput
                fullWidth
                label="Durée (mois)"
                required
                value={formData.dureeMois}
                onChange={(value) => setFormData({ ...formData, dureeMois: value })}
                min={1}
                decimalPlaces={0}
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
              Dates
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                required
                value={formData.dateDebut}
                onChange={handleChange('dateDebut')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date de fin prévue"
                type="date"
                value={formData.dateFin}
                onChange={handleChange('dateFin')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <DecimalInput
              fullWidth
              label="Avancement (%)"
              value={formData.pourcentageAvancement}
              onChange={(value) => setFormData({ ...formData, pourcentageAvancement: value })}
              min={0}
              max={100}
              decimalPlaces={0}
              helperText="Pourcentage d'avancement actuel du projet"
            />
          </Box>
        )

      case 2:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Pièces jointes
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <FileUploadZone
              files={formData.files}
              onFilesChange={(files) => setFormData({ ...formData, files })}
              maxFiles={10}
              maxSizeMB={10}
              label="Documents du projet"
            />

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
                Récapitulatif
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Code
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.code}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                    <Typography variant="body1">
                      {formData.statut.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Désignation
                  </Typography>
                  <Typography variant="body1">{formData.designation}</Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Budget total
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.budgetTotal)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Durée
                    </Typography>
                    <Typography variant="body1">
                      {formData.dureeMois} mois
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date de début
                    </Typography>
                    <Typography variant="body1">
                      {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>

                  {formData.dateFin && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Date de fin prévue
                      </Typography>
                      <Typography variant="body1">
                        {new Date(formData.dateFin).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avancement
                    </Typography>
                    <Typography variant="body1">
                      {formData.pourcentageAvancement}%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pièces jointes
                  </Typography>
                  <Typography variant="body1">
                    {formData.files.length} fichier(s)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {createMutation.error && (
              <Alert severity="error">
                {getErrorMessage(createMutation.error)}
              </Alert>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <AppLayout>
      <WizardView
        breadcrumbs={[{ label: 'Projets', path: '/projets' }, { label: 'Nouveau' }]}
        steps={steps.map(label => ({ label }))}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate('/projets')}
        isNextDisabled={!isStepValid()}
        isSubmitting={createMutation.isPending}
        submitLabel="Créer le projet"
      >
        {renderStepContent()}
      </WizardView>
    </AppLayout>
  )
}

export default ProjetWizard
