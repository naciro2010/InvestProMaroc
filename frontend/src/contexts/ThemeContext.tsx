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
  const [mode, setMode] = useState<ThemeMode>('light')
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      setMode(savedMode)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
    setIsHydrated(true)
  }, [])

  // Update localStorage when mode changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('theme-mode', mode)
    }
  }, [mode, isHydrated])

  const toggleTheme = (): void => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
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
        // Mode light: fond blanc, cards gris clair
        // Mode dark: fond slate-900, cards slate-800 (BON CONTRASTE)
        default: mode === 'light' ? '#f9fafb' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
      text: {
        // Mode dark: texte clair avec bon contraste
        primary: mode === 'light' ? '#1f2937' : '#f1f5f9',
        secondary: mode === 'light' ? '#6b7280' : '#cbd5e1',
      },
      divider: mode === 'light' ? '#e5e7eb' : '#334155',
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
            borderRadius: 12,
            border: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 10px 25px rgba(0, 0, 0, 0.1)'
                : '0 10px 25px rgba(15, 23, 42, 0.5)',
              transform: 'translateY(-4px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
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
                boxShadow: `0 0 0 3px ${mode === 'light' ? '#dbeafe' : '#1e3a8a'}`,
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${mode === 'light' ? '#bfdbfe' : '#3b82f6'}`,
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            color: mode === 'light' ? '#1f2937' : '#f1f5f9',
            boxShadow: `0 1px 3px ${mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(15, 23, 42, 0.5)'}`,
            borderBottom: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            borderRight: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
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
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: mode === 'dark' }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
