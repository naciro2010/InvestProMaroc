import { ReactNode } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  details?: string
  icon: ReactNode
  color: string
  bgColor: string
  trend?: string
  trendDirection?: 'up' | 'down'
  onClick?: () => void
}

/**
 * StatsCard - Carte KPI moderne avec design system.
 *
 * Principes:
 * - Accent coloré à gauche
 * - Icône dans cercle avec fond pastel
 * - Valeur large comme point focal
 * - Badge de tendance optionnel
 * - Hover subtil avec élévation
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  details,
  icon,
  color,
  bgColor,
  trend,
  trendDirection = 'up',
  onClick,
}: StatsCardProps) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...componentStyles.statCard,
        cursor: onClick ? 'pointer' : 'default',
        pl: 4,
      }}
    >
      {/* Left accent strip */}
      <Box
        sx={{
          ...componentStyles.statCardAccent,
          backgroundColor: color,
        }}
      />

      <Stack spacing={2}>
        {/* Top row: icon + trend */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box
            sx={{
              ...componentStyles.statCardIcon,
              backgroundColor: bgColor,
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box
              sx={trendDirection === 'up'
                ? componentStyles.trendBadgeUp
                : componentStyles.trendBadgeDown
              }
            >
              {trendDirection === 'up'
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />
              }
              {trend}
            </Box>
          )}
        </Stack>

        {/* Title */}
        <Typography
          sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.textSecondary,
            letterSpacing: typography.letterSpacing.wide,
            textTransform: 'uppercase' as const,
          }}
        >
          {title}
        </Typography>

        {/* Value */}
        <Typography
          sx={{
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes['3xl'],
            lineHeight: 1,
            color: colors.textPrimary,
            letterSpacing: typography.letterSpacing.tight,
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

        {/* Details separator + text */}
        {details && (
          <Box sx={{
            pt: 1.5,
            borderTop: `1px solid ${colors.divider}`,
          }}>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
              }}
            >
              {details}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default StatsCard
