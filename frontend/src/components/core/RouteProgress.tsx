import { useEffect, useRef, useState } from 'react'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

/**
 * RouteProgress - Barre de progression globale (style "NProgress").
 *
 * S'affiche en haut de l'écran dès qu'une requête ou mutation React Query
 * est en vol, donnant un retour réseau cohérent sur toute l'application.
 * Respecte `prefers-reduced-motion` (barre statique, voir index.css).
 *
 * - Délai d'apparition (120ms) pour éviter le clignotement sur requêtes rapides.
 * - Durée minimale d'affichage (360ms) pour éviter un flash.
 */
const SHOW_DELAY_MS = 120
const MIN_VISIBLE_MS = 360

export default function RouteProgress() {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const active = fetching + mutating > 0

  const [visible, setVisible] = useState(false)
  const showTimer = useRef<number | undefined>(undefined)
  const hideTimer = useRef<number | undefined>(undefined)
  const shownAt = useRef(0)

  useEffect(() => {
    window.clearTimeout(showTimer.current)
    window.clearTimeout(hideTimer.current)

    if (active) {
      showTimer.current = window.setTimeout(() => {
        shownAt.current = Date.now()
        setVisible(true)
      }, SHOW_DELAY_MS)
    } else if (visible) {
      const elapsed = Date.now() - shownAt.current
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
      hideTimer.current = window.setTimeout(() => setVisible(false), wait)
    }

    return () => {
      window.clearTimeout(showTimer.current)
      window.clearTimeout(hideTimer.current)
    }
  }, [active, visible])

  return (
    <div
      aria-hidden="true"
      className={`route-progress${visible ? ' route-progress--active' : ''}`}
    >
      <div className="route-progress-bar" />
    </div>
  )
}
