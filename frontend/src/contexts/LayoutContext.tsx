import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

/**
 * Point de rupture du menu : en dessous, le menu passe en tiroir.
 */
export const NAV_BREAKPOINT = 900

const EXERCICE_KEY = 'investpro_exercice'

/**
 * Layout Context Interface
 */
interface ILayoutContext {
  /** Tiroir mobile ouvert (sans effet au-dessus de 900px : le menu est fixe) */
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  /** < 640px */
  isMobile: boolean
  /** 640px – 899px */
  isTablet: boolean
  /** Exercice sélectionné dans l'en-tête */
  exercice: number
  setExercice: (year: number) => void
}

const LayoutContext = createContext<ILayoutContext | undefined>(undefined)

/**
 * Custom hook to use LayoutContext
 */
export function useLayout(): ILayoutContext {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutContextProvider')
  }
  return context
}

const readExercice = (): number => {
  try {
    const saved = Number(localStorage.getItem(EXERCICE_KEY))
    return Number.isInteger(saved) && saved > 1900 ? saved : new Date().getFullYear()
  } catch {
    return new Date().getFullYear()
  }
}

interface LayoutContextProviderProps {
  children: ReactNode
}

/**
 * Layout Provider - état de l'ossature : tiroir mobile, points de rupture,
 * exercice courant (persisté en localStorage).
 */
export function LayoutContextProvider({ children }: LayoutContextProviderProps): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [width, setWidth] = useState<number>(() => window.innerWidth)
  const [exercice, setExerciceState] = useState<number>(readExercice)

  useEffect(() => {
    const handleResize = (): void => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Le tiroir se referme quand on repasse en mode bureau
  useEffect(() => {
    if (width >= NAV_BREAKPOINT) setSidebarOpen(false)
  }, [width])

  const toggleSidebar = useCallback((): void => setSidebarOpen(prev => !prev), [])

  const setExercice = useCallback((year: number): void => {
    setExerciceState(year)
    try { localStorage.setItem(EXERCICE_KEY, String(year)) } catch { /* ignore */ }
  }, [])

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        isMobile: width < 640,
        isTablet: width >= 640 && width < NAV_BREAKPOINT,
        exercice,
        setExercice,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContextProvider
