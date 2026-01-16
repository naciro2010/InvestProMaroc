import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebar-open')
    if (savedSidebarState !== null) {
      setSidebarOpen(JSON.parse(savedSidebarState))
    }
    setIsHydrated(true)
  }, [])

  // Update localStorage when sidebar state changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isHydrated])

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth
      // Mobile: < 640px
      setIsMobile(width < 640)
      // Tablet: 640px - 1024px
      setIsTablet(width >= 640 && width < 1024)

      // Auto-close sidebar on mobile, open on desktop
      if (width < 1024 && sidebarOpen && isHydrated) {
        setSidebarOpen(false)
      } else if (width >= 1024 && !sidebarOpen && isHydrated) {
        const saved = localStorage.getItem('sidebar-open')
        if (saved === null || JSON.parse(saved)) {
          setSidebarOpen(true)
        }
      }
    }

    // Initial check
    handleResize()

    // Add resize listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen, isHydrated])

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
