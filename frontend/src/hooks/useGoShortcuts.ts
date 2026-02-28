import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * "Go to" keyboard shortcuts: press G then a letter to navigate.
 * G+D = Dashboard, G+C = Conventions, G+M = Marches, G+P = Projets, G+R = Reporting
 */
export function useGoShortcuts(): void {
  const navigate = useNavigate()
  const pendingG = useRef(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    pendingG.current = false
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const key = e.key.toLowerCase()

      if (key === 'g' && !pendingG.current) {
        pendingG.current = true
        timeout.current = setTimeout(reset, 800)
        return
      }

      if (pendingG.current) {
        reset()
        const routes: Record<string, string> = {
          d: '/dashboard',
          c: '/conventions',
          m: '/marches',
          p: '/projets',
          r: '/reporting',
          b: '/budgets',
          f: '/fournisseurs',
          u: '/users',
        }
        const path = routes[key]
        if (path) {
          e.preventDefault()
          navigate(path)
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      reset()
    }
  }, [navigate, reset])
}
