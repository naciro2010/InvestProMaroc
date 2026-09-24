import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLayout } from '@/contexts/LayoutContext'
import { useAuth } from '@/contexts/AuthContext'
import { useExecutiveDashboard, selectAlertCount } from '@/hooks/useExecutiveDashboard'
import NotificationCenter from '@/components/core/NotificationCenter'
import { colors, gradients, typography } from '@/lib/designSystem'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administration',
  MANAGER: 'Gestion',
  USER: 'Consultation',
}

/**
 * En-tête d'application « Registre » : bandeau bleu nuit collé en haut,
 * filet laiton, sélecteur d'exercice et accès aux alertes.
 * Publie sa hauteur dans la variable CSS `--app-header-h` (menu collant).
 */
const AppHeader = () => {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { exercice, setExercice, sidebarOpen, toggleSidebar, isMobile, isTablet } = useLayout()
  const { data } = useExecutiveDashboard()
  const alertCount = selectAlertCount(data)
  const isNarrow = isMobile || isTablet

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const publish = () => document.documentElement.style.setProperty('--app-header-h', `${el.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const role = user?.roles?.[0]

  return (
    <div ref={ref} className="app-header" style={{ position: 'sticky', top: 0, zIndex: 1100, boxShadow: `0 1px 0 ${colors.border}, 0 12px 28px -22px rgba(28,42,68,.4)` }}>
      <header
        style={{
          background: gradients.header,
          color: colors.onDark.secondary,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px 28px',
          padding: isNarrow ? '10px 16px' : '12px 28px',
          boxShadow: `inset 0 -1px 0 ${colors.brass.rule}`,
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            className="app-header-burger"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <span /><span /><span />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: colors.onDark.tertiary }}>
              <span style={{ width: 16, height: 1, background: colors.brass.main, flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                InvestPro Maroc · Investissements et commissions
              </span>
            </div>
            <div
              style={{
                fontFamily: typography.fontFamilySerif,
                fontSize: 22,
                fontWeight: 500,
                color: colors.onDark.primary,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Registre des investissements
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span className="app-header-pill">Montants en MAD</span>
              {role && <span className="app-header-pill">{ROLE_LABELS[role] ?? role}</span>}
            </div>
          </div>
        </div>

        <div className="app-header-exercice" role="group" aria-label="Exercice">
          <button type="button" onClick={() => setExercice(exercice - 1)} aria-label="Exercice précédent">
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <span aria-live="polite">Exercice {exercice}</span>
          <button type="button" onClick={() => setExercice(exercice + 1)} aria-label="Exercice suivant">
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationCenter variant="dark" />
          <button
            type="button"
            className="app-header-alerts"
            onClick={() => navigate('/dashboard')}
            aria-label={alertCount > 0 ? `Alertes : ${alertCount} points d'attention` : 'Alertes'}
          >
            Alertes
            {alertCount > 0 && <span className="app-header-alerts-count">{alertCount}</span>}
          </button>
        </div>
      </header>
    </div>
  )
}

export default AppHeader
