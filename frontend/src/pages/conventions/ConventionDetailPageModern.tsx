import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Button, Alert, Skeleton, Tooltip } from '@mui/material'
import { CalendarMonth } from '@mui/icons-material'
import { Plus, Pencil } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import {
  ControlPanel, FormView, FieldGroup, StatusBadge,
  InlineEditField, EditFieldDialog, Chatter,
  type StatusStep, type InlineEditFieldConfig, type ChatterActivity,
} from '../../components/core'
import RichTextDisplay from '../../components/ui/RichTextDisplay'
import { conventionsAPI } from '../../lib/api'
import {
  ConventionWorkflowActions,
  ConventionRealisationSection,
  ParentConventionBanner,
} from '../../components/conventions/detail'
import ConventionSmartButtons from '../../components/conventions/detail/ConventionSmartButtons'
import ConventionFinancialFlowCard from '../../components/conventions/detail/ConventionFinancialFlowCard'
import ConventionKeyInfoCard from '../../components/conventions/detail/ConventionKeyInfoCard'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import AddPartenaireDialog from '../../components/conventions/AddPartenaireDialog'
import VersementFormDialog from '../../components/conventions/VersementFormDialog'
import type { ConventionDetailEnrichedDTO, UpdateConventionDTO } from '../../types/api'

interface Convention {
  id: number; code: string; numero: string; libelle: string; objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'; statut: string
  tauxCommission: number; baseCalcul: string; budget: number
  dateSignature: string; dateDebut: string; dateFin?: string; tauxTva: number; tauxTvaLignes: number
  parentConventionId?: number | null; parentConventionNumero?: string | null
  heriteParametres?: boolean; commissionMode?: string
}

interface VersementPrevisionnel { id: number; partenaireId?: number; partenaireNom?: string; partenaireSigle?: string; volet?: string; dateVersement: string; montant: number; montantPrevu?: number; remarques?: string }

interface DialogFieldState {
  key: string; label: string; value: string; mode: 'richtext' | 'textarea'
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDEE', label: 'Validee' },
  { value: 'EN_EXECUTION', label: 'En execution' },
  { value: 'ACHEVE', label: 'Acheve' },
]

const normalizeStatut = (statut: string): string => {
  const aliases: Record<string, string> = { VALIDE: 'VALIDEE', EN_COURS: 'EN_EXECUTION' }
  return aliases[statut] || statut
}

const TYPE_OPTIONS = [
  { value: 'CADRE', label: 'Cadre' },
  { value: 'SPECIFIQUE', label: 'Specifique' },
]

const ConventionDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin, isManager } = useAuth()
  const { showSuccess, showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [enrichedData, setEnrichedData] = useState<ConventionDetailEnrichedDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

  // CRUD dialog state
  const [addPartenaireDialogOpen, setAddPartenaireDialogOpen] = useState(false)
  const [editPartenaireData, setEditPartenaireData] = useState<{ id: number; partenaireId: number; partenaireNom: string; budgetAlloue: number; pourcentage: number; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean; remarques?: string } | null>(null)
  const [versementDialogOpen, setVersementDialogOpen] = useState(false)
  const [editingVersement, setEditingVersement] = useState<VersementPrevisionnel | null>(null)
  const [financialRefreshKey, setFinancialRefreshKey] = useState(0)
  const [dialogField, setDialogField] = useState<DialogFieldState | null>(null)
  const [chatterActivities, setChatterActivities] = useState<ChatterActivity[]>([])
  const [chatterLoading, setChatterLoading] = useState(false)

  const refreshFinancialData = useCallback(() => setFinancialRefreshKey(k => k + 1), [])

  const loadChatterActivities = useCallback(async (cid: number) => {
    setChatterLoading(true)
    try {
      const res = await conventionsAPI.getHistorique(cid)
      const modifications = res.data?.data || res.data || []
      const activities: ChatterActivity[] = Array.isArray(modifications)
        ? modifications.map((mod: Record<string, unknown>, idx: number) => ({
            id: (mod.id as number) || idx,
            type: (mod.typeModification === 'STATUS' ? 'workflow' : 'modification') as ChatterActivity['type'],
            date: (mod.dateModification as string) || (mod.createdAt as string) || new Date().toISOString(),
            user: (mod.modifieParNom as string) || 'Systeme',
            userInitials: ((mod.modifieParNom as string) || 'S').substring(0, 2).toUpperCase(),
            title: (mod.typeModification as string) || 'Modification',
            details: (mod.motif as string) || undefined,
            fieldsChanged: Array.isArray(mod.champsModifies) ? (mod.champsModifies as string[]) : undefined,
          }))
        : []
      setChatterActivities(activities)
    } catch {
      setChatterActivities([])
    } finally {
      setChatterLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      const cid = parseInt(id)
      loadConvention(cid)
      loadChatterActivities(cid)
    }
  }, [id, loadChatterActivities])

  const loadConvention = async (cid: number) => {
    try {
      setLoading(true)
      const [res, enrichedRes] = await Promise.all([
        conventionsAPI.getById(cid),
        conventionsAPI.getDetailEnriched(cid).catch(() => null),
      ])
      const raw = res.data.data || res.data
      setConvention({ ...raw, statut: normalizeStatut(raw.statut) })
      if (enrichedRes) setEnrichedData(enrichedRes.data.data || enrichedRes.data || null)
    } catch { setError('Erreur lors du chargement de la convention') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t) } }, [error])

  // Per-field save
  const handleFieldSave = async (fieldKey: string, value: string | number | null) => {
    if (!convention || !id) return
    const payload = {
      libelle: convention.libelle, numero: convention.numero, objet: convention.objet,
      typeConvention: convention.typeConvention, budget: convention.budget,
      tauxCommission: convention.tauxCommission, baseCalcul: convention.baseCalcul,
      tauxTva: convention.tauxTva, tauxTvaLignes: convention.tauxTvaLignes,
      commissionMode: convention.commissionMode || 'GLOBAL',
      dateSignature: convention.dateSignature || undefined,
      dateDebut: convention.dateDebut, dateFin: convention.dateFin || undefined,
      [fieldKey]: value === '' ? undefined : value,
    } as UpdateConventionDTO
    await conventionsAPI.update(parseInt(id), payload)
    await loadConvention(parseInt(id))
    showSuccess('Convention mise a jour')
  }

  const openFieldDialog = (fieldKey: string, value: string) => {
    const labels: Record<string, string> = { objet: 'Objet', libelle: 'Libelle' }
    setDialogField({ key: fieldKey, label: labels[fieldKey] || fieldKey, value, mode: 'richtext' })
  }

  const handleDialogSave = async (fieldKey: string, value: string) => {
    await handleFieldSave(fieldKey, value)
  }

  const field = (config: InlineEditFieldConfig) => (
    <InlineEditField config={config} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
  )

  // Loading state
  if (loading) return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
          <Skeleton variant="text" width={300} height={32} />
        </Box>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Container>
      </Box>
    </AppLayout>
  )

  if (!convention) return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Convention non trouvee'}</Alert>
      </Container>
    </AppLayout>
  )

  const canEdit = convention.statut === 'BROUILLON'

  const effectiveSteps: StatusStep[] = (() => {
    if (convention.statut === 'REJETE') return [
      { value: 'BROUILLON', label: 'Brouillon' }, { value: 'SOUMIS', label: 'Soumis' },
      { value: 'REJETE', label: 'Rejete', variant: 'danger' as const },
    ]
    if (convention.statut === 'ANNULE') return [
      ...STATUS_STEPS.slice(0, 4), { value: 'ANNULE', label: 'Annule', variant: 'danger' as const },
    ]
    return STATUS_STEPS
  })()

  const breadcrumbs = [
    { label: 'Conventions', path: '/conventions' },
    ...(convention.parentConventionId && convention.parentConventionNumero
      ? [{ label: convention.parentConventionNumero, path: `/conventions/${convention.parentConventionId}` }]
      : []),
    { label: convention.code },
  ]

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={breadcrumbs}
          actions={
            <>
              <ConventionWorkflowActions
                conventionId={convention.id} statut={convention.statut} userId={user?.id}
                isAdmin={isAdmin} isManager={isManager}
                onSuccess={(msg: string) => showSuccess(msg)}
                onError={(msg: string) => showError(msg)}
                onReload={() => loadConvention(convention.id)}
              />
              {canEdit && (
                <Tooltip title="Modifier la convention">
                  <Button variant="contained" size="small" onClick={() => navigate(`/conventions/${id}/edit`)}
                    sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.5 }}>
                    <Pencil size={14} style={{ marginRight: 4 }} /> Modifier
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="Ajouter un avenant">
                <Button variant="outlined" size="small" onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                  sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                  <Plus size={14} style={{ marginRight: 4 }} /> Avenant
                </Button>
              </Tooltip>
            </>
          }
          hideBottomRow
        />

        {error && (
          <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
          </Container>
        )}

        <Container maxWidth="xl" sx={{ py: 2 }}>
          <FormView
            isEditing={false}
            statusSteps={effectiveSteps}
            currentStatus={convention.statut}
          >
            {/* Title + Description + Metadata */}
            <Box sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  fontSize: typography.sizes.xl, fontWeight: typography.weights.bold,
                  color: colors.textPrimary, mb: 0.5, cursor: canEdit ? 'pointer' : 'default',
                  borderRadius: '4px', px: 0.5, mx: -0.5,
                  '&:hover': canEdit ? { bgcolor: colors.primary[25] } : {},
                }}
                onClick={canEdit ? () => openFieldDialog('libelle', convention.libelle || '') : undefined}
              >
                <RichTextDisplay html={convention.libelle || convention.code} variant="compact" allowExpand={false} />
              </Box>
              {convention.objet && (
                <Box
                  sx={{
                    mb: 1, cursor: canEdit ? 'pointer' : 'default',
                    borderRadius: '4px', px: 0.5, mx: -0.5,
                    '&:hover': canEdit ? { bgcolor: colors.primary[25] } : {},
                  }}
                  onClick={canEdit ? () => openFieldDialog('objet', convention.objet || '') : undefined}
                >
                  <RichTextDisplay html={convention.objet} variant="compact" collapseLength={200} />
                </Box>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, py: 0.75, borderTop: `1px solid ${colors.borderSubtle}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Code:</Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{convention.code}</Typography>
                </Box>
                <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>N:</Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{convention.numero}</Typography>
                </Box>
                <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                <StatusBadge status={convention.typeConvention} size="small" />
                {convention.dateSignature && (
                  <>
                    <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 13, color: colors.textSecondary }} />
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {new Date(convention.dateSignature).toLocaleDateString('fr-FR')}
                        {convention.dateDebut && ` — ${new Date(convention.dateDebut).toLocaleDateString('fr-FR')}`}
                        {convention.dateFin && ` → ${new Date(convention.dateFin).toLocaleDateString('fr-FR')}`}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* Parent Convention Banner */}
            {convention.parentConventionId && convention.parentConventionNumero && (
              <Box sx={{ mb: 1.5 }}>
                <ParentConventionBanner
                  parentConventionId={convention.parentConventionId}
                  parentConventionNumero={convention.parentConventionNumero}
                  heriteParametres={convention.heriteParametres ?? false}
                />
              </Box>
            )}

            {/* Smart Buttons */}
            {enrichedData && (
              <Box sx={{ mb: 2 }}>
                <ConventionSmartButtons
                  conventionId={convention.id} typeConvention={convention.typeConvention}
                  nombreMarches={enrichedData.nombreMarches} nombreProjets={enrichedData.nombreProjets}
                  nombreSousConventions={enrichedData.nombreSousConventions} nombreAvenants={enrichedData.nombreAvenants}
                  nombrePartenaires={enrichedData.nombrePartenaires} montantTotalMarches={enrichedData.montantTotalMarches}
                  montantTotalProjets={enrichedData.montantTotalProjets} commissionTTC={enrichedData.commissionTTC}
                  tauxRealisation={enrichedData.tauxRealisation}
                />
              </Box>
            )}

            {/* Inline-editable fields */}
            <Box sx={{ mb: 2 }}>
              <FieldGroup title="Informations generales" columns={3}>
                {field({ fieldKey: 'code', label: 'Code', type: 'text', value: convention.code, editable: false })}
                {field({ fieldKey: 'numero', label: 'Numero', type: 'text', value: convention.numero, editable: canEdit })}
                {field({ fieldKey: 'typeConvention', label: 'Type', type: 'select', value: convention.typeConvention, options: TYPE_OPTIONS, displayValue: <StatusBadge status={convention.typeConvention} size="small" />, editable: canEdit })}
              </FieldGroup>
            </Box>

            {/* Convention Key Info Card (editable inline Odoo-style) */}
            <Box sx={{ mb: 2 }}>
              <ConventionKeyInfoCard
                convention={convention} enrichedData={enrichedData}
                canEdit={canEdit} onFieldSave={handleFieldSave}
              />
            </Box>

            {/* Financial Flow */}
            <Box sx={{ mb: 3 }}>
              <ConventionFinancialFlowCard
                conventionId={convention.id} conventionBudget={convention.budget}
                tauxCommission={convention.tauxCommission} tauxTva={convention.tauxTva}
                commissionTTC={enrichedData?.commissionTTC} commissionMode={convention.commissionMode}
                baseCalcul={convention.baseCalcul} canEdit={canEdit} refreshKey={financialRefreshKey}
                onAddPartenaire={() => setAddPartenaireDialogOpen(true)}
                onEditPartenaire={(p) => {
                  setEditPartenaireData({
                    id: p.id, partenaireId: p.partenaireId, partenaireNom: p.partenaireNom,
                    budgetAlloue: p.budgetAlloue, pourcentage: p.pourcentage,
                    estMaitreOeuvre: p.estMaitreOeuvre, estMaitreOeuvreDelegue: p.estMaitreOeuvreDelegue,
                    remarques: p.remarques || undefined,
                  })
                  setAddPartenaireDialogOpen(true)
                }}
                onAddVersement={() => { setEditingVersement(null); setVersementDialogOpen(true) }}
                onRefresh={refreshFinancialData}
              />
            </Box>

            {/* Realisation Section */}
            <ConventionRealisationSection
              convention={convention} canEdit={canEdit}
              onRefresh={refreshFinancialData} refreshKey={financialRefreshKey}
            />

            {/* Chatter - Activity Log (Odoo-style) */}
            <Chatter
              entityType="convention"
              entityId={convention.id}
              activities={chatterActivities}
              loading={chatterLoading}
              onRefresh={() => loadChatterActivities(convention.id)}
            />
          </FormView>
        </Container>
      </Box>

      {/* Dialogs */}
      {convention && (
        <>
          <AddPartenaireDialog open={addPartenaireDialogOpen} conventionId={convention.id} conventionBudget={convention.budget}
            onClose={() => { setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }}
            onSuccess={() => { refreshFinancialData(); setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }}
            editData={editPartenaireData} />
          <VersementFormDialog open={versementDialogOpen} conventionId={convention.id}
            onClose={() => { setVersementDialogOpen(false); setEditingVersement(null) }}
            onSuccess={() => { refreshFinancialData(); setVersementDialogOpen(false); setEditingVersement(null) }}
            editingVersement={editingVersement} />
        </>
      )}
      {dialogField && (
        <EditFieldDialog
          open onClose={() => setDialogField(null)} onSave={handleDialogSave}
          fieldKey={dialogField.key} fieldLabel={dialogField.label}
          currentValue={dialogField.value} mode={dialogField.mode}
        />
      )}
    </AppLayout>
  )
}

export default ConventionDetailPageModern
