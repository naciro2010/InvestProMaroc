import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  Chip,
} from '@mui/material'
import { Star as StarIcon } from '@mui/icons-material'
import { Plus, RefreshCw, Upload, Layers, Columns3 } from 'lucide-react'
import { conventionsAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, ExportButton } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { exportToExcel, formatCurrencyForExport, formatDateForExport } from '@/lib/exportUtils'
import ImportConventionsDialog from '@/components/conventions/ImportConventionsDialog'
import { getLocalDrafts } from './wizard'
import type { AutosaveState } from './wizard'
import {
  ConventionAdvancedFilters,
  SavedFiltersMenu,
  ConventionListTable,
  ConventionActionDialogs,
  ConventionKanbanView,
  GroupByPopover,
  ColumnVisibilityPopover,
  ConventionSectionTabs,
  ConventionLocalDrafts,
  EMPTY_FILTERS,
  type ConventionFilterState,
  type Convention,
  type ConventionWithChildren,
  type ColumnConfig,
  type ConventionSection,
} from '@/components/conventions/list'

// ==================== CONFIG ====================

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'type', label: 'Type', visible: true },
  { key: 'statut', label: 'Statut', visible: true },
  { key: 'budget', label: 'Budget', visible: true },
  { key: 'commission', label: 'Commission', visible: true },
  { key: 'dateDebut', label: 'Periode', visible: true },
  { key: 'createdBy', label: 'Cree par', visible: true },
]

const GROUPBY_OPTIONS = [
  { value: '', label: 'Aucun' },
  { value: 'statut', label: 'Statut' },
  { value: 'type', label: 'Type' },
  { value: 'createdBy', label: 'Cree par' },
]

const ACTIVE_STATUSES = new Set(['VALIDE', 'VALIDEE', 'EN_EXECUTION'])
const PENDING_STATUSES = new Set(['BROUILLON', 'SOUMIS', 'REJETE'])
const DONE_STATUSES = new Set(['ACHEVE'])

// ==================== MAIN PAGE ====================

type ViewMode = 'list' | 'kanban'

const VALID_SECTIONS: ConventionSection[] = ['actives', 'en_attente', 'terminees', 'brouillons_locaux']

const ConventionsTableModern = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState<ConventionFilterState>(EMPTY_FILTERS)
  const [groupBy, setGroupBy] = useState('')
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [localDrafts, setLocalDrafts] = useState<AutosaveState[]>([])

  // Read section from URL search params, default to 'actives'
  const sectionParam = searchParams.get('section') as ConventionSection | null
  const activeSection: ConventionSection = sectionParam && VALID_SECTIONS.includes(sectionParam) ? sectionParam : 'actives'

  // Favorites (row-level, localStorage-backed)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => {
    try { const s = localStorage.getItem('convention-favorites'); return s ? new Set(JSON.parse(s) as number[]) : new Set() }
    catch { return new Set() }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('convention-favorites', JSON.stringify([...next]))
      return next
    })
  }, [])

  // Dialogs & menus
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [groupByAnchor, setGroupByAnchor] = useState<HTMLButtonElement | null>(null)
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLButtonElement | null>(null)

  useEffect(() => { fetchConventions() }, [])

  // Refresh local drafts on section change or mount
  useEffect(() => {
    setLocalDrafts(getLocalDrafts())
  }, [activeSection])

  const fetchConventions = async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      setConventions(data)
      setLocalDrafts(getLocalDrafts())
    } catch { showToast('Erreur lors du chargement', 'error') }
    finally { setLoading(false) }
  }

  const creators = useMemo(() => {
    const names = conventions.map(c => c.createdByNom).filter((n): n is string => Boolean(n))
    return [...new Set(names)].sort()
  }, [conventions])

  const groupedData = useMemo((): ConventionWithChildren[] => {
    const parents = conventions.filter(c => !c.parentConventionId)
    const children = conventions.filter(c => c.parentConventionId)
    return parents.map(p => ({ ...p, sousConventions: children.filter(c => c.parentConventionId === p.id) }))
  }, [conventions])

  // Section counts for tabs
  const sectionCounts = useMemo(() => ({
    actives: groupedData.filter(c => ACTIVE_STATUSES.has(c.statut)).length,
    en_attente: groupedData.filter(c => PENDING_STATUSES.has(c.statut)).length,
    terminees: groupedData.filter(c => DONE_STATUSES.has(c.statut)).length,
    brouillons_locaux: localDrafts.length,
  }), [groupedData, localDrafts])

  // Filter by active section first, then apply other filters
  const sectionFilteredData = useMemo(() => {
    if (activeSection === 'brouillons_locaux') return []
    return groupedData.filter(conv => {
      switch (activeSection) {
        case 'actives': return ACTIVE_STATUSES.has(conv.statut)
        case 'en_attente': return PENDING_STATUSES.has(conv.statut)
        case 'terminees': return DONE_STATUSES.has(conv.statut)
        default: return true
      }
    })
  }, [groupedData, activeSection])

  const filteredData = useMemo(() => {
    return sectionFilteredData.filter(conv => {
      if (showFavoritesOnly && !favoriteIds.has(conv.id)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const mp = conv.code?.toLowerCase().includes(q) || conv.libelle?.toLowerCase().includes(q) || conv.numero?.toLowerCase().includes(q)
        const mc = conv.sousConventions?.some(sc => sc.code?.toLowerCase().includes(q) || sc.libelle?.toLowerCase().includes(q))
        if (!mp && !mc) return false
      }
      const f = advancedFilters
      if (f.type && conv.type !== f.type) return false
      if (f.statut && conv.statut !== f.statut) return false
      if (f.budgetMin && conv.budget < Number(f.budgetMin)) return false
      if (f.budgetMax && conv.budget > Number(f.budgetMax)) return false
      if (f.commissionMin && conv.tauxCommission < Number(f.commissionMin)) return false
      if (f.commissionMax && conv.tauxCommission > Number(f.commissionMax)) return false
      if (f.dateDebutFrom && conv.dateDebut < f.dateDebutFrom) return false
      if (f.dateDebutTo && conv.dateDebut > f.dateDebutTo) return false
      if (f.createdBy && conv.createdByNom !== f.createdBy) return false
      return true
    })
  }, [sectionFilteredData, searchQuery, advancedFilters, showFavoritesOnly, favoriteIds])

  const stats = useMemo(() => ({
    total: filteredData.length,
    totalBudget: filteredData.reduce((s, c) => s + c.budget, 0),
  }), [filteredData])

  // Actions
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, conv: Convention) => {
    e.stopPropagation(); setAnchorEl(e.currentTarget); setSelectedConvention(conv)
  }
  const handleMenuClose = () => { setAnchorEl(null) }

  const handleAction = async (action: string) => {
    if (!selectedConvention) return
    handleMenuClose()
    try {
      switch (action) {
        case 'view': navigate(`/conventions/${selectedConvention.id}`); break
        case 'edit': navigate(`/conventions/${selectedConvention.id}`); break
        case 'submit':
          await conventionsAPI.soumettre(selectedConvention.id)
          showToast('Convention soumise', 'success'); fetchConventions(); break
        case 'validate':
          if (user?.id) { await conventionsAPI.valider(selectedConvention.id, user.id); showToast('Convention validee', 'success'); fetchConventions() }
          break
        case 'reject': setRejectDialogOpen(true); break
        case 'delete': setDeleteConfirmOpen(true); break
      }
    } catch { showToast("Erreur lors de l'action", 'error') }
  }

  const handleReject = async () => {
    if (!selectedConvention || !motifRejet.trim()) return
    try {
      await conventionsAPI.rejeter(selectedConvention.id, motifRejet)
      showToast('Convention rejetee', 'success'); setRejectDialogOpen(false); setMotifRejet(''); fetchConventions()
    } catch { showToast('Erreur lors du rejet', 'error') }
  }

  const confirmDelete = async () => {
    if (!selectedConvention) return
    try { await conventionsAPI.delete(selectedConvention.id); showToast('Convention supprimee', 'success'); fetchConventions() }
    catch { showToast('Erreur lors de la suppression', 'error') }
    finally { setDeleteConfirmOpen(false) }
  }

  const handleExport = () => {
    const exportData = filteredData.flatMap(conv => {
      const parent: Record<string, unknown> = { code: conv.code, type: conv.type || '-', libelle: conv.libelle, budget: conv.budget, statut: conv.statut, dateDebut: conv.dateDebut }
      const children = (conv.sousConventions || []).map(sc => ({ code: sc.code, type: sc.type || 'SPECIFIQUE', libelle: sc.libelle, budget: sc.budget, statut: sc.statut, dateDebut: sc.dateDebut }))
      return [parent, ...children]
    })
    exportToExcel({
      filename: 'conventions', sheetName: 'Conventions',
      columns: [
        { header: 'Code', key: 'code', width: 18 }, { header: 'Type', key: 'type', width: 14 },
        { header: 'Libelle', key: 'libelle', width: 35 }, { header: 'Budget (MAD)', key: 'budget', width: 22, formatter: formatCurrencyForExport },
        { header: 'Statut', key: 'statut', width: 14 }, { header: 'Date Debut', key: 'dateDebut', width: 16, formatter: formatDateForExport },
      ],
      data: exportData,
    })
  }

  const handleLoadSavedFilter = useCallback((filters: ConventionFilterState, savedGroupBy: string) => {
    setAdvancedFilters(filters); setGroupBy(savedGroupBy); setPage(0)
  }, [])

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  }

  const handleSectionChange = (section: ConventionSection) => {
    setSearchParams(section === 'actives' ? {} : { section })
    setPage(0)
    if (section === 'brouillons_locaux') {
      setLocalDrafts(getLocalDrafts())
    }
  }

  const handleDeleteLocalDraft = () => {
    localStorage.removeItem('convention-wizard-draft')
    setLocalDrafts([])
    showToast('Brouillon local supprime', 'info')
  }

  const handleResumeLocalDraft = () => {
    navigate('/conventions/nouvelle')
  }

  const pStart = filteredData.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredData.length)
  const showTable = activeSection !== 'brouillons_locaux'

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Conventions' }]}
          actions={
            <>
              <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => navigate('/conventions/nouvelle')} sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}>Nouveau</Button>
              <Button variant="outlined" size="small" startIcon={<Upload size={16} />} onClick={() => setImportDialogOpen(true)} sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.75 }}>Importer</Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={fetchConventions} sx={{ color: colors.textSecondary }}><RefreshCw size={16} /></IconButton>
            </>
          }
          searchValue={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setPage(0) }}
          searchPlaceholder="Rechercher par code, libelle, numero..."
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode as ViewMode)}
          availableViews={['list', 'kanban']}
          paginationInfo={showTable && viewMode === 'list' && filteredData.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredData.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          {showTable && (
            <>
              <ConventionAdvancedFilters filters={advancedFilters} onFiltersChange={(f) => { setAdvancedFilters(f); setPage(0) }} creators={creators} />
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
            </>
          )}
          {!loading && showTable && (
            <Chip label={`${stats.total} conventions — ${(stats.totalBudget / 1000000).toFixed(1)}M MAD`} size="small"
              sx={{ bgcolor: colors.neutral[100], color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, height: 24, ml: 'auto' }} />
          )}
        </ControlPanel>

        {/* Gmail-like section tabs */}
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 1 }}>
          <ConventionSectionTabs
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            counts={sectionCounts}
          />
        </Box>

        {/* Content based on active section */}
        {activeSection === 'brouillons_locaux' ? (
          <ConventionLocalDrafts
            drafts={localDrafts}
            onResume={handleResumeLocalDraft}
            onDelete={handleDeleteLocalDraft}
          />
        ) : (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {viewMode === 'kanban' ? (
              <ConventionKanbanView
                data={filteredData.flatMap(c => [c, ...(c.sousConventions || [])])}
                onCardClick={(id) => navigate(`/conventions/${id}`)}
              />
            ) : (
              <ConventionListTable data={filteredData} loading={loading} groupBy={groupBy} columns={columns} page={page} rowsPerPage={rowsPerPage}
                onPageChange={setPage} onRowsPerPageChange={setRowsPerPage} onRowClick={(id) => navigate(`/conventions/${id}`)} onMenuOpen={handleMenuOpen}
                favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
            )}
          </Box>
        )}
      </Box>

      <GroupByPopover anchorEl={groupByAnchor} onClose={() => setGroupByAnchor(null)} options={GROUPBY_OPTIONS} currentValue={groupBy} onChange={setGroupBy} />
      <ColumnVisibilityPopover anchorEl={columnsAnchor} onClose={() => setColumnsAnchor(null)} columns={columns} onToggle={toggleColumn} />

      {/* Action dialogs */}
      <ConventionActionDialogs
        anchorEl={anchorEl} onMenuClose={handleMenuClose} selectedConvention={selectedConvention} isAdmin={user?.roles?.includes('ADMIN') ?? false} onAction={handleAction}
        rejectDialogOpen={rejectDialogOpen} onRejectClose={() => setRejectDialogOpen(false)} motifRejet={motifRejet} onMotifChange={setMotifRejet} onRejectConfirm={handleReject}
        deleteConfirmOpen={deleteConfirmOpen} onDeleteConfirm={confirmDelete} onDeleteCancel={() => setDeleteConfirmOpen(false)}
      />

      <ImportConventionsDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} onSuccess={fetchConventions} existingCodes={conventions.map(c => c.code)} />
    </AppLayout>
  )
}

export default ConventionsTableModern
