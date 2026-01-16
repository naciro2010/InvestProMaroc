// Auth Context
export { useAuth, AuthProvider } from './AuthContext'

// Theme Context
export { useTheme, ThemeContextProvider } from './ThemeContext'
export type { ThemeMode } from './ThemeContext'

// Layout Context
export { useLayout, LayoutContextProvider } from './LayoutContext'

// Toast Context
export { useToast, ToastProvider } from './ToastContext'

/**
 * Import all providers and compose them:
 *
 * @example
 * import { ThemeContextProvider, LayoutContextProvider } from '@/contexts'
 *
 * function App() {
 *   return (
 *     <ThemeContextProvider>
 *       <LayoutContextProvider>
 *         {children}
 *       </LayoutContextProvider>
 *     </ThemeContextProvider>
 *   )
 * }
 */
