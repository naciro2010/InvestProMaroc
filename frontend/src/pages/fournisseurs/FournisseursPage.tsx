import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, InputAdornment, Chip, Skeleton,
} from '@mui/material'
import { Add, Search, Refresh } from '@mui/icons-material'
import { fournisseursAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import AppLayout from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/core'
import StatusBadge from '@/components/core/StatusBadge'
import { SortableTableRow, useSortableTable } from '@/components/core/SortableTable'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { colors, typography, componentStyles } from '@/lib/designSystem'
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

  const paginatedData = useMemo(() => {
    return items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [items, page, rowsPerPage])

  const getFilterCount = (key: StatusFilter): number =>
    key === 'ALL' ? stats.total : key === 'ACTIF' ? stats.actif : stats.inactif

  const goToDetail = (id: number) => navigate(`/fournisseurs/${id}`)

  return (
    <AppLayout>
      <Box sx={styles.container}>
        {/* Header */}
        <Box sx={styles.header}>
          <PageHeader
            title="Fournisseurs"
            breadcrumbs={[
              { label: 'Accueil', path: '/dashboard' },
              { label: 'Fournisseurs' },
            ]}
            actions={
              <Box sx={{ display: 'flex', gap: 1 }}>
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
          />
          <Typography sx={styles.subtitle}>
            {stats.total} fournisseur{stats.total !== 1 ? 's' : ''} au total
          </Typography>
        </Box>

        {/* Toolbar */}
        <Box sx={styles.toolbar}>
          <TextField
            placeholder="Rechercher par code, raison sociale, ville, ICE..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: colors.neutral[400], fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
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
        </Box>

        {/* Table */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          <TableContainer sx={styles.tableContainer}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={paginatedData.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={styles.tableHeader}>
                      <TableCell sx={{ width: 40 }} />
                      <TableCell>Code</TableCell>
                      <TableCell>Raison Sociale</TableCell>
                      <TableCell>ICE</TableCell>
                      <TableCell>IF</TableCell>
                      <TableCell>Ville</TableCell>
                      <TableCell>Telephone</TableCell>
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
