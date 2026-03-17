export interface ParentConventionInfo {
  id: number
  numero: string
  libelle: string
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  budget?: number
}

export interface EditingSousConventionData {
  id: number
  code: string
  numero: string
  libelle: string
  objet?: string
  dateConvention?: string
  dateDebut?: string
  dateFin?: string | null
  budget?: number
  tauxCommission?: number
  baseCalcul?: string
  tauxTva?: number
  heriteParametres?: boolean
  statut?: string
  montant?: number
}

export interface ParentPartenaireData {
  id: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
}

export interface SousConventionFormData {
  code: string
  numero: string
  libelle: string
  objet: string
  dateConvention: string
  dateDebut: string
  dateFin: string
  budget: string
  tauxCommission: string
  baseCalcul: string
  tauxTva: string
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)
