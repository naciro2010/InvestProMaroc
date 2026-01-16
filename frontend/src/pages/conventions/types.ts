/**
 * Types partagés pour les formulaires de conventions
 */

export interface ConventionFormData {
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
  typeConvention: string
  piecesJointes?: File[]
}

export interface ConventionPartenaire {
  id?: number
  partenaire: {
    id: number
    code: string
    designation: string
  }
  budget: number
  pourcentage: number
  commissionIntervention?: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
}

export interface MaitreOeuvre {
  id?: number
  code: string
  designation: string
  typeMo: 'MO' | 'MOD'
  email?: string
  telephone?: string
  adresse?: string
}

export interface ImputationPrevisionnelle {
  id?: number
  axe: string
  projet: string
  volet: string
  dateDemar rage: string
  delai: number
  dateFinPrevue: string
}

export interface VersementPrevisionnel {
  id?: number
  axe: string
  projet: string
  volet: string
  dateVersement: string
  montant: number
  partenaire: {
    id: number
    designation: string
  }
  maitreOeuvreDelegue?: {
    id: number
    designation: string
  }
}

export type TypeConvention = 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'

export type StatutConvention =
  | 'BROUILLON'
  | 'SOUMIS'
  | 'VALIDEE'
  | 'REJETE'
  | 'EN_EXECUTION'
  | 'ACHEVE'

export type BaseCalcul =
  | 'DECAISSEMENTS_TTC'
  | 'DECAISSEMENTS_HT'
  | 'ENGAGEMENTS'
