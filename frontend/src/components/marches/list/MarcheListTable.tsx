import { useState, useMemo } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Visibility, Edit, Delete, Description, ArrowDropUp, ArrowDropDown, MoreVert } from '@mui/icons-material'
import { ChevronDown, ChevronRight, Star } from 'lucide-react'
import { StatusBadge } from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { MarcheListItem } from './types'

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
}

interface MarcheListTableProps {
  data: MarcheListItem[]
  rawData: MarcheListItem[]
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onRowClick: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onConventionClick: (id: number) => void
  columns?: ColumnConfig[]
  groupBy?: string
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
}

type SortDirection = 'asc' | 'desc'

interface GroupData {
  key: string
  label: string
  items: MarcheListItem[]
  totalMontant: number
  count: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatShort = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

const sortMarches = (items: MarcheListItem[], col: string, dir: SortDirection): MarcheListItem[] => {
  return [...items].sort((a, b) => {
    let cmp = 0
    switch (col) {
      case 'numeroMarche': cmp = (a.numeroMarche || '').localeCompare(b.numeroMarche || ''); break
      case 'objet': cmp = (a.objet || '').localeCompare(b.objet || ''); break
      case 'montantTtc': cmp = a.montantTtc - b.montantTtc; break
      case 'statut': cmp = (a.statut || '').localeCompare(b.statut || ''); break
      case 'fournisseurNom': cmp = (a.fournisseurNom || '').localeCompare(b.fournisseurNom || ''); break
      case 'typeMarche': cmp = (a.typeMarche || '').localeCompare(b.typeMarche || ''); break
      case 'dateMarche': cmp = (a.dateMarche || '').localeCompare(b.dateMarche || ''); break
      default: break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

const groupMarches = (data: MarcheListItem[], groupBy: string): GroupData[] => {
  if (!groupBy) {
    return [{ key: '__all__', label: '', items: data, totalMontant: data.reduce((s, m) => s + m.montantTtc, 0), count: data.length }]
  }
  const groups = new Map<string, MarcheListItem[]>()
  data.forEach((m) => {
    let key: string
    switch (groupBy) {
      case 'statut': key = m.statut || 'Non defini'; break
      case 'typeMarche': key = m.typeMarche || 'Non defini'; break
      case 'fournisseurNom': key = m.fournisseurNom || 'Non defini'; break
      default: key = 'Tous'
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(m)
  })
  return Array.from(groups.entries()).map(([key, items]) => ({
    key, label: key, items,
    totalMontant: items.reduce((s, m) => s + m.montantTtc, 0), count: items.length,
  }))
}

const listStyles = componentStyles.listView

export default function MarcheListTable({
  data,
  rawData: _rawData,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onEdit,
  onDelete,
  onConventionClick,
  columns,
  groupBy = '',
  favoriteIds,
  onToggleFavorite,
}: MarcheListTableProps) {
  const [sortCol, setSortCol] = useState('numeroMarche')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuMarche, setMenuMarche] = useState<MarcheListItem | null>(null)

  const hasFavorites = Boolean(onToggleFavorite)
  const isColumnVisible = (key: string) => !columns || columns.find(c => c.key === key)?.visible !== false

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const n = new Set(prev)
      if (n.has(key)) n.delete(key)
      else n.add(key)
      return n
    })
  }

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, marche: MarcheListItem) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
    setMenuMarche(marche)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuMarche(null)
  }

  const sortedData = useMemo(() => sortMarches(data, sortCol, sortDir), [data, sortCol, sortDir])
  const groups = useMemo(() => groupMarches(sortedData, groupBy), [sortedData, groupBy])
  const paginatedGroups = groupBy
    ? groups
    : groups.map(g => ({ ...g, items: g.items.slice(page * rowsPerPage, (page + 1) * rowsPerPage) }))

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return null
    return sortDir === 'asc' ? <ArrowDropUp sx={{ fontSize: 18, ml: -0.5 }} /> : <ArrowDropDown sx={{ fontSize: 18, ml: -0.5 }} />
  }
  const headerSx = { cursor: 'pointer', userSelect: 'none' as const, '&:hover': { bgcolor: colors.neutral[50] } }

  const totalColSpan = 4 + (hasFavorites ? 1 : 0) +
    (isColumnVisible('numAo') ? 1 : 0) + (isColumnVisible('type') ? 1 : 0) +
    (isColumnVisible('fournisseur') ? 1 : 0) + (isColumnVisible('convention') ? 1 : 0) +
    (isColumnVisible('montant') ? 1 : 0) + (isColumnVisible('lignes') ? 1 : 0) +
    (isColumnVisible('statut') ? 1 : 0)

  return (
    <Box sx={listStyles.container}>
      <TableContainer>
        <Table size="small" sx={listStyles.table}>
          <TableHead>
            <TableRow sx={listStyles.headerRow}>
              {hasFavorites && <TableCell sx={{ width: 36, px: 0.5 }} />}
              <TableCell onClick={() => handleSort('numeroMarche')} sx={headerSx}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>N Marche<SortIcon col="numeroMarche" /></Box>
              </TableCell>
              {isColumnVisible('numAo') && <TableCell>N AO</TableCell>}
              {isColumnVisible('type') && <TableCell>Type</TableCell>}
              <TableCell onClick={() => handleSort('objet')} sx={{ ...headerSx, minWidth: 200 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>Objet<SortIcon col="objet" /></Box>
              </TableCell>
              {isColumnVisible('fournisseur') && (
                <TableCell onClick={() => handleSort('fournisseurNom')} sx={headerSx}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>Fournisseur<SortIcon col="fournisseurNom" /></Box>
                </TableCell>
              )}
              {isColumnVisible('convention') && <TableCell>Convention</TableCell>}
              {isColumnVisible('montant') && (
                <TableCell align="right" onClick={() => handleSort('montantTtc')} sx={headerSx}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>Montant TTC<SortIcon col="montantTtc" /></Box>
                </TableCell>
              )}
              {isColumnVisible('lignes') && <TableCell align="center">Lignes</TableCell>}
              {isColumnVisible('statut') && (
                <TableCell align="center" onClick={() => handleSort('statut')} sx={headerSx}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>Statut<SortIcon col="statut" /></Box>
                </TableCell>
              )}
              <TableCell align="center" sx={{ width: 50 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColSpan} align="center" sx={{ py: 8 }}>
                  <Description sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                  <Typography sx={{ color: colors.textSecondary }}>Aucun marche trouve</Typography>
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
                  onConventionClick={onConventionClick}
                  onMenuOpen={handleMenuOpen}
                  isColumnVisible={isColumnVisible}
                  hasFavorites={hasFavorites}
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
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange(parseInt(e.target.value, 10))
            onPageChange(0)
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          sx={{ borderTop: `1px solid ${colors.divider}`, '.MuiTablePagination-select': { fontWeight: typography.weights.semibold } }}
        />
      </TableContainer>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: 160 } }}
      >
        <MenuItem onClick={() => { if (menuMarche) onRowClick(menuMarche.id); handleMenuClose() }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: typography.sizes.sm }}>Voir</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (menuMarche) onEdit(menuMarche.id); handleMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: typography.sizes.sm }}>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (menuMarche) onDelete(menuMarche.id); handleMenuClose() }} sx={{ color: colors.danger[600] }}>
          <ListItemIcon><Delete fontSize="small" sx={{ color: colors.danger[600] }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: typography.sizes.sm }}>Supprimer</ListItemText>
        </MenuItem>
      </Menu>
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
  onConventionClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, m: MarcheListItem) => void
  isColumnVisible: (key: string) => boolean
  hasFavorites: boolean
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  totalColSpan: number
}

const GroupSection = ({
  group, showHeader, collapsed, onToggleSection, onRowClick, onConventionClick, onMenuOpen,
  isColumnVisible, hasFavorites, favoriteIds, onToggleFavorite, totalColSpan,
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
              Total: {formatShort(group.totalMontant)} MAD
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    )}
    {!collapsed && group.items.map((marche) => (
      <MarcheTableRow
        key={marche.id}
        marche={marche}
        onRowClick={onRowClick}
        onConventionClick={onConventionClick}
        onMenuOpen={onMenuOpen}
        isColumnVisible={isColumnVisible}
        hasFavorites={hasFavorites}
        isFavorite={favoriteIds?.has(marche.id) ?? false}
        onToggleFavorite={onToggleFavorite}
      />
    ))}
  </>
)

// ==================== TABLE ROW ====================

interface MarcheTableRowProps {
  marche: MarcheListItem
  onRowClick: (id: number) => void
  onConventionClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, m: MarcheListItem) => void
  isColumnVisible: (key: string) => boolean
  hasFavorites: boolean
  isFavorite: boolean
  onToggleFavorite?: (id: number) => void
}

const MarcheTableRow = ({
  marche, onRowClick, onConventionClick, onMenuOpen,
  isColumnVisible, hasFavorites, isFavorite, onToggleFavorite,
}: MarcheTableRowProps) => (
  <TableRow sx={listStyles.dataRow} hover>
    {hasFavorites && (
      <TableCell sx={{ px: 0.5, width: 36 }}>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(marche.id) }}
          sx={{ p: 0.25, color: isFavorite ? colors.warning[500] : colors.neutral[300], '&:hover': { color: colors.warning[500] } }}
        >
          <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </IconButton>
      </TableCell>
    )}
    <TableCell
      onClick={() => onRowClick(marche.id)}
      sx={{ cursor: 'pointer', fontWeight: typography.weights.medium, color: colors.primary[700] }}
    >
      {marche.numeroMarche}
    </TableCell>
    {isColumnVisible('numAo') && (
      <TableCell onClick={() => onRowClick(marche.id)} sx={{ cursor: 'pointer', color: colors.textSecondary }}>
        {marche.numAo || '-'}
      </TableCell>
    )}
    {isColumnVisible('type') && (
      <TableCell onClick={() => onRowClick(marche.id)} sx={{ cursor: 'pointer' }}>
        <StatusBadge status={marche.typeMarche || 'MARCHE'} size="small" />
      </TableCell>
    )}
    <TableCell onClick={() => onRowClick(marche.id)} sx={{ cursor: 'pointer', maxWidth: 280 }}>
      <RichTextDisplay html={marche.objet} variant="inline" sx={{ maxWidth: 280 }} />
    </TableCell>
    {isColumnVisible('fournisseur') && (
      <TableCell onClick={() => onRowClick(marche.id)} sx={{ cursor: 'pointer' }}>
        {marche.fournisseurNom}
      </TableCell>
    )}
    {isColumnVisible('convention') && (
      <TableCell onClick={(e) => e.stopPropagation()}>
        {marche.conventionId ? (
          <Box
            component="span"
            onClick={() => onConventionClick(marche.conventionId!)}
            sx={{
              display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
              color: colors.primary[700], fontWeight: typography.weights.medium,
              fontSize: typography.sizes.sm, px: 1, py: 0.25, borderRadius: '4px',
              '&:hover': { bgcolor: colors.primary[50], textDecoration: 'underline' },
            }}
          >
            {marche.conventionNumero || marche.conventionLibelle || '-'}
          </Box>
        ) : (
          <Box component="span" sx={{
            display: 'inline-flex', alignItems: 'center', px: 1, py: 0.25, borderRadius: '4px',
            bgcolor: colors.neutral[100], color: colors.textSecondary, fontSize: typography.sizes.xs,
            fontWeight: typography.weights.medium,
          }}>
            Aucune
          </Box>
        )}
      </TableCell>
    )}
    {isColumnVisible('montant') && (
      <TableCell onClick={() => onRowClick(marche.id)} align="right"
        sx={{ cursor: 'pointer', fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
        {formatCurrency(marche.montantTtc)}
      </TableCell>
    )}
    {isColumnVisible('lignes') && (
      <TableCell onClick={() => onRowClick(marche.id)} align="center" sx={{ cursor: 'pointer' }}>
        <Box component="span" sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 24, height: 24, borderRadius: '6px',
          bgcolor: colors.primary[100], color: colors.primary[700],
          fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, px: 1,
        }}>
          {marche.nbLignes}
        </Box>
      </TableCell>
    )}
    {isColumnVisible('statut') && (
      <TableCell onClick={() => onRowClick(marche.id)} align="center" sx={{ cursor: 'pointer' }}>
        <StatusBadge status={marche.statut} />
      </TableCell>
    )}
    <TableCell align="center">
      <IconButton size="small" onClick={(e) => onMenuOpen(e, marche)} sx={{ color: colors.neutral[500] }}>
        <MoreVert fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
)
