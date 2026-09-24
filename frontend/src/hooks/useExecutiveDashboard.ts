import { useQuery } from '@tanstack/react-query'
import { reportingAPI, ExecutiveDashboardDTO } from '@/lib/api'
import type { NavCounterKey } from '@/components/layout/navigation'

export const EXECUTIVE_DASHBOARD_QUERY_KEY = ['executive-dashboard'] as const

/**
 * Tableau de bord exécutif partagé (accueil, compteurs du menu, alertes de
 * l'en-tête). Une seule requête en cache pour toute l'ossature.
 */
export function useExecutiveDashboard(enabled = true) {
  return useQuery<ExecutiveDashboardDTO>({
    queryKey: EXECUTIVE_DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const res = await reportingAPI.getExecutiveDashboard()
      return (res.data?.data ?? res.data) as ExecutiveDashboardDTO
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })
}

/** Compteurs du menu : conventions soumises, décomptes validés non soldés. */
export function selectNavCounters(data: ExecutiveDashboardDTO | undefined): Record<NavCounterKey, number> {
  const conv = data?.workflowFunnel?.conventions?.counts ?? {}
  const dec = data?.workflowFunnel?.decomptes?.counts ?? {}
  return {
    conventionsAValider: conv.SOUMIS ?? 0,
    decomptesAPayer: (dec.VALIDE ?? 0) + (dec.PAYE_PARTIEL ?? 0),
  }
}

/** Alertes qui demandent une action (hors messages de succès). */
export function selectActionableAlerts(data: ExecutiveDashboardDTO | undefined) {
  return (data?.alerts ?? []).filter(a => a.count > 0 && a.severity !== 'success')
}

/** Nombre de points d'attention remontés par le tableau de bord. */
export function selectAlertCount(data: ExecutiveDashboardDTO | undefined): number {
  return selectActionableAlerts(data).length
}
