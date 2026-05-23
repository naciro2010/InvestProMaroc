import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop - Réinitialise le défilement en haut à chaque changement de route.
 *
 * Les SPA conservent par défaut la position de scroll lors d'une navigation,
 * ce qui désoriente l'utilisateur. Ce composant remet la vue en haut de page
 * (de façon instantanée — un scroll animé serait perçu comme lent).
 *
 * Ignore les changements de hash (ancres internes) pour ne pas casser
 * la navigation par ancre.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
