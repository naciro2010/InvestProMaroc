export interface MarcheFilterState {
  typeMarche: string
  statut: string
  fournisseur: string
  montantMin: string
  montantMax: string
  dateFrom: string
  dateTo: string
  convention: string
}

export const EMPTY_FILTERS: MarcheFilterState = {
  typeMarche: '',
  statut: '',
  fournisseur: '',
  montantMin: '',
  montantMax: '',
  dateFrom: '',
  dateTo: '',
  convention: '',
}
