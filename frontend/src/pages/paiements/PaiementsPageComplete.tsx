import { useState, useEffect, useMemo } from 'react'
import { Box, Button, IconButton, Chip, CircularProgress } from '@mui/material'
import { Plus, RefreshCw, List, LayoutGrid } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { paiementsAPI } from '../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import { ControlPanel, ExportButton } from '../../components/core'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'
import { useTableSort } from '@/hooks/useTableSort'
import { PaiementTable, PaiementFormDialog, PaiementKanbanView } from './components'
import type { Paiement, PaiementFormData } from './components'
import { formatCurrency } from '@/lib/utils'

const styles = componentStyles.listPage
type ViewMode = 'list' | 'kanban'

const INITIAL_FORM: PaiementFormData = {
  numeroPaiement: '', datePaiement: new Date().toISOString().split('T')[0],
  montant: 0, modeReglement: 'VIREMENT', referenceBancaire: '',
  beneficiaire: '', observation: '', ordrePaiementId: 0,
}

const PaiementsPage = () => {
  const { showError, showSuccess } = useToast()
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [formData, setFormData] = useState<PaiementFormData>(INITIAL_FORM)

  useEffect(() => { loadPaiements() }, [])

  const loadPaiements = async () => {
    setLoading(true)
    try { const { data } = await paiementsAPI.getAll(); setPaiements(data.data || []) }
    catch { showError('Erreur lors du chargement des paiements') }
    finally { setLoading(false) }
  }

  const stats = useMemo(() => ({
    total: paiements.length,
    EN_ATTENTE: paiements.filter(p => p.statut === 'EN_ATTENTE').length,
    EFFECTUE: paiements.filter(p => p.statut === 'EFFECTUE').length,
    ANNULE: paiements.filter(p => p.statut === 'ANNULE').length,
  }), [paiements])

  const filteredPaiements = useMemo(() => paiements.filter(p => {
    const term = searchTerm.toLowerCase()
    if (term && !p.numeroPaiement?.toLowerCase().includes(term) && !p.beneficiaire?.toLowerCase().includes(term)) return false
    return statutFilter === 'ALL' || p.statut === statutFilter
  }), [paiements, searchTerm, statutFilter])

  const { sortedItems, sortConfig, requestSort } = useTableSort<Paiement>(filteredPaiements, { key: 'numeroPaiement', direction: 'asc' })
  const paginatedPaiements = useMemo(() => sortedItems.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [sortedItems, page, rowsPerPage])

  const handleOpenDialog = (paiement: Paiement | null = null) => {
    setSelectedPaiement(paiement)
    setFormData(paiement ? {
      numeroPaiement: paiement.numeroPaiement, datePaiement: paiement.datePaiement,
      montant: paiement.montant, modeReglement: paiement.modeReglement || 'VIREMENT',
      referenceBancaire: paiement.referenceBancaire || '', beneficiaire: paiement.beneficiaire || '',
      observation: paiement.observation || '', ordrePaiementId: paiement.ordrePaiementId || 0,
    } : INITIAL_FORM)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setSelectedPaiement(null) }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const payload = formData as unknown as Record<string, unknown>
      if (selectedPaiement) await paiementsAPI.update(selectedPaiement.id, payload)
      else await paiementsAPI.create(payload)
      showSuccess(selectedPaiement ? 'Paiement modifié' : 'Paiement créé')
      handleCloseDialog(); loadPaiements()
    } catch { showError('Erreur lors de la sauvegarde du paiement') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return
    try { await paiementsAPI.delete(id); showSuccess('Paiement supprimé'); loadPaiements() }
    catch { showError('Erreur lors de la suppression du paiement') }
  }

  const handleCardMove = (itemId: string, _from: string, toColumnId: string) => {
    const p = paiements.find(x => String(x.id) === itemId)
    if (!p || p.statut === toColumnId) return
    const previous = paiements
    setPaiements(prev => prev.map(x => (x.id === p.id ? { ...x, statut: toColumnId } : x)))
    paiementsAPI.update(p.id, { ...p, statut: toColumnId } as Record<string, unknown>)
      .then(() => loadPaiements())
      .catch(() => { setPaiements(previous); showError('Erreur lors du déplacement du paiement') })
  }


  if (loading) return (
    <AppLayout>
      <Box sx={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={40} /></Box>
    </AppLayout>
  )

  const isList = viewMode === 'list'
  const viewBtn = (mode: ViewMode, Icon: typeof List) => (
    <IconButton size="small" onClick={() => setViewMode(mode)} sx={{ borderRadius: 0, bgcolor: viewMode === mode ? colors.primary[50] : 'transparent', color: viewMode === mode ? colors.primary[600] : colors.textSecondary }}>
      <Icon size={16} />
    </IconButton>
  )

  return (
    <AppLayout>
      <Box sx={styles.container}>
        <ControlPanel
          breadcrumbs={[{ label: 'Paiements' }]}
          actions={<>
            <Box sx={{ display: 'flex', border: `1px solid ${colors.border}`, borderRadius: 1, overflow: 'hidden' }}>
              {viewBtn('list', List)}{viewBtn('kanban', LayoutGrid)}
            </Box>
            <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => handleOpenDialog()} sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}>Nouveau</Button>
            <ExportButton onClick={() => {}} />
            <IconButton size="small" onClick={() => loadPaiements()} sx={{ color: colors.textSecondary }}><RefreshCw size={16} /></IconButton>
          </>}
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setPage(0) }}
          searchPlaceholder="Rechercher par numero, fournisseur..."
          paginationInfo={isList ? { currentStart: filteredPaiements.length === 0 ? 0 : page * rowsPerPage + 1, currentEnd: Math.min((page + 1) * rowsPerPage, filteredPaiements.length), total: filteredPaiements.length } : undefined}
          onPreviousPage={isList ? () => setPage(p => Math.max(0, p - 1)) : undefined}
          onNextPage={isList ? () => setPage(p => p + 1) : undefined}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(['ALL', 'EN_ATTENTE', 'EFFECTUE', 'ANNULE'] as const).map((statut) => {
              const count = statut === 'ALL' ? paiements.length : stats[statut]
              const isActive = statutFilter === statut
              return (
                <Chip key={statut} onClick={() => { setStatutFilter(statut); setPage(0) }} sx={isActive ? styles.filterPillActive : styles.filterPill}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                    <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
                  </Box>} />
              )
            })}
          </Box>
        </ControlPanel>

        {isList ? (
          <PaiementTable paiements={paginatedPaiements} sortConfig={sortConfig} requestSort={requestSort}
            onEdit={handleOpenDialog} onDelete={handleDelete} page={page} rowsPerPage={rowsPerPage}
            totalCount={filteredPaiements.length} onPageChange={setPage}
            onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0) }} formatCurrency={formatCurrency} />
        ) : (
          <PaiementKanbanView paiements={filteredPaiements} onCardMove={handleCardMove} formatCurrency={formatCurrency} />
        )}

        <PaiementFormDialog open={openDialog} onClose={handleCloseDialog} onSubmit={handleSubmit}
          selectedPaiement={selectedPaiement} formData={formData} onFormDataChange={setFormData}
          isSubmitting={submitting} />
      </Box>
    </AppLayout>
  )
}

export default PaiementsPage
