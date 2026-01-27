import { Box, Typography } from '@mui/material'
import { getStatusConfig } from '@/lib/designSystem'
import type { StatusColor } from '@/lib/designSystem'
import { borders, typography } from '@/lib/designSystem'

// ==================== TYPES ====================

interface StatusBadgeProps {
  /** Code du statut (ex: 'BROUILLON', 'VALIDEE', 'EN_COURS') */
  status: string
  /** Label personnalisé (sinon utilise le mapping par défaut) */
  label?: string
  /** Taille */
  size?: 'small' | 'medium'
}

interface StatusDotProps {
  /** Couleur du point */
  color: StatusColor
  /** Taille en pixels */
  size?: number
}

// ==================== COMPOSANTS ====================

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
  const colorMap: Record<StatusColor, string> = {
    success: '#108548',
    warning: '#ab6100',
    danger: '#dd2b0e',
    info: '#1f75cb',
    gray: '#6b7280',
    primary: '#2563eb',
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: colorMap[color] || colorMap.gray,
        flexShrink: 0,
      }}
    />
  )
}

/**
 * StatusBadge - Badge de statut avec couleur sémantique.
 *
 * Affiche le statut d'une entité avec un fond coloré.
 * Utilise le design system pour les couleurs.
 *
 * @example
 * <StatusBadge status="VALIDEE" />
 * <StatusBadge status="BROUILLON" label="Draft" size="small" />
 */
const StatusBadge = ({ status, label, size = 'medium' }: StatusBadgeProps) => {
  const config = getStatusConfig(status)
  const displayLabel = label || config.label

  const sizeStyles = size === 'small'
    ? { px: 1, py: 0.25, fontSize: typography.sizes.xs }
    : { px: 1.5, py: 0.5, fontSize: typography.sizes.sm }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderRadius: borders.radius.base,
        fontWeight: typography.weights.medium,
        whiteSpace: 'nowrap',
        ...sizeStyles,
      }}
    >
      <StatusDot color={config.color} size={size === 'small' ? 6 : 8} />
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
