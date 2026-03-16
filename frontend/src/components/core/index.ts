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

// Modern components (control panel, form view, list view, breadcrumb)
export { default as ModernBreadcrumb } from './ModernBreadcrumb'
export type { BreadcrumbSegment } from './ModernBreadcrumb'

export { default as ControlPanel } from './ControlPanel'

export {
  FormView,
  FieldGroup,
  Field,
  Notebook,
  InlineTable,
} from './FormView'
export type { StatusStep } from './FormView'

export { default as ListView } from './ListView'
export type { ColumnDef } from './ListView'

export { WizardView } from './WizardView'
export type { WizardStep } from './WizardView'

// Resizable Section (collapsible + resizable panels for detail pages)
export { default as ResizableSection } from './ResizableSection'

// API-backed Autocomplete (search + duplicate prevention + inline quick-create)
export { default as ApiAutocomplete } from './ApiAutocomplete'
export type { AutocompleteOption, QuickCreateConfig, QuickCreateField } from './ApiAutocomplete'

// Command Palette (Ctrl+K global search)
export { default as CommandPalette } from './CommandPalette'

// Keyboard Shortcuts Help (Ctrl+/ modal)
export { default as KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

// Notification Center (bell icon dropdown)
export { default as NotificationCenter } from './NotificationCenter'

// Inline Edit Field (click-to-edit)
export { default as InlineEditField } from './InlineEditField'
export type { InlineEditFieldConfig } from './InlineEditField'

// Edit Field Dialog (rich text / textarea editing modal)
export { default as EditFieldDialog } from './EditFieldDialog'

// Chatter (activity log / history timeline) + SSE real-time
export { default as Chatter } from './chatter'
export type { ChatterActivity, ChatterProps } from './chatter'
export { useEntityHistory } from './chatter'
export { useEntitySSE } from './chatter'

// Smart Button (Odoo-style stat buttons for related record counts)
export { SmartButton, SmartButtonsRow } from './SmartButton'

// Kanban Board (DnD cards between status columns)
export { KanbanBoard } from './KanbanBoard'
export type { KanbanColumn, KanbanBoardProps } from './KanbanBoard'

// Dashboard Grid (draggable + resizable widget layout)
export { DashboardGrid } from './DashboardGrid'
export type { WidgetConfig, DashboardGridProps } from './DashboardGrid'
