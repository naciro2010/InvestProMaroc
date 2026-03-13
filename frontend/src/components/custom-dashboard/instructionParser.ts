/**
 * InstructionParser - Smart rule-based French instruction parser for dashboard generation.
 *
 * Parses natural French instructions into structured query configurations WITHOUT AI.
 * Handles fuzzy matching, implicit defaults, and conversational follow-ups.
 *
 * Examples of supported instructions:
 *   - "montre moi les marchés" → table of all marchés
 *   - "combien de conventions" → KPI count
 *   - "répartition des paiements par fournisseur" → pie chart
 *   - "top 5 marchés par montant" → bar chart, sum, limit 5
 *   - "évolution mensuelle des décomptes" → line chart by month
 *   - "change en camembert" → follow-up: change viz type
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
// Keyword Maps - Extended with many variants and typos
// ============================================================================

const VISUALIZATION_KEYWORDS: Array<{ words: string[]; viz: VisualizationType }> = [
  // Table
  { words: ['tableau', 'table', 'liste', 'lister', 'afficher', 'montrer', 'voir', 'détail', 'detail', 'listing', 'données', 'donnees', 'data'], viz: 'table' },
  // Bar
  { words: ['bar', 'barre', 'barres', 'histogramme', 'graphique', 'graph', 'chart', 'diagramme', 'comparaison', 'comparer'], viz: 'bar' },
  // Pie
  { words: ['camembert', 'pie', 'circulaire', 'repartition', 'répartition', 'distribution', 'proportion', 'proportions', 'parts', 'part'], viz: 'pie' },
  // Line
  { words: ['ligne', 'courbe', 'evolution', 'évolution', 'tendance', 'trend', 'temporel', 'chronologique', 'historique'], viz: 'line' },
  // KPI
  { words: ['kpi', 'resume', 'résumé', 'synthese', 'synthèse', 'indicateur', 'chiffre', 'total', 'combien'], viz: 'kpi' },
]

const ENTITY_PATTERNS: Array<{ pattern: RegExp; entity: EntityType }> = [
  { pattern: /\bconventions?\b/i, entity: 'conventions' },
  { pattern: /\bmarch[eéè]s?\b/i, entity: 'marches' },
  { pattern: /\bcontrats?\b/i, entity: 'marches' },
  { pattern: /\bprojets?\b/i, entity: 'projets' },
  { pattern: /\bprogrammes?\b/i, entity: 'projets' },
  { pattern: /\bd[eéè]comptes?\b/i, entity: 'decomptes' },
  { pattern: /\bfactures?\b/i, entity: 'decomptes' },
  { pattern: /\bsituations?\s+de\s+travaux\b/i, entity: 'decomptes' },
  { pattern: /\bpaiements?\b/i, entity: 'paiements' },
  { pattern: /\bpayments?\b/i, entity: 'paiements' },
  { pattern: /\br[eè]glements?\b/i, entity: 'paiements' },
  { pattern: /\bversements?\b/i, entity: 'paiements' },
  { pattern: /\bfournisseurs?\b/i, entity: 'fournisseurs' },
  { pattern: /\bprestataires?\b/i, entity: 'fournisseurs' },
  { pattern: /\bsuppliers?\b/i, entity: 'fournisseurs' },
  { pattern: /\bbudgets?\b/i, entity: 'budgets' },
  { pattern: /\benveloppes?\b/i, entity: 'budgets' },
]

const GROUP_BY_PATTERNS: Array<{ pattern: RegExp; groupBy: GroupByField }> = [
  // Explicit "par ..." patterns
  { pattern: /par\s+statut/i, groupBy: 'statut' },
  { pattern: /par\s+[eéè]tat/i, groupBy: 'statut' },
  { pattern: /par\s+status/i, groupBy: 'statut' },
  { pattern: /par\s+types?/i, groupBy: 'type' },
  { pattern: /par\s+nature/i, groupBy: 'type' },
  { pattern: /par\s+cat[eéè]gorie/i, groupBy: 'type' },
  { pattern: /par\s+conventions?/i, groupBy: 'convention' },
  { pattern: /par\s+march[eéè]s?/i, groupBy: 'marche' },
  { pattern: /par\s+contrats?/i, groupBy: 'marche' },
  { pattern: /par\s+fournisseurs?/i, groupBy: 'fournisseur' },
  { pattern: /par\s+prestataires?/i, groupBy: 'fournisseur' },
  { pattern: /par\s+projets?/i, groupBy: 'projet' },
  { pattern: /par\s+mois/i, groupBy: 'mois' },
  { pattern: /mensuel/i, groupBy: 'mois' },
  { pattern: /par\s+ann[eéè]e/i, groupBy: 'annee' },
  { pattern: /annuel/i, groupBy: 'annee' },
  { pattern: /par\s+an\b/i, groupBy: 'annee' },
  { pattern: /par\s+zones?/i, groupBy: 'zone' },
  { pattern: /par\s+r[eéè]gions?/i, groupBy: 'zone' },
  { pattern: /par\s+g[eéè]ographi/i, groupBy: 'zone' },
  // "selon ..." patterns
  { pattern: /selon\s+(?:le\s+)?statut/i, groupBy: 'statut' },
  { pattern: /selon\s+(?:le\s+)?type/i, groupBy: 'type' },
  { pattern: /selon\s+(?:le\s+)?fournisseur/i, groupBy: 'fournisseur' },
  { pattern: /selon\s+(?:le\s+)?mois/i, groupBy: 'mois' },
  // "group(é|er) par ..." patterns
  { pattern: /group[eéè]+\s+par\s+(\w+)/i, groupBy: 'statut' }, // will be refined below
]

const METRIC_PATTERNS: Array<{ pattern: RegExp; metric: MetricType }> = [
  { pattern: /\bnombre\b/i, metric: 'count' },
  { pattern: /\bcombien\b/i, metric: 'count' },
  { pattern: /\bcount\b/i, metric: 'count' },
  { pattern: /\bcompter\b/i, metric: 'count' },
  { pattern: /\btotal\b/i, metric: 'sum' },
  { pattern: /\bsomme\b/i, metric: 'sum' },
  { pattern: /\bmontant\b/i, metric: 'sum' },
  { pattern: /\bsum\b/i, metric: 'sum' },
  { pattern: /\bchiffre\s+d'affaire/i, metric: 'sum' },
  { pattern: /\bmoyenne\b/i, metric: 'average' },
  { pattern: /\baverage\b/i, metric: 'average' },
  { pattern: /\ben\s+moyenne\b/i, metric: 'average' },
]

const METRIC_FIELD_PATTERNS: Array<{ pattern: RegExp; field: MetricField }> = [
  { pattern: /montant\s*ht/i, field: 'montantHT' },
  { pattern: /\bht\b/i, field: 'montantHT' },
  { pattern: /montant\s*ttc/i, field: 'montantTTC' },
  { pattern: /\bttc\b/i, field: 'montantTTC' },
  { pattern: /net\s*[aà]\s*payer/i, field: 'netAPayer' },
  { pattern: /\bbudget\b/i, field: 'budget' },
  { pattern: /\bmontant\b/i, field: 'montant' },
]

// ============================================================================
// Label Maps
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

const VIZ_LABELS: Record<VisualizationType, string> = {
  table: 'Tableau',
  bar: 'Graphique en barres',
  pie: 'Camembert',
  line: 'Courbe',
  kpi: 'KPI',
}

const GROUP_LABELS: Record<GroupByField, string> = {
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

const METRIC_LABELS: Record<MetricType, string> = {
  count: 'Nombre de',
  sum: 'Montant total des',
  average: 'Moyenne des',
}

// ============================================================================
// Follow-up Detection
// ============================================================================

const FOLLOW_UP_VIZ_PATTERNS: Array<{ pattern: RegExp; viz: VisualizationType }> = [
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch)\s+(?:en|au?x?|le|la)\s+(?:un\s+)?(tableau|table|liste)/i, viz: 'table' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch)\s+(?:en|au?x?|le|la)\s+(?:un\s+)?(bar|barre|barres|histogramme)/i, viz: 'bar' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch)\s+(?:en|au?x?|le|la)\s+(?:un\s+)?(camembert|pie|circulaire)/i, viz: 'pie' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch)\s+(?:en|au?x?|le|la)\s+(?:un\s+)?(courbe|ligne|line)/i, viz: 'line' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch)\s+(?:en|au?x?|le|la)\s+(?:un\s+)?(kpi|indicateur|chiffre)/i, viz: 'kpi' },
  // Shorter patterns
  { pattern: /^en\s+(camembert|pie)$/i, viz: 'pie' },
  { pattern: /^en\s+(barres?|bar|histogramme)$/i, viz: 'bar' },
  { pattern: /^en\s+(tableau|table|liste)$/i, viz: 'table' },
  { pattern: /^en\s+(courbe|ligne)$/i, viz: 'line' },
  { pattern: /^en\s+(kpi|indicateur)$/i, viz: 'kpi' },
  // Very short
  { pattern: /^(camembert|pie)$/i, viz: 'pie' },
  { pattern: /^(barres?|histogramme)$/i, viz: 'bar' },
  { pattern: /^(tableau|table)$/i, viz: 'table' },
  { pattern: /^(courbe|ligne)$/i, viz: 'line' },
]

const FOLLOW_UP_GROUP_PATTERNS: Array<{ pattern: RegExp; extract: (m: RegExpMatchArray) => string }> = [
  { pattern: /(?:groupe|regroupe|trie|class[eé]|organise)\s+par\s+(\w+)/i, extract: (m: RegExpMatchArray) => m[1] },
  { pattern: /par\s+(\w+)\s+(?:plutôt|plutot|à la place|instead|maintenant)/i, extract: (m: RegExpMatchArray) => m[1] },
  { pattern: /^par\s+(\w+)$/i, extract: (m: RegExpMatchArray) => m[1] },
]

const FOLLOW_UP_LIMIT_PATTERN = /(?:top|limite|seulement|juste|les)\s+(\d+)/i

const GROUP_WORD_MAP: Record<string, GroupByField> = {
  statut: 'statut', status: 'statut', état: 'statut', etat: 'statut',
  type: 'type', nature: 'type', categorie: 'type', catégorie: 'type',
  convention: 'convention',
  marche: 'marche', marché: 'marche',
  fournisseur: 'fournisseur', prestataire: 'fournisseur',
  projet: 'projet',
  mois: 'mois', mensuel: 'mois',
  annee: 'annee', année: 'annee', annuel: 'annee', an: 'annee',
  zone: 'zone', région: 'zone', region: 'zone',
  géographique: 'zone', geographique: 'zone',
}

export interface FollowUpResult {
  isFollowUp: true
  vizChange: VisualizationType | null
  groupByChange: GroupByField | null
  limitChange: number | null
}

export function detectFollowUp(input: string, _previousInstruction: ParsedInstruction): FollowUpResult | null {
  const normalized = input.toLowerCase().trim()

  // Don't treat as follow-up if it contains an entity keyword (it's a new query)
  for (const { pattern } of ENTITY_PATTERNS) {
    if (pattern.test(normalized)) return null
  }

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
      if (GROUP_WORD_MAP[groupWord]) {
        groupByChange = GROUP_WORD_MAP[groupWord]
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
// Smart Parser Helpers
// ============================================================================

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/[?!.;,]+$/g, '') // strip trailing punctuation
}

function extractNumber(text: string): number | null {
  // "top 10", "les 5 plus gros", "5 premiers"
  const patterns = [
    /\btop\s+(\d+)/i,
    /\bles\s+(\d+)\s+(?:plus|premiers?|derniers?|meilleurs?|principau?x)/i,
    /(\d+)\s+(?:premiers?|principau?x|meilleurs?|plus\s+(?:gros|grands?|importants?))/i,
  ]
  for (const pat of patterns) {
    const match = text.match(pat)
    if (match) return parseInt(match[1], 10)
  }
  return null
}

function findVisualization(text: string): VisualizationType | null {
  const words = text.split(/[\s,;.!?]+/)
  for (const { words: keywords, viz } of VISUALIZATION_KEYWORDS) {
    for (const word of words) {
      if (keywords.includes(word)) return viz
    }
  }
  return null
}

function findEntity(text: string): EntityType | null {
  for (const { pattern, entity } of ENTITY_PATTERNS) {
    if (pattern.test(text)) return entity
  }
  return null
}

function findGroupBy(text: string): GroupByField | null {
  for (const { pattern, groupBy } of GROUP_BY_PATTERNS) {
    if (pattern.test(text)) {
      // Special case: "group(é) par X" needs to extract X
      if (groupBy === 'statut' && pattern.toString().includes('group')) {
        const match = text.match(pattern)
        if (match && match[1] && GROUP_WORD_MAP[match[1].toLowerCase()]) {
          return GROUP_WORD_MAP[match[1].toLowerCase()]
        }
      }
      return groupBy
    }
  }
  return null
}

function findMetric(text: string): MetricType {
  for (const { pattern, metric } of METRIC_PATTERNS) {
    if (pattern.test(text)) return metric
  }
  return 'count'
}

function findMetricField(text: string, entity: EntityType): MetricField {
  for (const { pattern, field } of METRIC_FIELD_PATTERNS) {
    if (pattern.test(text)) return field
  }
  // Entity-specific defaults
  switch (entity) {
    case 'marches': return 'montantHT'
    case 'decomptes': return 'netAPayer'
    case 'paiements': return 'montant'
    case 'budgets': return 'budget'
    case 'conventions': return 'budget'
    case 'projets': return 'budget'
    default: return 'montant'
  }
}

/**
 * Infer the best visualization type based on context.
 */
function inferVisualization(
  metric: MetricType,
  groupBy: GroupByField | null,
  hasLimit: boolean,
  text: string
): VisualizationType {
  // No groupBy → either KPI (for count/sum) or table
  if (!groupBy) {
    if (/combien|nombre\s+total|résumé|synthèse|total\b/i.test(text)) return 'kpi'
    return 'table'
  }

  // Temporal grouping → line chart
  if (groupBy === 'mois' || groupBy === 'annee') return 'line'

  // Status/type → pie (good for categories)
  if (groupBy === 'statut' || groupBy === 'type') {
    if (hasLimit) return 'bar'
    return 'pie'
  }

  // Top N → bar chart (ranking)
  if (hasLimit) return 'bar'

  // Default for fournisseur, projet, etc. → bar
  return 'bar'
}

function generateTitle(instruction: ParsedInstruction): string {
  const entityLabel = ENTITY_LABELS[instruction.entity]
  const prefix = METRIC_LABELS[instruction.metric]
  const groupSuffix = instruction.groupBy ? ` par ${GROUP_LABELS[instruction.groupBy]}` : ''
  const limitPrefix = instruction.limit ? `Top ${instruction.limit} – ` : ''
  return `${limitPrefix}${prefix} ${entityLabel}${groupSuffix}`
}

function buildExplanation(instruction: ParsedInstruction, isFollowUp: boolean = false): ParseExplanation {
  const steps: string[] = []

  if (isFollowUp) {
    steps.push('Modification appliquée au dernier résultat')
  }

  steps.push(`Données : ${ENTITY_LABELS[instruction.entity]}`)
  steps.push(`Visualisation : ${VIZ_LABELS[instruction.visualization]}`)

  if (instruction.groupBy) {
    steps.push(`Regroupement : par ${GROUP_LABELS[instruction.groupBy]}`)
  }

  if (instruction.metric !== 'count') {
    steps.push(`Métrique : ${METRIC_LABELS[instruction.metric]}`)
  }

  if (instruction.limit) {
    steps.push(`Limite : top ${instruction.limit}`)
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
// Smart heuristics for when entity is missing
// ============================================================================

function guessEntityFromContext(text: string): EntityType | null {
  // If text mentions money-related words, guess marches
  if (/\b(argent|dépenses?|engagements?|investissements?)\b/i.test(text)) return 'marches'
  // If text mentions payment-related
  if (/\b(payé|versé|réglé|virements?)\b/i.test(text)) return 'paiements'
  // If text mentions supplier-related
  if (/\b(entreprises?|sociétés?|prestataires?)\b/i.test(text)) return 'fournisseurs'
  return null
}

// ============================================================================
// Main Parse Function
// ============================================================================

export function parseInstruction(input: string): ParseResult {
  const normalized = normalize(input)
  const words = normalized.split(/[\s,;.!?]+/).filter(Boolean)
  const warnings: string[] = []

  // Too short
  if (words.length < 1) {
    return {
      success: false,
      error: {
        message: 'Instruction trop courte.',
        suggestions: [
          'Marchés par statut',
          'Top 5 fournisseurs par montant',
          'Répartition des conventions par type',
          'Évolution des paiements par mois',
        ],
      },
    }
  }

  // Find entity
  let entity = findEntity(normalized)
  if (!entity) {
    entity = guessEntityFromContext(normalized)
  }
  if (!entity) {
    return {
      success: false,
      error: {
        message: 'Je n\'ai pas compris quelle donnée vous souhaitez visualiser.',
        suggestions: [
          'Tableau des conventions',
          'Graphique des marchés par type',
          'Répartition des paiements par fournisseur',
          'Nombre de projets par statut',
        ],
      },
    }
  }

  // Find groupBy
  const groupBy = findGroupBy(normalized)

  // Find metric
  let metric = findMetric(normalized)

  // Find metric field
  const metricField = findMetricField(normalized, entity)

  // Find limit (top N)
  const limit = extractNumber(normalized)

  // If there's a limit, it implies ranking → sum is usually intended
  if (limit && metric === 'count' && !groupBy) {
    // "top 5 marchés" without groupBy → just show table with limit
  } else if (limit && metric === 'count' && groupBy) {
    // "top 5 marchés par fournisseur" → sum by fournisseur is more useful
    if (groupBy === 'fournisseur' || groupBy === 'projet' || groupBy === 'convention') {
      metric = 'sum'
    }
  }

  // If groupBy is fournisseur/projet/convention and metric is count, often sum is more useful
  if (groupBy && ['fournisseur', 'projet', 'convention', 'marche'].includes(groupBy)) {
    if (metric === 'count' && /montant|budget|somme|total/i.test(normalized)) {
      metric = 'sum'
    }
  }

  // Find visualization
  let visualization = findVisualization(normalized)
  if (!visualization) {
    visualization = inferVisualization(metric, groupBy, limit !== null, normalized)
    if (groupBy || limit) {
      // Only warn if it's a chart, not if we default to table
      if (visualization !== 'table') {
        warnings.push('Type de visualisation choisi automatiquement. Vous pouvez changer avec les boutons.')
      }
    }
  }

  // Smart warning for bad combos
  if (visualization === 'line' && groupBy !== 'mois' && groupBy !== 'annee') {
    warnings.push('Les courbes fonctionnent mieux avec un regroupement temporel (par mois ou par année).')
  }
  if (visualization === 'pie' && limit && limit > 8) {
    warnings.push('Les camemberts sont plus lisibles avec moins de 8 éléments.')
  }

  // Calculate confidence
  let confidence = 0.5
  confidence += 0.2 // entity found
  if (groupBy) confidence += 0.12
  if (findVisualization(normalized)) confidence += 0.1
  if (metric !== 'count' || /nombre|combien|count/i.test(normalized)) confidence += 0.05
  if (limit) confidence += 0.03

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
  { text: 'Tableau des conventions', icon: 'table' },
  { text: 'Marchés par statut', icon: 'pie' },
  { text: 'Top 5 fournisseurs par montant', icon: 'bar' },
  { text: 'Répartition des paiements par fournisseur', icon: 'pie' },
  { text: 'Évolution des décomptes par mois', icon: 'line' },
  { text: 'Nombre total de projets', icon: 'kpi' },
  { text: 'Marchés par zone géographique', icon: 'bar' },
  { text: 'Budget des conventions par type', icon: 'bar' },
]
