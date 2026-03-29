import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { colors, typography, spacing, borders, transitions } from '@/lib/designSystem'

export interface SubMenuItem {
  label: string
  path: string
}

export interface MenuItem {
  icon: React.ReactElement
  label: string
  path: string
  implemented: boolean
  subItems?: SubMenuItem[]
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
  key: string
}

interface SortableGroupProps {
  group: MenuGroup
  isExpanded: boolean
  hasActiveItem: boolean
  onToggle: () => void
  children: React.ReactNode
  isActive: (path: string) => boolean
}

const SortableGroup = ({ group, isExpanded, hasActiveItem, onToggle, children }: SortableGroupProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.key })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* Group header - clean divider style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spacing.lg} ${spacing.xl} ${spacing.xs}`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Drag handle - appears on hover */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '2px',
            marginRight: spacing.xs,
            color: colors.neutral[300],
            display: 'flex',
            alignItems: 'center',
            borderRadius: borders.radius.sm,
            transition: `all ${transitions.fast}`,
            opacity: 0.4,
          }}
          title="Glisser pour réorganiser"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.color = colors.neutral[500]
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.4'
            e.currentTarget.style.color = colors.neutral[300]
          }}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: typography.sizes['2xs'],
            fontWeight: typography.weights.semibold,
            color: hasActiveItem ? colors.primary[600] : colors.neutral[400],
            textTransform: 'uppercase',
            letterSpacing: typography.letterSpacing.widest,
          }}>
            {group.label}
          </span>
          <span style={{ color: colors.neutral[300], display: 'flex' }}>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        </div>
      </div>
      {isExpanded && children}
    </div>
  )
}

export default SortableGroup
