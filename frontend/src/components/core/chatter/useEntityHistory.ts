import { useState, useEffect, useCallback, useMemo } from 'react'
import { historiqueAPI } from '@/lib/api'
import type { ChatterActivity } from './ActivityItem'
import { useEntitySSE } from './useEntitySSE'

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
  /** SSE connecte (temps reel actif) */
  connected: boolean
  /** Nombre d'events recus en temps reel */
  realtimeCount: number
}

/**
 * Hook reutilisable pour charger l'historique des modifications d'une entite.
 * Combine le chargement initial via REST + les mises a jour temps reel via SSE.
 *
 * @param entityType - Type d'entite (MARCHE, PROJET, DECOMPTE, BUDGET, etc.)
 * @param entityId - ID de l'entite
 * @param entityCreatedAt - Date de creation de l'entite (pour ajouter un evenement "Creation")
 * @param enableSSE - Activer le streaming SSE temps reel (defaut: true)
 */
export function useEntityHistory(
  entityType: string,
  entityId: number,
  entityCreatedAt?: string,
  enableSSE: boolean = true
): UseEntityHistoryResult {
  const [fetchedActivities, setFetchedActivities] = useState<ChatterActivity[]>([])
  const [loading, setLoading] = useState(false)

  // SSE pour les mises a jour temps reel
  const { realtimeActivities, connected, eventCount } = useEntitySSE({
    entityType,
    entityId,
    enabled: enableSSE,
  })

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

      setFetchedActivities(mapped)
    } catch {
      // If endpoint not available, show creation event only
      if (entityCreatedAt) {
        setFetchedActivities([{
          id: -1,
          type: 'creation',
          date: entityCreatedAt,
          user: 'Systeme',
          userInitials: 'SY',
          title: 'Creation',
          details: undefined,
        }])
      } else {
        setFetchedActivities([])
      }
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, entityCreatedAt])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Fusionner les activites chargees + les activites temps reel SSE
  // en evitant les doublons (meme id)
  const activities = useMemo(() => {
    const existingIds = new Set(fetchedActivities.map(a => a.id))
    const newFromSSE = realtimeActivities.filter(a => !existingIds.has(a.id))
    return [...newFromSSE, ...fetchedActivities]
  }, [fetchedActivities, realtimeActivities])

  return {
    activities,
    loading,
    refresh: loadHistory,
    connected,
    realtimeCount: eventCount,
  }
}
