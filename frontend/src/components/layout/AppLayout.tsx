import { ReactNode, useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { colors, typography, borders, transitions, spacing } from '@/lib/designSystem'
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

/**
 * AppLayout - Main application shell
 * Design: Clean, professional, Confluence/Jira-inspired
 * Orchestrates: Sidebar + Header + Main content area
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const avatarStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textOnColor,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    flexShrink: 0,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: colors.background }}>
      {/* Backdrop overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        width: '100%',
        marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
        transition: `margin-left ${transitions.normal}`,
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div style={{
            padding: `${spacing.md} ${spacing.xl}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: spacing.sm,
                borderRadius: borders.radius.base,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `background-color ${transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[100]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {sidebarOpen && isMobile ? (
                <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: colors.textSecondary }} />
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
              <span style={{
                fontSize: typography.sizes.sm,
                color: colors.textSecondary,
                display: isMobile ? 'none' : 'block',
              }}>
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {/* Mobile: Show only avatar */}
              <div
                className="lg:hidden"
                style={{
                  ...avatarStyle,
                  display: isMobile ? 'flex' : 'none',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{
          padding: isMobile ? spacing.lg : spacing.xl,
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
