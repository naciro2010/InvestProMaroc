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
  Stack,
  Alert,
  Divider,
} from '@mui/material'
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader } from '@/components/core'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { marchesAPI, conventionsAPI, fournisseursAPI } from '../../lib/api'

const steps = ['Informations générales', 'Montants & Dates', 'Localisation & Confirmation']

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

interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
}

interface MarcheFormData {
  code: string
  numeroMarche: string
  numAO: string
  objet: string
  objetRich: string
  typeMarche: 'MARCHE' | 'CONTRAT' | 'BON_DE_COMMANDE' | 'LETTRE_DE_COMMANDE'
  naturePrestation: 'TRAVAUX' | 'FOURNITURES' | 'SERVICES' | 'ETUDES'
  fournisseurId: number | null
  conventionId: number | null
  montantHT: number
  montantTTC: number
  tauxTVA: number
  tauxPenalite: number
  dateSignature: string
  dateNotification: string
  dateOrdreService: string
  delaiExecution: number
  adresse: string
  latitude: number | null
  longitude: number | null
  zoneGeographique: string
  files: UploadedFile[]
}

const MarcheWizard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [conventions, setConventions] = useState<Convention[]>([])
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])

  const [formData, setFormData] = useState<MarcheFormData>({
    code: '',
    numeroMarche: '',
    numAO: '',
    objet: '',
    objetRich: '',
    typeMarche: 'MARCHE',
    naturePrestation: 'TRAVAUX',
    fournisseurId: null,
    conventionId: null,
    montantHT: 0,
    montantTTC: 0,
    tauxTVA: 20,
    tauxPenalite: 0.05,
    dateSignature: new Date().toISOString().split('T')[0],
    dateNotification: new Date().toISOString().split('T')[0],
    dateOrdreService: '',
    delaiExecution: 12,
    adresse: '',
    latitude: null,
    longitude: null,
    zoneGeographique: '',
    files: [],
  })

  // Load conventions and fournisseurs
  useEffect(() => {
    const loadData = async () => {
      try {
        const [convRes, fournRes] = await Promise.all([
          conventionsAPI.getAll(),
          fournisseursAPI.getAll(),
        ])
        setConventions(convRes.data.data || [])
        setFournisseurs(fournRes.data.data || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // React Query mutation pour la création
  const createMutation = useMutation({
    mutationFn: async (data: MarcheFormData) => {
      const payload = {
        code: data.code,
        numeroMarche: data.numeroMarche,
        numAo: data.numAO || null,
        objet: data.objet,
        objetRich: data.objetRich,
        typeMarche: data.typeMarche,
        naturePrestation: data.naturePrestation,
        fournisseurId: data.fournisseurId,
        conventionId: data.conventionId,
        montantHt: data.montantHT,
        montantTtc: data.montantTTC,
        tauxTva: data.tauxTVA,
        tauxPenalite: data.tauxPenalite,
        dateSignature: data.dateSignature,
        dateNotification: data.dateNotification,
        dateOrdreService: data.dateOrdreService || null,
        delaiExecutionMois: data.delaiExecution,
        adresse: data.adresse || null,
        latitude: data.latitude,
        longitude: data.longitude,
        zoneGeographique: data.zoneGeographique || null,
      }
      return await marchesAPI.create(payload)
    },
    onSuccess: () => {
      navigate('/marches')
    },
  })

  const handleChange = (field: keyof MarcheFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'fournisseurId' || field === 'conventionId' || field === 'delaiExecution'
        ? value ? Number(value) : null
        : field === 'montantHT' || field === 'montantTTC' || field === 'tauxTVA' || field === 'tauxPenalite'
        ? parseFloat(value) || 0
        : field === 'latitude' || field === 'longitude'
        ? value ? parseFloat(value) : null
        : value
    })
  }

  // Auto-calculate TTC when HT or TVA changes
  useEffect(() => {
    const montantTVA = formData.montantHT * (formData.tauxTVA / 100)
    const montantTTC = formData.montantHT + montantTVA
    setFormData(prev => ({ ...prev, montantTTC }))
  }, [formData.montantHT, formData.tauxTVA])

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
          formData.numeroMarche &&
          formData.objetRich &&
          formData.fournisseurId
        )
      case 1:
        return formData.montantHT > 0 && formData.montantTTC > 0
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
                placeholder="MRC-001"
              />

              <TextField
                fullWidth
                label="Numéro de marché"
                required
                value={formData.numeroMarche}
                onChange={handleChange('numeroMarche')}
                placeholder="N°2024/001"
              />

              <TextField
                fullWidth
                label="Numéro d'AO"
                value={formData.numAO}
                onChange={handleChange('numAO')}
                placeholder="AO-2024/001"
              />

              <TextField
                fullWidth
                select
                label="Type de marché"
                required
                value={formData.typeMarche}
                onChange={handleChange('typeMarche')}
              >
                <MenuItem value="MARCHE">Marché</MenuItem>
                <MenuItem value="CONTRAT">Contrat</MenuItem>
                <MenuItem value="BON_DE_COMMANDE">Bon de commande</MenuItem>
                <MenuItem value="LETTRE_DE_COMMANDE">Lettre de commande</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                select
                label="Nature de la prestation"
                required
                value={formData.naturePrestation}
                onChange={handleChange('naturePrestation')}
              >
                <MenuItem value="TRAVAUX">Travaux</MenuItem>
                <MenuItem value="FOURNITURES">Fournitures</MenuItem>
                <MenuItem value="SERVICES">Services</MenuItem>
                <MenuItem value="ETUDES">Études</MenuItem>
              </TextField>
            </Box>

            <RichTextEditor
              label="Objet du marché"
              value={formData.objetRich}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  objetRich: value,
                  objet: value.replace(/<[^>]*>/g, '').substring(0, 500),
                })
              }}
              placeholder="Décrivez l'objet du marché en détail..."
              required
              minHeight={200}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                select
                label="Fournisseur"
                required
                value={formData.fournisseurId || ''}
                onChange={handleChange('fournisseurId')}
              >
                <MenuItem value="">-- Sélectionner --</MenuItem>
                {fournisseurs.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.code} - {f.raisonSociale}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Convention"
                value={formData.conventionId || ''}
                onChange={handleChange('conventionId')}
              >
                <MenuItem value="">-- Optionnel --</MenuItem>
                {conventions.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.code} - {c.objet.substring(0, 50)}...
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Montants et dates
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <DecimalInput
                fullWidth
                label="Montant HT (DH)"
                required
                value={formData.montantHT}
                onChange={(value) => setFormData({ ...formData, montantHT: value })}
                min={0}
                decimalPlaces={2}
              />

              <DecimalInput
                fullWidth
                label="Taux TVA (%)"
                required
                value={formData.tauxTVA}
                onChange={(value) => setFormData({ ...formData, tauxTVA: value })}
                min={0}
                max={100}
                decimalPlaces={2}
              />

              <DecimalInput
                fullWidth
                label="Montant TTC (DH)"
                required
                value={formData.montantTTC}
                onChange={() => {}}
                decimalPlaces={2}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    bgcolor: '#f9fafb',
                    fontWeight: 600,
                    color: '#3b82f6',
                  },
                }}
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
              Dates
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Date de signature"
                type="date"
                required
                value={formData.dateSignature}
                onChange={handleChange('dateSignature')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date de notification"
                type="date"
                required
                value={formData.dateNotification}
                onChange={handleChange('dateNotification')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Date d'ordre de service"
                type="date"
                value={formData.dateOrdreService}
                onChange={handleChange('dateOrdreService')}
                InputLabelProps={{ shrink: true }}
              />

              <DecimalInput
                fullWidth
                label="Délai d'exécution (mois)"
                required
                value={formData.delaiExecution}
                onChange={(value) => setFormData({ ...formData, delaiExecution: value })}
                min={0}
                decimalPlaces={0}
              />

              <DecimalInput
                fullWidth
                label="Taux pénalité / jour (ex: 1/2000 = 0.0005)"
                value={formData.tauxPenalite}
                onChange={(value) => setFormData({ ...formData, tauxPenalite: value })}
                min={0}
                max={1}
                decimalPlaces={4}
                helperText="Standard marchés publics: 1/2000 par jour = 0.0005"
              />
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Localisation
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <TextField
              fullWidth
              label="Adresse"
              value={formData.adresse}
              onChange={handleChange('adresse')}
              placeholder="Adresse complète du chantier..."
              multiline
              rows={2}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <DecimalInput
                fullWidth
                label="Latitude"
                value={formData.latitude || 0}
                onChange={(value) => setFormData({ ...formData, latitude: value || null })}
                placeholder="33.5731"
                decimalPlaces={6}
              />

              <DecimalInput
                fullWidth
                label="Longitude"
                value={formData.longitude || 0}
                onChange={(value) => setFormData({ ...formData, longitude: value || null })}
                placeholder="-7.5898"
                decimalPlaces={6}
              />

              <TextField
                fullWidth
                label="Zone géographique"
                value={formData.zoneGeographique}
                onChange={handleChange('zoneGeographique')}
                placeholder="Casablanca, Rabat..."
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
                Pièces jointes
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <FileUploadZone
              files={formData.files}
              onFilesChange={(files) => setFormData({ ...formData, files })}
              maxFiles={10}
              maxSizeMB={10}
              label="Documents du marché"
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
                      Numéro de marché
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.numeroMarche}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {formData.typeMarche} - {formData.naturePrestation}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fournisseur
                    </Typography>
                    <Typography variant="body1">
                      {fournisseurs.find(f => f.id === formData.fournisseurId)?.raisonSociale || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Montant HT
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.montantHT)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Montant TTC
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.montantTTC)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date de signature
                  </Typography>
                  <Typography variant="body1">
                    {new Date(formData.dateSignature).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>

                {formData.adresse && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Localisation
                    </Typography>
                    <Typography variant="body1">
                      {formData.adresse}
                      {formData.zoneGeographique && ` - ${formData.zoneGeographique}`}
                    </Typography>
                  </Box>
                )}

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
                  'Erreur lors de la création du marché'}
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
            title="Nouveau Marché"
            subtitle="Créer un nouveau marché en 3 étapes"
            actions={
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/marches')}
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
                  ? 'Créer le marché'
                  : 'Suivant'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default MarcheWizard
