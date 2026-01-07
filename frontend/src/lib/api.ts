import axios from 'axios'

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

// Fonction pour déconnecter l'utilisateur
const logoutUser = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // Afficher un message de déconnexion
  dispatchToastEvent('🔒 Session expirée. Veuillez vous reconnecter.', 'warning')

  // Rediriger vers la page de connexion après un court délai
  setTimeout(() => {
    window.location.href = '/login'
  }, 500)
}

// Fonction pour vérifier si un token JWT est expiré
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convertir en millisecondes
    const now = Date.now()

    // Considérer le token comme expiré s'il reste moins de 30 secondes
    return expirationTime < (now + 30000)
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error)
    return true // Si on ne peut pas décoder, considérer comme expiré
  }
}

// ==================== INTERCEPTORS ====================

// Request interceptor pour ajouter le token et vérifier son expiration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      // Vérifier si le token est expiré avant d'envoyer la requête
      if (isTokenExpired(token)) {
        console.warn('🔒 Token expiré détecté avant la requête. Déconnexion...')
        logoutUser()
        return Promise.reject(new Error('Token expiré'))
      }

      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
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
        const { data } = await axios.post(`${API_URL}/auth/refresh`, null, {
          params: { refreshToken }
        })

        // Vérifier que la réponse contient bien un nouveau token
        if (data?.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`

          console.log('✅ Token rafraîchi avec succès')
          return api(originalRequest)
        } else {
          console.error('❌ Réponse de refresh invalide')
          logoutUser()
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        console.error('❌ Échec du refresh token:', refreshError)
        logoutUser()
        return Promise.reject(refreshError)
      }
    }

    // Si erreur 403 (Forbidden) - Pas de permission
    if (error.response?.status === 403) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const roles = user?.roles?.join(', ') || 'Aucun rôle'
      const endpoint = error.config?.url || 'inconnu'

      console.error('Erreur 403 - Accès refusé:', {
        endpoint,
        userRoles: roles,
        user: user?.username,
        errorMessage: error.response?.data?.message
      })

      dispatchToastEvent(
        `❌ Accès refusé à ${endpoint}. Vos rôles actuels: ${roles}. ${error.response?.data?.message || 'Permissions insuffisantes.'}`,
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
    api.post('/auth/login', { username, password }),

  register: (data: {
    username: string
    email: string
    password: string
    fullName: string
    roles?: string[]
  }) => api.post('/auth/register', data),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', null, { params: { refreshToken } }),
}

// Conventions API
export const conventionsAPI = {
  getAll: () => api.get('/conventions'),
  getActive: () => api.get('/conventions/active'),
  getById: (id: number) => api.get(`/conventions/${id}`),
  search: (q: string) => api.get(`/conventions/search?q=${q}`),
  create: (data: any) => api.post('/conventions', data),
  update: (id: number, data: any) => api.put(`/conventions/${id}`, data),
  delete: (id: number) => api.delete(`/conventions/${id}`),
  // Workflow endpoints
  soumettre: (id: number) => api.post(`/conventions/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/conventions/${id}/valider`, { valideParId }),
  rejeter: (id: number, motif: string) => api.post(`/conventions/${id}/rejeter`, { motif }),
  mettreEnCours: (id: number) => api.post(`/conventions/${id}/mettre-en-cours`),
  annuler: (id: number, motif: string) => api.post(`/conventions/${id}/annuler`, { motif }),

  // Imputations et Versements
  ajouterImputation: (conventionId: number, imputation: any) =>
    api.post(`/conventions/${conventionId}/imputations`, imputation),
  supprimerImputation: (conventionId: number, imputationId: number) =>
    api.delete(`/conventions/${conventionId}/imputations/${imputationId}`),
  ajouterVersement: (conventionId: number, versement: any) =>
    api.post(`/conventions/${conventionId}/versements`, versement),
  supprimerVersement: (conventionId: number, versementId: number) =>
    api.delete(`/conventions/${conventionId}/versements/${versementId}`),
}

// Projets API
export const projetsAPI = {
  getAll: () => api.get('/projets'),
  getActive: () => api.get('/projets/active'),
  getById: (id: number) => api.get(`/projets/${id}`),
  search: (q: string) => api.get(`/projets/search?q=${q}`),
  create: (data: any) => api.post('/projets', data),
  update: (id: number, data: any) => api.put(`/projets/${id}`, data),
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
  create: (data: any) => api.post('/fournisseurs', data),
  update: (id: number, data: any) => api.put(`/fournisseurs/${id}`, data),
  delete: (id: number) => api.delete(`/fournisseurs/${id}`),
}

// Axes Analytiques API
export const axesAnalytiquesAPI = {
  getAll: () => api.get('/axes-analytiques'),
  getActive: () => api.get('/axes-analytiques/active'),
  getById: (id: number) => api.get(`/axes-analytiques/${id}`),
  search: (q: string) => api.get(`/axes-analytiques/search?q=${q}`),
  create: (data: any) => api.post('/axes-analytiques', data),
  update: (id: number, data: any) => api.put(`/axes-analytiques/${id}`, data),
  delete: (id: number) => api.delete(`/axes-analytiques/${id}`),
}

// Comptes Bancaires API
export const comptesBancairesAPI = {
  getAll: () => api.get('/comptes-bancaires'),
  getActive: () => api.get('/comptes-bancaires/active'),
  getById: (id: number) => api.get(`/comptes-bancaires/${id}`),
  search: (q: string) => api.get(`/comptes-bancaires/search?q=${q}`),
  create: (data: any) => api.post('/comptes-bancaires', data),
  update: (id: number, data: any) => api.put(`/comptes-bancaires/${id}`, data),
  delete: (id: number) => api.delete(`/comptes-bancaires/${id}`),
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  changePassword: (id: number, oldPassword: string, newPassword: string) =>
    api.post(`/users/${id}/change-password`, { oldPassword, newPassword }),
}

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get('/budgets'),
  getByConvention: (conventionId: number) => api.get(`/budgets?conventionId=${conventionId}`),
  getById: (id: number) => api.get(`/budgets/${id}`),
  create: (data: any) => api.post('/budgets', data),
  update: (id: number, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
  soumettre: (id: number) => api.post(`/budgets/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/budgets/${id}/valider`, { valideParId }),
}

// Décomptes API
export const decomptesAPI = {
  getAll: () => api.get('/decomptes'),
  getByMarche: (marcheId: number) => api.get(`/decomptes?marcheId=${marcheId}`),
  getById: (id: number) => api.get(`/decomptes/${id}`),
  create: (data: any) => api.post('/decomptes', data),
  update: (id: number, data: any) => api.put(`/decomptes/${id}`, data),
  delete: (id: number) => api.delete(`/decomptes/${id}`),
  soumettre: (id: number) => api.post(`/decomptes/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/decomptes/${id}/valider`, { valideParId }),
}

// Ordres de Paiement API
export const ordresPaiementAPI = {
  getAll: () => api.get('/ordres-paiement'),
  getByDecompte: (decompteId: number) => api.get(`/ordres-paiement?decompteId=${decompteId}`),
  getById: (id: number) => api.get(`/ordres-paiement/${id}`),
  create: (data: any) => api.post('/ordres-paiement', data),
  update: (id: number, data: any) => api.put(`/ordres-paiement/${id}`, data),
  delete: (id: number) => api.delete(`/ordres-paiement/${id}`),
  valider: (id: number, valideParId: number) => api.post(`/ordres-paiement/${id}/valider`, { valideParId }),
  executer: (id: number) => api.post(`/ordres-paiement/${id}/executer`),
}

// Paiements API
export const paiementsAPI = {
  getAll: () => api.get('/paiements'),
  getByOP: (opId: number) => api.get(`/paiements?opId=${opId}`),
  getById: (id: number) => api.get(`/paiements/${id}`),
  create: (data: any) => api.post('/paiements', data),
  update: (id: number, data: any) => api.put(`/paiements/${id}`, data),
  delete: (id: number) => api.delete(`/paiements/${id}`),
}

// Avenants API
export const avenantsAPI = {
  getAll: () => api.get('/avenants'),
  getByConvention: (conventionId: number) => api.get(`/avenants?conventionId=${conventionId}`),
  getById: (id: number) => api.get(`/avenants/${id}`),
  create: (data: any) => api.post('/avenants', data),
  update: (id: number, data: any) => api.put(`/avenants/${id}`, data),
  delete: (id: number) => api.delete(`/avenants/${id}`),
  soumettre: (id: number) => api.post(`/avenants/${id}/soumettre`),
  valider: (id: number, valideParId: number) => api.post(`/avenants/${id}/valider`, { valideParId }),
}

// Subventions API
export const subventionsAPI = {
  getAll: () => api.get('/subventions'),
  getByConvention: (conventionId: number) => api.get(`/subventions?conventionId=${conventionId}`),
  getById: (id: number) => api.get(`/subventions/${id}`),
  create: (data: any) => api.post('/subventions', data),
  update: (id: number, data: any) => api.put(`/subventions/${id}`, data),
  delete: (id: number) => api.delete(`/subventions/${id}`),
}

// Dimensions Analytiques API
export const dimensionsAPI = {
  getAll: () => api.get('/dimensions'),
  getActives: () => api.get('/dimensions/actives'),
  getObligatoires: () => api.get('/dimensions/obligatoires'),
  getById: (id: number) => api.get(`/dimensions/${id}`),
  getByCode: (code: string) => api.get(`/dimensions/code/${code}`),
  create: (data: any) => api.post('/dimensions', data),
  update: (id: number, data: any) => api.put(`/dimensions/${id}`, data),
  delete: (id: number) => api.delete(`/dimensions/${id}`),
  toggleActive: (id: number) => api.post(`/dimensions/${id}/toggle-active`),
  getStatistiques: () => api.get('/dimensions/statistiques'),

  // Valeurs
  getValeurs: (dimensionId: number) => api.get(`/dimensions/${dimensionId}/valeurs`),
  getValeursActives: (dimensionId: number) => api.get(`/dimensions/${dimensionId}/valeurs/actives`),
  createValeur: (dimensionId: number, data: any) => api.post(`/dimensions/${dimensionId}/valeurs`, data),
  updateValeur: (valeurId: number, data: any) => api.put(`/dimensions/valeurs/${valeurId}`, data),
  deleteValeur: (valeurId: number) => api.delete(`/dimensions/valeurs/${valeurId}`),
  toggleValeurActive: (valeurId: number) => api.post(`/dimensions/valeurs/${valeurId}/toggle-active`),
}

// Imputations Analytiques API
export const imputationsAPI = {
  getAll: (params?: { type?: string; referenceId?: number }) =>
    api.get('/imputations', { params }),
  getById: (id: number) => api.get(`/imputations/${id}`),
  create: (data: any) => api.post('/imputations', data),
  update: (id: number, data: any) => api.put(`/imputations/${id}`, data),
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

export default api
