/**
 * InstructionInput - Bottom-fixed chat input bar (Claude-like).
 */

import React, { useState, useRef, useCallback } from 'react'
import { Box, TextField, InputAdornment, IconButton, Typography } from '@mui/material'
import { Send, Sparkles } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

interface InstructionInputProps {
  onSubmit: (instruction: string) => void
  isLoading: boolean
}

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

  return (
    <Box sx={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.neutral[25],
      borderTop: `1px solid ${colors.border}`,
      px: 3,
      py: 2,
      zIndex: 10,
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          backgroundColor: colors.surface,
          border: `2px solid ${colors.primary[200]}`,
          borderRadius: borders.radius.xl,
          px: 1.5,
          py: 0.5,
          transition: 'border-color 0.2s',
          '&:focus-within': {
            borderColor: colors.primary[500],
          },
        }}>
          <InputAdornment position="start" sx={{ mb: 1, ml: 0.5 }}>
            <Sparkles className="w-5 h-5" style={{ color: colors.primary[500] }} />
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

        <Typography sx={{
          fontSize: typography.sizes['2xs'],
          color: colors.neutral[400],
          textAlign: 'center',
          mt: 0.75,
        }}>
          Appuyez sur Entrée pour générer · Exemples : &quot;tableau des marchés par statut&quot;, &quot;top 5 fournisseurs&quot;
        </Typography>
      </Box>
    </Box>
  )
}

export default InstructionInput
