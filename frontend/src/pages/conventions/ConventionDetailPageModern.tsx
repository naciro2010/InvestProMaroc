import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Button, Alert, Skeleton, Tooltip, TextField, MenuItem } from '@mui/material'
import { CalendarMonth } from '@mui/icons-material'
import { Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, StatusBadge, type StatusStep } from '../../components/core'
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

interface ConventionEditForm {
  libelle: string; numero: string; objet: string
  typeConvention: string; budget: number
  tauxCommission: number; baseCalcul: string; tauxTva: number
  commissionMode: string
  dateSignature: string; dateDebut: string; dateFin: string
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDEE', label: 'Validee' },
  { value: 'EN_EXECUTION', label: 'En execution' },
  { value: 'ACHEVE', label: 'Acheve' },
]

/** Normalize backend status aliases to the canonical values used in STATUS_STEPS */
const normalizeStatut = (statut: string): string => {
  const aliases: Record<string, string> = { VALIDE: 'VALIDEE', EN_COURS: 'EN_EXECUTION' }
  return aliases[statut] || statut
}

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

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<ConventionEditForm>({
    libelle: '', numero: '', objet: '', typeConvention: 'CADRE',
    budget: 0, tauxCommission: 0, baseCalcul: 'MONTANT_TTC', tauxTva: 20,
    commissionMode: 'GLOBAL', dateSignature: '', dateDebut: '', dateFin: '',
  })

  const refreshFinancialData = useCallback(() => setFinancialRefreshKey(k => k + 1), [])

  const handleToggleEdit = () => {
    if (!convention) return
    setEditForm({
      libelle: convention.libelle || '', numero: convention.numero || '',
      objet: convention.objet || '', typeConvention: convention.typeConvention || 'CADRE',
      budget: convention.budget || 0, tauxCommission: convention.tauxCommission || 0,
      baseCalcul: convention.baseCalcul || 'MONTANT_TTC', tauxTva: convention.tauxTva || 20,
      commissionMode: convention.commissionMode || 'GLOBAL',
      dateSignature: convention.dateSignature || '', dateDebut: convention.dateDebut || '',
      dateFin: convention.dateFin || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!convention || !id) return
    setIsSaving(true)
    try {
      const payload: UpdateConventionDTO = {
        libelle: editForm.libelle, numero: editForm.numero, objet: editForm.objet,
        typeConvention: editForm.typeConvention, budget: editForm.budget,
        tauxCommission: editForm.tauxCommission, baseCalcul: editForm.baseCalcul,
        tauxTva: editForm.tauxTva, commissionMode: editForm.commissionMode,
        dateSignature: editForm.dateSignature || undefined,
        dateDebut: editForm.dateDebut, dateFin: editForm.dateFin || undefined,
      } as UpdateConventionDTO
      await conventionsAPI.update(parseInt(id), payload)
      setIsEditing(false)
      await loadConvention(parseInt(id))
      showSuccess('Convention mise a jour avec succes')
    } catch { showError('Erreur lors de la sauvegarde') }
    finally { setIsSaving(false) }
  }

  const handleCancel = () => setIsEditing(false)

  const ef = (field: keyof ConventionEditForm, value: string | number) =>
    setEditForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => { if (id) loadConvention(parseInt(id)) }, [id])

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

  // Build effective steps: insert REJETE/ANNULE into the pipeline when active
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
        {/* Control Panel */}
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
              {!isEditing && (
                <Tooltip title="Ajouter un avenant">
                  <Button variant="outlined" size="small" onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                    sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                    <Plus size={14} style={{ marginRight: 4 }} /> Avenant
                  </Button>
                </Tooltip>
              )}
            </>
          }
          hideBottomRow
        />

        {error && (
          <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
          </Container>
        )}

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <FormView
            isEditing={isEditing}
            onToggleEdit={canEdit ? handleToggleEdit : undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            statusSteps={effectiveSteps}
            currentStatus={convention.statut}
          >
            {/* Title + Description + Metadata */}
            {isEditing ? (
              <Box sx={{ mb: 2 }}>
                <FieldGroup title="Informations generales" columns={3}>
                  <Field label="Code" value={convention.code} />
                  <Field label="Numero" value={convention.numero} isEditing editContent={
                    <TextField size="small" fullWidth value={editForm.numero} onChange={(e) => ef('numero', e.target.value)} />
                  } />
                  <Field label="Type" value={convention.typeConvention} isEditing editContent={
                    <TextField select size="small" fullWidth value={editForm.typeConvention} onChange={(e) => ef('typeConvention', e.target.value)}>
                      <MenuItem value="CADRE">Cadre</MenuItem>
                      <MenuItem value="SPECIFIQUE">Specifique</MenuItem>
                    </TextField>
                  } />
                  <Field label="Libelle" value={convention.libelle} isEditing fullWidth editContent={
                    <TextField size="small" fullWidth value={editForm.libelle} onChange={(e) => ef('libelle', e.target.value)} />
                  } />
                  <Field label="Objet" value={convention.objet} isEditing fullWidth editContent={
                    <TextField size="small" fullWidth multiline minRows={2} value={editForm.objet} onChange={(e) => ef('objet', e.target.value)} />
                  } />
                </FieldGroup>
                <FieldGroup title="Parametres financiers" columns={4}>
                  <Field label="Budget" value={formatCurrency(convention.budget)} isEditing isMoney editContent={
                    <TextField size="small" fullWidth type="number" value={editForm.budget} onChange={(e) => ef('budget', parseFloat(e.target.value) || 0)} />
                  } />
                  <Field label="Taux commission (%)" value={`${convention.tauxCommission}%`} isEditing editContent={
                    <TextField size="small" fullWidth type="number" inputProps={{ step: 0.01 }} value={editForm.tauxCommission} onChange={(e) => ef('tauxCommission', parseFloat(e.target.value) || 0)} />
                  } />
                  <Field label="Base de calcul" value={convention.baseCalcul} isEditing editContent={
                    <TextField select size="small" fullWidth value={editForm.baseCalcul} onChange={(e) => ef('baseCalcul', e.target.value)}>
                      <MenuItem value="MONTANT_TTC">Montant TTC</MenuItem>
                      <MenuItem value="MONTANT_HT">Montant HT</MenuItem>
                      <MenuItem value="MONTANT_NET">Montant Net</MenuItem>
                    </TextField>
                  } />
                  <Field label="TVA (%)" value={`${convention.tauxTva}%`} isEditing editContent={
                    <TextField size="small" fullWidth type="number" value={editForm.tauxTva} onChange={(e) => ef('tauxTva', parseFloat(e.target.value) || 0)} />
                  } />
                </FieldGroup>
                <FieldGroup title="Dates" columns={3}>
                  <Field label="Date signature" value={convention.dateSignature ? new Date(convention.dateSignature).toLocaleDateString('fr-FR') : '-'} isEditing editContent={
                    <TextField size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={editForm.dateSignature} onChange={(e) => ef('dateSignature', e.target.value)} />
                  } />
                  <Field label="Date debut" value={convention.dateDebut ? new Date(convention.dateDebut).toLocaleDateString('fr-FR') : '-'} isEditing editContent={
                    <TextField size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={editForm.dateDebut} onChange={(e) => ef('dateDebut', e.target.value)} />
                  } />
                  <Field label="Date fin" value={convention.dateFin ? new Date(convention.dateFin).toLocaleDateString('fr-FR') : '-'} isEditing editContent={
                    <TextField size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={editForm.dateFin} onChange={(e) => ef('dateFin', e.target.value)} />
                  } />
                </FieldGroup>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
                    <RichTextDisplay html={convention.libelle || convention.code} variant="compact" allowExpand={false} />
                  </Box>
                  {convention.objet && (
                    <Box sx={{ mb: 1 }}>
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

                {/* Smart Buttons (entity counts) */}
                {enrichedData && (
                  <Box sx={{ mb: 2 }}>
                    <ConventionSmartButtons
                      conventionId={convention.id}
                      typeConvention={convention.typeConvention}
                      nombreMarches={enrichedData.nombreMarches}
                      nombreProjets={enrichedData.nombreProjets}
                      nombreSousConventions={enrichedData.nombreSousConventions}
                      nombreAvenants={enrichedData.nombreAvenants}
                      nombrePartenaires={enrichedData.nombrePartenaires}
                      montantTotalMarches={enrichedData.montantTotalMarches}
                      montantTotalProjets={enrichedData.montantTotalProjets}
                      commissionTTC={enrichedData.commissionTTC}
                      tauxRealisation={enrichedData.tauxRealisation}
                    />
                  </Box>
                )}

                {/* Convention Parameters, Dates & Audit Trail */}
                <Box sx={{ mb: 2 }}>
                  <ConventionKeyInfoCard convention={convention} enrichedData={enrichedData} />
                </Box>
              </>
            )}

            {/* PRIMARY: Financial Flow (Ressources IN / Emplois OUT / Solde) */}
            {!isEditing && (
              <Box sx={{ mb: 3 }}>
                <ConventionFinancialFlowCard
                  conventionId={convention.id}
                  conventionBudget={convention.budget}
                  tauxCommission={convention.tauxCommission}
                  tauxTva={convention.tauxTva}
                  commissionTTC={enrichedData?.commissionTTC}
                  commissionMode={convention.commissionMode}
                  baseCalcul={convention.baseCalcul}
                  canEdit={canEdit}
                  refreshKey={financialRefreshKey}
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
            )}

            {/* SECONDARY: Projects, Marches, Budget lignes, Imputations, Avenants */}
            {!isEditing && (
              <ConventionRealisationSection
                convention={convention}
                canEdit={canEdit}
                onRefresh={refreshFinancialData}
                refreshKey={financialRefreshKey}
              />
            )}
          </FormView>
        </Container>
      </Box>

      {/* Partenaire & Versement Dialogs */}
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
    </AppLayout>
  )
}

export default ConventionDetailPageModern
