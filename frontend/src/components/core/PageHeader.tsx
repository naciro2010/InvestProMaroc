import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

// ==================== TYPES ====================

export interface BreadcrumbItem {
  label: string
  path?: string
}

type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

interface PageHeaderProps {
  /** Titre principal de la page */
  title: string
  /** Sous-titre descriptif (optionnel) */
  subtitle?: string
  /** Fil d'Ariane - navigation hiérarchique */
  breadcrumbs?: BreadcrumbItem[]
  /** Badge de statut à côté du titre */
  status?: {
    label: string
    color: ChipColor
  }
  /** Boutons d'action (à droite du titre) */
  actions?: ReactNode
  /** Contenu additionnel sous le titre (filtres, onglets...) */
  children?: ReactNode
}

const chipToneMap: Record<ChipColor, string> = {
  default: 'neutral',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
}

/**
 * PageHeader - En-tête de page standard (style ocr-sage100).
 *
 * Encapsule breadcrumbs, titre + statut, sous-titre, actions et contenu
 * additionnel (filtres, onglets). Bordure bottom subtile, pas de gradient,
 * titre à 18px (--text-h1), densité financière.
 *
 * @example
 * <PageHeader
 *   title="Conventions"
 *   subtitle="Gérer les conventions de financement"
 *   breadcrumbs={[
 *     { label: 'Accueil', path: '/dashboard' },
 *     { label: 'Conventions' },
 *   ]}
 *   actions={<Button>Nouvelle Convention</Button>}
 * />
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  status,
  actions,
  children,
}: PageHeaderProps) => {
  return (
    <div className="page-header">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="page-header-breadcrumb">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {index > 0 && (
                  <ChevronRight size={14} style={{ color: 'var(--ink-30)', flexShrink: 0 }} />
                )}
                {isLast || !item.path ? (
                  <span className={isLast ? 'page-header-crumb page-header-crumb--current' : 'page-header-crumb'}>
                    {item.label}
                  </span>
                ) : (
                  <RouterLink to={item.path} className="page-header-crumb">
                    {item.label}
                  </RouterLink>
                )}
              </span>
            )
          })}
        </nav>
      )}

      {/* Title Row */}
      <div className="page-header-row">
        <div className="page-header-leading">
          <div className="page-header-titleline">
            <h1 className="page-header-title">{title}</h1>
            {status && (
              <span className={`status-pill status-pill--${chipToneMap[status.color]} status-pill--sm`}>
                {status.label}
              </span>
            )}
          </div>
          {subtitle && <div className="page-header-subtitle">{subtitle}</div>}
        </div>

        {actions && <div className="page-header-actions">{actions}</div>}
      </div>

      {/* Children (filters, tabs, etc.) */}
      {children && <div>{children}</div>}
    </div>
  )
}

export default PageHeader
