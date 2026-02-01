/**
 * SortableTable - Composants réutilisables pour les tables avec drag & drop
 *
 * SIGNATURE UX: Le drag & drop est la norme dans InvestPro pour réorganiser les éléments
 *
 * Utilisation:
 * ```tsx
 * import { SortableTableRow, useSortableTable } from '@/components/core/SortableTable'
 *
 * const MyList = () => {
 *   const { items, sensors, handleDragEnd, DndContext, SortableContext } = useSortableTable({
 *     initialItems: data,
 *     storageKey: 'my-list-order',
 *     onOrderChange: (newOrder) => saveToBackend(newOrder)
 *   })
 *
 *   return (
 *     <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
 *       <SortableContext items={items.map(i => i.id)}>
 *         <Table>
 *           {items.map(item => (
 *             <SortableTableRow key={item.id} id={item.id}>
 *               <TableCell>{item.name}</TableCell>
 *             </SortableTableRow>
 *           ))}
 *         </Table>
 *       </SortableContext>
 *     </DndContext>
 *   )
 * }
 * ```
 */

import React, { useState, useCallback, useEffect } from 'react'
import { TableRow, Box } from '@mui/material'
import { GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { colors, transitions } from '@/lib/designSystem'

// ============================================================================
// SortableTableRow - Ligne de table draggable
// ============================================================================

interface ResponsiveDisplay {
  xs?: boolean
  sm?: boolean
  md?: boolean
  lg?: boolean
  xl?: boolean
}

interface SortableTableRowProps {
  id: string | number
  children: React.ReactNode
  disabled?: boolean
  showHandle?: boolean
  /** Responsive hide settings: { xs: true, md: false } means hide on xs/sm, show from md */
  hideDragHandle?: ResponsiveDisplay
  sx?: Record<string, unknown>
}

export const SortableTableRow = ({
  id,
  children,
  disabled = false,
  showHandle = true,
  hideDragHandle,
  sx = {},
}: SortableTableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id), disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? colors.primary[50] : undefined,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : undefined,
  }

  // Build responsive display sx for drag handle
  const getHandleDisplay = () => {
    if (!hideDragHandle) return { display: 'table-cell' }

    const displayStyles: Record<string, string> = {}
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const

    breakpoints.forEach((bp) => {
      if (hideDragHandle[bp] !== undefined) {
        displayStyles[bp] = hideDragHandle[bp] ? 'none' : 'table-cell'
      }
    })

    return { display: displayStyles }
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      hover
      sx={{
        cursor: disabled ? 'default' : 'grab',
        '&:active': { cursor: disabled ? 'default' : 'grabbing' },
        ...sx,
      }}
    >
      {showHandle && (
        <Box
          component="td"
          {...attributes}
          {...listeners}
          sx={{
            width: 40,
            padding: '8px',
            verticalAlign: 'middle',
            cursor: disabled ? 'default' : 'grab',
            color: colors.neutral[400],
            '&:hover': {
              color: disabled ? colors.neutral[400] : colors.neutral[600],
            },
            transition: `color ${transitions.fast}`,
            ...getHandleDisplay(),
          }}
        >
          <GripVertical className="w-4 h-4" />
        </Box>
      )}
      {children}
    </TableRow>
  )
}

// ============================================================================
// SortableListItem - Élément de liste draggable (pour les listes non-table)
// ============================================================================

interface SortableListItemProps {
  id: string | number
  children: React.ReactNode
  disabled?: boolean
  showHandle?: boolean
  sx?: Record<string, unknown>
}

export const SortableListItem = ({
  id,
  children,
  disabled = false,
  showHandle = true,
  sx = {},
}: SortableListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id), disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? colors.primary[50] : undefined,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: disabled ? 'default' : 'grab',
        '&:active': { cursor: disabled ? 'default' : 'grabbing' },
        ...sx,
      }}
    >
      {showHandle && (
        <Box
          {...attributes}
          {...listeners}
          sx={{
            padding: '8px',
            cursor: disabled ? 'default' : 'grab',
            color: colors.neutral[400],
            '&:hover': {
              color: disabled ? colors.neutral[400] : colors.neutral[600],
            },
          }}
        >
          <GripVertical className="w-4 h-4" />
        </Box>
      )}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  )
}

// ============================================================================
// DragHandle - Poignée de drag autonome
// ============================================================================

interface DragHandleProps {
  listeners: Record<string, unknown>
  attributes: Record<string, unknown>
  disabled?: boolean
}

export const DragHandle = ({ listeners, attributes, disabled = false }: DragHandleProps) => (
  <Box
    {...attributes}
    {...listeners}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      cursor: disabled ? 'default' : 'grab',
      color: colors.neutral[400],
      borderRadius: 1,
      '&:hover': {
        color: disabled ? colors.neutral[400] : colors.neutral[600],
        bgcolor: disabled ? 'transparent' : colors.neutral[100],
      },
      transition: `all ${transitions.fast}`,
    }}
  >
    <GripVertical className="w-4 h-4" />
  </Box>
)

// ============================================================================
// useSortableTable - Hook pour gérer le drag & drop des tables
// ============================================================================

interface UseSortableTableOptions<T> {
  initialItems: T[]
  idKey?: keyof T
  storageKey?: string
  onOrderChange?: (items: T[]) => void
}

interface UseSortableTableReturn<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  sensors: ReturnType<typeof useSensors>
  handleDragEnd: (event: DragEndEvent) => void
  DndContextComponent: typeof DndContext
  SortableContextComponent: typeof SortableContext
  verticalListStrategy: typeof verticalListSortingStrategy
  closestCenterCollision: typeof closestCenter
}

export function useSortableTable<T extends object>({
  initialItems,
  idKey = 'id' as keyof T,
  storageKey,
  onOrderChange,
}: UseSortableTableOptions<T>): UseSortableTableReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems)

  // Synchronize with initialItems changes
  useEffect(() => {
    if (storageKey) {
      // Try to restore saved order
      const savedOrder = getSavedOrder(storageKey)
      if (savedOrder && savedOrder.length > 0) {
        const orderedItems = reorderByIds(initialItems, savedOrder, idKey)
        setItems(orderedItems)
        return
      }
    }
    setItems(initialItems)
  }, [initialItems, storageKey, idKey])

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        setItems((currentItems) => {
          const oldIndex = currentItems.findIndex(
            (item) => getItemId(item, idKey) === String(active.id)
          )
          const newIndex = currentItems.findIndex(
            (item) => getItemId(item, idKey) === String(over.id)
          )

          const newItems = arrayMove(currentItems, oldIndex, newIndex)

          // Save order to localStorage
          if (storageKey) {
            const ids = newItems.map((item) => getItemId(item, idKey))
            saveOrder(storageKey, ids)
          }

          // Notify parent of order change
          if (onOrderChange) {
            onOrderChange(newItems)
          }

          return newItems
        })
      }
    },
    [idKey, storageKey, onOrderChange]
  )

  return {
    items,
    setItems,
    sensors,
    handleDragEnd,
    DndContextComponent: DndContext,
    SortableContextComponent: SortableContext,
    verticalListStrategy: verticalListSortingStrategy,
    closestCenterCollision: closestCenter,
  }
}

// ============================================================================
// Utilitaires de persistance
// ============================================================================

const STORAGE_PREFIX = 'investpro_order_'

function getSavedOrder(key: string): string[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveOrder(key: string, order: string[]): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(order))
  } catch {
    console.error('Failed to save order to localStorage')
  }
}

// Helper pour récupérer l'ID d'un item
function getItemId<T extends object>(item: T, idKey: keyof T): string {
  const value = item[idKey]
  return String(value)
}

function reorderByIds<T extends object>(
  items: T[],
  savedOrder: string[],
  idKey: keyof T
): T[] {
  const itemMap = new Map(items.map((item) => [getItemId(item, idKey), item]))
  const orderedItems: T[] = []

  // Add items in saved order
  for (const id of savedOrder) {
    const item = itemMap.get(id)
    if (item) {
      orderedItems.push(item)
      itemMap.delete(id)
    }
  }

  // Add remaining items (new items not in saved order)
  for (const item of itemMap.values()) {
    orderedItems.push(item)
  }

  return orderedItems
}

// ============================================================================
// Export des composants DnD pour faciliter l'utilisation
// ============================================================================

export {
  DndContext,
  SortableContext,
  closestCenter,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
}
