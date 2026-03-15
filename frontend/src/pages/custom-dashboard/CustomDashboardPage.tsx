/**
 * CustomDashboardPage - Claude-inspired chat interface for dashboard generation.
 *
 * Flow:
 * - AI available: User instruction → SSE streaming (markdown analysis + viz config) → render
 * - AI offline: User instruction → rule-based parser → fetch data → render artifact
 *
 * Supports follow-up modifications (e.g. "change en camembert", "top 5 seulement").
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Box, Typography, CircularProgress, Chip } from '@mui/material'
import { Trash2, Cpu, Zap } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import { colors, typography, borders } from '@/lib/designSystem'
import { aiDashboardAPI, type AiParsedInstruction } from '@/lib/api'
import {
  InstructionInput,
  GeneratedWidget,
  WelcomeSplash,
  ChatMessage,
  parseInstruction,
  fetchDataForInstruction,
  detectFollowUp,
  applyFollowUp,
  useAiStream,
  type ParsedInstruction,
  type FetchedData,
  type VisualizationType,
  type EntityType,
  type GroupByField,
  type MetricType,
  type MetricField,
} from '@/components/custom-dashboard'

// ============================================================================
// Types
// ============================================================================

interface ChatItem {
  id: string
  type: 'user' | 'system'
  text: string
  timestamp: Date
  instruction?: ParsedInstruction
  data?: FetchedData
  aiPowered?: boolean
  isStreaming?: boolean
  markdownContent?: string
}

const STORAGE_KEY = 'investpro-dashboard-chat'
const AI_STATUS_KEY = 'investpro-ai-status'

/** Generate a rich summary text from data insights */
function generateDataSummary(instruction: ParsedInstruction, data: FetchedData): string {
  const parts: string[] = []

  parts.push(`**${instruction.title}** — ${data.totalCount} élément${data.totalCount > 1 ? 's' : ''} trouvé${data.totalCount > 1 ? 's' : ''}`)

  if (data.rows.length === 0) {
    parts.push('\nAucune donnée ne correspond aux critères.')
    return parts.join('')
  }

  // For grouped data, add insights
  if (instruction.groupBy && data.rows.length > 1) {
    const numericValues = data.rows.map(r => typeof r.value === 'number' ? r.value : 0)
    const total = numericValues.reduce((s, v) => s + v, 0)
    const topRow = data.rows[0]
    const topName = topRow.group as string || ''
    const topValue = typeof topRow.value === 'number' ? topRow.value : 0

    if (instruction.metric === 'sum' || instruction.metric === 'average') {
      const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(total)
      parts.push(`\n\n**Total** : ${formatted} MAD sur ${data.rows.length} catégories.`)
    } else {
      parts.push(`\n\n**Total** : ${total} répartis sur ${data.rows.length} catégories.`)
    }

    if (topName) {
      const topPct = total > 0 ? Math.round((topValue / total) * 100) : 0
      const topFormatted = instruction.metric !== 'count'
        ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(topValue) + ' MAD'
        : String(topValue)
      parts.push(` Le leader est **${topName}** avec ${topFormatted} (${topPct}%).`)
    }

    // Show top 3
    if (data.rows.length >= 3) {
      const top3 = data.rows.slice(0, 3).map((r, i) => {
        const name = r.group as string || '?'
        const val = typeof r.value === 'number' ? r.value : 0
        const pct = total > 0 ? Math.round((val / total) * 100) : 0
        return `${i + 1}. ${name} (${pct}%)`
      })
      parts.push(`\n\n**Top 3** : ${top3.join(', ')}`)
    }
  } else if (!instruction.groupBy && data.rows.length > 0) {
    // For table/ungrouped, show quick stats on numeric columns
    const numCols = data.columns.filter(c => c.type === 'number' && c.key !== 'rank' && c.key !== 'percentage')
    if (numCols.length > 0) {
      const mainCol = numCols[0]
      const values = data.rows.map(r => typeof r[mainCol.key] === 'number' ? r[mainCol.key] as number : 0).filter(v => v > 0)
      if (values.length > 0) {
        const total = values.reduce((s, v) => s + v, 0)
        const avg = total / values.length
        const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(total)
        const avgFormatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(avg)
        parts.push(`\n\n**${mainCol.label}** — Total : ${formatted} | Moyenne : ${avgFormatted} | ${values.length} entrées avec valeur.`)
      }
    }
  }

  return parts.join('')
}

// ============================================================================
// Persistence
// ============================================================================

interface StoredChatItem {
  id: string
  type: 'user' | 'system'
  text: string
  timestamp: string
  instruction?: ParsedInstruction
  aiPowered?: boolean
  markdownContent?: string
}

function loadChatHistory(): ChatItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as StoredChatItem[]
    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }))
  } catch {
    return []
  }
}

function saveChatHistory(items: ChatItem[]): void {
  try {
    const toSave: StoredChatItem[] = items
      .filter((item) => !item.isStreaming)
      .map((item) => ({
        id: item.id,
        type: item.type,
        text: item.text,
        timestamp: item.timestamp.toISOString(),
        instruction: item.instruction,
        aiPowered: item.aiPowered,
        markdownContent: item.markdownContent,
      }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // Silently fail if localStorage is full
  }
}

// ============================================================================
// AI → ParsedInstruction conversion (for sync fallback)
// ============================================================================

const VALID_VIZ: VisualizationType[] = ['table', 'bar', 'pie', 'line', 'kpi']
const VALID_ENTITIES: EntityType[] = ['conventions', 'marches', 'projets', 'decomptes', 'paiements', 'fournisseurs', 'budgets']
const VALID_GROUPBY: GroupByField[] = ['statut', 'type', 'convention', 'marche', 'fournisseur', 'projet', 'mois', 'annee', 'zone']
const VALID_METRICS: MetricType[] = ['count', 'sum', 'average']
const VALID_FIELDS: MetricField[] = ['montant', 'montantHT', 'montantTTC', 'budget', 'netAPayer']

const VIZ_FALLBACK: Record<string, VisualizationType> = {
  donut: 'pie', area: 'line', stacked_bar: 'bar', horizontal_bar: 'bar',
  treemap: 'pie', heatmap: 'bar', scatter: 'bar', radar: 'bar', gauge: 'kpi', number: 'kpi',
}

function mapVisualization(raw: string): VisualizationType {
  if (VALID_VIZ.includes(raw as VisualizationType)) return raw as VisualizationType
  return VIZ_FALLBACK[raw] || 'table'
}

function mapMetric(raw: string): MetricType {
  if (VALID_METRICS.includes(raw as MetricType)) return raw as MetricType
  if (['min', 'max', 'percentage'].includes(raw)) return 'sum'
  return 'count'
}

function aiToParsedInstruction(ai: AiParsedInstruction): ParsedInstruction {
  return {
    visualization: mapVisualization(ai.visualization),
    entity: VALID_ENTITIES.includes(ai.entity as EntityType) ? ai.entity as EntityType : 'conventions',
    groupBy: ai.groupBy && VALID_GROUPBY.includes(ai.groupBy as GroupByField) ? ai.groupBy as GroupByField : null,
    metric: mapMetric(ai.metric),
    metricField: VALID_FIELDS.includes(ai.metricField as MetricField) ? ai.metricField as MetricField : 'montant',
    limit: ai.limit,
    title: ai.title || 'Résultat',
    confidence: ai.confidence,
    warnings: ai.warnings,
    explanation: {
      entityDetected: ai.entity,
      visualizationDetected: ai.visualization,
      groupByDetected: ai.groupBy,
      metricDetected: ai.metric,
      steps: ai.explanation,
    },
    filters: [],
    sortDirection: 'desc',
  }
}

// ============================================================================
// Main Component
// ============================================================================

const CustomDashboardPage = () => {
  const [items, setItems] = useState<ChatItem[]>(() => loadChatHistory())
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([])
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)
  const [aiModel, setAiModel] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const conversationId = useRef(`conv-${Date.now()}`)
  const streamingMsgId = useRef<string | null>(null)

  // SSE streaming hook
  const {
    streamedText,
    instruction: streamInstruction,
    isStreaming: isAiStreaming,
    error: streamError,
    startStream,
  } = useAiStream()

  // Check AI status on mount (with 60s cache)
  useEffect(() => {
    const cached = localStorage.getItem(AI_STATUS_KEY)
    if (cached) {
      try {
        const status = JSON.parse(cached) as { available: boolean; model: string | null; ts: number }
        if (Date.now() - status.ts < 60_000) {
          setAiAvailable(status.available)
          setAiModel(status.model)
          return
        }
      } catch { /* ignore */ }
    }

    aiDashboardAPI.status()
      .then(({ data }) => {
        const available = data.data?.available ?? false
        const model = data.data?.model ?? null
        setAiAvailable(available)
        setAiModel(model)
        localStorage.setItem(AI_STATUS_KEY, JSON.stringify({ available, model, ts: Date.now() }))
      })
      .catch(() => {
        setAiAvailable(false)
        localStorage.setItem(AI_STATUS_KEY, JSON.stringify({ available: false, model: null, ts: Date.now() }))
      })
  }, [])

  // Persist to localStorage
  useEffect(() => {
    saveChatHistory(items)
  }, [items])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, isLoading, streamedText])

  // Update streaming message as text arrives
  useEffect(() => {
    if (streamingMsgId.current && streamedText) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === streamingMsgId.current
            ? { ...item, text: streamedText, markdownContent: streamedText, isStreaming: isAiStreaming }
            : item
        )
      )
    }
  }, [streamedText, isAiStreaming])

  // Handle stream completion - fetch data and attach visualization
  useEffect(() => {
    if (!isAiStreaming && streamInstruction && streamingMsgId.current) {
      const msgId = streamingMsgId.current
      streamingMsgId.current = null

      // Fetch data for the visualization
      fetchDataForInstruction(streamInstruction)
        .then((data) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === msgId
                ? { ...item, instruction: streamInstruction, data, isStreaming: false, aiPowered: true }
                : item
            )
          )
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Erreur inconnue'
          setItems((prev) =>
            prev.map((item) =>
              item.id === msgId
                ? { ...item, text: item.text + `\n\n*Erreur de chargement des données: ${message}*`, isStreaming: false }
                : item
            )
          )
        })
        .finally(() => setIsLoading(false))
    }
  }, [isAiStreaming, streamInstruction])

  // Handle stream errors
  useEffect(() => {
    if (streamError && streamingMsgId.current) {
      const msgId = streamingMsgId.current
      streamingMsgId.current = null
      setItems((prev) =>
        prev.map((item) =>
          item.id === msgId
            ? { ...item, text: `Erreur IA: ${streamError}`, isStreaming: false }
            : item
        )
      )
      setIsLoading(false)
    }
  }, [streamError])

  const getLastInstruction = useCallback((): ParsedInstruction | null => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].instruction) return items[i].instruction!
    }
    return null
  }, [items])

  const generateId = (): string => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  /** Handle AI streaming mode */
  const handleStreamSubmit = useCallback((instructionText: string) => {
    const userMsg: ChatItem = {
      id: generateId(),
      type: 'user',
      text: instructionText,
      timestamp: new Date(),
    }

    const systemMsgId = generateId()
    const systemMsg: ChatItem = {
      id: systemMsgId,
      type: 'system',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
      aiPowered: true,
    }

    streamingMsgId.current = systemMsgId
    setItems((prev) => [...prev, userMsg, systemMsg])
    setIsLoading(true)
    setErrorText(null)
    setErrorSuggestions([])

    startStream(instructionText, conversationId.current)
  }, [startStream])

  /** Handle rule-based (sync) mode */
  const handleSyncSubmit = useCallback(async (instructionText: string) => {
    setErrorText(null)
    setErrorSuggestions([])

    const userMsg: ChatItem = {
      id: generateId(),
      type: 'user',
      text: instructionText,
      timestamp: new Date(),
    }
    setItems((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const lastInstruction = getLastInstruction()

      // 1. Follow-up detection (rule-based, fast)
      if (lastInstruction) {
        const followUp = detectFollowUp(instructionText, lastInstruction)
        if (followUp) {
          const instruction = applyFollowUp(lastInstruction, followUp)
          const data = await fetchDataForInstruction(instruction)
          const systemMsg: ChatItem = {
            id: generateId(),
            type: 'system',
            text: generateDataSummary(instruction, data),
            timestamp: new Date(),
            instruction,
            data,
            aiPowered: false,
          }
          setItems((prev) => [...prev, systemMsg])
          return
        }
      }

      // 2. Try sync AI parsing if available
      if (aiAvailable) {
        try {
          const { data: apiData } = await aiDashboardAPI.parse(instructionText, conversationId.current)
          if (apiData.success && apiData.data) {
            const instruction = aiToParsedInstruction(apiData.data.instruction)
            const data = await fetchDataForInstruction(instruction)
            const systemMsg: ChatItem = {
              id: generateId(),
              type: 'system',
              text: generateDataSummary(instruction, data),
              timestamp: new Date(),
              instruction,
              data,
              aiPowered: true,
            }
            setItems((prev) => [...prev, systemMsg])
            return
          }
        } catch {
          // AI failed, fall through to rule-based
        }
      }

      // 3. Rule-based fallback
      const result = parseInstruction(instructionText)
      if (result.success) {
        const data = await fetchDataForInstruction(result.instruction)
        const systemMsg: ChatItem = {
          id: generateId(),
          type: 'system',
          text: generateDataSummary(result.instruction, data),
          timestamp: new Date(),
          instruction: result.instruction,
          data,
          aiPowered: false,
        }
        setItems((prev) => [...prev, systemMsg])
      } else {
        setErrorText(result.error.message)
        setErrorSuggestions(result.error.suggestions)
        const errorMsg: ChatItem = {
          id: generateId(),
          type: 'system',
          text: result.error.message,
          timestamp: new Date(),
        }
        setItems((prev) => [...prev, errorMsg])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      const errorMsg: ChatItem = {
        id: generateId(),
        type: 'system',
        text: `Erreur lors du chargement: ${message}`,
        timestamp: new Date(),
      }
      setItems((prev) => [...prev, errorMsg])
      setErrorText(`Erreur: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [aiAvailable, getLastInstruction])

  /** Main submit handler - routes to streaming or sync mode */
  const handleSubmit = useCallback((instructionText: string) => {
    if (aiAvailable) {
      // Check follow-up first (rule-based, no streaming needed)
      const lastInstruction = getLastInstruction()
      if (lastInstruction) {
        const followUp = detectFollowUp(instructionText, lastInstruction)
        if (followUp) {
          handleSyncSubmit(instructionText)
          return
        }
      }
      handleStreamSubmit(instructionText)
    } else {
      handleSyncSubmit(instructionText)
    }
  }, [aiAvailable, getLastInstruction, handleStreamSubmit, handleSyncSubmit])

  const handleRemoveWidget = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
    conversationId.current = `conv-${Date.now()}`
    setErrorText(null)
    setErrorSuggestions([])
  }, [])

  const hasMessages = items.length > 0

  return (
    <AppLayout>
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[25],
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <ControlPanel
          breadcrumbs={[
            { label: 'Accueil', path: '/dashboard' },
            { label: 'Générateur de Dashboard' },
          ]}
          actions={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* AI status */}
              {aiAvailable !== null && (
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.375,
                  borderRadius: borders.radius.full,
                  fontSize: typography.sizes['2xs'],
                  fontWeight: typography.weights.medium,
                  backgroundColor: aiAvailable ? colors.success[50] : colors.neutral[50],
                  color: aiAvailable ? colors.success[700] : colors.neutral[400],
                  border: `1px solid ${aiAvailable ? colors.success[200] : colors.neutral[200]}`,
                }}>
                  {aiAvailable
                    ? <><Cpu className="w-3 h-3" /> IA {aiModel}</>
                    : <><Zap className="w-3 h-3" /> Règles</>
                  }
                </Box>
              )}

              {hasMessages && (
                <Box
                  component="button"
                  onClick={handleClearAll}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.625,
                    fontSize: typography.sizes.xs,
                    color: colors.danger[600],
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: borders.radius.base,
                    cursor: 'pointer',
                    fontWeight: typography.weights.medium,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: colors.danger[25],
                      borderColor: colors.danger[200],
                    },
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Effacer
                </Box>
              )}
            </Box>
          }
        />

        {/* Chat area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            px: 3,
            pb: 2,
          }}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              {!hasMessages ? (
                <WelcomeSplash onSuggestionClick={handleSubmit} />
              ) : (
                <Box sx={{ pt: 2 }}>
                  {items.map((item) => (
                    <ChatMessage
                      key={item.id}
                      type={item.type}
                      content={item.markdownContent || item.text}
                      timestamp={item.timestamp}
                      isStreaming={item.isStreaming}
                    >
                      {item.instruction && item.data && (
                        <Box>
                          <GeneratedWidget
                            instruction={item.instruction}
                            data={item.data}
                            originalText={item.text}
                            onRemove={() => handleRemoveWidget(item.id)}
                            aiPowered={item.aiPowered}
                            aiModel={item.aiPowered ? aiModel : null}
                          />
                        </Box>
                      )}
                    </ChatMessage>
                  ))}

                  {/* Loading indicator (non-streaming mode only) */}
                  {isLoading && !isAiStreaming && (
                    <ChatMessage
                      type="system"
                      content=""
                      timestamp={new Date()}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        borderRadius: borders.radius.lg,
                        border: `1px solid ${colors.neutral[100]}`,
                        backgroundColor: colors.surface,
                        width: 'fit-content',
                      }}>
                        <CircularProgress size={16} sx={{ color: colors.primary[400] }} />
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.neutral[400] }}>
                          Chargement des données...
                        </Typography>
                      </Box>
                    </ChatMessage>
                  )}
                </Box>
              )}

              {/* Error with suggestions */}
              {errorText && (
                <Box sx={{
                  maxWidth: 500,
                  mx: 'auto',
                  mt: 1,
                  mb: 2,
                  p: 2,
                  borderRadius: borders.radius.lg,
                  border: `1px solid ${colors.warning[200]}`,
                  backgroundColor: colors.warning[25],
                }}>
                  <Typography sx={{
                    fontSize: typography.sizes.sm,
                    color: colors.warning[700],
                    fontWeight: typography.weights.medium,
                    mb: errorSuggestions.length > 0 ? 1 : 0,
                  }}>
                    {errorText}
                  </Typography>
                  {errorSuggestions.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {errorSuggestions.map((suggestion, idx) => (
                        <Chip
                          key={idx}
                          label={suggestion}
                          size="small"
                          onClick={() => {
                            setErrorText(null)
                            handleSubmit(suggestion)
                          }}
                          sx={{
                            cursor: 'pointer',
                            fontSize: typography.sizes.xs,
                            backgroundColor: colors.surface,
                            border: `1px solid ${colors.neutral[200]}`,
                            '&:hover': {
                              backgroundColor: colors.primary[50],
                              borderColor: colors.primary[200],
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <div ref={chatEndRef} />
            </Box>
          </Box>

          <InstructionInput onSubmit={handleSubmit} isLoading={isLoading} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default CustomDashboardPage
