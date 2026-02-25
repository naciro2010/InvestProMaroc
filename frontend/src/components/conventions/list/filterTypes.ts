export interface ConventionFilterState {
  type: string
  statut: string
  budgetMin: string
  budgetMax: string
  commissionMin: string
  commissionMax: string
  dateDebutFrom: string
  dateDebutTo: string
  createdBy: string
}

export const EMPTY_FILTERS: ConventionFilterState = {
  type: '',
  statut: '',
  budgetMin: '',
  budgetMax: '',
  commissionMin: '',
  commissionMax: '',
  dateDebutFrom: '',
  dateDebutTo: '',
  createdBy: '',
}
