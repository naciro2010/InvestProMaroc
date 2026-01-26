import { ReactNode } from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs'

interface PageHeaderOdooProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  status?: {
    label: string
    color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  }
  actions?: ReactNode
}

/**
 * Odoo-style Page Header Component
 *
 * Clean, professional page header following Odoo design principles:
 * - Breadcrumbs at top (always visible for navigation hierarchy)
 * - Title with optional status badge
 * - Subtitle for additional context
 * - Action buttons grouped on the right
 * - No gradients, no emojis, no flashy effects
 * - White background with subtle bottom border
 * - Generous, consistent spacing (8px base)
 */
const PageHeaderOdoo = ({
  title,
  subtitle,
  breadcrumbs,
  status,
  actions,
}: PageHeaderOdooProps) => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        px: 3,
        py: 2,
        mb: 3,
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Title Row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        {/* Title + Status */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            {status && (
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                sx={{
                  fontWeight: 500,
                  fontSize: 12,
                }}
              />
            )}
          </Stack>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions && (
          <Box>
            <Stack direction="row" spacing={1}>
              {actions}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default PageHeaderOdoo
