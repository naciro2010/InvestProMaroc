import { ReactNode, useState, useCallback } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { colors, typography, borders, transitions, shadows } from '@/lib/designSystem'

// ==================== TYPES ====================

interface KanbanColumn<T> {
  id: string
  title: string
  color?: string
  items: T[]
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[]
  getItemId: (item: T) => string
  renderCard: (item: T) => ReactNode
  onCardMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void
  emptyMessage?: string
}

// ==================== DROPPABLE COLUMN ====================

interface DroppableColumnProps {
  id: string
  title: string
  color?: string
  count: number
  children: ReactNode
  emptyMessage: string
}

const DroppableColumn = ({ id, title, color, count, children, emptyMessage }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  const accentColor = color || colors.neutral[400]

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: '1 1 280px',
        minWidth: 260,
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isOver ? colors.primary[25] : colors.neutral[50],
        borderRadius: borders.radius.lg,
        border: `1px solid ${isOver ? colors.primary[200] : colors.borderSubtle}`,
        transition: transitions.normal,
        overflow: 'hidden',
      }}
    >
      {/* Column header */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, flex: 1 }}>
          {title}
        </Typography>
        <Typography sx={{
          fontSize: typography.sizes['2xs'],
          fontWeight: typography.weights.semibold,
          color: colors.textSecondary,
          bgcolor: colors.neutral[200],
          borderRadius: borders.radius.full,
          px: 0.75,
          minWidth: 20,
          height: 20,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {count}
        </Typography>
      </Box>

      {/* Cards container */}
      <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 100, overflowY: 'auto' }}>
        {count === 0 ? (
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textDisabled, textAlign: 'center', py: 3 }}>
            {emptyMessage}
          </Typography>
        ) : (
          children
        )}
      </Box>
    </Box>
  )
}

// ==================== SORTABLE CARD ====================

interface SortableCardProps {
  id: string
  children: ReactNode
}

const SortableCard = ({ id, children }: SortableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      sx={{
        p: 1.5,
        cursor: 'grab',
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: borders.radius.md,
        boxShadow: isDragging ? shadows.md : shadows.xs,
        '&:hover': { borderColor: colors.primary[200], boxShadow: shadows.sm },
        transition: transitions.normal,
      }}
    >
      {children}
    </Paper>
  )
}

// ==================== MAIN KANBAN BOARD ====================

function KanbanBoard<T>({
  columns,
  getItemId,
  renderCard,
  onCardMove,
  emptyMessage = 'Aucun element',
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  // Find which column an item belongs to
  const findColumnForItem = useCallback((itemId: string): string | undefined => {
    for (const col of columns) {
      if (col.items.some(item => getItemId(item) === itemId)) {
        return col.id
      }
    }
    // itemId might be a column id itself (when dragging over empty column)
    if (columns.some(c => c.id === itemId)) return itemId
    return undefined
  }, [columns, getItemId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by isOver in DroppableColumn
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !active) return

    const activeItemId = String(active.id)
    const overItemId = String(over.id)

    const fromColumnId = findColumnForItem(activeItemId)
    // Determine target column: either the column of the over item, or the over id itself if it's a column
    const toColumnId = columns.some(c => c.id === overItemId) ? overItemId : findColumnForItem(overItemId)

    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      onCardMove?.(activeItemId, fromColumnId, toColumnId)
    }
  }

  // Find the active item for the drag overlay
  const activeItem = activeId
    ? columns.flatMap(c => c.items).find(item => getItemId(item) === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, alignItems: 'flex-start' }}>
        {columns.map(column => {
          const itemIds = column.items.map(getItemId)
          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              count={column.items.length}
              emptyMessage={emptyMessage}
            >
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {column.items.map(item => {
                  const itemId = getItemId(item)
                  return (
                    <SortableCard key={itemId} id={itemId}>
                      {renderCard(item)}
                    </SortableCard>
                  )
                })}
              </SortableContext>
            </DroppableColumn>
          )
        })}
      </Box>

      <DragOverlay>
        {activeItem ? (
          <Paper sx={{ p: 1.5, bgcolor: colors.surface, border: `1px solid ${colors.primary[300]}`, borderRadius: borders.radius.md, boxShadow: shadows.lg, opacity: 0.9 }}>
            {renderCard(activeItem)}
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export { KanbanBoard, type KanbanColumn, type KanbanBoardProps }
export default KanbanBoard
