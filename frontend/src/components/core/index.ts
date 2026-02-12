/**
 * Core Components - Composants de base du design system.
 *
 * Ce barrel export regroupe tous les composants micro-frontend
 * partagés, construits sur le design system centralisé.
 *
 * UTILISATION:
 * import { PageHeader, StickyActionBar, FormLayout, StatusBadge } from '@/components/core'
 */

// Page Header (breadcrumbs, titre, actions)
export { default as PageHeader } from './PageHeader'
export type { BreadcrumbItem } from './PageHeader'

// Sticky Action Bar (formulaires, pages de détail)
export { default as StickyActionBar } from './StickyActionBar'

// Form Layout (conteneur, sections, grilles, champs)
export {
  FormLayout,
  FormPageSection,
  FormGroup,
  FormField,
  FormFieldLabel,
} from './FormLayout'

// Status Badge (badges de statut colorés)
export { default as StatusBadge, StatusDot } from './StatusBadge'

// Confirm Dialog (remplacement professionnel de window.confirm)
export { default as ConfirmDialog } from './ConfirmDialog'

// Empty State (placeholder pour listes vides)
export { default as EmptyState } from './EmptyState'

// Sortable Header Cell (column sorting for tables)
export { default as SortableHeaderCell } from './SortableHeaderCell'

// Export Button (téléchargement Excel)
export { default as ExportButton } from './ExportButton'
