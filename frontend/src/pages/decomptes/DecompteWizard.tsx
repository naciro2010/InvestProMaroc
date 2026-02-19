import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Divider,
  Chip,
  IconButton,
  Button,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import DecimalInput from '@/components/ui/DecimalInput'
import { WizardView } from '@/components/core'
import FileUploadZone from '../../components/common/FileUploadZone'
import RichTextEditor from '../../components/common/RichTextEditor'
import { decomptesAPI, marchesAPI } from '../../lib/api'
import { colors } from '@/lib/designSystem'

const steps = ['Informations generales', 'Montants & Retenues', 'Pieces jointes & Confirmation']

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

interface Marche {
  id: number
  code: string
  objet: string
}

interface Retenue {
  type: 'RG' | 'PENALITE' | 'AVANCE' | 'AUTRE'
  montant: number
  description: string
}

interface DecompteFormData {
  numeroDecompte: string
  marcheId: number | null
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  montantBrutHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  retenues: Retenue[]
  totalRetenues: number
  netAPayer: number
  observations: string
  observationsRich: string
  statut: 'BROUILLON' | 'VALIDE' | 'PAYE'
  files: UploadedFile[]
}

const DecompteWizard = () => {
  const navigate = useNavigate()
  const { marcheId: routeMarcheId } = useParams<{ marcheId: string }>()
  const prefilledMarcheId = routeMarcheId ? parseInt(routeMarcheId) : null
  const [activeStep, setActiveStep] = useState(0)
  const [marches, setMarches] = useState<Marche[]>([])

  const [formData, setFormData] = useState<DecompteFormData>({
    numeroDecompte: '',
    marcheId: prefilledMarcheId,
    dateDecompte: new Date().toISOString().split('T')[0],
    periodeDebut: '',
    periodeFin: '',
    montantBrutHT: 0,
    tauxTVA: 20,
    montantTVA: 0,
    montantTTC: 0,
    retenues: [],
    totalRetenues: 0,
    netAPayer: 0,
    observations: '',
    observationsRich: '',
    statut: 'BROUILLON',
    files: [],
  })

  // Load marches
  useEffect(() => {
    const loadMarches = async () => {
      try {
        const res = await marchesAPI.getAll()
        setMarches(res.data.data || [])
      } catch (error) {
        console.error('Error loading marches:', error)
      }
    }
    loadMarches()
  }, [])

  // Auto-calculate montants
  useEffect(() => {
    const montantTVA = formData.montantBrutHT * (formData.tauxTVA / 100)
    const montantTTC = formData.montantBrutHT + montantTVA
    const totalRetenues = formData.retenues.reduce((sum, r) => sum + r.montant, 0)
    const netAPayer = montantTTC - totalRetenues

    setFormData(prev => ({
      ...prev,
      montantTVA,
      montantTTC,
      totalRetenues,
      netAPayer
    }))
  }, [formData.montantBrutHT, formData.tauxTVA, formData.retenues])

  // React Query mutation pour la creation
  const createMutation = useMutation({
    mutationFn: async (data: DecompteFormData) => {
      const payload = {
        code: data.numeroDecompte,
        montant: data.montantTTC,
        netAPayer: data.netAPayer,
        retenues: data.totalRetenues,
        dateDecompte: data.dateDecompte,
        marcheId: data.marcheId || undefined,
        status: data.statut,
        observation: data.observations,
      }
      return await decomptesAPI.create(payload)
    },
    onSuccess: () => {
      if (prefilledMarcheId) {
        navigate(`/marches/${prefilledMarcheId}`)
      } else {
        navigate('/marches')
      }
    },
  })

  const handleChange = (field: keyof DecompteFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'marcheId'
        ? value ? Number(value) : null
        : field === 'montantBrutHT' || field === 'tauxTVA'
        ? parseFloat(value) || 0
        : value
    })
  }

  const addRetenue = () => {
    setFormData({
      ...formData,
      retenues: [
        ...formData.retenues,
        { type: 'RG', montant: 0, description: '' }
      ]
    })
  }

  const updateRetenue = (index: number, field: keyof Retenue, value: string | number) => {
    const newRetenues = [...formData.retenues]
    newRetenues[index] = {
      ...newRetenues[index],
      [field]: field === 'montant' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : value
    }
    setFormData({ ...formData, retenues: newRetenues })
  }

  const removeRetenue = (index: number) => {
    setFormData({
      ...formData,
      retenues: formData.retenues.filter((_, i) => i !== index)
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
          formData.numeroDecompte &&
          formData.marcheId &&
          formData.dateDecompte &&
          formData.periodeDebut &&
          formData.periodeFin
        )
      case 1:
        return formData.montantBrutHT > 0
      case 2:
        return true
      default:
        return false
    }
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
                label="Numero de decompte"
                required
                value={formData.numeroDecompte}
                onChange={handleChange('numeroDecompte')}
                placeholder="DEC-001"
              />

              <TextField
                fullWidth
                label="Date du decompte"
                type="date"
                required
                value={formData.dateDecompte}
                onChange={handleChange('dateDecompte')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {prefilledMarcheId ? (
              <TextField
                fullWidth
                label="Marche"
                value={marches.find(m => m.id === prefilledMarcheId)?.code
                  ? `${marches.find(m => m.id === prefilledMarcheId)?.code} - ${marches.find(m => m.id === prefilledMarcheId)?.objet?.substring(0, 50) ?? ''}`
                  : `Marche #${prefilledMarcheId}`}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { bgcolor: colors.neutral[50] } }}
              />
            ) : (
              <TextField
                fullWidth
                select
                label="Marche"
                required
                value={formData.marcheId || ''}
                onChange={handleChange('marcheId')}
              >
                <MenuItem value="">-- Selectionner un marche --</MenuItem>
                {marches.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.code} - {m.objet.substring(0, 50)}...
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Periode couverte
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Debut de periode"
                type="date"
                required
                value={formData.periodeDebut}
                onChange={handleChange('periodeDebut')}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Fin de periode"
                type="date"
                required
                value={formData.periodeFin}
                onChange={handleChange('periodeFin')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

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
              placeholder="Observations sur ce decompte..."
              minHeight={150}
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
              <MenuItem value="VALIDE">Valide</MenuItem>
              <MenuItem value="PAYE">Paye</MenuItem>
            </TextField>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Montants
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <DecimalInput
                fullWidth
                label="Montant brut HT (DH)"
                required
                value={formData.montantBrutHT}
                onChange={(value) => setFormData({ ...formData, montantBrutHT: value })}
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
                value={formData.montantTTC}
                onChange={() => {}}
                decimalPlaces={2}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    bgcolor: colors.neutral[50],
                    fontWeight: 600,
                    color: colors.primary[600],
                  },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Retenues
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addRetenue}
                >
                  Ajouter une retenue
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {formData.retenues.map((retenue, index) => (
              <Box key={index} sx={{ p: 2, bgcolor: colors.neutral[50], borderRadius: 1, border: `1px solid ${colors.neutral[200]}` }}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Retenue {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeRetenue(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 2fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      select
                      label="Type"
                      size="small"
                      value={retenue.type}
                      onChange={(e) => updateRetenue(index, 'type', e.target.value)}
                    >
                      <MenuItem value="RG">Retenue de garantie</MenuItem>
                      <MenuItem value="PENALITE">Penalite</MenuItem>
                      <MenuItem value="AVANCE">Avance</MenuItem>
                      <MenuItem value="AUTRE">Autre</MenuItem>
                    </TextField>

                    <DecimalInput
                      fullWidth
                      label="Montant (DH)"
                      size="small"
                      value={retenue.montant}
                      onChange={(value) => updateRetenue(index, 'montant', value)}
                      min={0}
                      decimalPlaces={2}
                    />

                    <TextField
                      fullWidth
                      label="Description"
                      size="small"
                      value={retenue.description}
                      onChange={(e) => updateRetenue(index, 'description', e.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
            ))}

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                Resume financier
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box sx={{ p: 3, bgcolor: colors.neutral[50], borderRadius: 1, border: `1px solid ${colors.neutral[200]}` }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary">
                    Montant brut HT
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montantBrutHT)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary">
                    TVA ({formData.tauxTVA}%)
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montantTVA)}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary">
                    Montant TTC
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.montantTTC)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="error">
                    Total retenues
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="error">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.totalRetenues)}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    Net a payer
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight={700}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                    }).format(formData.netAPayer)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Pieces jointes
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <FileUploadZone
              files={formData.files}
              onFilesChange={(files) => setFormData({ ...formData, files })}
              maxFiles={10}
              maxSizeMB={10}
              label="Documents du decompte"
            />

            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
                Recapitulatif
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box sx={{ p: 3, bgcolor: colors.neutral[50], borderRadius: 1, border: `1px solid ${colors.neutral[200]}` }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Numero de decompte
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formData.numeroDecompte}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(formData.dateDecompte).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Marche
                  </Typography>
                  <Typography variant="body1">
                    {marches.find(m => m.id === formData.marcheId)?.code || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Periode
                  </Typography>
                  <Typography variant="body1">
                    Du {new Date(formData.periodeDebut).toLocaleDateString('fr-FR')}
                    {' au '}
                    {new Date(formData.periodeFin).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
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

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Net a payer
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      }).format(formData.netAPayer)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nombre de retenues
                    </Typography>
                    <Typography variant="body1">
                      {formData.retenues.length} retenue(s)
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip
                      label={formData.statut}
                      size="small"
                      color={formData.statut === 'VALIDE' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pieces jointes
                  </Typography>
                  <Typography variant="body1">
                    {formData.files.length} fichier(s)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {createMutation.error && (
              <Alert severity="error">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Erreur lors de la creation du decompte'}
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
        breadcrumbs={[{ label: 'Decomptes', path: '/decomptes' }, { label: 'Nouveau' }]}
        steps={steps.map(label => ({ label }))}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => prefilledMarcheId ? navigate(`/marches/${prefilledMarcheId}`) : navigate('/decomptes')}
        isNextDisabled={!isStepValid() || createMutation.isPending}
        isSubmitting={createMutation.isPending}
        submitLabel="Creer le decompte"
      >
        {renderStepContent()}
      </WizardView>
    </AppLayout>
  )
}

export default DecompteWizard
