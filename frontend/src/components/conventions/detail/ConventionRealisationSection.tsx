import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { ListAlt } from '@mui/icons-material'
import { StatusBadge, InlineTable, Notebook, ResizableSection, ConfirmDialog } from '@/components/core'
import ConventionAvenantsTab from './ConventionAvenantsTab'
import { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'
import LinkProjetDialog from '../LinkProjetDialog'
import LinkMarcheDialog from '../LinkMarcheDialog'
import SousConventionFormSimple from '@/pages/conventions/SousConventionFormSimple'
import { api, conventionsAPI, avenantConventionsAPI, projetConventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'
import type { SousConvention, Avenant, Projet, Marche } from './types'

interface ConventionBase {
  id: number; numero: string; libelle: string; dateSignature: string; budget: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'; tauxCommission: number; baseCalcul: string; tauxTva: number
}

interface ProjetAssociation { projetId: number; projetCode: string; projetNom: string; projetBudgetTotal: number; projetStatut: string }

interface ConventionRealisationSectionProps {
  convention: ConventionBase
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

const getStatusColor = (statut: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (!statut) return 'default'
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    BROUILLON: 'default', SOUMIS: 'info', VALIDEE: 'success', VALIDE: 'success',
    EN_COURS: 'primary', EN_EXECUTION: 'primary', ACHEVE: 'secondary', TERMINE: 'secondary',
    REJETE: 'error', ANNULE: 'error',
  }
  return map[statut.toUpperCase()] || 'default'
}

/**
 * Self-contained micro-component: loads projets, marches, sous-conventions, avenants.
 * Manages its own dialogs for linking/unlinking and sous-convention CRUD.
 */
const ConventionRealisationSection = ({ convention }: ConventionRealisationSectionProps) => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [avenants, setAvenants] = useState<Avenant[]>([])

  const [linkProjetOpen, setLinkProjetOpen] = useState(false)
  const [linkMarcheOpen, setLinkMarcheOpen] = useState(false)
  const [scDialogOpen, setScDialogOpen] = useState(false)
  const [editingSc, setEditingSc] = useState<SousConvention | null>(null)
  const [confirmState, setConfirmState] = useState<{ open: boolean; type: 'unlinkProjet' | 'unlinkMarche' | null; id: number | null }>({ open: false, type: null, id: null })

  useEffect(() => { loadAvenants(); loadSousConventions(); loadProjets(); loadMarches() }, [convention.id])

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

  const handleConfirm = async () => {
    if (!confirmState.id || !confirmState.type) return
    try {
      if (confirmState.type === 'unlinkProjet') { await conventionsAPI.unlinkProjet(confirmState.id, convention.id); showSuccess('Projet delie'); loadProjets() }
      else { await conventionsAPI.unlinkMarche(convention.id, confirmState.id); showSuccess('Marche delie'); loadMarches() }
    } catch { showError('Erreur lors de l\'operation') }
    finally { setConfirmState({ open: false, type: null, id: null }) }
  }

  const confirmProps = confirmState.type === 'unlinkProjet'
    ? { title: 'Delier le projet', message: 'Voulez-vous delier ce projet ?', variant: 'warning' as const, confirmLabel: 'Delier' }
    : confirmState.type === 'unlinkMarche'
      ? { title: 'Delier le marche', message: 'Voulez-vous delier ce marche ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      : { title: '', message: '', variant: 'info' as const, confirmLabel: 'Confirmer' }

  return (
    <>
      <ResizableSection
        title="Projets, marches et avenants"
        storageKey="conv-real-notebook"
        icon={<ListAlt sx={{ color: colors.success[500], fontSize: 16 }} />}
        noPadding
      >
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
            {
              label: 'Sous-conventions', count: sousConventions.length,
              content: (
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <InlineTable
                    headers={[
                      { label: 'Code', width: '20%' }, { label: 'Libelle' },
                      { label: 'Statut', width: 120 }, { label: 'Budget', width: 150, align: 'right' },
                      { label: 'Actions', width: 100, align: 'center' },
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
                    showAddLine={convention.typeConvention === 'CADRE'}
                    onAddLine={() => { setEditingSc(null); setScDialogOpen(true) }}
                  />
                </Box>
              ),
            },
            {
              label: 'Avenants', count: avenants.length,
              content: <ConventionAvenantsTab convention={convention} avenants={avenants} formatCurrency={formatCurrency} formatDate={formatDate} getStatusColor={getStatusColor} />,
            },
          ]}
        />
      </ResizableSection>

      <LinkProjetDialog open={linkProjetOpen} conventionId={convention.id} onClose={() => setLinkProjetOpen(false)} onSuccess={loadProjets} />
      <LinkMarcheDialog open={linkMarcheOpen} conventionId={convention.id} onClose={() => setLinkMarcheOpen(false)} onSuccess={loadMarches} />
      <SousConventionFormSimple
        open={scDialogOpen}
        onClose={() => { setScDialogOpen(false); setEditingSc(null) }}
        onSuccess={() => { loadSousConventions(); setScDialogOpen(false); setEditingSc(null) }}
        parentConvention={{ id: convention.id, numero: convention.numero, libelle: convention.libelle, tauxCommission: convention.tauxCommission, baseCalcul: convention.baseCalcul, tauxTva: convention.tauxTva, budget: convention.budget }}
        editingSousConvention={editingSc}
      />
      <ConfirmDialog open={confirmState.open} {...confirmProps} onConfirm={handleConfirm} onCancel={() => setConfirmState({ open: false, type: null, id: null })} />
    </>
  )
}

export default ConventionRealisationSection
