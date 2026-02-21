import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Alert,
  Skeleton,
  Typography,
  Button,
} from '@mui/material'
import { Eye, ArrowLeft } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { conventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { ControlPanel, FormView, Notebook, StatusBadge } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { calculateDurationMonths } from '@/utils/dateUtils'
import EditGeneralFields from '@/components/conventions/edit/EditGeneralFields'
import EditBudgetFields from '@/components/conventions/edit/EditBudgetFields'
import EditBudgetLinesSection from '@/components/conventions/edit/EditBudgetLinesSection'
import EditDatesFields from '@/components/conventions/edit/EditDatesFields'
import EditInfoPanel from '@/components/conventions/edit/EditInfoPanel'
import {
  conventionEditSchema,
  CONVENTION_STATUS_STEPS,
  type ConventionEditFormData,
  type ConventionMetadata,
} from '@/components/conventions/edit/editTypes'

interface ConventionApiResponse {
  id: number
  code: string
  numero: string
  typeConvention: string
  type: string
  statut: string
  libelle: string
  designation: string
  objet: string
  objetRich: string
  budget: number
  budgetTotal: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  tauxTvaLignes: number
  dateConvention: string
  dateDebut: string
  dateFin: string
  dureeMois: number
  createdAt: string
  updatedAt: string
  createdBy: string
  dateSoumission: string | null
  dateValidation: string | null
  isLocked: boolean
  motifVerrouillage: string | null
  parentConvention: { code: string } | null
  sousConventions: unknown[] | null
}

const toIsoDate = (val: string | Date | null | undefined): string => {
  if (!val) return ''
  return typeof val === 'string' ? val.split('T')[0] : new Date(val).toISOString().split('T')[0]
}

const ConventionEditPageComplete = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [autoDateFin, setAutoDateFin] = useState(true)
  const [metadata, setMetadata] = useState<ConventionMetadata | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ConventionEditFormData>({
    resolver: zodResolver(conventionEditSchema),
  })

  const watchValues = watch()

  const loadConvention = useCallback(async (conventionId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await conventionsAPI.getById(conventionId)
      const data: ConventionApiResponse = response.data.data || response.data

      const dateDebut = toIsoDate(data.dateDebut)
      const dateFin = toIsoDate(data.dateFin)
      const dureeMois = dateDebut && dateFin
        ? calculateDurationMonths(new Date(dateDebut), new Date(dateFin))
        : (data.dureeMois || 12)

      reset({
        code: data.code || '',
        numero: data.numero || '',
        typeConvention: (data.typeConvention || data.type || 'CADRE') as ConventionEditFormData['typeConvention'],
        libelle: data.libelle || data.designation || '',
        objet: data.objetRich || data.objet || '',
        budget: data.budget || data.budgetTotal || 0,
        tauxCommission: data.tauxCommission || 0,
        baseCalcul: data.baseCalcul || 'DECAISSEMENTS_TTC',
        tauxTva: data.tauxTva || 20,
        tauxTvaLignes: data.tauxTvaLignes || 20,
        dateConvention: toIsoDate(data.dateConvention),
        dateDebut,
        dateFin,
        dureeMois,
      })

      setMetadata({
        id: data.id,
        statut: data.statut,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy || '',
        dateSoumission: data.dateSoumission,
        dateValidation: data.dateValidation,
        parentConventionCode: data.parentConvention?.code || null,
        isLocked: data.isLocked || false,
        sousConventionsCount: data.sousConventions?.length || 0,
      })
    } catch {
      setError('Convention introuvable ou erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }, [reset])

  useEffect(() => {
    if (id) loadConvention(parseInt(id))
  }, [id, loadConvention])

  const handleSave = async (formData: ConventionEditFormData) => {
    try {
      setSaving(true)
      const payload = {
        code: formData.code,
        numero: formData.numero,
        typeConvention: formData.typeConvention,
        libelle: formData.libelle,
        objet: formData.objet,
        budget: formData.budget,
        tauxCommission: formData.tauxCommission,
        baseCalcul: formData.baseCalcul,
        tauxTva: formData.tauxTva,
        tauxTvaLignes: formData.tauxTvaLignes,
        dateConvention: formData.dateConvention,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || undefined,
      }
      await conventionsAPI.update(parseInt(id!), payload)
      showToast('Convention mise a jour avec succes', 'success')
      setIsEditing(false)
      // Reload to get fresh data including updated metadata
      await loadConvention(parseInt(id!))
    } catch {
      showToast('Erreur lors de la mise a jour', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (id) loadConvention(parseInt(id))
  }

  const handleToggleEdit = () => {
    setIsEditing(true)
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
          <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
            <Skeleton variant="text" width={300} height={28} />
          </Box>
          <Box sx={{ p: 3, display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: '8px' }} />
            </Box>
            <Box sx={{ width: 280 }}>
              <Skeleton variant="rectangular" height={350} sx={{ borderRadius: '8px' }} />
            </Box>
          </Box>
        </Box>
      </AppLayout>
    )
  }

  if (error || !metadata || !id) {
    return (
      <AppLayout>
        <Box sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error || 'Convention introuvable'}</Alert>
          <Button onClick={() => navigate('/conventions')} sx={componentStyles.buttonSecondary}>
            Retour aux conventions
          </Button>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[
          { label: 'Conventions', path: '/conventions' },
          { label: watchValues.code || '...', path: `/conventions/${id}` },
          { label: 'Modifier' },
        ]}
        actions={
          <>
            <StatusBadge status={metadata.statut} size="small" />
            <Button
              size="small"
              startIcon={<Eye size={14} />}
              onClick={() => navigate(`/conventions/${id}`)}
              sx={{ ...componentStyles.buttonSecondary, textTransform: 'none', fontSize: typography.sizes.sm }}
            >
              Voir
            </Button>
            <Button
              size="small"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => navigate('/conventions')}
              sx={{ ...componentStyles.buttonGhost, textTransform: 'none', fontSize: typography.sizes.sm }}
            >
              Liste
            </Button>
          </>
        }
        hideBottomRow
      />

      <Box sx={{ bgcolor: colors.background, minHeight: 'calc(100vh - 48px)' }}>
        <Box sx={{ display: 'flex', gap: 3, p: 3, maxWidth: 1280, mx: 'auto' }}>
          {/* Main form area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FormView
              isEditing={isEditing}
              onToggleEdit={handleToggleEdit}
              onSave={handleSubmit(handleSave)}
              onCancel={handleCancel}
              isSaving={saving}
              statusSteps={CONVENTION_STATUS_STEPS}
              currentStatus={metadata.statut}
            >
              {/* Validation errors summary */}
              {isEditing && Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Veuillez corriger les erreurs avant d'enregistrer.
                </Alert>
              )}

              {/* General info + description with RichText */}
              <EditGeneralFields
                control={control}
                errors={errors}
                isEditing={isEditing}
                watchValues={watchValues as ConventionEditFormData}
              />

              {/* Tabbed sections */}
              <Notebook
                tabs={[
                  {
                    label: 'Budget & Commission',
                    content: (
                      <>
                        <EditBudgetFields
                          control={control}
                          errors={errors}
                          isEditing={isEditing}
                          watchValues={watchValues as ConventionEditFormData}
                          setValue={setValue}
                        />
                        <EditBudgetLinesSection
                          conventionId={parseInt(id)}
                          isEditing={isEditing}
                        />
                      </>
                    ),
                  },
                  {
                    label: 'Dates & Duree',
                    content: (
                      <EditDatesFields
                        control={control}
                        errors={errors}
                        isEditing={isEditing}
                        watchValues={watchValues as ConventionEditFormData}
                        setValue={setValue}
                        autoDateFin={autoDateFin}
                        onAutoDateFinChange={setAutoDateFin}
                      />
                    ),
                  },
                  {
                    label: 'Partenaires',
                    content: (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 2 }}>
                          Les partenaires se gerent depuis la page de visualisation.
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Eye size={14} />}
                          onClick={() => navigate(`/conventions/${id}`)}
                          sx={{ ...componentStyles.buttonPrimary, textTransform: 'none' }}
                        >
                          Voir la convention
                        </Button>
                      </Box>
                    ),
                  },
                ]}
              />

              {/* Save reminder in edit mode */}
              {isEditing && isDirty && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,
                    bgcolor: colors.warning[50],
                    border: `1px solid ${colors.warning[200]}`,
                    '& .MuiAlert-icon': { color: colors.warning[600] },
                  }}
                >
                  Vous avez des modifications non enregistrees. Cliquez sur "Enregistrer" pour sauvegarder.
                </Alert>
              )}
            </FormView>
          </Box>

          {/* Info sidebar */}
          <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 16 }}>
              <EditInfoPanel
                metadata={metadata}
                budget={watchValues.budget || 0}
                tauxCommission={watchValues.tauxCommission || 0}
                tauxTva={watchValues.tauxTva || 0}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default ConventionEditPageComplete
