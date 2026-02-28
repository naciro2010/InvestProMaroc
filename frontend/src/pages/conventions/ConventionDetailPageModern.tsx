import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Skeleton,
  Tooltip,
} from '@mui/material'
import { Lock, CalendarMonth } from '@mui/icons-material'
import { Plus, Pencil } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, FormView, StatusBadge } from '../../components/core'
import type { StatusStep } from '../../components/core'
import RichTextDisplay from '../../components/ui/RichTextDisplay'
import { conventionsAPI, versementsPrevisionnelsAPI } from '../../lib/api'
import {
  ConventionWorkflowActions,
  ConventionPrevisionnelSection,
  ConventionRealisationSection,
  ParentConventionBanner,
  ConventionSummaryTable,
} from '../../components/conventions/detail'
import ConventionSmartButtons from '../../components/conventions/detail/ConventionSmartButtons'
import ConventionTraceabilityCard from '../../components/conventions/detail/ConventionTraceabilityCard'
import ConventionCalculationBreakdown from '../../components/conventions/detail/ConventionCalculationBreakdown'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import AddPartenaireDialog from '../../components/conventions/AddPartenaireDialog'
import VersementFormDialog from '../../components/conventions/VersementFormDialog'
import type { ConventionDetailEnrichedDTO } from '../../types/api'

interface Convention {
  id: number; code: string; numero: string; libelle: string; objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'; statut: string
  tauxCommission: number; baseCalcul: string; budget: number
  dateSignature: string; dateDebut: string; dateFin?: string; tauxTva: number; tauxTvaLignes: number
  parentConventionId?: number | null; parentConventionNumero?: string | null
  heriteParametres?: boolean; commissionMode?: string
}

interface VersementPrevisionnel { id: number; partenaireId?: number; partenaireNom?: string; partenaireSigle?: string; volet?: string; dateVersement: string; montant: number; montantPrevu?: number; remarques?: string }

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

  // Convention + versements (shared between PrevisionnelSection sub-components)
  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [enrichedData, setEnrichedData] = useState<ConventionDetailEnrichedDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Partenaire & Versement dialog state
  const [addPartenaireDialogOpen, setAddPartenaireDialogOpen] = useState(false)
  const [editPartenaireData, setEditPartenaireData] = useState<{ id: number; partenaireId: number; partenaireNom: string; budgetAlloue: number; pourcentage: number; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean; remarques?: string } | null>(null)
  const [partenairesRefreshKey, setPartenairesRefreshKey] = useState(0)
  const [versementDialogOpen, setVersementDialogOpen] = useState(false)
  const [editingVersement, setEditingVersement] = useState<VersementPrevisionnel | null>(null)

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
      if (enrichedRes) {
        setEnrichedData(enrichedRes.data.data || enrichedRes.data || null)
      }
      loadVersements(cid)
    } catch { setError('Erreur lors du chargement de la convention') }
    finally { setLoading(false) }
  }

  const loadVersements = async (cid: number) => {
    try { const r = await versementsPrevisionnelsAPI.getByConvention(cid); setVersements(r.data.data || r.data || []) }
    catch { setVersements([]) }
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
              <Tooltip title="Ajouter un avenant">
                <Button variant="outlined" size="small" onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                  sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                  <Plus size={14} style={{ marginRight: 4 }} /> Avenant
                </Button>
              </Tooltip>
              <Tooltip title={!canEdit ? 'Statut BROUILLON requis' : 'Modifier'}>
                <span>
                  <Button variant="outlined" size="small" disabled={!canEdit} onClick={() => navigate(`/conventions/${id}/edit`)}
                    sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                    {canEdit ? <Pencil size={14} style={{ marginRight: 4 }} /> : <Lock sx={{ fontSize: 14, mr: 0.5 }} />}
                    Modifier
                  </Button>
                </span>
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

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <FormView
            isEditing={false}
            onToggleEdit={canEdit ? () => navigate(`/conventions/${id}/edit`) : undefined}
            statusSteps={effectiveSteps}
            currentStatus={convention.statut}
          >
            {/* Title + Metadata Header + Traceability (2-column layout) */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              {/* Left: Title + Description + Metadata */}
              <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
                <Box sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
                  <RichTextDisplay html={convention.libelle || convention.code} variant="compact" allowExpand={false} />
                </Box>

                {convention.objet && (
                  <Box sx={{ mb: 1.5 }}>
                    <RichTextDisplay html={convention.objet} variant="compact" collapseLength={200} />
                  </Box>
                )}

                {/* Compact metadata: code, numero, type, dates */}
                <Box sx={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5,
                  py: 1, borderTop: `1px solid ${colors.borderSubtle}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Code:</Typography>
                    <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{convention.code}</Typography>
                  </Box>
                  <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>N°:</Typography>
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

              {/* Right: Traceability Card (audit, parameters, source) */}
              <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 400 } }}>
                <ConventionTraceabilityCard
                  createdByNom={enrichedData?.createdByNom ?? undefined}
                  createdAt={enrichedData?.createdAt ?? undefined}
                  valideParNom={enrichedData?.valideParNom ?? undefined}
                  dateValidation={enrichedData?.dateValidation ?? undefined}
                  dateSoumission={enrichedData?.dateSoumission ?? undefined}
                  updatedAt={enrichedData?.updatedAt ?? undefined}
                  version={enrichedData?.version ?? undefined}
                  isLocked={enrichedData?.isLocked}
                  motifRejet={enrichedData?.motifRejet ?? undefined}
                  tauxCommission={convention.tauxCommission}
                  tauxCommissionEffectif={enrichedData?.tauxCommissionEffectif}
                  baseCalcul={convention.baseCalcul}
                  baseCalculEffective={enrichedData?.baseCalculEffective}
                  tauxTva={convention.tauxTva}
                  tauxTvaLignes={convention.tauxTvaLignes}
                  heriteParametres={convention.heriteParametres}
                  parentConventionNumero={convention.parentConventionNumero ?? undefined}
                  parentConventionId={convention.parentConventionId ?? undefined}
                  dureeJours={enrichedData?.dureeJours ?? undefined}
                  estActive={enrichedData?.estActive}
                  dateDebut={convention.dateDebut}
                  dateFin={convention.dateFin}
                />
              </Box>
            </Box>

            {/* Parent Convention Banner */}
            {convention.parentConventionId && convention.parentConventionNumero && (
              <Box sx={{ mb: 2 }}>
                <ParentConventionBanner
                  parentConventionId={convention.parentConventionId}
                  parentConventionNumero={convention.parentConventionNumero}
                  heriteParametres={convention.heriteParametres ?? false}
                />
              </Box>
            )}

            {/* Smart Buttons (Odoo-style related entity counts) */}
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
                  commissionEstimee={enrichedData.commissionEstimee}
                  montantTotalMarches={enrichedData.montantTotalMarches}
                  tauxRealisation={enrichedData.tauxRealisation}
                />
              </Box>
            )}

            {/* Calculation Breakdown (collapsible, shows commission formula step-by-step) */}
            <Box sx={{ mb: 2 }}>
              <ConventionCalculationBreakdown
                budget={convention.budget}
                tauxCommission={convention.tauxCommission}
                tauxCommissionEffectif={enrichedData?.tauxCommissionEffectif}
                tauxTva={convention.tauxTva}
                baseCalcul={convention.baseCalcul}
                montantTotalMarches={enrichedData?.montantTotalMarches ?? 0}
                tauxRealisation={enrichedData?.tauxRealisation ?? 0}
                heriteParametres={convention.heriteParametres}
                parentConventionNumero={convention.parentConventionNumero ?? undefined}
              />
            </Box>

            {/* 1. Financial Summary (highest priority - Odoo-style KPI table) */}
            <Box sx={{ mb: 3 }}>
              <ConventionSummaryTable
                conventionId={convention.id}
                conventionBudget={convention.budget}
                tauxCommission={convention.tauxCommission}
                tauxTva={convention.tauxTva}
                baseCalcul={convention.baseCalcul}
                commissionMode={convention.commissionMode}
              />
            </Box>

            {/* 2. Convention Info & Planning (partenaires, versements, imputations, budget lines, subventions) */}
            <ConventionPrevisionnelSection
              convention={convention}
              canEdit={canEdit}
              partenairesRefreshKey={partenairesRefreshKey}
              versements={versements}
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
              onEditVersement={(v) => { setEditingVersement(v); setVersementDialogOpen(true) }}
              onDeleteVersement={async (vid) => {
                if (!window.confirm('Supprimer ce versement previsionnel ?')) return
                try { await versementsPrevisionnelsAPI.delete(vid); showSuccess('Versement supprime'); loadVersements(convention.id) }
                catch { showError('Erreur lors de la suppression') }
              }}
              onRefresh={() => loadConvention(convention.id)}
            />

            {/* 3. Projects, Marches, Sous-conventions, Avenants (self-contained) */}
            <ConventionRealisationSection convention={convention} />
          </FormView>
        </Container>
      </Box>

      {/* Partenaire & Versement Dialogs */}
      {convention && (
        <>
          <AddPartenaireDialog open={addPartenaireDialogOpen} conventionId={convention.id} conventionBudget={convention.budget} onClose={() => { setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }} onSuccess={() => { setPartenairesRefreshKey((k: number) => k + 1); setEditPartenaireData(null); loadVersements(convention.id) }} editData={editPartenaireData} />
          <VersementFormDialog open={versementDialogOpen} conventionId={convention.id} onClose={() => { setVersementDialogOpen(false); setEditingVersement(null) }} onSuccess={() => loadVersements(convention.id)} editingVersement={editingVersement} />
        </>
      )}
    </AppLayout>
  )
}

export default ConventionDetailPageModern
