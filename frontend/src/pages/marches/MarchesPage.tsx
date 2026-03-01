import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Chip,
  Popover,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { Star as StarIcon } from '@mui/icons-material'
import { Plus, RefreshCw, Layers, Columns3, Map as MapIcon } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import MarchesMapView from '@/components/ui/MarchesMapView'
import { ControlPanel, ExportButton } from '@/components/core'
import ConfirmDialog from '@/components/core/ConfirmDialog'
import {
  MarcheListTable,
  MarcheAdvancedFilters,
  EMPTY_FILTERS,
  type MarcheListItem,
  type MarcheFilterState,
} from '@/components/marches/list'
import { useToast } from '@/contexts/ToastContext'
import api from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { exportToExcel, formatCurrencyForExport } from '@/lib/exportUtils'

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'numAo', label: 'N AO', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'fournisseur', label: 'Fournisseur', visible: true },
  { key: 'convention', label: 'Convention', visible: true },
  { key: 'montant', label: 'Montant TTC', visible: true },
  { key: 'lignes', label: 'Lignes', visible: true },
  { key: 'statut', label: 'Statut', visible: true },
]

const GROUPBY_OPTIONS = [
  { value: '', label: 'Aucun' },
  { value: 'statut', label: 'Statut' },
  { value: 'typeMarche', label: 'Type' },
  { value: 'fournisseurNom', label: 'Fournisseur' },
]

export default function MarchesPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [marches, setMarches] = useState<MarcheListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState<MarcheFilterState>(EMPTY_FILTERS)
  const [groupBy, setGroupBy] = useState('')
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Favorites (localStorage-backed)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => {
    try { const s = localStorage.getItem('marche-favorites'); return s ? new Set(JSON.parse(s) as number[]) : new Set() }
    catch { return new Set() }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('marche-favorites', JSON.stringify([...next]))
      return next
    })
  }, [])

  // Popovers
  const [groupByAnchor, setGroupByAnchor] = useState<HTMLButtonElement | null>(null)
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLButtonElement | null>(null)

  useEffect(() => { fetchMarches() }, [])

  const fetchMarches = async () => {
    try {
      setLoading(true)
      const response = await api.get('/marches/list')
      setMarches(response.data)
    } catch {
      showError('Erreur lors du chargement des marches')
    } finally {
      setLoading(false)
    }
  }

  // Extract unique fournisseurs and conventions for filter dropdowns
  const fournisseurs = useMemo(() => {
    const names = marches.map(m => m.fournisseurNom).filter((n): n is string => Boolean(n))
    return [...new Set(names)].sort()
  }, [marches])

  const conventionNames = useMemo(() => {
    const names = marches.map(m => m.conventionNumero || m.conventionLibelle).filter((n): n is string => Boolean(n))
    return [...new Set(names)].sort()
  }, [marches])

  const filteredMarches = useMemo(() => {
    return marches.filter(m => {
      if (showFavoritesOnly && !favoriteIds.has(m.id)) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        if (!(
          m.numeroMarche.toLowerCase().includes(q) ||
          m.objet.toLowerCase().includes(q) ||
          m.fournisseurNom.toLowerCase().includes(q) ||
          (m.conventionLibelle?.toLowerCase() ?? '').includes(q) ||
          (m.conventionNumero?.toLowerCase() ?? '').includes(q)
        )) return false
      }
      const f = advancedFilters
      if (f.typeMarche && m.typeMarche !== f.typeMarche) return false
      if (f.statut && m.statut !== f.statut) return false
      if (f.fournisseur && m.fournisseurNom !== f.fournisseur) return false
      if (f.convention) {
        const convName = m.conventionNumero || m.conventionLibelle || ''
        if (convName !== f.convention) return false
      }
      if (f.montantMin && m.montantTtc < Number(f.montantMin)) return false
      if (f.montantMax && m.montantTtc > Number(f.montantMax)) return false
      if (f.dateFrom && m.dateMarche < f.dateFrom) return false
      if (f.dateTo && m.dateMarche > f.dateTo) return false
      return true
    })
  }, [marches, searchTerm, advancedFilters, showFavoritesOnly, favoriteIds])

  const stats = useMemo(() => ({
    total: filteredMarches.length,
    totalMontant: filteredMarches.reduce((s, m) => s + m.montantTtc, 0),
  }), [filteredMarches])

  const handleDelete = (id: number) => setDeleteConfirm({ open: true, id })

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      await api.delete(`/marches/${deleteConfirm.id}`)
      showSuccess('Marche supprime avec succes')
      fetchMarches()
    } catch {
      showError('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleExport = () => {
    const exportData: Record<string, unknown>[] = filteredMarches.map(m => ({
      numeroMarche: m.numeroMarche,
      objet: m.objet,
      montantHt: m.montantHt,
      montantTtc: m.montantTtc,
      convention: m.conventionNumero || m.conventionLibelle || '-',
      fournisseur: m.fournisseurNom,
      statut: m.statut,
    }))
    exportToExcel({
      filename: 'marches',
      sheetName: 'Marches',
      columns: [
        { header: 'Code', key: 'numeroMarche', width: 18 },
        { header: 'Objet', key: 'objet', width: 35 },
        { header: 'Montant HT (MAD)', key: 'montantHt', width: 22, formatter: formatCurrencyForExport },
        { header: 'Montant TTC (MAD)', key: 'montantTtc', width: 22, formatter: formatCurrencyForExport },
        { header: 'Convention', key: 'convention', width: 20 },
        { header: 'Fournisseur', key: 'fournisseur', width: 20 },
        { header: 'Statut', key: 'statut', width: 14 },
      ],
      data: exportData,
    })
  }

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  }

  const pStart = filteredMarches.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredMarches.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Marches' }]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => navigate('/marches/nouveau')}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau
              </Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={fetchMarches} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setPage(0) }}
          searchPlaceholder="Rechercher par code, objet, fournisseur..."
          paginationInfo={filteredMarches.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredMarches.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode as 'list' | 'map')}
          availableViews={['list', 'map']}
        >
          <MarcheAdvancedFilters
            filters={advancedFilters}
            onFiltersChange={(f) => { setAdvancedFilters(f); setPage(0) }}
            fournisseurs={fournisseurs}
            conventions={conventionNames}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Layers size={14} />}
            onClick={(e) => setGroupByAnchor(e.currentTarget)}
            sx={{
              ...componentStyles.buttonSecondary,
              fontSize: typography.sizes.sm,
              py: 0.5,
              px: 1.5,
              ...(groupBy && {
                borderColor: colors.info[300],
                bgcolor: colors.info[50],
                color: colors.info[700],
              }),
            }}
          >
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
          {viewMode === 'map' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MapIcon size={14} />}
              onClick={() => setViewMode('list')}
              sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5, px: 1.5, borderColor: colors.success[300], bgcolor: colors.success[50], color: colors.success[700] }}
            >
              Vue carte
            </Button>
          )}
          <IconButton size="small" onClick={(e) => setColumnsAnchor(e.currentTarget)} sx={{ color: colors.textSecondary, p: 0.75 }}>
            <Columns3 size={16} />
          </IconButton>
          {!loading && (
            <Chip
              label={`${stats.total} marches — ${(stats.totalMontant / 1000000).toFixed(1)}M MAD`}
              size="small"
              sx={{ bgcolor: colors.neutral[100], color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, height: 24, ml: 'auto' }}
            />
          )}
        </ControlPanel>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {viewMode === 'map' && (
            <Box sx={{ mt: 0 }}>
              <MarchesMapView marches={filteredMarches} />
            </Box>
          )}

          {viewMode === 'list' && (
            <MarcheListTable
              data={filteredMarches}
              rawData={marches}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0) }}
              onRowClick={(id) => navigate(`/marches/${id}`)}
              onEdit={(id) => navigate(`/marches/${id}`)}
              onDelete={handleDelete}
              onConventionClick={(id) => navigate(`/conventions/${id}`)}
              columns={columns}
              groupBy={groupBy}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </Box>
      </Box>

      {/* Group By popover */}
      <Popover
        open={Boolean(groupByAnchor)}
        anchorEl={groupByAnchor}
        onClose={() => setGroupByAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mt: 0.5 } }}
      >
        {GROUPBY_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} selected={groupBy === opt.value} onClick={() => { setGroupBy(opt.value); setGroupByAnchor(null) }} sx={{ fontSize: typography.sizes.sm, minWidth: 160 }}>
            {opt.label}
          </MenuItem>
        ))}
      </Popover>

      {/* Column visibility popover */}
      <Popover
        open={Boolean(columnsAnchor)}
        anchorEl={columnsAnchor}
        onClose={() => setColumnsAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mt: 0.5, p: 1, minWidth: 180 } }}
      >
        <Typography sx={{ px: 1, py: 0.5, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Colonnes visibles
        </Typography>
        {columns.map((col) => (
          <FormControlLabel
            key={col.key}
            control={<Checkbox size="small" checked={col.visible} onChange={() => toggleColumn(col.key)} sx={{ p: 0.5, ml: 0.5 }} />}
            label={col.label}
            sx={{ display: 'flex', mx: 0, '& .MuiFormControlLabel-label': { fontSize: typography.sizes.sm } }}
          />
        ))}
      </Popover>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Supprimer le marche"
        message="Cette action est irreversible. Voulez-vous continuer ?"
        variant="danger"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AppLayout>
  )
}
