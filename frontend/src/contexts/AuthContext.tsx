import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '@/lib/api'

interface User {
  id: number
  username: string
  email: string
  fullName: string
  roles: string[]
  enabled: boolean
  actif: boolean
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

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const { data } = await authAPI.login(username, password)

      if (data.success) {
        const authData = data.data
        localStorage.setItem('accessToken', authData.accessToken)
        localStorage.setItem('refreshToken', authData.refreshToken)
        localStorage.setItem('user', JSON.stringify(authData.user))
        setUser(authData.user)
      } else {
        throw new Error(data.message || 'Échec de la connexion')
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de la connexion'
      )
    }
  }

  const register = async (data: {
    username: string
    email: string
    password: string
    fullName: string
  }) => {
    try {
      const response = await authAPI.register(data)

      if (response.data.success) {
        const authData = response.data.data
        localStorage.setItem('accessToken', authData.accessToken)
        localStorage.setItem('refreshToken', authData.refreshToken)
        localStorage.setItem('user', JSON.stringify(authData.user))
        setUser(authData.user)
      } else {
        throw new Error(response.data.message || 'Échec de l\'inscription')
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de l\'inscription'
      )
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
