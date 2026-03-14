export interface Paiement {
  id: number
  numeroPaiement: string
  datePaiement: string
  montant: number
  modeReglement: string
  referenceBancaire?: string
  beneficiaire?: string
  observation?: string
  statut?: string
  ordrePaiementId?: number
}

export interface PaiementFormData {
  numeroPaiement: string
  datePaiement: string
  montant: number
  modeReglement: string
  referenceBancaire: string
  beneficiaire: string
  observation: string
  ordrePaiementId: number
}

export const modeReglementLabels: Record<string, string> = {
  'VIREMENT': 'Virement',
  'CHEQUE': 'Cheque',
  'ESPECES': 'Especes',
  'CARTE': 'Carte Bancaire',
  'PRELEVEMENT': 'Prelevement',
}
