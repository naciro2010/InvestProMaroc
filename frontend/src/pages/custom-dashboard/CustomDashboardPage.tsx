/**
 * CustomDashboardPage - Chat-like interface for generating dashboards from French text.
 *
 * Flow: User instruction → AI (Ollama) → rule-based fallback → fetch data → visualize.
 * Supports follow-up modifications (e.g. "change en camembert", "top 5 seulement").
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material'
import { Trash2, Cpu, Zap } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
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

function aiToParsedInstruction(ai: AiParsedInstruction): ParsedInstruction {
  return {
    visualization: VALID_VIZ.includes(ai.visualization as VisualizationType)
      ? ai.visualization as VisualizationType : 'table',
    entity: VALID_ENTITIES.includes(ai.entity as EntityType)
      ? ai.entity as EntityType : 'conventions',
    groupBy: ai.groupBy && VALID_GROUPBY.includes(ai.groupBy as GroupByField)
      ? ai.groupBy as GroupByField : null,
    metric: VALID_METRICS.includes(ai.metric as MetricType)
      ? ai.metric as MetricType : 'count',
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
  const [error, setError] = useState<string | null>(null)
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([])
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)
  const [aiModel, setAiModel] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const conversationId = useRef(`conv-${Date.now()}`)

  // Check AI status on mount
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

  /**
   * Try AI parsing first, then fall back to rule-based parser.
   */
  const parseWithFallback = useCallback(async (
    text: string,
    lastInstruction: ParsedInstruction | null
  ): Promise<{ instruction: ParsedInstruction; aiPowered: boolean } | { error: string; suggestions: string[] }> => {

    // 1. Check for follow-up (rule-based, fast)
    if (lastInstruction) {
      const followUp = detectFollowUp(text, lastInstruction)
      if (followUp) {
        return { instruction: applyFollowUp(lastInstruction, followUp), aiPowered: false }
      }
    }

    // 2. Try AI parsing if available
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
    setError(null)
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
        setError(parseResult.error)
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
        text: instruction.title,
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
      setError(`Erreur lors du chargement des données: ${message}`)
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
              {/* AI status badge */}
              {aiAvailable !== null && (
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: borders.radius.full,
                  fontSize: typography.sizes['2xs'],
                  fontWeight: typography.weights.semibold,
                  backgroundColor: aiAvailable ? colors.success[50] : colors.neutral[100],
                  color: aiAvailable ? colors.success[700] : colors.neutral[500],
                  border: `1px solid ${aiAvailable ? colors.success[200] : colors.neutral[200]}`,
                }}>
                  {aiAvailable
                    ? <><Cpu className="w-3 h-3" /> IA {aiModel}</>
                    : <><Zap className="w-3 h-3" /> Mode règles</>
                  }
                </Box>
              )}

              {hasMessages && (
                <button
                  onClick={handleClearAll}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: typography.sizes.sm,
                    color: colors.danger[600],
                    backgroundColor: colors.danger[50],
                    border: `1px solid ${colors.danger[200]}`,
                    borderRadius: borders.radius.base,
                    cursor: 'pointer',
                    fontWeight: typography.weights.medium,
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Nouvelle conversation
                </button>
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
                          {/* AI/Rule badge */}
                          {item.aiPowered !== undefined && (
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mb: 1,
                              px: 1,
                              py: 0.25,
                              borderRadius: borders.radius.base,
                              fontSize: typography.sizes['2xs'],
                              fontWeight: typography.weights.medium,
                              backgroundColor: item.aiPowered ? colors.primary[50] : colors.neutral[50],
                              color: item.aiPowered ? colors.primary[700] : colors.neutral[500],
                            }}>
                              {item.aiPowered
                                ? <><Cpu className="w-3 h-3" /> Analysé par IA</>
                                : <><Zap className="w-3 h-3" /> Analysé par règles</>
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

                  {isLoading && (
                    <ChatMessage
                      type="system"
                      content="Génération en cours..."
                      timestamp={new Date()}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 2,
                        ...componentStyles.card,
                        px: 3,
                      }}>
                        <CircularProgress size={20} />
                        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                          {aiAvailable ? 'Analyse IA en cours...' : 'Analyse et chargement des données...'}
                        </Typography>
                      </Box>
                    </ChatMessage>
                  )}
                </Box>
              )}

              {error && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2, borderRadius: borders.radius.lg, maxWidth: 600, mx: 'auto' }}
                  onClose={() => setError(null)}
                >
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, mb: errorSuggestions.length > 0 ? 1 : 0 }}>
                    {error}
                  </Typography>
                  {errorSuggestions.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                      {errorSuggestions.map((suggestion: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={suggestion}
                          size="small"
                          onClick={() => {
                            setError(null)
                            handleSubmit(suggestion)
                          }}
                          sx={{
                            cursor: 'pointer',
                            fontSize: typography.sizes.xs,
                            '&:hover': { backgroundColor: colors.primary[50] },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Alert>
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
