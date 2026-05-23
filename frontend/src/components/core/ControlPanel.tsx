import { ReactNode, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, List, LayoutGrid, MapPin, X } from 'lucide-react'
import ModernBreadcrumb, { BreadcrumbSegment } from './ModernBreadcrumb'

type ViewMode = 'list' | 'kanban' | 'map'

interface FilterTag {
  key: string
  label: string
  value: string
}

interface ControlPanelProps {
  breadcrumbs: BreadcrumbSegment[]
  actions?: ReactNode
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterTag[]
  onRemoveFilter?: (key: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  availableViews?: ViewMode[]
  paginationInfo?: {
    currentStart: number
    currentEnd: number
    total: number
  }
  onPreviousPage?: () => void
  onNextPage?: () => void
  children?: ReactNode
  hideBottomRow?: boolean
}

const VIEW_ICONS: Record<ViewMode, typeof List> = {
  list: List,
  kanban: LayoutGrid,
  map: MapPin,
}

const VIEW_LABELS: Record<ViewMode, string> = {
  list: 'Vue liste',
  kanban: 'Vue kanban',
  map: 'Vue carte',
}

/**
 * ControlPanel - Barre d'outils des pages liste (style ocr-sage100).
 *
 * Combine breadcrumb, actions, bascule de vue, pagination, recherche et
 * tags de filtres. Surface blanche, bordure bottom, densité financière.
 */
const ControlPanel = ({
  breadcrumbs,
  actions,
  searchPlaceholder = 'Rechercher...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onRemoveFilter,
  viewMode,
  onViewModeChange,
  availableViews = [],
  paginationInfo,
  onPreviousPage,
  onNextPage,
  children,
  hideBottomRow = false,
}: ControlPanelProps) => {
  const [localSearch, setLocalSearch] = useState(searchValue)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  return (
    <div className="control-panel">
      {/* Top Row: Breadcrumbs + Actions + Pager */}
      <div className="control-panel-top">
        <ModernBreadcrumb items={breadcrumbs} />

        <div className="control-panel-actions">
          {actions}

          {availableViews.length > 1 && (
            <div className="view-switcher" role="group" aria-label="Mode d'affichage">
              {availableViews.map((view) => {
                const Icon = VIEW_ICONS[view]
                const isActive = viewMode === view
                return (
                  <button
                    key={view}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={VIEW_LABELS[view]}
                    onClick={() => onViewModeChange?.(view)}
                    className={isActive ? 'view-switcher-btn view-switcher-btn--active' : 'view-switcher-btn'}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          )}

          {paginationInfo && (
            <div className="pager">
              <button
                type="button"
                className="pager-btn"
                onClick={onPreviousPage}
                disabled={paginationInfo.currentStart <= 1}
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="pager-info">
                {paginationInfo.currentStart}-{paginationInfo.currentEnd} / {paginationInfo.total}
              </span>
              <button
                type="button"
                className="pager-btn"
                onClick={onNextPage}
                disabled={paginationInfo.currentEnd >= paginationInfo.total}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {!hideBottomRow && (
        <div className="control-panel-bottom">
          {onSearchChange && (
            <div className="control-search">
              <span className="control-search-icon">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="control-search-input"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {localSearch && (
                <button
                  type="button"
                  className="control-search-clear"
                  onClick={() => handleSearchChange('')}
                  aria-label="Effacer la recherche"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {filters.map((filter) => (
            <span key={filter.key} className="filter-tag">
              {filter.label}: {filter.value}
              {onRemoveFilter && (
                <button
                  type="button"
                  className="filter-tag-remove"
                  onClick={() => onRemoveFilter(filter.key)}
                  aria-label={`Retirer ${filter.label}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}

          {children}
        </div>
      )}
    </div>
  )
}

export default ControlPanel
