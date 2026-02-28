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
import { useAuth } from '@/contexts/AuthContext'
import { ControlPanel, FormView, Notebook, StatusBadge } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { calculateDurationMonths } from '@/utils/dateUtils'
import EditGeneralFields from '@/components/conventions/edit/EditGeneralFields'
import EditBudgetFields from '@/components/conventions/edit/EditBudgetFields'
import EditBudgetLinesSection from '@/components/conventions/edit/EditBudgetLinesSection'
import EditDatesFields from '@/components/conventions/edit/EditDatesFields'
import EditInfoPanel from '@/components/conventions/edit/EditInfoPanel'
import ConventionChatter from '@/components/conventions/edit/ConventionChatter'
import ConventionWorkflowActions from '@/components/conventions/detail/ConventionWorkflowActions'
import {
  conventionEditSchema,
  CONVENTION_STATUS_STEPS,
  normalizeStatut,
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
  valideParNom: string | null
  motifRejet: string | null
  isLocked: boolean
  motifVerrouillage: string | null
  heriteParametres: boolean
  parentConvention: { code: string } | null
  sousConventions: unknown[] | null
  nombreProjets?: number
  nombreMarches?: number
}

const toIsoDate = (val: string | Date | null | undefined): string => {
  if (!val) return ''
  return typeof val === 'string' ? val.split('T')[0] : new Date(val).toISOString().split('T')[0]
}

const ConventionEditPageComplete = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, isAdmin, isManager } = useAuth()

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

      // Fetch stats for related entity counts
      let nombreProjets = data.nombreProjets || 0
      let nombreMarches = data.nombreMarches || 0
      try {
        const statsRes = await conventionsAPI.getStats(conventionId)
        const stats = statsRes.data?.data
        if (stats) {
          nombreProjets = stats.nombreProjets || 0
          nombreMarches = stats.nombreMarches || 0
        }
      } catch {
        // Stats are non-critical
      }

      setMetadata({
        id: data.id,
        statut: normalizeStatut(data.statut),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy || '',
        dateSoumission: data.dateSoumission,
        dateValidation: data.dateValidation,
        valideParNom: data.valideParNom || null,
        motifRejet: data.motifRejet || null,
        parentConventionCode: data.parentConvention?.code || null,
        heriteParametres: data.heriteParametres || false,
        isLocked: data.isLocked || false,
        motifVerrouillage: data.motifVerrouillage || null,
        sousConventionsCount: data.sousConventions?.length || 0,
        nombreProjets,
        nombreMarches,
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

  // BUG-002 fix: Only allow editing BROUILLON or REJETE conventions
  const canEdit = metadata && (
    metadata.statut === 'BROUILLON' || metadata.statut === 'REJETE'
  ) && !metadata.isLocked

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
    if (!canEdit) {
      showToast('Seules les conventions en brouillon peuvent etre modifiees', 'warning')
      return
    }
    setIsEditing(true)
  }

  // Workflow action handlers
  const handleWorkflowSuccess = (message: string) => {
    showToast(message, 'success')
  }
  const handleWorkflowError = (message: string) => {
    showToast(message, 'error')
  }
  const handleWorkflowReload = () => {
    if (id) loadConvention(parseInt(id))
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
              onToggleEdit={canEdit ? handleToggleEdit : undefined}
              onSave={handleSubmit(handleSave)}
              onCancel={handleCancel}
              isSaving={saving}
              statusSteps={CONVENTION_STATUS_STEPS}
              currentStatus={metadata.statut}
              statusBarActions={
                !isEditing ? (
                  <ConventionWorkflowActions
                    conventionId={metadata.id}
                    statut={metadata.statut}
                    userId={user?.id}
                    isAdmin={isAdmin}
                    isManager={isManager}
                    onSuccess={handleWorkflowSuccess}
                    onError={handleWorkflowError}
                    onReload={handleWorkflowReload}
                  />
                ) : undefined
              }
            >
              {/* Non-editable status banner for locked/non-brouillon conventions */}
              {!canEdit && !isEditing && (
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    bgcolor: colors.info[50],
                    border: `1px solid ${colors.info[200]}`,
                    '& .MuiAlert-icon': { color: colors.info[600] },
                  }}
                >
                  {metadata.isLocked
                    ? `Convention verrouillee : ${metadata.motifVerrouillage || 'Modification non autorisee'}`
                    : `Convention en statut "${metadata.statut}" - la modification n'est possible qu'en statut Brouillon ou Rejete.`
                  }
                </Alert>
              )}

              {/* Rejection motif banner */}
              {metadata.statut === 'REJETE' && metadata.motifRejet && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    bgcolor: colors.danger[25],
                    border: `1px solid ${colors.danger[200]}`,
                    '& .MuiAlert-icon': { color: colors.danger[600] },
                  }}
                >
                  <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm, color: colors.danger[700], mb: 0.5 }}>
                    Convention rejetee
                  </Typography>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.danger[600] }}>
                    Motif : &ldquo;{metadata.motifRejet}&rdquo;
                  </Typography>
                </Alert>
              )}

              {/* Validation errors summary */}
              {isEditing && Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Veuillez corriger les erreurs avant d'enregistrer.
                </Alert>
              )}

              {/* General info (now includes dateConvention) */}
              <EditGeneralFields
                control={control}
                errors={errors}
                isEditing={isEditing}
                watchValues={watchValues as ConventionEditFormData}
                parentConventionCode={metadata.parentConventionCode}
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
                          parentConventionCode={metadata.parentConventionCode}
                          heriteParametres={metadata.heriteParametres}
                        />
                        <EditBudgetLinesSection
                          conventionId={parseInt(id)}
                          isEditing={isEditing}
                        />
                      </>
                    ),
                  },
                  {
                    label: 'Planification',
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

            {/* Chatter / Activity log - Odoo style */}
            <Box sx={{ mt: 3 }}>
              <ConventionChatter
                conventionId={parseInt(id)}
                statut={metadata.statut}
                createdBy={metadata.createdBy}
                createdAt={metadata.createdAt}
                dateSoumission={metadata.dateSoumission}
                dateValidation={metadata.dateValidation}
                valideParNom={metadata.valideParNom}
                motifRejet={metadata.motifRejet}
              />
            </Box>
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
