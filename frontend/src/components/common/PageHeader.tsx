import { ReactNode } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import colors from '@/theme/colors'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

/**
 * Clean page header component following GCP/GitLab design
 * - No gradients, no flashy colors
 * - Simple typography hierarchy
 * - Generous spacing
 * - Optional action buttons on the right
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
              fontWeight: 600,
              color: colors.gray[900],
              mb: subtitle ? 0.5 : 0,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: colors.gray[600] }}>
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
