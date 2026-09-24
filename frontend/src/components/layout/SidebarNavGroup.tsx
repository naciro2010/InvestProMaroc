import { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { NavGroup, NavCounterKey, NAV_COUNTER_LABELS } from './navigation'

interface SidebarNavGroupProps {
  group: NavGroup
  isOpen: boolean
  onToggle: () => void
  isItemActive: (path: string) => boolean
  counters: Record<NavCounterKey, number>
  onNavigate?: () => void
}

/** Lien du menu, avec compteur optionnel (« à valider », « à payer »). */
export const SidebarNavItem = ({
  label, path, active, counter, counterLabel, root = false, onNavigate,
}: {
  label: string
  path: string
  active: boolean
  counter?: number
  counterLabel?: string
  root?: boolean
  onNavigate?: () => void
}) => (
  <Link
    to={path}
    className={root ? 'nav-item nav-item--root' : 'nav-item'}
    aria-current={active ? 'page' : undefined}
    onClick={onNavigate}
  >
    <span className="nav-item-label">{label}</span>
    {counter !== undefined && counter > 0 && (
      <span className="nav-counter" title={counterLabel}>
        {counter}
        <span className="sr-only"> {counterLabel}</span>
      </span>
    )}
  </Link>
)

/**
 * Groupe repliable du menu (réordonnable par glisser-déposer).
 * Ouverture animée par `grid-template-rows 0fr ↔ 1fr`.
 */
const SidebarNavGroup = ({ group, isOpen, onToggle, isItemActive, counters, onNavigate }: SidebarNavGroupProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.key })
  const hasActive = group.items.some(i => isItemActive(i.path))
  const bodyId = `nav-group-${group.key}`

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="nav-group">
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <button
          type="button"
          className="nav-group-head"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
        >
          <span className="nav-group-chevron" aria-hidden="true">›</span>
          <span className="nav-group-text">
            <span className="nav-group-title">{group.label}</span>
            {group.hint && <span className="nav-group-hint">{group.hint}</span>}
          </span>
          {!isOpen && hasActive && <span className="nav-group-dot" aria-label="Contient l'écran actif" />}
        </button>
        <span
          className="nav-group-grip"
          title="Glisser pour réorganiser"
          aria-label={`Réorganiser le groupe ${group.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} aria-hidden="true" />
        </span>
      </div>
      <div className="nav-group-body" id={bodyId} data-open={isOpen}>
        <div>
          {group.items.map(item => (
            <SidebarNavItem
              key={item.path}
              label={item.label}
              path={item.path}
              active={isItemActive(item.path)}
              counter={item.counter ? counters[item.counter] : undefined}
              counterLabel={item.counter ? NAV_COUNTER_LABELS[item.counter] : undefined}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SidebarNavGroup
