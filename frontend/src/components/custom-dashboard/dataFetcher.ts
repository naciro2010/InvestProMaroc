/**
 * DataFetcher - Maps parsed instructions to API calls and transforms data
 * for visualization rendering.
 *
 * Uses dynamic column inference from actual API data instead of hardcoded
 * column definitions, ensuring all available fields are displayed.
 */

import {
  conventionsAPI,
  marchesAPI,
  projetsAPI,
  decomptesAPI,
  paiementsAPI,
  fournisseursAPI,
  budgetsAPI,
} from '@/lib/api'
import type {
  ParsedInstruction,
  EntityType,
  GroupByField,
  MetricType,
  StatusFilter,
} from './instructionParser'

// ============================================================================
// Types
// ============================================================================

export interface DataRow {
  [key: string]: string | number
}

export interface FetchedData {
  rows: DataRow[]
  columns: ColumnDef[]
  totalCount: number
  entityLabel: string
}

export interface ColumnDef {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'status'
  align?: 'left' | 'right' | 'center'
}

/**
 * Loosely typed raw record from the API.
 * Fields match actual backend DTO naming (camelCase).
 */
interface RawRecord {
  id?: number

  // Identifiers
  code?: string
  numero?: string
  numeroMarche?: string
  numAo?: string
  numeroDecompte?: string
  referencePaiement?: string

  // Labels
  designation?: string
  libelle?: string
  objet?: string
  raisonSociale?: string
  nom?: string
  description?: string

  // Status & type
  statut?: string
  status?: string
  typeConvention?: string
  typeMarche?: string
  type?: string
  naturePrestation?: string

  // Convention amounts
  budget?: number
  tauxCommission?: number

  // Marché amounts (camelCase from API)
  montantHt?: number
  montantHT?: number
  montantTtc?: number
  montantTTC?: number
  montantTva?: number
  montant?: number

  // Décompte amounts
  montantBrutHT?: number
  totalRetenues?: number
  netAPayer?: number

  // Paiement amounts
  montantPaye?: number

  // Projet
  budgetTotal?: number
  pourcentageAvancement?: number

  // Budget entity
  totalBudget?: number
  plafondConvention?: number
  version?: string

  // Dates
  datePaiement?: string
  dateValeur?: string
  dateExecution?: string
  dateDecompte?: string
  dateDebut?: string
  dateFin?: string
  dateFinPrevue?: string
  dateMarche?: string
  dateSignature?: string
  dateBudget?: string
  dateConvention?: string
  createdAt?: string
  updatedAt?: string

  // Flat foreign key references (from backend DTOs)
  conventionId?: number
  conventionNumero?: string
  conventionLibelle?: string
  conventionCode?: string
  marcheId?: number
  marcheNumero?: string
  marcheFournisseur?: string
  fournisseurId?: number
  fournisseurNom?: string
  fournisseurCode?: string
  fournisseurIce?: string
  projetId?: number
  chefProjetNom?: string

  // Nested objects (some APIs may still return these)
  fournisseur?: { id?: number; raisonSociale?: string; code?: string }
  convention?: { id?: number; libelle?: string; code?: string; numero?: string }
  marche?: { id?: number; code?: string; designation?: string; objet?: string }
  projet?: { id?: number; code?: string; designation?: string; nom?: string }

  // Geolocation
  zoneGeographique?: string
  adresse?: string
  ville?: string
  localisation?: string

  // Fournisseur specific
  ice?: string
  identifiantFiscal?: string
  telephone?: string
  email?: string

  // Paiement specific
  modePaiement?: string
  ordrePaiementId?: number
  numeroOP?: string
  estPaiementPartiel?: boolean

  // Convention specific
  createdByNom?: string

  // Marché specific
  nbLignes?: number
  nbAvenants?: number
  nbDecomptes?: number
  delaiExecutionMois?: number
  tauxTva?: number

  // Décompte specific (totalRetenues already declared above)
  cumulPrecedent?: number
  cumulActuel?: number
  estSolde?: boolean
  nbRetenues?: number
  nbImputations?: number

  // Catch-all for unexpected fields
  [key: string]: unknown
}

// ============================================================================
// Constants
// ============================================================================

const ENTITY_LABELS: Record<EntityType, string> = {
  conventions: 'Conventions',
  marches: 'Marchés',
  projets: 'Projets',
  decomptes: 'Décomptes',
  paiements: 'Paiements',
  fournisseurs: 'Fournisseurs',
  budgets: 'Budgets',
}

/** Keys to hide from dynamic column inference (internal/technical fields) */
const HIDDEN_KEYS = new Set([
  'id', 'actif', 'createdAt', 'updatedAt',
  'conventionId', 'marcheId', 'fournisseurId', 'projetId', 'ordrePaiementId',
  'fournisseur', 'convention', 'marche', 'projet', // nested objects
])

/** Human-readable labels for all known fields */
const FIELD_LABELS: Record<string, string> = {
  // Identifiers
  code: 'Code',
  numero: 'Numéro',
  numeroMarche: 'N° Marché',
  numAo: "N° Appel d'Offres",
  numeroDecompte: 'N° Décompte',
  referencePaiement: 'Référence',
  // Labels
  libelle: 'Libellé',
  objet: 'Objet',
  designation: 'Désignation',
  nom: 'Nom',
  raisonSociale: 'Raison Sociale',
  description: 'Description',
  version: 'Version',
  // Status & Type
  statut: 'Statut',
  status: 'Statut',
  typeConvention: 'Type Convention',
  typeMarche: 'Type Marché',
  type: 'Type',
  naturePrestation: 'Nature Prestation',
  // Amounts
  montantHt: 'Montant HT (MAD)',
  montantHT: 'Montant HT (MAD)',
  montantTtc: 'Montant TTC (MAD)',
  montantTTC: 'Montant TTC (MAD)',
  montantTva: 'TVA (MAD)',
  montant: 'Montant (MAD)',
  budget: 'Budget (MAD)',
  budgetTotal: 'Budget Total (MAD)',
  totalBudget: 'Total Budget (MAD)',
  plafondConvention: 'Plafond Convention (MAD)',
  montantBrutHT: 'Montant Brut HT (MAD)',
  totalRetenues: 'Retenues (MAD)',
  netAPayer: 'Net à Payer (MAD)',
  montantPaye: 'Montant Payé (MAD)',
  tauxCommission: 'Taux Commission (%)',
  tauxTva: 'Taux TVA (%)',
  pourcentageAvancement: 'Avancement (%)',
  cumulPrecedent: 'Cumul Précédent (MAD)',
  cumulActuel: 'Cumul Actuel (MAD)',
  delaiExecutionMois: 'Délai Exécution (mois)',
  // Dates
  dateDebut: 'Date Début',
  dateFin: 'Date Fin',
  dateFinPrevue: 'Date Fin Prévue',
  dateMarche: 'Date Marché',
  dateDecompte: 'Date Décompte',
  dateValeur: 'Date Valeur',
  dateExecution: 'Date Exécution',
  dateSignature: 'Date Signature',
  dateBudget: 'Date Budget',
  dateConvention: 'Date Convention',
  datePaiement: 'Date Paiement',
  // Relations
  fournisseurNom: 'Fournisseur',
  fournisseurCode: 'Code Fournisseur',
  fournisseurIce: 'ICE Fournisseur',
  marcheNumero: 'N° Marché',
  marcheFournisseur: 'Fournisseur Marché',
  conventionNumero: 'N° Convention',
  conventionLibelle: 'Convention',
  conventionCode: 'Code Convention',
  chefProjetNom: 'Chef de Projet',
  numeroOP: "N° Ordre Paiement",
  // Geolocation
  zoneGeographique: 'Zone Géographique',
  adresse: 'Adresse',
  ville: 'Ville',
  localisation: 'Localisation',
  // Fournisseur specific
  ice: 'ICE',
  identifiantFiscal: 'IF',
  telephone: 'Téléphone',
  email: 'Email',
  // Misc
  modePaiement: 'Mode Paiement',
  createdByNom: 'Créé par',
  estPaiementPartiel: 'Paiement Partiel',
  estSolde: 'Soldé',
  nbLignes: 'Nb Lignes',
  nbAvenants: 'Nb Avenants',
  nbDecomptes: 'Nb Décomptes',
  nbRetenues: 'Nb Retenues',
  nbImputations: 'Nb Imputations',
}

/** Priority column ordering per entity (controls which columns appear first) */
const PRIORITY_KEYS: Record<EntityType, string[]> = {
  conventions: [
    'code', 'numero', 'libelle', 'typeConvention', 'statut',
    'budget', 'tauxCommission', 'dateDebut', 'dateFin', 'createdByNom',
  ],
  marches: [
    'numeroMarche', 'objet', 'fournisseurNom', 'typeMarche', 'naturePrestation',
    'statut', 'montantHt', 'montantTtc', 'tauxTva', 'zoneGeographique',
    'dateMarche', 'dateDebut', 'delaiExecutionMois',
    'nbLignes', 'nbDecomptes', 'nbAvenants',
  ],
  projets: [
    'code', 'nom', 'statut', 'budgetTotal', 'pourcentageAvancement',
    'dateDebut', 'dateFinPrevue', 'chefProjetNom',
  ],
  decomptes: [
    'numeroDecompte', 'marcheNumero', 'marcheFournisseur',
    'montantBrutHT', 'totalRetenues', 'netAPayer', 'montantPaye',
    'cumulPrecedent', 'cumulActuel',
    'statut', 'estSolde', 'dateDecompte',
    'nbRetenues', 'nbImputations',
  ],
  paiements: [
    'referencePaiement', 'montantPaye', 'modePaiement',
    'estPaiementPartiel', 'numeroOP',
    'dateValeur', 'dateExecution',
  ],
  fournisseurs: [
    'code', 'raisonSociale', 'ice', 'identifiantFiscal',
    'telephone', 'email', 'adresse', 'ville',
  ],
  budgets: [
    'version', 'totalBudget', 'plafondConvention',
    'statut', 'dateBudget',
  ],
}

// ============================================================================
// API Fetchers by Entity
// ============================================================================

async function fetchRawData(entity: EntityType): Promise<RawRecord[]> {
  let response: { data: { data?: RawRecord[] | RawRecord; success?: boolean } | RawRecord[] }

  switch (entity) {
    case 'conventions':
      response = await conventionsAPI.getAll()
      break
    case 'marches':
      response = await marchesAPI.getAll()
      break
    case 'projets':
      response = await projetsAPI.getAll()
      break
    case 'decomptes':
      response = await decomptesAPI.getAll()
      break
    case 'paiements':
      response = await paiementsAPI.getAll()
      break
    case 'fournisseurs':
      response = await fournisseursAPI.getAll()
      break
    case 'budgets':
      response = await budgetsAPI.getAll()
      break
    default:
      throw new Error(`Entité non supportée: ${entity}`)
  }

  // Handle ApiResponse<T> wrapper: { success, message, data }
  const data = response.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = data.data
    if (Array.isArray(inner)) return inner
    if (inner && typeof inner === 'object') return [inner as RawRecord]
  }
  return []
}

// ============================================================================
// Dynamic Column Inference
// ============================================================================

/** Known date field patterns */
const DATE_FIELD_PATTERN = /^date|At$/

/** Known status fields */
const STATUS_FIELDS = new Set(['statut', 'status'])

/** Known numeric field patterns */
const NUMERIC_FIELD_PATTERNS = [
  /^montant/, /^budget/, /^total/, /^net/, /^taux/, /^cumul/,
  /^nb/, /^nombre/, /^pourcentage/, /^plafond/, /^delai/,
]

/** Infer the column type from a field key and a sample value */
function inferFieldType(key: string, sampleValue: unknown): 'string' | 'number' | 'date' | 'status' {
  if (STATUS_FIELDS.has(key)) return 'status'
  if (DATE_FIELD_PATTERN.test(key)) return 'date'
  if (typeof sampleValue === 'number') return 'number'
  if (NUMERIC_FIELD_PATTERNS.some(p => p.test(key))) return 'number'
  if (typeof sampleValue === 'boolean') return 'string' // will convert to Oui/Non
  return 'string'
}

/** Convert camelCase key to human-readable label */
function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

/**
 * Dynamically infer columns from actual API records.
 * Priority keys appear first; remaining data keys follow.
 * Hidden/technical keys are excluded.
 */
function inferColumns(records: RawRecord[], entity: EntityType): ColumnDef[] {
  if (records.length === 0) return []

  // Scan actual data keys from first few records (union of all keys)
  const allKeys = new Set<string>()
  const sampleSize = Math.min(records.length, 5)
  for (let i = 0; i < sampleSize; i++) {
    for (const key of Object.keys(records[i])) {
      const val = records[i][key]
      // Only include primitive, non-null values (skip nested objects and nulls)
      if (val !== null && val !== undefined && typeof val !== 'object') {
        allKeys.add(key)
      }
    }
  }

  // Build ordered column list: priority keys first (if present), then remaining
  const priority = PRIORITY_KEYS[entity] || []
  const orderedKeys: string[] = [
    ...priority.filter(k => allKeys.has(k)),
    ...[...allKeys].filter(k => !priority.includes(k) && !HIDDEN_KEYS.has(k)),
  ]

  // Find a record with non-null values for type inference
  const sampleRecord = records[0]

  return orderedKeys.map(key => {
    const fieldType = inferFieldType(key, sampleRecord[key])
    return {
      key,
      label: FIELD_LABELS[key] || humanizeKey(key),
      type: fieldType,
      align: fieldType === 'number' ? 'right' as const : 'left' as const,
    }
  })
}

// ============================================================================
// Cell Value Extraction
// ============================================================================

/**
 * Extract a display-ready cell value from a raw record.
 * Handles nested objects, booleans, and special field resolution.
 */
function extractCellValue(record: RawRecord, key: string, colType: 'string' | 'number' | 'date' | 'status'): string | number {
  // Special handling for fields that need cross-field resolution
  switch (key) {
    case 'statut':
      return getStatus(record)
    case 'fournisseurNom':
      return record.fournisseurNom || record.fournisseur?.raisonSociale || record.marcheFournisseur || ''
    case 'marcheFournisseur':
      return record.marcheFournisseur || record.fournisseurNom || record.fournisseur?.raisonSociale || ''
    case 'marcheNumero':
      return record.marcheNumero || record.marche?.code || record.numeroMarche || (record.marcheId ? `#${record.marcheId}` : '')
    case 'conventionLibelle':
      return record.conventionLibelle || record.conventionNumero || record.convention?.libelle || ''
    case 'conventionNumero':
      return record.conventionNumero || record.conventionCode || record.convention?.numero || ''
    default:
      break
  }

  const val = record[key]

  // Handle booleans → Oui/Non
  if (typeof val === 'boolean') {
    return val ? 'Oui' : 'Non'
  }

  // Handle null/undefined
  if (val === null || val === undefined) {
    return colType === 'number' ? 0 : ''
  }

  // Handle numbers
  if (colType === 'number') {
    return toNumber(val)
  }

  // Handle montantHt/montantHT casing variants
  if (key === 'montantHt' && (val === undefined || val === null || val === 0)) {
    const alt = record.montantHT
    if (alt !== undefined && alt !== null) return toNumber(alt)
  }
  if (key === 'montantTtc' && (val === undefined || val === null || val === 0)) {
    const alt = record.montantTTC
    if (alt !== undefined && alt !== null) return toNumber(alt)
  }

  // Handle string/number primitives
  if (typeof val === 'string' || typeof val === 'number') {
    return val
  }

  return String(val)
}

// ============================================================================
// Field Extractors
// ============================================================================

function getStatus(record: RawRecord): string {
  return record.statut || record.status || 'N/A'
}

function getType(record: RawRecord): string {
  return record.typeConvention || record.typeMarche || record.naturePrestation || record.type || 'N/A'
}

/** Get the best monetary amount from a record depending on entity context */
function getAmount(record: RawRecord, entity: EntityType): number {
  switch (entity) {
    case 'marches':
      return toNumber(record.montantHt ?? record.montantHT ?? record.montantTtc ?? record.montantTTC ?? 0)
    case 'decomptes':
      return toNumber(record.netAPayer ?? record.montantBrutHT ?? record.montant ?? 0)
    case 'paiements':
      return toNumber(record.montantPaye ?? record.montant ?? 0)
    case 'conventions':
      return toNumber(record.budget ?? record.montant ?? 0)
    case 'projets':
      return toNumber(record.budgetTotal ?? record.budget ?? 0)
    case 'budgets':
      return toNumber(record.totalBudget ?? record.plafondConvention ?? 0)
    case 'fournisseurs':
      return 0
    default:
      return toNumber(record.montant ?? record.budget ?? 0)
  }
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/\s/g, '').replace(',', '.'))
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/** Get the best date for temporal grouping */
function getTemporalDate(record: RawRecord, entity: EntityType): string | null {
  switch (entity) {
    case 'paiements':
      return record.dateValeur || record.dateExecution || record.createdAt || null
    case 'decomptes':
      return record.dateDecompte || record.createdAt || null
    case 'marches':
      return record.dateMarche || record.dateSignature || record.dateDebut || record.createdAt || null
    case 'conventions':
      return record.dateConvention || record.dateDebut || record.createdAt || null
    case 'budgets':
      return record.dateBudget || record.createdAt || null
    case 'projets':
      return record.dateDebut || record.createdAt || null
    default:
      return record.dateDebut || record.createdAt || null
  }
}

function getGroupValue(record: RawRecord, groupBy: GroupByField, entity: EntityType): string {
  switch (groupBy) {
    case 'statut':
      return getStatus(record)
    case 'type':
      return getType(record)
    case 'convention':
      return (
        record.conventionLibelle ||
        record.conventionNumero ||
        record.conventionCode ||
        record.convention?.libelle ||
        record.convention?.numero ||
        record.convention?.code ||
        (record.conventionId ? `Conv #${record.conventionId}` : 'Sans convention')
      )
    case 'marche':
      return (
        record.marcheNumero ||
        record.marche?.designation ||
        record.marche?.code ||
        record.numeroMarche ||
        (record.marcheId ? `Marché #${record.marcheId}` : 'Sans marché')
      )
    case 'fournisseur':
      return (
        record.fournisseurNom ||
        record.fournisseur?.raisonSociale ||
        record.fournisseurCode ||
        record.fournisseur?.code ||
        record.raisonSociale ||
        (record.fournisseurId ? `Fournisseur #${record.fournisseurId}` : 'Sans fournisseur')
      )
    case 'projet':
      return (
        record.projet?.designation ||
        record.projet?.nom ||
        record.projet?.code ||
        (record.projetId ? `Projet #${record.projetId}` : 'Sans projet')
      )
    case 'mois': {
      const date = getTemporalDate(record, entity)
      if (!date) return 'Date inconnue'
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'Date invalide'
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      return `${months[d.getMonth()]} ${d.getFullYear()}`
    }
    case 'annee': {
      const date = getTemporalDate(record, entity)
      if (!date) return 'Date inconnue'
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'Date invalide'
      return String(d.getFullYear())
    }
    case 'zone':
      return record.zoneGeographique || record.ville || record.localisation || 'Non définie'
    default:
      return 'N/A'
  }
}

/**
 * Get the metric value for a record.
 * Tries the exact requested field first, then casing variants, then entity default.
 */
function getMetricValue(record: RawRecord, metricField: string, entity: EntityType): number {
  // Try the exact requested field first
  const directValue = record[metricField]
  if (directValue !== null && directValue !== undefined && directValue !== '') {
    const num = toNumber(directValue)
    if (num !== 0 || directValue === 0 || directValue === '0') return num
  }

  // Handle common casing variants (montantHT vs montantHt)
  const casingVariants: Record<string, string[]> = {
    montantHT: ['montantHt'],
    montantHt: ['montantHT'],
    montantTTC: ['montantTtc'],
    montantTtc: ['montantTTC'],
  }
  const variants = casingVariants[metricField]
  if (variants) {
    for (const v of variants) {
      const val = record[v]
      if (val !== null && val !== undefined && val !== '') {
        return toNumber(val)
      }
    }
  }

  // Last resort: entity-aware default
  return getAmount(record, entity)
}

// ============================================================================
// Data Transformation - Table (ungrouped) — Dynamic columns
// ============================================================================

function buildUngroupedTable(records: RawRecord[], instruction: ParsedInstruction): FetchedData {
  const columns = inferColumns(records, instruction.entity)

  let rows: DataRow[] = records.map((record) => {
    const row: DataRow = {}
    for (const col of columns) {
      row[col.key] = extractCellValue(record, col.key, col.type)
    }
    return row
  })

  if (instruction.limit) {
    rows = rows.slice(0, instruction.limit)
  }

  return {
    rows,
    columns,
    totalCount: records.length,
    entityLabel: ENTITY_LABELS[instruction.entity] || instruction.entity,
  }
}

// ============================================================================
// Data Transformation - Grouped (for charts)
// ============================================================================

function buildGroupedData(records: RawRecord[], instruction: ParsedInstruction): FetchedData {
  const { entity, groupBy, metric, metricField, limit } = instruction

  if (!groupBy) {
    return buildUngroupedTable(records, instruction)
  }

  // Group records
  const groups = new Map<string, RawRecord[]>()
  for (const record of records) {
    const key = getGroupValue(record, groupBy, entity)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(record)
  }

  // Compute metric per group
  let rows: DataRow[] = Array.from(groups.entries()).map(([groupKey, groupRecords]) => {
    let value: number
    switch (metric) {
      case 'count':
        value = groupRecords.length
        break
      case 'sum':
        value = groupRecords.reduce((sum, r) => sum + getMetricValue(r, metricField, entity), 0)
        value = Math.round(value * 100) / 100
        break
      case 'average': {
        const total = groupRecords.reduce((sum, r) => sum + getMetricValue(r, metricField, entity), 0)
        value = groupRecords.length > 0 ? Math.round((total / groupRecords.length) * 100) / 100 : 0
        break
      }
      default:
        value = groupRecords.length
    }

    return {
      group: groupKey,
      value,
      count: groupRecords.length,
      percentage: 0,
      rank: 0,
    }
  })

  // Sort by value descending
  rows.sort((a, b) => (b.value as number) - (a.value as number))

  // Calculate percentages and ranks
  const grandTotal = rows.reduce((s, r) => s + (r.value as number), 0)
  rows.forEach((row, idx) => {
    row.percentage = grandTotal > 0 ? Math.round(((row.value as number) / grandTotal) * 10000) / 100 : 0
    row.rank = idx + 1
  })

  // Apply limit
  if (limit) {
    rows = rows.slice(0, limit)
  }

  const metricLabels: Record<MetricType, string> = {
    count: 'Nombre',
    sum: 'Montant Total (MAD)',
    average: 'Moyenne (MAD)',
  }

  const columns: ColumnDef[] = [
    { key: 'rank', label: '#', type: 'number', align: 'center' },
    { key: 'group', label: 'Catégorie', type: 'string' },
    { key: 'value', label: metricLabels[metric], type: 'number', align: 'right' },
    { key: 'percentage', label: 'Part %', type: 'number', align: 'right' },
    { key: 'count', label: 'Nombre', type: 'number', align: 'right' },
  ]

  return {
    rows,
    columns,
    totalCount: records.length,
    entityLabel: ENTITY_LABELS[entity] || entity,
  }
}

// ============================================================================
// Filter Application — OR logic (not AND)
// ============================================================================

function applyFilters(records: RawRecord[], filters: StatusFilter[]): RawRecord[] {
  if (!filters || filters.length === 0) return records

  return records.filter((record) => {
    // Use OR: record matches if ANY filter matches
    return filters.some((filter) => {
      const recordValue = filter.field === 'statut'
        ? getStatus(record)
        : getType(record)
      return filter.values.some(v => recordValue.toUpperCase() === v.toUpperCase())
    })
  })
}

// ============================================================================
// Sort Application
// ============================================================================

function applySortDirection(records: RawRecord[], instruction: ParsedInstruction): RawRecord[] {
  if (!instruction.limit && instruction.sortDirection === 'desc') return records

  const sorted = [...records].sort((a, b) => {
    const aVal = getAmount(a, instruction.entity)
    const bVal = getAmount(b, instruction.entity)
    return instruction.sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  return sorted
}

// ============================================================================
// Main Fetch Function
// ============================================================================

export async function fetchDataForInstruction(instruction: ParsedInstruction): Promise<FetchedData> {
  let records = await fetchRawData(instruction.entity)

  // Apply filters
  if (instruction.filters && instruction.filters.length > 0) {
    records = applyFilters(records, instruction.filters)
  }

  // Apply sorting for ungrouped queries with limit
  if (instruction.limit && !instruction.groupBy) {
    records = applySortDirection(records, instruction)
  }

  if (records.length === 0) {
    return {
      rows: [],
      columns: [{ key: 'message', label: 'Information', type: 'string' }],
      totalCount: 0,
      entityLabel: ENTITY_LABELS[instruction.entity] || instruction.entity,
    }
  }

  if (instruction.groupBy) {
    return buildGroupedData(records, instruction)
  }

  return buildUngroupedTable(records, instruction)
}
