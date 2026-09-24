export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export interface Marche {
  id: number
  code: string
  objet: string
  /** Taux de retenue de garantie du marché (%) */
  retenueGarantie?: number | null
}

/** Valeurs de l'enum backend `TypeRetenue` */
export type TypeRetenue = 'GARANTIE' | 'PENALITES' | 'AVANCES' | 'RAS'

export const RETENUE_LABELS: Record<TypeRetenue, string> = {
  GARANTIE: 'Retenue de garantie',
  PENALITES: 'Pénalité de retard',
  AVANCES: "Remboursement d'avance",
  RAS: 'Retenue à la source',
}

export interface Retenue {
  type: TypeRetenue
  montant: number
  description: string
}

export interface DecompteFormData {
  numeroDecompte: string
  marcheId: number | null
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  montantBrutHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  retenues: Retenue[]
  totalRetenues: number
  netAPayer: number
  observations: string
  observationsRich: string
  statut: 'BROUILLON' | 'VALIDE' | 'PAYE'
  files: UploadedFile[]
}

export { formatCurrency as formatMAD } from '@/lib/utils'

export const formatPct = (value: number) => `${value.toFixed(1)}%`

export const createInitialFormData = (prefilledMarcheId: number | null): DecompteFormData => ({
  numeroDecompte: '',
  marcheId: prefilledMarcheId,
  dateDecompte: new Date().toISOString().split('T')[0],
  periodeDebut: '',
  periodeFin: '',
  montantBrutHT: 0,
  tauxTVA: 20,
  montantTVA: 0,
  montantTTC: 0,
  retenues: [],
  totalRetenues: 0,
  netAPayer: 0,
  observations: '',
  observationsRich: '',
  statut: 'BROUILLON',
  files: [],
})
