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
import ProjetTableRow from './ProjetTableRow'
import type { ColumnConfig } from './ProjetTableRow'
import type { Projet } from '@/lib/projetsAPI'

type SortDirection = 'asc' | 'desc'

interface GroupData {
  key: string
  label: string
  projets: Projet[]
  totalBudget: number
  count: number
}

interface ProjetListTableProps {
  data: Projet[]
  loading: boolean
  groupBy: string
  columns: ColumnConfig[]
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rpp: number) => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, projet: Projet) => void
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

const sortProjets = (items: Projet[], col: string, dir: SortDirection): Projet[] => {
  return [...items].sort((a, b) => {
    let cmp = 0
    switch (col) {
      case 'code': cmp = (a.code || '').localeCompare(b.code || ''); break
      case 'statut': cmp = (a.statut || '').localeCompare(b.statut || ''); break
      case 'budget': cmp = a.budgetTotal - b.budgetTotal; break
      case 'avancement': cmp = a.pourcentageAvancement - b.pourcentageAvancement; break
      case 'convention': cmp = (a.conventionNumero || '').localeCompare(b.conventionNumero || ''); break
      case 'dateDebut': cmp = (a.dateDebut || '').localeCompare(b.dateDebut || ''); break
      case 'chefProjet': cmp = (a.chefProjetNom || '').localeCompare(b.chefProjetNom || ''); break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

const groupProjets = (data: Projet[], groupBy: string): GroupData[] => {
  if (!groupBy) {
    return [{ key: '__all__', label: '', projets: data, totalBudget: data.reduce((s, p) => s + p.budgetTotal, 0), count: data.length }]
  }
  const groups = new Map<string, Projet[]>()
  data.forEach((projet) => {
    let key: string
    switch (groupBy) {
      case 'statut': key = projet.statut || 'Non defini'; break
      case 'convention': key = projet.conventionNumero || 'Sans convention'; break
      case 'chefProjet': key = projet.chefProjetNom || 'Non assigne'; break
      default: key = 'Tous'
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(projet)
  })
  return Array.from(groups.entries()).map(([key, projets]) => ({
    key, label: key, projets,
    totalBudget: projets.reduce((s, p) => s + p.budgetTotal, 0), count: projets.length,
  }))
}

const COLUMN_ALIGN: Record<string, 'left' | 'right' | 'center'> = {
  budget: 'right', avancement: 'center',
}

const listStyles = componentStyles.listView

const ProjetListTable = ({
  data, loading, groupBy, columns, page, rowsPerPage,
  onPageChange, onRowsPerPageChange, onRowClick, onMenuOpen,
  favoriteIds, onToggleFavorite,
}: ProjetListTableProps) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState('dateDebut')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const n = new Set(prev)
      if (n.has(key)) n.delete(key)
      else n.add(key)
      return n
    })
  }

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sortedData = useMemo(() => sortProjets(data, sortCol, sortDir), [data, sortCol, sortDir])
  const groups = groupProjets(sortedData, groupBy)
  const paginatedGroups = groupBy
    ? groups
    : groups.map(g => ({ ...g, projets: g.projets.slice(page * rowsPerPage, (page + 1) * rowsPerPage) }))

  const visibleColumns = columns.filter(c => c.visible)
  const hasFavorites = Boolean(onToggleFavorite)
  const totalColSpan = 2 + visibleColumns.length + (hasFavorites ? 1 : 0)

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
              {hasFavorites && <TableCell sx={{ width: 36, px: 0.5 }} />}
              <TableCell onClick={() => handleSort('code')} sx={headerSx}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>Projet<SortIcon col="code" /></Box>
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
                  <Typography sx={{ color: colors.textSecondary }}>Aucun projet trouve</Typography>
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
                  onRowClick={onRowClick}
                  onMenuOpen={onMenuOpen}
                  columns={columns}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
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
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, projet: Projet) => void
  columns: ColumnConfig[]
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  totalColSpan: number
}

const GroupSection = ({
  group, showHeader, collapsed, onToggleSection,
  onRowClick, onMenuOpen, columns, favoriteIds, onToggleFavorite,
  totalColSpan,
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
    {!collapsed && group.projets.map((projet) => (
      <ProjetTableRow
        key={projet.id}
        projet={projet}
        onRowClick={onRowClick}
        onMenuOpen={onMenuOpen}
        columns={columns}
        isFavorite={favoriteIds?.has(projet.id ?? 0) ?? false}
        onToggleFavorite={onToggleFavorite}
        selectable={false}
        selected={false}
        onSelect={() => {}}
      />
    ))}
  </>
)

export default ProjetListTable
