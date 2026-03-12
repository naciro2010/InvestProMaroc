/**
 * CustomDashboardPage - Main page for generating custom dashboards from text instructions.
 *
 * Users type instructions in French (e.g. "tableau des paiements par marché")
 * and the system generates the corresponding visualizations using rule-based parsing.
 */

import { useState, useCallback } from 'react'
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material'
import { Sparkles, LayoutDashboard, Trash2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import {
  InstructionInput,
  GeneratedWidget,
  parseInstruction,
  fetchDataForInstruction,
  type ParsedInstruction,
  type FetchedData,
} from '@/components/custom-dashboard'

// ============================================================================
// Types
// ============================================================================

interface GeneratedItem {
  id: string
  instruction: ParsedInstruction
  data: FetchedData
  originalText: string
  createdAt: Date
}

// ============================================================================
// Main Component
// ============================================================================

const CustomDashboardPage = () => {
  const [items, setItems] = useState<GeneratedItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([])

  const handleSubmit = useCallback(async (instructionText: string) => {
    setError(null)
    setErrorSuggestions([])

    // 1. Parse the instruction
    const parseResult = parseInstruction(instructionText)

    if (!parseResult.success) {
      setError(parseResult.error.message)
      setErrorSuggestions(parseResult.error.suggestions)
      return
    }

    // 2. Fetch data
    setIsLoading(true)
    try {
      const data = await fetchDataForInstruction(parseResult.instruction)

      const newItem: GeneratedItem = {
        id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        instruction: parseResult.instruction,
        data,
        originalText: instructionText,
        createdAt: new Date(),
      }

      // Add to beginning of list
      setItems((prev: GeneratedItem[]) => [newItem, ...prev])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur lors du chargement des données: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRemove = useCallback((id: string) => {
    setItems((prev: GeneratedItem[]) => prev.filter((item: GeneratedItem) => item.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    setItems([])
  }, [])

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.neutral[25] }}>
        {/* Header */}
        <ControlPanel
          breadcrumbs={[
            { label: 'Accueil', path: '/dashboard' },
            { label: 'Générateur de Dashboard' },
          ]}
          actions={
            items.length > 0 ? (
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
                Tout effacer ({items.length})
              </button>
            ) : undefined
          }
        />

        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, pb: 6 }}>
          {/* Intro section */}
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            mb: 3,
            p: 2.5,
            ...componentStyles.card,
            backgroundColor: colors.primary[25],
            borderColor: colors.primary[100],
          }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: borders.radius.lg,
              backgroundColor: colors.primary[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles className="w-5 h-5" style={{ color: colors.primary[600] }} />
            </Box>
            <Box>
              <Typography sx={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
                mb: 0.5,
              }}>
                Générez vos tableaux de bord en une instruction
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 1.6 }}>
                Décrivez en français ce que vous souhaitez voir.
                Le système analyse votre instruction et génère automatiquement le tableau ou graphique correspondant.
                Exemples : <em>&quot;tableau des paiements par marché&quot;</em>, <em>&quot;répartition des conventions par statut&quot;</em>, <em>&quot;top 10 fournisseurs par montant&quot;</em>
              </Typography>
            </Box>
          </Box>

          {/* Input */}
          <Box sx={{ mb: 3 }}>
            <InstructionInput onSubmit={handleSubmit} isLoading={isLoading} />
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity="warning"
              sx={{ mb: 3, borderRadius: borders.radius.lg }}
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

          {/* Loading */}
          {isLoading && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 4,
              mb: 3,
              ...componentStyles.card,
            }}>
              <CircularProgress size={24} />
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Génération en cours...
              </Typography>
            </Box>
          )}

          {/* Generated widgets */}
          {items.map((item: GeneratedItem) => (
            <GeneratedWidget
              key={item.id}
              instruction={item.instruction}
              data={item.data}
              originalText={item.originalText}
              onRemove={() => handleRemove(item.id)}
            />
          ))}

          {/* Empty state */}
          {items.length === 0 && !isLoading && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              ...componentStyles.card,
              backgroundColor: colors.surface,
            }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: borders.radius.xl,
                backgroundColor: colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}>
                <LayoutDashboard className="w-8 h-8" style={{ color: colors.neutral[400] }} />
              </Box>
              <Typography sx={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
                mb: 1,
              }}>
                Votre espace de création
              </Typography>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                color: colors.textSecondary,
                textAlign: 'center',
                maxWidth: 420,
              }}>
                Tapez une instruction ci-dessus pour générer automatiquement un tableau de bord personnalisé.
                Chaque widget peut être basculé entre tableau et graphique.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </AppLayout>
  )
}

export default CustomDashboardPage
