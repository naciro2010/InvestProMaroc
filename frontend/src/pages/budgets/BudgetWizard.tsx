import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material'
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'

const steps = ['Informations générales', 'Montants & Statut', 'Pièces jointes & Confirmation']

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface Convention {
  id: number
  code: string
  objet: string
}

interface BudgetFormData {
  version: string
  conventionId: number | null
  dateBudget: string
  plafondConvention: number
  totalBudget: number
  statut: 'BROUILLON' | 'VALIDE' | 'REJETE' | 'EN_REVISION'
  observations: string
  observationsRich: string
  files: UploadedFile[]
}

const BudgetWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [conventions, setConventions] = useState<Convention[]>([])

  const [formData, setFormData] = useState<BudgetFormData>({
    version: '',
    conventionId: null,
    dateBudget: new Date().toISOString().split('T')[0],
    plafondConvention: 0,
    totalBudget: 0,
    statut: 'BROUILLON',
    observations: '',
    observationsRich: '',
    files: [],
  })

  // Load conventions
  useEffect(() => {
    const loadConventions = async () => {
      try {
        const res = await conventionsAPI.getAll()
        setConventions(res.data.data || [])
      } catch (error) {
        console.error('Error loading conventions:', error)
      }
    }
    loadConventions()
  }, [])

  // React Query mutation pour la création
  const createMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const payload = {
        version: data.version,
        conventionId: data.conventionId,
        dateBudget: data.dateBudget,
        plafondConvention: data.plafondConvention,
        totalBudget: data.totalBudget,
        statut: data.statut,
        observations: data.observations,
        observationsRich: data.observationsRich,
      }
      return await budgetsAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/budgets')
    },
  })

  const handleChange = (field: keyof BudgetFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'conventionId'
        ? value ? Number(value) : null
        : field === 'plafondConvention' || field === 'totalBudget'
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

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          formData.version &&
          formData.conventionId &&
          formData.dateBudget
        )
      case 1:
        return formData.totalBudget > 0
      case 2:
        return true
      default:
        return false
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
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
                label="Version"
                required
                value={formData.version}
                onChange={handleChange('version')}
                placeholder="V1.0"
              />

              <TextField
                fullWidth
                label="Date du budget"
                type="date"
                required
                value={formData.dateBudget}
                onChange={handleChange('dateBudget')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              select
              label="Convention"
              required
              value={formData.conventionId || ''}
              onChange={handleChange('conventionId')}
            >
              <MenuItem value="">-- Sélectionner une convention --</MenuItem>
              {conventions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.code} - {c.objet.substring(0, 50)}...
                </MenuItem>
              ))}
            </TextField>

            <RichTextEditor
              label="Observations"
              value={formData.observationsRich}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  observationsRich: value,
                  observations: value.replace(/<[^>]*>/g, '').substring(0, 500),
                })
              }}
              placeholder="Observations sur ce budget..."
              minHeight={150}
            />
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Montants et statut
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Total budget (DH)"
                type="number"
                required
                value={formData.totalBudget}
                onChange={handleChange('totalBudget')}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                fullWidth
                label="Plafond convention (DH)"
                type="number"
                value={formData.plafondConvention}
                onChange={handleChange('plafondConvention')}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Limite budgétaire de la convention"
              />

              <TextField
                fullWidth
                select
                label="Statut"
                required
                value={formData.statut}
                onChange={handleChange('statut')}
              >
                <MenuItem value="BROUILLON">Brouillon</MenuItem>
                <MenuItem value="VALIDE">Validé</MenuItem>
                <MenuItem value="REJETE">Rejeté</MenuItem>
                <MenuItem value="EN_REVISION">En révision</MenuItem>
              </TextField>
            </Box>
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
              label="Documents du budget"
            />

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
                Récapitulatif
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.version}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(formData.dateBudget).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Convention
                  </Typography>
                  <Typography variant="body1">
                    {conventions.find(c => c.id === formData.conventionId)?.code || '-'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total budget
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.totalBudget)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Plafond convention
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.plafondConvention)}
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
                    Pièces jointes
                  </Typography>
                  <Typography variant="body1">
                    {formData.files.length} fichier(s)
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {createMutation.error && (
              <Alert severity="error">
                {getErrorMessage(createMutation.error, 'Erreur lors de la création du budget')}
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
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <PageHeader
            title="Nouveau Budget"
            subtitle="Créer un nouveau budget en 3 étapes"
            actions={
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/budgets')}
              >
                Retour
              </Button>
            }
          />

          <Paper sx={{ p: 4 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: 400, mb: 4 }}>{renderStepContent(activeStep)}</Box>

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 3,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Précédent
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || createMutation.isPending}
                endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
              >
                {createMutation.isPending
                  ? 'Création...'
                  : activeStep === steps.length - 1
                  ? 'Créer le budget'
                  : 'Suivant'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default BudgetWizard
