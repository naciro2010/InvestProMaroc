import { Link, useLocation } from 'react-router-dom'
import { useRecentRecords } from '@/hooks/useRecentRecords'

interface SidebarRecentsProps {
  onNavigate?: () => void
}

/** « Consultés récemment » : 4 dernières conventions ou marchés ouverts. */
const SidebarRecents = ({ onNavigate }: SidebarRecentsProps) => {
  const records = useRecentRecords()
  const { pathname } = useLocation()

  return (
    <div className="nav-recents">
      <div className="nav-recents-title">Consultés récemment</div>
      {records.length === 0 ? (
        <div className="nav-empty">Les fiches ouvertes apparaîtront ici.</div>
      ) : (
        records.map(r => (
          <Link
            key={r.key}
            to={r.path}
            className="nav-recent"
            aria-current={pathname === r.path ? 'page' : undefined}
            onClick={onNavigate}
            title={`${r.code} — ${r.label}`}
          >
            <strong>{r.code}</strong>
            <span>{r.label}</span>
          </Link>
        ))
      )}
    </div>
  )
}

export default SidebarRecents
