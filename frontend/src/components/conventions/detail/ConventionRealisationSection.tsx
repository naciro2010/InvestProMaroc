import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { ListAlt } from '@mui/icons-material'
import { StatusBadge, InlineTable, Notebook, ResizableSection, ConfirmDialog } from '@/components/core'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import ConventionAvenantsTab from './ConventionAvenantsTab'
import { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'
import ConventionBudgetDistributionCard from './ConventionBudgetDistributionCard'
import ConventionSubventionsCard from './ConventionSubventionsCard'
import ConventionPartenairesCard from './ConventionPartenairesCard'
import ConventionDocumentsCard from './ConventionDocumentsCard'
import ConventionImputationsCard from './ConventionImputationsCard'
import ConventionVersementsCard from './ConventionVersementsCard'
import LinkProjetDialog from '../LinkProjetDialog'
import LinkMarcheDialog from '../LinkMarcheDialog'
import SousConventionFormSimple from '@/pages/conventions/SousConventionFormSimple'
import { api, conventionsAPI, avenantConventionsAPI, projetConventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'
import type { SousConvention, Avenant, Projet, Marche } from './types'

// ──── Types ────

interface ConventionBase {
  id: number; numero: string; libelle: string; dateSignature: string; dateDebut: string; dateFin?: string; budget: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'; tauxCommission: number; baseCalcul: string; tauxTva: number
  parentConventionId?: number | null
}

interface ProjetAssociation {
  projetId: number; projetCode: string; projetNom: string; projetBudgetTotal: number; projetStatut: string
}

interface RealisationEnriched {
  nombrePartenaires?: number
  nombreProjets?: number
  nombreMarches?: number
  nombreSousConventions?: number
  nombreAvenants?: number
}

type LazyTabId = 'projets' | 'marches' | 'avenants' | 'sous-conventions'

interface ConventionRealisationSectionProps {
  convention: ConventionBase
  canEdit?: boolean
  onRefresh?: () => void
  refreshKey?: number
  onAddPartenaire?: () => void
  onEditPartenaire?: (partenaire: PartenaireEditRef) => void
  /** Compteurs enrichis (pour les badges d'onglets non chargés au niveau section). */
  enrichedData?: RealisationEnriched | null
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

// ──── Main Component ────

const ConventionRealisationSection = ({
  convention, canEdit = false, onRefresh, refreshKey,
  onAddPartenaire, onEditPartenaire, enrichedData,
}: ConventionRealisationSectionProps) => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [avenants, setAvenants] = useState<Avenant[]>([])
  // Chargement paresseux : un jeu de données n'est récupéré qu'à l'ouverture
  // de son onglet. Les compteurs des badges proviennent d'enrichedData, donc
  // les badges restent corrects sans charger la liste.
  const [loaded, setLoaded] = useState<Record<LazyTabId, boolean>>({
    projets: false, marches: false, avenants: false, 'sous-conventions': false,
  })
  const [loadingTab, setLoadingTab] = useState<Record<LazyTabId, boolean>>({
    projets: false, marches: false, avenants: false, 'sous-conventions': false,
  })
  const [linkProjetOpen, setLinkProjetOpen] = useState(false)
  const [linkMarcheOpen, setLinkMarcheOpen] = useState(false)
  const [scDialogOpen, setScDialogOpen] = useState(false)
  const [editingSc, setEditingSc] = useState<SousConvention | null>(null)
  const [confirmState, setConfirmState] = useState<{ open: boolean; type: 'unlinkProjet' | 'unlinkMarche' | null; id: number | null }>({ open: false, type: null, id: null })

  const markLoaded = (id: LazyTabId) => setLoaded(prev => ({ ...prev, [id]: true }))
  const setTabLoading = (id: LazyTabId, v: boolean) => setLoadingTab(prev => ({ ...prev, [id]: v }))

  const loadAvenants = async () => {
    setTabLoading('avenants', true)
    try { const r = await avenantConventionsAPI.getByConvention(convention.id); setAvenants(r.data.data || r.data || []) }
    catch { setAvenants([]) }
    finally { setTabLoading('avenants', false); markLoaded('avenants') }
  }
  const loadSousConventions = async () => {
    setTabLoading('sous-conventions', true)
    try { const r = await conventionsAPI.getSousConventions(convention.id); setSousConventions(r.data.data || []) }
    catch { /* ignored */ }
    finally { setTabLoading('sous-conventions', false); markLoaded('sous-conventions') }
  }
  const loadProjets = async () => {
    setTabLoading('projets', true)
    try {
      const r = await projetConventionsAPI.getByConvention(convention.id)
      const assocs: ProjetAssociation[] = r.data.data || r.data || []
      setProjets(assocs.map(a => ({ id: a.projetId, code: a.projetCode, designation: a.projetNom, budgetTotal: a.projetBudgetTotal, statut: a.projetStatut })))
    } catch { setProjets([]) }
    finally { setTabLoading('projets', false); markLoaded('projets') }
  }
  const loadMarches = async () => {
    setTabLoading('marches', true)
    try { const r = await api.get(`/marches/convention/${convention.id}`); setMarches(r.data.data || r.data || []) }
    catch { setMarches([]) }
    finally { setTabLoading('marches', false); markLoaded('marches') }
  }

  // Charge le jeu de données d'un onglet à sa première ouverture (et au montage
  // pour l'onglet initial / deep-link). Une nouvelle convention remonte le
  // composant (key=convention.id côté page), réinitialisant l'état.
  const handleTabChange = (_index: number, id?: string) => {
    if (id === 'projets' && !loaded.projets && !loadingTab.projets) loadProjets()
    else if (id === 'marches' && !loaded.marches && !loadingTab.marches) loadMarches()
    else if (id === 'avenants' && !loaded.avenants && !loadingTab.avenants) loadAvenants()
    else if (id === 'sous-conventions' && !loaded['sous-conventions'] && !loadingTab['sous-conventions']) loadSousConventions()
  }

  // Squelette tant que l'onglet paresseux n'a pas chargé ses données.
  const lazyContent = (id: LazyTabId, node: React.ReactNode) =>
    !loaded[id] || loadingTab[id]
      ? <Box sx={{ px: { xs: 2, md: 3 }, py: 1 }}><LoadingSkeleton variant="table" rows={4} /></Box>
      : node

  const handleConfirm = async () => {
    if (!confirmState.id || !confirmState.type) return
    try {
      if (confirmState.type === 'unlinkProjet') { await conventionsAPI.unlinkProjet(confirmState.id, convention.id); showSuccess('Projet delie'); loadProjets() }
      else { await conventionsAPI.unlinkMarche(convention.id, confirmState.id); showSuccess('Marche delie'); loadMarches() }
      onRefresh?.()
    } catch { showError('Erreur lors de l\'operation') }
    finally { setConfirmState({ open: false, type: null, id: null }) }
  }

  const refreshAll = () => {
    onRefresh?.()
  }

  const confirmProps = confirmState.type === 'unlinkProjet'
    ? { title: 'Delier le projet', message: 'Voulez-vous delier ce projet ?', variant: 'warning' as const, confirmLabel: 'Delier' }
    : confirmState.type === 'unlinkMarche'
      ? { title: 'Delier le marche', message: 'Voulez-vous delier ce marche ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      : { title: '', message: '', variant: 'info' as const, confirmLabel: 'Confirmer' }

  return (
    <>
      <ResizableSection
        title="Projets, marches, budget et details"
        storageKey="conv-real-notebook"
        icon={<ListAlt sx={{ color: colors.success[500], fontSize: 16 }} />}
        noPadding
        overflowVisible
      >
        <Notebook
          syncParam="tab"
          sticky
          stickyTop={{ xs: 56, lg: 0 }}
          onTabChange={handleTabChange}
          tabs={[
            {
              id: 'partenaires',
              label: 'Partenaires',
              count: enrichedData?.nombrePartenaires,
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <ConventionPartenairesCard
                    conventionId={convention.id}
                    conventionBudget={convention.budget}
                    canEdit={canEdit}
                    parentConventionId={convention.parentConventionId ?? undefined}
                    refreshKey={refreshKey}
                    onAddClick={() => onAddPartenaire?.()}
                    onEditClick={(p) => onEditPartenaire?.(p)}
                    onDataChanged={refreshAll}
                  />
                </Box>
              ),
            },
            {
              id: 'subventions',
              label: 'Subventions',
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <ConventionSubventionsCard
                    conventionId={convention.id}
                    conventionBudget={convention.budget}
                    canEdit={canEdit}
                    refreshKey={refreshKey}
                    onDataChanged={refreshAll}
                  />
                </Box>
              ),
            },
            {
              id: 'versements',
              label: 'Versements',
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <ConventionVersementsCard
                    conventionId={convention.id}
                    conventionBudget={convention.budget}
                    canEdit={canEdit}
                    refreshKey={refreshKey}
                    onDataChanged={refreshAll}
                  />
                </Box>
              ),
            },
            {
              id: 'lignes',
              label: 'Lignes de depenses',
              content: (
                <ConventionBudgetDistributionCard
                  conventionId={convention.id}
                  canEdit={canEdit}
                  refreshKey={refreshKey}
                  onDataChanged={refreshAll}
                />
              ),
            },
            {
              id: 'projets',
              label: 'Projets', count: loaded.projets ? projets.length : enrichedData?.nombreProjets,
              content: lazyContent('projets', <ConventionProjetsTab projets={projets} onLinkProjet={() => setLinkProjetOpen(true)} onUnlinkProjet={(pid) => setConfirmState({ open: true, type: 'unlinkProjet', id: pid })} />),
            },
            {
              id: 'marches',
              label: 'Marches', count: loaded.marches ? marches.length : enrichedData?.nombreMarches,
              content: lazyContent('marches', <ConventionMarchesTab marches={marches} onLinkMarche={() => setLinkMarcheOpen(true)} onUnlinkMarche={(mid) => setConfirmState({ open: true, type: 'unlinkMarche', id: mid })} />),
            },
            ...(convention.typeConvention === 'CADRE' ? [{
              id: 'sous-conventions',
              label: 'Sous-conventions', count: loaded['sous-conventions'] ? sousConventions.length : enrichedData?.nombreSousConventions,
              content: lazyContent('sous-conventions', (
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
              )),
            }] : []),
            {
              id: 'avenants',
              label: 'Avenants', count: loaded.avenants ? avenants.length : enrichedData?.nombreAvenants,
              content: lazyContent('avenants', <ConventionAvenantsTab convention={convention} avenants={avenants} formatCurrency={formatCurrency} formatDate={formatDate} />),
            },
            {
              id: 'imputations',
              label: 'Imputations',
              content: <ConventionImputationsCard conventionId={convention.id} conventionBudget={convention.budget} canEdit={canEdit} refreshKey={refreshKey} onRefresh={refreshAll} />,
            },
            {
              id: 'documents',
              label: 'Documents',
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <ConventionDocumentsCard conventionId={convention.id} canEdit={canEdit} />
                </Box>
              ),
            },
          ]}
        />
      </ResizableSection>

      <LinkProjetDialog open={linkProjetOpen} conventionId={convention.id} onClose={() => setLinkProjetOpen(false)} onSuccess={() => { loadProjets(); onRefresh?.() }} />
      <LinkMarcheDialog open={linkMarcheOpen} conventionId={convention.id} onClose={() => setLinkMarcheOpen(false)} onSuccess={() => { loadMarches(); onRefresh?.() }} />
      <SousConventionFormSimple
        open={scDialogOpen}
        onClose={() => { setScDialogOpen(false); setEditingSc(null) }}
        onSuccess={() => { loadSousConventions(); setScDialogOpen(false); setEditingSc(null); onRefresh?.() }}
        parentConvention={{ id: convention.id, numero: convention.numero, libelle: convention.libelle, tauxCommission: convention.tauxCommission, baseCalcul: convention.baseCalcul, tauxTva: convention.tauxTva, budget: convention.budget }}
        editingSousConvention={editingSc}
      />
      <ConfirmDialog open={confirmState.open} {...confirmProps} onConfirm={handleConfirm} onCancel={() => setConfirmState({ open: false, type: null, id: null })} />
    </>
  )
}

export default ConventionRealisationSection
