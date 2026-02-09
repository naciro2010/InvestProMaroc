import { ReactNode } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { colors, typography } from '@/lib/designSystem'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

/**
 * PageHeader (common) - Simple page header using design system tokens.
 * Used primarily on the Dashboard and other pages that don't need breadcrumbs.
 *
 * For pages needing breadcrumbs/status, use the core PageHeader instead.
 */
const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: subtitle ? 0.5 : 0,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontSize: typography.sizes.base,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Stack>
    </Box>
  )
}

export default PageHeader
