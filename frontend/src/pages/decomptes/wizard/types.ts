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
}

export interface Retenue {
  type: 'RG' | 'PENALITE' | 'AVANCE' | 'AUTRE'
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

export const formatMAD = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value)

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
