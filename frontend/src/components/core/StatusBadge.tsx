import { getStatusConfig, colors } from '@/lib/designSystem'
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
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: dotColorMap[color] || dotColorMap.neutral,
        flexShrink: 0,
      }}
    />
  )
}

/**
 * StatusBadge - Pastille de statut « Registre ».
 *
 * 11px 600, rayon 999px, bordure 1px, fond/texte/bordure du ton
 * (ok, attention, erreur, info, neutre). Voir `.status-pill` (index.css).
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

  const className = `status-pill status-pill--${config.color}${size === 'small' ? ' status-pill--sm' : ''}`

  return (
    <span className={className}>{displayLabel}</span>
  )
}

export default StatusBadge
