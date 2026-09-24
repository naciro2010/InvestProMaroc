import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, Alert, Tooltip, Snackbar, Divider } from '@mui/material'
import { Plus, Pencil, FileDown } from 'lucide-react'
import { useInlineUndo } from '../../hooks/useInlineUndo'
import { exportToPdf } from '../../lib/exportUtils'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import {
  ControlPanel, FieldGroup, StatusBadge, StatusCircuit, Panel,
  InlineEditField, EditFieldDialog, Chatter,
  type StatusStep, type InlineEditFieldConfig, type ChatterActivity,
} from '../../components/core'
import { conventionsAPI } from '../../lib/api'
import {
  ConventionWorkflowActions,
  ConventionRealisationSection,
  ParentConventionBanner,
  ConventionTagsCard,
  ConventionFollowersCard,
  ConventionCommentsCard,
} from '../../components/conventions/detail'
import ConventionSmartButtons from '../../components/conventions/detail/ConventionSmartButtons'
import ConventionSyntheseCard from '../../components/conventions/detail/ConventionSyntheseCard'
import ConventionKeyInfoCard from '../../components/conventions/detail/ConventionKeyInfoCard'
import ConventionAlertBanner from '../../components/conventions/detail/ConventionAlertBanner'

import ConventionScheduledActivities from '../../components/conventions/detail/ConventionScheduledActivities'
import ConventionActionsMenu from '../../components/conventions/detail/ConventionActionsMenu'
import ConventionTimelineCard from '../../components/conventions/detail/ConventionTimelineCard'
import ConventionQuickSummary from '../../components/conventions/detail/ConventionQuickSummary'
import { componentStyles } from '../../lib/designSystem'
import { useTrackRecentRecord } from '../../hooks/useRecentRecords'
import AddPartenaireDialog from '../../components/conventions/AddPartenaireDialog'
import { ConventionDetailSkeleton, ConventionHeaderMetadata } from './detail'
import type { ConventionDetailEnrichedDTO, UpdateConventionDTO } from '../../types/api'

// ==================== TYPES ====================

interface Convention {
  id: number; code: string; numero: string; libelle: string; objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'; statut: string
  tauxCommission: number; baseCalcul: string; budget: number
  dateSignature: string; dateDebut: string; dateFin?: string; tauxTva: number; tauxTvaLignes: number
  parentConventionId?: number | null; parentConventionNumero?: string | null
  heriteParametres?: boolean; commissionMode?: string
  priorite?: string; responsableNom?: string
}

interface DialogFieldState { key: string; label: string; value: string; mode: 'richtext' | 'textarea' }

interface PartenaireEditData { id: number; partenaireId: number; partenaireNom: string; budgetAlloue: number; pourcentage: number; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean; remarques?: string }

// ==================== CONSTANTS ====================

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDEE', label: 'Validée' },
  { value: 'EN_EXECUTION', label: 'En exécution' },
  { value: 'ACHEVE', label: 'Achevé' },
]

const normalizeStatut = (statut: string): string => {
  const aliases: Record<string, string> = { VALIDE: 'VALIDEE', EN_COURS: 'EN_EXECUTION' }
  return aliases[statut] || statut
}

const TYPE_OPTIONS = [
  { value: 'CADRE', label: 'Cadre' },
  { value: 'SPECIFIQUE', label: 'Specifique' },
]

// ==================== MAIN COMPONENT ====================

const ConventionDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin, isManager } = useAuth()
  const { showSuccess, showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [enrichedData, setEnrichedData] = useState<ConventionDetailEnrichedDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [addPartenaireDialogOpen, setAddPartenaireDialogOpen] = useState(false)
  const [editPartenaireData, setEditPartenaireData] = useState<PartenaireEditData | null>(null)
  const [financialRefreshKey, setFinancialRefreshKey] = useState(0)
  const [dialogField, setDialogField] = useState<DialogFieldState | null>(null)
  const [chatterActivities, setChatterActivities] = useState<ChatterActivity[]>([])
  const [chatterLoading, setChatterLoading] = useState(false)

  const { isUndoAvailable, fieldName: undoFieldName, undo: handleUndo, trackChange } = useInlineUndo({
    onUndo: async (fieldName, previousValue) => {
      if (!convention || !id) return
      await handleFieldSave(fieldName, previousValue as string | number | null)
      showSuccess('Modification annulée')
    },
  })

  const refreshFinancialData = useCallback(() => setFinancialRefreshKey((k: number) => k + 1), [])

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
    } catch { setChatterActivities([]) }
    finally { setChatterLoading(false) }
  }, [])

  useEffect(() => {
    if (id) { const cid = parseInt(id); loadConvention(cid); loadChatterActivities(cid) }
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

  // Reload enriched data (sidebar summary) whenever financial data changes
  useEffect(() => {
    if (financialRefreshKey > 0 && id) {
      const cid = parseInt(id)
      Promise.all([
        conventionsAPI.getById(cid),
        conventionsAPI.getDetailEnriched(cid).catch(() => null),
      ]).then(([res, enrichedRes]) => {
        const raw = res.data.data || res.data
        setConvention((prev: Convention | null) => prev ? { ...prev, ...raw, statut: normalizeStatut(raw.statut) } : null)
        if (enrichedRes) setEnrichedData(enrichedRes.data.data || enrichedRes.data || null)
      }).catch(() => { /* silent refresh failure */ })
    }
  }, [financialRefreshKey, id])

  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t) } }, [error])

  const handleFieldSave = async (fieldKey: string, value: string | number | null) => {
    if (!convention || !id) return
    const previousValue = (convention as unknown as Record<string, unknown>)[fieldKey]
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
    trackChange(fieldKey, previousValue, value)
    showSuccess('Convention mise a jour')
  }

  const handlePriorityChange = async (priority: string) => {
    if (!convention || !id) return
    try {
      await handleFieldSave('priorite', priority)
    } catch { showError('Erreur lors du changement de priorite') }
  }

  const openFieldDialog = (fieldKey: string, value: string) => {
    const labels: Record<string, string> = { objet: 'Objet', libelle: 'Libelle' }
    setDialogField({ key: fieldKey, label: labels[fieldKey] || fieldKey, value, mode: 'richtext' })
  }

  const field = (config: InlineEditFieldConfig) => (
    <InlineEditField config={config} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
  )

  // « Consultés récemment » dans le menu
  useTrackRecentRecord(convention ? {
    key: `convention-${convention.id}`, type: 'convention', code: convention.code,
    label: convention.libelle?.replace(/<[^>]+>/g, '') ?? '', path: `/conventions/${convention.id}`,
  } : null)

  if (loading) return <ConventionDetailSkeleton />

  if (!convention) return (
    <AppLayout>
      <Alert severity="error">{error || 'Convention non trouvée'}</Alert>
    </AppLayout>
  )

  const canEdit = convention.statut === 'BROUILLON'

  const effectiveSteps: StatusStep[] = (() => {
    if (convention.statut === 'REJETE') return [
      { value: 'BROUILLON', label: 'Brouillon' }, { value: 'SOUMIS', label: 'Soumis' },
      { value: 'REJETE', label: 'Rejeté', variant: 'danger' as const },
    ]
    if (convention.statut === 'ANNULE') return [
      ...STATUS_STEPS.slice(0, 4), { value: 'ANNULE', label: 'Annulé', variant: 'danger' as const },
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

  const PRIORITY_LABELS: Record<string, string> = { BASSE: 'basse', NORMALE: 'normale', HAUTE: 'haute', CRITIQUE: 'critique' }
  const headerFacts = [
    convention.responsableNom && `Responsable ${convention.responsableNom}`,
    convention.priorite && `priorité ${PRIORITY_LABELS[convention.priorite] ?? convention.priorite.toLowerCase()}`,
  ].filter(Boolean).join(' · ')

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={breadcrumbs}
        overline={
          <>
            <span>{convention.code}{convention.numero ? ` · ${convention.numero}` : ''}</span>
            <StatusBadge status={convention.statut} />
            <StatusBadge status={convention.typeConvention} />
          </>
        }
        title={<Box component="span" sx={{ display: 'block' }}>{convention.libelle?.replace(/<[^>]+>/g, '') || convention.code}</Box>}
        subtitle={headerFacts || undefined}
        actions={
          <>
            <ConventionWorkflowActions
              conventionId={convention.id} statut={convention.statut} userId={user?.id}
              isAdmin={isAdmin} isManager={isManager}
              onSuccess={(msg: string) => showSuccess(msg)}
              onError={(msg: string) => showError(msg)}
              onReload={() => loadConvention(convention.id)}
            />
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            {canEdit && (
              <Tooltip title="Modifier la convention">
                <Button variant="outlined" onClick={() => navigate(`/conventions/${id}/edit`)} sx={componentStyles.buttonSecondary}>
                  <Pencil size={14} style={{ marginRight: 6 }} /> Modifier
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Ajouter un avenant">
              <Button variant="outlined" onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)} sx={componentStyles.buttonSecondary}>
                <Plus size={14} style={{ marginRight: 6 }} /> Avenant
              </Button>
            </Tooltip>
            <Tooltip title="Exporter en PDF">
              <Button variant="outlined" onClick={() => exportToPdf({
                title: `Convention ${convention.code}`,
                subtitle: convention.libelle,
                filename: `convention-${convention.code}.pdf`,
              })} sx={componentStyles.buttonSecondary}>
                <FileDown size={14} style={{ marginRight: 6 }} /> PDF
              </Button>
            </Tooltip>
            <ConventionActionsMenu convention={convention} onReload={() => loadConvention(convention.id)} />
          </>
        }
        hideBottomRow
      />

      <Box sx={{ mb: 2.5 }}>
        <StatusCircuit steps={effectiveSteps} currentStatus={convention.statut} />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Fiche : colonne principale + colonne de synthèse (300px, collée au-dessus de 1240px) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' }, gap: 2.5, alignItems: 'start' }}>

        {/* ═══════ COLONNE PRINCIPALE ═══════ */}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Bandeaux contextuels */}
          <ConventionAlertBanner convention={convention} enrichedData={enrichedData} refreshKey={financialRefreshKey} />
          {convention.parentConventionId && convention.parentConventionNumero && (
            <ParentConventionBanner
              parentConventionId={convention.parentConventionId}
              parentConventionNumero={convention.parentConventionNumero}
              heriteParametres={convention.heriteParametres ?? false}
            />
          )}

          {/* Boutons compteurs */}
          {enrichedData && (
            <ConventionSmartButtons
              conventionId={convention.id} typeConvention={convention.typeConvention}
              nombreMarches={enrichedData.nombreMarches} nombreProjets={enrichedData.nombreProjets}
              nombreSousConventions={enrichedData.nombreSousConventions} nombreAvenants={enrichedData.nombreAvenants}
              nombrePartenaires={enrichedData.nombrePartenaires} montantTotalMarches={enrichedData.montantTotalMarches}
              montantTotalProjets={enrichedData.montantTotalProjets} commissionTTC={enrichedData.commissionTTC}
              tauxRealisation={enrichedData.tauxRealisation}
            />
          )}

          {/* Panneau à onglets : partenaires, subventions, versements, lignes, projets, marchés… */}
          <ConventionRealisationSection
            key={convention.id}
            convention={convention} canEdit
            enrichedData={enrichedData}
            onRefresh={refreshFinancialData} refreshKey={financialRefreshKey}
            onAddPartenaire={() => { setEditPartenaireData(null); setAddPartenaireDialogOpen(true) }}
            onEditPartenaire={(p) => {
              setEditPartenaireData({
                id: p.id, partenaireId: p.partenaireId, partenaireNom: p.partenaireNom,
                budgetAlloue: p.budgetAlloue, pourcentage: p.pourcentage,
                estMaitreOeuvre: p.estMaitreOeuvre, estMaitreOeuvreDelegue: p.estMaitreOeuvreDelegue,
                remarques: p.remarques || undefined,
              })
              setAddPartenaireDialogOpen(true)
            }}
          />

          {/* Informations : objet, priorité, étiquettes, abonnés, paramètres (édition en ligne) */}
          <Panel title="Informations" aside={canEdit ? 'modifiables' : 'verrouillées'}>
            <ConventionHeaderMetadata
              code={convention.code} numero={convention.numero}
              libelle={convention.libelle} objet={convention.objet}
              typeConvention={convention.typeConvention}
              dateSignature={convention.dateSignature} dateDebut={convention.dateDebut} dateFin={convention.dateFin}
              canEdit={canEdit} onEditField={openFieldDialog}
              priorite={convention.priorite}
              responsable={convention.responsableNom}
              onPriorityChange={handlePriorityChange}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <ConventionTagsCard conventionId={convention.id} canEdit={canEdit} />
              <ConventionFollowersCard conventionId={convention.id} />
            </Box>
            <ConventionKeyInfoCard convention={convention} enrichedData={enrichedData} canEdit={canEdit} onFieldSave={handleFieldSave} />
          </Panel>

          {/* Discussion et historique */}
          <Panel title="Discussion et historique">
            <ConventionCommentsCard conventionId={convention.id} />
            <Chatter
              entityType="convention" entityId={convention.id}
              activities={chatterActivities} loading={chatterLoading}
              onRefresh={() => loadChatterActivities(convention.id)}
            />
          </Panel>
        </Box>

        {/* ═══════ COLONNE DE SYNTHÈSE ═══════ */}
        <Box sx={{
          minWidth: 0,
          display: 'flex', flexDirection: 'column', gap: 2,
          position: { lg: 'sticky' }, top: { lg: 'calc(var(--app-header-h, 0px) + 20px)' },
        }}>
          <ConventionSyntheseCard
            conventionId={convention.id}
            conventionBudget={convention.budget}
            tauxCommission={convention.tauxCommission}
            tauxTva={convention.tauxTva}
            commissionTTC={enrichedData?.commissionTTC}
            commissionMode={convention.commissionMode}
            baseCalcul={convention.baseCalcul}
            refreshKey={financialRefreshKey}
          />
          <ConventionQuickSummary convention={convention} enrichedData={enrichedData} />
          <ConventionTimelineCard convention={convention} enrichedData={enrichedData} />
          <ConventionScheduledActivities conventionId={convention.id} />
        </Box>
      </Box>

      {convention && (
        <AddPartenaireDialog open={addPartenaireDialogOpen} conventionId={convention.id} conventionBudget={convention.budget}
          onClose={() => { setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }}
          onSuccess={() => { refreshFinancialData(); setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }}
          editData={editPartenaireData} />
      )}
      {dialogField && (
        <EditFieldDialog
          open onClose={() => setDialogField(null)} onSave={handleFieldSave}
          fieldKey={dialogField.key} fieldLabel={dialogField.label}
          currentValue={dialogField.value} mode={dialogField.mode}
        />
      )}
      <Snackbar
        open={isUndoAvailable}
        message={`Champ "${undoFieldName}" modifié`}
        action={
          <Button color="inherit" size="small" onClick={handleUndo} sx={{ fontWeight: 600 }}>
            Annuler
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </AppLayout>
  )
}

export default ConventionDetailPageModern
