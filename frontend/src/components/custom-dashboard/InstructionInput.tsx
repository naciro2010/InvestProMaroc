/**
 * InstructionInput - Text input with autocomplete suggestions and example chips.
 */

import React, { useState, useRef, useCallback } from 'react'
import {
  Box, TextField, Typography, Chip, InputAdornment, IconButton,
  Collapse, Paper,
} from '@mui/material'
import { Send, Sparkles, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import { EXAMPLE_INSTRUCTIONS } from './instructionParser'

interface InstructionInputProps {
  onSubmit: (instruction: string) => void
  isLoading: boolean
}

const InstructionInput = ({ onSubmit, isLoading }: InstructionInputProps) => {
  const [value, setValue] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed && !isLoading) {
      onSubmit(trimmed)
    }
  }, [value, isLoading, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleExampleClick = (text: string) => {
    setValue(text)
    onSubmit(text)
    setShowExamples(false)
  }

  // Group examples by category
  const categories = Array.from(new Set(EXAMPLE_INSTRUCTIONS.map((e) => e.category)))

  return (
    <Box>
      {/* Main input */}
      <Paper sx={{
        ...componentStyles.card,
        p: 0,
        overflow: 'hidden',
        border: `2px solid ${colors.primary[200]}`,
        '&:focus-within': {
          borderColor: colors.primary[500],
        },
      }}>
        <TextField
          inputRef={inputRef}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Décrivez le tableau ou graphique que vous souhaitez générer..."
          fullWidth
          multiline
          maxRows={3}
          disabled={isLoading}
          variant="standard"
          sx={{
            '& .MuiInput-root': {
              p: 2,
              pb: 1,
              '&:before, &:after': { display: 'none' },
            },
            '& .MuiInputBase-input': {
              fontSize: typography.sizes.base,
              color: colors.textPrimary,
              '&::placeholder': {
                color: colors.textSecondary,
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 1, mt: '2px !important', alignSelf: 'flex-start' }}>
                <Sparkles className="w-5 h-5" style={{ color: colors.primary[500] }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Action bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderTop: `1px solid ${colors.neutral[100]}`,
          backgroundColor: colors.neutral[25],
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <button
              onClick={() => setShowExamples(!showExamples)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: typography.sizes.xs,
                color: colors.primary[600],
                backgroundColor: colors.primary[50],
                border: `1px solid ${colors.primary[200]}`,
                borderRadius: borders.radius.full,
                cursor: 'pointer',
                fontWeight: typography.weights.medium,
              }}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Exemples
              {showExamples
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />
              }
            </button>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              Appuyez sur Entrée pour générer
            </Typography>
          </Box>

          <IconButton
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="small"
            sx={{
              backgroundColor: value.trim() ? colors.primary[600] : colors.neutral[200],
              color: colors.textOnColor,
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: value.trim() ? colors.primary[700] : colors.neutral[200],
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
      </Paper>

      {/* Examples panel */}
      <Collapse in={showExamples}>
        <Paper sx={{
          ...componentStyles.card,
          mt: 1,
          p: 2.5,
        }}>
          {categories.map((category) => (
            <Box key={category} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
              <Typography sx={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 1,
              }}>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {EXAMPLE_INSTRUCTIONS
                  .filter((e) => e.category === category)
                  .map((example) => (
                    <Chip
                      key={example.text}
                      label={example.text}
                      size="small"
                      onClick={() => handleExampleClick(example.text)}
                      sx={{
                        fontSize: typography.sizes.xs,
                        color: colors.textPrimary,
                        backgroundColor: colors.neutral[50],
                        border: `1px solid ${colors.neutral[200]}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: colors.primary[50],
                          borderColor: colors.primary[300],
                          color: colors.primary[700],
                        },
                      }}
                    />
                  ))}
              </Box>
            </Box>
          ))}
        </Paper>
      </Collapse>
    </Box>
  )
}

export default InstructionInput
