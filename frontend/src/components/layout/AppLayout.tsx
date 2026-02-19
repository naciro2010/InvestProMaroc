import { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { useLayout } from '@/contexts/LayoutContext'
import { colors, borders, transitions, shadows } from '@/lib/designSystem'
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

/**
 * AppLayout - Clean ERP-inspired application shell.
 * No header bar - content goes edge-to-edge, ControlPanel serves as page header.
 * Mobile: floating hamburger button to open sidebar.
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar, isMobile, isTablet } = useLayout()
  const isCompact = isMobile || isTablet

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: colors.background }}>
      {/* Mobile/tablet backdrop */}
      {isCompact && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 30 }}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} isMobile={isCompact} onClose={() => setSidebarOpen(false)} />

      {/* Mobile hamburger - floating button */}
      {isCompact && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 50,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borders.radius.base,
            boxShadow: shadows.md,
            cursor: 'pointer',
            transition: `background-color ${transitions.fast}`,
          }}
        >
          <Menu className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </button>
      )}

      {/* Main content - no header, no padding */}
      <div style={{
        flex: 1,
        width: '100%',
        marginLeft: isCompact ? 0 : SIDEBAR_WIDTH,
        transition: `margin-left ${transitions.normal}`,
        minHeight: '100vh',
      }}>
        {children}
      </div>
    </div>
  )
}

export default AppLayout
