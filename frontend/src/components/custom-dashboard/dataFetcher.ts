/**
 * DataFetcher - Maps parsed instructions to API calls and transforms data
 * for visualization rendering.
 *
 * Handles the full pipeline: API call → raw record extraction → grouping →
 * metric calculation → chart/table-ready output.
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
  dateMarche?: string
  dateSignature?: string
  dateBudget?: string
  dateConvention?: string
  createdAt?: string

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

  // Catch-all for unexpected fields
  [key: string]: unknown
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
// Field Extractors - Match actual backend DTO field names
// ============================================================================

function getLabel(record: RawRecord): string {
  return (
    record.designation ||
    record.libelle ||
    record.objet ||
    record.nom ||
    record.raisonSociale ||
    record.description ||
    record.code ||
    record.numero ||
    record.numeroMarche ||
    record.numeroDecompte ||
    record.referencePaiement ||
    `#${record.id ?? '?'}`
  )
}

function getCode(record: RawRecord): string {
  return (
    record.code ||
    record.numero ||
    record.numeroMarche ||
    record.numeroDecompte ||
    record.referencePaiement ||
    `#${record.id ?? '?'}`
  )
}

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
      // Backend returns montantHt (camelCase) - also check montantHT for safety
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
      return 0 // Fournisseurs don't have amounts
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
      if (!date) return 'N/A'
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'N/A'
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      return `${months[d.getMonth()]} ${d.getFullYear()}`
    }
    case 'annee': {
      const date = getTemporalDate(record, entity)
      if (!date) return 'N/A'
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'N/A'
      return String(d.getFullYear())
    }
    case 'zone':
      return record.zoneGeographique || record.ville || record.localisation || 'Non définie'
    default:
      return 'N/A'
  }
}

function getMetricValue(record: RawRecord, metricField: string, entity: EntityType): number {
  // Use entity-aware amount extraction for common metric fields
  if (['montant', 'montantHT', 'montantHt', 'netAPayer', 'budget', 'montantTTC', 'montantTtc'].includes(metricField)) {
    return getAmount(record, entity)
  }
  const val = record[metricField]
  return toNumber(val)
}

// ============================================================================
// Data Transformation - Table (ungrouped)
// ============================================================================

function buildUngroupedTable(records: RawRecord[], instruction: ParsedInstruction): FetchedData {
  const { entity, limit } = instruction

  const entityColumns: Record<EntityType, ColumnDef[]> = {
    conventions: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'libelle', label: 'Libellé', type: 'string' },
      { key: 'typeConvention', label: 'Type', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'budget', label: 'Budget', type: 'number', align: 'right' },
      { key: 'dateDebut', label: 'Date début', type: 'date' },
    ],
    marches: [
      { key: 'code', label: 'N° Marché', type: 'string' },
      { key: 'objet', label: 'Objet', type: 'string' },
      { key: 'fournisseurNom', label: 'Fournisseur', type: 'string' },
      { key: 'typeMarche', label: 'Type', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'montantHt', label: 'Montant HT', type: 'number', align: 'right' },
      { key: 'montantTtc', label: 'Montant TTC', type: 'number', align: 'right' },
    ],
    projets: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'nom', label: 'Nom', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'budgetTotal', label: 'Budget Total', type: 'number', align: 'right' },
      { key: 'dateDebut', label: 'Date début', type: 'date' },
    ],
    decomptes: [
      { key: 'code', label: 'N° Décompte', type: 'string' },
      { key: 'marcheNumero', label: 'Marché', type: 'string' },
      { key: 'marcheFournisseur', label: 'Fournisseur', type: 'string' },
      { key: 'montantBrutHT', label: 'Montant Brut HT', type: 'number', align: 'right' },
      { key: 'netAPayer', label: 'Net à Payer', type: 'number', align: 'right' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'dateDecompte', label: 'Date', type: 'date' },
    ],
    paiements: [
      { key: 'code', label: 'Référence', type: 'string' },
      { key: 'montantPaye', label: 'Montant', type: 'number', align: 'right' },
      { key: 'modePaiement', label: 'Mode', type: 'string' },
      { key: 'dateValeur', label: 'Date Valeur', type: 'date' },
      { key: 'dateExecution', label: 'Date Exécution', type: 'date' },
    ],
    fournisseurs: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'raisonSociale', label: 'Raison Sociale', type: 'string' },
      { key: 'ice', label: 'ICE', type: 'string' },
      { key: 'ville', label: 'Ville', type: 'string' },
      { key: 'telephone', label: 'Téléphone', type: 'string' },
    ],
    budgets: [
      { key: 'conventionLibelle', label: 'Convention', type: 'string' },
      { key: 'version', label: 'Version', type: 'string' },
      { key: 'totalBudget', label: 'Total Budget', type: 'number', align: 'right' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'dateBudget', label: 'Date', type: 'date' },
    ],
  }

  const columns = entityColumns[entity] || [
    { key: 'label', label: 'Élément', type: 'string' as const },
  ]

  let rows: DataRow[] = records.map((record) => {
    const row: DataRow = {}
    for (const col of columns) {
      switch (col.key) {
        case 'statut':
          row[col.key] = getStatus(record)
          break
        case 'typeConvention':
        case 'typeMarche':
        case 'type':
          row[col.key] = getType(record)
          break
        case 'code':
          row[col.key] = getCode(record)
          break
        case 'designation':
        case 'libelle':
        case 'nom':
        case 'objet':
        case 'label':
          row[col.key] = getLabel(record)
          break
        case 'fournisseurNom':
          row[col.key] = record.fournisseurNom || record.fournisseur?.raisonSociale || record.marcheFournisseur || ''
          break
        case 'marcheFournisseur':
          row[col.key] = record.marcheFournisseur || record.fournisseurNom || ''
          break
        case 'marcheNumero':
          row[col.key] = record.marcheNumero || record.marche?.code || record.numeroMarche || (record.marcheId ? `#${record.marcheId}` : '')
          break
        case 'conventionNumero':
        case 'conventionLibelle':
          row[col.key] = record.conventionLibelle || record.conventionNumero || record.conventionCode || record.convention?.libelle || ''
          break
        case 'raisonSociale':
          row[col.key] = record.raisonSociale || ''
          break
        // Amount fields - handle both camelCase variants
        case 'montantHt':
        case 'montantHT':
          row[col.key] = toNumber(record.montantHt ?? record.montantHT ?? 0)
          break
        case 'montantTtc':
        case 'montantTTC':
          row[col.key] = toNumber(record.montantTtc ?? record.montantTTC ?? 0)
          break
        case 'montantBrutHT':
          row[col.key] = toNumber(record.montantBrutHT ?? 0)
          break
        case 'netAPayer':
          row[col.key] = toNumber(record.netAPayer ?? 0)
          break
        case 'montantPaye':
          row[col.key] = toNumber(record.montantPaye ?? record.montant ?? 0)
          break
        case 'budget':
          row[col.key] = toNumber(record.budget ?? 0)
          break
        case 'budgetTotal':
          row[col.key] = toNumber(record.budgetTotal ?? record.budget ?? 0)
          break
        case 'totalBudget':
          row[col.key] = toNumber(record.totalBudget ?? record.plafondConvention ?? 0)
          break
        default: {
          const val = record[col.key]
          if (val === null || val === undefined) {
            row[col.key] = ''
          } else if (typeof val === 'string' || typeof val === 'number') {
            row[col.key] = val
          } else {
            row[col.key] = String(val)
          }
        }
      }
    }
    return row
  })

  if (limit) {
    rows = rows.slice(0, limit)
  }

  const ENTITY_LABELS: Record<EntityType, string> = {
    conventions: 'Conventions',
    marches: 'Marchés',
    projets: 'Projets',
    decomptes: 'Décomptes',
    paiements: 'Paiements',
    fournisseurs: 'Fournisseurs',
    budgets: 'Budgets',
  }

  return {
    rows,
    columns,
    totalCount: records.length,
    entityLabel: ENTITY_LABELS[entity] || entity,
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
    }
  })

  // Sort by value descending
  rows.sort((a, b) => (b.value as number) - (a.value as number))

  // Apply limit
  if (limit) {
    rows = rows.slice(0, limit)
  }

  const metricLabels: Record<MetricType, string> = {
    count: 'Nombre',
    sum: 'Montant Total',
    average: 'Moyenne',
  }

  const ENTITY_LABELS: Record<EntityType, string> = {
    conventions: 'Conventions',
    marches: 'Marchés',
    projets: 'Projets',
    decomptes: 'Décomptes',
    paiements: 'Paiements',
    fournisseurs: 'Fournisseurs',
    budgets: 'Budgets',
  }

  const columns: ColumnDef[] = [
    { key: 'group', label: 'Catégorie', type: 'string' },
    { key: 'value', label: metricLabels[metric], type: 'number', align: 'right' },
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
// Main Fetch Function
// ============================================================================

export async function fetchDataForInstruction(instruction: ParsedInstruction): Promise<FetchedData> {
  const records = await fetchRawData(instruction.entity)

  if (records.length === 0) {
    const ENTITY_LABELS: Record<EntityType, string> = {
      conventions: 'Conventions',
      marches: 'Marchés',
      projets: 'Projets',
      decomptes: 'Décomptes',
      paiements: 'Paiements',
      fournisseurs: 'Fournisseurs',
      budgets: 'Budgets',
    }

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
