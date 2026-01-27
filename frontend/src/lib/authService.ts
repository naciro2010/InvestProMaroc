/**
 * Service d'authentification centralisé pour InvestPro.
 *
 * Ce service gère:
 * - La validation et le parsing des tokens JWT
 * - La vérification proactive de l'expiration
 * - La redirection vers /login quand nécessaire
 * - Le stockage sécurisé des tokens
 *
 * UTILISATION:
 * - Utilisé par api.ts pour les interceptors
 * - Utilisé par AuthContext pour la gestion d'état
 * - Peut être utilisé directement dans les composants si besoin
 */

// ==================== TYPES ====================

export interface JwtPayload {
  sub: string           // username
  userId: number        // user ID
  roles: string[]       // ['ADMIN', 'MANAGER', 'USER']
  authorities: string[] // ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER']
  iat: number           // issued at (timestamp in seconds)
  exp: number           // expiration (timestamp in seconds)
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface StoredUser {
  id: number
  username: string
  email: string
  fullName: string
  roles: string[]
}

// ==================== CONSTANTS ====================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const

// Buffer time before token is considered expired (60 seconds)
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000

// ==================== TOKEN PARSING ====================

/**
 * Parse un token JWT et retourne son payload.
 * Retourne null si le token est invalide.
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('⚠️ Token JWT invalide: format incorrect')
      return null
    }

    const payload = JSON.parse(atob(parts[1]))
    return payload as JwtPayload
  } catch (error) {
    console.error('❌ Erreur lors du parsing du token JWT:', error)
    return null
  }
}

/**
 * Vérifie si un token JWT est expiré.
 * Considère le token comme expiré s'il reste moins de 60 secondes.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true
  }

  const payload = parseJwt(token)
  if (!payload || !payload.exp) {
    return true
  }

  const expirationTimeMs = payload.exp * 1000
  const nowMs = Date.now()
  const isExpired = expirationTimeMs < (nowMs + TOKEN_EXPIRY_BUFFER_MS)

  if (isExpired) {
    console.warn('⏰ Token expiré ou expire bientôt:', {
      expiration: new Date(expirationTimeMs).toISOString(),
      now: new Date(nowMs).toISOString(),
      secondsRemaining: Math.floor((expirationTimeMs - nowMs) / 1000),
    })
  }

  return isExpired
}

/**
 * Calcule le temps restant avant l'expiration du token en millisecondes.
 * Retourne 0 si le token est déjà expiré ou invalide.
 */
export function getTokenTimeRemaining(token: string | null): number {
  if (!token) {
    return 0
  }

  const payload = parseJwt(token)
  if (!payload || !payload.exp) {
    return 0
  }

  const expirationTimeMs = payload.exp * 1000
  const nowMs = Date.now()
  const remaining = expirationTimeMs - nowMs - TOKEN_EXPIRY_BUFFER_MS

  return Math.max(0, remaining)
}

// ==================== STORAGE ====================

/**
 * Récupère les tokens depuis le localStorage.
 */
export function getStoredTokens(): AuthTokens | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

  if (!accessToken) {
    return null
  }

  return {
    accessToken,
    refreshToken: refreshToken || '',
  }
}

/**
 * Récupère le token d'accès depuis le localStorage.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Récupère le refresh token depuis le localStorage.
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Récupère l'utilisateur stocké depuis le localStorage.
 */
export function getStoredUser(): StoredUser | null {
  try {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userJson) {
      return null
    }
    return JSON.parse(userJson) as StoredUser
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

/**
 * Stocke les tokens d'authentification.
 */
export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
  if (tokens.refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
  }
}

/**
 * Met à jour uniquement le token d'accès (après refresh).
 */
export function updateAccessToken(accessToken: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
}

/**
 * Stocke l'utilisateur.
 */
export function storeUser(user: StoredUser): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

/**
 * Supprime toutes les données d'authentification.
 */
export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  // Nettoyer aussi les anciens formats potentiels
  localStorage.removeItem('authToken')
  localStorage.removeItem('token')
}

// ==================== AUTH STATE ====================

/**
 * Vérifie si l'utilisateur est authentifié (token valide et non expiré).
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique.
 */
export function hasRole(role: string): boolean {
  const user = getStoredUser()
  return user?.roles?.includes(role) ?? false
}

/**
 * Vérifie si l'utilisateur a au moins un des rôles spécifiés.
 */
export function hasAnyRole(roles: string[]): boolean {
  const user = getStoredUser()
  return roles.some(role => user?.roles?.includes(role))
}

/**
 * Vérifie si l'utilisateur est admin.
 */
export function isAdmin(): boolean {
  return hasRole('ADMIN')
}

/**
 * Vérifie si l'utilisateur est manager (ou admin).
 */
export function isManager(): boolean {
  return hasAnyRole(['ADMIN', 'MANAGER'])
}

// ==================== LOGOUT & REDIRECT ====================

// Callback pour notifier les composants du logout
let logoutCallback: (() => void) | null = null

/**
 * Enregistre un callback à appeler lors du logout.
 * Utilisé par AuthContext pour synchroniser l'état.
 */
export function onLogout(callback: () => void): void {
  logoutCallback = callback
}

/**
 * Affiche une notification toast.
 */
function showToast(message: string, type: 'error' | 'success' | 'warning' | 'info'): void {
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { message, type }
    })
  )
}

/**
 * Déconnecte l'utilisateur et redirige vers /login.
 * Cette fonction est la seule source de vérité pour le logout.
 */
export function logout(options: {
  message?: string
  showToast?: boolean
  redirect?: boolean
} = {}): void {
  const {
    message = 'Session expirée ou invalide. Veuillez vous reconnecter.',
    showToast: shouldShowToast = true,
    redirect = true,
  } = options

  console.warn('🔒 Déconnexion en cours...')

  // 1. Nettoyer le stockage
  clearAuthData()

  // 2. Notifier les composants (AuthContext)
  if (logoutCallback) {
    logoutCallback()
  }

  // 3. Afficher la notification
  if (shouldShowToast) {
    showToast(`🔒 ${message}`, 'warning')
  }

  // 4. Rediriger vers login
  if (redirect) {
    // Délai court pour permettre au toast de s'afficher
    setTimeout(() => {
      console.log('📍 Redirection vers /login')
      window.location.href = '/login'
    }, 500)
  }
}

/**
 * Déconnecte l'utilisateur suite à une expiration de token.
 */
export function logoutDueToExpiration(): void {
  logout({
    message: 'Votre session a expiré. Veuillez vous reconnecter.',
    showToast: true,
    redirect: true,
  })
}

/**
 * Déconnecte l'utilisateur suite à une erreur d'accès.
 */
export function logoutDueToAccessDenied(): void {
  logout({
    message: 'Accès refusé. Veuillez vous reconnecter.',
    showToast: true,
    redirect: true,
  })
}

// ==================== TOKEN REFRESH ====================

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

/**
 * Ajoute un subscriber qui sera notifié quand le token est rafraîchi.
 */
export function subscribeToTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback)
}

/**
 * Notifie tous les subscribers que le token a été rafraîchi.
 */
export function onTokenRefreshed(newToken: string): void {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

/**
 * Retourne true si un refresh est en cours.
 */
export function isRefreshingToken(): boolean {
  return isRefreshing
}

/**
 * Définit l'état du refresh.
 */
export function setRefreshingToken(refreshing: boolean): void {
  isRefreshing = refreshing
}

// ==================== PROACTIVE TOKEN CHECK ====================

let tokenCheckInterval: ReturnType<typeof setInterval> | null = null

/**
 * Démarre une vérification périodique du token.
 * Si le token expire, l'utilisateur est déconnecté.
 */
export function startTokenExpirationCheck(intervalMs: number = 30000): void {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }

  tokenCheckInterval = setInterval(() => {
    const token = getAccessToken()
    if (token && isTokenExpired(token)) {
      console.warn('⏰ Vérification périodique: token expiré')
      logoutDueToExpiration()
    }
  }, intervalMs)

  console.log(`✅ Vérification du token activée (toutes les ${intervalMs / 1000}s)`)
}

/**
 * Arrête la vérification périodique du token.
 */
export function stopTokenExpirationCheck(): void {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
    tokenCheckInterval = null
    console.log('🛑 Vérification du token désactivée')
  }
}

// ==================== EXPORTS DEFAULT ====================

const authService = {
  // Token parsing
  parseJwt,
  isTokenExpired,
  getTokenTimeRemaining,

  // Storage
  getStoredTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  storeTokens,
  updateAccessToken,
  storeUser,
  clearAuthData,

  // Auth state
  isAuthenticated,
  hasRole,
  hasAnyRole,
  isAdmin,
  isManager,

  // Logout
  onLogout,
  logout,
  logoutDueToExpiration,
  logoutDueToAccessDenied,

  // Token refresh
  subscribeToTokenRefresh,
  onTokenRefreshed,
  isRefreshingToken,
  setRefreshingToken,

  // Proactive check
  startTokenExpirationCheck,
  stopTokenExpirationCheck,
}

export default authService
