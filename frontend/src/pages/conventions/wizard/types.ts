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
  plafond: number
  tauxCommissionLigne: number
}

export interface Partenaire {
  id?: string
  designation: string
  budget: number
  pourcentage: number
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
  tauxTvaLignes: number
  lignesBudget: BudgetLigne[]

  // Commission (integrated in Budget step)
  commissionMode: 'GLOBAL' | 'PAR_CATEGORIE'
  tauxCommission: number
  baseCalcul: 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT'
  tauxTva: number

  // Step 3: Partenaires
  partenaires: Partenaire[]

  // Step 4: Subventions
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
  commissionHT: number
  commissionTTC: number
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
  'Budget & Commission',
  'Partenaires',
  'Subventions',
  'Récapitulatif',
]

// --- Utility functions ---

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
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

  let commissionHT = 0
  if (formData.commissionMode === 'PAR_CATEGORIE' && formData.lignesBudget.length > 0) {
    // Per-category: sum of individual line commissions with plafond logic
    commissionHT = formData.lignesBudget.reduce((sum, ligne) => {
      const base = formData.baseCalcul === 'DECAISSEMENTS_HT' ? ligne.montantHT : ligne.montantTTC
      const assiette = ligne.plafond > 0 ? Math.min(base, ligne.plafond) : base
      return sum + (assiette * ligne.tauxCommissionLigne) / 100
    }, 0)
  } else {
    // Global mode: commission always based on budgetGlobal
    commissionHT = (formData.budgetGlobal * formData.tauxCommission) / 100
  }

  const commissionTTC = commissionHT * (1 + formData.tauxTva / 100)

  return {
    totalLignesHT,
    totalLignesTTC,
    differenceGlobalVsLignes,
    totalPartenaires,
    totalSubventions,
    commissionHT,
    commissionTTC,
    commissionEstimee: commissionTTC,
  }
}
