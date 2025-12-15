import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
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

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, null, {
            params: { refreshToken }
          })

          localStorage.setItem('accessToken', data.data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
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

export default api
