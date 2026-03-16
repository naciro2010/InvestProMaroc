/**
 * InstructionParser - Smart rule-based French instruction parser for dashboard generation.
 *
 * Parses natural French instructions into structured query configurations WITHOUT AI.
 * Handles fuzzy matching, implicit defaults, conversational follow-ups, status filters,
 * and rich natural language understanding.
 *
 * Examples of supported instructions:
 *   - "montre moi les marchés" → table of all marchés
 *   - "combien de conventions" → KPI count
 *   - "répartition des paiements par fournisseur" → pie chart
 *   - "top 5 marchés par montant" → bar chart, sum, limit 5
 *   - "évolution mensuelle des décomptes" → line chart by month
 *   - "marchés validés par fournisseur" → bar chart, filtered by status VALIDEE
 *   - "conventions en cours cette année" → filtered by status + date
 *   - "quels sont les projets les plus coûteux ?" → top N by budget
 *   - "compare les marchés par zone géographique" → bar chart by zone
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

export interface StatusFilter {
  field: 'statut' | 'type'
  values: string[]
}

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
  filters: StatusFilter[]
  sortDirection: 'asc' | 'desc'
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
// Keyword Maps - Extended with many variants, typos, and natural phrases
// ============================================================================

const VISUALIZATION_KEYWORDS: Array<{ words: string[]; viz: VisualizationType }> = [
  // Table
  { words: ['tableau', 'table', 'liste', 'lister', 'afficher', 'montrer', 'voir', 'détail', 'detail', 'listing', 'données', 'donnees', 'data', 'grille'], viz: 'table' },
  // Bar
  { words: ['bar', 'barre', 'barres', 'histogramme', 'graphique', 'graph', 'chart', 'diagramme', 'comparaison', 'comparer', 'compare', 'classement', 'ranking'], viz: 'bar' },
  // Pie
  { words: ['camembert', 'pie', 'circulaire', 'repartition', 'répartition', 'distribution', 'proportion', 'proportions', 'parts', 'part', 'secteur', 'donut'], viz: 'pie' },
  // Line
  { words: ['ligne', 'courbe', 'evolution', 'évolution', 'tendance', 'trend', 'temporel', 'chronologique', 'historique', 'progression', 'suivi'], viz: 'line' },
  // KPI
  { words: ['kpi', 'resume', 'résumé', 'synthese', 'synthèse', 'indicateur', 'chiffre', 'total', 'combien', 'statistique', 'stat', 'stats', 'bilan', 'aperçu', 'overview'], viz: 'kpi' },
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
  { pattern: /\bd[eé]penses?\b/i, entity: 'decomptes' },
  { pattern: /\brecettes?\b/i, entity: 'paiements' },
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
  { pattern: /par\s+zones?\s*g[eé]o/i, groupBy: 'zone' },
  { pattern: /par\s+zones?/i, groupBy: 'zone' },
  { pattern: /par\s+r[eéè]gions?/i, groupBy: 'zone' },
  { pattern: /par\s+g[eéè]ographi/i, groupBy: 'zone' },
  { pattern: /par\s+localisation/i, groupBy: 'zone' },
  { pattern: /par\s+ville/i, groupBy: 'zone' },
  // "selon ..." patterns
  { pattern: /selon\s+(?:le\s+)?statut/i, groupBy: 'statut' },
  { pattern: /selon\s+(?:le\s+)?type/i, groupBy: 'type' },
  { pattern: /selon\s+(?:le\s+)?fournisseur/i, groupBy: 'fournisseur' },
  { pattern: /selon\s+(?:le\s+)?mois/i, groupBy: 'mois' },
  { pattern: /selon\s+(?:la\s+)?zone/i, groupBy: 'zone' },
  // "group(é|er) par ..." patterns
  { pattern: /group[eéè]+\s+par\s+(\w+)/i, groupBy: 'statut' }, // refined below
  // "ventil(é|er) par ..." patterns
  { pattern: /ventil[eéè]+\s+par\s+(\w+)/i, groupBy: 'statut' },
]

const METRIC_PATTERNS: Array<{ pattern: RegExp; metric: MetricType }> = [
  { pattern: /\bnombre\b/i, metric: 'count' },
  { pattern: /\bcombien\b/i, metric: 'count' },
  { pattern: /\bcount\b/i, metric: 'count' },
  { pattern: /\bcompter\b/i, metric: 'count' },
  { pattern: /\bquantit[eé]/i, metric: 'count' },
  { pattern: /\btotal\b/i, metric: 'sum' },
  { pattern: /\bsomme\b/i, metric: 'sum' },
  { pattern: /\bmontant\b/i, metric: 'sum' },
  { pattern: /\bsum\b/i, metric: 'sum' },
  { pattern: /\bchiffre\s+d'affaire/i, metric: 'sum' },
  { pattern: /\bvaleur\b/i, metric: 'sum' },
  { pattern: /\bco[uû]t/i, metric: 'sum' },
  { pattern: /\bmoyenne\b/i, metric: 'average' },
  { pattern: /\baverage\b/i, metric: 'average' },
  { pattern: /\ben\s+moyenne\b/i, metric: 'average' },
  { pattern: /\bmoyen\b/i, metric: 'average' },
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
// Status Filter Detection
// ============================================================================

const STATUS_KEYWORDS: Array<{ pattern: RegExp; status: string }> = [
  // Direct status values
  { pattern: /\bvalid[eéè]+e?s?\b/i, status: 'VALIDEE' },
  { pattern: /\bbrouillons?\b/i, status: 'BROUILLON' },
  { pattern: /\bsoumise?s?\b/i, status: 'SOUMIS' },
  { pattern: /\brejet[eéè]+e?s?\b/i, status: 'REJETE' },
  { pattern: /\bach[eéè]v[eéè]+e?s?\b/i, status: 'ACHEVE' },
  { pattern: /\btermin[eéè]+e?s?\b/i, status: 'ACHEVE' },
  { pattern: /\bcl[oô]tur[eéè]+e?s?\b/i, status: 'ACHEVE' },
  // Status phrases
  { pattern: /\ben\s+cours\b/i, status: 'EN_EXECUTION' },
  { pattern: /\ben\s+ex[eéè]cution\b/i, status: 'EN_EXECUTION' },
  { pattern: /\bencours\b/i, status: 'EN_EXECUTION' },
  { pattern: /\ben\s+attente\b/i, status: 'SOUMIS' },
  { pattern: /\bpendante?s?\b/i, status: 'SOUMIS' },
  { pattern: /\bactive?s?\b/i, status: 'EN_EXECUTION' },
  { pattern: /\bannul[eéè]+e?s?\b/i, status: 'REJETE' },
  // Type values
  { pattern: /\bcadres?\b(?!\s+de)/i, status: 'CADRE' },
  { pattern: /\bsp[eéè]cifiques?\b/i, status: 'SPECIFIQUE' },
]

function findStatusFilters(text: string): StatusFilter[] {
  const filters: StatusFilter[] = []
  const statusValues: string[] = []
  const typeValues: string[] = []

  for (const { pattern, status } of STATUS_KEYWORDS) {
    if (pattern.test(text)) {
      if (status === 'CADRE' || status === 'SPECIFIQUE') {
        typeValues.push(status)
      } else {
        statusValues.push(status)
      }
    }
  }

  if (statusValues.length > 0) {
    filters.push({ field: 'statut', values: statusValues })
  }
  if (typeValues.length > 0) {
    filters.push({ field: 'type', values: typeValues })
  }

  return filters
}

// ============================================================================
// Sort Direction Detection
// ============================================================================

function findSortDirection(text: string): 'asc' | 'desc' {
  if (/\b(?:croissant|ascendant|du\s+plus\s+petit|du\s+moins)\b/i.test(text)) return 'asc'
  if (/\b(?:d[eé]croissant|descendant|du\s+plus\s+grand|du\s+plus\s+(?:gros|important|cher|[eé]lev[eé]))\b/i.test(text)) return 'desc'
  // "les plus chers" → desc
  if (/\b(?:plus\s+(?:gros|grands?|importants?|chers?|[eé]lev[eé]s?|co[uû]teux))\b/i.test(text)) return 'desc'
  // "les moins chers" → asc
  if (/\b(?:moins\s+(?:gros|grands?|importants?|chers?|[eé]lev[eé]s?|co[uû]teux))\b/i.test(text)) return 'asc'
  return 'desc' // default: top = highest first
}

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

const STATUS_LABELS: Record<string, string> = {
  VALIDEE: 'validé(e)s',
  BROUILLON: 'en brouillon',
  SOUMIS: 'soumis(es)',
  REJETE: 'rejeté(e)s',
  ACHEVE: 'achevé(e)s',
  EN_EXECUTION: 'en exécution',
  CADRE: 'de type Cadre',
  SPECIFIQUE: 'de type Spécifique',
}

// ============================================================================
// Follow-up Detection
// ============================================================================

const FOLLOW_UP_VIZ_PATTERNS: Array<{ pattern: RegExp; viz: VisualizationType }> = [
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch|remplace|affiche|montre|mets?)\s+(?:en|au?x?|le|la|sous\s+forme\s+de?)\s+(?:un\s+)?(tableau|table|liste)/i, viz: 'table' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch|remplace|affiche|montre|mets?)\s+(?:en|au?x?|le|la|sous\s+forme\s+de?)\s+(?:un\s+)?(bar|barre|barres|histogramme|graphique)/i, viz: 'bar' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch|remplace|affiche|montre|mets?)\s+(?:en|au?x?|le|la|sous\s+forme\s+de?)\s+(?:un\s+)?(camembert|pie|circulaire|donut|secteur)/i, viz: 'pie' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch|remplace|affiche|montre|mets?)\s+(?:en|au?x?|le|la|sous\s+forme\s+de?)\s+(?:un\s+)?(courbe|ligne|line|tendance)/i, viz: 'line' },
  { pattern: /(?:change|passe|met[s]?|transforme|converti[s]?|switch|remplace|affiche|montre|mets?)\s+(?:en|au?x?|le|la|sous\s+forme\s+de?)\s+(?:un\s+)?(kpi|indicateur|chiffre|nombre)/i, viz: 'kpi' },
  // Shorter patterns
  { pattern: /^en\s+(camembert|pie|donut)$/i, viz: 'pie' },
  { pattern: /^en\s+(barres?|bar|histogramme|graphique)$/i, viz: 'bar' },
  { pattern: /^en\s+(tableau|table|liste|grille)$/i, viz: 'table' },
  { pattern: /^en\s+(courbe|ligne|tendance)$/i, viz: 'line' },
  { pattern: /^en\s+(kpi|indicateur|chiffre)$/i, viz: 'kpi' },
  // Very short
  { pattern: /^(camembert|pie|donut)$/i, viz: 'pie' },
  { pattern: /^(barres?|histogramme)$/i, viz: 'bar' },
  { pattern: /^(tableau|table)$/i, viz: 'table' },
  { pattern: /^(courbe|ligne)$/i, viz: 'line' },
  // "sous forme de ..."
  { pattern: /sous\s+forme\s+(?:de?\s+)?(tableau|table)/i, viz: 'table' },
  { pattern: /sous\s+forme\s+(?:de?\s+)?(barres?|graphique|histogramme)/i, viz: 'bar' },
  { pattern: /sous\s+forme\s+(?:de?\s+)?(camembert|circulaire)/i, viz: 'pie' },
  { pattern: /sous\s+forme\s+(?:de?\s+)?(courbe|ligne)/i, viz: 'line' },
]

const FOLLOW_UP_GROUP_PATTERNS: Array<{ pattern: RegExp; extract: (m: RegExpMatchArray) => string }> = [
  { pattern: /(?:groupe|regroupe|trie|class[eé]|organise|ventile)\s+par\s+(\w+)/i, extract: (m: RegExpMatchArray) => m[1] },
  { pattern: /par\s+(\w+)\s+(?:plutôt|plutot|à la place|instead|maintenant)/i, extract: (m: RegExpMatchArray) => m[1] },
  { pattern: /^par\s+(\w+)$/i, extract: (m: RegExpMatchArray) => m[1] },
]

const FOLLOW_UP_LIMIT_PATTERN = /(?:top|limite|seulement|juste|les)\s+(\d+)/i
const FOLLOW_UP_FILTER_PATTERN = /(?:filtre|seulement|uniquement)\s+(?:les?\s+)?(\w+)/i

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
  ville: 'zone', localisation: 'zone',
}

export interface FollowUpResult {
  isFollowUp: true
  vizChange: VisualizationType | null
  groupByChange: GroupByField | null
  limitChange: number | null
  filterChange: StatusFilter[] | null
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
  let filterChange: StatusFilter[] | null = null

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

  // Check filter changes
  const filterMatch = normalized.match(FOLLOW_UP_FILTER_PATTERN)
  if (filterMatch) {
    const filters = findStatusFilters(normalized)
    if (filters.length > 0) filterChange = filters
  }
  // Also check bare status words as follow-up: "validés seulement"
  if (!filterChange) {
    const bareFilters = findStatusFilters(normalized)
    if (bareFilters.length > 0 && /\b(?:seulement|uniquement|que\s+les?)\b/i.test(normalized)) {
      filterChange = bareFilters
    }
  }

  if (!vizChange && !groupByChange && limitChange === null && !filterChange) return null

  return { isFollowUp: true, vizChange, groupByChange, limitChange, filterChange }
}

export function applyFollowUp(
  previous: ParsedInstruction,
  followUp: FollowUpResult
): ParsedInstruction {
  const updated: ParsedInstruction = { ...previous, warnings: [] }

  if (followUp.vizChange) updated.visualization = followUp.vizChange
  if (followUp.groupByChange) updated.groupBy = followUp.groupByChange
  if (followUp.limitChange !== null) updated.limit = followUp.limitChange
  if (followUp.filterChange) updated.filters = followUp.filterChange

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
  const patterns = [
    /\btop\s+(\d+)/i,
    /\bles\s+(\d+)\s+(?:plus|premiers?|derniers?|meilleurs?|principau?x|pires?)/i,
    /(\d+)\s+(?:premiers?|principau?x|meilleurs?|pires?|plus\s+(?:gros|grands?|importants?|chers?|co[uû]teux))/i,
    /(\d+)\s+(?:derniers?|moins)/i,
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
    if (/combien|nombre\s+total|résumé|synthèse|total\b|bilan|aperçu|stats?|statistiques?/i.test(text)) return 'kpi'
    // "les plus coûteux" without groupBy → table with sort
    if (/plus\s+(?:gros|grands?|importants?|chers?|co[uû]teux|[eé]lev[eé]s?)/i.test(text)) return 'table'
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

  // Add filter info to title
  let filterSuffix = ''
  if (instruction.filters.length > 0) {
    const filterLabels = instruction.filters.flatMap(f =>
      f.values.map(v => STATUS_LABELS[v] || v)
    )
    filterSuffix = ` (${filterLabels.join(', ')})`
  }

  return `${limitPrefix}${prefix} ${entityLabel}${groupSuffix}${filterSuffix}`
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

  if (instruction.filters.length > 0) {
    const filterDescriptions = instruction.filters.map(f => {
      const labels = f.values.map(v => STATUS_LABELS[v] || v)
      return `${f.field === 'type' ? 'Type' : 'Statut'} : ${labels.join(', ')}`
    })
    steps.push(`Filtres : ${filterDescriptions.join(' · ')}`)
  }

  if (instruction.sortDirection === 'asc') {
    steps.push('Tri : croissant')
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
  if (/\b(argent|dépenses?|engagements?|investissements?|contrats?)\b/i.test(text)) return 'marches'
  if (/\b(payé|versé|réglé|virements?|payer|r[eè]glement)\b/i.test(text)) return 'paiements'
  if (/\b(entreprises?|sociétés?|prestataires?)\b/i.test(text)) return 'fournisseurs'
  if (/\b(factur[eé]|situation\s+de\s+travaux|d[eé]compter)\b/i.test(text)) return 'decomptes'
  if (/\b(programme|chantier|travaux)\b/i.test(text)) return 'projets'
  if (/\b(commission|cadre\s+juridique|accord)\b/i.test(text)) return 'conventions'
  // If groupBy is fournisseur but no entity found, use marches
  if (/par\s+fournisseur/i.test(text)) return 'marches'
  return null
}

// ============================================================================
// Natural Language Patterns - Additional richness
// ============================================================================

function inferLimitFromContext(text: string): number | null {
  // "les plus coûteux" without explicit number → suggest top 10
  if (/\b(?:plus\s+(?:gros|grands?|importants?|chers?|co[uû]teux|[eé]lev[eé]s?))\b/i.test(text) && !extractNumber(text)) {
    return 10
  }
  // "les moins chers" without explicit number → suggest top 10
  if (/\b(?:moins\s+(?:gros|grands?|importants?|chers?|co[uû]teux|[eé]lev[eé]s?))\b/i.test(text) && !extractNumber(text)) {
    return 10
  }
  return null
}

// ============================================================================
// Main Parse Function
// ============================================================================

export function parseInstruction(input: string): ParseResult {
  const normalized = normalize(input)
  const words = normalized.split(/[\s,;.!?]+/).filter(Boolean)
  const warnings: string[] = []

  // Strip leading question patterns for better entity detection
  const stripped = normalized
    .replace(/^(?:quels?\s+sont|quel\s+est|montre[z]?\s*(?:moi)?|donne[z]?\s*(?:moi)?|affiche[z]?\s*(?:moi)?|je\s+(?:veux|voudrais|souhaite)\s+(?:voir|savoir|connaître)?|peux[\s-]+tu\s+(?:me\s+)?(?:montrer|afficher|donner)|dis[\s-]+moi|fais[\s-]+moi)\s*/i, '')
    .replace(/^(?:les?\s+|la\s+|le\s+|des?\s+|du\s+|un\s+|une\s+)/i, '')

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

  // Find entity (try both original and stripped)
  let entity = findEntity(normalized) || findEntity(stripped)
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
          'Marchés validés par fournisseur',
          'Conventions en cours',
        ],
      },
    }
  }

  // Find groupBy
  let groupBy = findGroupBy(normalized)

  // Find metric
  let metric = findMetric(normalized)

  // Find metric field (will be recalculated after entity redirect if needed)
  let metricField = findMetricField(normalized, entity)

  // Find limit (top N)
  let limit = extractNumber(normalized)

  // Infer limit from context ("les plus coûteux")
  if (!limit) {
    limit = inferLimitFromContext(normalized)
  }

  // Find status filters
  const filters = findStatusFilters(normalized)

  // Find sort direction
  const sortDirection = findSortDirection(normalized)

  // If there's a limit, it implies ranking → sum is usually intended
  if (limit && metric === 'count' && !groupBy) {
    // "top 5 marchés" without groupBy → table with limit, but use sum for amount
    if (/montant|budget|somme|total|co[uû]t|valeur|cher/i.test(normalized)) {
      metric = 'sum'
    }
  } else if (limit && metric === 'count' && groupBy) {
    // "top 5 marchés par fournisseur" → sum by fournisseur is more useful
    if (groupBy === 'fournisseur' || groupBy === 'projet' || groupBy === 'convention') {
      metric = 'sum'
    }
  }

  // If groupBy is fournisseur/projet/convention and metric is count, often sum is more useful
  if (groupBy && ['fournisseur', 'projet', 'convention', 'marche'].includes(groupBy)) {
    if (metric === 'count' && /montant|budget|somme|total|co[uû]t|valeur/i.test(normalized)) {
      metric = 'sum'
    }
  }

  // "les plus coûteux" implies sum metric
  if (/\b(?:co[uû]teux|chers?|[eé]lev[eé]s?|importants?)\b/i.test(normalized) && metric === 'count') {
    metric = 'sum'
  }

  // Smart entity redirect: "top 5 fournisseurs par montant" should query marchés grouped by fournisseur
  // because fournisseurs don't have monetary amounts
  if (entity === 'fournisseurs' && metric === 'sum') {
    entity = 'marches'
    metricField = findMetricField(normalized, entity)
    if (!groupBy) {
      groupBy = 'fournisseur'
    }
    warnings.push('Requête redirigée vers les marchés regroupés par fournisseur (les fournisseurs n\'ont pas de montants propres).')
  }

  // Find visualization
  let visualization = findVisualization(normalized)
  if (!visualization) {
    visualization = inferVisualization(metric, groupBy, limit !== null, normalized)
    if (groupBy || limit) {
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
  if (filters.length > 0) {
    const filterLabels = filters.flatMap(f => f.values.map(v => STATUS_LABELS[v] || v))
    warnings.push(`Filtre actif : ${filterLabels.join(', ')}`)
  }

  // Calculate confidence
  let confidence = 0.5
  confidence += 0.2 // entity found
  if (groupBy) confidence += 0.12
  if (findVisualization(normalized)) confidence += 0.1
  if (metric !== 'count' || /nombre|combien|count/i.test(normalized)) confidence += 0.05
  if (limit) confidence += 0.03
  if (filters.length > 0) confidence += 0.05

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
    filters,
    sortDirection,
  }

  instruction.title = generateTitle(instruction)
  instruction.explanation = buildExplanation(instruction)

  return { success: true, instruction }
}

// ============================================================================
// Suggestions - Richer, more varied
// ============================================================================

export const EXAMPLE_INSTRUCTIONS: Array<{ text: string; icon: string }> = [
  // Conventions
  { text: 'Tableau des conventions validées', icon: 'table' },
  { text: 'Répartition des conventions par type', icon: 'pie' },
  { text: 'Budget total des conventions par statut', icon: 'bar' },
  // Marchés
  { text: 'Marchés par statut', icon: 'pie' },
  { text: 'Top 10 fournisseurs par montant', icon: 'bar' },
  { text: 'Marchés en cours par zone géographique', icon: 'bar' },
  // Projets
  { text: 'Quels sont les projets les plus coûteux ?', icon: 'bar' },
  { text: 'Nombre total de projets', icon: 'kpi' },
  // Finance
  { text: 'Évolution des paiements par mois', icon: 'line' },
  { text: 'Décomptes par fournisseur', icon: 'bar' },
  { text: 'Montant total des décomptes par statut', icon: 'bar' },
  { text: 'Bilan des paiements', icon: 'kpi' },
]
