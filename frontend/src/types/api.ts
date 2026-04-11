/**
 * API Type Definitions for InvestPro Maroc
 * Replaces all `any` types with proper TypeScript interfaces
 * Ensures 100% type safety across the application
 */

// ============================================================================
// Base/Common Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

/**
 * Common error response
 */
export interface ErrorResponse {
  success: false
  message: string
  data: null
  statusCode?: number
  timestamp?: string
}

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  roles: UserRole[]
  actif?: boolean
  enabled?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
  roles?: UserRole[]
}

// ============================================================================
// Convention Types
// ============================================================================

export type ConventionStatus = 'BROUILLON' | 'SOUMIS' | 'VALIDE'
export type ConventionType = 'CADRE' | 'NON_CADRE'

export interface Convention {
  id: number
  code: string
  designation: string
  objet: string
  objetRich?: string // Rich text (JSONB)
  type: ConventionType
  status: ConventionStatus
  tauxCommission: number
  montantMinimal: number
  montantMaximal?: number
  budgetTotal: number
  dateDebut: Date
  dateFin: Date
  description?: string
  descriptionRich?: string // Rich text (JSONB)
  actif: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  parentConvention?: Convention
  sousConventions?: Convention[]
}

export interface CreateConventionBudgetLigneDTO {
  categorieDepenseId: number
  designation?: string
  montant: number
}

export interface CreateConventionPartenaireDTO {
  partenaireId: number
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre?: boolean
  estMaitreOeuvreDelegue?: boolean
  remarques?: string
}

export interface CreateConventionDTO extends Record<string, unknown> {
  code: string
  designation?: string
  objet: string
  objetRich?: string
  type?: ConventionType
  tauxCommission?: number | null
  montantMinimal?: number
  montantMaximal?: number
  budgetTotal?: number
  dateDebut: Date | string
  dateFin?: Date | string | null
  description?: string
  descriptionRich?: string
  // Legacy form fields
  numero?: string
  libelle?: string
  dateConvention?: string
  budget?: number
  baseCalcul?: string | null
  tauxTva?: number | null
  tauxTvaLignes?: number | null
  typeConvention?: string
  heriteParametres?: boolean
  surchargeTauxCommission?: number | null
  surchargeBaseCalcul?: string | null
  commissionMode?: string | null
  dateSignature?: string | null
  // Related data
  lignesBudget?: CreateConventionBudgetLigneDTO[]
  partenaires?: CreateConventionPartenaireDTO[]
}

export interface UpdateConventionDTO extends Partial<CreateConventionDTO> {
  status?: ConventionStatus
}

// Micro-DTOs for progressive lazy loading
export interface ConventionBasicDTO {
  id: number
  code: string
  numero: string
  libelle: string
  objet: string | null
  typeConvention: ConventionType
  statut: ConventionStatus
  createdBy: string | null
  parentConventionId: number | null
  parentConventionNumero: string | null
  heriteParametres: boolean
}

export interface ConventionFinancesDTO {
  id: number
  tauxCommission: number
  budget: number
  baseCalcul: string
  tauxTva: number
  tauxTvaLignes: number
  montantCommissionEstime: number | null
}

export interface ConventionDatesDTO {
  id: number
  dateConvention: string
  dateDebut: string
  dateFin: string | null
  dateSoumission: string | null
  dateValidation: string | null
  dureeJours: number | null
  estActive: boolean
}

export interface ConventionStatsDTO {
  id: number
  nombreProjets: number
  nombreMarches: number
  nombreSousConventions: number
  montantTotalProjets: number
  montantTotalMarches: number
  tauxRealisation: number
  commissionTotale: number
}

export interface ConventionDetailEnrichedDTO {
  id: number
  // Audit info
  createdByNom: string | null
  createdAt: string | null
  updatedAt: string | null
  valideParNom: string | null
  dateValidation: string | null
  dateSoumission: string | null
  // Related entity counts
  nombreMarches: number
  nombreProjets: number
  nombreSousConventions: number
  nombreAvenants: number
  nombrePartenaires: number
  // Financial summaries
  montantTotalMarches: number
  montantTotalProjets: number
  tauxRealisation: number
  commissionEstimee: number
  commissionTTC: number
  // Effective rates (after inheritance)
  tauxCommissionEffectif: number
  baseCalculEffective: string
  // Duration
  dureeJours: number
  estActive: boolean
  // Workflow
  motifRejet: string | null
  isLocked: boolean
  version: string | null
}

export interface UpdateConventionWithHistoryRequest extends Record<string, unknown> {
  motifModification: string
  modifieParId: number
  libelle: string
  numero: string
  objet: string
  typeConvention: string
  tauxCommission: number
  budget: number
  baseCalcul: string | null
  tauxTva: number
  tauxTvaLignes: number
  dateDebut: string
  dateFin: string | null
  description: string | null
}

export interface ConventionSimpleDTO {
  id: number
  code: string
  designation: string
  status: ConventionStatus
  tauxCommission: number
}

export interface ConventionBudgetLigneDTO {
  id: number
  conventionId: number
  categorieDepenseId: number
  categorieDepenseCode: string
  categorieDepenseLibelle: string
  designation: string | null
  montant: number
  pourcentage: number
  engagementMontant: number
  depensesMontant: number
  resteAEngager: number
  resteAPayer: number
  tauxCommission?: number
  plafond?: number
  remarques: string | null
  actif: boolean
  createdAt: string | null
  updatedAt: string | null
}

// ============================================================================
// CategorieDepense Types (Référentiel)
// ============================================================================

export interface CategorieDepense {
  id: number
  code: string
  libelle: string
  description?: string
  categorie?: string
  ordreAffichage?: number
  actif: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CategorieDepenseListDTO {
  id: number
  code: string
  libelle: string
  categorie?: string
}

export interface CreateCategorieDepenseDTO {
  code: string
  libelle: string
  description?: string
  categorie?: string
  ordreAffichage?: number
}

// ============================================================================
// Budget Ligne Imputation Types (Distribution par projet)
// ============================================================================

export interface BudgetLigneImputationDTO {
  id: number
  budgetLigneId: number
  projetId: number | null
  projetCode: string
  projetLibelle: string | null
  pourcentage: number
  montant: number
  typeImputation: string
  actif: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateBudgetLigneImputationRequest {
  projetId: number
  projetCode: string
  projetLibelle?: string
  pourcentage: number
  typeImputation?: string
}

export interface UpdateBudgetLigneImputationRequest {
  projetId?: number
  projetCode?: string
  projetLibelle?: string
  pourcentage: number
}

export interface BudgetLigneWithImputationsDTO {
  budgetLigne: ConventionBudgetLigneDTO
  imputationsBudget: BudgetLigneImputationDTO[]
  imputationsEngagement: BudgetLigneImputationDTO[]
  imputationsDepense: BudgetLigneImputationDTO[]
  totalPourcentageBudget: number
  totalPourcentageEngagement: number
  totalPourcentageDepense: number
}

export interface BudgetDistributionResponse {
  lignes: BudgetLigneWithImputationsDTO[]
  totalEngagement: number
  totalDepenses: number
  totalResteAEngager: number
  totalResteAPayer: number
}

export interface UpdateCategorieDepenseDTO {
  code?: string
  libelle?: string
  description?: string
  categorie?: string
  ordreAffichage?: number
  actif?: boolean
}

// ============================================================================
// Projet Types
// ============================================================================

export type ProjetStatus = 'ACTIF' | 'SUSPENDU' | 'ACHEVE'

export interface Projet {
  id: number
  code: string
  designation: string
  description?: string
  descriptionRich?: string
  budgetTotal: number
  status: ProjetStatus
  dateDebut: Date
  dateFin?: Date
  conventions?: Convention[]
  actif: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjetDTO extends Record<string, unknown> {
  code: string
  designation?: string
  description?: string
  descriptionRich?: string
  budgetTotal?: number
  status?: ProjetStatus
  dateDebut?: Date | string
  dateFin?: Date | string
}

export type UpdateProjetDTO = Partial<CreateProjetDTO>

// ============================================================================
// Marché Types
// ============================================================================

export type MarcheType = 'TRAVAUX' | 'FOURNITURES' | 'SERVICES'
export type MarcheStatus = 'PLANIFIE' | 'LANCE' | 'ATTRIBUE' | 'EN_COURS' | 'CLOTURE'

export interface Marche {
  id: number
  code: string
  designation: string
  description?: string
  descriptionRich?: string
  type: MarcheType
  status: MarcheStatus
  montantHT: number
  montantTTC: number
  tauxTVA: number
  dateMarche: Date
  dateDebutPrevue: Date
  dateFinPrevu: Date
  dateFinReel?: Date
  adresse?: string
  latitude?: number
  longitude?: number
  zoneGeographique?: string
  fournisseId: number
  convention?: Convention
  lignes?: MarcheLigne[]
  actif: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMarcheDTO extends Record<string, unknown> {
  code: string
  designation?: string
  description?: string
  descriptionRich?: string
  type?: MarcheType
  status?: MarcheStatus
  montantHT?: number
  tauxTVA?: number
  dateMarche?: Date | string
  dateDebutPrevue?: Date | string
  dateFinPrevu?: Date | string
  adresse?: string
  latitude?: number
  longitude?: number
  zoneGeographique?: string
  fournisseurId?: number
  conventionId?: number
}

export type UpdateMarcheDTO = Partial<CreateMarcheDTO>

// ============================================================================
// MarcheLigne Types
// ============================================================================

export interface MarcheLigne {
  id: number
  marche?: Marche
  designation: string
  quantite: number
  montantUnitaire: number
  montantTotal: number
  dimensionsValeurs?: Record<string, string> // JSONB
  actif: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateMarcheLineDTO extends Record<string, unknown> {
  designation: string
  quantite: number
  montantUnitaire: number
  dimensionsValeurs?: Record<string, string>
}

// ============================================================================
// Décompte Types
// ============================================================================

export type DecompteStatus = 'BROUILLON' | 'VALIDE' | 'PAYE'

export interface Decompte {
  id: number
  code: string
  montant: number
  netAPayer: number
  retenues?: number
  dateDecompte: Date
  marche?: Marche
  status: DecompteStatus
  actif: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateDecompteDTO extends Record<string, unknown> {
  marche?: { id: number | null }
  numeroDecompte?: string
  dateDecompte?: Date | string
  periodeDebut?: Date | string
  periodeFin?: Date | string
  montantBrutHT?: number
  montantTVA?: number
  observations?: string | null
  statut?: DecompteStatus | string
  code?: string
  montant?: number
  netAPayer?: number
  retenues?: number | Array<{ typeRetenue: string; montant: number; description: string | null; actif: boolean }>
  montantRetenue?: number
  marcheId?: number
  status?: DecompteStatus
  numero?: string
  observation?: string
}

export type UpdateDecompteDTO = Partial<CreateDecompteDTO>

// ============================================================================
// Fournisseur Types
// ============================================================================

export interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
  identifiantFiscal?: string
  ice?: string // 15-digit Moroccan tax ID
  adresse?: string
  ville?: string
  telephone?: string
  fax?: string
  email?: string
  contact?: string
  nonResident: boolean
  remarques?: string
  actif: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateFournisseurDTO extends Record<string, unknown> {
  code: string
  raisonSociale: string
  identifiantFiscal?: string
  ice?: string
  adresse?: string
  ville?: string
  telephone?: string
  fax?: string
  email?: string
  contact?: string
  nonResident?: boolean
  remarques?: string
}

export type UpdateFournisseurDTO = Partial<CreateFournisseurDTO>

// ============================================================================
// DimensionAnalytique Types
// ============================================================================

export interface DimensionAnalytique {
  id: number
  code: string
  libelle: string
  description?: string
  ordre: number
  obligatoire: boolean
  valeurs?: ValeurDimension[]
  actif: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ValeurDimension {
  id: number
  code: string
  libelle: string
  description?: string
  dimensionId: number
  ordre: number
  actif: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateDimensionDTO extends Record<string, unknown> {
  code: string
  libelle?: string
  nom?: string // Legacy field name
  description?: string
  ordre?: number
  obligatoire?: boolean
}

export interface CreateValeurDimensionDTO extends Record<string, unknown> {
  code: string
  libelle: string
  description?: string
  ordre: number
}

// ============================================================================
// Analytical Types
// ============================================================================

export interface ImputationAnalytique {
  id: number
  code: string
  montant: number
  pourcentage: number
  dimensionValeurs?: Record<string, string> // JSONB
  actif: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Form Types (for reusable form handling)
// ============================================================================

export interface FormFieldError {
  field: string
  message: string
}

export interface FormError {
  message: string
  fields?: FormFieldError[]
}

// ============================================================================
// Filtering & Search Types
// ============================================================================

export interface FilterState {
  [key: string]: string | number | boolean | null | undefined
}

export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

export interface ListRequestParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: FilterState
  search?: string
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ToastMessage {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface LoadingState<T = unknown> {
  isLoading: boolean
  error: string | null
  data: T | null
}

// ============================================================================
// Partenaire Types (Référentiel)
// ============================================================================

export interface Partenaire {
  id: number
  code: string
  raisonSociale: string
  sigle?: string
  typePartenaire?: string
  email?: string
  telephone?: string
  adresse?: string
  description?: string
  actif: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PartenaireListDTO {
  id: number
  code: string
  raisonSociale: string
  sigle?: string
  typePartenaire?: string
}

export interface CreatePartenaireDTO {
  code: string
  raisonSociale: string
  sigle?: string
  typePartenaire?: string
  email?: string
  telephone?: string
  adresse?: string
  description?: string
}

export interface UpdatePartenaireDTO extends Partial<CreatePartenaireDTO> {
  actif?: boolean
}

// ============================================================================
// Type Guards & Utilities
// ============================================================================

/**
 * Type guard to check if a value is an ApiResponse
 */
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'message' in value &&
    'data' in value
  )
}

/**
 * Type guard to check if a value is an error
 */
export function isApiError(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === false
  )
}

/**
 * Create a typed API response
 */
export function createApiResponse<T>(success: boolean, message: string, data: T): ApiResponse<T> {
  return { success, message, data }
}
