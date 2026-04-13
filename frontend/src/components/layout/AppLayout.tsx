import { ReactNode } from 'react'
import { Menu, ChevronRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useLayout } from '@/contexts/LayoutContext'
import { colors, borders, transitions } from '@/lib/designSystem'
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/conventions': 'Conventions',
  '/marches': 'Marchés',
  '/decomptes': 'Décomptes',
  '/paiements': 'Paiements',
  '/ordres-paiement': 'Ordres de paiement',
  '/projets': 'Projets',
  '/budgets': 'Budgets',
  '/fournisseurs': 'Fournisseurs',
  '/commissions': 'Commissions',
  '/users': 'Utilisateurs',
  '/profile': 'Profil',
  '/messagerie': 'Messagerie',
  '/generateur': 'Générateur',
}

interface AppLayoutProps {
  children: ReactNode
}

/**
 * AppLayout - Clean ERP-inspired application shell.
 * No header bar - content goes edge-to-edge, ControlPanel serves as page header.
 * Mobile: sticky top bar with hamburger button to open sidebar.
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar, isMobile, isTablet } = useLayout()
  const location = useLocation()
  const isCompact = isMobile || isTablet

  const getPageTitle = () => {
    const path = location.pathname
    const baseRoute = '/' + path.split('/').filter(Boolean)[0]
    return ROUTE_LABELS[path] || ROUTE_LABELS[baseRoute] || ''
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: colors.background }}>
      {/* Mobile/tablet backdrop */}
      {isCompact && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          onTouchEnd={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 30,
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} isMobile={isCompact} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div style={{
        flex: 1,
        width: '100%',
        marginLeft: isCompact ? 0 : SIDEBAR_WIDTH,
        transition: `margin-left ${transitions.normal}`,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Mobile top bar with hamburger - always visible on compact */}
        {isCompact && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}>
            <button
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: borders.radius.base,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <Menu className="w-5 h-5" style={{ color: colors.textPrimary }} />
            </button>
            <span style={{
              marginLeft: 12,
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: colors.textPrimary,
            }}>
              InvestPro
            </span>
            {getPageTitle() && (
              <span style={{ display: 'flex', alignItems: 'center', marginLeft: 8, color: colors.textSecondary }}>
                <ChevronRight size={14} />
                <span style={{ marginLeft: 4, fontSize: '0.8125rem', fontWeight: 500 }}>
                  {getPageTitle()}
                </span>
              </span>
            )}
          </div>
        )}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AppLayout
