// Types TypeScript pour toutes les entités backend

export type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'
export type TypeConvention = 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'

export interface Convention {
  id: number
  code: string
  numero: string
  dateConvention: string
  typeConvention: TypeConvention
  statut: StatutConvention
  libelle: string
  objet?: string
  tauxCommission: number
  budget: number
  baseCalcul: string
  tauxTva: number
  dateDebut: string
  dateFin?: string
  description?: string

  // Workflow fields
  dateSoumission?: string
  dateValidation?: string
  valideParId?: number
  version?: string
  isLocked: boolean
  motifVerrouillage?: string

  // Sous-convention fields
  parentConvention?: Convention
  heriteParametres: boolean
  surchargeTauxCommission?: number
  surchargeBaseCalcul?: string
  sousConventions?: Convention[]

  // Audit
  createdAt?: string
  updatedAt?: string
  actif: boolean
}

export type StatutAvenant = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE' | 'ANNULE'

export interface Avenant {
  id: number
  convention: Convention
  numeroAvenant: string
  dateAvenant: string
  dateSignature?: string
  statut: StatutAvenant
  versionResultante: string
  objet: string

  // Valeurs AVANT
  montantAvant?: number
  tauxCommissionAvant?: number
  dateFinAvant?: string

  // Valeurs APRÈS
  montantApres?: number
  tauxCommissionApres?: number
  dateFinApres?: string

  // Impact
  impactMontant?: number
  impactCommission?: number
  impactDelaiJours?: number

  justification?: string
  details?: string

  // Workflow
  dateValidation?: string
  valideParId?: number
  isLocked: boolean
}

export type StatutBudget = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE' | 'ARCHIVE'

export interface Budget {
  id: number
  convention: Convention
  version: string
  dateBudget: string
  statut: StatutBudget
  plafondConvention: number
  totalBudget: number
  budgetPrecedentId?: number
  deltaMontant?: number
  justification?: string
  observations?: string
  dateValidation?: string
  valideParId?: number
  lignes: LigneBudget[]
}

export interface LigneBudget {
  id: number
  budgetId: number
  code: string
  libelle: string
  montant: number
  ordreAffichage: number
  description?: string
}

export type StatutDecompte = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE' | 'PAYE_PARTIEL' | 'PAYE_TOTAL'
export type TypeRetenue = 'GARANTIE' | 'RAS' | 'PENALITES' | 'AVANCES'

export interface Decompte {
  id: number
  marche: any // Marche type
  numeroDecompte: string
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  statut: StatutDecompte

  // Montants
  montantBrutHT: number
  montantTVA: number
  montantTTC: number
  totalRetenues: number
  netAPayer: number

  // Cumul
  cumulPrecedent?: number
  cumulActuel?: number

  observations?: string
  dateValidation?: string
  valideParId?: number

  // Paiement
  montantPaye: number
  estSolde: boolean

  retenues: DecompteRetenue[]
  imputations: DecompteImputation[]
}

export interface DecompteRetenue {
  id: number
  decompteId: number
  typeRetenue: TypeRetenue
  montant: number
  tauxPourcent?: number
  libelle?: string
}

export interface DecompteImputation {
  id: number
  decompteId: number
  projetId?: number
  axeId?: number
  budgetId?: number
  montant: number
}

export type StatutOP = 'BROUILLON' | 'VALIDE' | 'EXECUTE' | 'REJETE' | 'ANNULE'
export type ModePaiement = 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'AUTRE'

export interface OrdrePaiement {
  id: number
  decompte: Decompte
  numeroOP: string
  dateOP: string
  statut: StatutOP
  montantAPayer: number
  estPaiementPartiel: boolean
  datePrevuePaiement?: string
  modePaiement?: ModePaiement
  compteBancaireId?: number
  observations?: string
  dateValidation?: string
  valideParId?: number
  imputations: OPImputation[]
}

export interface OPImputation {
  id: number
  ordrePaiementId: number
  projetId?: number
  axeId?: number
  budgetId?: number
  montant: number
}

export interface Paiement {
  id: number
  ordrePaiement: OrdrePaiement
  referencePaiement: string
  dateValeur: string
  dateExecution?: string
  montantPaye: number
  estPaiementPartiel: boolean
  modePaiement: ModePaiement
  compteBancaireId?: number
  observations?: string
  imputations: PaiementImputation[]
}

export interface PaiementImputation {
  id: number
  paiementId: number
  projetId?: number
  axeId?: number
  budgetId?: number
  montantReel: number
  montantBudgete?: number
  ecart?: number
}

export type StatutEcheance = 'PREVU' | 'RECU' | 'RETARD' | 'ANNULE'

export interface Subvention {
  id: number
  conventionId: number
  organismeBailleur: string
  typeSubvention?: string
  montantTotal: number
  devise: string
  tauxChange?: number
  dateSignature?: string
  dateDebutValidite?: string
  dateFinValidite?: string
  conditions?: string
  observations?: string
  echeancier: EcheanceSubvention[]
}

export interface EcheanceSubvention {
  id: number
  subventionId: number
  dateEcheance: string
  montant: number
  statut: StatutEcheance
  dateReception?: string
  libelle?: string
}
