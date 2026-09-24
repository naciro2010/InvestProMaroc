import { ReactNode } from 'react'
import { tones, ToneKey } from '@/lib/designSystem'

interface AlertBannerProps {
  tone?: ToneKey
  children: ReactNode
  action?: ReactNode
}

/**
 * AlertBanner - Bandeau d'alerte « Registre » : filet gauche 3px du ton,
 * rayon 0 6px 6px 0, fond du ton, 12.5px.
 */
const AlertBanner = ({ tone = 'i', children, action }: AlertBannerProps) => {
  const t = tones[tone]
  return (
    <div
      role={tone === 'e' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        padding: '9px 14px',
        borderLeft: `3px solid ${t.fg}`,
        borderRadius: '0 6px 6px 0',
        background: t.bg,
        color: t.fg,
        fontSize: 12.5,
        lineHeight: 1.45,
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 240px' }}>{children}</div>
      {action}
    </div>
  )
}

export default AlertBanner
