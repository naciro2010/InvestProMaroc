/**
 * InstructionInput - Premium bottom-fixed chat input bar.
 *
 * Features:
 * - Smart inline suggestion chips based on typing
 * - Multiline with Enter to submit
 * - Visual focus/loading states
 * - Quick action hints
 */

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { Box, TextField, InputAdornment, IconButton, Typography, Chip } from '@mui/material'
import { Send, Sparkles } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

interface InstructionInputProps {
  onSubmit: (instruction: string) => void
  isLoading: boolean
}

// Contextual suggestions based on what user is typing
const QUICK_SUGGESTIONS: Array<{ trigger: RegExp; suggestions: string[] }> = [
  {
    trigger: /^(?:march|marc|mar)$/i,
    suggestions: ['Marchés par statut', 'Top 5 marchés par montant', 'Marchés validés par fournisseur'],
  },
  {
    trigger: /^(?:conv|conve|conven)$/i,
    suggestions: ['Conventions par type', 'Répartition des conventions', 'Conventions en cours'],
  },
  {
    trigger: /^(?:four|fourn)$/i,
    suggestions: ['Top 10 fournisseurs par montant', 'Tableau des fournisseurs', 'Fournisseurs par zone'],
  },
  {
    trigger: /^(?:proj|proje)$/i,
    suggestions: ['Projets par statut', 'Budget des projets', 'Projets les plus coûteux'],
  },
  {
    trigger: /^(?:dec|déc|deco|déco)$/i,
    suggestions: ['Décomptes par statut', 'Évolution des décomptes par mois', 'Total des décomptes'],
  },
  {
    trigger: /^(?:pai|pay|paie)$/i,
    suggestions: ['Paiements par mois', 'Total des paiements', 'Paiements par fournisseur'],
  },
  {
    trigger: /^(?:top|clas|class)$/i,
    suggestions: ['Top 5 fournisseurs par montant', 'Top 10 marchés par montant HT', 'Classement des projets'],
  },
  {
    trigger: /^(?:répart|repart|distri|camem)$/i,
    suggestions: ['Répartition des marchés par type', 'Camembert des conventions par statut', 'Distribution par zone'],
  },
  {
    trigger: /^(?:évol|evol|tend|courb)$/i,
    suggestions: ['Évolution des paiements par mois', 'Tendance des décomptes', 'Courbe des marchés par année'],
  },
  {
    trigger: /^(?:combi|nomb|total|bilan|stat|résu|resu)$/i,
    suggestions: ['Combien de marchés ?', 'Bilan des paiements', 'Résumé des conventions'],
  },
  {
    trigger: /^(?:comp|compar|versus|vs)$/i,
    suggestions: ['Compare les marchés par zone', 'Comparaison des budgets par projet', 'Marchés par fournisseur'],
  },
]

const InstructionInput = ({ onSubmit, isLoading }: InstructionInputProps) => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed && !isLoading) {
      onSubmit(trimmed)
      setValue('')
    }
  }, [value, isLoading, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onSubmit(suggestion)
    setValue('')
    inputRef.current?.focus()
  }, [onSubmit])

  // Match suggestions based on current input
  const matchingSuggestions = useMemo(() => {
    const trimmed = value.trim()
    if (!trimmed || trimmed.length > 20) return []

    for (const { trigger, suggestions } of QUICK_SUGGESTIONS) {
      if (trigger.test(trimmed)) {
        return suggestions
      }
    }
    return []
  }, [value])

  return (
    <Box sx={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.neutral[25],
      borderTop: `1px solid ${colors.border}`,
      px: 3,
      pt: matchingSuggestions.length > 0 ? 1 : 2,
      pb: 2,
      zIndex: 10,
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Suggestion chips */}
        {matchingSuggestions.length > 0 && (
          <Box sx={{
            display: 'flex',
            gap: 0.75,
            mb: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {matchingSuggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  cursor: 'pointer',
                  fontSize: typography.sizes['2xs'],
                  fontWeight: typography.weights.medium,
                  height: 26,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.neutral[200]}`,
                  color: colors.textSecondary,
                  transition: 'all 0.12s ease',
                  '&:hover': {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200],
                    color: colors.primary[700],
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            ))}
          </Box>
        )}

        <Box sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          backgroundColor: colors.surface,
          border: `2px solid ${colors.primary[200]}`,
          borderRadius: borders.radius.xl,
          px: 1.5,
          py: 0.5,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': {
            borderColor: colors.primary[500],
            boxShadow: `0 0 0 3px ${colors.primary[50]}`,
          },
        }}>
          <InputAdornment position="start" sx={{ mb: 1, ml: 0.5 }}>
            <Sparkles className="w-5 h-5" style={{ color: isLoading ? colors.neutral[300] : colors.primary[500] }} />
          </InputAdornment>

          <TextField
            inputRef={inputRef}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez le tableau ou graphique à générer..."
            fullWidth
            multiline
            maxRows={4}
            disabled={isLoading}
            variant="standard"
            sx={{
              '& .MuiInput-root': {
                py: 1,
                '&:before, &:after': { display: 'none' },
              },
              '& .MuiInputBase-input': {
                fontSize: typography.sizes.sm,
                color: colors.textPrimary,
                '&::placeholder': {
                  color: colors.textSecondary,
                  opacity: 1,
                },
              },
            }}
          />

          <IconButton
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="small"
            sx={{
              mb: 0.5,
              backgroundColor: value.trim() ? colors.primary[600] : colors.neutral[200],
              color: colors.textOnColor,
              width: 34,
              height: 34,
              borderRadius: borders.radius.lg,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: value.trim() ? colors.primary[700] : colors.neutral[200],
                transform: value.trim() ? 'scale(1.05)' : 'none',
              },
              '&.Mui-disabled': {
                color: colors.neutral[400],
                backgroundColor: colors.neutral[100],
              },
            }}
          >
            <Send className="w-4 h-4" />
          </IconButton>
        </Box>

        <Typography sx={{
          fontSize: typography.sizes['2xs'],
          color: colors.neutral[400],
          textAlign: 'center',
          mt: 0.75,
        }}>
          Entrée pour générer · Tapez le début d&apos;un mot pour voir des suggestions
        </Typography>
      </Box>
    </Box>
  )
}

export default InstructionInput
