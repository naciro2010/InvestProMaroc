import { ReactNode } from 'react'
import { Box, Typography, Divider } from '@mui/material'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  divider?: boolean
}

/**
 * Odoo-style Form Section Component
 *
 * Clean section divider for forms and detail pages:
 * - Section title with optional description
 * - Optional divider line
 * - Generous spacing (8px base)
 * - No backgrounds, no borders (just clean separation)
 * - Typography hierarchy for readability
 */
const FormSection = ({
  title,
  description,
  children,
  divider = true,
}: FormSectionProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: description ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Divider */}
      {divider && <Divider sx={{ mb: 3 }} />}

      {/* Content */}
      <Box>{children}</Box>
    </Box>
  )
}

export default FormSection
