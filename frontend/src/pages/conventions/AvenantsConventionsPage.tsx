import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Button, Skeleton } from '@mui/material'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, Panel, SegmentedControl, StatusBadge, type SegmentOption } from '@/components/core'
import { avenantConventionsAPI, conventionsAPI } from '@/lib/api'
import { colors, componentStyles } from '@/lib/designSystem'
import { formatNumber, formatDate } from '@/lib/utils'
import type { AvenantConventionSummary } from '@/types/avenantConvention'
import type { Convention } from '@/types/entities'

type StatutFilter = 'ALL' | 'BROUILLON' | 'SOUMIS' | 'VALIDE'

const cellHead = { ...componentStyles.table.headerCell, textAlign: 'left' as const, whiteSpace: 'nowrap' as const }

/**
 * Avenants - registre transverse des avenants de conventions.
 * Chaque ligne ouvre la fiche avenant rattachée à sa convention.
 */
const AvenantsConventionsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState<StatutFilter>('ALL')

  const { data: avenants = [], isLoading, isError, refetch } = useQuery<AvenantConventionSummary[]>({
    queryKey: ['avenants-conventions'],
    queryFn: async () => {
      const res = await avenantConventionsAPI.getAll()
      const payload: unknown = res.data?.data ?? res.data
      return Array.isArray(payload) ? (payload as AvenantConventionSummary[]) : []
    },
  })

  // Le résumé d'avenant ne porte que le numéro de convention : libellé via la liste des conventions
  const { data: conventions = [] } = useQuery<Convention[]>({
    queryKey: ['conventions', 'list'],
    queryFn: async () => {
      const res = await conventionsAPI.getAll()
      const payload: unknown = res.data?.data ?? res.data
      return Array.isArray(payload) ? (payload as Convention[]) : []
    },
    staleTime: 1000 * 60 * 5,
  })
  const libelleConvention = useMemo(
    () => new Map(conventions.map(c => [c.id, c.libelle?.replace(/<[^>]+>/g, '') ?? ''])),
    [conventions],
  )

  const counts = useMemo(() => {
    const c: Record<StatutFilter, number> = { ALL: avenants.length, BROUILLON: 0, SOUMIS: 0, VALIDE: 0 }
    avenants.forEach(a => { if (a.statut in c) c[a.statut as StatutFilter] += 1 })
    return c
  }, [avenants])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return avenants
      .filter(a => statut === 'ALL' || a.statut === statut)
      .filter(a => !q || [a.numeroAvenant, a.objet, a.conventionNumero, libelleConvention.get(a.conventionId)]
        .some(v => v?.toLowerCase().includes(q)))
      .sort((a, b) => (b.dateAvenant ?? '').localeCompare(a.dateAvenant ?? ''))
  }, [avenants, search, statut, libelleConvention])

  const options: SegmentOption<StatutFilter>[] = [
    { value: 'ALL', label: 'Tous', count: counts.ALL },
    { value: 'BROUILLON', label: 'Brouillons', count: counts.BROUILLON },
    { value: 'SOUMIS', label: 'Soumis', count: counts.SOUMIS },
    { value: 'VALIDE', label: 'Validés', count: counts.VALIDE },
  ]

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[{ label: 'Avenants' }]}
        subtitle={`${avenants.length} avenant${avenants.length > 1 ? 's' : ''} de conventions`}
        searchPlaceholder="Numéro, objet, convention…"
        searchValue={search}
        onSearchChange={setSearch}
      >
        <SegmentedControl ariaLabel="Filtrer par statut" value={statut} options={options} onChange={setStatut} />
      </ControlPanel>

      <Panel flush>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            {[0, 1, 2, 3].map(i => <Skeleton key={i} height={44} />)}
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3, fontSize: 13, color: colors.textTertiary, display: 'flex', alignItems: 'center', gap: 2 }}>
            Impossible de charger les avenants.
            <Button size="small" variant="outlined" onClick={() => refetch()}>Réessayer</Button>
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 3, fontSize: 13, color: colors.textTertiary }}>
            {avenants.length === 0 ? 'Aucun avenant enregistré.' : 'Aucun avenant ne correspond aux filtres.'}
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
              <Box component="thead" sx={{ bgcolor: colors.surfaceAlt }}>
                <tr>
                  <Box component="th" sx={{ ...cellHead, pl: 3 }}>Avenant</Box>
                  <Box component="th" sx={cellHead}>Convention</Box>
                  <Box component="th" sx={cellHead}>Date</Box>
                  <Box component="th" sx={{ ...cellHead, textAlign: 'right' }}>Écart budget MAD</Box>
                  <Box component="th" sx={{ ...cellHead, pr: 3 }}>Statut</Box>
                </tr>
              </Box>
              <tbody>
                {rows.map(a => (
                  <Box
                    component="tr"
                    key={a.id}
                    tabIndex={0}
                    onClick={() => navigate(`/conventions/${a.conventionId}/avenants/${a.id}`)}
                    onKeyDown={e => { if (e.key === 'Enter') navigate(`/conventions/${a.conventionId}/avenants/${a.id}`) }}
                    sx={{ ...componentStyles.table.row, cursor: 'pointer', '& td': { py: 1.1, px: 1.5, borderBottom: `1px solid ${colors.borderSubtle}`, fontSize: 13.5 } }}
                  >
                    <Box component="td" sx={{ pl: '24px !important' }}>
                      <Box sx={{ fontWeight: 600 }}>{a.numeroAvenant}</Box>
                      <Box sx={{ color: colors.textSecondary, fontSize: 13 }}>{a.objet}</Box>
                    </Box>
                    <Box component="td">
                      <Box sx={{ fontWeight: 600, fontSize: 12.5 }}>{a.conventionNumero}</Box>
                      <Box sx={{ color: colors.textSecondary, fontSize: 12.5 }}>{libelleConvention.get(a.conventionId) ?? ''}</Box>
                    </Box>
                    <Box component="td" sx={{ whiteSpace: 'nowrap', color: colors.textSecondary }}>
                      {a.dateAvenant ? formatDate(a.dateAvenant) : '—'}
                    </Box>
                    <Box component="td" sx={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {a.deltaBudget != null ? `${a.deltaBudget > 0 ? '+' : ''}${formatNumber(a.deltaBudget)}` : '—'}
                    </Box>
                    <Box component="td" sx={{ pr: '24px !important' }}>
                      <StatusBadge status={a.statut} />
                    </Box>
                  </Box>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
      </Panel>
    </AppLayout>
  )
}

export default AvenantsConventionsPage
