export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export interface Convention {
  id: number
  code: string
  objet: string
}

export interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
}

export interface MarcheFormData {
  code: string
  numeroMarche: string
  numAO: string
  objet: string
  objetRich: string
  typeMarche: 'MARCHE' | 'CONTRAT' | 'BON_DE_COMMANDE' | 'LETTRE_DE_COMMANDE'
  naturePrestation: 'TRAVAUX' | 'FOURNITURES' | 'SERVICES' | 'ETUDES'
  fournisseurId: number | null
  conventionId: number | null
  montantHT: number
  montantTTC: number
  tauxTVA: number
  tauxPenalite: number
  dateSignature: string
  dateNotification: string
  dateOrdreService: string
  delaiExecution: number
  adresse: string
  latitude: number | null
  longitude: number | null
  zoneGeographique: string
  files: UploadedFile[]
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

export { formatCurrency as formatMAD } from '@/lib/utils'

export const formatPct = (value: number) => `${value.toFixed(1)}%`

export const INITIAL_FORM_DATA: MarcheFormData = {
  code: '',
  numeroMarche: '',
  numAO: '',
  objet: '',
  objetRich: '',
  typeMarche: 'MARCHE',
  naturePrestation: 'TRAVAUX',
  fournisseurId: null,
  conventionId: null,
  montantHT: 0,
  montantTTC: 0,
  tauxTVA: 20,
  tauxPenalite: 0.05,
  dateSignature: new Date().toISOString().split('T')[0],
  dateNotification: new Date().toISOString().split('T')[0],
  dateOrdreService: '',
  delaiExecution: 12,
  adresse: '',
  latitude: null,
  longitude: null,
  zoneGeographique: '',
  files: [],
}
