export interface Decompte {
  id: number
  numero: string
  dateDecompte: string
  montant: number
  montantRetenue: number
  netAPayer: number
  observation?: string
  statut: string
  marcheId: number
}

export interface DecompteFormData {
  numero: string
  dateDecompte: string
  montant: number
  montantRetenue: number
  netAPayer: number
  observation: string
  marcheId: number
}
