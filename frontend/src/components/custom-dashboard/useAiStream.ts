/**
 * useAiStream - Hook for consuming SSE streaming from the AI dashboard endpoint.
 *
 * Opens a fetch() ReadableStream to /api/ai/dashboard/stream,
 * parses SSE events, and progressively accumulates text + visualization config.
 */

import { useState, useCallback, useRef } from 'react'
import authService from '@/lib/authService'
import type { ParsedInstruction, VisualizationType, EntityType, GroupByField, MetricType, MetricField } from './instructionParser'

/** SSE event from backend */
interface AiStreamEvent {
  type: 'text' | 'visualization' | 'done' | 'error'
  content: string
  instruction: AiBackendInstruction | null
}

interface AiBackendInstruction {
  visualization: string
  entity: string
  groupBy: string | null
  metric: string
  metricField: string
  limit: number | null
  title: string
  confidence: number
  explanation: string[]
  warnings: string[]
}

interface UseAiStreamResult {
  streamedText: string
  instruction: ParsedInstruction | null
  isStreaming: boolean
  error: string | null
  startStream: (userInstruction: string, conversationId: string) => void
  cancelStream: () => void
}

const VALID_VIZ: VisualizationType[] = ['table', 'bar', 'pie', 'line', 'kpi']
const VALID_ENTITIES: EntityType[] = ['conventions', 'marches', 'projets', 'decomptes', 'paiements', 'fournisseurs', 'budgets']
const VALID_GROUPBY: GroupByField[] = ['statut', 'type', 'convention', 'marche', 'fournisseur', 'projet', 'mois', 'annee', 'zone']
const VALID_METRICS: MetricType[] = ['count', 'sum', 'average']
const VALID_FIELDS: MetricField[] = ['montant', 'montantHT', 'montantTTC', 'budget', 'netAPayer']

const VIZ_FALLBACK: Record<string, VisualizationType> = {
  donut: 'pie', area: 'line', stacked_bar: 'bar', horizontal_bar: 'bar',
  treemap: 'pie', heatmap: 'bar', scatter: 'bar', radar: 'bar', gauge: 'kpi', number: 'kpi',
}

function mapViz(raw: string): VisualizationType {
  if (VALID_VIZ.includes(raw as VisualizationType)) return raw as VisualizationType
  return VIZ_FALLBACK[raw] || 'table'
}

function mapMetric(raw: string): MetricType {
  if (VALID_METRICS.includes(raw as MetricType)) return raw as MetricType
  if (['min', 'max', 'percentage'].includes(raw)) return 'sum'
  return 'count'
}

function convertToParsedInstruction(ai: AiBackendInstruction): ParsedInstruction {
  return {
    visualization: mapViz(ai.visualization),
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

/** Resolve the API base URL (same logic as api.ts) */
function getApiBaseUrl(): string {
  const rawUrl = import.meta.env.VITE_API_URL?.trim()
  if (!rawUrl) return 'http://localhost:8080/api'
  const sanitized = rawUrl.replace(/\/+$/, '')
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`
}

export function useAiStream(): UseAiStreamResult {
  const [streamedText, setStreamedText] = useState('')
  const [instruction, setInstruction] = useState<ParsedInstruction | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const startStream = useCallback((userInstruction: string, conversationId: string) => {
    // Reset state
    setStreamedText('')
    setInstruction(null)
    setError(null)
    setIsStreaming(true)

    // Cancel any existing stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const token = authService.getAccessToken()
    const baseUrl = getApiBaseUrl()

    fetch(`${baseUrl}/ai/dashboard/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ instruction: userInstruction, conversationId }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body reader available')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        const readChunk = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              setIsStreaming(false)
              return
            }

            buffer += decoder.decode(value, { stream: true })

            // Parse SSE events from buffer
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            let currentEventType = ''
            let currentData = ''

            for (const line of lines) {
              if (line.startsWith('event:')) {
                currentEventType = line.slice(6).trim()
              } else if (line.startsWith('data:')) {
                currentData = line.slice(5).trim()
              } else if (line === '' && currentData) {
                // Empty line = end of event
                processEvent(currentEventType, currentData)
                currentEventType = ''
                currentData = ''
              }
            }

            readChunk()
          }).catch((readError: unknown) => {
            if (readError instanceof DOMException && readError.name === 'AbortError') return
            const msg = readError instanceof Error ? readError.message : 'Erreur de lecture du stream'
            setError(msg)
            setIsStreaming(false)
          })
        }

        readChunk()
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return
        const msg = fetchError instanceof Error ? fetchError.message : 'Erreur de connexion'
        setError(msg)
        setIsStreaming(false)
      })

    function processEvent(eventType: string, dataStr: string): void {
      try {
        const event = JSON.parse(dataStr) as AiStreamEvent

        switch (event.type || eventType) {
          case 'text':
            setStreamedText((prev) => prev + event.content)
            break
          case 'visualization':
            if (event.instruction) {
              setInstruction(convertToParsedInstruction(event.instruction))
            }
            break
          case 'done':
            setIsStreaming(false)
            break
          case 'error':
            setError(event.content || 'Erreur IA')
            setIsStreaming(false)
            break
        }
      } catch {
        // Non-JSON data, try to use as raw text
        if (dataStr && eventType === 'text') {
          setStreamedText((prev) => prev + dataStr)
        }
      }
    }
  }, [])

  return { streamedText, instruction, isStreaming, error, startStream, cancelStream }
}
