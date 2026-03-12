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
  designation?: string
  libelle?: string
  objet?: string
  raisonSociale?: string
  statut?: string
  status?: string
  type?: string
  typeConvention?: string
  typeMarche?: string
  montant?: number
  montantHT?: number
  montantTTC?: number
  budget?: number
  budgetTotal?: number
  netAPayer?: number
  datePaiement?: string
  dateDecompte?: string
  dateDebut?: string
  dateMarche?: string
  createdAt?: string
  conventionId?: number
  marcheId?: number
  fournisseurId?: number
  projetId?: number
  fournisseur?: { id?: number; raisonSociale?: string; code?: string }
  convention?: { id?: number; libelle?: string; code?: string; numero?: string }
  marche?: { id?: number; code?: string; designation?: string; objet?: string }
  projet?: { id?: number; code?: string; designation?: string }
  zoneGeographique?: string
  ice?: string
  ville?: string
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

function getLabel(record: RawRecord, _entity: EntityType): string {
  return (
    record.designation ||
    record.libelle ||
    record.objet ||
    record.raisonSociale ||
    record.code ||
    record.numero ||
    `#${record.id ?? '?'}`
  )
}

function getStatus(record: RawRecord): string {
  return record.statut || record.status || 'N/A'
}

function getType(record: RawRecord): string {
  return record.typeConvention || record.typeMarche || record.type || 'N/A'
}

function getGroupValue(record: RawRecord, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'statut':
      return getStatus(record)
    case 'type':
      return getType(record)
    case 'convention':
      return record.convention?.libelle || record.convention?.numero || record.convention?.code || `Conv #${record.conventionId ?? '?'}`
    case 'marche':
      return record.marche?.designation || record.marche?.code || `Marché #${record.marcheId ?? '?'}`
    case 'fournisseur':
      return record.fournisseur?.raisonSociale || record.fournisseur?.code || `Fournisseur #${record.fournisseurId ?? '?'}`
    case 'projet':
      return record.projet?.designation || record.projet?.code || `Projet #${record.projetId ?? '?'}`
    case 'mois': {
      const date = record.datePaiement || record.dateDecompte || record.dateDebut || record.dateMarche || record.createdAt
      if (!date) return 'N/A'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    case 'annee': {
      const date = record.datePaiement || record.dateDecompte || record.dateDebut || record.dateMarche || record.createdAt
      if (!date) return 'N/A'
      return String(new Date(date).getFullYear())
    }
    case 'zone':
      return record.zoneGeographique || 'Non définie'
    default:
      return 'N/A'
  }
}

function getMetricValue(record: RawRecord, metricField: string): number {
  const val = record[metricField]
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
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
      { key: 'type', label: 'Type', type: 'string' },
      { key: 'budget', label: 'Budget', type: 'number', align: 'right' },
    ],
    marches: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'designation', label: 'Désignation', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'montantHT', label: 'Montant HT', type: 'number', align: 'right' },
      { key: 'montantTTC', label: 'Montant TTC', type: 'number', align: 'right' },
    ],
    projets: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'designation', label: 'Désignation', type: 'string' },
      { key: 'statut', label: 'Statut', type: 'status' },
      { key: 'budgetTotal', label: 'Budget Total', type: 'number', align: 'right' },
    ],
    decomptes: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'montant', label: 'Montant', type: 'number', align: 'right' },
      { key: 'netAPayer', label: 'Net à Payer', type: 'number', align: 'right' },
      { key: 'statut', label: 'Statut', type: 'status' },
    ],
    paiements: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'montant', label: 'Montant', type: 'number', align: 'right' },
      { key: 'datePaiement', label: 'Date', type: 'date' },
    ],
    fournisseurs: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'raisonSociale', label: 'Raison Sociale', type: 'string' },
      { key: 'ice', label: 'ICE', type: 'string' },
      { key: 'ville', label: 'Ville', type: 'string' },
    ],
    budgets: [
      { key: 'code', label: 'Code', type: 'string' },
      { key: 'designation', label: 'Désignation', type: 'string' },
      { key: 'montant', label: 'Montant', type: 'number', align: 'right' },
      { key: 'statut', label: 'Statut', type: 'status' },
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
        case 'type':
          row[col.key] = getType(record)
          break
        case 'designation':
        case 'libelle':
        case 'label':
          row[col.key] = getLabel(record, entity)
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
  const { groupBy, metric, metricField, limit } = instruction

  if (!groupBy) {
    return buildUngroupedTable(records, instruction)
  }

  // Group records
  const groups = new Map<string, RawRecord[]>()
  for (const record of records) {
    const key = getGroupValue(record, groupBy)
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
        value = groupRecords.reduce((sum, r) => sum + getMetricValue(r, metricField), 0)
        break
      case 'average': {
        const total = groupRecords.reduce((sum, r) => sum + getMetricValue(r, metricField), 0)
        value = groupRecords.length > 0 ? total / groupRecords.length : 0
        break
      }
      default:
        value = groupRecords.length
    }

    return {
      group: groupKey,
      value: Math.round(value * 100) / 100,
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

  if (instruction.groupBy) {
    return buildGroupedData(records, instruction)
  }

  return buildUngroupedTable(records, instruction)
}
