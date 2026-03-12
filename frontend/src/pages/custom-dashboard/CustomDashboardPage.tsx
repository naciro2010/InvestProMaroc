/**
 * CustomDashboardPage - Chat-like interface for generating dashboards from French text.
 *
 * Users type instructions (e.g. "tableau des paiements par marché") and the system
 * generates visualizations using rule-based parsing. Supports follow-up modifications
 * (e.g. "change en camembert", "top 5 seulement").
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material'
import { Trash2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
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
}

const STORAGE_KEY = 'investpro-dashboard-chat'

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
    // Save without data (too large), we'll refetch on load
    const toSave = items.map((item) => ({
      id: item.id,
      type: item.type,
      text: item.text,
      timestamp: item.timestamp.toISOString(),
      instruction: item.instruction,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // Silently fail if localStorage is full
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
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Persist to localStorage
  useEffect(() => {
    saveChatHistory(items)
  }, [items])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, isLoading])

  // Get last system instruction for follow-up detection
  const getLastInstruction = useCallback((): ParsedInstruction | null => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].instruction) return items[i].instruction!
    }
    return null
  }, [items])

  const generateId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  const handleSubmit = useCallback(async (instructionText: string) => {
    setError(null)
    setErrorSuggestions([])

    // Add user message
    const userMsg: ChatItem = {
      id: generateId(),
      type: 'user',
      text: instructionText,
      timestamp: new Date(),
    }
    setItems((prev: ChatItem[]) => [...prev, userMsg])

    // Check for follow-up
    const lastInstruction = getLastInstruction()
    let instruction: ParsedInstruction | null = null

    if (lastInstruction) {
      const followUp = detectFollowUp(instructionText, lastInstruction)
      if (followUp) {
        instruction = applyFollowUp(lastInstruction, followUp)
      }
    }

    // Parse as new instruction if not a follow-up
    if (!instruction) {
      const parseResult = parseInstruction(instructionText)
      if (!parseResult.success) {
        setError(parseResult.error.message)
        setErrorSuggestions(parseResult.error.suggestions)
        // Add error as system message
        const errorMsg: ChatItem = {
          id: generateId(),
          type: 'system',
          text: parseResult.error.message,
          timestamp: new Date(),
        }
        setItems((prev: ChatItem[]) => [...prev, errorMsg])
        return
      }
      instruction = parseResult.instruction
    }

    // Fetch data
    setIsLoading(true)
    try {
      const data = await fetchDataForInstruction(instruction)

      const systemMsg: ChatItem = {
        id: generateId(),
        type: 'system',
        text: instruction.title,
        timestamp: new Date(),
        instruction,
        data,
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
  }, [getLastInstruction])

  const handleRemoveWidget = useCallback((id: string) => {
    setItems((prev: ChatItem[]) => prev.filter((item: ChatItem) => item.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
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
            hasMessages ? (
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
            ) : undefined
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
              {/* Welcome screen or messages */}
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
                        <GeneratedWidget
                          instruction={item.instruction}
                          data={item.data}
                          originalText={item.text}
                          onRemove={() => handleRemoveWidget(item.id)}
                        />
                      )}
                    </ChatMessage>
                  ))}

                  {/* Loading indicator */}
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
                          Analyse et chargement des données...
                        </Typography>
                      </Box>
                    </ChatMessage>
                  )}
                </Box>
              )}

              {/* Error */}
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

          {/* Bottom input */}
          <InstructionInput onSubmit={handleSubmit} isLoading={isLoading} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default CustomDashboardPage
