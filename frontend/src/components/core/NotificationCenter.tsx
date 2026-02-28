import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Bell, Check, CheckCheck, FileText, ShoppingCart, Building2,
  Wallet, AlertTriangle, Info, X,
} from 'lucide-react'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  icon?: string
  timestamp: Date
  read: boolean
}

const STORAGE_KEY = 'investpro_notifications'

const getStoredNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Array<Notification & { timestamp: string }>
      return parsed.map(n => ({ ...n, timestamp: new Date(n.timestamp) }))
    }
  } catch { /* ignore */ }
  return getDefaultNotifications()
}

const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch { /* ignore */ }
}

function getDefaultNotifications(): Notification[] {
  const now = new Date()
  return [
    {
      id: '1',
      title: 'Bienvenue sur InvestPro',
      message: 'Explorez le dashboard pour une vue d\'ensemble de vos investissements.',
      type: 'info',
      icon: 'info',
      timestamp: new Date(now.getTime() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: '2',
      title: 'Raccourcis clavier',
      message: 'Appuyez sur Ctrl+K pour la recherche rapide et Ctrl+/ pour les raccourcis.',
      type: 'info',
      icon: 'info',
      timestamp: new Date(now.getTime() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: '3',
      title: 'Nouvelles fonctionnalites',
      message: 'Recherche rapide, centre de notifications et raccourcis clavier disponibles.',
      type: 'success',
      icon: 'success',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60),
      read: false,
    },
  ]
}

const getNotificationIcon = (icon?: string) => {
  switch (icon) {
    case 'convention': return <FileText size={16} />
    case 'marche': return <ShoppingCart size={16} />
    case 'projet': return <Building2 size={16} />
    case 'budget': return <Wallet size={16} />
    case 'warning': return <AlertTriangle size={16} />
    case 'success': return <Check size={16} />
    default: return <Info size={16} />
  }
}

const getTypeColor = (type: Notification['type']) => {
  switch (type) {
    case 'success': return { bg: colors.success[50], text: colors.success[600], dot: colors.success[500] }
    case 'warning': return { bg: colors.warning[50], text: colors.warning[600], dot: colors.warning[500] }
    case 'error': return { bg: colors.danger[50], text: colors.danger[600], dot: colors.danger[500] }
    default: return { bg: colors.info[50], text: colors.info[600], dot: colors.info[500] }
  }
}

const formatTimeAgo = (date: Date): string => {
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
  const [notifications, setNotifications] = useState<Notification[]>(getStoredNotifications)
  const panelRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Listen for custom notification events
  useEffect(() => {
    const handleNotification = (e: CustomEvent<{ title: string; message: string; type: Notification['type']; icon?: string }>) => {
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: e.detail.title,
        message: e.detail.message,
        type: e.detail.type,
        icon: e.detail.icon,
        timestamp: new Date(),
        read: false,
      }
      setNotifications(prev => {
        const updated = [newNotif, ...prev].slice(0, 50)
        saveNotifications(updated)
        return updated
      })
    }
    window.addEventListener('investpro-notification', handleNotification as EventListener)
    return () => window.removeEventListener('investpro-notification', handleNotification as EventListener)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveNotifications(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    saveNotifications([])
  }, [])

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'relative', display: 'flex', alignItems: 'center',
          justifyContent: 'center', width: 34, height: 34,
          backgroundColor: open ? colors.neutral[100] : 'transparent',
          border: 'none', cursor: 'pointer',
          borderRadius: borders.radius.base,
          transition: `background-color ${transitions.fast}`,
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.backgroundColor = colors.neutral[50] }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <Bell size={18} style={{ color: colors.textSecondary }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8,
            backgroundColor: colors.danger[500],
            borderRadius: borders.radius.full,
            border: `2px solid ${colors.surface}`,
          }} />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          width: 360, maxHeight: 480,
          backgroundColor: colors.surface,
          borderRadius: borders.radius.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.lg,
          overflow: 'hidden', zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${colors.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
              }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  padding: '1px 7px',
                  backgroundColor: colors.primary[100],
                  color: colors.primary[700],
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                  borderRadius: borders.radius.full,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Marquer tout comme lu"
                  style={{
                    padding: '4px', backgroundColor: 'transparent', border: 'none',
                    cursor: 'pointer', borderRadius: borders.radius.sm, display: 'flex',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.neutral[100] }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <CheckCheck size={16} style={{ color: colors.textSecondary }} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Effacer tout"
                  style={{
                    padding: '4px', backgroundColor: 'transparent', border: 'none',
                    cursor: 'pointer', borderRadius: borders.radius.sm, display: 'flex',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.neutral[100] }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <X size={16} style={{ color: colors.textSecondary }} />
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '32px 16px', textAlign: 'center',
                color: colors.textSecondary, fontSize: typography.sizes.sm,
              }}>
                <Bell size={32} style={{ color: colors.neutral[300], marginBottom: 8 }} />
                <div>Aucune notification</div>
              </div>
            ) : (
              notifications.map(notif => {
                const typeColor = getTypeColor(notif.type)
                return (
                  <button
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    style={{
                      display: 'flex', gap: '10px', width: '100%',
                      padding: '10px 16px', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: notif.read ? 'transparent' : colors.primary[25],
                      borderBottom: `1px solid ${colors.divider}`,
                      transition: `background-color ${transitions.fast}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.neutral[50] }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : colors.primary[25] }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: borders.radius.md,
                      backgroundColor: typeColor.bg, color: typeColor.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 2,
                    }}>
                      {getNotificationIcon(notif.icon)}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: 2,
                      }}>
                        <span style={{
                          fontSize: typography.sizes.sm,
                          fontWeight: notif.read ? typography.weights.medium : typography.weights.semibold,
                          color: colors.textPrimary,
                        }}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span style={{
                            width: 6, height: 6,
                            backgroundColor: colors.primary[500],
                            borderRadius: borders.radius.full,
                            flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <div style={{
                        fontSize: typography.sizes.xs,
                        color: colors.textSecondary,
                        lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {notif.message}
                      </div>
                      <div style={{
                        fontSize: typography.sizes['2xs'],
                        color: colors.neutral[400],
                        marginTop: 4,
                      }}>
                        {formatTimeAgo(notif.timestamp)}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
