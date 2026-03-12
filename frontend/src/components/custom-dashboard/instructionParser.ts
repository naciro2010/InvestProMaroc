/**
 * InstructionParser - Rule-based French instruction parser for dashboard generation
 * Parses user text instructions into structured query configurations WITHOUT AI.
 *
 * Supports:
 *   - New queries: "tableau des paiements par marché"
 *   - Follow-up modifications: "change en camembert", "groupe par fournisseur"
 *   - Refinement: "top 5 seulement", "en barres"
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
  explanation: ParseExplanation
}

export interface ParseExplanation {
  entityDetected: string
  visualizationDetected: string
  groupByDetected: string | null
  metricDetected: string
  steps: string[]
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
  tableau: 'table', table: 'table', liste: 'table', lister: 'table',
  afficher: 'table', montrer: 'table', voir: 'table',
  bar: 'bar', barre: 'bar', barres: 'bar', histogramme: 'bar',
  camembert: 'pie', pie: 'pie', circulaire: 'pie',
  repartition: 'pie', répartition: 'pie', distribution: 'pie',
  ligne: 'line', courbe: 'line', evolution: 'line', évolution: 'line',
  tendance: 'line', trend: 'line',
  kpi: 'kpi', resume: 'kpi', résumé: 'kpi', synthese: 'kpi', synthèse: 'kpi',
  graphique: 'bar', graph: 'bar', chart: 'bar', diagramme: 'bar',
}

const ENTITY_KEYWORDS: Record<string, EntityType> = {
  convention: 'conventions', conventions: 'conventions',
  marche: 'marches', marchés: 'marches', marches: 'marches', marché: 'marches',
  projet: 'projets', projets: 'projets',
  decompte: 'decomptes', decomptes: 'decomptes', décompte: 'decomptes', décomptes: 'decomptes',
  paiement: 'paiements', paiements: 'paiements', payment: 'paiements', payments: 'paiements',
  fournisseur: 'fournisseurs', fournisseurs: 'fournisseurs',
  budget: 'budgets', budgets: 'budgets',
}

const GROUP_BY_KEYWORDS: Record<string, GroupByField> = {
  statut: 'statut', status: 'statut', état: 'statut', etat: 'statut',
  type: 'type', nature: 'type',
  convention: 'convention',
  marche: 'marche', marché: 'marche',
  fournisseur: 'fournisseur', prestataire: 'fournisseur',
  projet: 'projet',
  mois: 'mois', mensuel: 'mois',
  annee: 'annee', année: 'annee', annuel: 'annee',
  zone: 'zone', région: 'zone', region: 'zone',
  géographique: 'zone', geographique: 'zone',
}

const METRIC_KEYWORDS: Record<string, MetricType> = {
  nombre: 'count', count: 'count', combien: 'count',
  total: 'sum', somme: 'sum', montant: 'sum', sum: 'sum',
  moyenne: 'average', average: 'average', moy: 'average',
}

const METRIC_FIELD_KEYWORDS: Record<string, MetricField> = {
  montant: 'montant',
  montantht: 'montantHT', 'montant ht': 'montantHT', ht: 'montantHT',
  montantttc: 'montantTTC', 'montant ttc': 'montantTTC', ttc: 'montantTTC',
  budget: 'budget',
  netapayer: 'netAPayer', 'net a payer': 'netAPayer', 'net à payer': 'netAPayer',
}

const ENTITY_LABELS: Record<EntityType, string> = {
  conventions: 'Conventions', marches: 'Marchés', projets: 'Projets',
  decomptes: 'Décomptes', paiements: 'Paiements',
  fournisseurs: 'Fournisseurs', budgets: 'Budgets',
}

const VIZ_LABELS: Record<VisualizationType, string> = {
  table: 'Tableau', bar: 'Graphique en barres', pie: 'Camembert',
  line: 'Courbe', kpi: 'KPI',
}

const GROUP_LABELS: Record<GroupByField, string> = {
  statut: 'statut', type: 'type', convention: 'convention',
  marche: 'marché', fournisseur: 'fournisseur', projet: 'projet',
  mois: 'mois', annee: 'année', zone: 'zone géographique',
}

const METRIC_LABELS: Record<MetricType, string> = {
  count: 'Nombre de', sum: 'Montant total des', average: 'Moyenne des',
}

// ============================================================================
// Follow-up Detection
// ============================================================================

const FOLLOW_UP_VIZ_PATTERNS: Array<{ pattern: RegExp; viz: VisualizationType }> = [
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?)\s+(?:en|au?x?)\s+(tableau|table|liste)/i, viz: 'table' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?)\s+(?:en|au?x?)\s+(bar|barre|barres|histogramme)/i, viz: 'bar' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?)\s+(?:en|au?x?)\s+(camembert|pie|circulaire)/i, viz: 'pie' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?)\s+(?:en|au?x?)\s+(courbe|ligne|line)/i, viz: 'line' },
  { pattern: /en\s+(camembert|pie)/i, viz: 'pie' },
  { pattern: /en\s+(barres?|bar|histogramme)/i, viz: 'bar' },
  { pattern: /en\s+(tableau|table|liste)/i, viz: 'table' },
  { pattern: /en\s+(courbe|ligne)/i, viz: 'line' },
]

const FOLLOW_UP_GROUP_PATTERNS: Array<{ pattern: RegExp; extract: (m: RegExpMatchArray) => string }> = [
  { pattern: /(?:groupe|regroupe|trie|class[eé])\s+par\s+(\w+)/i, extract: (m: RegExpMatchArray) => m[1] },
  { pattern: /par\s+(\w+)\s+(?:plutôt|plut[oô]t|à la place|instead)/i, extract: (m: RegExpMatchArray) => m[1] },
]

const FOLLOW_UP_LIMIT_PATTERN = /(?:top|limite|seulement|juste)\s+(\d+)/i

export interface FollowUpResult {
  isFollowUp: true
  vizChange: VisualizationType | null
  groupByChange: GroupByField | null
  limitChange: number | null
}

export function detectFollowUp(input: string, _previousInstruction: ParsedInstruction): FollowUpResult | null {
  const normalized = input.toLowerCase().trim()
  const words = normalized.split(/\s+/)

  // Don't treat as follow-up if it has an entity keyword (it's a new query)
  const hasEntity = words.some((w: string) => ENTITY_KEYWORDS[w] !== undefined)
  if (hasEntity) return null

  let vizChange: VisualizationType | null = null
  let groupByChange: GroupByField | null = null
  let limitChange: number | null = null

  // Check viz changes
  for (const { pattern, viz } of FOLLOW_UP_VIZ_PATTERNS) {
    if (pattern.test(normalized)) {
      vizChange = viz
      break
    }
  }

  // Check group by changes
  for (const { pattern, extract } of FOLLOW_UP_GROUP_PATTERNS) {
    const match = normalized.match(pattern)
    if (match) {
      const groupWord = extract(match)
      if (GROUP_BY_KEYWORDS[groupWord]) {
        groupByChange = GROUP_BY_KEYWORDS[groupWord]
      }
      break
    }
  }

  // Check limit changes
  const limitMatch = normalized.match(FOLLOW_UP_LIMIT_PATTERN)
  if (limitMatch) {
    limitChange = parseInt(limitMatch[1], 10)
  }

  if (!vizChange && !groupByChange && limitChange === null) return null

  return { isFollowUp: true, vizChange, groupByChange, limitChange }
}

export function applyFollowUp(
  previous: ParsedInstruction,
  followUp: FollowUpResult
): ParsedInstruction {
  const updated: ParsedInstruction = { ...previous, warnings: [] }

  if (followUp.vizChange) updated.visualization = followUp.vizChange
  if (followUp.groupByChange) updated.groupBy = followUp.groupByChange
  if (followUp.limitChange !== null) updated.limit = followUp.limitChange

  updated.title = generateTitle(updated)
  updated.explanation = buildExplanation(updated, true)
  updated.confidence = Math.min(previous.confidence + 0.05, 1.0)

  return updated
}

// ============================================================================
// Parser Helpers
// ============================================================================

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/['']/g, "'").replace(/[""]/g, '"').replace(/\s+/g, ' ')
}

function extractNumber(text: string): number | null {
  const match = text.match(/\b(?:top\s+)?(\d+)\b/i)
  return match ? parseInt(match[1], 10) : null
}

function findVisualization(words: string[]): VisualizationType | null {
  for (const word of words) {
    if (VISUALIZATION_KEYWORDS[word]) return VISUALIZATION_KEYWORDS[word]
  }
  return null
}

function findEntity(words: string[]): EntityType | null {
  for (const word of words) {
    if (ENTITY_KEYWORDS[word]) return ENTITY_KEYWORDS[word]
  }
  return null
}

function findGroupBy(normalized: string): GroupByField | null {
  const patterns = [/par\s+(\w+)/, /selon\s+(\w+)/, /group[eéer]+\s+par\s+(\w+)/]
  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match && GROUP_BY_KEYWORDS[match[1]]) return GROUP_BY_KEYWORDS[match[1]]
  }
  return null
}

function findMetric(words: string[]): MetricType {
  for (const word of words) {
    if (METRIC_KEYWORDS[word]) return METRIC_KEYWORDS[word]
  }
  return 'count'
}

function findMetricField(normalized: string, entity: EntityType): MetricField {
  for (const [keyword, field] of Object.entries(METRIC_FIELD_KEYWORDS)) {
    if (normalized.includes(keyword)) return field
  }
  switch (entity) {
    case 'marches': return 'montantHT'
    case 'decomptes': return 'netAPayer'
    case 'paiements': return 'montant'
    case 'budgets': return 'budget'
    default: return 'montant'
  }
}

function inferVisualization(metric: MetricType, groupBy: GroupByField | null, hasLimit: boolean): VisualizationType {
  if (!groupBy && metric === 'count') return 'kpi'
  if (groupBy === 'mois' || groupBy === 'annee') return 'line'
  if (groupBy === 'statut' || groupBy === 'type') return 'pie'
  if (hasLimit) return 'bar'
  return 'bar'
}

function generateTitle(instruction: ParsedInstruction): string {
  const entityLabel = ENTITY_LABELS[instruction.entity]
  const prefix = METRIC_LABELS[instruction.metric]
  const groupSuffix = instruction.groupBy ? ` par ${GROUP_LABELS[instruction.groupBy]}` : ''
  const limitPrefix = instruction.limit ? `Top ${instruction.limit} - ` : ''
  return `${limitPrefix}${prefix} ${entityLabel}${groupSuffix}`
}

function buildExplanation(instruction: ParsedInstruction, isFollowUp: boolean = false): ParseExplanation {
  const steps: string[] = []

  if (isFollowUp) {
    steps.push('Modification appliquée au dernier résultat')
  }

  steps.push(`Données: ${ENTITY_LABELS[instruction.entity]}`)
  steps.push(`Visualisation: ${VIZ_LABELS[instruction.visualization]}`)

  if (instruction.groupBy) {
    steps.push(`Regroupement: par ${GROUP_LABELS[instruction.groupBy]}`)
  }

  if (instruction.metric !== 'count') {
    steps.push(`Métrique: ${METRIC_LABELS[instruction.metric]}`)
  }

  if (instruction.limit) {
    steps.push(`Limite: top ${instruction.limit}`)
  }

  return {
    entityDetected: ENTITY_LABELS[instruction.entity],
    visualizationDetected: VIZ_LABELS[instruction.visualization],
    groupByDetected: instruction.groupBy ? GROUP_LABELS[instruction.groupBy] : null,
    metricDetected: METRIC_LABELS[instruction.metric],
    steps,
  }
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

  const groupBy = findGroupBy(normalized)
  const metric = findMetric(words)
  const metricField = findMetricField(normalized, entity)
  const limit = extractNumber(normalized)

  let visualization = findVisualization(words)
  if (!visualization) {
    visualization = inferVisualization(metric, groupBy, limit !== null)
    warnings.push('Type de visualisation inféré automatiquement. Vous pouvez préciser: tableau, graphique, camembert, courbe.')
  }

  let confidence = 0.5
  if (entity) confidence += 0.2
  if (groupBy) confidence += 0.15
  if (findVisualization(words)) confidence += 0.1
  if (metric !== 'count' || words.some((w: string) => METRIC_KEYWORDS[w] !== undefined)) confidence += 0.05

  if (visualization === 'line' && groupBy !== 'mois' && groupBy !== 'annee') {
    warnings.push('Les graphiques en ligne fonctionnent mieux avec un regroupement temporel (par mois ou par année).')
  }
  if (visualization === 'pie' && limit && limit > 10) {
    warnings.push('Les camemberts sont plus lisibles avec moins de 10 éléments.')
  }

  const instruction: ParsedInstruction = {
    visualization, entity, groupBy, metric, metricField, limit,
    title: '', confidence, warnings,
    explanation: { entityDetected: '', visualizationDetected: '', groupByDetected: null, metricDetected: '', steps: [] },
  }

  instruction.title = generateTitle(instruction)
  instruction.explanation = buildExplanation(instruction)

  return { success: true, instruction }
}

// ============================================================================
// Suggestions
// ============================================================================

export const EXAMPLE_INSTRUCTIONS: Array<{ text: string; icon: string }> = [
  { text: 'Tableau des conventions par statut', icon: 'table' },
  { text: 'Graphique des marchés par type', icon: 'bar' },
  { text: 'Répartition des paiements par fournisseur', icon: 'pie' },
  { text: 'Évolution des décomptes par mois', icon: 'line' },
  { text: 'Top 10 fournisseurs par montant', icon: 'bar' },
  { text: 'Nombre total de conventions', icon: 'kpi' },
  { text: 'Liste des projets par statut', icon: 'table' },
  { text: 'Camembert des budgets par projet', icon: 'pie' },
]
