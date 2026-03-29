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
  Typography,
  Chip,
} from '@mui/material'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Description, ArrowDropUp, ArrowDropDown } from '@mui/icons-material'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import ConventionTableRow from './ConventionTableRow'

// ==================== TYPES ====================

export interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'VALIDEE' | 'EN_EXECUTION' | 'ACHEVE' | 'REJETE'
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
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  selectable?: boolean
  selectedIds?: Set<number>
  onSelectionChange?: (ids: Set<number>) => void
}

// ==================== HELPERS ====================

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
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
      case 'statut': key = conv.statut || 'Non defini'; break
      case 'type': key = conv.type || 'Non defini'; break
      case 'createdBy': key = conv.createdByNom || 'Non defini'; break
      default: key = 'Tous'
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(conv)
  })
  return Array.from(groups.entries()).map(([key, convs]) => ({
    key, label: key, conventions: convs,
    totalBudget: convs.reduce((s, c) => s + c.budget, 0), count: convs.length,
  }))
}

const COLUMN_ALIGN: Record<string, 'left' | 'right' | 'center'> = {
  budget: 'right', commission: 'center',
}

const listStyles = componentStyles.listView

// ==================== MAIN COMPONENT ====================

const ConventionListTable = ({
  data, loading, groupBy, columns, page, rowsPerPage,
  onPageChange, onRowsPerPageChange, onRowClick, onMenuOpen,
  favoriteIds, onToggleFavorite,
  selectable = false, selectedIds = new Set(), onSelectionChange,
}: ConventionListTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState('dateDebut')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
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
  const totalColSpan = 3 + visibleColumns.length + (selectable ? 1 : 0) + (hasFavorites ? 1 : 0)

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return null
    return sortDir === 'asc' ? <ArrowDropUp sx={{ fontSize: 18, ml: -0.5 }} /> : <ArrowDropDown sx={{ fontSize: 18, ml: -0.5 }} />
  }
  const headerSx = { cursor: 'pointer', userSelect: 'none' as const, '&:hover': { bgcolor: colors.neutral[50] } }

  return (
    <Box sx={listStyles.container}>
      <TableContainer>
        <Table size="small" sx={listStyles.table}>
          <TableHead>
            <TableRow sx={listStyles.headerRow}>
              {selectable && <TableCell padding="checkbox" sx={{ width: 42 }} />}
              {hasFavorites && <TableCell sx={{ width: 36, px: 0.5 }} />}
              <TableCell sx={{ width: 40, pl: 1 }} />
              <TableCell onClick={() => handleSort('code')} sx={headerSx}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>Convention<SortIcon col="code" /></Box>
              </TableCell>
              {visibleColumns.map(col => (
                <TableCell key={col.key} align={COLUMN_ALIGN[col.key] || 'left'} onClick={() => handleSort(col.key)} sx={headerSx}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{col.label}<SortIcon col={col.key} /></Box>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ width: 50 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                  <TableCell colSpan={totalColSpan} sx={{ py: 1.5 }}>
                    <Box sx={{ height: 36, bgcolor: colors.neutral[100], borderRadius: 1, animation: 'pulse 1.5s infinite' }} />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColSpan} align="center" sx={{ py: 8 }}>
                  <Description sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                  <Typography sx={{ color: colors.textSecondary }}>Aucune convention trouvee</Typography>
                  <Typography sx={{ color: colors.neutral[400], fontSize: typography.sizes.sm, mt: 0.5 }}>
                    Essayez de modifier vos filtres
                  </Typography>
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
                  expandedRows={expandedRows}
                  onToggleRow={toggleRow}
                  onRowClick={onRowClick}
                  onMenuOpen={onMenuOpen}
                  columns={columns}
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
          labelRowsPerPage="Par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          sx={{ borderTop: `1px solid ${colors.divider}`, '.MuiTablePagination-select': { fontWeight: typography.weights.semibold } }}
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
  expandedRows: Set<number>
  onToggleRow: (id: number) => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, conv: Convention) => void
  columns: ColumnConfig[]
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  selectable: boolean
  selectedIds: Set<number>
  onSelect: (id: number) => void
  totalColSpan: number
}

const GroupSection = ({
  group, showHeader, collapsed, onToggleSection, expandedRows,
  onToggleRow, onRowClick, onMenuOpen, columns, favoriteIds, onToggleFavorite,
  selectable, selectedIds, onSelect, totalColSpan,
}: GroupSectionProps) => (
  <>
    {showHeader && (
      <TableRow sx={listStyles.groupHeaderRow} onClick={onToggleSection}>
        <TableCell colSpan={totalColSpan}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm }}>
              {group.label}
            </Typography>
            <Chip label={group.count} size="small" sx={{ height: 20, minWidth: 24, fontSize: typography.sizes['2xs'], fontWeight: typography.weights.bold, bgcolor: colors.neutral[200] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, ml: 'auto' }}>
              Total: {formatCurrency(group.totalBudget)} MAD
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    )}
    {!collapsed && group.conventions.map((conv) => (
      <ConventionTableRow
        key={conv.id}
        conv={conv}
        expanded={expandedRows.has(conv.id)}
        onToggle={() => onToggleRow(conv.id)}
        onRowClick={onRowClick}
        onMenuOpen={onMenuOpen}
        columns={columns}
        isFavorite={favoriteIds?.has(conv.id) ?? false}
        onToggleFavorite={onToggleFavorite}
        selectable={selectable}
        selected={selectedIds.has(conv.id)}
        onSelect={onSelect}
      />
    ))}
  </>
)

export default ConventionListTable
