import { Box, Typography, Button } from '@mui/material'
import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { colors, typography, spacing, componentStyles } from '@/lib/designSystem'

// ==================== TYPES ====================

interface EmptyStateProps {
  /** Custom icon (Lucide). Defaults to SearchX when filtered, nothing otherwise. */
  icon?: ReactNode
  /** Main title, e.g. "Aucune convention trouv\u00e9e" */
  title: string
  /** Optional description below the title */
  description?: string
  /** Label for the optional action button */
  actionLabel?: string
  /** Callback for the action button */
  onAction?: () => void
  /** If true, shows a filtered-search message instead of custom description */
  filtered?: boolean
}

// ==================== COMPONENT ====================

/**
 * EmptyState - Centered placeholder for empty list pages.
 *
 * Shows a title, optional icon, description, and action button.
 * When `filtered` is true, displays a search-specific message
 * with a SearchX icon.
 *
 * @example
 * <EmptyState
 *   title="Aucune convention trouv\u00e9e"
 *   description="Cr\u00e9ez votre premi\u00e8re convention pour commencer."
 *   actionLabel="Nouvelle Convention"
 *   onAction={() => navigate('/conventions/new')}
 * />
 *
 * @example
 * <EmptyState title="Aucun r\u00e9sultat" filtered />
 */
const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  filtered = false,
}: EmptyStateProps) => {
  const displayIcon = filtered ? <SearchX size={64} /> : icon
  const displayDescription = filtered
    ? 'Aucun r\u00e9sultat pour votre recherche. Essayez avec d\u2019autres crit\u00e8res.'
    : description

  return (
    <Box sx={componentStyles.emptyState}>
      {displayIcon && (
        <Box sx={{ color: colors.neutral[300], mb: spacing.mui.lg }}>
          {displayIcon}
        </Box>
      )}

      <Typography
        sx={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: colors.gray[700],
          mb: displayDescription ? spacing.mui.sm : 0,
        }}
      >
        {title}
      </Typography>

      {displayDescription && (
        <Typography
          sx={{
            fontSize: typography.sizes.base,
            color: colors.gray[500],
            maxWidth: 400,
            mx: 'auto',
            lineHeight: typography.lineHeights.normal,
          }}
        >
          {displayDescription}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          sx={{ ...componentStyles.buttonPrimary, mt: spacing.mui['2xl'] }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export default EmptyState
