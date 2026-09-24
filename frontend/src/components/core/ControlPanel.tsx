import { Fragment, ReactNode, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, List, LayoutGrid, MapPin, X } from 'lucide-react'
import type { BreadcrumbSegment } from './ModernBreadcrumb'
import { findNavLocation } from '@/components/layout/navigation'

type ViewMode = 'list' | 'kanban' | 'map'

interface FilterTag {
  key: string
  label: string
  value: string
}

interface ControlPanelProps {
  breadcrumbs: BreadcrumbSegment[]
  /** Titre Garamond (par défaut : dernier élément du fil d'Ariane) */
  title?: ReactNode
  /** Ligne sous le titre (volumes, totaux de la sélection…) */
  subtitle?: ReactNode
  /** Surtitre (par défaut : fil d'Ariane parent, ou thème du menu) */
  eyebrow?: ReactNode
  /** Ligne au-dessus du titre (code, numéro, pastilles de statut) */
  overline?: ReactNode
  /** Onglets de section, entre l'en-tête et la barre de filtres */
  tabs?: ReactNode
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

/** Surtitre par défaut : fil d'Ariane parent, sinon thème du menu. */
const DefaultEyebrow = ({ breadcrumbs }: { breadcrumbs: BreadcrumbSegment[] }) => {
  const { pathname } = useLocation()
  const parents = breadcrumbs.slice(0, -1)

  if (parents.length > 0) {
    return (
      <>
        {parents.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <span className="page-eyebrow-sep" aria-hidden="true">›</span>}
            {item.path ? <RouterLink to={item.path}>{item.label}</RouterLink> : <span>{item.label}</span>}
          </Fragment>
        ))}
      </>
    )
  }

  const location = findNavLocation(pathname)
  if (!location) return null
  if (location.group.key === 'accueil') return <>Pilotage · tableau de bord</>
  return <>{location.group.hint ? `${location.group.label} · ${location.group.hint}` : location.group.label}</>
}

/**
 * ControlPanel - En-tête de page « Registre » + barre de filtres.
 *
 * Surtitre (filet laiton), titre Garamond, sous-titre et actions à droite ;
 * dessous : recherche, tags de filtres, filtres propres à la page.
 * Bascule de vue et pagination restent dans les actions.
 */
const ControlPanel = ({
  breadcrumbs,
  title,
  subtitle,
  eyebrow,
  overline,
  tabs,
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
      {/* En-tête : surtitre + titre + actions */}
      <div className="control-panel-top">
        <div className="control-panel-heading">
          <nav className="page-eyebrow" aria-label="Fil d'Ariane">
            {eyebrow ?? <DefaultEyebrow breadcrumbs={breadcrumbs} />}
          </nav>
          {overline && <div className="page-overline">{overline}</div>}
          <h1 className="page-title">{title ?? breadcrumbs[breadcrumbs.length - 1]?.label}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

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

      {tabs}

      {!hideBottomRow && (onSearchChange || filters.length > 0 || children) && (
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
