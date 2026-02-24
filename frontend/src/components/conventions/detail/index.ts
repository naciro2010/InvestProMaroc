// Original components (monolithic data loading)
export { default as ConventionInfoCard } from './ConventionInfoCard'
export { default as ConventionSousConventionsCard } from './ConventionSousConventionsCard'
export { default as ConventionAvenantsTab } from './ConventionAvenantsTab'
export { default as ConventionHistoryCard } from './ConventionHistoryCard'

// Lazy-loading micro-components (micro-services pattern)
export { default as ConventionInfoCardLazy } from './ConventionInfoCardLazy'
export { default as ConventionFinancesCard } from './ConventionFinancesCard'
export { default as ConventionStatsCard } from './ConventionStatsCard'
export { default as ConventionPartenairesCard } from './ConventionPartenairesCard'
export { default as ConventionSubventionsCard } from './ConventionSubventionsCard'
export { default as ConventionImputationsCard } from './ConventionImputationsCard'
export { default as ConventionBudgetExecutionCard } from './ConventionBudgetExecutionCard'
export { default as ConventionBudgetDetailCard } from './ConventionBudgetDetailCard'

// Modular detail components (v2)
export { default as ConventionWorkflowActions } from './ConventionWorkflowActions'
export { default as ConventionVersementsCard } from './ConventionVersementsCard'
export { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'

// Parent convention banner (sous-convention detail)
export { default as ParentConventionBanner } from './ParentConventionBanner'

// Financial summary table (v3 - top-level overview)
export { default as ConventionSummaryTable } from './ConventionSummaryTable'

// Main sections: Previsionnel & Realisation
export { default as ConventionPrevisionnelSection } from './ConventionPrevisionnelSection'
export { default as ConventionRealisationSection } from './ConventionRealisationSection'

// Shared section header
export { DetailSectionHeader } from './ConventionPrevisionnelSection'
