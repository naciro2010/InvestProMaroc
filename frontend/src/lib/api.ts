import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
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
import authService from './authService'

const resolveApiUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL?.trim()

  if (!rawUrl) {
    return 'http://localhost:8080/api'
  }

  const sanitized = rawUrl.replace(/\/+$/, '')

  // Support both VITE_API_URL=http://host:port and VITE_API_URL=http://host:port/api
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`
}

const API_URL = resolveApiUrl()

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================== UTILITY FUNCTIONS ====================

/**
 * Dispatch un événement toast pour afficher une notification.
 */
const dispatchToastEvent = (message: string, type: 'error' | 'success' | 'warning' | 'info') => {
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { message, type }
    })
  )
}

// ==================== INTERCEPTORS ====================

/**
 * Request Interceptor:
 * - Vérifie si le token est expiré AVANT d'envoyer la requête
 * - Ajoute le token Authorization si disponible
 * - Redirige vers login si le token est expiré et pas de refresh token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getAccessToken()
    const refreshToken = authService.getRefreshToken()
    const user = authService.getStoredUser()

    // Si pas de token, laisser passer (sera bloqué par le backend si nécessaire)
    if (!token) {
      console.warn('⚠️ Aucun token disponible. Requête envoyée sans authentification.')
      return config
    }

    // Vérifier si le token est expiré AVANT d'envoyer la requête
    if (authService.isTokenExpired(token)) {
      console.warn('⏰ Token expiré détecté avant la requête.')

      // Si pas de refresh token, déconnecter immédiatement
      if (!refreshToken) {
        console.warn('🔒 Token expiré et pas de refreshToken. Déconnexion...')
        authService.logoutDueToExpiration()
        return Promise.reject(new Error('Token expiré - Reconnexion nécessaire'))
      }

      // Si refresh token existe, laisser passer - le response interceptor gérera le 401
      console.log('🔄 Token expiré mais refreshToken disponible. La requête sera réessayée après refresh.')
    }

    // Ajouter le token au header
    config.headers.Authorization = `Bearer ${token}`

    // Log de debug (niveau debug pour ne pas polluer la console)
    if (import.meta.env.DEV) {
      console.debug(`📤 ${config.method?.toUpperCase()} ${config.url} | User: ${user?.username || 'unknown'}`)
    }

    return config
  },
  (error) => {
    console.error('❌ Erreur dans l\'interceptor request:', error)
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor:
 * - Gère les erreurs 401 (token expiré) avec refresh automatique
 * - Gère les erreurs 403 (accès refusé)
 * - Affiche des toasts pour les erreurs communes
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // ==================== 401 - Token expiré ====================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = authService.getRefreshToken()

      // Si pas de refreshToken, déconnecter immédiatement
      if (!refreshToken) {
        console.warn('🔒 Erreur 401 et aucun refreshToken disponible. Déconnexion...')
        authService.logoutDueToExpiration()
        return Promise.reject(error)
      }

      // Éviter les refresh multiples simultanés
      if (authService.isRefreshingToken()) {
        // Attendre que le refresh en cours se termine
        return new Promise((resolve, reject) => {
          authService.subscribeToTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      try {
        authService.setRefreshingToken(true)
        console.log('🔄 Tentative de refresh du token JWT...')

        // Appel direct à axios pour éviter les interceptors
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_URL}/auth/refresh`,
          null,
          { params: { refreshToken } }
        )

        if (data?.data?.accessToken) {
          const newToken = data.data.accessToken
          authService.updateAccessToken(newToken)
          authService.onTokenRefreshed(newToken)

          console.log('✅ Token rafraîchi avec succès.')

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          console.error('❌ Réponse de refresh invalide:', data)
          authService.logoutDueToExpiration()
          return Promise.reject(new Error('Impossible de rafraîchir le token'))
        }
      } catch (refreshError) {
        const axiosRefreshError = refreshError as AxiosError
        console.error('❌ Échec du refresh token:', {
          status: axiosRefreshError.response?.status,
          message: axiosRefreshError.message,
        })
        authService.logoutDueToExpiration()
        return Promise.reject(refreshError)
      } finally {
        authService.setRefreshingToken(false)
      }
    }

    // ==================== 403 - Accès refusé ====================
    if (error.response?.status === 403) {
      const token = authService.getAccessToken()
      const user = authService.getStoredUser()
      const endpoint = error.config?.url || 'inconnu'
      const method = error.config?.method?.toUpperCase() || 'REQUEST'

      // Vérifier si le token est expiré (peut causer un faux 403)
      if (token && authService.isTokenExpired(token)) {
        console.warn('🔒 Token expiré détecté lors d\'une erreur 403. Déconnexion...')
        authService.logoutDueToExpiration()
        return Promise.reject(error)
      }

      // C'est un vrai problème de permissions
      const roles = user?.roles?.join(', ') || 'Aucun rôle'
      console.error('❌ Erreur 403 - Accès refusé:', {
        endpoint,
        method,
        userRoles: roles,
        user: user?.username,
      })

      dispatchToastEvent(
        `❌ Accès refusé pour ${method} ${endpoint}. Vous êtes "${user?.username}" avec le rôle "${roles}".`,
        'error'
      )
    }

    // ==================== 404 - Non trouvé ====================
    if (error.response?.status === 404) {
      dispatchToastEvent('⚠️ L\'élément demandé n\'a pas été trouvé.', 'warning')
    }

    // ==================== 500+ - Erreur serveur ====================
    if (error.response?.status && error.response.status >= 500) {
      dispatchToastEvent('🔥 Une erreur serveur s\'est produite. Veuillez réessayer plus tard.', 'error')
    }

    return Promise.reject(error)
  }
)

// ==================== API ENDPOINTS ====================

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
  achever: (id: number) => api.post(`/conventions/${id}/achever`),
  annuler: (id: number, motif: string) => api.post(`/conventions/${id}/annuler`, { motif }),
  devalider: (id: number) => api.post(`/conventions/${id}/devalider`),

  // Imputations et Versements
  getImputations: (conventionId: number) => api.get(`/conventions/${conventionId}/imputations`),
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

  // Budget lignes (répartition par catégorie de dépense)
  getBudgetLignes: (conventionId: number) =>
    api.get(`/conventions/${conventionId}/budget-lignes`),
  addBudgetLigne: (conventionId: number, data: {
    categorieDepenseId: number;
    montant: number;
    engagementMontant?: number;
    depensesMontant?: number;
    designation?: string;
    remarques?: string;
  }) => api.post(`/conventions/${conventionId}/budget-lignes`, data),
  updateBudgetLigne: (conventionId: number, id: number, data: {
    categorieDepenseId?: number;
    montant: number;
    engagementMontant?: number;
    depensesMontant?: number;
    designation?: string;
    remarques?: string;
  }) => api.put(`/conventions/${conventionId}/budget-lignes/${id}`, data),
  deleteBudgetLigne: (conventionId: number, id: number) =>
    api.delete(`/conventions/${conventionId}/budget-lignes/${id}`),

  // Budget distribution (lignes + imputations groupées)
  getBudgetDistribution: (conventionId: number) =>
    api.get(`/conventions/${conventionId}/budget-distribution`),

  // Budget ligne imputations (répartition par projet)
  getBudgetLigneImputations: (conventionId: number, ligneId: number) =>
    api.get(`/conventions/${conventionId}/budget-lignes/${ligneId}/imputations`),
  addBudgetLigneImputation: (conventionId: number, ligneId: number, data: {
    projetId: number;
    projetCode: string;
    projetLibelle?: string;
    pourcentage: number;
    typeImputation?: string;
  }) => api.post(`/conventions/${conventionId}/budget-lignes/${ligneId}/imputations`, data),
  updateBudgetLigneImputation: (conventionId: number, ligneId: number, id: number, data: {
    projetId?: number;
    projetCode?: string;
    projetLibelle?: string;
    pourcentage: number;
  }) => api.put(`/conventions/${conventionId}/budget-lignes/${ligneId}/imputations/${id}`, data),
  deleteBudgetLigneImputation: (conventionId: number, ligneId: number, id: number) =>
    api.delete(`/conventions/${conventionId}/budget-lignes/${ligneId}/imputations/${id}`),

  // Micro-endpoints (progressive lazy loading)
  getBasic: (id: number) => api.get(`/conventions/${id}/basic`),
  getFinances: (id: number) => api.get(`/conventions/${id}/finances`),
  getDates: (id: number) => api.get(`/conventions/${id}/dates`),
  getStats: (id: number) => api.get(`/conventions/${id}/stats`),
  getDetailEnriched: (id: number) => api.get(`/conventions/${id}/detail-enriched`),
}

// Projets API
export const projetsAPI = {
  getAll: () => api.get('/projets'),
  getActive: () => api.get('/projets/active'),
  getById: (id: number) => api.get(`/projets/${id}`),
  getByConvention: (conventionId: number) => api.get(`/projets/convention/${conventionId}`),
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
  getAllActive: () => api.get('/partenaires/active'),
  getList: () => api.get('/partenaires/list'),
  getById: (id: number) => api.get(`/partenaires/${id}`),
  create: (data: Record<string, unknown>) => api.post('/partenaires', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/partenaires/${id}`, data),
  delete: (id: number) => api.delete(`/partenaires/${id}`),
}

// Marchés API
export const marchesAPI = {
  getAll: () => api.get('/marches'),
  getList: () => api.get('/marches/list'),
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
  getPaiements: (marcheId: number) => api.get(`/marches/${marcheId}/paiements`),
  getSituationPaiement: (marcheId: number) => api.get(`/marches/${marcheId}/situation-paiement`),
  // Ordres de service
  getOrdresService: (marcheId: number) => api.get(`/marches/${marcheId}/ordres-service`),
  getDureePenalites: (marcheId: number) => api.get(`/marches/${marcheId}/ordres-service/duree-penalites`),
  createOrdreService: (marcheId: number, data: Record<string, unknown>) => api.post(`/marches/${marcheId}/ordres-service`, data),
  updateOrdreService: (marcheId: number, osId: number, data: Record<string, unknown>) => api.put(`/marches/${marcheId}/ordres-service/${osId}`, data),
  deleteOrdreService: (marcheId: number, osId: number) => api.delete(`/marches/${marcheId}/ordres-service/${osId}`),
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
  updateProfile: (data: { prenom: string; nom: string; email: string }) => api.put('/users/profile', data),
  delete: (id: number) => api.delete(`/users/${id}`),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/change-password', { currentPassword, newPassword }),
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
  getList: () => api.get('/decomptes/list'),
  getByMarche: (marcheId: number) => api.get(`/decomptes/marche/${marcheId}`),
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

// Catégories de dépenses API (Référentiel)
export const categoriesDepensesAPI = {
  getAll: () => api.get('/categories-depenses'),
  getAllActive: () => api.get('/categories-depenses/active'),
  getList: () => api.get('/categories-depenses/list'),
  getById: (id: number) => api.get(`/categories-depenses/${id}`),
  getByCode: (code: string) => api.get(`/categories-depenses/code/${code}`),
  create: (data: Record<string, unknown>) => api.post('/categories-depenses', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/categories-depenses/${id}`, data),
  delete: (id: number) => api.delete(`/categories-depenses/${id}`),
}

interface ConventionTypeConfigurationPayload {
  typeCode: string
  libelle: string
  enabled: boolean
  ordreAffichage: number
}

interface ConventionConfigurationPayload {
  codeMaskPattern: string
  codeMaskPlaceholder: string
  numeroMaskPattern: string
  numeroMaskPlaceholder: string
  typeConfigurations: ConventionTypeConfigurationPayload[]
}

export const conventionConfigurationAPI = {
  get: () => api.get('/parametrage/conventions'),
  update: (data: ConventionConfigurationPayload) => api.put('/parametrage/conventions', data),
}

// Cascade API (Odoo-style auto-fill summaries)
export interface ConventionSummaryDTO {
  id: number
  code: string
  numero: string
  libelle: string
  typeConvention: string
  statut: string
  budget: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  dateDebut: string
  dateFin: string | null
  montantEngageHT: number
  montantEngageTTC: number
  montantDecaisseHT: number
  montantDecaisseTTC: number
  montantPaye: number
  budgetRestant: number
  tauxEngagement: number
  tauxDecaissement: number
  nombreMarches: number
  nombreProjets: number
  nombrePartenaires: number
}

export interface MarcheSummaryDTO {
  id: number
  numeroMarche: string
  objet: string
  montantHT: number
  montantTTC: number
  tauxTva: number
  statut: string
  typeMarche: string
  naturePrestation: string
  dateDebut: string | null
  dateFinPrevue: string | null
  delaiExecutionMois: number | null
  fournisseurCode: string
  fournisseurNom: string
  fournisseurIce: string | null
  conventionId: number | null
  conventionNumero: string | null
  conventionLibelle: string | null
  cumulDecomptesHT: number
  cumulDecomptesTTC: number
  montantRestantHT: number
  montantPayeTotal: number
  tauxAvancement: number
  nombreDecomptes: number
  nombreLignes: number
}

export interface FournisseurSummaryDTO {
  id: number
  code: string
  raisonSociale: string
  ice: string | null
  identifiantFiscal: string | null
  adresse: string | null
  ville: string | null
  telephone: string | null
  email: string | null
  nombreMarches: number
  montantTotalMarches: number
}

export const cascadeAPI = {
  getConventionSummary: (id: number) =>
    api.get<ApiResponse<ConventionSummaryDTO>>(`/cascade/conventions/${id}/summary`),
  getMarcheSummary: (id: number) =>
    api.get<ApiResponse<MarcheSummaryDTO>>(`/cascade/marches/${id}/summary`),
  getFournisseurSummary: (id: number) =>
    api.get<ApiResponse<FournisseurSummaryDTO>>(`/cascade/fournisseurs/${id}/summary`),
}

// Reporting API
export const reportingAPI = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardStatsDTO>>('/reporting/dashboard'),
  getCommissionStatsByPeriod: (annee?: number, mois?: number) =>
    api.get<ApiResponse<CommissionStatsDTO[]>>('/reporting/commissions/stats/periode', {
      params: { annee, mois },
    }),
  getCommissionStatsByFournisseur: (fournisseurId?: number) =>
    api.get<ApiResponse<CommissionStatsDTO[]>>('/reporting/commissions/stats/fournisseur', {
      params: { fournisseurId },
    }),
  getCommissionStatsByConvention: (conventionId?: number) =>
    api.get<ApiResponse<CommissionStatsDTO[]>>('/reporting/commissions/stats/convention', {
      params: { conventionId },
    }),
  getDepenseStatsByPeriod: (annee?: number, mois?: number) =>
    api.get<ApiResponse<DepenseStatsDTO[]>>('/reporting/depenses/stats/periode', {
      params: { annee, mois },
    }),
  getDepenseStatsByFournisseur: (fournisseurId?: number) =>
    api.get<ApiResponse<DepenseStatsDTO[]>>('/reporting/depenses/stats/fournisseur', {
      params: { fournisseurId },
    }),
  getPaiementStats: () =>
    api.get<ApiResponse<PaiementStatsDTO>>('/reporting/paiements/stats'),
}

// Reporting DTO types (matching backend ReportingDTOs.kt)
export interface CommissionStatsDTO {
  periode: string | null
  fournisseurId: number | null
  fournisseurNom: string | null
  conventionId: number | null
  conventionLibelle: string | null
  nombreCommissions: number
  totalCommissionHt: number
  totalTvaCommission: number
  totalCommissionTtc: number
}

export interface DepenseStatsDTO {
  periode: string | null
  fournisseurId: number | null
  fournisseurNom: string | null
  compteBancaireId: number | null
  compteBancaireNom: string | null
  nombreDepenses: number
  totalMontantHt: number
  totalMontantTva: number
  totalMontantTtc: number
  totalRetenueTva: number
  totalRetenueIs: number
  totalRetenueNonResident: number
  totalRetenueGarantie: number
}

export interface PaiementStatsDTO {
  nombrePaiements: number
  nombreEnAttente: number
  totalPaye: number
  totalEnAttente: number
  tauxPaiement: number
}

export interface DepenseGlobalStatsDTO {
  total: number
  totalHt: number
  totalTtc: number
  anneeEnCours: number
  moisEnCours: number
}

export interface CommissionGlobalStatsDTO {
  total: number
  totalHt: number
  totalTtc: number
  anneeEnCours: number
  moisEnCours: number
}

export interface TopFournisseurStatsDTO {
  fournisseurId: number
  fournisseurNom: string
  montantTotal: number
  nombreDepenses: number
}

export interface DashboardStatsDTO {
  depenses: DepenseGlobalStatsDTO
  commissions: CommissionGlobalStatsDTO
  paiements: PaiementStatsDTO
  topFournisseurs: TopFournisseurStatsDTO[]
}

export default api
