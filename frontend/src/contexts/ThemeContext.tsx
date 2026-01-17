import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

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

  // Create MUI theme based on mode
  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563eb', // blue-600
        light: '#60a5fa', // blue-400
        dark: '#1d4ed8', // blue-700
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0891b2', // cyan-600
        light: '#22d3ee', // cyan-400
        dark: '#155e75', // cyan-800
        contrastText: '#ffffff',
      },
      success: {
        main: '#16a34a', // green-600
        light: '#4ade80', // green-400
        dark: '#15803d', // green-700
      },
      warning: {
        main: '#d97706', // amber-600
        light: '#fbbf24', // amber-400
        dark: '#b45309', // amber-700
      },
      error: {
        main: '#dc2626', // red-600
        light: '#f87171', // red-400
        dark: '#b91c1c', // red-700
      },
      info: {
        main: '#0284c7', // sky-600
        light: '#38bdf8', // sky-400
        dark: '#0c4a6e', // sky-900
      },
      background: {
        // GCP/GitLab style: fond gris très clair, cards blanc pur
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#202124',
        secondary: '#5f6368',
      },
      divider: '#e8eaed',
    },
    typography: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.57,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: '#ffffff',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 0 0 3px ${'#dbeafe'}`,
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${'#bfdbfe'}`,
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#ffffff',
            color: '#202124',
            boxShadow: `0 1px 3px ${'rgba(0, 0, 0, 0.1)'}`,
            borderBottom: `1px solid ${'#e8eaed'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#ffffff',
            borderRight: `1px solid ${'#e8eaed'}`,
          },
        },
      },
    },
  })

  // Don't render until hydrated (avoid hydration mismatch)
  if (!isHydrated) {
    return <CssBaseline />
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: false }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
