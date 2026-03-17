// Types and utilities
export type {
  UploadedFile,
  BudgetLigne,
  Partenaire,
  Subvention,
  ConventionWizardFormData,
  WizardTotals,
  ConventionTypeOptionDisplay,
  HandleChangeFunction,
  SetFormDataFunction,
} from './types'

export {
  WIZARD_STEPS,
  formatCurrency,
  calculateTotals,
} from './types'

// Custom hooks
export { useConventionWizardData } from './useConventionWizardData'
export { useConventionAutosave } from './useConventionAutosave'

// Step components
export { default as WizardStepInformations } from './WizardStepInformations'
export { default as WizardStepBudget } from './WizardStepBudget'
export { default as WizardStepPartenaires } from './WizardStepPartenaires'
export { default as WizardStepRecapitulatif } from './WizardStepRecapitulatif'

// Smart components
export { SmartTemplates, TEMPLATES } from './SmartTemplates'
export type { ConventionTemplate } from './SmartTemplates'
export { default as ConventionSmartSidebar } from './ConventionSmartSidebar'
