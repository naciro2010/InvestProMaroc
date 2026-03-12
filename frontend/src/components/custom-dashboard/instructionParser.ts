/**
 * InstructionParser - Rule-based French instruction parser for dashboard generation
 * Parses user text instructions into structured query configurations WITHOUT AI.
 *
 * Supported patterns:
 *   "tableau des paiements par marché"
 *   "graphique des conventions par statut"
 *   "nombre de marchés par fournisseur"
 *   "montant total des décomptes par convention"
 *   "évolution des paiements par mois"
 *   "top 10 fournisseurs par montant"
 */

// ============================================================================
// Types
// ============================================================================

export type VisualizationType = 'table' | 'bar' | 'pie' | 'line' | 'kpi'

export type EntityType =
  | 'conventions'
  | 'marches'
  | 'projets'
  | 'decomptes'
  | 'paiements'
  | 'fournisseurs'
  | 'budgets'

export type GroupByField =
  | 'statut'
  | 'type'
  | 'convention'
  | 'marche'
  | 'fournisseur'
  | 'projet'
  | 'mois'
  | 'annee'
  | 'zone'

export type MetricType = 'count' | 'sum' | 'average'

export type MetricField = 'montant' | 'montantHT' | 'montantTTC' | 'budget' | 'netAPayer'

export interface ParsedInstruction {
  visualization: VisualizationType
  entity: EntityType
  groupBy: GroupByField | null
  metric: MetricType
  metricField: MetricField
  limit: number | null
  title: string
  confidence: number
  warnings: string[]
}

export interface ParserError {
  message: string
  suggestions: string[]
}

export type ParseResult =
  | { success: true; instruction: ParsedInstruction }
  | { success: false; error: ParserError }

// ============================================================================
// Keyword Maps
// ============================================================================

const VISUALIZATION_KEYWORDS: Record<string, VisualizationType> = {
  // Table
  tableau: 'table',
  table: 'table',
  liste: 'table',
  lister: 'table',
  afficher: 'table',
  montrer: 'table',
  voir: 'table',
  // Bar chart
  bar: 'bar',
  barre: 'bar',
  barres: 'bar',
  histogramme: 'bar',
  // Pie chart
  camembert: 'pie',
  pie: 'pie',
  circulaire: 'pie',
  repartition: 'pie',
  répartition: 'pie',
  distribution: 'pie',
  // Line chart
  ligne: 'line',
  courbe: 'line',
  evolution: 'line',
  évolution: 'line',
  tendance: 'line',
  trend: 'line',
  // KPI
  kpi: 'kpi',
  resume: 'kpi',
  résumé: 'kpi',
  synthese: 'kpi',
  synthèse: 'kpi',
  total: 'kpi',
  // Chart (generic)
  graphique: 'bar',
  graph: 'bar',
  chart: 'bar',
  diagramme: 'bar',
}

const ENTITY_KEYWORDS: Record<string, EntityType> = {
  convention: 'conventions',
  conventions: 'conventions',
  marche: 'marches',
  marchés: 'marches',
  marches: 'marches',
  marché: 'marches',
  projet: 'projets',
  projets: 'projets',
  decompte: 'decomptes',
  decomptes: 'decomptes',
  décompte: 'decomptes',
  décomptes: 'decomptes',
  paiement: 'paiements',
  paiements: 'paiements',
  payment: 'paiements',
  payments: 'paiements',
  fournisseur: 'fournisseurs',
  fournisseurs: 'fournisseurs',
  budget: 'budgets',
  budgets: 'budgets',
}

const GROUP_BY_KEYWORDS: Record<string, GroupByField> = {
  statut: 'statut',
  status: 'statut',
  état: 'statut',
  etat: 'statut',
  type: 'type',
  nature: 'type',
  convention: 'convention',
  marche: 'marche',
  marché: 'marche',
  fournisseur: 'fournisseur',
  prestataire: 'fournisseur',
  projet: 'projet',
  mois: 'mois',
  mensuel: 'mois',
  annee: 'annee',
  année: 'annee',
  annuel: 'annee',
  zone: 'zone',
  région: 'zone',
  region: 'zone',
  géographique: 'zone',
  geographique: 'zone',
}

const METRIC_KEYWORDS: Record<string, MetricType> = {
  nombre: 'count',
  count: 'count',
  combien: 'count',
  total: 'sum',
  somme: 'sum',
  montant: 'sum',
  sum: 'sum',
  moyenne: 'average',
  average: 'average',
  moy: 'average',
}

const METRIC_FIELD_KEYWORDS: Record<string, MetricField> = {
  montant: 'montant',
  montantht: 'montantHT',
  'montant ht': 'montantHT',
  ht: 'montantHT',
  montantttc: 'montantTTC',
  'montant ttc': 'montantTTC',
  ttc: 'montantTTC',
  budget: 'budget',
  netapayer: 'netAPayer',
  'net a payer': 'netAPayer',
  'net à payer': 'netAPayer',
}

// ============================================================================
// Parser
// ============================================================================

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
}

function extractNumber(text: string): number | null {
  const match = text.match(/\b(?:top\s+)?(\d+)\b/i)
  return match ? parseInt(match[1], 10) : null
}

function findVisualization(words: string[]): VisualizationType | null {
  for (const word of words) {
    if (VISUALIZATION_KEYWORDS[word]) {
      return VISUALIZATION_KEYWORDS[word]
    }
  }
  return null
}

function findEntity(words: string[]): EntityType | null {
  for (const word of words) {
    if (ENTITY_KEYWORDS[word]) {
      return ENTITY_KEYWORDS[word]
    }
  }
  return null
}

function findGroupBy(normalized: string): GroupByField | null {
  // Look for "par X" pattern
  const parMatch = normalized.match(/par\s+(\w+)/)
  if (parMatch) {
    const groupWord = parMatch[1]
    if (GROUP_BY_KEYWORDS[groupWord]) {
      return GROUP_BY_KEYWORDS[groupWord]
    }
  }

  // Look for "selon X" pattern
  const selonMatch = normalized.match(/selon\s+(\w+)/)
  if (selonMatch) {
    const groupWord = selonMatch[1]
    if (GROUP_BY_KEYWORDS[groupWord]) {
      return GROUP_BY_KEYWORDS[groupWord]
    }
  }

  // Look for "groupé par X" / "grouper par X"
  const groupeMatch = normalized.match(/group[eéer]+\s+par\s+(\w+)/)
  if (groupeMatch) {
    const groupWord = groupeMatch[1]
    if (GROUP_BY_KEYWORDS[groupWord]) {
      return GROUP_BY_KEYWORDS[groupWord]
    }
  }

  return null
}

function findMetric(words: string[]): MetricType {
  for (const word of words) {
    if (METRIC_KEYWORDS[word]) {
      return METRIC_KEYWORDS[word]
    }
  }
  return 'count'
}

function findMetricField(normalized: string, entity: EntityType): MetricField {
  for (const [keyword, field] of Object.entries(METRIC_FIELD_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return field
    }
  }
  // Defaults based on entity
  switch (entity) {
    case 'marches':
      return 'montantHT'
    case 'decomptes':
      return 'netAPayer'
    case 'paiements':
      return 'montant'
    case 'budgets':
      return 'budget'
    default:
      return 'montant'
  }
}

function inferVisualization(
  metric: MetricType,
  groupBy: GroupByField | null,
  hasLimit: boolean
): VisualizationType {
  if (!groupBy && metric === 'count') return 'kpi'
  if (groupBy === 'mois' || groupBy === 'annee') return 'line'
  if (groupBy === 'statut' || groupBy === 'type') return 'pie'
  if (hasLimit) return 'bar'
  return 'bar'
}

function generateTitle(instruction: ParsedInstruction): string {
  const entityNames: Record<EntityType, string> = {
    conventions: 'Conventions',
    marches: 'Marchés',
    projets: 'Projets',
    decomptes: 'Décomptes',
    paiements: 'Paiements',
    fournisseurs: 'Fournisseurs',
    budgets: 'Budgets',
  }

  const groupNames: Record<GroupByField, string> = {
    statut: 'statut',
    type: 'type',
    convention: 'convention',
    marche: 'marché',
    fournisseur: 'fournisseur',
    projet: 'projet',
    mois: 'mois',
    annee: 'année',
    zone: 'zone géographique',
  }

  const metricNames: Record<MetricType, string> = {
    count: 'Nombre de',
    sum: 'Montant total des',
    average: 'Moyenne des',
  }

  const entityLabel = entityNames[instruction.entity]
  const prefix = metricNames[instruction.metric]
  const groupSuffix = instruction.groupBy
    ? ` par ${groupNames[instruction.groupBy]}`
    : ''
  const limitPrefix = instruction.limit ? `Top ${instruction.limit} - ` : ''

  return `${limitPrefix}${prefix} ${entityLabel}${groupSuffix}`
}

// ============================================================================
// Main Parse Function
// ============================================================================

export function parseInstruction(input: string): ParseResult {
  const normalized = normalize(input)
  const words = normalized.split(/[\s,;.!?]+/).filter(Boolean)
  const warnings: string[] = []

  if (words.length < 2) {
    return {
      success: false,
      error: {
        message: 'Instruction trop courte. Veuillez préciser ce que vous souhaitez générer.',
        suggestions: [
          'Tableau des paiements par marché',
          'Graphique des conventions par statut',
          'Nombre de marchés par fournisseur',
        ],
      },
    }
  }

  // 1. Find entity (required)
  const entity = findEntity(words)
  if (!entity) {
    return {
      success: false,
      error: {
        message: 'Entité non reconnue. Précisez le type de données.',
        suggestions: [
          'conventions, marchés, projets',
          'décomptes, paiements, fournisseurs, budgets',
        ],
      },
    }
  }

  // 2. Find group by
  const groupBy = findGroupBy(normalized)

  // 3. Find metric
  const metric = findMetric(words)

  // 4. Find metric field
  const metricField = findMetricField(normalized, entity)

  // 5. Find limit (top N)
  const limit = extractNumber(normalized)

  // 6. Find visualization (or infer)
  let visualization = findVisualization(words)
  if (!visualization) {
    visualization = inferVisualization(metric, groupBy, limit !== null)
    warnings.push('Type de visualisation inféré automatiquement. Vous pouvez préciser: tableau, graphique, camembert, courbe.')
  }

  // 7. Confidence scoring
  let confidence = 0.5
  if (entity) confidence += 0.2
  if (groupBy) confidence += 0.15
  if (findVisualization(words)) confidence += 0.1
  if (metric !== 'count' || words.some(w => METRIC_KEYWORDS[w])) confidence += 0.05

  // 8. Validation warnings
  if (visualization === 'line' && groupBy !== 'mois' && groupBy !== 'annee') {
    warnings.push('Les graphiques en ligne fonctionnent mieux avec un regroupement temporel (par mois ou par année).')
  }

  if (visualization === 'pie' && limit && limit > 10) {
    warnings.push('Les camemberts sont plus lisibles avec moins de 10 éléments.')
  }

  const instruction: ParsedInstruction = {
    visualization,
    entity,
    groupBy,
    metric,
    metricField,
    limit,
    title: '',
    confidence,
    warnings,
  }

  instruction.title = generateTitle(instruction)

  return { success: true, instruction }
}

// ============================================================================
// Suggestions
// ============================================================================

export const EXAMPLE_INSTRUCTIONS: Array<{ text: string; category: string }> = [
  // Tables
  { text: 'Tableau des conventions par statut', category: 'Tableaux' },
  { text: 'Liste des marchés par fournisseur', category: 'Tableaux' },
  { text: 'Tableau des paiements par marché et convention', category: 'Tableaux' },
  { text: 'Afficher les décomptes par marché', category: 'Tableaux' },
  { text: 'Liste des projets par statut', category: 'Tableaux' },
  // Charts
  { text: 'Graphique des conventions par statut', category: 'Graphiques' },
  { text: 'Répartition des marchés par type', category: 'Graphiques' },
  { text: 'Camembert des paiements par fournisseur', category: 'Graphiques' },
  { text: 'Histogramme des budgets par projet', category: 'Graphiques' },
  // Time series
  { text: 'Évolution des paiements par mois', category: 'Évolution' },
  { text: 'Courbe des décomptes par mois', category: 'Évolution' },
  { text: 'Tendance des marchés par année', category: 'Évolution' },
  // KPIs & Top N
  { text: 'Top 10 fournisseurs par montant', category: 'Top / KPI' },
  { text: 'Top 5 conventions par budget', category: 'Top / KPI' },
  { text: 'Nombre total de marchés', category: 'Top / KPI' },
  { text: 'Montant total des paiements', category: 'Top / KPI' },
]
