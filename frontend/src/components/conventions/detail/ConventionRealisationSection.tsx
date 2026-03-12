import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { ListAlt } from '@mui/icons-material'
import { StatusBadge, InlineTable, Notebook, ResizableSection, ConfirmDialog } from '@/components/core'
import ConventionAvenantsTab from './ConventionAvenantsTab'
import { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'
import ConventionBudgetDistributionCard from './ConventionBudgetDistributionCard'
import ConventionSubventionsCard from './ConventionSubventionsCard'
import ConventionPartenairesCard from './ConventionPartenairesCard'
import ConventionImputationsCard from './ConventionImputationsCard'
import LinkProjetDialog from '../LinkProjetDialog'
import LinkMarcheDialog from '../LinkMarcheDialog'
import SousConventionFormSimple from '@/pages/conventions/SousConventionFormSimple'
import { api, conventionsAPI, avenantConventionsAPI, projetConventionsAPI, marchesAPI, subventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'
import type { SousConvention, Avenant, Projet, Marche } from './types'
import type { ConventionBudgetLigneDTO } from '@/types/api'

// ──── Types ────

interface ConventionBase {
  id: number; numero: string; libelle: string; dateSignature: string; dateDebut: string; dateFin?: string; budget: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'; tauxCommission: number; baseCalcul: string; tauxTva: number
  parentConventionId?: number | null
}

interface ProjetAssociation {
  projetId: number; projetCode: string; projetNom: string; projetBudgetTotal: number; projetStatut: string
}

interface CoherenceMetrics {
  totalBudgetLignes: number
  totalPartenaires: number
  totalSubventions: number
  totalProjets: number
  totalMarches: number
  totalDecomptes: number
  totalPaiements: number
}

interface ConventionRealisationSectionProps {
  convention: ConventionBase
  canEdit?: boolean
  onRefresh?: () => void
  refreshKey?: number
  onAddPartenaire?: () => void
  onEditPartenaire?: (partenaire: PartenaireEditRef) => void
}

interface PartenaireEditRef {
  id: number; partenaireId: number; partenaireCode: string; partenaireNom: string
  partenaireSigle: string | null; budgetAlloue: number; pourcentage: number
  commissionIntervention: number | null; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

// ──── Helpers ────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

const toAmount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const getStatusColor = (statut: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (!statut) return 'default'
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    BROUILLON: 'default', SOUMIS: 'info', VALIDEE: 'success', VALIDE: 'success',
    EN_COURS: 'primary', EN_EXECUTION: 'primary', ACHEVE: 'secondary', TERMINE: 'secondary',
    REJETE: 'error', ANNULE: 'error',
  }
  return map[statut.toUpperCase()] || 'default'
}

const statusChip = (isOk: boolean, message: string) => (
  <Box sx={{
    display: 'inline-flex', px: 1.5, py: 0.25, borderRadius: '4px',
    bgcolor: isOk ? colors.success[50] : colors.warning[50],
    color: isOk ? colors.success[700] : colors.warning[700],
    border: `1px solid ${isOk ? colors.success[200] : colors.warning[200]}`,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.xs,
  }}>
    {message}
  </Box>
)

// ──── Main Component ────

const ConventionRealisationSection = ({
  convention, canEdit = false, onRefresh, refreshKey,
  onAddPartenaire, onEditPartenaire,
}: ConventionRealisationSectionProps) => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [avenants, setAvenants] = useState<Avenant[]>([])
  const [metrics, setMetrics] = useState<CoherenceMetrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  const [linkProjetOpen, setLinkProjetOpen] = useState(false)
  const [linkMarcheOpen, setLinkMarcheOpen] = useState(false)
  const [scDialogOpen, setScDialogOpen] = useState(false)
  const [editingSc, setEditingSc] = useState<SousConvention | null>(null)
  const [confirmState, setConfirmState] = useState<{ open: boolean; type: 'unlinkProjet' | 'unlinkMarche' | null; id: number | null }>({ open: false, type: null, id: null })

  useEffect(() => {
    loadAvenants()
    loadSousConventions()
    loadProjets()
    loadMarches()
    loadCoherenceMetrics()
  }, [convention.id, refreshKey])

  const loadAvenants = async () => { try { const r = await avenantConventionsAPI.getByConvention(convention.id); setAvenants(r.data.data || r.data || []) } catch { setAvenants([]) } }
  const loadSousConventions = async () => { try { const r = await conventionsAPI.getSousConventions(convention.id); setSousConventions(r.data.data || []) } catch { /* ignored */ } }
  const loadProjets = async () => {
    try {
      const r = await projetConventionsAPI.getByConvention(convention.id)
      const assocs: ProjetAssociation[] = r.data.data || r.data || []
      setProjets(assocs.map(a => ({ id: a.projetId, code: a.projetCode, designation: a.projetNom, budgetTotal: a.projetBudgetTotal, statut: a.projetStatut })))
    } catch { setProjets([]) }
  }
  const loadMarches = async () => { try { const r = await api.get(`/marches/convention/${convention.id}`); setMarches(r.data.data || r.data || []) } catch { setMarches([]) } }

  const loadCoherenceMetrics = async () => {
    try {
      setLoadingMetrics(true)
      const [partRes, subRes, blRes, projRes, marchRes] = await Promise.all([
        conventionsAPI.getPartenaires(convention.id).catch(() => ({ data: { data: [] } })),
        subventionsAPI.getByConvention(convention.id).catch(() => ({ data: { data: [] } })),
        conventionsAPI.getBudgetLignes(convention.id).catch(() => ({ data: { data: [] } })),
        projetConventionsAPI.getByConvention(convention.id).catch(() => ({ data: { data: [] } })),
        marchesAPI.getByConvention(convention.id).catch(() => ({ data: { data: [] } })),
      ])

      const partenaires = (partRes.data.data || partRes.data || []) as Array<{ budgetAlloue?: number }>
      const subventions = (subRes.data.data || subRes.data || []) as Array<{ montantTotal?: number; tauxChange?: number }>
      const budgetLignes = (blRes.data.data || blRes.data || []) as ConventionBudgetLigneDTO[]
      const projetAssocs = (projRes.data.data || projRes.data || []) as ProjetAssociation[]
      const marchesList = (marchRes.data.data || marchRes.data || []) as Array<{ id: number; montantTtc?: number }>

      const totalPartenaires = partenaires.reduce((acc, p) => acc + toAmount(p.budgetAlloue), 0)
      const totalSubventions = subventions.reduce((acc, s) => acc + toAmount(s.montantTotal) * (toAmount(s.tauxChange) || 1), 0)
      const totalBudgetLignes = budgetLignes.reduce((acc, l) => acc + toAmount(l.montant), 0)
      const totalProjets = projetAssocs.reduce((acc, p) => acc + toAmount(p.projetBudgetTotal), 0)
      const totalMarches = marchesList.reduce((acc, m) => acc + toAmount(m.montantTtc), 0)

      const perMarche = await Promise.all(marchesList.map(async (m) => {
        const [decompteRes, paiementRes] = await Promise.all([
          marchesAPI.getDecomptes(m.id).catch(() => ({ data: { data: [] } })),
          marchesAPI.getPaiements(m.id).catch(() => ({ data: { data: [] } })),
        ])
        const decomptes = (decompteRes.data.data || decompteRes.data || []) as Array<{ netAPayer?: number; montantTtc?: number; montant?: number }>
        const paiements = (paiementRes.data.data || paiementRes.data || []) as Array<{ montantPaye?: number; montant?: number }>
        const decompteTotal = decomptes.reduce((acc, d) => acc + toAmount(d.netAPayer ?? d.montantTtc ?? d.montant), 0)
        const paiementTotal = paiements.reduce((acc, p) => acc + toAmount(p.montantPaye ?? p.montant), 0)
        return { decompteTotal, paiementTotal }
      }))

      setMetrics({
        totalBudgetLignes, totalPartenaires, totalSubventions, totalProjets, totalMarches,
        totalDecomptes: perMarche.reduce((acc, m) => acc + m.decompteTotal, 0),
        totalPaiements: perMarche.reduce((acc, m) => acc + m.paiementTotal, 0),
      })
    } catch { setMetrics(null) }
    finally { setLoadingMetrics(false) }
  }

  const handleConfirm = async () => {
    if (!confirmState.id || !confirmState.type) return
    try {
      if (confirmState.type === 'unlinkProjet') { await conventionsAPI.unlinkProjet(confirmState.id, convention.id); showSuccess('Projet delie'); loadProjets() }
      else { await conventionsAPI.unlinkMarche(convention.id, confirmState.id); showSuccess('Marche delie'); loadMarches() }
      loadCoherenceMetrics()
    } catch { showError('Erreur lors de l\'operation') }
    finally { setConfirmState({ open: false, type: null, id: null }) }
  }

  const refreshAll = () => {
    loadCoherenceMetrics()
    onRefresh?.()
  }

  const confirmProps = confirmState.type === 'unlinkProjet'
    ? { title: 'Delier le projet', message: 'Voulez-vous delier ce projet ?', variant: 'warning' as const, confirmLabel: 'Delier' }
    : confirmState.type === 'unlinkMarche'
      ? { title: 'Delier le marche', message: 'Voulez-vous delier ce marche ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      : { title: '', message: '', variant: 'info' as const, confirmLabel: 'Confirmer' }

  const budgetEcart = metrics ? convention.budget - metrics.totalBudgetLignes : 0
  const partenairesEcart = metrics ? convention.budget - metrics.totalPartenaires : 0
  const executionEcart = metrics ? metrics.totalMarches - metrics.totalDecomptes : 0
  const paiementEcart = metrics ? metrics.totalDecomptes - metrics.totalPaiements : 0

  return (
    <>
      <ResizableSection
        title="Projets, marches, budget et details"
        storageKey="conv-real-notebook"
        icon={<ListAlt sx={{ color: colors.success[500], fontSize: 16 }} />}
        noPadding
      >
        <Box sx={{ px: { xs: 1, md: 2 }, pt: 1.5, pb: 1 }}>
          {/* Dates clés */}
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
            {[
              { label: 'Date signature', value: convention.dateSignature, color: colors.primary[600] },
              { label: 'Date debut', value: convention.dateDebut, color: colors.info[600] },
              { label: 'Date fin prevue', value: convention.dateFin, color: convention.dateFin && new Date(convention.dateFin) < new Date() ? colors.danger[600] : colors.success[600] },
            ].map((d, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, bgcolor: colors.neutral[50], borderRadius: '6px', border: `1px solid ${colors.borderSubtle}` }}>
                <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: typography.weights.semibold }}>{d.label}</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: d.color, fontVariantNumeric: 'tabular-nums' }}>
                  {d.value ? formatDate(d.value) : '—'}
                </Typography>
              </Box>
            ))}
            {convention.dateDebut && convention.dateFin && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, bgcolor: colors.purple[25], borderRadius: '6px', border: `1px solid ${colors.purple[100]}` }}>
                <Typography sx={{ fontSize: '10px', color: colors.purple[600], textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: typography.weights.semibold }}>Duree</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.purple[700] }}>
                  {Math.ceil((new Date(convention.dateFin).getTime() - new Date(convention.dateDebut).getTime()) / (1000 * 60 * 60 * 24))} jours
                </Typography>
              </Box>
            )}
          </Box>

          {/* Coherence table */}
          <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: '8px', bgcolor: colors.surface, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${colors.borderSubtle}`, bgcolor: colors.info[25], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.info[700] }}>
                Tableau de coherence budgetaire
              </Typography>
              {loadingMetrics && <CircularProgress size={14} />}
            </Box>
            {!metrics ? (
              <Typography sx={{ px: 2, py: 2, fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Donnees de coherence indisponibles pour le moment.
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
                {[
                  { label: 'Budget convention', amount: convention.budget, hint: 'Montant de reference', bg: colors.primary[25], labelWeight: typography.weights.bold },
                  { label: 'Lignes de depenses (prevision detaillee)', amount: metrics.totalBudgetLignes, chip: { ok: Math.abs(budgetEcart) < 1, msg: Math.abs(budgetEcart) < 1 ? 'OK: aligne au budget' : `Ecart: ${formatCurrency(budgetEcart)}` } },
                  { label: 'Partenaires alloues', amount: metrics.totalPartenaires, chip: { ok: Math.abs(partenairesEcart) < 1, msg: Math.abs(partenairesEcart) < 1 ? 'OK: allocation complete' : `Reste a allouer: ${formatCurrency(partenairesEcart)}` } },
                  { label: 'Subventions (ressources externes)', amount: metrics.totalSubventions, hint: 'A comparer au besoin de financement' },
                  { label: 'Projets rattaches', amount: metrics.totalProjets, hint: 'Vision programme (hors engagement comptable)' },
                  { label: 'Marches engages', amount: metrics.totalMarches, hint: 'Valeur contractuelle engagee', bg: colors.neutral[25] },
                  { label: 'Decomptes constates', amount: metrics.totalDecomptes, chip: { ok: true, msg: `A engager en plus: ${formatCurrency(executionEcart)}` } },
                  { label: 'Paiements realises', amount: metrics.totalPaiements, chip: { ok: true, msg: `Reste a payer: ${formatCurrency(paiementEcart)}` } },
                ].map((row, idx) => (
                  <Box key={idx} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.25, gap: 2,
                    borderBottom: idx < 7 ? `1px solid ${colors.borderSubtle}` : 'none',
                    bgcolor: row.bg || 'transparent',
                    '&:hover': { bgcolor: colors.neutral[50] },
                    transition: 'background-color 0.15s',
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: row.labelWeight || typography.weights.medium, color: colors.textPrimary }}>
                        {row.label}
                      </Typography>
                    </Box>
                    <Typography sx={{
                      fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
                      color: colors.textPrimary, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', minWidth: 150, textAlign: 'right',
                    }}>
                      {formatCurrency(row.amount)}
                    </Typography>
                    <Box sx={{ minWidth: 220, textAlign: 'right' }}>
                      {row.chip ? statusChip(row.chip.ok, row.chip.msg) : (
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{row.hint}</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ px: 2, py: 1, borderTop: `1px dashed ${colors.borderSubtle}`, bgcolor: colors.neutral[25] }}>
              <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>
                Budget → Lignes de depenses / Partenaires (prevision) → Marches (engagement) → Decomptes (realise technique) → Paiements (realise financier)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Notebook
          tabs={[
            {
              label: 'Partenaires',
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <ConventionPartenairesCard
                    conventionId={convention.id}
                    conventionBudget={convention.budget}
                    canEdit={canEdit}
                    parentConventionId={convention.parentConventionId ?? undefined}
                    onAddClick={() => onAddPartenaire?.()}
                    onEditClick={(p) => onEditPartenaire?.(p)}
                  />
                </Box>
              ),
            },
            {
              label: 'Subventions',
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <ConventionSubventionsCard
                    conventionId={convention.id}
                    conventionBudget={convention.budget}
                    canEdit={canEdit}
                  />
                </Box>
              ),
            },
            {
              label: 'Lignes de depenses',
              content: (
                <ConventionBudgetDistributionCard
                  conventionId={convention.id}
                  canEdit={canEdit}
                  onDataChanged={refreshAll}
                />
              ),
            },
            {
              label: 'Projets', count: projets.length,
              content: <ConventionProjetsTab projets={projets} onLinkProjet={() => setLinkProjetOpen(true)} onUnlinkProjet={(pid) => setConfirmState({ open: true, type: 'unlinkProjet', id: pid })} />,
            },
            {
              label: 'Marches', count: marches.length,
              content: <ConventionMarchesTab marches={marches} onLinkMarche={() => setLinkMarcheOpen(true)} onUnlinkMarche={(mid) => setConfirmState({ open: true, type: 'unlinkMarche', id: mid })} />,
            },
            ...(convention.typeConvention === 'CADRE' ? [{
              label: 'Sous-conventions', count: sousConventions.length,
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <InlineTable
                    headers={[
                      { label: 'Code', width: '20%' }, { label: 'Libelle' },
                      { label: 'Statut', width: 120 }, { label: 'Budget', width: 150, align: 'right' as const },
                      { label: 'Actions', width: 100, align: 'center' as const },
                    ]}
                    rows={sousConventions.map(sc => [
                      <Typography key="code" sx={{ color: colors.primary[600], fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{sc.code}</Typography>,
                      <Typography key="lib" sx={{ fontSize: typography.sizes.sm }}>{sc.libelle}</Typography>,
                      <StatusBadge key="stat" status={sc.statut} size="small" />,
                      <Typography key="bud" sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sc.budget)}</Typography>,
                      sc.statut === 'BROUILLON' ? (
                        <Button key="act" size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingSc(sc); setScDialogOpen(true) }}
                          sx={{ textTransform: 'none', fontSize: typography.sizes.xs, color: colors.primary[600], minWidth: 0 }}>Modifier</Button>
                      ) : null,
                    ])}
                    onRowClick={(idx) => navigate(`/conventions/${sousConventions[idx].id}`)}
                    emptyMessage="Aucune sous-convention"
                    showAddLine
                    onAddLine={() => { setEditingSc(null); setScDialogOpen(true) }}
                  />
                </Box>
              ),
            }] : []),
            {
              label: 'Avenants', count: avenants.length,
              content: <ConventionAvenantsTab convention={convention} avenants={avenants} formatCurrency={formatCurrency} formatDate={formatDate} getStatusColor={getStatusColor} />,
            },
            {
              label: 'Imputations',
              content: <ConventionImputationsCard conventionId={convention.id} conventionBudget={convention.budget} canEdit={canEdit} onRefresh={refreshAll} />,
            },
          ]}
        />
      </ResizableSection>

      <LinkProjetDialog open={linkProjetOpen} conventionId={convention.id} onClose={() => setLinkProjetOpen(false)} onSuccess={() => { loadProjets(); loadCoherenceMetrics(); onRefresh?.() }} />
      <LinkMarcheDialog open={linkMarcheOpen} conventionId={convention.id} onClose={() => setLinkMarcheOpen(false)} onSuccess={() => { loadMarches(); loadCoherenceMetrics(); onRefresh?.() }} />
      <SousConventionFormSimple
        open={scDialogOpen}
        onClose={() => { setScDialogOpen(false); setEditingSc(null) }}
        onSuccess={() => { loadSousConventions(); setScDialogOpen(false); setEditingSc(null); loadCoherenceMetrics() }}
        parentConvention={{ id: convention.id, numero: convention.numero, libelle: convention.libelle, tauxCommission: convention.tauxCommission, baseCalcul: convention.baseCalcul, tauxTva: convention.tauxTva, budget: convention.budget }}
        editingSousConvention={editingSc}
      />
      <ConfirmDialog open={confirmState.open} {...confirmProps} onConfirm={handleConfirm} onCancel={() => setConfirmState({ open: false, type: null, id: null })} />
    </>
  )
}

export default ConventionRealisationSection
