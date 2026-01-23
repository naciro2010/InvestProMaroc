import { ReactNode } from 'react'
import { Card, CardContent, Stack, Box, Typography, Chip } from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'
import colors from '@/theme/colors'

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
 * Modern stats card component with dark mode support
 * - Adapts colors based on theme mode
 * - Icon in colored circle with pastel background
 * - Large number as focal point
 * - Optional trend indicator
 * - Subtle hover state
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
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-2px)',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Icon & Trend */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              {icon}
            </Box>
            {trend && (
              <Chip
                icon={
                  trendDirection === 'up' ? (
                    <ArrowUpward sx={{ fontSize: 14 }} />
                  ) : (
                    <ArrowDownward sx={{ fontSize: 14 }} />
                  )
                }
                label={trend}
                size="small"
                sx={{
                  bgcolor: trendDirection === 'up' ? colors.success[100] : colors.danger[100],
                  color: trendDirection === 'up' ? colors.success[700] : colors.danger[700],
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: trendDirection === 'up' ? colors.success[700] : colors.danger[700],
                    fontSize: 14,
                  },
                }}
              />
            )}
          </Stack>

          {/* Title */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h3"
            color="text.primary"
            sx={{
              fontWeight: 700,
              fontSize: '2rem',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Details */}
          {details && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                pt: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              {details}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default StatsCard
