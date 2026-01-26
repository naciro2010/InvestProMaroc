import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Cancel as CancelIcon,
  Description,
  AccountBalance,
  People,
  TrendingUp,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { conventionsAPI } from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import {
  ConventionInfoSection,
  ConventionFinancesSection,
  ConventionDatesSection,
} from '../../components/conventions/edit'

// Zod validation schema
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
  if (data.dateSignature && data.dateDebut) {
    return data.dateDebut >= data.dateSignature
  }
  return true
}, {
  message: 'La date de début doit être postérieure ou égale à la date de signature',
  path: ['dateDebut'],
}).refine((data) => {
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
  budget: number
  dateConvention: string
  dateDebut: string
  dateFin?: string | null
  tauxTva: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const ConventionEditPageComplete = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  const {
    control,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConventionFormData>({
    resolver: zodResolver(conventionSchema),
  })

  useEffect(() => {
    if (id) {
      loadConvention(parseInt(id))
    }
  }, [id])

  const loadConvention = async (conventionId: number) => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getById(conventionId)
      const data = response.data.data || response.data
      setConvention(data)

      // Map backend fields to form fields
      reset({
        code: data.code,
        numero: data.numero,
        libelle: data.libelle,
        objet: data.objet,
        typeConvention: data.typeConvention,
        tauxCommission: data.tauxCommission,
        baseCalcul: data.baseCalcul,
        montant: data.budget,
        dateSignature: new Date(data.dateConvention),
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        tauxTva: data.tauxTva,
      })
    } catch (err) {
      setError('Erreur lors du chargement de la convention')
      showToast('Erreur lors du chargement de la convention', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: ConventionFormData) => {
    if (!id) return

    try {
      setSaving(true)

      // Map form fields to backend fields
      const payload = {
        code: data.code,
        numero: data.numero,
        libelle: data.libelle,
        objet: data.objet,
        typeConvention: data.typeConvention,
        tauxCommission: data.tauxCommission,
        baseCalcul: data.baseCalcul,
        budget: data.montant,
        dateConvention: data.dateSignature.toISOString(),
        dateDebut: data.dateDebut.toISOString(),
        dateFin: data.dateFin ? data.dateFin.toISOString() : null,
        tauxTva: data.tauxTva,
      }

      await conventionsAPI.update(parseInt(id), payload)
      showToast('Convention modifiée avec succès', 'success')
      navigate(`/conventions/${id}`)
    } catch (err) {
      showToast('Erreur lors de la modification', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={400} />
        </Container>
      </AppLayout>
    )
  }

  if (error || !convention) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Convention non trouvée'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title={`Modifier Convention ${convention.code}`}
            subtitle="Modification complète de la convention avec validation"
            actions={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/conventions/${id}`)}
                  disabled={saving}
                >
                  Retour
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    if (isDirty) {
                      if (window.confirm('Abandonner les modifications ?')) {
                        navigate(`/conventions/${id}`)
                      }
                    } else {
                      navigate(`/conventions/${id}`)
                    }
                  }}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleFormSubmit(handleSave)}
                  disabled={saving || !isDirty}
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Box>
            }
          />

          {/* Form with Tabs */}
          <Paper>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Informations générales" icon={<Description />} iconPosition="start" />
              <Tab label="Paramètres financiers" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="Partenaires & Imputations" icon={<People />} iconPosition="start" />
              <Tab label="Versements prévisionnels" icon={<TrendingUp />} iconPosition="start" />
            </Tabs>

            <form onSubmit={handleFormSubmit(handleSave)}>
              {/* Tab 1: Informations générales */}
              <TabPanel value={activeTab} index={0}>
                <Container maxWidth="lg">
                  <ConventionInfoSection control={control} errors={errors} />
                  <Box sx={{ mt: 3 }}>
                    <ConventionDatesSection control={control} errors={errors} />
                  </Box>
                </Container>
              </TabPanel>

              {/* Tab 2: Paramètres financiers */}
              <TabPanel value={activeTab} index={1}>
                <Container maxWidth="lg">
                  <ConventionFinancesSection control={control} errors={errors} />
                </Container>
              </TabPanel>

              {/* Tab 3: Partenaires & Imputations */}
              <TabPanel value={activeTab} index={2}>
                <Container maxWidth="lg">
                  <Alert severity="info" sx={{ mb: 3 }}>
                    La gestion des partenaires et imputations se fait depuis la page de visualisation de la convention.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    • Partenaires : Ajoutez les organismes financeurs de la convention
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Imputations prévisionnelles : Définissez les allocations budgétaires par axe analytique
                  </Typography>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/conventions/${id}`)}
                    >
                      Aller à la page de visualisation
                    </Button>
                  </Box>
                </Container>
              </TabPanel>

              {/* Tab 4: Versements prévisionnels */}
              <TabPanel value={activeTab} index={3}>
                <Container maxWidth="lg">
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Les versements prévisionnels se gèrent depuis la page de visualisation de la convention.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    • Définissez le calendrier prévisionnel des versements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Associez chaque versement à un axe analytique et un projet
                  </Typography>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/conventions/${id}`)}
                    >
                      Aller à la page de visualisation
                    </Button>
                  </Box>
                </Container>
              </TabPanel>
            </form>
          </Paper>

          {/* Errors Display */}
          {Object.keys(errors).length > 0 && (
            <Paper sx={{ mt: 3, p: 3, bgcolor: '#fef2f2', border: '1px solid #fca5a5' }}>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Erreurs de validation
              </Typography>
              <ul>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <Typography variant="body2" color="error">
                      {field}: {error.message}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          )}
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ConventionEditPageComplete
