import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { odooTheme } from '../theme/odooTheme'

/**
 * Theme Mode Type
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Theme Context Interface
 */
interface IThemeContext {
  mode: ThemeMode
  toggleTheme: () => void
  isDark: boolean
}

/**
 * Create ThemeContext
 */
const ThemeContext = createContext<IThemeContext | undefined>(undefined)

/**
 * Custom hook to use ThemeContext
 */
export function useTheme(): IThemeContext {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * Theme Provider Component
 *
 * Provides theme switching (light/dark mode) with persistence to localStorage
 *
 * @example
 * <ThemeContextProvider>
 *   <App />
 * </ThemeContextProvider>
 */
interface ThemeContextProviderProps {
  children: ReactNode
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps): React.ReactElement {
  // Force light mode only - dark mode disabled
  const mode: ThemeMode = 'light'
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const toggleTheme = (): void => {
    // Dark mode disabled - do nothing
  }

  // Don't render until hydrated (avoid hydration mismatch)
  if (!isHydrated) {
    return <CssBaseline />
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: false }}>
      <ThemeProvider theme={odooTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
