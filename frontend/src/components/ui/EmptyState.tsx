import React, { ReactNode } from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { InboxIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  children?: ReactNode
}

/**
 * Empty State Component
 * Displayed when a list or data container has no content
 * Provides context and an action button to create new items
 *
 * Usage:
 * <EmptyState
 *   title="No conventions found"
 *   description="Get started by creating your first convention"
 *   action={{
 *     label: 'Create Convention',
 *     onClick: () => navigate('/conventions/new')
 *   }}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        py: 4,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'action.disabled',
          }}
        >
          {icon || <InboxIcon size={64} strokeWidth={1.5} />}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Custom children (can include multiple elements) */}
        {children && <Box>{children}</Box>}

        {/* Action button */}
        {action && (
          <Box sx={{ pt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={action.onClick}
              startIcon={action.icon}
              size="medium"
            >
              {action.label}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default EmptyState
