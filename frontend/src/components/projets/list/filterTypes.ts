export interface ProjetFilterState {
  statut: string
  budgetMin: string
  budgetMax: string
  avancementMin: string
  avancementMax: string
  dateDebutFrom: string
  dateDebutTo: string
  conventionId: string
  chefProjet: string
}

export const EMPTY_FILTERS: ProjetFilterState = {
  statut: '',
  budgetMin: '',
  budgetMax: '',
  avancementMin: '',
  avancementMax: '',
  dateDebutFrom: '',
  dateDebutTo: '',
  conventionId: '',
  chefProjet: '',
}
