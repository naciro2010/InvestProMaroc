import { ReactNode } from 'react'
import { Card, CardContent, Stack, Box, Typography, Chip } from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'

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
 * Modern stats card component following GCP/GitLab design
 * - Clean white background with subtle border
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
        border: '1px solid',
        borderColor: '#e5e7eb',
        boxShadow: 'none',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              borderColor: '#d1d5db',
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
                  bgcolor: trendDirection === 'up' ? '#dcfce7' : '#fee2e2',
                  color: trendDirection === 'up' ? '#166534' : '#991b1b',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: trendDirection === 'up' ? '#166534' : '#991b1b',
                    fontSize: 14,
                  },
                }}
              />
            )}
          </Stack>

          {/* Title */}
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#111827',
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
              sx={{
                color: '#9ca3af',
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
              sx={{
                color: '#6b7280',
                fontSize: '0.75rem',
                pt: 1,
                borderTop: '1px solid #f3f4f6',
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
