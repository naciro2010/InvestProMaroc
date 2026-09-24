import { ReactNode } from 'react'
import { useLayout } from '@/contexts/LayoutContext'
import AppHeader from './AppHeader'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

/**
 * AppLayout - Ossature « Registre » : en-tête bleu nuit collé en haut,
 * menu latéral unique (tiroir sous 900px) et zone de contenu centrée
 * (max 1320px, padding 28px 40px 88px ; 20px 16px 72px sur mobile).
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  const { sidebarOpen, setSidebarOpen, isMobile, isTablet } = useLayout()
  const isDrawer = isMobile || isTablet

  return (
    <div className="app-canvas">
      {/* Skip-to-content : premier élément focusable pour la navigation clavier */}
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>

      <AppHeader />

      <div className="app-body">
        <Sidebar isOpen={isDrawer && sidebarOpen} isDrawer={isDrawer} onClose={() => setSidebarOpen(false)} />

        <main id="main-content" tabIndex={-1} className="app-main">
          <div className="app-main-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
