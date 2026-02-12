export { default as ProjetInfoCard } from './ProjetInfoCard'
export { default as ProjetConventionsTab } from './ProjetConventionsTab'
export { default as ProjetMarchesTab } from './ProjetMarchesTab'
export { default as ProjetBudgetSection } from './ProjetBudgetSection'
export { default as ProjetHistoriqueTab } from './ProjetHistoriqueTab'

export type {
  Projet,
  Convention,
  Marche,
  ProjetConventionAssociation,
  StatutProjet,
} from './projetDetailTypes'

export {
  formatCurrency,
  formatDate,
  getStatusColor,
} from './projetDetailTypes'
