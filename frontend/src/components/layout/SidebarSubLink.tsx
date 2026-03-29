import { Link, useSearchParams } from 'react-router-dom'
import { colors, typography, transitions } from '@/lib/designSystem'

interface SidebarSubLinkProps {
  path: string
  label: string
  isParentActive: boolean
  onNavigate?: () => void
}

const SidebarSubLink = ({ path, label, isParentActive, onNavigate }: SidebarSubLinkProps) => {
  const [searchParams] = useSearchParams()

  // Extract section param from this link's path
  const url = new URL(path, 'http://x')
  const linkSection = url.searchParams.get('section')
  const currentSection = searchParams.get('section')

  const active = isParentActive && currentSection === linkSection

  return (
    <Link
      to={path}
      onClick={onNavigate}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '5px 16px 5px 52px',
        minHeight: '28px',
        color: active ? colors.primary[700] : colors.neutral[400],
        fontSize: typography.sizes.xs,
        fontWeight: active ? typography.weights.semibold : typography.weights.medium,
        textDecoration: 'none',
        transition: `all ${transitions.fast}`,
        backgroundColor: active ? colors.primary[25] : 'transparent',
        borderLeft: '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.backgroundColor = colors.neutral[50] }
      }}
      onMouseLeave={(e) => {
        if (!active) { e.currentTarget.style.color = colors.neutral[400]; e.currentTarget.style.backgroundColor = 'transparent' }
      }}
    >
      <span style={{ position: 'relative', paddingLeft: '12px' }}>
        <span style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: active ? colors.primary[600] : colors.neutral[300],
        }} />
        {label}
      </span>
    </Link>
  )
}

export default SidebarSubLink
