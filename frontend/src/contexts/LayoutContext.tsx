import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'

/**
 * Layout Context Interface
 */
interface ILayoutContext {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
  isTablet: boolean
}

/**
 * Create LayoutContext
 */
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

/**
 * Layout Provider Component
 *
 * Manages layout state (sidebar, responsive breakpoints)
 * Persists sidebar state to localStorage
 *
 * @example
 * <LayoutContextProvider>
 *   <AppLayout>
 *     <Routes />
 *   </AppLayout>
 * </LayoutContextProvider>
 */
interface LayoutContextProviderProps {
  children: ReactNode
}

export function LayoutContextProvider({ children }: LayoutContextProviderProps): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize sidebar state from localStorage (closed on mobile)
  useEffect(() => {
    const width = window.innerWidth
    if (width < 1024) {
      // Always start closed on mobile/tablet
      setSidebarOpen(false)
    } else {
      const savedSidebarState = localStorage.getItem('sidebar-open')
      if (savedSidebarState !== null) {
        setSidebarOpen(JSON.parse(savedSidebarState))
      }
    }
    setIsHydrated(true)
  }, [])

  // Update localStorage when sidebar state changes (desktop only)
  useEffect(() => {
    if (isHydrated && window.innerWidth >= 1024) {
      localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isHydrated])

  // Track previous width to detect actual crossings of the 1024px breakpoint
  const prevWidthRef = useRef<number>(window.innerWidth)
  const isHydratedRef = useRef(isHydrated)
  useEffect(() => { isHydratedRef.current = isHydrated }, [isHydrated])

  // Update breakpoint flags (runs on mount + resize, no sidebar dependency)
  const updateBreakpoints = useCallback(() => {
    const width = window.innerWidth
    setIsMobile(width < 640)
    setIsTablet(width >= 640 && width < 1024)
  }, [])

  // Handle responsive breakpoints
  useEffect(() => {
    // Set initial breakpoints
    updateBreakpoints()

    const handleResize = (): void => {
      const width = window.innerWidth
      const prevWidth = prevWidthRef.current
      prevWidthRef.current = width

      // Update breakpoint flags
      updateBreakpoints()

      if (!isHydratedRef.current) return

      // Only auto-toggle sidebar when crossing the 1024px breakpoint
      const wasDesktop = prevWidth >= 1024
      const isNowDesktop = width >= 1024

      if (wasDesktop && !isNowDesktop) {
        // Crossed from desktop to mobile/tablet: close sidebar
        setSidebarOpen(false)
      } else if (!wasDesktop && isNowDesktop) {
        // Crossed from mobile/tablet to desktop: restore sidebar
        const saved = localStorage.getItem('sidebar-open')
        if (saved === null || JSON.parse(saved)) {
          setSidebarOpen(true)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateBreakpoints])

  const toggleSidebar = (): void => {
    setSidebarOpen((prev) => !prev)
  }

  // Don't render until hydrated (avoid hydration mismatch)
  if (!isHydrated) {
    return <>{children}</>
  }

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        isMobile,
        isTablet,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContextProvider
