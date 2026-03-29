import { useEffect, useCallback } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description: string
  category?: string
}

/**
 * Register a keyboard shortcut.
 * Supports Ctrl/Cmd + key combos, automatically handles Mac vs Windows.
 */
export function useKeyboardShortcut(config: ShortcutConfig): void {
  const { key, ctrl, meta, shift, alt, handler } = config

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't fire in input/textarea/contenteditable
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Escape always
      if (key !== 'Escape') return
    }

    const isMac = navigator.platform.toUpperCase().includes('MAC')
    const modKey = ctrl || meta
    const modPressed = isMac ? e.metaKey : e.ctrlKey

    if (modKey && !modPressed) return
    if (!modKey && (e.ctrlKey || e.metaKey)) return
    if (shift && !e.shiftKey) return
    if (!shift && e.shiftKey) return
    if (alt && !e.altKey) return
    if (!alt && e.altKey) return

    if (e.key.toLowerCase() === key.toLowerCase()) {
      e.preventDefault()
      e.stopPropagation()
      handler()
    }
  }, [key, ctrl, meta, shift, alt, handler])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export interface ShortcutEntry {
  keys: string
  description: string
  category: string
}

/**
 * Global shortcut registry for the help modal
 */
export const SHORTCUTS: ShortcutEntry[] = [
  { keys: 'Ctrl+K', description: 'Recherche rapide', category: 'Navigation' },
  { keys: 'Ctrl+/', description: 'Raccourcis clavier', category: 'Navigation' },
  { keys: 'G D', description: 'Aller au Dashboard', category: 'Navigation' },
  { keys: 'G C', description: 'Aller aux Conventions', category: 'Navigation' },
  { keys: 'G M', description: 'Aller aux Marches', category: 'Navigation' },
  { keys: 'G P', description: 'Aller aux Projets', category: 'Navigation' },
  { keys: 'Esc', description: 'Fermer la modale', category: 'General' },
]
