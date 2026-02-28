import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Bell, CheckCheck, FileText, ShoppingCart, Building2,
  Wallet, AlertTriangle, Info, X,
} from 'lucide-react'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'
import { AppNotification, collaborationAPI } from '@/lib/collaborationAPI'

const getNotificationIcon = (icon?: string | null) => {
  switch (icon) {
    case 'convention': return <FileText size={16} />
    case 'marche': return <ShoppingCart size={16} />
    case 'projet': return <Building2 size={16} />
    case 'budget': return <Wallet size={16} />
    case 'warning': return <AlertTriangle size={16} />
    default: return <Info size={16} />
  }
}

const getTypeColor = (type: AppNotification['type']) => {
  switch (type) {
    case 'success': return { bg: colors.success[50], text: colors.success[600] }
    case 'warning': return { bg: colors.warning[50], text: colors.warning[600] }
    case 'error': return { bg: colors.danger[50], text: colors.danger[600] }
    default: return { bg: colors.info[50], text: colors.info[600] }
  }
}

const formatTimeAgo = (dateStr?: string): string => {
  if (!dateStr) return 'Récemment'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'A l\'instant'
  if (minutes < 60) return `Il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

const NotificationCenter = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await collaborationAPI.getNotifications(false)
      setNotifications(response.data.data.slice(0, 50))
    } catch (error) {
      console.error('Erreur notifications:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(async () => {
    await collaborationAPI.markAllNotificationsRead()
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = useCallback(async (id: number) => {
    await collaborationAPI.markNotificationRead(id)
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(prev => !prev)} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: open ? colors.neutral[100] : 'transparent', border: 'none', cursor: 'pointer', borderRadius: borders.radius.base }}>
        <Bell size={18} style={{ color: colors.textSecondary }} />
        {unreadCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, backgroundColor: colors.danger[500], borderRadius: borders.radius.full, border: `2px solid ${colors.surface}` }} />}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 360, maxHeight: 480, backgroundColor: colors.surface, borderRadius: borders.radius.lg, border: `1px solid ${colors.border}`, boxShadow: shadows.lg, overflow: 'hidden', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>Notifications ({unreadCount})</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {unreadCount > 0 && <button onClick={markAllRead} style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><CheckCheck size={16} style={{ color: colors.textSecondary }} /></button>}
              <button onClick={fetchNotifications} style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={16} style={{ color: colors.textSecondary }} /></button>
            </div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: colors.textSecondary, fontSize: typography.sizes.sm }}>Aucune notification</div>
            ) : notifications.map(notif => {
              const typeColor = getTypeColor(notif.type)
              return (
                <button key={notif.id} onClick={() => markRead(notif.id)} style={{ display: 'flex', gap: '10px', width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left', backgroundColor: notif.read ? 'transparent' : colors.primary[25], borderBottom: `1px solid ${colors.divider}`, transition: `background-color ${transitions.fast}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: borders.radius.md, backgroundColor: typeColor.bg, color: typeColor.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{getNotificationIcon(notif.contextType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: typography.sizes.sm, fontWeight: notif.read ? typography.weights.medium : typography.weights.semibold, color: colors.textPrimary }}>{notif.title}</div>
                    <div style={{ fontSize: typography.sizes.xs, color: colors.textSecondary, lineHeight: 1.4 }}>{notif.message}</div>
                    <div style={{ fontSize: typography.sizes['2xs'], color: colors.neutral[400], marginTop: 4 }}>{formatTimeAgo(notif.createdAt)}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
