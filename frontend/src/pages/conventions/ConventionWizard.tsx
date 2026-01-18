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
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { SimplePageLayout } from '../../components/layout/PageLayout'
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
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'EN_EXECUTION' | 'ACHEVE'
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
    statut: 'BROUILLON',
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

            {/* Row 1: Code, Numéro, Statut */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Code"
                required
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="CONV-001"
                size="small"
              />
              <TextField
                fullWidth
                label="Numéro de convention"
                required
                value={formData.numeroConvention}
                onChange={handleChange('numeroConvention')}
                placeholder="N°2024/001"
                size="small"
              />
              <TextField
                fullWidth
                select
                label="Statut"
                value={formData.statut}
                onChange={handleChange('statut')}
                size="small"
              >
                <MenuItem value="BROUILLON">Brouillon</MenuItem>
                <MenuItem value="SOUMIS">Soumis</MenuItem>
                <MenuItem value="VALIDEE">Validée</MenuItem>
                <MenuItem value="EN_EXECUTION">En exécution</MenuItem>
                <MenuItem value="ACHEVE">Achevée</MenuItem>
              </TextField>
            </Box>

            {/* Row 2: Type de convention */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Type de convention"
                required
                value={formData.type}
                onChange={handleChange('type')}
                size="small"
              >
                <MenuItem value="CADRE">CADRE - Convention cadre</MenuItem>
                <MenuItem value="SPECIFIQUE">SPECIFIQUE - Convention spécifique</MenuItem>
              </TextField>
            </Box>

            {/* Row 3: Libellé */}
            <TextField
              fullWidth
              label="Libellé"
              required
              value={formData.libelle}
              onChange={handleChange('libelle')}
              placeholder="Convention de gestion des dépenses d'investissement..."
              multiline
              rows={2}
            />

            {/* Row 4: Objet (Rich Text) */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Objet de la convention *
              </Typography>
              <RichTextEditor
                value={formData.objetRich}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    objetRich: value,
                    objet: value.replace(/<[^>]*>/g, '').substring(0, 500),
                  })
                }}
                placeholder="Décrivez l'objet de la convention en détail..."
                minHeight={200}
              />
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Section: Paramètres financiers */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Paramètres financiers
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Row 1: Montant, Taux Commission, TVA */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Montant (DH)"
                type="number"
                required
                value={formData.montant}
                onChange={handleChange('montant')}
                inputProps={{ min: 0, step: 0.01 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Taux de commission (%)"
                type="number"
                required
                value={formData.tauxCommission}
                onChange={handleChange('tauxCommission')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Taux TVA (%)"
                type="number"
                value={formData.tauxTva}
                onChange={handleChange('tauxTva')}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                size="small"
              />
            </Box>

            {/* Row 2: Base de calcul */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Base de calcul"
                value={formData.baseCalcul}
                onChange={handleChange('baseCalcul')}
                size="small"
              >
                <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
                <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
              </TextField>
            </Box>

            {/* Section: Dates */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Dates
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Row 3: Dates (xs:1, md:3) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Date de signature"
                type="date"
                value={formData.dateSignature}
                onChange={handleChange('dateSignature')}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={formData.dateDebut}
                onChange={handleChange('dateDebut')}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                value={formData.dateFin}
                onChange={handleChange('dateFin')}
                InputLabelProps={{ shrink: true }}
                size="small"
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

            <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 } }}>
                {/* Row 1: Code, Numéro, Type */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Code
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.code}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Numéro de convention
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.numeroConvention}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Type
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.type === 'CADRE' ? 'Convention cadre' : 'Convention spécifique'}
                    </Typography>
                  </Box>
                </Box>

                {/* Row 2: Statut, Montant, Taux */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Statut
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.statut}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Montant
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.montant)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Taux de commission
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.tauxCommission}%
                    </Typography>
                  </Box>
                </Box>

                {/* Row 3: Base calcul, TVA */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Base de calcul
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.baseCalcul === 'MONTANT_TTC' ? 'Montant TTC' : 'Montant HT'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Taux TVA
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.tauxTva}%
                    </Typography>
                  </Box>
                </Box>

                {/* Row 4: Libellé (full width) */}
                <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Libellé
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formData.libelle}
                  </Typography>
                </Box>

                {/* Row 5: Période, Pièces jointes */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: { xs: 2, md: 3 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Période
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Du {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
                      {formData.dateFin && ` au ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}`}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Pièces jointes
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formData.files.length} fichier(s)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

          </Box>
        )

      default:
        return null
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <AppLayout>
      <SimplePageLayout
        title="Nouvelle Convention"
        subtitle="Créer une nouvelle convention en 3 étapes simples"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/conventions')}
            size={isMobile ? 'small' : 'medium'}
          >
            Retour
          </Button>
        }
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 4,
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }
              }}
              orientation={isMobile ? 'vertical' : 'horizontal'}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {/* Step Content */}
            <Box sx={{ minHeight: { xs: 300, md: 450 }, mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Navigation Buttons */}
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                fullWidth={isMobile}
              >
                Précédent
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || createMutation.isPending}
                endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
                fullWidth={isMobile}
              >
                {createMutation.isPending
                  ? 'Création...'
                  : activeStep === steps.length - 1
                  ? 'Créer la convention'
                  : 'Suivant'}
              </Button>
            </Stack>

            {/* Error Alert */}
            {createMutation.error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {(createMutation.error as any)?.response?.data?.message ||
                  'Erreur lors de la création de la convention'}
              </Alert>
            )}
          </Paper>
        </Container>
      </SimplePageLayout>
    </AppLayout>
  )
}

export default ConventionWizard
