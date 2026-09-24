import { useState, useMemo } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Skeleton,
} from '@mui/material'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { formatMillions } from '@/lib/utils'
import ConventionTableRow from './ConventionTableRow'

// ==================== TYPES ====================

export interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'VALIDEE' | 'EN_EXECUTION' | 'ACHEVE' | 'REJETE' | 'ANNULE'
  type?: 'CADRE' | 'SPECIFIQUE' | 'NON_CADRE' | 'AVENANT'
  budget: number
  tauxCommission: number
  dateDebut: string
  dateFin?: string
  isLocked: boolean
  createdByNom?: string
  parentConventionId?: number
  sousConventionsCount?: number
}

export interface ConventionWithChildren extends Convention {
  sousConventions: Convention[]
}

export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
}

type SortDirection = 'asc' | 'desc'

interface GroupData {
  key: string
  label: string
  conventions: ConventionWithChildren[]
  totalBudget: number
  count: number
}

interface ConventionListTableProps {
  data: ConventionWithChildren[]
  loading: boolean
  groupBy: string
  columns: ColumnConfig[]
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rpp: number) => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, conv: Convention) => void
  /** Taux d'engagement par convention (colonne « Engagé ») */
  engagement?: Record<number, number>
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  selectable?: boolean
  selectedIds?: Set<number>
  onSelectionChange?: (ids: Set<number>) => void
}

// ==================== HELPERS ====================

const TYPE_LABELS: Record<string, string> = { CADRE: 'Cadre', SPECIFIQUE: 'Spécifique', NON_CADRE: 'Non cadre', AVENANT: 'Avenant' }

const groupLabel = (groupBy: string, key: string): string => {
  if (groupBy === 'statut') return getStatusConfig(key).label
  if (groupBy === 'type') return TYPE_LABELS[key] ?? key
  return key
}

const sortConventions = (items: ConventionWithChildren[], col: string, dir: SortDirection): ConventionWithChildren[] => {
  return [...items].sort((a, b) => {
    let cmp = 0
    switch (col) {
      case 'code': cmp = (a.code || '').localeCompare(b.code || ''); break
      case 'type': cmp = (a.type || '').localeCompare(b.type || ''); break
      case 'statut': cmp = (a.statut || '').localeCompare(b.statut || ''); break
      case 'budget': cmp = a.budget - b.budget; break
      case 'commission': cmp = a.tauxCommission - b.tauxCommission; break
      case 'dateDebut': cmp = (a.dateDebut || '').localeCompare(b.dateDebut || ''); break
      case 'createdBy': cmp = (a.createdByNom || '').localeCompare(b.createdByNom || ''); break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

const groupConventions = (data: ConventionWithChildren[], groupBy: string): GroupData[] => {
  if (!groupBy) {
    return [{ key: '__all__', label: '', conventions: data, totalBudget: data.reduce((s, c) => s + c.budget, 0), count: data.length }]
  }
  const groups = new Map<string, ConventionWithChildren[]>()
  data.forEach((conv) => {
    let key: string
    switch (groupBy) {
      case 'statut': key = conv.statut || 'Non défini'; break
      case 'type': key = conv.type || 'Non défini'; break
      case 'createdBy': key = conv.createdByNom || 'Non défini'; break
      default: key = 'Tous'
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(conv)
  })
  return Array.from(groups.entries()).map(([key, convs]) => ({
    key, label: groupLabel(groupBy, key), conventions: convs,
    totalBudget: convs.reduce((s, c) => s + c.budget, 0), count: convs.length,
  }))
}

const COLUMN_ALIGN: Record<string, 'left' | 'right' | 'center'> = {
  budget: 'right', commission: 'right', engage: 'right',
}

const listStyles = componentStyles.listView

// ==================== MAIN COMPONENT ====================

const ConventionListTable = ({
  data, loading, groupBy, columns, page, rowsPerPage,
  onPageChange, onRowsPerPageChange, onRowClick, onMenuOpen,
  engagement, favoriteIds, onToggleFavorite,
  selectable = false, selectedIds = new Set(), onSelectionChange,
}: ConventionListTableProps) => {
  // Les sous-conventions sont affichées par défaut sous leur convention mère
  const [collapsedRows, setCollapsedRows] = useState<Set<number>>(new Set())
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState('dateDebut')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const toggleRow = (id: number) => {
    setCollapsedRows(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }
  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const n = new Set(prev)
      if (n.has(key)) n.delete(key)
      else n.add(key)
      return n
    })
  }
  const handleSelect = (id: number) => {
    const n = new Set(selectedIds)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    onSelectionChange?.(n)
  }
  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sortedData = useMemo(() => sortConventions(data, sortCol, sortDir), [data, sortCol, sortDir])
  const groups = groupConventions(sortedData, groupBy)
  const paginatedGroups = groupBy
    ? groups
    : groups.map(g => ({ ...g, conventions: g.conventions.slice(page * rowsPerPage, (page + 1) * rowsPerPage) }))

  const visibleColumns = columns.filter(c => c.visible)
  const hasFavorites = Boolean(onToggleFavorite)
  const totalColSpan = 2 + visibleColumns.length + (selectable ? 1 : 0) + (hasFavorites ? 1 : 0)

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return null
    return sortDir === 'asc' ? <ArrowDropUp sx={{ fontSize: 18, ml: -0.5 }} /> : <ArrowDropDown sx={{ fontSize: 18, ml: -0.5 }} />
  }
  const headerSx = { cursor: 'pointer', userSelect: 'none' as const, '&:hover': { color: colors.textPrimary } }
  const ariaSort = (col: string) => (sortCol === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined)

  return (
    <Box sx={listStyles.container}>
      <TableContainer>
        <Table size="small" sx={{ ...listStyles.table, minWidth: 860 }}>
          <TableHead>
            <TableRow sx={listStyles.headerRow}>
              {selectable && <TableCell padding="checkbox" sx={{ width: 42 }} />}
              {hasFavorites && <TableCell sx={{ width: 40, pl: 2, pr: 0 }}><span className="sr-only">Favori</span></TableCell>}
              <TableCell onClick={() => handleSort('code')} sx={{ ...headerSx, pl: '38px !important' }} aria-sort={ariaSort('code')}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>Convention<SortIcon col="code" /></Box>
              </TableCell>
              {visibleColumns.map(col => (
                <TableCell
                  key={col.key}
                  align={COLUMN_ALIGN[col.key] || 'left'}
                  onClick={() => col.key !== 'engage' && handleSort(col.key)}
                  sx={col.key === 'engage' ? undefined : headerSx}
                  aria-sort={ariaSort(col.key)}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{col.label}<SortIcon col={col.key} /></Box>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ width: 48 }}><span className="sr-only">Actions</span></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                  <TableCell colSpan={totalColSpan} sx={{ py: 1.25, px: 3 }}>
                    <Skeleton variant="rounded" height={32} />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColSpan} sx={{ py: 3, px: 3, fontSize: 13, color: colors.textTertiary }}>
                  Aucune convention ne correspond à la sélection. Essayez de modifier ou d'effacer les filtres.
                </TableCell>
              </TableRow>
            ) : (
              paginatedGroups.map((group) => (
                <GroupSection
                  key={group.key}
                  group={group}
                  showHeader={groupBy !== ''}
                  collapsed={collapsedSections.has(group.key)}
                  onToggleSection={() => toggleSection(group.key)}
                  collapsedRows={collapsedRows}
                  onToggleRow={toggleRow}
                  onRowClick={onRowClick}
                  onMenuOpen={onMenuOpen}
                  columns={columns}
                  engagement={engagement}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  selectable={selectable}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  totalColSpan={totalColSpan}
                />
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { onRowsPerPageChange(parseInt(e.target.value, 10)); onPageChange(0) }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          sx={{ bgcolor: colors.surfaceAlt, '.MuiTablePagination-select': { fontWeight: typography.weights.semibold } }}
        />
      </TableContainer>
    </Box>
  )
}

// ==================== GROUP SECTION ====================

interface GroupSectionProps {
  group: GroupData
  showHeader: boolean
  collapsed: boolean
  onToggleSection: () => void
  collapsedRows: Set<number>
  onToggleRow: (id: number) => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, conv: Convention) => void
  columns: ColumnConfig[]
  engagement?: Record<number, number>
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  selectable: boolean
  selectedIds: Set<number>
  onSelect: (id: number) => void
  totalColSpan: number
}

const GroupSection = ({
  group, showHeader, collapsed, onToggleSection, collapsedRows,
  onToggleRow, onRowClick, onMenuOpen, columns, engagement, favoriteIds, onToggleFavorite,
  selectable, selectedIds, onSelect, totalColSpan,
}: GroupSectionProps) => (
  <>
    {showHeader && (
      <TableRow sx={listStyles.groupHeaderRow} onClick={onToggleSection} aria-expanded={!collapsed}>
        <TableCell colSpan={totalColSpan} sx={{ pl: '24px !important', color: `${colors.textSecondary} !important`, fontSize: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {collapsed ? <ChevronRight size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
            {group.label} · {group.count} · {formatMillions(group.totalBudget)} MAD
          </Box>
        </TableCell>
      </TableRow>
    )}
    {!collapsed && group.conventions.map((conv) => (
      <ConventionTableRow
        key={conv.id}
        conv={conv}
        expanded={!collapsedRows.has(conv.id)}
        onToggle={() => onToggleRow(conv.id)}
        onRowClick={onRowClick}
        onMenuOpen={onMenuOpen}
        columns={columns}
        engagement={engagement}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
        selectable={selectable}
        selectedIds={selectedIds}
        onSelect={onSelect}
      />
    ))}
  </>
)

export default ConventionListTable
