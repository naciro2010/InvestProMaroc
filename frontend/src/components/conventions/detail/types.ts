/**
 * Shared types for convention detail components.
 * Eliminates duplicated interfaces across drawer, card, and section components.
 */

// ---------- Financial ----------

export interface SituationPaiement {
  totalDecomptes: number
  totalNetAPayer: number
  totalMontantPaye: number
  resteAPayer: number
  tauxPaiement: number
}

export interface MarcheData {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

// ---------- Versements ----------

/** Full versement – used by VersementsCard, PrevisionnelSection, VersementDetailDrawer */
export interface VersementPrevisionnel {
  id: number
  partenaireId?: number
  partenaireNom?: string
  partenaireSigle?: string
  volet?: string
  dateVersement: string
  montant: number
  montantPrevu?: number
  remarques?: string
}

/** Minimal versement subset used by PartenairesCard */
export interface VersementPartenaireRef {
  id: number
  partenaireId?: number
  montant: number
  montantPrevu?: number
}

// ---------- Imputations ----------

export interface ImputationPrevisionnelle {
  id: number
  conventionId: number
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue?: string
  montantPrevu?: number
  remarques?: string
}

// ---------- Subventions ----------

export interface Subvention {
  id: number
  conventionId: number
  organismeBailleur: string
  typeSubvention?: string
  montantTotal: number
  devise: string
  tauxChange?: number
  dateDebutValidite?: string
  dateFinValidite?: string
  conditions?: string
}

// ---------- Sous-conventions & Avenants ----------

export interface SousConvention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
  dateDebut: string
}

export interface Avenant {
  id: number
  numeroAvenant: string
  dateAvenant: string
  statut: string
  objet: string
  type: string
}

// ---------- Projets & Marches (related tab) ----------

export interface Projet {
  id: number
  code: string
  designation: string
  budgetTotal: number
  statut: string
}

export interface Marche {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

// ---------- Shared table styles ----------

import { colors, typography } from '@/lib/designSystem'

/** Compact table header cell style (uppercase, semibold) – used across all card tables */
export const thStyle = {
  fontWeight: typography.weights.semibold,
  fontSize: typography.sizes.xs,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}
