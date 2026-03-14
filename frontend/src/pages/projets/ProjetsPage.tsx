import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  Chip,
} from '@mui/material'
import { Star as StarIcon } from '@mui/icons-material'
import { Plus, RefreshCw, Layers, Columns3, TrendingUp } from 'lucide-react'
import { projetsAPI, type Projet } from '@/lib/projetsAPI'
import { useToast } from '@/contexts/ToastContext'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, ExportButton, KanbanBoard, StatusBadge } from '@/components/core'
import type { KanbanColumn } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { exportToExcel, formatCurrencyForExport, formatDateForExport } from '@/lib/exportUtils'
import { GroupByPopover, ColumnVisibilityPopover } from '@/components/conventions/list'
import {
  ProjetAdvancedFilters,
  SavedFiltersMenu,
  ProjetListTable,
  ProjetActionDialogs,
  EMPTY_FILTERS,
  type ProjetFilterState,
  type ColumnConfig,
} from '@/components/projets/list'

// ==================== CONFIG ====================

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'statut', label: 'Statut', visible: true },
  { key: 'budget', label: 'Budget', visible: true },
  { key: 'avancement', label: 'Avancement', visible: true },
  { key: 'convention', label: 'Convention', visible: true },
  { key: 'dateDebut', label: 'Periode', visible: true },
  { key: 'chefProjet', label: 'Chef de projet', visible: true },
]

const GROUPBY_OPTIONS = [
  { value: '', label: 'Aucun' },
  { value: 'statut', label: 'Statut' },
  { value: 'convention', label: 'Convention' },
  { value: 'chefProjet', label: 'Chef de projet' },
]

// ==================== KANBAN SECTION ====================

const PROJET_KANBAN_STATUSES = [
  { id: 'PLANIFIE', title: 'Planifie', color: colors.neutral[500] },
  { id: 'EN_COURS', title: 'En cours', color: colors.info[600] },
  { id: 'SUSPENDU', title: 'Suspendu', color: colors.warning[600] },
  { id: 'TERMINE', title: 'Termine', color: colors.success[600] },
  { id: 'ANNULE', title: 'Annule', color: colors.danger[600] },
]

const formatBudget = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

const ProjetKanbanSection = ({ data, onCardClick }: { data: Projet[]; onCardClick: (id: number) => void }) => {
  const columns: KanbanColumn<Projet>[] = PROJET_KANBAN_STATUSES.map(col => ({
    ...col,
    items: data.filter(p => p.statut === col.id),
  }))

  return (
    <KanbanBoard<Projet>
      columns={columns}
      getItemId={(p) => String(p.id)}
      renderCard={(p) => (
        <Box onClick={() => onCardClick(p.id!)} sx={{ cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[600] }}>{p.code}</Box>
            <StatusBadge status={p.statut} size="small" />
          </Box>
          <Box sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary, mb: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.nom}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp size={12} style={{ color: colors.textSecondary }} />
            <Box sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
              {formatBudget(p.budgetTotal)} MAD
            </Box>
          </Box>
          {p.pourcentageAvancement > 0 && (
            <Box sx={{ mt: 0.75, height: 4, bgcolor: colors.neutral[200], borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min(p.pourcentageAvancement, 100)}%`, height: '100%', bgcolor: colors.success[500], borderRadius: 2 }} />
            </Box>
          )}
        </Box>
      )}
      emptyMessage="Aucun projet"
    />
  )
}

// ==================== MAIN PAGE ====================

const ProjetsPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState<ProjetFilterState>(EMPTY_FILTERS)
  const [groupBy, setGroupBy] = useState('')
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => {
    try { const s = localStorage.getItem('projet-favorites'); return s ? new Set(JSON.parse(s) as number[]) : new Set() }
    catch { return new Set() }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('projet-favorites', JSON.stringify([...next]))
      return next
    })
  }, [])

  // Dialogs & menus
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [motifDialogOpen, setMotifDialogOpen] = useState(false)
  const [motif, setMotif] = useState('')
  const [actionType, setActionType] = useState<'suspendre' | 'annuler'>('suspendre')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [groupByAnchor, setGroupByAnchor] = useState<HTMLButtonElement | null>(null)
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLElement | null>(null)

  useEffect(() => { fetchProjets() }, [])

  const fetchProjets = async () => {
    try {
      setLoading(true)
      const response = await projetsAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : []
      setProjets(data)
    } catch { showToast('Erreur lors du chargement', 'error') }
    finally { setLoading(false) }
  }

  const chefProjets = useMemo(() => {
    const names = projets.map(p => p.chefProjetNom).filter((n): n is string => Boolean(n))
    return [...new Set(names)].sort()
  }, [projets])

  const filteredData = useMemo(() => {
    return projets.filter(projet => {
      if (showFavoritesOnly && !favoriteIds.has(projet.id ?? 0)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!(projet.code?.toLowerCase().includes(q) || projet.nom?.toLowerCase().includes(q) || (projet.description?.toLowerCase() ?? '').includes(q))) return false
      }
      const f = advancedFilters
      if (f.statut && projet.statut !== f.statut) return false
      if (f.budgetMin && projet.budgetTotal < Number(f.budgetMin)) return false
      if (f.budgetMax && projet.budgetTotal > Number(f.budgetMax)) return false
      if (f.avancementMin && projet.pourcentageAvancement < Number(f.avancementMin)) return false
      if (f.avancementMax && projet.pourcentageAvancement > Number(f.avancementMax)) return false
      if (f.dateDebutFrom && (projet.dateDebut || '') < f.dateDebutFrom) return false
      if (f.dateDebutTo && (projet.dateDebut || '') > f.dateDebutTo) return false
      if (f.chefProjet && projet.chefProjetNom !== f.chefProjet) return false
      return true
    })
  }, [projets, searchQuery, advancedFilters, showFavoritesOnly, favoriteIds])

  const stats = useMemo(() => ({
    total: filteredData.length,
    totalBudget: filteredData.reduce((s, p) => s + p.budgetTotal, 0),
  }), [filteredData])

  // Actions
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, projet: Projet) => {
    e.stopPropagation(); setAnchorEl(e.currentTarget); setSelectedProjet(projet)
  }
  const handleMenuClose = () => { setAnchorEl(null) }

  const handleAction = async (action: string) => {
    if (!selectedProjet) return
    handleMenuClose()
    try {
      switch (action) {
        case 'view': navigate(`/projets/${selectedProjet.id}`); break
        case 'edit': navigate(`/projets/${selectedProjet.id}`); break
        case 'demarrer':
          await projetsAPI.demarrer(selectedProjet.id!)
          showToast('Projet demarre', 'success'); fetchProjets(); break
        case 'reprendre':
          await projetsAPI.reprendre(selectedProjet.id!)
          showToast('Projet repris', 'success'); fetchProjets(); break
        case 'suspendre': setActionType('suspendre'); setMotif(''); setMotifDialogOpen(true); break
        case 'annuler': setActionType('annuler'); setMotif(''); setMotifDialogOpen(true); break
        case 'terminer':
          await projetsAPI.terminer(selectedProjet.id!)
          showToast('Projet termine', 'success'); fetchProjets(); break
        case 'delete': setDeleteConfirmOpen(true); break
      }
    } catch { showToast("Erreur lors de l'action", 'error') }
  }

  const handleMotifConfirm = async () => {
    if (!selectedProjet?.id || !motif.trim()) return
    try {
      if (actionType === 'suspendre') await projetsAPI.suspendre(selectedProjet.id, motif)
      else await projetsAPI.annuler(selectedProjet.id, motif)
      showToast(actionType === 'suspendre' ? 'Projet suspendu' : 'Projet annule', 'success')
      fetchProjets()
    } catch { showToast(`Erreur lors de l'${actionType === 'suspendre' ? 'suspension' : 'annulation'}`, 'error') }
    finally { setMotifDialogOpen(false); setMotif('') }
  }

  const confirmDelete = async () => {
    if (!selectedProjet?.id) return
    try { await projetsAPI.delete(selectedProjet.id); showToast('Projet supprime', 'success'); fetchProjets() }
    catch { showToast('Erreur lors de la suppression', 'error') }
    finally { setDeleteConfirmOpen(false) }
  }

  const handleExport = () => {
    const exportData = filteredData.map(p => ({
      code: p.code, nom: p.nom, statut: p.statut,
      budgetTotal: p.budgetTotal, avancement: p.pourcentageAvancement,
      convention: p.conventionNumero || '-', dateDebut: p.dateDebut,
      chefProjet: p.chefProjetNom || '-',
    }))
    exportToExcel({
      filename: 'projets', sheetName: 'Projets',
      columns: [
        { header: 'Code', key: 'code', width: 18 },
        { header: 'Designation', key: 'nom', width: 35 },
        { header: 'Statut', key: 'statut', width: 14 },
        { header: 'Budget (MAD)', key: 'budgetTotal', width: 22, formatter: formatCurrencyForExport },
        { header: 'Avancement (%)', key: 'avancement', width: 16 },
        { header: 'Convention', key: 'convention', width: 18 },
        { header: 'Date Debut', key: 'dateDebut', width: 16, formatter: formatDateForExport },
        { header: 'Chef de projet', key: 'chefProjet', width: 20 },
      ],
      data: exportData,
    })
  }

  const handleLoadSavedFilter = useCallback((filters: ProjetFilterState, savedGroupBy: string) => {
    setAdvancedFilters(filters); setGroupBy(savedGroupBy); setPage(0)
  }, [])

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  }

  const pStart = filteredData.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredData.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Projets' }]}
          actions={
            <>
              <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => navigate('/projets/nouveau')} sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}>Nouveau</Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={fetchProjets} sx={{ color: colors.textSecondary }}><RefreshCw size={16} /></IconButton>
            </>
          }
          searchValue={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setPage(0) }}
          searchPlaceholder="Rechercher par code, designation, description..."
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode as 'list' | 'kanban')}
          availableViews={['list', 'kanban']}
          paginationInfo={viewMode === 'list' && filteredData.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredData.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          <ProjetAdvancedFilters filters={advancedFilters} onFiltersChange={(f) => { setAdvancedFilters(f); setPage(0) }} chefProjets={chefProjets} />
          <Button variant="outlined" size="small" startIcon={<Layers size={14} />} onClick={(e) => setGroupByAnchor(e.currentTarget)}
            sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5, px: 1.5, ...(groupBy && { borderColor: colors.info[300], bgcolor: colors.info[50], color: colors.info[700] }) }}>
            {groupBy ? `Grouper: ${GROUPBY_OPTIONS.find(o => o.value === groupBy)?.label}` : 'Grouper'}
          </Button>
          <Button
            variant={showFavoritesOnly ? 'contained' : 'outlined'}
            size="small"
            startIcon={<StarIcon sx={{ fontSize: 16 }} />}
            onClick={() => { setShowFavoritesOnly(prev => !prev); setPage(0) }}
            sx={{
              ...(showFavoritesOnly ? componentStyles.buttonPrimary : componentStyles.buttonSecondary),
              fontSize: typography.sizes.sm, py: 0.5, px: 1.5,
              ...(showFavoritesOnly && { bgcolor: colors.warning[500], '&:hover': { bgcolor: colors.warning[600] } }),
            }}
          >
            Favoris{favoriteIds.size > 0 ? ` (${favoriteIds.size})` : ''}
          </Button>
          <SavedFiltersMenu currentFilters={advancedFilters} currentGroupBy={groupBy} onLoadFilter={handleLoadSavedFilter} />
          <IconButton size="small" onClick={(e) => setColumnsAnchor(e.currentTarget)} sx={{ color: colors.textSecondary, p: 0.75 }}><Columns3 size={16} /></IconButton>
          {!loading && (
            <Chip label={`${stats.total} projets — ${(stats.totalBudget / 1000000).toFixed(1)}M MAD`} size="small"
              sx={{ bgcolor: colors.neutral[100], color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, height: 24, ml: 'auto' }} />
          )}
        </ControlPanel>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {viewMode === 'kanban' ? (
            <ProjetKanbanSection data={filteredData} onCardClick={(id) => navigate(`/projets/${id}`)} />
          ) : (
            <ProjetListTable data={filteredData} loading={loading} groupBy={groupBy} columns={columns} page={page} rowsPerPage={rowsPerPage}
              onPageChange={setPage} onRowsPerPageChange={setRowsPerPage} onRowClick={(id) => navigate(`/projets/${id}`)} onMenuOpen={handleMenuOpen}
              favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
          )}
        </Box>
      </Box>

      <GroupByPopover anchorEl={groupByAnchor} onClose={() => setGroupByAnchor(null)} options={GROUPBY_OPTIONS} currentValue={groupBy} onChange={setGroupBy} />
      <ColumnVisibilityPopover anchorEl={columnsAnchor} onClose={() => setColumnsAnchor(null)} columns={columns} onToggle={toggleColumn} />

      <ProjetActionDialogs
        anchorEl={anchorEl} onMenuClose={handleMenuClose} selectedProjet={selectedProjet} onAction={handleAction}
        motifDialogOpen={motifDialogOpen} onMotifClose={() => setMotifDialogOpen(false)} motif={motif} onMotifChange={setMotif} onMotifConfirm={handleMotifConfirm} actionType={actionType}
        deleteConfirmOpen={deleteConfirmOpen} onDeleteConfirm={confirmDelete} onDeleteCancel={() => setDeleteConfirmOpen(false)}
      />
    </AppLayout>
  )
}

export default ProjetsPage
