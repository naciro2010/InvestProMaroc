/**
 * Types pour les avenants de conventions
 */

export enum StatutAvenantConvention {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  VALIDE = 'VALIDE'
}

export interface AvenantConventionRequest {
  conventionId: number
  numeroAvenant: string
  dateAvenant: string
  objet: string
  motif?: string
  donneesAvant?: Record<string, any>
  modifications?: Record<string, any>
  detailsModifications?: string
  ancienBudget?: number
  nouveauBudget?: number
  deltaBudget?: number
  ancienTauxCommission?: number
  nouveauTauxCommission?: number
  dateEffet?: string
  remarques?: string
  fichierAvenant?: string
}

export interface AvenantConventionResponse {
  id: number
  conventionId: number
  conventionNumero: string
  conventionLibelle: string
  numeroAvenant: string
  dateAvenant: string
  objet: string
  motif?: string
  statut: StatutAvenantConvention
  donneesAvant?: Record<string, any>
  modifications?: Record<string, any>
  detailsModifications?: string
  ancienBudget?: number
  nouveauBudget?: number
  deltaBudget?: number
  ancienTauxCommission?: number
  nouveauTauxCommission?: number
  dateSoumission?: string
  dateValidation?: string
  dateEffet?: string
  createdById?: number
  createdByName?: string
  soumisParId?: number
  soumisParName?: string
  valideParId?: number
  valideParName?: string
  remarques?: string
  motifRejet?: string
  fichierAvenant?: string
  ordreApplication?: number
  createdAt: string
  updatedAt: string
  isEditable: boolean
  canSoumettre: boolean
  canValider: boolean
  isValide: boolean
}

export interface AvenantConventionSummary {
  id: number
  conventionId: number
  conventionNumero: string
  numeroAvenant: string
  dateAvenant: string
  objet: string
  statut: StatutAvenantConvention
  deltaBudget?: number
  createdByName?: string
  ordreApplication?: number
  createdAt: string
}

export interface ValiderAvenantRequest {
  avenantId: number
  remarques?: string
  dateEffet?: string
}

export interface RejeterAvenantRequest {
  avenantId: number
  motifRejet: string
}

export interface AvenantStatistics {
  totalAvenants: number
  brouillons: number
  soumis: number
  valides: number
  totalDeltaBudget: number
}
