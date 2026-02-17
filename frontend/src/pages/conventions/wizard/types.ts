import type { Dispatch, SetStateAction, ChangeEvent } from 'react'

// --- Data interfaces ---

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export interface BudgetLigne {
  id?: string
  categorieDepenseId?: number
  designation: string
  montantHT: number
  tauxTVA: number
  montantTTC: number
}

export interface Partenaire {
  id?: string
  designation: string
  budget: number
  pourcentage: number
  ci: number
}

export interface Subvention {
  id?: string
  organisme: string
  montant: number
  pourcentage: number
  dateObtention: string
}

export interface ConventionWizardFormData {
  // Step 1: Informations
  code: string
  numeroConvention: string
  libelle: string
  libelleRich: string
  objet: string
  objetRich: string
  type: 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'
  dateSignature: string
  dateDebut: string
  dateFin: string
  dureeMois: number

  // Step 2: Budget
  budgetGlobal: number
  lignesBudget: BudgetLigne[]

  // Step 3: Commission
  tauxCommission: number
  baseCalcul: 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT'
  tauxTva: number

  // Step 4: Partenaires
  partenaires: Partenaire[]

  // Step 5: Subventions
  subventions: Subvention[]

  // Files
  files: UploadedFile[]
}

export interface WizardTotals {
  totalLignesHT: number
  totalLignesTTC: number
  differenceGlobalVsLignes: number
  totalPartenaires: number
  totalSubventions: number
  commissionEstimee: number
}

export interface ConventionTypeOptionDisplay {
  value: string
  label: string
  enabled: boolean
}

// --- Shared prop types ---

export type HandleChangeFunction = (
  field: keyof ConventionWizardFormData
) => (e: ChangeEvent<HTMLInputElement>) => void

export type SetFormDataFunction = Dispatch<SetStateAction<ConventionWizardFormData>>

// --- Constants ---

export const WIZARD_STEPS = [
  'Informations',
  'Budget',
  'Commission',
  'Subventions',
  'Récapitulatif',
]

// --- Utility functions ---

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(value)
}

export const calculateTotals = (formData: ConventionWizardFormData): WizardTotals => {
  const totalLignesHT = formData.lignesBudget.reduce((sum, ligne) => sum + ligne.montantHT, 0)
  const totalLignesTTC = formData.lignesBudget.reduce((sum, ligne) => sum + ligne.montantTTC, 0)
  const differenceGlobalVsLignes = formData.budgetGlobal - totalLignesTTC
  const totalPartenaires = formData.partenaires.reduce((sum, p) => sum + p.budget, 0)
  const totalSubventions = formData.subventions.reduce((sum, s) => sum + s.montant, 0)

  const baseAmount =
    formData.baseCalcul === 'DECAISSEMENTS_HT'
      ? totalLignesHT || formData.budgetGlobal
      : totalLignesTTC || formData.budgetGlobal
  const commissionEstimee = (baseAmount * formData.tauxCommission) / 100

  return {
    totalLignesHT,
    totalLignesTTC,
    differenceGlobalVsLignes,
    totalPartenaires,
    totalSubventions,
    commissionEstimee,
  }
}
