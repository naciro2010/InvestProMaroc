import { TableCell, TableSortLabel } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import type { SortDirection } from '@/hooks/useTableSort'

interface SortableHeaderCellProps {
  label: string
  sortKey: string
  active: boolean
  direction: SortDirection
  onSort: () => void
  align?: 'left' | 'right' | 'center'
  width?: number | string
  sx?: SxProps<Theme>
}

/**
 * A table header cell with a MUI TableSortLabel for column sorting.
 *
 * Usage:
 * ```tsx
 * <SortableHeaderCell
 *   label="Code"
 *   sortKey="code"
 *   active={sortConfig?.key === 'code'}
 *   direction={sortConfig?.key === 'code' ? sortConfig.direction : 'asc'}
 *   onSort={() => requestSort('code')}
 * />
 * ```
 */
const SortableHeaderCell = ({
  label,
  active,
  direction,
  onSort,
  align = 'left',
  width,
  sx,
}: SortableHeaderCellProps) => {
  return (
    <TableCell
      align={align}
      sx={{ width, ...sx as Record<string, unknown> }}
      sortDirection={active ? direction : false}
    >
      <TableSortLabel
        active={active}
        direction={active ? direction : 'asc'}
        onClick={onSort}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )
}

export default SortableHeaderCell
