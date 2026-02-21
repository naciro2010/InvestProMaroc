import { z } from 'zod'
import { getPlainTextLength } from '@/utils/textUtils'

export interface ConventionEditFormData {
  code: string
  numero: string
  typeConvention: 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'
  libelle: string
  objet: string
  budget: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  tauxTvaLignes: number
  dateConvention: string
  dateDebut: string
  dateFin: string
  dureeMois: number
}

export interface ConventionMetadata {
  id: number
  statut: string
  createdAt: string
  updatedAt: string
  createdBy: string
  dateSoumission: string | null
  dateValidation: string | null
  parentConventionCode: string | null
  isLocked: boolean
  sousConventionsCount: number
}

export const conventionEditSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  numero: z.string().default(''),
  typeConvention: z.enum(['CADRE', 'NON_CADRE', 'SPECIFIQUE', 'AVENANT']),
  libelle: z
    .string()
    .min(1, 'Le libelle est requis')
    .refine(
      (val) => getPlainTextLength(val) >= 3,
      'Minimum 3 caracteres pour le libelle'
    )
    .refine(
      (val) => getPlainTextLength(val) <= 200,
      'Maximum 200 caracteres pour le libelle'
    ),
  objet: z
    .string()
    .min(1, "L'objet est requis")
    .refine(
      (val) => getPlainTextLength(val) >= 10,
      "Minimum 10 caracteres pour l'objet"
    )
    .refine(
      (val) => getPlainTextLength(val) <= 2000,
      "Maximum 2000 caracteres pour l'objet"
    ),
  budget: z.number().min(0, 'Le budget doit etre positif'),
  tauxCommission: z
    .number()
    .min(0, 'Le taux doit etre positif')
    .max(100, 'Maximum 100%'),
  baseCalcul: z.string().min(1, 'La base de calcul est requise'),
  tauxTva: z
    .number()
    .min(0, 'Le taux TVA doit etre positif')
    .max(100, 'Maximum 100%'),
  tauxTvaLignes: z
    .number()
    .min(0, 'Le taux TVA lignes doit etre positif')
    .max(100, 'Maximum 100%'),
  dateConvention: z.string().min(1, 'La date de signature est requise'),
  dateDebut: z.string().min(1, 'La date de debut est requise'),
  dateFin: z.string().default(''),
  dureeMois: z.number().min(0, 'La duree doit etre positive'),
})

export const formatCurrencyMAD = (value: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
  }).format(value)

export const formatDateFR = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const CONVENTION_STATUS_STEPS = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDEE', label: 'Validee' },
  { value: 'EN_EXECUTION', label: 'En execution' },
  { value: 'ACHEVE', label: 'Acheve' },
]
