import { z } from 'zod'

/**
 * Form validation schemas using Zod
 * Provides type-safe validation for all forms in the application
 */

// Base patterns for common fields
const PATTERNS = {
  CODE: /^[A-Z0-9\-_]{1,50}$/,
  ICE: /^\d{15}$/,
  PHONE: /^(?:\+212|0)[567]\d{8}$/,
  RIB: /^\d{27}$/,
}

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom complet doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// ============================================================================
// Convention Schemas
// ============================================================================

export const conventionBaseSchema = z.object({
  code: z.string().min(1, 'Le code est requis').regex(PATTERNS.CODE, 'Format de code invalide'),
  designation: z.string().min(2, 'La désignation est requise').max(500),
  objet: z.string().min(5, 'L\'objet doit contenir au moins 5 caractères').max(2000),
  type: z.enum(['CADRE', 'SPECIFIQUE']).default('CADRE'),
  tauxCommission: z
    .number()
    .min(0, 'Le taux doit être positif')
    .max(100, 'Le taux ne peut pas dépasser 100%')
    .or(z.string().transform(Number)),
  montant: z
    .number()
    .positive('Le montant doit être positif')
    .or(z.string().transform(Number)),
  dateDebut: z.coerce.date(),
  dateFin: z.coerce.date().optional(),
  description: z.string().max(2000).optional(),
  baseCalcul: z.enum(['HT', 'TTC']).default('HT'),
  tauxTva: z
    .number()
    .min(0)
    .max(100)
    .or(z.string().transform(Number))
    .optional(),
  codeMarche: z.string().max(100).optional(),
  montantMinimal: z
    .number()
    .min(0)
    .or(z.string().transform(Number))
    .optional(),
  status: z.enum(['BROUILLON', 'SOUMIS', 'VALIDEE', 'EN_EXECUTION', 'ACHEVE']).optional(),
})

export const createConventionSchema = conventionBaseSchema

export const updateConventionSchema = conventionBaseSchema.partial()

export type CreateConventionFormData = z.infer<typeof createConventionSchema>
export type UpdateConventionFormData = z.infer<typeof updateConventionSchema>

// ============================================================================
// Projet Schemas
// ============================================================================

export const projectBaseSchema = z.object({
  code: z.string().min(1, 'Le code est requis').regex(PATTERNS.CODE, 'Format de code invalide'),
  designation: z.string().min(2, 'La désignation est requise').max(500),
  description: z.string().max(2000).optional(),
  budgetTotal: z
    .number()
    .positive('Le budget doit être positif')
    .or(z.string().transform(Number)),
  dateDebut: z.coerce.date(),
  dateFin: z.coerce.date().optional(),
  status: z.enum(['BROUILLON', 'ACTIF', 'CLOS']).optional(),
  responsable: z.string().max(100).optional(),
  lieu: z.string().max(200).optional(),
})

export const createProjectSchema = projectBaseSchema

export const updateProjectSchema = projectBaseSchema.partial()

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>

// ============================================================================
// Marché Schemas
// ============================================================================

export const marcheBaseSchema = z.object({
  code: z.string().min(1, 'Le code est requis').regex(PATTERNS.CODE, 'Format de code invalide'),
  designation: z.string().min(2, 'La désignation est requise').max(500),
  description: z.string().max(2000).optional(),
  type: z.enum(['TRAVAUX', 'FOURNITURES', 'SERVICES']).optional(),
  montantHT: z
    .number()
    .positive('Le montant doit être positif')
    .or(z.string().transform(Number)),
  montantTTC: z
    .number()
    .positive('Le montant doit être positif')
    .or(z.string().transform(Number))
    .optional(),
  tauxTva: z
    .number()
    .min(0)
    .max(100)
    .or(z.string().transform(Number))
    .optional(),
  dateMarche: z.coerce.date(),
  dateDebut: z.coerce.date().optional(),
  dateFin: z.coerce.date().optional(),
  fournisseurId: z.number().positive().optional(),
  adresse: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  zoneGeographique: z.string().max(200).optional(),
  status: z.enum(['BROUILLON', 'EN_COURS', 'CLOS']).optional(),
})

export const createMarcheSchema = marcheBaseSchema

export const updateMarcheSchema = marcheBaseSchema.partial()

export type CreateMarcheFormData = z.infer<typeof createMarcheSchema>
export type UpdateMarcheFormData = z.infer<typeof updateMarcheSchema>

// ============================================================================
// Fournisseur Schemas
// ============================================================================

export const fournisseurSchema = z.object({
  code: z.string().min(1, 'Le code est requis').regex(PATTERNS.CODE, 'Format de code invalide'),
  nom: z.string().min(2, 'Le nom est requis').max(300),
  email: z.string().email('Email invalide').optional(),
  telephone: z.string().regex(PATTERNS.PHONE, 'Format de téléphone invalide').optional(),
  ice: z
    .string()
    .regex(PATTERNS.ICE, 'L\'ICE doit contenir 15 chiffres')
    .or(z.number().positive().transform(String))
    .optional(),
  if: z.string().max(20).optional(),
  rib: z.string().max(100).optional(),
  adresse: z.string().max(500).optional(),
  ville: z.string().max(100).optional(),
  codePostal: z.string().max(20).optional(),
  pays: z.string().max(100).optional(),
  status: z.enum(['ACTIF', 'INACTIF']).optional(),
})

export const createFournisseurSchema = fournisseurSchema

export const updateFournisseurSchema = fournisseurSchema.partial()

export type CreateFournisseurFormData = z.infer<typeof createFournisseurSchema>
export type UpdateFournisseurFormData = z.infer<typeof updateFournisseurSchema>

// ============================================================================
// Décompte Schemas
// ============================================================================

export const decompteSchema = z.object({
  numero: z.string().min(1, 'Le numéro est requis').max(100),
  dateDecompte: z.coerce.date(),
  montant: z
    .number()
    .positive('Le montant doit être positif')
    .or(z.string().transform(Number)),
  netAPayer: z
    .number()
    .positive('Le montant doit être positif')
    .or(z.string().transform(Number))
    .optional(),
  retenues: z.number().min(0).or(z.string().transform(Number)).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['BROUILLON', 'PROPOSE', 'ACCEPTE', 'PAYE']).optional(),
})

export const createDecompteSchema = decompteSchema

export const updateDecompteSchema = decompteSchema.partial()

export type CreateDecompteFormData = z.infer<typeof createDecompteSchema>
export type UpdateDecompteFormData = z.infer<typeof updateDecompteSchema>

// ============================================================================
// Profile/Password Schemas
// ============================================================================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Le mot de passe actuel est requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis').max(300),
  email: z.string().email('Email invalide'),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
