// Barrel export for edit micro-components
export { default as ConventionInfoEditCard } from './ConventionInfoEditCard'
export { default as ConventionFinancesEditCard } from './ConventionFinancesEditCard'
export { default as ConventionDatesEditCard } from './ConventionDatesEditCard'

// New Odoo-style edit components
export { default as EditGeneralFields } from './EditGeneralFields'
export { default as EditBudgetFields } from './EditBudgetFields'
export { default as EditDatesFields } from './EditDatesFields'
export { default as EditInfoPanel } from './EditInfoPanel'
export type { ConventionEditFormData, ConventionMetadata } from './editTypes'
export { conventionEditSchema, CONVENTION_STATUS_STEPS } from './editTypes'

// Legacy exports (for backward compatibility)
export { default as ConventionInfoSection } from './ConventionInfoSection'
export { default as ConventionFinancesSection } from './ConventionFinancesSection'
export { default as ConventionDatesSection } from './ConventionDatesSection'
