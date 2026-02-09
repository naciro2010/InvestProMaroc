import { ReactNode } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  details?: string
  icon: ReactNode
  color: string
  bgColor: string
  onClick?: () => void
}

/**
 * StatsCard - Carte KPI epuree.
 * Pas d'accent strip, pas de glow, juste l'essentiel.
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  details,
  icon,
  color,
  bgColor,
  onClick,
}: StatsCardProps) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...componentStyles.statCard,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Stack spacing={1.5}>
        {/* Top row: icon + title */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              ...componentStyles.statCardIcon,
              backgroundColor: bgColor,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: colors.textSecondary,
            }}
          >
            {title}
          </Typography>
        </Stack>

        {/* Value */}
        <Typography
          sx={{
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes['2xl'],
            lineHeight: 1.2,
            color: colors.textPrimary,
          }}
        >
          {value}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Details */}
        {details && (
          <Typography
            sx={{
              fontSize: typography.sizes.xs,
              color: colors.textDisabled,
              pt: 0.5,
            }}
          >
            {details}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export default StatsCard
