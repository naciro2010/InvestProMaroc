import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

// ==================== TYPES ====================

interface EmptyStateProps {
  /** Custom icon (Lucide). Defaults to SearchX when filtered, nothing otherwise. */
  icon?: ReactNode
  /** Main title, e.g. "Aucune convention trouvée" */
  title: string
  /** Optional description below the title */
  description?: string
  /** Label for the optional action button */
  actionLabel?: string
  /** Callback for the action button */
  onAction?: () => void
  /** If true, shows a filtered-search message instead of custom description */
  filtered?: boolean
}

// ==================== COMPONENT ====================

/**
 * EmptyState - Placeholder centré pour les listes vides (style ocr-sage100).
 *
 * Affiche un titre, une icône optionnelle, une description et un bouton
 * d'action. Quand `filtered` est vrai, affiche un message de recherche.
 *
 * @example
 * <EmptyState
 *   title="Aucune convention trouvée"
 *   description="Créez votre première convention pour commencer."
 *   actionLabel="Nouvelle Convention"
 *   onAction={() => navigate('/conventions/new')}
 * />
 *
 * @example
 * <EmptyState title="Aucun résultat" filtered />
 */
const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  filtered = false,
}: EmptyStateProps) => {
  const displayIcon = filtered ? <SearchX size={28} /> : icon
  const displayDescription = filtered
    ? 'Aucun résultat pour votre recherche. Essayez avec d’autres critères.'
    : description

  return (
    <div className="empty-state">
      {displayIcon && <div className="empty-state-icon">{displayIcon}</div>}

      <div className="empty-state-title">{title}</div>

      {displayDescription && (
        <div className="empty-state-desc">{displayDescription}</div>
      )}

      {actionLabel && onAction && (
        <div className="empty-state-actions">
          <button type="button" className="ocr-btn ocr-btn--primary" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
