/**
 * WelcomeSplash - Claude-like welcome screen with suggestion chips.
 */

import { Box, Typography, Chip } from '@mui/material'
import { Sparkles, BarChart3, Table2, PieChart as PieIcon, TrendingUp } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'
import { EXAMPLE_INSTRUCTIONS } from './instructionParser'

interface WelcomeSplashProps {
  onSuggestionClick: (text: string) => void
}

const ICON_MAP: Record<string, React.ReactNode> = {
  table: <Table2 className="w-3.5 h-3.5" />,
  bar: <BarChart3 className="w-3.5 h-3.5" />,
  pie: <PieIcon className="w-3.5 h-3.5" />,
  line: <TrendingUp className="w-3.5 h-3.5" />,
  kpi: <Sparkles className="w-3.5 h-3.5" />,
}

const WelcomeSplash = ({ onSuggestionClick }: WelcomeSplashProps) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 3,
      flex: 1,
      minHeight: 400,
    }}>
      {/* Logo / Icon */}
      <Box sx={{
        width: 64,
        height: 64,
        borderRadius: borders.radius.xl,
        backgroundColor: colors.primary[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
      }}>
        <Sparkles className="w-8 h-8" style={{ color: colors.primary[600] }} />
      </Box>

      {/* Title */}
      <Typography sx={{
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        mb: 1,
        textAlign: 'center',
      }}>
        Générateur de Dashboard
      </Typography>

      {/* Subtitle */}
      <Typography sx={{
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 460,
        mb: 4,
        lineHeight: 1.6,
      }}>
        Décrivez en français ce que vous souhaitez visualiser.
        Le système analyse votre instruction et génère automatiquement le tableau ou graphique correspondant.
      </Typography>

      {/* Suggestion chips */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1,
        maxWidth: 600,
      }}>
        {EXAMPLE_INSTRUCTIONS.map((example) => (
          <Chip
            key={example.text}
            icon={ICON_MAP[example.icon] as React.ReactElement}
            label={example.text}
            onClick={() => onSuggestionClick(example.text)}
            sx={{
              fontSize: typography.sizes.xs,
              color: colors.textPrimary,
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: borders.radius.full,
              cursor: 'pointer',
              px: 0.5,
              '&:hover': {
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[300],
                color: colors.primary[700],
              },
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default WelcomeSplash
