import { useState, useEffect, useCallback } from 'react'
import { historiqueAPI } from '@/lib/api'
import type { ChatterActivity } from './ActivityItem'

interface EntityModificationResponse {
  id: number
  entityType: string
  entityId: number
  modifieParId: number
  modifieParNom: string
  dateModification: string
  typeModification: string
  description: string
  donneesAvant: Record<string, string> | null
  donneesApres: Record<string, string> | null
  champsModifies: string[]
  createdAt: string
}

function mapTypeToActivityType(typeModification: string): ChatterActivity['type'] {
  switch (typeModification) {
    case 'CREATION':
      return 'creation'
    case 'STATUS_CHANGE':
    case 'WORKFLOW':
      return 'workflow'
    default:
      return 'modification'
  }
}

interface UseEntityHistoryResult {
  activities: ChatterActivity[]
  loading: boolean
  refresh: () => void
}

/**
 * Hook reutilisable pour charger l'historique des modifications d'une entite.
 * Utilise l'endpoint generique /api/historique/{entityType}/{entityId}.
 *
 * @param entityType - Type d'entite (MARCHE, PROJET, DECOMPTE, BUDGET, etc.)
 * @param entityId - ID de l'entite
 * @param entityCreatedAt - Date de creation de l'entite (pour ajouter un evenement "Creation")
 */
export function useEntityHistory(
  entityType: string,
  entityId: number,
  entityCreatedAt?: string
): UseEntityHistoryResult {
  const [activities, setActivities] = useState<ChatterActivity[]>([])
  const [loading, setLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    if (!entityId) return
    setLoading(true)
    try {
      const res = await historiqueAPI.getByEntity(entityType, entityId)
      const modifications: EntityModificationResponse[] = res.data?.data || res.data || []

      const mapped: ChatterActivity[] = Array.isArray(modifications)
        ? modifications.map((mod) => ({
            id: mod.id,
            type: mapTypeToActivityType(mod.typeModification),
            date: mod.dateModification || mod.createdAt,
            user: mod.modifieParNom || 'Systeme',
            userInitials: (mod.modifieParNom || 'S').substring(0, 2).toUpperCase(),
            title: mod.description || mod.typeModification,
            details: undefined,
            fieldsChanged: mod.champsModifies.length > 0 ? mod.champsModifies : undefined,
          }))
        : []

      // Add creation event if not already present and createdAt is available
      if (entityCreatedAt && !mapped.some(a => a.type === 'creation')) {
        mapped.push({
          id: -1,
          type: 'creation',
          date: entityCreatedAt,
          user: 'Systeme',
          userInitials: 'SY',
          title: 'Creation',
          details: undefined,
        })
      }

      setActivities(mapped)
    } catch {
      // If endpoint not available, show creation event only
      if (entityCreatedAt) {
        setActivities([{
          id: -1,
          type: 'creation',
          date: entityCreatedAt,
          user: 'Systeme',
          userInitials: 'SY',
          title: 'Creation',
          details: undefined,
        }])
      } else {
        setActivities([])
      }
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, entityCreatedAt])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return { activities, loading, refresh: loadHistory }
}
