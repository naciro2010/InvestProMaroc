// Original components (monolithic data loading)
export { default as ConventionSousConventionsCard } from './ConventionSousConventionsCard'
export { default as ConventionAvenantsTab } from './ConventionAvenantsTab'

// Lazy-loading micro-components (micro-services pattern)
export { default as ConventionInfoCardLazy } from './ConventionInfoCardLazy'
export { default as ConventionFinancesCard } from './ConventionFinancesCard'
export { default as ConventionStatsCard } from './ConventionStatsCard'
export { default as ConventionPartenairesCard } from './ConventionPartenairesCard'
export { default as ConventionSubventionsCard } from './ConventionSubventionsCard'
export { default as ConventionImputationsCard } from './ConventionImputationsCard'
export { default as ConventionBudgetExecutionCard } from './ConventionBudgetExecutionCard'
export { default as ConventionBudgetDetailCard } from './ConventionBudgetDetailCard'
export { default as ConventionBudgetLignesCard } from './ConventionBudgetLignesCard'
export { default as BudgetLigneDetailDrawer } from './BudgetLigneDetailDrawer'
export { default as MarcheDetailDrawer } from './MarcheDetailDrawer'
export { default as PartenaireDetailDrawer } from './PartenaireDetailDrawer'
export { default as VersementDetailDrawer } from './VersementDetailDrawer'
export { default as ImputationDetailDrawer } from './ImputationDetailDrawer'
export { default as SubventionDetailDrawer } from './SubventionDetailDrawer'

// Modular detail components (v2)
export { default as ConventionWorkflowActions } from './ConventionWorkflowActions'
export { default as ConventionVersementsCard } from './ConventionVersementsCard'
export { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'

// Parent convention banner (sous-convention detail)
export { default as ParentConventionBanner } from './ParentConventionBanner'

// Financial summary table (top-level overview)
export { default as ConventionSummaryTable } from './ConventionSummaryTable'

// Main sections
export { default as ConventionPrevisionnelSection } from './ConventionPrevisionnelSection'
export { default as ConventionRealisationSection } from './ConventionRealisationSection'

// Financial flow card (unified IN/OUT view)
export { default as ConventionFinancialFlowCard } from './ConventionFinancialFlowCard'

// Smart buttons bar (Odoo-style)
export { default as ConventionSmartButtons } from './ConventionSmartButtons'

// Calculation breakdown (Odoo-inspired)
export { default as ConventionCalculationBreakdown } from './ConventionCalculationBreakdown'

// Traceability / audit card (Odoo-style)
export { default as ConventionTraceabilityCard } from './ConventionTraceabilityCard'

// Key info card (convention parameters + dates + audit trail)
export { default as ConventionKeyInfoCard } from './ConventionKeyInfoCard'

// Form dialogs
export { default as ImputationFormDialog } from './ImputationFormDialog'

// Shared types & styles
export { thStyle } from './types'
export type {
  SituationPaiement, MarcheData, VersementPrevisionnel, VersementPartenaireRef,
  ImputationPrevisionnelle, Subvention, SousConvention, Avenant, Projet, Marche,
} from './types'
