import { Projet as ProjetAPI } from '../../../lib/projetsAPI'

export type StatutProjet = 'EN_PREPARATION' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ANNULE'

export type Projet = Omit<ProjetAPI, 'dateDebut'> & {
  dateDebut: string
  dateFin?: string
  motifSuspension?: string
  motifAnnulation?: string
  observations?: string
  dateModification?: string
  dateCreation: string
  dateDebutReel?: string
  dateFinReelle?: string
  budgetConsomme: number
  responsableId?: number
  responsableNom?: string
  conventionNumero?: string
}

export interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
  dateDebut: string
  dateFin?: string
}

export interface ProjetConventionAssociation {
  conventionId: number
  conventionCode: string
  conventionNumero: string
  conventionLibelle: string
  conventionStatut: string
  conventionBudget: number
}

export interface Marche {
  id: number
  code: string
  objet: string
  montantTTC: number
  statut: string
  fournisseurNom?: string
}

export { formatCurrency } from '@/lib/utils'

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR')
}

export const getStatusColor = (
  statut: string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (statut.toUpperCase()) {
    case 'EN_PREPARATION':
      return 'default'
    case 'EN_COURS':
      return 'info'
    case 'SUSPENDU':
      return 'warning'
    case 'TERMINE':
      return 'success'
    case 'ANNULE':
      return 'error'
    default:
      return 'default'
  }
}
