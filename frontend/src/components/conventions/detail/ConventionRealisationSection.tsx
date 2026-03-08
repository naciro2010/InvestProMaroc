import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Chip, CircularProgress } from '@mui/material'
import { ListAlt } from '@mui/icons-material'
import { StatusBadge, InlineTable, Notebook, ResizableSection, ConfirmDialog } from '@/components/core'
import ConventionAvenantsTab from './ConventionAvenantsTab'
import { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'
import ConventionBudgetLignesCard from './ConventionBudgetLignesCard'
import ConventionImputationsCard from './ConventionImputationsCard'
import LinkProjetDialog from '../LinkProjetDialog'
import LinkMarcheDialog from '../LinkMarcheDialog'
import SousConventionFormSimple from '@/pages/conventions/SousConventionFormSimple'
import { api, conventionsAPI, avenantConventionsAPI, projetConventionsAPI, marchesAPI, subventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'
import type { SousConvention, Avenant, Projet, Marche } from './types'
import type { ConventionBudgetLigneDTO } from '@/types/api'

interface ConventionBase {
  id: number; numero: string; libelle: string; dateSignature: string; budget: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'; tauxCommission: number; baseCalcul: string; tauxTva: number
}

interface ProjetAssociation { projetId: number; projetCode: string; projetNom: string; projetBudgetTotal: number; projetStatut: string }

interface ConventionRealisationSectionProps {
  convention: ConventionBase
  canEdit?: boolean
  onRefresh?: () => void
  refreshKey?: number
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
  <Chip
    size="small"
    label={message}
    sx={{
      bgcolor: isOk ? colors.success[50] : colors.warning[50],
      color: isOk ? colors.success[700] : colors.warning[700],
      border: `1px solid ${isOk ? colors.success[200] : colors.warning[200]}`,
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.xs,
      height: 22,
    }}
  />
)

/**
 * Self-contained micro-component: loads projets, marches, sous-conventions, avenants.
 * Adds an Odoo-like coherence strip to keep budget/prevision/realisation crystal clear.
 */
const ConventionRealisationSection = ({ convention, canEdit = false, onRefresh, refreshKey }: ConventionRealisationSectionProps) => {
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

        const decompteTotal = decomptes.reduce(
          (acc, d) => acc + toAmount(d.netAPayer ?? d.montantTtc ?? d.montant),
          0,
        )
        const paiementTotal = paiements.reduce(
          (acc, p) => acc + toAmount(p.montantPaye ?? p.montant),
          0,
        )
        return { decompteTotal, paiementTotal }
      }))

      const totalDecomptes = perMarche.reduce((acc, m) => acc + m.decompteTotal, 0)
      const totalPaiements = perMarche.reduce((acc, m) => acc + m.paiementTotal, 0)

      setMetrics({
        totalBudgetLignes,
        totalPartenaires,
        totalSubventions,
        totalProjets,
        totalMarches,
        totalDecomptes,
        totalPaiements,
      })
    } catch {
      setMetrics(null)
    } finally {
      setLoadingMetrics(false)
    }
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
          <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: '8px', bgcolor: colors.surface, overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${colors.borderSubtle}`, bgcolor: colors.primary[25], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                Vue de coherence (style Odoo ERP)
              </Typography>
              {loadingMetrics && <CircularProgress size={14} />}
            </Box>
            {!metrics ? (
              <Typography sx={{ px: 1.5, py: 1.25, fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Donnees de coherence indisponibles pour le moment.
              </Typography>
            ) : (
              <InlineTable
                headers={[
                  { label: 'Indicateur' },
                  { label: 'Montant', align: 'right' as const, width: 170 },
                  { label: 'Lecture metier', width: 280 },
                ]}
                rows={[
                  [<Typography key="b1" sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }}>Budget convention</Typography>, <Typography key="b2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(convention.budget)}</Typography>, <Typography key="b3" sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Montant de reference</Typography>],
                  [<Typography key="l1" sx={{ fontSize: typography.sizes.xs }}>Lignes budget (prevision detaillee)</Typography>, <Typography key="l2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalBudgetLignes)}</Typography>, statusChip(Math.abs(budgetEcart) < 1, Math.abs(budgetEcart) < 1 ? 'OK: aligne au budget' : `Ecart: ${formatCurrency(budgetEcart)}`)],
                  [<Typography key="p1" sx={{ fontSize: typography.sizes.xs }}>Partenaires alloues</Typography>, <Typography key="p2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalPartenaires)}</Typography>, statusChip(Math.abs(partenairesEcart) < 1, Math.abs(partenairesEcart) < 1 ? 'OK: allocation complete' : `Reste a allouer: ${formatCurrency(partenairesEcart)}`)],
                  [<Typography key="s1" sx={{ fontSize: typography.sizes.xs }}>Subventions (ressources externes)</Typography>, <Typography key="s2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalSubventions)}</Typography>, <Typography key="s3" sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>A comparer au besoin de financement</Typography>],
                  [<Typography key="pr1" sx={{ fontSize: typography.sizes.xs }}>Projets rattaches</Typography>, <Typography key="pr2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalProjets)}</Typography>, <Typography key="pr3" sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Vision programme (hors engagement comptable)</Typography>],
                  [<Typography key="m1" sx={{ fontSize: typography.sizes.xs }}>Marches engages</Typography>, <Typography key="m2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalMarches)}</Typography>, <Typography key="m3" sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Valeur contractuelle engagee</Typography>],
                  [<Typography key="d1" sx={{ fontSize: typography.sizes.xs }}>Decomptes constates</Typography>, <Typography key="d2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalDecomptes)}</Typography>, statusChip(true, `A engager en plus: ${formatCurrency(executionEcart)}`)],
                  [<Typography key="pa1" sx={{ fontSize: typography.sizes.xs }}>Paiements realises</Typography>, <Typography key="pa2" sx={{ fontSize: typography.sizes.xs }}>{formatCurrency(metrics.totalPaiements)}</Typography>, statusChip(true, `Reste a payer: ${formatCurrency(paiementEcart)}`)],
                ]}
                emptyMessage="Aucune donnee"
              />
            )}
            <Typography sx={{ px: 1.5, py: 0.9, fontSize: '10px', color: colors.textSecondary, borderTop: `1px dashed ${colors.borderSubtle}` }}>
              Logique de lecture: Budget → Lignes budget/Partenaires (prevision) → Marches (engagement) → Decomptes (realise technique) → Paiements (realise financier).
            </Typography>
          </Box>
        </Box>

        <Notebook
          tabs={[
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
              label: 'Budget lignes',
              content: <ConventionBudgetLignesCard conventionId={convention.id} conventionFinancials={{
                budget: convention.budget, tauxCommission: convention.tauxCommission,
                tauxTva: convention.tauxTva, baseCalcul: convention.baseCalcul,
              }} />,
            },
            {
              label: 'Imputations',
              content: <ConventionImputationsCard conventionId={convention.id} conventionBudget={convention.budget} canEdit={canEdit} onRefresh={onRefresh} />,
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
