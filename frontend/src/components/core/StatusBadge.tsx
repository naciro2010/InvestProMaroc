import { Box, Typography } from '@mui/material'
import { getStatusConfig, colors, borders, typography } from '@/lib/designSystem'
import type { StatusColor } from '@/lib/designSystem'

// ==================== TYPES ====================

interface StatusBadgeProps {
  /** Code du statut (ex: 'BROUILLON', 'VALIDEE', 'EN_COURS') */
  status: string
  /** Label personnalisé (sinon utilise le mapping par défaut) */
  label?: string
  /** Taille */
  size?: 'small' | 'medium'
  /** Afficher uniquement le point sans label */
  dotOnly?: boolean
}

interface StatusDotProps {
  /** Couleur du point */
  color: StatusColor
  /** Taille en pixels */
  size?: number
}

// ==================== COMPOSANTS ====================

// Color mapping using design system tokens
const dotColorMap: Record<StatusColor, string> = {
  success: colors.success[500],
  warning: colors.warning[500],
  danger: colors.danger[500],
  info: colors.info[500],
  neutral: colors.neutral[400],
  primary: colors.primary[500],
  purple: colors.purple[500],
}

/**
 * StatusDot - Point de couleur pour indiquer un statut.
 *
 * Petit indicateur visuel minimaliste.
 * A utiliser dans les listes/tables pour un aperçu rapide.
 *
 * @example
 * <StatusDot color="success" />
 * <StatusDot color="warning" size={10} />
 */
export const StatusDot = ({ color, size = 8 }: StatusDotProps) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: borders.radius.full,
        backgroundColor: dotColorMap[color] || dotColorMap.neutral,
        flexShrink: 0,
      }}
    />
  )
}

/**
 * StatusBadge - Badge de statut avec couleur sémantique.
 *
 * Design: Atlassian-style status lozenges (flat, colored background)
 * Affiche le statut d'une entité avec un fond coloré.
 * Utilise le design system pour les couleurs.
 *
 * @example
 * <StatusBadge status="VALIDEE" />
 * <StatusBadge status="BROUILLON" label="Draft" size="small" />
 * <StatusBadge status="EN_COURS" dotOnly />
 */
const StatusBadge = ({ status, label, size = 'medium', dotOnly = false }: StatusBadgeProps) => {
  const config = getStatusConfig(status)
  const displayLabel = label || config.label

  // If dotOnly, just show the dot
  if (dotOnly) {
    return <StatusDot color={config.color} size={size === 'small' ? 6 : 8} />
  }

  const sizeStyles = size === 'small'
    ? {
        px: 1,
        py: 0.25,
        fontSize: typography.sizes.xs,
        gap: 0.5,
      }
    : {
        px: 1.5,
        py: 0.5,
        fontSize: typography.sizes.sm,
        gap: 0.75,
      }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderRadius: borders.radius.sm,
        fontWeight: typography.weights.medium,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...sizeStyles,
      }}
    >
      <Box
        sx={{
          width: size === 'small' ? 6 : 8,
          height: size === 'small' ? 6 : 8,
          borderRadius: borders.radius.full,
          backgroundColor: config.dotColor,
          flexShrink: 0,
        }}
      />
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          lineHeight: 1,
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  )
}

export default StatusBadge
