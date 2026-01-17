import { useState } from 'react'
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
  Stack,
  Alert,
  Divider,
} from '@mui/material'
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import { conventionsAPI } from '../../lib/api'

const steps = ['Informations générales', 'Paramètres financiers', 'Pièces jointes & Confirmation']

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface ConventionFormData {
  code: string
  numeroConvention: string
  libelle: string
  objet: string
  objetRich: string
  type: 'CADRE' | 'SPECIFIQUE'
  tauxCommission: number
  baseCalcul: 'MONTANT_TTC' | 'MONTANT_HT'
  montant: number
  dateSignature: string
  dateDebut: string
  dateFin: string
  tauxTva: number
  files: UploadedFile[]
}

const ConventionWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState<ConventionFormData>({
    code: '',
    numeroConvention: '',
    libelle: '',
    objet: '',
    objetRich: '',
    type: 'CADRE',
    tauxCommission: 3.5,
    baseCalcul: 'MONTANT_TTC',
    montant: 0,
    dateSignature: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    tauxTva: 20,
    files: [],
  })

  // React Query mutation pour la création
  const createMutation = useMutation({
    mutationFn: async (data: ConventionFormData) => {
      const payload = {
        code: data.code,
        objet: data.objet,
        objetRich: data.objetRich,
        type: data.type,
        tauxCommission: data.tauxCommission,
        budgetTotal: data.montant,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        tauxTva: data.tauxTva,
        baseCalcul: data.baseCalcul,
        numeroConvention: data.numeroConvention,
        designation: data.libelle,
        dateSignature: data.dateSignature,
      }
      return await conventionsAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/conventions')
    },
  })

  const handleChange = (field: keyof ConventionFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value })
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
          formData.code &&
          formData.numeroConvention &&
          formData.libelle &&
          formData.objetRich
        )
      case 1:
        return formData.montant > 0 && formData.tauxCommission > 0
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
                label="Code"
                required
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="CONV-001"
              />

              <TextField
                fullWidth
                label="Numéro de convention"
                required
                value={formData.numeroConvention}
                onChange={handleChange('numeroConvention')}
                placeholder="N°2024/001"
              />
            </Box>

            <TextField
              fullWidth
              label="Libellé"
              required
              value={formData.libelle}
              onChange={handleChange('libelle')}
              placeholder="Convention de gestion..."
            />

            <RichTextEditor
              label="Objet de la convention"
              value={formData.objetRich}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  objetRich: value,
                  objet: value.replace(/<[^>]*>/g, '').substring(0, 500),
                })
              }}
              placeholder="Décrivez l'objet de la convention en détail..."
              required
              minHeight={200}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                select
                label="Type"
                value={formData.type}
                onChange={handleChange('type')}
              >
                <MenuItem value="CADRE">CADRE - Convention cadre</MenuItem>
                <MenuItem value="SPECIFIQUE">
                  SPECIFIQUE - Convention spécifique
                </MenuItem>
              </TextField>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Paramètres financiers et dates
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Montant (DH)"
                type="number"
                required
                value={formData.montant}
                onChange={handleChange('montant')}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                fullWidth
                label="Taux de commission (%)"
                type="number"
                required
                value={formData.tauxCommission}
                onChange={handleChange('tauxCommission')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />

              <TextField
                fullWidth
                select
                label="Base de calcul"
                value={formData.baseCalcul}
                onChange={handleChange('baseCalcul')}
              >
                <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
                <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Taux TVA (%)"
                type="number"
                value={formData.tauxTva}
                onChange={handleChange('tauxTva')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
              Dates
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Date de signature"
                type="date"
                value={formData.dateSignature}
                onChange={handleChange('dateSignature')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={formData.dateDebut}
                onChange={handleChange('dateDebut')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                value={formData.dateFin}
                onChange={handleChange('dateFin')}
                InputLabelProps={{ shrink: true }}
              />
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
              label="Documents de la convention"
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
                      Code
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.code}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Numéro de convention
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.numeroConvention}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Libellé
                  </Typography>
                  <Typography variant="body1">{formData.libelle}</Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {formData.type === 'CADRE'
                        ? 'Convention cadre'
                        : 'Convention spécifique'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Montant
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.montant)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Taux de commission
                    </Typography>
                    <Typography variant="body1">
                      {formData.tauxCommission}%
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Base de calcul
                    </Typography>
                    <Typography variant="body1">
                      {formData.baseCalcul === 'MONTANT_TTC'
                        ? 'Montant TTC'
                        : 'Montant HT'}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Période
                  </Typography>
                  <Typography variant="body1">
                    Du {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                    {formData.dateFin &&
                      ` au ${new Date(formData.dateFin).toLocaleDateString(
                        'fr-FR'
                      )}`}
                  </Typography>
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
                {(createMutation.error as any)?.response?.data?.message ||
                  'Erreur lors de la création de la convention'}
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
            title="Nouvelle Convention"
            subtitle="Créer une nouvelle convention en 3 étapes"
            actions={
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/conventions')}
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
                  ? 'Créer la convention'
                  : 'Suivant'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionWizard
