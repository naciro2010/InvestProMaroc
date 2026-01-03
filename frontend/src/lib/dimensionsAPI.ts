import api from './api'

export interface DimensionAnalytique {
  id: number
  code: string
  nom: string
  description?: string
  ordre: number
  active: boolean
  obligatoire: boolean
  valeurs?: ValeurDimension[]
}

export interface ValeurDimension {
  id: number
  code: string
  libelle: string
  description?: string
  active: boolean
  ordre: number
}

export const dimensionsAPI = {
  // Récupérer toutes les dimensions actives
  getActives: () => api.get<DimensionAnalytique[]>('/dimensions/actives'),

  // Récupérer les valeurs actives d'une dimension
  getValeursActives: (dimensionId: number) =>
    api.get<ValeurDimension[]>(`/dimensions/${dimensionId}/valeurs/actives`),

  // Récupérer toutes les dimensions
  getAll: () => api.get<DimensionAnalytique[]>('/dimensions'),

  // Récupérer une dimension par ID
  getById: (id: number) => api.get<DimensionAnalytique>(`/dimensions/${id}`),
}
