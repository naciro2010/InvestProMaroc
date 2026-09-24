import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  USER: 'Utilisateur',
}

const initialsOf = (name?: string): string =>
  name?.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

/** Ouvre l'aide des raccourcis (KeyboardShortcutsHelp écoute Ctrl+/). */
const openShortcutsHelp = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true }))

interface SidebarFooterProps {
  onNavigate?: () => void
}

/** Pied du menu : avatar, nom et rôle (menu profil), bouton d'aide « ? ». */
const SidebarFooter = ({ onNavigate }: SidebarFooterProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
    onNavigate?.()
  }

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const role = user?.roles?.[0] ?? 'USER'

  return (
    <div className="nav-footer" ref={ref}>
      <button
        type="button"
        className="nav-footer-user"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="nav-avatar" aria-hidden="true">{initialsOf(user?.fullName)}</span>
        <span style={{ minWidth: 0 }}>
          <span className="nav-footer-name">{user?.fullName || 'Utilisateur'}</span>
          <span className="nav-footer-role">{ROLE_LABELS[role] ?? role}</span>
        </span>
      </button>
      <button type="button" className="nav-help" onClick={openShortcutsHelp} aria-label="Aide et raccourcis clavier" title="Aide et raccourcis (Ctrl+/)">
        ?
      </button>

      {open && (
        <div className="nav-user-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => go('/profile')}>
            <User size={16} strokeWidth={1.75} aria-hidden="true" /> Mon profil
          </button>
          <button type="button" role="menuitem" onClick={() => go('/parametrage/conventions')}>
            <Settings size={16} strokeWidth={1.75} aria-hidden="true" /> Paramètres
          </button>
          <hr />
          <button type="button" role="menuitem" className="is-danger" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

export default SidebarFooter
