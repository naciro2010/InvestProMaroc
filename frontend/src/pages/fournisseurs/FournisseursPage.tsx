import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, Skeleton,
  TableSortLabel,
} from '@mui/material'
import { Add, Refresh } from '@mui/icons-material'
import { fournisseursAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, ExportButton, StatusBadge } from '@/components/core'
import { exportToExcel } from '@/lib/exportUtils'
import { SortableTableRow, useSortableTable } from '@/components/core/SortableTable'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { useTableSort } from '@/hooks/useTableSort'
import type { Fournisseur } from '@/types/api'

const styles = componentStyles.listPage
type StatusFilter = 'ALL' | 'ACTIF' | 'INACTIF'

const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'ACTIF', label: 'Actifs' },
  { key: 'INACTIF', label: 'Inactifs' },
]

const monoStyle = { fontSize: typography.sizes.xs, fontFamily: 'monospace', color: colors.neutral[600] }

const FournisseursPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => { fetchFournisseurs() }, [])
  useEffect(() => { setPage(0) }, [searchQuery, statusFilter])

  const fetchFournisseurs = async () => {
    try {
      setLoading(true)
      const response = await fournisseursAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      setFournisseurs(data as Fournisseur[])
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur chargement fournisseurs:', msg)
      showToast('Erreur lors du chargement des fournisseurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    return fournisseurs.filter((f) => {
      if (statusFilter === 'ACTIF' && !f.actif) return false
      if (statusFilter === 'INACTIF' && f.actif) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          f.code?.toLowerCase().includes(q) ||
          f.raisonSociale?.toLowerCase().includes(q) ||
          f.ville?.toLowerCase().includes(q) ||
          f.ice?.toLowerCase().includes(q) ||
          f.email?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [fournisseurs, statusFilter, searchQuery])

  const stats = useMemo(() => ({
    total: fournisseurs.length,
    actif: fournisseurs.filter((f) => f.actif).length,
    inactif: fournisseurs.filter((f) => !f.actif).length,
  }), [fournisseurs])

  const { items, sensors, handleDragEnd } = useSortableTable<Fournisseur>({
    initialItems: filteredData, idKey: 'id', storageKey: 'fournisseurs-order',
  })

  const { sortedItems, sortConfig, requestSort } = useTableSort<Fournisseur>(items, { key: 'code', direction: 'asc' })

  const paginatedData = useMemo(() => {
    return sortedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [sortedItems, page, rowsPerPage])

  const getFilterCount = (key: StatusFilter): number =>
    key === 'ALL' ? stats.total : key === 'ACTIF' ? stats.actif : stats.inactif

  const goToDetail = (id: number) => navigate(`/fournisseurs/${id}`)

  // Export handler
  const handleExport = () => {
    const exportData: Record<string, unknown>[] = filteredData.map(f => ({
      code: f.code,
      raisonSociale: f.raisonSociale,
      ice: f.ice || '-',
      identifiantFiscal: f.identifiantFiscal || '-',
      ville: f.ville || '-',
      telephone: f.telephone || '-',
      email: f.email || '-',
    }))
    exportToExcel({
      filename: 'fournisseurs',
      sheetName: 'Fournisseurs',
      columns: [
        { header: 'Code', key: 'code', width: 15 },
        { header: 'Raison Sociale', key: 'raisonSociale', width: 30 },
        { header: 'ICE', key: 'ice', width: 20 },
        { header: 'IF', key: 'identifiantFiscal', width: 18 },
        { header: 'Ville', key: 'ville', width: 18 },
        { header: 'Téléphone', key: 'telephone', width: 18 },
        { header: 'Email', key: 'email', width: 25 },
      ],
      data: exportData,
    })
  }

  return (
    <AppLayout>
      <Box sx={styles.container}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Fournisseurs' },
          ]}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Rechercher par code, raison sociale, ville, ICE..."
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ExportButton onClick={handleExport} />
              <Button variant="outlined" size="small" startIcon={<Refresh />}
                onClick={fetchFournisseurs} sx={{ textTransform: 'none' }}>
                Actualiser
              </Button>
              <Button variant="contained" size="small" startIcon={<Add />}
                onClick={() => navigate('/fournisseurs/nouveau')} sx={{ textTransform: 'none' }}>
                Nouveau Fournisseur
              </Button>
            </Box>
          }
        >
          {FILTER_OPTIONS.map(({ key, label }) => {
            const isActive = statusFilter === key
            return (
              <Chip key={key} onClick={() => setStatusFilter(key)}
                sx={isActive ? styles.filterPillActive : styles.filterPill}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span>{label}</span>
                    <Box sx={isActive ? styles.countBadge : styles.countBadgeInactive}>
                      {getFilterCount(key)}
                    </Box>
                  </Box>
                }
              />
            )
          })}
        </ControlPanel>

        {/* Table */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          <TableContainer sx={styles.tableContainer}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={paginatedData.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={styles.tableHeader}>
                      <TableCell sx={{ width: 40 }} />
                      <TableCell sortDirection={sortConfig?.key === 'code' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig?.key === 'code'} direction={sortConfig?.key === 'code' ? sortConfig.direction : 'asc'} onClick={() => requestSort('code')}>Code</TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={sortConfig?.key === 'raisonSociale' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig?.key === 'raisonSociale'} direction={sortConfig?.key === 'raisonSociale' ? sortConfig.direction : 'asc'} onClick={() => requestSort('raisonSociale')}>Raison Sociale</TableSortLabel>
                      </TableCell>
                      <TableCell>ICE</TableCell>
                      <TableCell>IF</TableCell>
                      <TableCell sortDirection={sortConfig?.key === 'ville' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig?.key === 'ville'} direction={sortConfig?.key === 'ville' ? sortConfig.direction : 'asc'} onClick={() => requestSort('ville')}>Ville</TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={sortConfig?.key === 'telephone' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig?.key === 'telephone'} direction={sortConfig?.key === 'telephone' ? sortConfig.direction : 'asc'} onClick={() => requestSort('telephone')}>Telephone</TableSortLabel>
                      </TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell sx={{ width: 40 }}><Skeleton width={20} /></TableCell>
                          {Array.from({ length: 8 }).map((__, j) => (
                            <TableCell key={`skel-${i}-${j}`}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Box sx={styles.emptyState}>
                            <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                              {searchQuery || statusFilter !== 'ALL'
                                ? 'Aucun fournisseur ne correspond aux criteres de recherche.'
                                : 'Aucun fournisseur enregistre.'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((f) => (
                        <SortableTableRow key={f.id} id={f.id} sx={{
                          ...styles.tableRowClickable,
                          '& td': { fontSize: typography.sizes.sm, color: colors.textPrimary },
                        }}>
                          <TableCell onClick={() => goToDetail(f.id)}
                            sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                            {f.code}
                          </TableCell>
                          <TableCell onClick={() => goToDetail(f.id)}>{f.raisonSociale}</TableCell>
                          <TableCell onClick={() => goToDetail(f.id)}>
                            <Typography sx={monoStyle}>{f.ice || '-'}</Typography>
                          </TableCell>
                          <TableCell onClick={() => goToDetail(f.id)}>
                            <Typography sx={monoStyle}>{f.identifiantFiscal || '-'}</Typography>
                          </TableCell>
                          <TableCell onClick={() => goToDetail(f.id)}>{f.ville || '-'}</TableCell>
                          <TableCell onClick={() => goToDetail(f.id)}>{f.telephone || '-'}</TableCell>
                          <TableCell onClick={() => goToDetail(f.id)}>{f.email || '-'}</TableCell>
                          <TableCell align="center" onClick={() => goToDetail(f.id)}>
                            <StatusBadge status={f.actif ? 'ACTIF' : 'INACTIF'} />
                          </TableCell>
                        </SortableTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </TableContainer>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default FournisseursPage
