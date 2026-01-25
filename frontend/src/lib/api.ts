import axios, { AxiosError } from 'axios'
import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  CreateConventionDTO,
  UpdateConventionDTO,
  UpdateConventionWithHistoryRequest,
  CreateProjetDTO,
  UpdateProjetDTO,
  CreateMarcheDTO,
  UpdateMarcheDTO,
  CreateMarcheLineDTO,
  CreateDecompteDTO,
  UpdateDecompteDTO,
  CreateFournisseurDTO,
  UpdateFournisseurDTO,
  CreateDimensionDTO,
  CreateValeurDimensionDTO,
  User,
  AuthResponse,
} from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================== UTILITY FUNCTIONS ====================

// Event pour envoyer les notifications d'erreur
const dispatchToastEvent = (message: string, type: 'error' | 'success' | 'warning' | 'info') => {
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { message, type }
    })
  )
}

// Fonction pour déconnecter l'utilisateur (robuste)
const logoutUser = (): void => {
  try {
    console.warn('🔒 Déconnexion en cours...')

    // Nettoyer tous les tokens et données utilisateur
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('authToken') // Ancien format
    localStorage.removeItem('token') // Alternative

    // Afficher un message de déconnexion
    dispatchToastEvent('🔒 Session expirée ou invalide. Veuillez vous reconnecter.', 'warning')

    // Rediriger vers la page de connexion après un court délai
    setTimeout(() => {
      console.log('📍 Redirection vers /login')
      window.location.href = '/login'
    }, 800)
  } catch (error) {
    console.error('❌ Erreur lors du logout:', error)
    // Force la redirection même en cas d'erreur
    window.location.href = '/login'
  }
}

// Fonction pour vérifier si un token JWT est expiré
const isTokenExpired = (token: string): boolean => {
  try {
    if (!token) return true
    const parts = token.split('.')
    if (parts.length !== 3) return true // Token JWT invalide

    const payload = JSON.parse(atob(parts[1]))
    const expirationTime = payload.exp * 1000 // Convertir en millisecondes
    const now = Date.now()

    // Considérer le token comme expiré s'il reste moins de 60 secondes (au lieu de 30)
    const isExpired = expirationTime < (now + 60000)

    if (isExpired) {
      console.warn('⏰ Token expiré:', {
        expirationTime: new Date(expirationTime),
        now: new Date(now),
        secondsRemaining: (expirationTime - now) / 1000
      })
    }

    return isExpired
  } catch (error) {
    console.error('❌ Erreur lors du décodage du token:', error)
    return true // Si on ne peut pas décoder, considérer comme expiré
  }
}

// ==================== INTERCEPTORS ====================

// Request interceptor pour ajouter le token et vérifier son expiration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) {
      console.warn('⚠️ Aucun token disponible. Utilisateur non authentifié.')
      dispatchToastEvent('🔐 Vous n\'êtes pas connecté. Veuillez vous reconnecter.', 'warning')
      return config
    }

    // Vérifier si le token est expiré avant d'envoyer la requête
    if (isTokenExpired(token)) {
      console.warn('⏰ Token expiré détecté avant la requête.')

      if (!refreshToken) {
        console.warn('🔒 Token expiré et pas de refreshToken. Déconnexion immédiate...')
        dispatchToastEvent('🔒 Votre session a expiré. Veuillez vous reconnecter.', 'warning')
        logoutUser()
        return Promise.reject(new Error('Token expiré - Reconnexion nécessaire'))
      } else {
        console.log('🔄 Token en cours d\'expiration, tentative de refresh...')
      }
    }

    // Ajouter le token au header
    config.headers.Authorization = `Bearer ${token}`
    console.debug(`📤 ${config.method?.toUpperCase()} ${config.url} | User: ${user?.username} | Roles: ${user?.roles?.join(', ')}`)

    return config
  },
  (error) => {
    console.error('❌ Erreur dans l\'interceptor request:', error)
    return Promise.reject(error)
  }
)

// Response interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si erreur 401 et pas déjà retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')

      // Si pas de refreshToken, déconnecter immédiatement
      if (!refreshToken) {
        console.warn('🔒 Token expiré et aucun refreshToken disponible. Déconnexion...')
        logoutUser()
        return Promise.reject(error)
      }

      try {
        console.log('🔄 Tentative de refresh du token JWT...')
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(`${API_URL}/auth/refresh`, null, {
          params: { refreshToken },
          // Important: pas d'interceptors pour cette requête
          transformRequest: [(d) => d],
          transformResponse: [(d) => (typeof d === 'string' ? JSON.parse(d) : d)]
        })

        // Vérifier que la réponse contient bien un nouveau token
        if (data?.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`

          console.log('✅ Token rafraîchi avec succès. Renvoi de la requête originale...')
          return api(originalRequest)
        } else {
          console.error('❌ Réponse de refresh invalide:', data)
          dispatchToastEvent('🔒 Impossible de renouveler votre session. Veuillez vous reconnecter.', 'error')
          logoutUser()
          return Promise.reject(new Error('Impossible de rafraîchir le token'))
        }
      } catch (refreshError: any) {
        // Si le refresh échoue (400, 401, 500, etc), déconnecter l'utilisateur
        console.error('❌ Échec du refresh token (Erreur ' + refreshError.response?.status + '):', {
          status: refreshError.response?.status,
          message: refreshError.response?.data?.message || refreshError.message,
        })
        dispatchToastEvent(
          '🔒 Votre session a expiré et ne peut pas être renouvelée. Veuillez vous reconnecter.',
          'error'
        )
        logoutUser()
        return Promise.reject(refreshError)
      }
    }

    // Si erreur 403 (Forbidden) - Pas de permission OU token expiré
    if (error.response?.status === 403) {
      const token = localStorage.getItem('accessToken')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const roles = user?.roles?.join(', ') || 'Aucun rôle'
      const endpoint = error.config?.url || 'inconnu'
      const method = error.config?.method?.toUpperCase() || 'REQUEST'

      // Vérifier si le token est expiré
      const tokenExpired = token && isTokenExpired(token)

      console.error('❌ Erreur 403 - Accès refusé:', {
        endpoint,
        method,
        userRoles: roles,
        user: user?.username,
        tokenExpired,
        backendMessage: error.response?.data?.message
      })

      // Si le token est expiré, forcer un logout
      if (tokenExpired) {
        console.warn('🔒 Token expiré détecté lors d\'une erreur 403. Déconnexion forcée...')
        dispatchToastEvent(
          '🔒 Votre session a expiré. Veuillez vous reconnecter.',
          'warning'
        )
        logoutUser()
        return Promise.reject(new Error('Token expiré - Reconnexion nécessaire'))
      }

      // Sinon, c'est un vrai problème de permissions
      const errorMessage = `❌ Accès Refusé

Opération: ${method} ${endpoint}
Votre rôle: ${roles}

Vous n'avez pas les permissions nécessaires pour effectuer cette action.
${error.response?.data?.message ? `Détail: ${error.response.data.message}` : ''}

Rôles requis: Généralement ADMIN ou MANAGER pour les opérations de création/modification.`

      console.error(errorMessage)
      dispatchToastEvent(
        `❌ Accès refusé. Vous êtes ${user?.username} avec le rôle ${roles}. Vous devez être ADMIN ou MANAGER pour cette opération.`,
        'error'
      )
    }

    // Si erreur 404 (Not Found)
    if (error.response?.status === 404) {
      dispatchToastEvent(
        '⚠️ L\'élément demandé n\'a pas été trouvé.',
        'warning'
      )
    }

    // Si erreur 500 (Server Error)
    if (error.response?.status >= 500) {
      dispatchToastEvent(
        '🔥 Une erreur serveur s\'est produite. Veuillez réessayer plus tard.',
        'error'
      )
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password } as LoginRequest),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', null, { params: { refreshToken } }),
}

// Conventions API
export const conventionsAPI = {
  getAll: () => api.get('/conventions'),
  getActive: () => api.get('/conventions/active'),
  getById: (id: number) => api.get(`/conventions/${id}`),
  search: (q: string) => api.get(`/conventions/search?q=${q}`),
  create: (data: CreateConventionDTO) => api.post('/conventions', data),
  update: (id: number, data: UpdateConventionDTO) => api.put(`/conventions/${id}`, data),
  delete: (id: number) => api.delete(`/conventions/${id}`),
  // Workflow endpoints
  soumettre: (id: number) => api.post(`/conventions/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/conventions/${id}/valider`, { valideParId }),
  rejeter: (id: number, motif: string) => api.post(`/conventions/${id}/rejeter`, { motif }),
  remettreEnBrouillon: (id: number) => api.post(`/conventions/${id}/remettre-en-brouillon`),
  mettreEnCours: (id: number) => api.post(`/conventions/${id}/mettre-en-cours`),
  annuler: (id: number, motif: string) => api.post(`/conventions/${id}/annuler`, { motif }),

  // Imputations et Versements
  ajouterImputation: (conventionId: number, imputation: Record<string, unknown>) =>
    api.post(`/conventions/${conventionId}/imputations`, imputation),
  supprimerImputation: (conventionId: number, imputationId: number) =>
    api.delete(`/conventions/${conventionId}/imputations/${imputationId}`),
  ajouterVersement: (conventionId: number, versement: Record<string, unknown>) =>
    api.post(`/conventions/${conventionId}/versements`, versement),
  supprimerVersement: (conventionId: number, versementId: number) =>
    api.delete(`/conventions/${conventionId}/versements/${versementId}`),

  // Sous-Conventions (nested CRUD)
  getSousConventions: (parentId: number) => api.get(`/conventions/${parentId}/sous-conventions`),
  createSousConvention: (parentId: number, data: CreateConventionDTO) =>
    api.post(`/conventions/${parentId}/sous-conventions`, data),
  updateSousConvention: (sousConventionId: number, data: UpdateConventionDTO) =>
    api.put(`/conventions/${sousConventionId}`, data),
  deleteSousConvention: (sousConventionId: number) => api.delete(`/conventions/${sousConventionId}`),

  // Workflow pour sous-conventions (identique aux conventions)
  soumettreSousConvention: (id: number) => api.post(`/conventions/${id}/soumettre`),
  validerSousConvention: (id: number, valideParId: number) => api.post(`/conventions/${id}/valider`, { valideParId }),
  rejeterSousConvention: (id: number, motif: string) => api.post(`/conventions/${id}/rejeter`, { motif }),
  remettreEnBrouillonSousConvention: (id: number) => api.post(`/conventions/${id}/remettre-en-brouillon`),
  mettreEnCoursSousConvention: (id: number) => api.post(`/conventions/${id}/mettre-en-cours`),
  annulerSousConvention: (id: number, motif: string) => api.post(`/conventions/${id}/annuler`, { motif }),

  // Gestion de l'historique des modifications
  updateWithHistory: (id: number, data: UpdateConventionWithHistoryRequest) =>
    api.put(`/conventions/${id}/with-history`, data),
  getHistorique: (id: number) => api.get(`/conventions/${id}/historique`),
  getDernieresModifications: (id: number, limit: number) =>
    api.get(`/conventions/${id}/historique/derniers/${limit}`),
  aEteModifiee: (id: number) => api.get(`/conventions/${id}/a-ete-modifiee`),

  // Gestion des partenaires
  getPartenaires: (conventionId: number) => api.get(`/conventions/${conventionId}/partenaires`),
  addPartenaire: (conventionId: number, data: {
    partenaireId: number;
    budgetAlloue: number;
    pourcentage: number;
    estMaitreOeuvre?: boolean;
    estMaitreOeuvreDelegue?: boolean;
    remarques?: string;
  }) => api.post(`/conventions/${conventionId}/partenaires`, data),
  updatePartenaire: (conventionId: number, id: number, data: {
    budgetAlloue: number;
    pourcentage: number;
    estMaitreOeuvre?: boolean;
    estMaitreOeuvreDelegue?: boolean;
    remarques?: string;
  }) => api.put(`/conventions/${conventionId}/partenaires/${id}`, data),
  deletePartenaire: (conventionId: number, id: number) =>
    api.delete(`/conventions/${conventionId}/partenaires/${id}`),

  // Gestion des projets (via ProjetConvention join table)
  getProjets: (conventionId: number) =>
    api.get(`/projet-conventions/convention/${conventionId}`),
  linkProjet: (data: { projetId: number; conventionId: number; ordre?: number }) =>
    api.post('/projet-conventions', data),
  unlinkProjet: (projetId: number, conventionId: number) =>
    api.delete(`/projet-conventions/projet/${projetId}/convention/${conventionId}`),

  // Gestion des marchés (direct link via marche.convention field)
  getMarches: (conventionId: number) => api.get(`/marches/convention/${conventionId}`),
  linkMarche: (conventionId: number, marcheId: number) =>
    api.post(`/conventions/${conventionId}/marches/${marcheId}`),
  unlinkMarche: (conventionId: number, marcheId: number) =>
    api.delete(`/conventions/${conventionId}/marches/${marcheId}`),

  // Micro-endpoints (progressive lazy loading)
  getBasic: (id: number) => api.get(`/conventions/${id}/basic`),
  getFinances: (id: number) => api.get(`/conventions/${id}/finances`),
  getDates: (id: number) => api.get(`/conventions/${id}/dates`),
  getStats: (id: number) => api.get(`/conventions/${id}/stats`),
}

// Projets API
export const projetsAPI = {
  getAll: () => api.get('/projets'),
  getActive: () => api.get('/projets/active'),
  getById: (id: number) => api.get(`/projets/${id}`),
  search: (q: string) => api.get(`/projets/search?q=${q}`),
  create: (data: CreateProjetDTO) => api.post('/projets', data),
  update: (id: number, data: UpdateProjetDTO) => api.put(`/projets/${id}`, data),
  delete: (id: number) => api.delete(`/projets/${id}`),

  // Workflow methods
  demarrer: (id: number) => api.post(`/projets/${id}/demarrer`),
  suspendre: (id: number) => api.post(`/projets/${id}/suspendre`),
  reprendre: (id: number) => api.post(`/projets/${id}/reprendre`),
  terminer: (id: number) => api.post(`/projets/${id}/terminer`),
}

// Fournisseurs API
export const fournisseursAPI = {
  getAll: () => api.get('/fournisseurs'),
  getActive: () => api.get('/fournisseurs/active'),
  getById: (id: number) => api.get(`/fournisseurs/${id}`),
  search: (q: string) => api.get(`/fournisseurs/search?q=${q}`),
  create: (data: CreateFournisseurDTO) => api.post('/fournisseurs', data),
  update: (id: number, data: UpdateFournisseurDTO) => api.put(`/fournisseurs/${id}`, data),
  delete: (id: number) => api.delete(`/fournisseurs/${id}`),
}

// Partenaires API
export const partenairesAPI = {
  getAll: () => api.get('/partenaires'),
  getActive: () => api.get('/partenaires/active'),
  getById: (id: number) => api.get(`/partenaires/${id}`),
}

// Marchés API
export const marchesAPI = {
  getAll: () => api.get('/marches'),
  getList: () => api.get('/marches/list'), // Optimized list for frontend (micro-frontends pattern)
  getStats: () => api.get('/marches/stats'),
  getActive: () => api.get('/marches/active'),
  getById: (id: number) => api.get(`/marches/${id}`),
  search: (q: string) => api.get(`/marches/search?q=${q}`),
  create: (data: Record<string, unknown>) => api.post('/marches', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/marches/${id}`, data),
  delete: (id: number) => api.delete(`/marches/${id}`),
  getByConvention: (conventionId: number) => api.get(`/marches/convention/${conventionId}`),
  getLignes: (marcheId: number) => api.get(`/marches/${marcheId}/lignes`),
  getAvenants: (marcheId: number) => api.get(`/marches/${marcheId}/avenants`),
  getDecomptes: (marcheId: number) => api.get(`/marches/${marcheId}/decomptes`),
}

// Axes Analytiques API
export const axesAnalytiquesAPI = {
  getAll: () => api.get('/axes-analytiques'),
  getActive: () => api.get('/axes-analytiques/active'),
  getById: (id: number) => api.get(`/axes-analytiques/${id}`),
  search: (q: string) => api.get(`/axes-analytiques/search?q=${q}`),
  create: (data: Record<string, unknown>) => api.post('/axes-analytiques', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/axes-analytiques/${id}`, data),
  delete: (id: number) => api.delete(`/axes-analytiques/${id}`),
}

// Comptes Bancaires API
export const comptesBancairesAPI = {
  getAll: () => api.get('/comptes-bancaires'),
  getActive: () => api.get('/comptes-bancaires/active'),
  getById: (id: number) => api.get(`/comptes-bancaires/${id}`),
  search: (q: string) => api.get(`/comptes-bancaires/search?q=${q}`),
  create: (data: Record<string, unknown>) => api.post('/comptes-bancaires', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/comptes-bancaires/${id}`, data),
  delete: (id: number) => api.delete(`/comptes-bancaires/${id}`),
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  changePassword: (id: number, oldPassword: string, newPassword: string) =>
    api.post(`/users/${id}/change-password`, { oldPassword, newPassword }),
}

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get('/budgets'),
  getByConvention: (conventionId: number) => api.get(`/budgets?conventionId=${conventionId}`),
  getById: (id: number) => api.get(`/budgets/${id}`),
  create: (data: Record<string, unknown>) => api.post('/budgets', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
  soumettre: (id: number) => api.post(`/budgets/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/budgets/${id}/valider`, { valideParId }),
}

// Décomptes API
export const decomptesAPI = {
  getAll: () => api.get('/decomptes'),
  getList: () => api.get('/decomptes/list'), // Optimized list for frontend (micro-frontends pattern)
  getByMarche: (marcheId: number) => api.get(`/decomptes?marcheId=${marcheId}`),
  getById: (id: number) => api.get(`/decomptes/${id}`),
  create: (data: CreateDecompteDTO) => api.post('/decomptes', data),
  update: (id: number, data: UpdateDecompteDTO) => api.put(`/decomptes/${id}`, data),
  delete: (id: number) => api.delete(`/decomptes/${id}`),
  soumettre: (id: number) => api.post(`/decomptes/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/decomptes/${id}/valider`, { valideParId }),
  getRetenues: (decompteId: number) => api.get(`/decomptes/${decompteId}/retenues`),
  getImputations: (decompteId: number) => api.get(`/decomptes/${decompteId}/imputations`),
}

// Ordres de Paiement API
export const ordresPaiementAPI = {
  getAll: () => api.get('/ordres-paiement'),
  getByDecompte: (decompteId: number) => api.get(`/ordres-paiement?decompteId=${decompteId}`),
  getById: (id: number) => api.get(`/ordres-paiement/${id}`),
  create: (data: Record<string, unknown>) => api.post('/ordres-paiement', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/ordres-paiement/${id}`, data),
  delete: (id: number) => api.delete(`/ordres-paiement/${id}`),
  valider: (id: number, valideParId: number) => api.post(`/ordres-paiement/${id}/valider`, { valideParId }),
  executer: (id: number) => api.post(`/ordres-paiement/${id}/executer`),
}

// Paiements API
export const paiementsAPI = {
  getAll: () => api.get('/paiements'),
  getByOP: (opId: number) => api.get(`/paiements?opId=${opId}`),
  getById: (id: number) => api.get(`/paiements/${id}`),
  create: (data: Record<string, unknown>) => api.post('/paiements', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/paiements/${id}`, data),
  delete: (id: number) => api.delete(`/paiements/${id}`),
}

// Avenants API
export const avenantsAPI = {
  getAll: () => api.get('/avenants'),
  getByConvention: (conventionId: number) => api.get(`/avenants?conventionId=${conventionId}`),
  getById: (id: number) => api.get(`/avenants/${id}`),
  create: (data: Record<string, unknown>) => api.post('/avenants', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/avenants/${id}`, data),
  delete: (id: number) => api.delete(`/avenants/${id}`),
  soumettre: (id: number) => api.post(`/avenants/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/avenants/${id}/valider`, { valideParId }),
}

// Subventions API
export const subventionsAPI = {
  getAll: () => api.get('/subventions'),
  getByConvention: (conventionId: number) => api.get(`/subventions?conventionId=${conventionId}`),
  getById: (id: number) => api.get(`/subventions/${id}`),
  create: (data: Record<string, unknown>) => api.post('/subventions', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/subventions/${id}`, data),
  delete: (id: number) => api.delete(`/subventions/${id}`),
}

// Dimensions Analytiques API
export const dimensionsAPI = {
  getAll: () => api.get('/dimensions'),
  getActives: () => api.get('/dimensions/actives'),
  getObligatoires: () => api.get('/dimensions/obligatoires'),
  getById: (id: number) => api.get(`/dimensions/${id}`),
  getByCode: (code: string) => api.get(`/dimensions/code/${code}`),
  create: (data: CreateDimensionDTO) => api.post('/dimensions', data),
  update: (id: number, data: Partial<CreateDimensionDTO>) => api.put(`/dimensions/${id}`, data),
  delete: (id: number) => api.delete(`/dimensions/${id}`),
  toggleActive: (id: number) => api.post(`/dimensions/${id}/toggle-active`),
  getStatistiques: () => api.get('/dimensions/statistiques'),

  // Valeurs
  getValeurs: (dimensionId: number) => api.get(`/dimensions/${dimensionId}/valeurs`),
  getValeursActives: (dimensionId: number) => api.get(`/dimensions/${dimensionId}/valeurs/actives`),
  createValeur: (dimensionId: number, data: CreateValeurDimensionDTO) =>
    api.post(`/dimensions/${dimensionId}/valeurs`, data),
  updateValeur: (valeurId: number, data: Partial<CreateValeurDimensionDTO>) =>
    api.put(`/dimensions/valeurs/${valeurId}`, data),
  deleteValeur: (valeurId: number) => api.delete(`/dimensions/valeurs/${valeurId}`),
  toggleValeurActive: (valeurId: number) => api.post(`/dimensions/valeurs/${valeurId}/toggle-active`),
}

// Imputations Analytiques API
export const imputationsAPI = {
  getAll: (params?: { type?: string; referenceId?: number }) =>
    api.get('/imputations', { params }),
  getById: (id: number) => api.get(`/imputations/${id}`),
  create: (data: Record<string, unknown>) => api.post('/imputations', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/imputations/${id}`, data),
  delete: (id: number) => api.delete(`/imputations/${id}`),

  // Validation
  validateTotal: (params: { type: string; referenceId: number; montantAttendu: number }) =>
    api.get('/imputations/validate-total', { params }),
  getTotal: (params: { type: string; referenceId: number }) =>
    api.get('/imputations/total', { params }),

  // Reporting
  aggregateByDimension: (params: { type: string; dimension: string }) =>
    api.get('/imputations/reporting/by-dimension', { params }),
  aggregateByTwoDimensions: (params: { type: string; dimension1: string; dimension2: string }) =>
    api.get('/imputations/reporting/by-two-dimensions', { params }),
  getStatistiques: () => api.get('/imputations/statistiques'),
}

// Avenants Conventions API
export const avenantConventionsAPI = {
  // CRUD
  getAll: () => api.get('/avenants-conventions'),
  getById: (id: number) => api.get(`/avenants-conventions/${id}`),
  getByConvention: (conventionId: number) => api.get(`/avenants-conventions/convention/${conventionId}`),
  create: (data: Record<string, unknown>) => api.post('/avenants-conventions', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/avenants-conventions/${id}`, data),
  delete: (id: number) => api.delete(`/avenants-conventions/${id}`),

  // Workflow
  soumettre: (id: number) => api.post(`/avenants-conventions/${id}/soumettre`),
  valider: (data: { avenantId: number; remarques?: string; dateEffet?: string }) =>
    api.post('/avenants-conventions/valider', data),
  rejeter: (data: { avenantId: number; motifRejet: string }) =>
    api.post('/avenants-conventions/rejeter', data),

  // Statistiques
  getPending: () => api.get('/avenants-conventions/pending'),
  getStatistics: (conventionId: number) => api.get(`/avenants-conventions/convention/${conventionId}/statistics`),
}

// Project-Convention Association API
export const projetConventionsAPI = {
  // CRUD
  getAll: () => api.get('/projet-conventions'),
  getById: (id: number) => api.get(`/projet-conventions/${id}`),

  // Get conventions by project
  getByProjet: (projetId: number) => api.get(`/projet-conventions/projet/${projetId}`),

  // Get projects by convention
  getByConvention: (conventionId: number) => api.get(`/projet-conventions/convention/${conventionId}`),

  // Create association
  create: (data: { projetId: number; conventionId: number; ordre?: number }) =>
    api.post('/projet-conventions', data),

  // Update order
  updateOrdre: (id: number, ordre: number) =>
    api.put(`/projet-conventions/${id}`, { ordre }),

  // Delete association
  delete: (id: number) => api.delete(`/projet-conventions/${id}`),
  deleteByProjetAndConvention: (projetId: number, conventionId: number) =>
    api.delete(`/projet-conventions/projet/${projetId}/convention/${conventionId}`),

  // Reorder conventions for a project
  reorderConventions: (projetId: number, ordres: Record<number, number>) =>
    api.put(`/projet-conventions/projet/${projetId}/reorder`, ordres),
}

// Pièces Jointes API
export const piecesJointesAPI = {
  // Upload un fichier
  upload: (file: File, typeEntite: string, entiteId: number, description?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('typeEntite', typeEntite)
    formData.append('entiteId', entiteId.toString())
    if (description) {
      formData.append('description', description)
    }

    return api.post('/pieces-jointes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Récupère toutes les pièces jointes pour une entité
  getAll: (typeEntite: string, entiteId: number) =>
    api.get('/pieces-jointes', {
      params: { typeEntite, entiteId }
    }),

  // Récupère une pièce jointe par ID
  getById: (id: number) => api.get(`/pieces-jointes/${id}`),

  // Télécharge un fichier
  download: (id: number) =>
    api.get(`/pieces-jointes/${id}/download`, {
      responseType: 'blob',
    }),

  // Met à jour une pièce jointe
  update: (id: number, data: { description?: string }) =>
    api.put(`/pieces-jointes/${id}`, data),

  // Supprime une pièce jointe
  delete: (id: number) => api.delete(`/pieces-jointes/${id}`),
}

// Versements Prévisionnels API
export const versementsPrevisionnelsAPI = {
  getAll: () => api.get('/versements-previsionnels'),
  getByConvention: (conventionId: number) => api.get(`/conventions/${conventionId}/versements-previsionnels`),
  getById: (id: number) => api.get(`/versements-previsionnels/${id}`),
  create: (conventionId: number, data: Record<string, unknown>) =>
    api.post(`/conventions/${conventionId}/versements-previsionnels`, data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/versements-previsionnels/${id}`, data),
  delete: (id: number) => api.delete(`/versements-previsionnels/${id}`),
  getStats: () => api.get('/versements-previsionnels/stats'),
}

// Types de dépenses API (Référentiel)
export const typesDepensesAPI = {
  getAll: () => api.get('/types-depenses'),
  getAllActive: () => api.get('/types-depenses/active'),
  getList: () => api.get('/types-depenses/list'), // Optimized for dropdowns
  getById: (id: number) => api.get(`/types-depenses/${id}`),
  getByCode: (code: string) => api.get(`/types-depenses/code/${code}`),
  create: (data: Record<string, unknown>) => api.post('/types-depenses', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/types-depenses/${id}`, data),
  delete: (id: number) => api.delete(`/types-depenses/${id}`),
}

export default api
