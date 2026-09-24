import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

interface CreateAction {
  label: string
  hint: string
  path: string
}

const CREATE_ACTIONS: CreateAction[] = [
  { label: 'Nouvelle convention', hint: 'Assistant en 5 étapes', path: '/conventions/nouvelle' },
  { label: 'Nouveau marché', hint: 'Informations, prix, imputations', path: '/marches/nouveau' },
  { label: 'Nouveau décompte', hint: 'Montants et retenues', path: '/decomptes/nouveau' },
]

interface SidebarCreateMenuProps {
  onNavigate?: () => void
}

/** Bouton « + Créer » du menu : liste déroulante des assistants de création. */
const SidebarCreateMenu = ({ onNavigate }: SidebarCreateMenuProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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

  return (
    <div className="nav-create" ref={ref}>
      <button
        type="button"
        className="nav-create-btn"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Créer
      </button>
      {open && (
        <div className="nav-create-menu" role="menu">
          {CREATE_ACTIONS.map(a => (
            <button key={a.path} type="button" role="menuitem" className="nav-create-item" onClick={() => go(a.path)}>
              <strong>{a.label}</strong>
              <small>{a.hint}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SidebarCreateMenu
