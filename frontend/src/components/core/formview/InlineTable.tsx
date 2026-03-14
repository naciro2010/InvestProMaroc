import { ReactNode, useState, useCallback } from 'react'
import { Box } from '@mui/material'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

interface InlineTableProps {
  headers: Array<{ label: string; width?: string | number; align?: 'left' | 'right' | 'center' }>
  rows: ReactNode[][]
  rowIds?: string[]
  onRowClick?: (rowIndex: number) => void
  emptyMessage?: string
  showAddLine?: boolean
  onAddLine?: () => void
  footerCells?: ReactNode[]
  /** Enable drag-and-drop row reordering */
  sortable?: boolean
  onReorder?: (fromIndex: number, toIndex: number) => void
}

// Sortable row sub-component
const SortableInlineRow = ({ id, cells, headers, onClick, sortable }: {
  id: string; cells: ReactNode[]; headers: InlineTableProps['headers']; onClick?: () => void; sortable: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <tr
      ref={setNodeRef}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: `1px solid ${colors.divider}`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: isDragging ? colors.primary[25] : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = colors.primary[25] }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {sortable && (
        <td style={{ padding: '8px 4px 8px 8px', width: 28 }}>
          <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: colors.neutral[300], display: 'flex', '&:hover': { color: colors.neutral[500] } }}>
            <GripVertical size={14} />
          </Box>
        </td>
      )}
      {cells.map((cell, cellIdx) => (
        <td key={cellIdx} style={{ padding: '8px 12px', fontSize: typography.sizes.base, color: colors.textPrimary, textAlign: headers[cellIdx]?.align || 'left' }}>
          {cell}
        </td>
      ))}
    </tr>
  )
}

/**
 * InlineTable - Editable table embedded inside a form.
 * Supports inline adding, footer row for totals, and optional DnD row reordering.
 */
const InlineTable = ({
  headers,
  rows,
  rowIds,
  onRowClick,
  emptyMessage = 'Aucun enregistrement',
  showAddLine = false,
  onAddLine,
  footerCells,
  sortable = false,
  onReorder,
}: InlineTableProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const ids = rowIds || rows.map((_, i) => String(i))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex !== -1 && newIndex !== -1 && onReorder) {
      onReorder(oldIndex, newIndex)
    }
  }, [ids, onReorder])

  const totalCols = headers.length + (sortable ? 1 : 0)

  const tableContent = (
    <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.md, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: colors.neutral[50] }}>
            {sortable && <th style={{ width: 28, borderBottom: `2px solid ${colors.border}` }} />}
            {headers.map((header, i) => (
              <th key={i} style={{
                padding: '8px 12px', textAlign: header.align || 'left',
                fontWeight: typography.weights.semibold as number, fontSize: typography.sizes.xs,
                textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.textSecondary,
                borderBottom: `2px solid ${colors.border}`, width: header.width,
              }}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={totalCols} style={{ padding: '24px 12px', textAlign: 'center', color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((cells, rowIdx) => (
              <SortableInlineRow
                key={ids[rowIdx]}
                id={ids[rowIdx]}
                cells={cells}
                headers={headers}
                onClick={onRowClick ? () => onRowClick(rowIdx) : undefined}
                sortable={sortable}
              />
            ))
          )}

          {showAddLine && (
            <tr onClick={onAddLine}
              style={{ cursor: 'pointer', backgroundColor: colors.neutral[25], borderTop: rows.length > 0 ? `1px solid ${colors.border}` : undefined }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary[25] }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.neutral[25] }}
            >
              <td colSpan={totalCols} style={{ padding: '8px 12px', fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium as number }}>
                + Ajouter une ligne
              </td>
            </tr>
          )}

          {footerCells && (
            <tr style={{ backgroundColor: colors.neutral[50], borderTop: `2px solid ${colors.border}` }}>
              {sortable && <td />}
              {footerCells.map((cell, i) => (
                <td key={i} style={{ padding: '8px 12px', fontWeight: typography.weights.semibold as number, fontSize: typography.sizes.sm, color: colors.textPrimary, textAlign: headers[i]?.align || 'left' }}>
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  )

  if (!sortable || rows.length === 0) return tableContent

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {tableContent}
      </SortableContext>
    </DndContext>
  )
}

export default InlineTable
