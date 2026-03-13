/**
 * DataFetcher - Maps parsed instructions to API calls and transforms data
 * for visualization rendering.
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

interface RawRecord {
  id?: number
  code?: string
  numero?: string
  numeroMarche?: string
  numeroDecompte?: string
  referencePaiement?: string
  designation?: string
  libelle?: string
  objet?: string
  raisonSociale?: string
  nom?: string
  statut?: string
  status?: string
  type?: string
  typeConvention?: string
  typeMarche?: string
  montant?: number
  montantHt?: number
  montantHT?: number
  montantTtc?: number
  montantTTC?: number
  montantBrutHT?: number
  montantPaye?: number
  budget?: number
  budgetTotal?: number
  totalBudget?: number
  plafondConvention?: number
  netAPayer?: number
  datePaiement?: string
  dateValeur?: string
  dateExecution?: string
  dateDecompte?: string
  dateDebut?: string
  dateMarche?: string
  dateBudget?: string
  createdAt?: string
  conventionId?: number
  conventionNumero?: string
  conventionLibelle?: string
  marcheId?: number
  marcheNumero?: string
  marcheFournisseur?: string
  fournisseurId?: number
  fournisseurNom?: string
  fournisseurCode?: string
  projetId?: number
  fournisseur?: { id?: number; raisonSociale?: string; code?: string }
  convention?: { id?: number; libelle?: string; code?: string; numero?: string }
  marche?: { id?: number; code?: string; designation?: string; objet?: string }
  projet?: { id?: number; code?: string; designation?: string; nom?: string }
  zoneGeographique?: string
  ice?: string
  ville?: string
  version?: string
  [key: string]: unknown
}

// ============================================================================
// API Fetchers by Entity
// ============================================================================

async function fetchRawData(entity: EntityType): Promise<RawRecord[]> {
  let response: { data: { data?: RawRecord[] | RawRecord } | RawRecord[] }

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

  // Handle ApiResponse<T> wrapper
  const data = response.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = data.data
    if (Array.isArray(inner)) return inner
  }
  return []
}

// ============================================================================
// Field Extractors
// ============================================================================

function getLabel(record: RawRecord): string {
  return (
    record.designation ||
    record.libelle ||
    record.objet ||
    record.nom ||
    record.raisonSociale ||
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
  return record.typeConvention || record.typeMarche || record.type || 'N/A'
}

/** Get the best monetary amount from a record depending on entity context */
function getAmount(record: RawRecord, entity: EntityType): number {
  switch (entity) {
    case 'marches':
      return toNumber(record.montantHt ?? record.montantHT ?? 0)
    case 'decomptes':
      return toNumber(record.netAPayer ?? record.montantBrutHT ?? 0)
    case 'paiements':
      return toNumber(record.montantPaye ?? record.montant ?? 0)
    case 'conventions':
      return toNumber(record.budget ?? 0)
    case 'projets':
      return toNumber(record.budgetTotal ?? 0)
    case 'budgets':
      return toNumber(record.totalBudget ?? record.plafondConvention ?? 0)
    default:
      return toNumber(record.montant ?? 0)
  }
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
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
      return record.dateMarche || record.dateDebut || record.createdAt || null
    case 'conventions':
      return record.dateDebut || record.createdAt || null
    case 'budgets':
      return record.dateBudget || record.createdAt || null
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
        record.convention?.libelle ||
        record.convention?.numero ||
        record.convention?.code ||
        record.conventionLibelle ||
        record.conventionNumero ||
        `Conv #${record.conventionId ?? '?'}`
      )
    case 'marche':
      return (
        record.marche?.designation ||
        record.marche?.code ||
        record.marcheNumero ||
        `Marché #${record.marcheId ?? '?'}`
      )
    case 'fournisseur':
      return (
        record.fournisseur?.raisonSociale ||
        record.fournisseur?.code ||
        record.fournisseurNom ||
        `Fournisseur #${record.fournisseurId ?? '?'}`
      )
    case 'projet':
      return (
        record.projet?.designation ||
        record.projet?.nom ||
        record.projet?.code ||
        `Projet #${record.projetId ?? '?'}`
      )
    case 'mois': {
      const date = getTemporalDate(record, entity)
      if (!date) return 'N/A'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    case 'annee': {
      const date = getTemporalDate(record, entity)
      if (!date) return 'N/A'
      return String(new Date(date).getFullYear())
    }
    case 'zone':
      return record.zoneGeographique || 'Non définie'
    default:
      return 'N/A'
  }
}

function getMetricValue(record: RawRecord, metricField: string, entity: EntityType): number {
  // Use entity-aware amount extraction for common metric fields
  if (metricField === 'montant' || metricField === 'montantHT' || metricField === 'netAPayer' || metricField === 'budget') {
    return getAmount(record, entity)
  }
  const val = record[metricField]
  return toNumber(val)
}

// ============================================================================
// Data Transformation
// ============================================================================

function buildUngroupedTable(records: RawRecord[], instruction: ParsedInstruction): FetchedData {
  const { entity, limit } = instruction

  const entityColumns: Record<EntityType, ColumnDef[]> = {
    conventions: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'libelle', label: 'Libellé', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'typeConvention', label: 'Type', type: 'string' },
      { key: 'budget', label: 'Budget', type: 'number', align: 'right' },
    ],
    marches: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'objet', label: 'Objet', type: 'string' },
      { key: 'fournisseurNom', label: 'Fournisseur', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'montantHt', label: 'Montant HT', type: 'number', align: 'right' },
      { key: 'montantTtc', label: 'Montant TTC', type: 'number', align: 'right' },
      { key: 'zoneGeographique', label: 'Zone', type: 'string' },
    ],
    projets: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'nom', label: 'Nom', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'budgetTotal', label: 'Budget Total', type: 'number', align: 'right' },
    ],
    decomptes: [
      { key: 'code', label: 'N° Décompte', type: 'string' },
      { key: 'marcheNumero', label: 'Marché', type: 'string' },
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
    ],
    fournisseurs: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'raisonSociale', label: 'Raison Sociale', type: 'string' },
      { key: 'ice', label: 'ICE', type: 'string' },
      { key: 'ville', label: 'Ville', type: 'string' },
    ],
    budgets: [
      { key: 'code', label: 'Convention', type: 'string' },
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
          row[col.key] = record.fournisseurNom || record.fournisseur?.raisonSociale || ''
          break
        case 'marcheNumero':
          row[col.key] = record.marcheNumero || record.marche?.code || `#${record.marcheId ?? ''}`
          break
        case 'marcheFournisseur':
          row[col.key] = record.marcheFournisseur || ''
          break
        case 'conventionNumero':
          row[col.key] = record.conventionNumero || record.convention?.numero || ''
          break
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
        case 'montantPaye':
          row[col.key] = toNumber(record.montantPaye ?? 0)
          break
        case 'totalBudget':
          row[col.key] = toNumber(record.totalBudget ?? record.plafondConvention ?? 0)
          break
        default: {
          const val = record[col.key]
          row[col.key] = (typeof val === 'string' || typeof val === 'number') ? val : String(val ?? '')
        }
      }
    }
    return row
  })

  if (limit) {
    rows = rows.slice(0, limit)
  }

  return {
    rows,
    columns,
    totalCount: records.length,
    entityLabel: entity,
  }
}

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

  const columns: ColumnDef[] = [
    { key: 'group', label: 'Catégorie', type: 'string' },
    { key: 'value', label: metricLabels[metric], type: 'number', align: 'right' },
    { key: 'count', label: 'Nombre', type: 'number', align: 'right' },
  ]

  return {
    rows,
    columns,
    totalCount: records.length,
    entityLabel: instruction.entity,
  }
}

// ============================================================================
// Main Fetch Function
// ============================================================================

export async function fetchDataForInstruction(instruction: ParsedInstruction): Promise<FetchedData> {
  const records = await fetchRawData(instruction.entity)

  if (records.length === 0) {
    return {
      rows: [],
      columns: [{ key: 'message', label: 'Information', type: 'string' }],
      totalCount: 0,
      entityLabel: instruction.entity,
    }
  }

  if (instruction.groupBy) {
    return buildGroupedData(records, instruction)
  }

  return buildUngroupedTable(records, instruction)
}
