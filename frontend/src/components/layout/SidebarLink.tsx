import { Link } from 'react-router-dom'
import { colors, typography, transitions, borders } from '@/lib/designSystem'

interface SidebarLinkProps {
  path: string
  icon: React.ReactElement
  label: string
  isActive: (path: string) => boolean
  indent?: boolean
  badge?: string
  onNavigate?: () => void
}

const SidebarLink = ({ path, icon, label, isActive, indent, badge, onNavigate }: SidebarLinkProps) => {
  const active = isActive(path)
  return (
    <Link
      to={path}
      onClick={onNavigate}
      role="menuitem"
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: indent ? '7px 16px 7px 36px' : '7px 16px',
        minHeight: '34px',
        color: active ? colors.primary[700] : colors.textSecondary,
        fontSize: typography.sizes.sm,
        fontWeight: active ? typography.weights.semibold : typography.weights.medium,
        textDecoration: 'none',
        transition: `all ${transitions.fast}`,
        borderLeft: active ? `3px solid ${colors.primary[600]}` : '3px solid transparent',
        backgroundColor: active ? colors.primary[25] : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) { e.currentTarget.style.backgroundColor = colors.neutral[50]; e.currentTarget.style.color = colors.textPrimary }
      }}
      onMouseLeave={(e) => {
        if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.textSecondary }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '1px 6px', backgroundColor: colors.neutral[100],
          color: colors.neutral[500], fontSize: typography.sizes['2xs'],
          fontWeight: typography.weights.medium, borderRadius: borders.radius.full,
        }}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export default SidebarLink
export type { SidebarLinkProps }
