import { useState } from 'react'
import { X, Keyboard } from 'lucide-react'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'
import { useKeyboardShortcut, SHORTCUTS } from '@/hooks/useKeyboardShortcut'

const KeyboardShortcutsHelp = () => {
  const [open, setOpen] = useState(false)

  useKeyboardShortcut({
    key: '/',
    ctrl: true,
    handler: () => setOpen(prev => !prev),
    description: 'Raccourcis clavier',
    category: 'Navigation',
  })

  useKeyboardShortcut({
    key: 'Escape',
    handler: () => { if (open) setOpen(false) },
    description: 'Fermer',
    category: 'General',
  })

  if (!open) return null

  // Group shortcuts by category
  const grouped: Record<string, typeof SHORTCUTS> = {}
  for (const s of SHORTCUTS) {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(28,42,68,.34)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div role="dialog" aria-modal="true" aria-label="Raccourcis clavier" style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: 480, zIndex: 9999,
        backgroundColor: colors.surface, borderRadius: borders.radius.xl,
        boxShadow: shadows.xl,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={16} strokeWidth={1.75} style={{ color: colors.textSecondary }} aria-hidden="true" />
            <span style={{
              fontFamily: typography.fontFamilySerif,
              fontSize: 20,
              fontWeight: typography.weights.medium,
              color: colors.textPrimary,
            }}>
              Raccourcis clavier
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            style={{
              padding: '4px', backgroundColor: 'transparent', border: 'none',
              cursor: 'pointer', borderRadius: borders.radius.sm, display: 'flex',
            }}
          >
            <X size={18} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', maxHeight: 400, overflowY: 'auto' }}>
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                marginBottom: 8,
              }}>
                {category}
              </div>
              {shortcuts.map(shortcut => (
                <div key={shortcut.keys} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: `1px solid ${colors.divider}`,
                }}>
                  <span style={{
                    fontSize: typography.sizes.sm,
                    color: colors.textPrimary,
                  }}>
                    {shortcut.description}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {shortcut.keys.split('+').map((key, i) => (
                      <span key={i}>
                        {i > 0 && <span style={{ color: colors.textSecondary, margin: '0 2px', fontSize: typography.sizes.xs }}>+</span>}
                        <kbd style={{
                          padding: '2px 6px',
                          backgroundColor: colors.neutral[100],
                          border: `1px solid ${colors.neutral[200]}`,
                          borderRadius: borders.radius.sm,
                          fontSize: typography.sizes.xs,
                          fontFamily: typography.fontFamily,
                          color: colors.textPrimary,
                          fontWeight: typography.weights.medium,
                        }}>
                          {key.trim()}
                        </kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${colors.border}`,
          fontSize: typography.sizes.xs,
          color: colors.textSecondary,
          textAlign: 'center',
          transition: `color ${transitions.fast}`,
        }}>
          Appuyez sur <kbd style={{
            padding: '1px 5px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borders.radius.sm,
            fontFamily: typography.fontFamily,
          }}>Ctrl+/</kbd> pour afficher/masquer
        </div>
      </div>
    </>
  )
}

export default KeyboardShortcutsHelp
