import { useEffect, useRef, useCallback, useState } from 'react'
import { sseAPI } from '@/lib/api'
import authService from '@/lib/authService'
import type { ChatterActivity } from './ActivityItem'

interface EntityModificationSSE {
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

function mapSSEToActivity(mod: EntityModificationSSE): ChatterActivity {
  let type: ChatterActivity['type'] = 'modification'
  if (mod.typeModification === 'CREATION') type = 'creation'
  else if (mod.typeModification === 'STATUS_CHANGE' || mod.typeModification === 'WORKFLOW') type = 'workflow'

  return {
    id: mod.id,
    type,
    date: mod.dateModification || mod.createdAt,
    user: mod.modifieParNom || 'Systeme',
    userInitials: (mod.modifieParNom || 'S').substring(0, 2).toUpperCase(),
    title: mod.description || mod.typeModification,
    details: undefined,
    fieldsChanged: mod.champsModifies.length > 0 ? mod.champsModifies : undefined,
  }
}

interface UseEntitySSEOptions {
  entityType: string
  entityId: number
  enabled?: boolean
}

interface UseEntitySSEResult {
  /** Nouvelles activites recues en temps reel */
  realtimeActivities: ChatterActivity[]
  /** Le SSE est-il connecte */
  connected: boolean
  /** Nombre d'events recus */
  eventCount: number
}

/**
 * Hook pour recevoir les modifications d'une entite en temps reel via SSE.
 *
 * Utilise EventSource avec le token JWT passe en query param
 * (SSE ne supporte pas les headers custom).
 *
 * @example
 * const { realtimeActivities, connected } = useEntitySSE({
 *   entityType: 'MARCHE',
 *   entityId: 42,
 * })
 */
export function useEntitySSE({
  entityType,
  entityId,
  enabled = true,
}: UseEntitySSEOptions): UseEntitySSEResult {
  const [realtimeActivities, setRealtimeActivities] = useState<ChatterActivity[]>([])
  const [connected, setConnected] = useState(false)
  const [eventCount, setEventCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setConnected(false)
  }, [])

  useEffect(() => {
    if (!enabled || !entityId) {
      cleanup()
      return
    }

    // Construire l'URL SSE avec le token JWT en query param
    const token = authService.getAccessToken()
    if (!token) {
      return
    }

    const baseUrl = sseAPI.getEntityStreamUrl(entityType, entityId)
    const url = `${baseUrl}?token=${encodeURIComponent(token)}`

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.addEventListener('heartbeat', () => {
      setConnected(true)
    })

    eventSource.addEventListener('entity-modification', (event: MessageEvent) => {
      try {
        const data: EntityModificationSSE = JSON.parse(event.data)
        const activity = mapSSEToActivity(data)
        setRealtimeActivities(prev => [activity, ...prev])
        setEventCount(prev => prev + 1)
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.onerror = () => {
      setConnected(false)
      // EventSource auto-reconnecte, pas besoin de retry manuel
    }

    eventSource.onopen = () => {
      setConnected(true)
    }

    return cleanup
  }, [entityType, entityId, enabled, cleanup])

  return { realtimeActivities, connected, eventCount }
}
