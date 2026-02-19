import { ReactNode, useState, useMemo } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Skeleton,
} from '@mui/material'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { componentStyles, colors, typography, transitions } from '@/lib/designSystem'

// ==================== TYPES ====================

type SortDirection = 'asc' | 'desc' | null

interface ColumnDef<T> {
  key: string
  label: string
  width?: string | number
  align?: 'left' | 'right' | 'center'
  render: (row: T, rowIndex: number) => ReactNode
  sortable?: boolean
  sortFn?: (a: T, b: T) => number
}

interface ListViewProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  getRowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  selectable?: boolean
  selectedKeys?: Set<string | number>
  onSelectionChange?: (keys: Set<string | number>) => void
  loading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  showQuickCreate?: boolean
  onQuickCreate?: () => void
  quickCreateLabel?: string
  footer?: ReactNode
  rowActions?: (row: T) => ReactNode
  batchActions?: ReactNode
  skeletonRows?: number
}

/**
 * ListView - Modern list/table view with sorting, selection, inline actions,
 * quick create, and loading skeleton.
 */
function ListView<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  loading = false,
  emptyMessage = 'Aucun enregistrement',
  emptyDescription,
  showQuickCreate = false,
  onQuickCreate,
  quickCreateLabel = 'Ajouter une ligne',
  footer,
  rowActions,
  batchActions,
  skeletonRows = 5,
}: ListViewProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null)

  const styles = componentStyles.listView

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable) return
    if (sortColumn === col.key) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') { setSortColumn(null); setSortDirection(null) }
    } else {
      setSortColumn(col.key)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data
    const col = columns.find(c => c.key === sortColumn)
    if (!col?.sortFn) return data
    return [...data].sort((a, b) => {
      const result = col.sortFn!(a, b)
      return sortDirection === 'desc' ? -result : result
    })
  }, [data, sortColumn, sortDirection, columns])

  const allSelected = data.length > 0 && data.every(row => selectedKeys.has(getRowKey(row)))
  const someSelected = data.some(row => selectedKeys.has(getRowKey(row))) && !allSelected

  const handleSelectAll = () => {
    if (allSelected) onSelectionChange?.(new Set())
    else onSelectionChange?.(new Set(data.map(getRowKey)))
  }

  const handleSelectRow = (key: string | number) => {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectionChange?.(next)
  }

  return (
    <Box sx={styles.container}>
      {selectable && selectedKeys.size > 0 && batchActions && (
        <Box sx={{ px: 2, py: 1, bgcolor: colors.primary[50], borderBottom: `1px solid ${colors.primary[200]}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.primary[700] }}>
            {selectedKeys.size} selectionne(s)
          </Typography>
          {batchActions}
        </Box>
      )}

      <TableContainer>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={styles.headerRow}>
              {selectable && (
                <TableCell padding="checkbox" sx={{ width: 42 }}>
                  <Checkbox size="small" checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} sx={{ p: 0.5 }} />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || 'left'} sx={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }} onClick={() => handleSort(col)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {col.label}
                    {col.sortable && sortColumn === col.key && (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </Box>
                </TableCell>
              ))}
              {rowActions && <TableCell sx={{ width: 80 }} />}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {selectable && <TableCell padding="checkbox"><Skeleton variant="rectangular" width={18} height={18} /></TableCell>}
                {columns.map((col) => <TableCell key={col.key}><Skeleton variant="text" width={col.width || '80%'} /></TableCell>)}
                {rowActions && <TableCell />}
              </TableRow>
            ))}

            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.base, mb: 0.5 }}>{emptyMessage}</Typography>
                  {emptyDescription && <Typography sx={{ color: colors.neutral[400], fontSize: typography.sizes.sm }}>{emptyDescription}</Typography>}
                </TableCell>
              </TableRow>
            )}

            {!loading && sortedData.map((row) => {
              const key = getRowKey(row)
              const isSelected = selectedKeys.has(key)
              const isHovered = hoveredRow === key

              return (
                <TableRow
                  key={key}
                  sx={{ ...styles.dataRow, ...(isSelected ? styles.dataRowSelected : {}) }}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={() => setHoveredRow(key)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {selectable && (
                    <TableCell padding="checkbox" sx={{ width: 42 }}>
                      <Checkbox size="small" checked={isSelected} onChange={(e) => { e.stopPropagation(); handleSelectRow(key) }} onClick={(e) => e.stopPropagation()} sx={{ p: 0.5 }} />
                    </TableCell>
                  )}
                  {columns.map((col) => <TableCell key={col.key} align={col.align || 'left'}>{col.render(row, sortedData.indexOf(row))}</TableCell>)}
                  {rowActions && (
                    <TableCell sx={{ width: 80 }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{
                        display: 'flex',
                        gap: 0.5,
                        opacity: { xs: 1, md: isHovered ? 1 : 0 },
                        transition: `opacity ${transitions.fast}`,
                      }}>
                        {rowActions(row)}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}

            {showQuickCreate && !loading && (
              <TableRow sx={styles.quickCreateRow} onClick={onQuickCreate} style={{ cursor: 'pointer' }}>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  sx={{ color: `${colors.primary[600]} !important`, fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, '&:hover': { bgcolor: colors.primary[25] } }}
                >
                  + {quickCreateLabel}
                </TableCell>
              </TableRow>
            )}

            {footer && <TableRow sx={styles.footerRow}>{footer}</TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export type { ColumnDef, ListViewProps }
export default ListView
