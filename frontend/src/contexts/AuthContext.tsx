import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { AxiosError } from 'axios'
import { authAPI } from '@/lib/api'
import authService, { StoredUser } from '@/lib/authService'
import { User as ApiUser, UserRole } from '@/types/api'

interface User extends ApiUser {
  enabled?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    fullName: string
  }) => Promise<void>
  logout: () => void
  /**
   * Vérifie si l'utilisateur a un rôle spécifique.
   */
  hasRole: (role: UserRole) => boolean
  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés.
   */
  hasAnyRole: (roles: UserRole[]) => boolean
  /**
   * Vérifie si l'utilisateur est admin.
   */
  isAdmin: boolean
  /**
   * Vérifie si l'utilisateur est manager (ou admin).
   */
  isManager: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Fonction de logout appelée par le service d'authentification.
   */
  const handleLogout = useCallback(() => {
    setUser(null)
  }, [])

  /**
   * Initialisation: vérifie si l'utilisateur est connecté au chargement.
   */
  useEffect(() => {
    // Enregistrer le callback de logout pour synchroniser avec le service
    authService.onLogout(handleLogout)

    // Vérifier si l'utilisateur est connecté
    const storedUser = authService.getStoredUser()
    const token = authService.getAccessToken()

    if (storedUser && token && !authService.isTokenExpired(token)) {
      setUser(storedUser as User)

      // Démarrer la vérification proactive du token (toutes les 30 secondes)
      authService.startTokenExpirationCheck(30000)
    } else if (token && authService.isTokenExpired(token)) {
      // Token expiré, nettoyer
      console.warn('⏰ Token expiré au chargement. Nettoyage...')
      authService.clearAuthData()
    }

    setIsLoading(false)

    // Cleanup: arrêter la vérification à la destruction
    return () => {
      authService.stopTokenExpirationCheck()
    }
  }, [handleLogout])

  /**
   * Connexion utilisateur.
   */
  const login = useCallback(async (username: string, password: string) => {
    try {
      const { data } = await authAPI.login(username, password)

      if (data.success) {
        const authData = data.data

        // Stocker les tokens via le service
        authService.storeTokens({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        })

        // Stocker l'utilisateur
        authService.storeUser(authData.user as StoredUser)

        // Mettre à jour l'état
        setUser(authData.user)

        // Démarrer la vérification proactive
        authService.startTokenExpirationCheck(30000)
      } else {
        throw new Error(data.message || 'Échec de la connexion')
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Une erreur est survenue lors de la connexion'
        )
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Une erreur est survenue lors de la connexion')
    }
  }, [])

  /**
   * Inscription utilisateur.
   */
  const register = useCallback(async (data: {
    username: string
    email: string
    password: string
    fullName: string
  }) => {
    try {
      const response = await authAPI.register(data)

      if (response.data.success) {
        const authData = response.data.data

        // Stocker les tokens via le service
        authService.storeTokens({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        })

        // Stocker l'utilisateur
        authService.storeUser(authData.user as StoredUser)

        // Mettre à jour l'état
        setUser(authData.user)

        // Démarrer la vérification proactive
        authService.startTokenExpirationCheck(30000)
      } else {
        throw new Error(response.data.message || 'Échec de l\'inscription')
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Une erreur est survenue lors de l\'inscription'
        )
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Une erreur est survenue lors de l\'inscription')
    }
  }, [])

  /**
   * Déconnexion utilisateur.
   */
  const logout = useCallback(() => {
    // Arrêter la vérification proactive
    authService.stopTokenExpirationCheck()

    // Utiliser le service pour le logout complet
    authService.logout({
      message: 'Vous avez été déconnecté.',
      showToast: true,
      redirect: true,
    })
  }, [])

  /**
   * Vérifie si l'utilisateur a un rôle spécifique.
   */
  const hasRole = useCallback(
    (role: UserRole): boolean => user?.roles?.includes(role) ?? false,
    [user]
  )

  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés.
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => roles.some((role) => user?.roles?.includes(role) ?? false),
    [user]
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user && !authService.isTokenExpired(authService.getAccessToken()),
      isLoading,
      login,
      register,
      logout,
      hasRole,
      hasAnyRole,
      isAdmin: hasRole('ADMIN'),
      isManager: hasAnyRole(['ADMIN', 'MANAGER']),
    }),
    [user, isLoading, login, register, logout, hasRole, hasAnyRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
