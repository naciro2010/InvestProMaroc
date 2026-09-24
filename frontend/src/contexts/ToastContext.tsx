import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { colors, borders, typography } from '@/lib/designSystem'

/** Durée par défaut : 2,6 s (confirmations) ; les erreurs restent plus longtemps. */
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 2600,
  info: 2600,
  warning: 4000,
  error: 5000,
}

/** Pastille de ton à gauche du message (le toast reste bleu nuit). */
const ACCENT: Record<ToastType, string> = {
  success: '#8fc3a1',
  info: colors.brass.light,
  warning: '#e6c67c',
  error: '#e59a8c',
}

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = DEFAULT_DURATION[type]) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: Toast = { id, message, type, duration }

    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  // Écouter les événements custom de l'API interceptor
  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: ToastType }>
      showToast(customEvent.detail.message, customEvent.detail.type)
    }

    window.addEventListener('showToast', handleToastEvent)
    return () => window.removeEventListener('showToast', handleToastEvent)
  }, [showToast])

  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast])
  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast])
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast])

  const contextValue = useMemo(
    () => ({ showToast, showError, showSuccess, showWarning, showInfo }),
    [showToast, showError, showSuccess, showWarning, showInfo]
  )

  const getToastIcon = (type: ToastType) => {
    const props = { size: 16, strokeWidth: 1.75, 'aria-hidden': true }
    switch (type) {
      case 'success':
        return <CheckCircle {...props} />
      case 'error':
        return <AlertCircle {...props} />
      case 'warning':
        return <AlertTriangle {...props} />
      case 'info':
        return <Info {...props} />
    }
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toasts : bleu nuit, centrés en bas, halo laiton */}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        style={{
          position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 1400,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          width: 'max-content', maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              style={{
                pointerEvents: 'auto',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px 10px 16px', maxWidth: 560,
                background: colors.ink.main, color: colors.onDark.primary,
                borderRadius: borders.radius.lg,
                boxShadow: `inset 0 0 0 1px ${colors.brass.halo}, 0 18px 40px -18px rgba(28,42,68,.6)`,
                fontFamily: typography.fontFamily, fontSize: 13.5, fontWeight: 500, lineHeight: 1.4,
              }}
            >
              <span style={{ color: ACCENT[toast.type], display: 'inline-flex', flexShrink: 0 }}>
                {getToastIcon(toast.type)}
              </span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Fermer la notification"
                style={{
                  display: 'inline-flex', flexShrink: 0, padding: 4, border: 0, borderRadius: borders.radius.sm,
                  background: 'transparent', color: colors.onDark.secondary, cursor: 'pointer',
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
