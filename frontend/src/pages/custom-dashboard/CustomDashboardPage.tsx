/**
 * CustomDashboardPage - Claude-inspired chat interface for dashboard generation.
 *
 * Flow: User instruction → AI (Ollama) or rule-based parser → fetch data → render artifact.
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
}

const STORAGE_KEY = 'investpro-dashboard-chat'
const AI_STATUS_KEY = 'investpro-ai-status'

// ============================================================================
// Persistence
// ============================================================================

function loadChatHistory(): ChatItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as Array<{
      id: string
      type: 'user' | 'system'
      text: string
      timestamp: string
      instruction?: ParsedInstruction
      aiPowered?: boolean
    }>
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
    const toSave = items.map((item) => ({
      id: item.id,
      type: item.type,
      text: item.text,
      timestamp: item.timestamp.toISOString(),
      instruction: item.instruction,
      aiPowered: item.aiPowered,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // Silently fail if localStorage is full
  }
}

// ============================================================================
// AI → ParsedInstruction conversion
// ============================================================================

const VALID_VIZ: VisualizationType[] = ['table', 'bar', 'pie', 'line', 'kpi']
const VALID_ENTITIES: EntityType[] = ['conventions', 'marches', 'projets', 'decomptes', 'paiements', 'fournisseurs', 'budgets']
const VALID_GROUPBY: GroupByField[] = ['statut', 'type', 'convention', 'marche', 'fournisseur', 'projet', 'mois', 'annee', 'zone']
const VALID_METRICS: MetricType[] = ['count', 'sum', 'average']
const VALID_FIELDS: MetricField[] = ['montant', 'montantHT', 'montantTTC', 'budget', 'netAPayer']

/** Map unsupported AI viz types to supported ones */
const VIZ_FALLBACK: Record<string, VisualizationType> = {
  donut: 'pie',
  area: 'line',
  stacked_bar: 'bar',
  horizontal_bar: 'bar',
  treemap: 'pie',
  heatmap: 'bar',
  scatter: 'bar',
  radar: 'bar',
  gauge: 'kpi',
  number: 'kpi',
}

function mapVisualization(raw: string): VisualizationType {
  if (VALID_VIZ.includes(raw as VisualizationType)) return raw as VisualizationType
  return VIZ_FALLBACK[raw] || 'table'
}

/** Map unsupported AI metric types */
function mapMetric(raw: string): MetricType {
  if (VALID_METRICS.includes(raw as MetricType)) return raw as MetricType
  if (['min', 'max', 'percentage'].includes(raw)) return 'sum'
  return 'count'
}

function aiToParsedInstruction(ai: AiParsedInstruction): ParsedInstruction {
  return {
    visualization: mapVisualization(ai.visualization),
    entity: VALID_ENTITIES.includes(ai.entity as EntityType)
      ? ai.entity as EntityType : 'conventions',
    groupBy: ai.groupBy && VALID_GROUPBY.includes(ai.groupBy as GroupByField)
      ? ai.groupBy as GroupByField : null,
    metric: mapMetric(ai.metric),
    metricField: VALID_FIELDS.includes(ai.metricField as MetricField)
      ? ai.metricField as MetricField : 'montant',
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
  }, [items, isLoading])

  const getLastInstruction = useCallback((): ParsedInstruction | null => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].instruction) return items[i].instruction!
    }
    return null
  }, [items])

  const generateId = (): string => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  /** Try AI parsing, then rule-based fallback. */
  const parseWithFallback = useCallback(async (
    text: string,
    lastInstruction: ParsedInstruction | null
  ): Promise<{ instruction: ParsedInstruction; aiPowered: boolean } | { error: string; suggestions: string[] }> => {

    // 1. Follow-up detection (rule-based, fast)
    if (lastInstruction) {
      const followUp = detectFollowUp(text, lastInstruction)
      if (followUp) {
        return { instruction: applyFollowUp(lastInstruction, followUp), aiPowered: false }
      }
    }

    // 2. AI parsing if available
    if (aiAvailable) {
      try {
        const { data } = await aiDashboardAPI.parse(text, conversationId.current)
        if (data.success && data.data) {
          const parsed = aiToParsedInstruction(data.data.instruction)
          return { instruction: parsed, aiPowered: true }
        }
      } catch {
        // AI failed, fall through to rule-based
      }
    }

    // 3. Rule-based fallback
    const result = parseInstruction(text)
    if (result.success) {
      return { instruction: result.instruction, aiPowered: false }
    }

    return { error: result.error.message, suggestions: result.error.suggestions }
  }, [aiAvailable])

  const handleSubmit = useCallback(async (instructionText: string) => {
    setErrorText(null)
    setErrorSuggestions([])

    const userMsg: ChatItem = {
      id: generateId(),
      type: 'user',
      text: instructionText,
      timestamp: new Date(),
    }
    setItems((prev: ChatItem[]) => [...prev, userMsg])

    setIsLoading(true)
    try {
      const lastInstruction = getLastInstruction()
      const parseResult = await parseWithFallback(instructionText, lastInstruction)

      if ('error' in parseResult) {
        setErrorText(parseResult.error)
        setErrorSuggestions(parseResult.suggestions)
        const errorMsg: ChatItem = {
          id: generateId(),
          type: 'system',
          text: parseResult.error,
          timestamp: new Date(),
        }
        setItems((prev: ChatItem[]) => [...prev, errorMsg])
        return
      }

      const { instruction, aiPowered } = parseResult
      const data = await fetchDataForInstruction(instruction)

      const systemMsg: ChatItem = {
        id: generateId(),
        type: 'system',
        text: `${instruction.title} (${data.totalCount} résultat${data.totalCount > 1 ? 's' : ''})`,
        timestamp: new Date(),
        instruction,
        data,
        aiPowered,
      }
      setItems((prev: ChatItem[]) => [...prev, systemMsg])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      const errorMsg: ChatItem = {
        id: generateId(),
        type: 'system',
        text: `Erreur lors du chargement: ${message}`,
        timestamp: new Date(),
      }
      setItems((prev: ChatItem[]) => [...prev, errorMsg])
      setErrorText(`Erreur: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [getLastInstruction, parseWithFallback])

  const handleRemoveWidget = useCallback((id: string) => {
    setItems((prev: ChatItem[]) => prev.filter((item: ChatItem) => item.id !== id))
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
                  {items.map((item: ChatItem) => (
                    <ChatMessage
                      key={item.id}
                      type={item.type}
                      content={item.text}
                      timestamp={item.timestamp}
                    >
                      {item.instruction && item.data && (
                        <Box>
                          {/* AI vs Rule badge */}
                          {item.aiPowered !== undefined && (
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mb: 1,
                              px: 0.75,
                              py: 0.25,
                              borderRadius: borders.radius.base,
                              fontSize: '10px',
                              fontWeight: typography.weights.medium,
                              backgroundColor: item.aiPowered ? colors.primary[25] : colors.neutral[25],
                              color: item.aiPowered ? colors.primary[600] : colors.neutral[400],
                            }}>
                              {item.aiPowered
                                ? <><Cpu className="w-2.5 h-2.5" /> IA</>
                                : <><Zap className="w-2.5 h-2.5" /> Règles</>
                              }
                            </Box>
                          )}
                          <GeneratedWidget
                            instruction={item.instruction}
                            data={item.data}
                            originalText={item.text}
                            onRemove={() => handleRemoveWidget(item.id)}
                          />
                        </Box>
                      )}
                    </ChatMessage>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
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
                          {aiAvailable ? 'Analyse IA en cours...' : 'Chargement des données...'}
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
                      {errorSuggestions.map((suggestion: string, idx: number) => (
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
