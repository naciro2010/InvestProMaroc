import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { colors, typography, borders, transitions, shadows } from '@/lib/designSystem'

const SidebarUserMenu = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ borderTop: `1px solid ${colors.border}`, padding: '8px' }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 10px', borderRadius: borders.radius.base,
            cursor: 'pointer', backgroundColor: 'transparent', border: 'none',
            textAlign: 'left', transition: `background-color ${transitions.fast}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.neutral[50] }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <div style={{
            width: 30, height: 30, backgroundColor: colors.primary[600],
            borderRadius: borders.radius.full, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: colors.textOnColor,
            fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, flexShrink: 0,
          }}>
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              margin: 0, fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium, color: colors.textPrimary,
            }}>
              {user?.fullName || 'User'}
            </p>
            <p style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              margin: 0, fontSize: typography.sizes.xs, color: colors.textSecondary,
            }}>
              {user?.email || ''}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: colors.textSecondary, flexShrink: 0 }} />
        </button>

        {userMenuOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            marginBottom: '4px', backgroundColor: colors.surface,
            borderRadius: borders.radius.lg, border: `1px solid ${colors.border}`,
            boxShadow: shadows.lg, overflow: 'hidden',
          }}>
            <DropdownItem icon={<User className="w-4 h-4" />} label="Mon profil" onClick={() => { navigate('/profile'); setUserMenuOpen(false) }} />
            <DropdownItem icon={<Settings className="w-4 h-4" />} label="Parametres" onClick={() => { navigate('/parametrage/conventions'); setUserMenuOpen(false) }} />
            <div style={{ height: '1px', backgroundColor: colors.divider }} />
            <DropdownItem icon={<LogOut className="w-4 h-4" />} label="Deconnexion" onClick={() => { handleLogout(); setUserMenuOpen(false) }} danger />
          </div>
        )}
      </div>
    </div>
  )
}

interface DropdownItemProps {
  icon: React.ReactElement
  label: string
  onClick: () => void
  danger?: boolean
}

const DropdownItem = ({ icon, label, onClick, danger }: DropdownItemProps) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
      padding: '8px 16px', backgroundColor: 'transparent', border: 'none',
      cursor: 'pointer', textAlign: 'left',
      fontSize: typography.sizes.sm,
      color: danger ? colors.danger[600] : colors.textPrimary,
      transition: `background-color ${transitions.fast}`,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = danger ? colors.danger[50] : colors.neutral[50] }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
  >
    <span style={{ color: danger ? undefined : colors.textSecondary, display: 'flex' }}>{icon}</span>
    <span>{label}</span>
  </button>
)

export default SidebarUserMenu
